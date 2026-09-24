function decodeEntities(s: string){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'\"')}
export default async (req: Request) => {
  const id=new URL(req.url).searchParams.get('videoId')||'';
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return Response.json({error:'Invalid videoId'},{status:400});
  try{
    const watch=await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`,{headers:{'user-agent':'Mozilla/5.0 (compatible; MDivStudy/1.0)','accept-language':'en-US,en;q=0.9'}}).then(r=>r.text());
    const raw=watch.match(/\"captionTracks\":(\[[\s\S]*?\]),\"audioTracks\"/)?.[1];
    if(!raw)return Response.json({error:'No captions available'},{status:404});
    const tracks=JSON.parse(raw);const track=tracks.find((t:any)=>t.languageCode==='en')||tracks.find((t:any)=>String(t.languageCode).startsWith('en'))||tracks[0];
    if(!track?.baseUrl)return Response.json({error:'No captions available'},{status:404});
    const transcriptUrl=track.baseUrl+(track.baseUrl.includes('?')?'&':'?')+'fmt=json3';
    const res=await fetch(transcriptUrl);const body=await res.text();let text='';
    try{const json=JSON.parse(body);text=(json.events||[]).flatMap((e:any)=>e.segs||[]).map((s:any)=>s.utf8||'').join(' ').replace(/\s+/g,' ').trim()}catch{text=decodeEntities(body.replace(/<text[^>]*>/g,'').replace(/<\/text>/g,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()}
    if(!text)return Response.json({error:'Caption track was empty'},{status:404});
    return Response.json({text,language:track.languageCode||'unknown'},{headers:{'cache-control':'public, max-age=86400'}})
  }catch{return Response.json({error:'Transcript unavailable'},{status:502})}
}
export const config={path:'/api/youtube-transcript'};
