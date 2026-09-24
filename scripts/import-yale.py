import requests,json,pathlib,concurrent.futures,re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
P=pathlib.Path('public/data/catalog.json');cat=json.loads(P.read_text());out=pathlib.Path('public/data/lectures');out.mkdir(exist_ok=True)
def task(t):
 cid,course,n=t;url=f'https://oyc.yale.edu/{course}/lecture-{n}';f=pathlib.Path('.cache')/(cid+'-'+str(n)+'.html')
 try:
  if f.exists():html=f.read_text()
  else:html=requests.get(url,timeout=35).text;f.write_text(html)
  s=BeautifulSoup(html,'html.parser');title=s.select_one('.session-full__title');tr=s.select_one('#inline_content');overview=s.select_one('.session-full__body');assignment=s.select_one('.field--name-field-session-assignment');iframe=s.select_one('iframe')
  if not title:return None
  readings=[]
  if assignment:readings.append({'title':assignment.get_text(' ',strip=True),'url':url,'kind':'Assigned reading','access':'See syllabus; some books require borrowing or purchase'})
  for a in s.select('#block-yale-oyc-views-block-session-resource-files-block-1 a[href]'):readings.append({'title':a.get_text(' ',strip=True),'url':urljoin(url,a['href']),'kind':'Course resource','access':'Free download'})
  lesson={'id':cid+'-l'+str(n),'title':re.sub(r'^Lecture\s+\d+\s*-\s*','',title.get_text(' ',strip=True)),'url':url,'videoId':iframe['src'].split('/embed/')[-1].split('?')[0] if iframe else None,'source':'Open Yale Courses','readings':readings,'hasTranscript':bool(tr),'duration':'','overview':overview.get_text(' ',strip=True).removeprefix('Overview ') if overview else ''}
  body={'transcript':tr.get_text('\n',strip=True) if tr else '', 'attribution':'Open Yale Courses · Yale University · CC BY-NC-SA 3.0. Third-party materials may have separate rights.','sourceUrl':url,'readings':readings,'overview':lesson['overview']}
  (out/(lesson['id']+'.json')).write_text(json.dumps(body,ensure_ascii=False));return (cid,n,lesson)
 except Exception as e:print(cid,n,str(e),flush=True)
tasks=[(cid,course,n) for cid,course,count in [('c4','religious-studies/rlst-152',26),('c9','religious-studies/rlst-145',24),('c61','history/hist-210',22)] for n in range(1,count+1)]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:results=list(ex.map(task,tasks))
for c in cat:
 if c['id'] in ['c4','c9','c61']:
  c['lessons']=[x[2] for x in sorted([r for r in results if r and r[0]==c['id']],key=lambda x:x[1])];print(c['id'],len(c['lessons']))
P.write_text(json.dumps(cat,ensure_ascii=False,indent=2))
