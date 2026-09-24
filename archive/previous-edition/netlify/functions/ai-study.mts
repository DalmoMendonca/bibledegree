declare const Netlify: { env: { get(name: string): string | undefined } };
function outputText(data:any){if(typeof data.output_text==='string')return data.output_text;return (data.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text||'').join('')}
export default async (req: Request) => {
  if(req.method!=='POST')return new Response('Method not allowed',{status:405});
  const key=Netlify.env.get('OPENAI_API_KEY');if(!key)return Response.json({error:'Add OPENAI_API_KEY in this Netlify project to generate AI study guides.'},{status:503});
  try{
    const {courseTitle,lectureTitle,transcript}=await req.json();if(!transcript)return Response.json({error:'Transcript required'},{status:400});
    const prompt=`You are creating a rigorous seminary-level study guide from a lecture transcript. Stay faithful to the lecture; distinguish the professor's claims from general fact; do not invent quotations.\n\nCourse: ${courseTitle}\nLecture: ${lectureTitle}\n\nReturn ONLY valid JSON with this exact shape: {"summary":["4-7 substantial paragraphs"],"mastery":[{"question":"...","answer":"..."}],"reflection":["..."],"quiz":[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}]}. Create 6 mastery questions, 4 reflection questions, and 12 multiple-choice questions. Make distractors plausible and test actual comprehension, not trivia.\n\nTRANSCRIPT:\n${String(transcript).slice(0,70000)}`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'authorization':`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:Netlify.env.get('OPENAI_MODEL')||'gpt-5.6-luna',input:prompt,reasoning:{effort:'low'}})});
    const data=await r.json();if(!r.ok)return Response.json({error:data?.error?.message||'OpenAI request failed'},{status:502});
    const raw=outputText(data).trim().replace(/^```json\s*/,'').replace(/```$/,'');
    try{return Response.json(JSON.parse(raw),{headers:{'cache-control':'no-store'}})}catch{return Response.json({error:'The AI returned an invalid study guide. Try again.'},{status:502})}
  }catch{return Response.json({error:'Could not generate study guide'},{status:500})}
}
export const config={path:'/api/ai-study'};
