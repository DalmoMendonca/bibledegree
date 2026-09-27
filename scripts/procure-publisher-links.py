"""Match English publisher transcripts to full lectures, preserve previews as extras."""
import json,re
from pathlib import Path
from bs4 import BeautifulSoup
root=Path('public/data');cs=json.loads((root/'catalog.json').read_text());changes=[]
configs=[('c18','romans','keener_romans'),('c19','matthew','keener_matthew'),('c20','corinthians','meadors_1cor'),('c27','psalms','waltke_psalms'),('c28','job','walton_job')]
for cid,name,prefix in configs:
 s=BeautifulSoup(Path('.cache/'+name+'-source.html').read_text(),'html.parser');links={}
 for a in s.find_all('a',href=True):
  h=a['href'];m=re.search(re.escape(prefix)+r'[_-]?_?en[_-]_?lecture0*(\d+)',h,re.I)
  if m and ('pdf' in a.get_text().lower() or h.lower().endswith('.pdf')):links[int(m[1])]=h
 c=next(c for c in cs if c['id']==cid);full=[];extras=[]
 for l in c['lessons']:
  m=re.search(r'(?:Lecture|Session)\s*(\d+)',l['title'],re.I)
  if re.search(r'\bshorts?\b|\bvideo overview\b',l['title'],re.I):extras.append(l);continue
  full.append(l)
  if not m or int(m[1]) not in links:continue
  u=links[int(m[1])];data={'sourceUrl':u,'transcriptUrl':u,'attribution':c['professor']+' / Biblical eLearning. Publisher-provided English transcript; machine transcription may contain errors.','readings':[{'title':'Full lecture transcript','url':u,'kind':'Publisher transcript','access':'Free full text'}]}
  (root/'lectures'/f"{l['id']}.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');changes.append(l['id'])
 for e in extras:
  m=re.search(r'(?:Lecture|Session)\s*(\d+)',e['title'],re.I)
  if m:
   target=next((l for l in full if re.search(r'(?:Lecture|Session)\s*'+m[1]+r'\b',l['title'],re.I)),None)
   if target:target.setdefault('supplements',[]).append({'title':e['title'],'url':e['url'],'legacyId':e['id']})
 c['lessons']=full
 c.setdefault('supplementalVideos',[]).extend(extras)
 print(cid,'full lectures',len(full),'previews',len(extras),'transcript matches',len([l for l in full if (root/'lectures'/f"{l['id']}.json").exists()]))
(root/'catalog.json').write_text(json.dumps(cs,ensure_ascii=False,indent=2)+'\n')
print('New transcript links',len(changes))
