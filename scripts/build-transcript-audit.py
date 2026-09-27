"""Record what is acquired versus merely linked, without claiming unsearched text is absent."""
import json
from pathlib import Path
root=Path('public/data');catalog=json.loads((root/'catalog.json').read_text());courses=[]
for c in catalog:
 rows=[]
 for l in c['lessons']:
  p=root/'lectures'/(l['id']+'.json');s=json.loads(p.read_text()) if p.exists() else {};ready=s.get('preparation',{}).get('status')=='text-acquired'
  reason=None
  if not ready:
   if 'biblicaltraining.org' in c['url']:reason='Direct acquisition encountered a Cloudflare verification challenge. Publisher also restricts republication; permission or an authorized transcript export would help.'
   elif l.get('videoId'):reason='Text not yet acquired. YouTube caption retrieval encountered a verification challenge; alternate publisher sources remain under review.'
   else:reason='Transcript source not yet acquired.'
  rows.append({'lessonId':l['id'],'title':l['title'],'status':'acquired-cleaned' if ready else 'linked-not-acquired' if s.get('transcriptUrl') else 'not-yet-acquired','sourceUrl':s.get('transcriptPdfUrl') or s.get('transcriptUrl') or s.get('sourceUrl') or l['url'],'barrier':reason,'audioVerified':False})
 courses.append({'courseId':c['id'],'title':c['title'],'lectures':len(rows),'acquired':sum(x['status']=='acquired-cleaned' for x in rows),'catalogIssue':c.get('sourceIssue') if not rows else None,'lessons':rows})
(root/'transcript-audit.json').write_text(json.dumps({'checkedAt':'2026-09-27','note':'Cleanup normalizes text formatting. It does not certify accuracy against audio. Not-yet-acquired does not mean no transcript exists.','courses':courses},ensure_ascii=False,indent=2)+'\n')
print('Audit records:',sum(c['lectures'] for c in courses),'Acquired:',sum(c['acquired'] for c in courses))
