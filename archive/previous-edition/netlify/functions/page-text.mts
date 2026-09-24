const ALLOWED = new Set([
  'youtube.com','www.youtube.com','youtu.be','m.youtube.com',
  'biblicaltraining.org','www.biblicaltraining.org',
  'biblicalelearning.org','www.biblicalelearning.org',
  'billmounce.com','www.billmounce.com','itunes.apple.com'
]);

function decode(html:string){return html.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'\"').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/')}
function strip(html:string){return decode(html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<nav[\s\S]*?<\/nav>/gi,' ').replace(/<header[\s\S]*?<\/header>/gi,' ').replace(/<footer[\s\S]*?<\/footer>/gi,' ').replace(/<aside[\s\S]*?<\/aside>/gi,' ').replace(/<form[\s\S]*?<\/form>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()}

export default async (req:Request) => {
  try{
    const raw=new URL(req.url).searchParams.get('url');
    if(!raw)return Response.json({error:'Missing url'},{status:400});
    const url=new URL(raw);
    if(!['http:','https:'].includes(url.protocol)||!ALLOWED.has(url.hostname))return Response.json({error:'Source host not allowed'},{status:400});
    const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; MDivStudy/1.0)','accept-language':'en-US,en;q=0.9'}});
    if(!r.ok)return Response.json({error:`Source returned ${r.status}`},{status:502});
    const html=await r.text();
    const article=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]||html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||html;
    const text=strip(article);
    if(text.length<250)return Response.json({error:'No usable lesson text was exposed by this provider.'},{status:404});
    return Response.json({text:text.slice(0,120000),source:r.url},{headers:{'cache-control':'public, max-age=86400'}})
  }catch{return Response.json({error:'Lesson text unavailable'},{status:502})}
}

export const config={path:'/api/page-text'};
