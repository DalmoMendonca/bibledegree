import json,re
from pathlib import Path
from bs4 import BeautifulSoup
p=Path('public/data');cs=json.loads((p/'catalog.json').read_text());c=next(c for c in cs if c['id']=='c58')
s=BeautifulSoup(Path('.cache/fowler-source.html').read_text(),'html.parser');links={}
for a in s.find_all('a',href=True):
 m=re.search(r'fowler_otb_en_lect0*(\d+)-2/?$',a['href'],re.I)
 if m and 'pdf' in a.get_text().lower():links[int(m[1])]=a['href']
full=[];extras=[]
for l in c['lessons']:
 if re.search(r'\bshorts?\b|video overvi|overview video',l['title'],re.I):extras.append(l)
 else:full.append(l)
for e in extras:
 m=re.search(r'(?:Session|Lecture|Ses)\s*(\d+)',e['title'],re.I)
 if m:
  target=next((l for l in full if re.search(r'(?:Session|Lecture)\s*'+m[1]+r'\b',l['title'],re.I)),None)
  if target:target.setdefault('supplements',[]).append({'title':e['title'],'url':e['url'],'legacyId':e['id']})
c['lessons']=full;c['supplementalVideos']=extras
for l in full:
 m=re.search(r'(?:Session|Lecture)\s*(\d+)',l['title'],re.I);u=links.get(int(m[1])) if m else None
 if u:(p/'lectures'/f"{l['id']}.json").write_text(json.dumps({'sourceUrl':u,'transcriptUrl':u,'attribution':'Donald Fowler / Biblical eLearning. Publisher English transcript; automated transcription may contain errors.','readings':[{'title':'Full lecture transcript','url':u,'kind':'Publisher transcript','access':'Free full text'}]},indent=2)+'\n')
print('Fowler',len(full),'lectures',len(extras),'previews',len(links),'transcripts')
(p/'catalog.json').write_text(json.dumps(cs,ensure_ascii=False,indent=2)+'\n')
