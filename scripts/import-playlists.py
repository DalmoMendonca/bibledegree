import json,re,requests,concurrent.futures,pathlib,time
from urllib.parse import urlparse,parse_qs
P=pathlib.Path('public/data/catalog.json');catalog=json.loads(P.read_text());cache=pathlib.Path('.cache');cache.mkdir(exist_ok=True)
def walk(x):
 if isinstance(x,dict):
  if 'playlistVideoRenderer' in x:yield x['playlistVideoRenderer']
  if 'lockupViewModel' in x:
   v=x['lockupViewModel'];vid=v.get('contentId','');title=v.get('metadata',{}).get('lockupMetadataViewModel',{}).get('title',{}).get('content','');dur=re.search(r'"text": "([0-9:]+)"',json.dumps(v))
   if len(vid)==11:yield {'videoId':vid,'title':{'runs':[{'text':title}]},'lengthText':{'simpleText':dur.group(1) if dur else ''}}
  for v in x.values():yield from walk(v)
 elif isinstance(x,list):
  for v in x:yield from walk(v)
def fetch(c):
 pid=parse_qs(urlparse(c['url']).query).get('list',[''])[0]
 if not pid:return c
 try:
  f=cache/(pid+'.html')
  if f.exists():s=f.read_text()
  else:
   r=requests.get('https://www.youtube.com/playlist?list='+pid,timeout=40);r.raise_for_status();s=r.text;f.write_text(s)
  m=re.search(r'var ytInitialData = (.*?);</script>',s)
  if not m:raise ValueError('No playlist data')
  data=json.loads(m.group(1));seen=set();ls=[]
  for v in walk(data):
   vid=v.get('videoId');title=''.join(z.get('text','') for z in v.get('title',{}).get('runs',[]))
   if not vid or vid in seen or title in ['[Deleted video]','[Private video]']:continue
   seen.add(vid);ls.append(dict(id=c['id']+'-l'+str(len(ls)+1),title=title,videoId=vid,duration=v.get('lengthText',{}).get('simpleText',''),url='https://www.youtube.com/watch?v='+vid,source='YouTube playlist',readings=[]))
  c['lessons']=ls;c['playlistId']=pid;c['indexedAt']='2026-09-24';print(c['id'],len(ls),c['title'],flush=True)
 except Exception as e:c['sourceIssue']=str(e);print(c['id'],str(e),flush=True)
 return c
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:out=list(ex.map(fetch,catalog))
P.write_text(json.dumps(out,ensure_ascii=False,indent=2))
