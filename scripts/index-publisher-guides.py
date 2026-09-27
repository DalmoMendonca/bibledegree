import json,re
from pathlib import Path
from bs4 import BeautifulSoup,NavigableString,Tag
root=Path('public/data');cs=json.loads((root/'catalog.json').read_text())
configs=[('c18','romans','keener_romans'),('c19','matthew','keener_matthew'),('c20','corinthians','meadors_1cor'),('c27','psalms','waltke_psalms'),('c28','job','walton_job'),('c58','fowler','fowler_otb')]
for cid,name,prefix in configs:
 s=BeautifulSoup(Path('.cache/'+name+'-source.html').read_text(),'html.parser');guides={};outlines={}
 for p in s.find_all('p'):
  if 'AI Study Guide' not in p.get_text():continue
  started=False
  for e in p.descendants:
   if isinstance(e,NavigableString) and 'AI Study Guide' in str(e):started=True
   if started and isinstance(e,Tag) and e.name=='a' and 'href' in e.attrs and re.search(r'Acrobat|pdf',e.get_text(),re.I):
    u=e['href'];m=re.search(re.escape(prefix)+r'[_-](?:session|lecture)_?0*(\d+)',u,re.I)
    if m:guides[int(m[1])]=u
    break
  for a in p.find_all('a',href=True):
   u=a['href'];m=re.search(re.escape(prefix)+r'[_-](?:session|lecture)_?0*(\d+)',u,re.I)
   if m and u.lower().endswith('.pdf') and re.search('abst|outline',u,re.I):outlines[int(m[1])]=u
 c=next(c for c in cs if c['id']==cid);count=0
 for l in c['lessons']:
  f=root/'lectures'/f"{l['id']}.json"
  if not f.exists():continue
  n=int(re.search(r'(?:Session|Lecture)\s*(\d+)',l['title'],re.I)[1]);v=json.loads(f.read_text())
  if n in guides:
   v['studyGuideUrl']=guides[n];v['readings']=[r for r in v.get('readings',[]) if r.get('kind')!='Publisher study guide']+[{'title':'Publisher study guide','url':guides[n],'kind':'Publisher study guide','access':'Free prepared study material; publisher labels this AI-assisted'}];count+=1
  if n in outlines:
   v['outlineUrl']=outlines[n];v['readings']=[r for r in v.get('readings',[]) if r.get('kind')!='Publisher outline']+[{'title':'Lecture abstract, keywords and outline','url':outlines[n],'kind':'Publisher outline','access':'Free full text; publisher labels this AI-assisted'}]
  f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 print(cid,count,'publisher study guides')
