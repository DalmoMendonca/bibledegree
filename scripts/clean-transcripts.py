"""Normalize acquired transcripts without rewriting the lecturer's words.
Publisher PDFs remain in the ignored preparation cache; public files retain links.
"""
import json,re,hashlib,unicodedata
from pathlib import Path
DATA=Path('public/data');CACHE=Path('.cache/clean-transcripts');CACHE.mkdir(exist_ok=True)
def clean(text,pdf=False):
 text=unicodedata.normalize('NFC',text).replace('\ufeff','').replace('\u00ad','')
 lines=text.replace('\r\n','\n').replace('\r','\n').splitlines()
 # PDF page counters are layout, not lecture content. Keep headings and speaker turns.
 lines=[l.rstrip() for l in lines if not (pdf and re.fullmatch(r'\s*\d{1,3}\s*',l)) and l.strip()!='Back to Top']
 text='\n'.join(lines).replace('\f','\n\n')
 if pdf:
  text=re.sub(r'(?<=\w)-\n\s*(?=[a-z])','',text)
  text=re.sub(r'(?<=\S)\n[ \t]*(?=[a-z])',' ',text)
 text=re.sub(r'[ \t]+',' ',text)
 return re.sub(r'\n{3,}','\n\n',text).strip()+'\n'
rows=[]
for p in sorted((DATA/'lectures').glob('*.json')):
 s=json.loads(p.read_text());raw=s.get('transcript');pdf=False
 if not raw:
  f=Path('.cache/linked-transcripts')/(p.stem+'.txt')
  if f.exists():pdf=True
  else:f=Path('.cache/craig')/(p.stem+'.txt')
  if not f.exists():continue
  raw=f.read_text()
 normalized=clean(raw,pdf)
 if len(normalized)<1000:continue
 (CACHE/(p.stem+'.txt')).write_text(normalized)
 metadata={'status':'text-acquired','characters':len(normalized),'words':len(normalized.split()),'cleanedSha256':hashlib.sha256(normalized.encode()).hexdigest(),'cleanup':'Whitespace, page counters, and layout artifacts only; not audio-verified.','storage':'inline' if s.get('transcript') else 'preparation-cache','sourceUrl':s.get('transcriptPdfUrl') or s.get('sourceUrl'),'checkedAt':'2026-09-27'}
 s['preparation']=metadata
 if s.get('transcript'):
  s['transcript']=normalized
  g=DATA/'guides'/p.name
  if g.exists():
   guide=json.loads(g.read_text());guide['sourceHash']=hashlib.sha256(normalized.encode()).hexdigest();g.write_text(json.dumps(guide,ensure_ascii=False,indent=2)+'\n')
 p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n');rows.append({'lessonId':p.stem,**metadata})
(CACHE/'manifest.json').write_text(json.dumps(rows,indent=2)+'\n')
print('Cleaned',len(rows),'transcripts; private publisher text is not copied to public assets.')
