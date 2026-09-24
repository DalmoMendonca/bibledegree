import json,re
from pathlib import Path
from bs4 import BeautifulSoup
p=Path('public/data/catalog.json');cs=json.loads(p.read_text())
for cid,name in [('c56','desilva-culture'),('c57','desilva-apocrypha')]:
 c=next(x for x in cs if x['id']==cid);c['url']=c['url'].replace('http:','https:')
 s=BeautifulSoup(Path('.cache/'+name+'.html').read_text(),'html.parser');m=s.find('main') or s
 titles=re.findall(r'Lecture (\d+),\s*(.*?)\s*\((\d+) mins\)',m.get_text(' ',strip=True))
 videos=[a['href'].split('/')[-1] for a in m.find_all('a',href=True) if 'youtu.be' in a['href'] and not a.get_text(strip=True)]
 c['lessons']=[{'id':cid+'-l'+str(i+1),'title':title,'videoId':video,'duration':duration+' min','url':'https://www.youtube.com/watch?v='+video} for i,((n,title,duration),video) in enumerate(zip(titles,videos))]
 c['readings']=[{'title':'Course transcripts and study resources','url':c['url'],'kind':'Provider resources','access':'Free full text at Biblical eLearning; machine transcription may contain errors'}]
 print(cid,len(c['lessons']))
c=next(x for x in cs if x['id']=='c54');c['url']='https://www.biblicaltraining.org/learn/institute/nt630-pastoral-epistles'
titles=['Introductory Issues','1 Timothy 1:1–7','1 Timothy 1:8–20','False Teaching','1 Timothy 2:1–10','1 Timothy 2:11–13','1 Timothy 2:14–15','1 Timothy 3:1–7','Other Passages on Elders','1 Timothy 3:8–13','1 Timothy 3:14–4:16','1 Timothy 5:1–16','1 Timothy 6','Titus','2 Timothy 1:1–11','2 Timothy 1:12–18','2 Timothy 2:1–13','2 Timothy 2:14–4:2','2 Timothy 4:3–22']
c['lessons']=[{'id':'c54-l'+str(i+1),'title':t,'url':c['url']} for i,t in enumerate(titles)]
for c in cs:
 for l in c['lessons']:
  if l.get('url')==c['url']:l['sourceKind']='course'
 if not c['lessons'] and not c.get('note'):c['note']='The original course is listed here, but its individual lectures have not yet been verified.'
 if c['id']=='c63':c['note']='The first 100 videos have been indexed. The original playlist may contain additional lessons.'
p.write_text(json.dumps(cs,ensure_ascii=False,indent=2))
