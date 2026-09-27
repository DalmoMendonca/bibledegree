"""Read publisher-linked PDFs for offline preparation; never publish their full text."""
import json,re,hashlib,subprocess,concurrent.futures
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
ROOT=Path('public/data'); CACHE=Path('.cache/linked-transcripts');CACHE.mkdir(exist_ok=True)
def one(f):
 v=json.loads(f.read_text());u=v.get('transcriptUrl');dest=CACHE/(f.stem+'.txt')
 if not u or v.get('transcript') or 'biblicalelearning.org' not in u:return None
 try:
  if dest.exists() and len(dest.read_text())>1000:return {'id':f.stem,'status':'cached'}
  r=requests.get(u,timeout=35);r.raise_for_status()
  if 'pdf' not in r.headers.get('Content-Type','').lower():
   s=BeautifulSoup(r.text,'html.parser');m=s.find('main') or s
   links=list(dict.fromkeys(a['href'] for a in m.find_all('a',href=True) if a['href'].lower().endswith('.pdf')))
   if len(links)!=1:raise ValueError('Ambiguous PDF links: '+str(len(links)))
   u=links[0];r=requests.get(u,timeout=35);r.raise_for_status()
  if not r.content.startswith(b'%PDF'):raise ValueError('Not a PDF')
  pdf=CACHE/(f.stem+'.pdf');pdf.write_bytes(r.content)
  subprocess.run(['pdftotext','-layout',str(pdf),str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  text=dest.read_text()
  if len(text)<1000:raise ValueError('Insufficient text')
  v['transcriptPdfUrl']=u;v['transcriptSourceHash']=hashlib.sha256(text.encode()).hexdigest();v['transcriptCheckedAt']='2026-09-25';f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
  return {'id':f.stem,'status':'ready','chars':len(text),'url':u}
 except Exception as e:return {'id':f.stem,'status':'error','error':str(e)}
files=list((ROOT/'lectures').glob('*.json'))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 out=[]
 for r in pool.map(one,files):
  if r:out.append(r);print(json.dumps(r),flush=True);(CACHE/'status.json').write_text(json.dumps(out,indent=2))
