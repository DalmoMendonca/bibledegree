"""Follow publisher navigation and match embedded video IDs, never titles alone."""
import json,re,hashlib,sys
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
root=Path('public/data');cache=Path('.cache/craig');cache.mkdir(exist_ok=True)
course=next(c for c in json.loads((root/'catalog.json').read_text()) if c['id']=='c64');byvideo={l['videoId']:l for l in course['lessons']}
u='https://www.reasonablefaith.org/podcasts/defenders-podcast-series-3/s3-doctrine-of-christ/doctrine-of-christ-part-1/'
u=sys.argv[1] if len(sys.argv)>1 else u
seen=set();results=json.loads((cache/'status.json').read_text()) if (cache/'status.json').exists() else []
while u and u not in seen and len(seen)<60:
 seen.add(u)
 try:
  r=requests.get(u,timeout=30);r.raise_for_status();s=BeautifulSoup(r.text,'html.parser')
  if any(t in r.text.lower() for t in ['verify you are human','just a moment...']):raise RuntimeError('Publisher verification challenge; stopping')
  match=None
  for el in s.find_all('iframe',src=True):
   m=re.search(r'youtube(?:-nocookie)?\.com/embed/([\w-]+)',el['src'])
   if m and m[1] in byvideo:match=byvideo[m[1]];break
  block=s.select_one('.tooltip-details-block')
  if match and block and len(block.get_text())>1000:
   text=block.get_text('\n',strip=True);id=match['id'];(cache/(id+'.txt')).write_text(text)
   meta={'transcriptUrl':u,'sourceUrl':u,'attribution':'William Lane Craig / Reasonable Faith. Copyright retained by the publisher; full transcript linked at source.','readings':[],'transcriptMatch':'Publisher page embeds the exact catalog video ID.','transcriptSourceHash':hashlib.sha256(text.encode()).hexdigest(),'transcriptCheckedAt':'2026-09-27'}
   (root/'lectures'/(id+'.json')).write_text(json.dumps(meta,indent=2)+'\n');results.append({'id':id,'status':'acquired','chars':len(text),'url':u});print(json.dumps(results[-1]),flush=True)
  else:print(json.dumps({'url':u,'status':'unmatched'}),flush=True)
  link=s.find('a',string=lambda t:t and 'Next Podcast' in t)
  u=urljoin(u,link['href']) if link else None
  if u and '/s3-doctrine-of-christ/' not in u:break
 except Exception as e:print(json.dumps({'url':u,'error':str(e)}),flush=True);break
(cache/'status.json').write_text(json.dumps(results,indent=2))
