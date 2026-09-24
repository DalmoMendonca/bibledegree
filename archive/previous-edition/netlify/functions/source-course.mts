const ALLOWED = new Set([
  'youtube.com','www.youtube.com','youtu.be','m.youtube.com',
  'biblicaltraining.org','www.biblicaltraining.org',
  'biblicalelearning.org','www.biblicalelearning.org',
  'billmounce.com','www.billmounce.com','itunes.apple.com'
]);

function decodeText(value: string){
  try{return JSON.parse(`\"${value.replace(/\"/g,'\\\\\"')}\"`)}catch{return value.replace(/\\u0026/g,'&').replace(/\\n/g,' ')}
}
function strip(html: string){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'\"').replace(/\s+/g,' ').trim()}
function uniq(items: any[], keyFn=(x:any)=>x.videoId||x.url||x.title){const seen=new Set();return items.filter(x=>{const k=keyFn(x);if(!k||seen.has(k))return false;seen.add(k);return true})}

async function youtube(url: URL){
  const list=url.searchParams.get('list');
  const target=list?`https://www.youtube.com/playlist?list=${encodeURIComponent(list)}`:url.toString();
  const r=await fetch(target,{headers:{'user-agent':'Mozilla/5.0 (compatible; MDivStudy/1.0)','accept-language':'en-US,en;q=0.9'}});
  const html=await r.text();
  const lessons:any[]=[];
  const re=/\"videoId\":\"([A-Za-z0-9_-]{11})\"[\s\S]{0,1600}?\"title\":\{\"runs\":\[\{\"text\":\"((?:\\.|[^\"\\])*)\"/g;
  let m;
  while((m=re.exec(html))){lessons.push({videoId:m[1],title:decodeText(m[2]),url:`https://www.youtube.com/watch?v=${m[1]}${list?`&list=${list}`:''}`});if(lessons.length>=120)break}
  if(!lessons.length){const vid=url.searchParams.get('v');if(vid)lessons.push({videoId:vid,title:'Lecture 1',url:url.toString()})}
  return {kind:'youtube',title:'YouTube course',lessons:uniq(lessons),resources:[]};
}

async function webpage(url: URL){
  const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; MDivStudy/1.0)','accept-language':'en-US,en;q=0.9'}});
  const html=await r.text();
  const title=strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||url.hostname);
  const lessons:any[]=[];
  const resources:any[]=[];
  const anchor=/<a\s+[^>]*href=[\"']([^\"']+)[\"'][^>]*>([\s\S]*?)<\/a>/gi;let m;
  while((m=anchor.exec(html))){
    const text=strip(m[2]);if(!text||text.length<2)continue;
    let href='';try{href=new URL(m[1],r.url).toString()}catch{continue}
    const hay=`${text} ${href}`.toLowerCase();
    if(/syllabus|assigned reading|reading list|bibliography|handout|course notes|lecture notes|textbook|\.pdf(?:$|\?)/.test(hay)&&!/login|register|donate|privacy|terms/.test(hay)){
      resources.push({title:text.slice(0,180),url:href,kind:/\.pdf(?:$|\?)/.test(hay)?'PDF':'Course reading'});continue;
    }
    const numbered=text.match(/^\s*(\d{1,3})[.)]?\s+(.{3,180})$/);
    const lectureish=/\b(?:lecture|lesson|session|class|week)\s*\d{1,3}\b/i.test(text);
    if((numbered||lectureish)&&!/login|register|donate/.test(hay)){
      lessons.push({title:(numbered?text.replace(/^\s*\d{1,3}[.)]?\s*/,''):text).slice(0,180),url:href});
    }
  }
  if(!lessons.length){
    const lines=strip(html).split(/(?=\b\d{1,3}\.\s)/);for(const line of lines){const x=line.match(/^(\d{1,3})\.\s+([^.!?]{3,140})/);if(x)lessons.push({title:x[2].trim(),url:r.url})}
  }
  return {kind:'web',title,lessons:uniq(lessons).slice(0,150),resources:uniq(resources).slice(0,40)};
}

export default async (req: Request) => {
  try{
    const u=new URL(req.url).searchParams.get('url');if(!u)return Response.json({error:'Missing url'},{status:400});
    const url=new URL(u);if(!['http:','https:'].includes(url.protocol)||!ALLOWED.has(url.hostname))return Response.json({error:'Source host not allowed'},{status:400});
    const data=url.hostname.includes('youtube')||url.hostname==='youtu.be'?await youtube(url):await webpage(url);
    return Response.json(data,{headers:{'cache-control':'public, max-age=3600'}})
  }catch{return Response.json({error:'Could not read source course'},{status:502})}
}
export const config={path:'/api/source-course'};
