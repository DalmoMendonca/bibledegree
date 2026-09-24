export const STORAGE_KEY='bibledegree-progress-v2';
export const emptyProgress=()=>({version:2,selected:'c31',done:{},quiz:{}});
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
export function readProgress(storage){
 try{const s=JSON.parse(storage.getItem(STORAGE_KEY));if(s?.version===2&&object(s.done)&&object(s.quiz))return s;}catch{}
 try{const s=JSON.parse(storage.getItem('bibledegree-local-v2'));if(s?.version===2&&object(s.done)&&object(s.quiz))return {...emptyProgress(),...s,selected:s.selected||'c31'};}catch{}
 const next=emptyProgress();
 try{
  const old=JSON.parse(storage.getItem('bibledegree-v1'));
  if(old?.version===1&&object(old.people)){
   next.selected=old.selected||next.selected;
   for(const person of Object.values(old.people)){
    Object.assign(next.done,person.done||{});
    for(const [id,q] of Object.entries(person.quiz||{}))if(!next.quiz[id]||(q.best/q.total)>(next.quiz[id].best/next.quiz[id].total))next.quiz[id]=q;
   }
   // Preserve previously displayed completed courses only for existing visitors.
   next.done['course:c4']=true;next.done['course:c9']=true;
  }
 }catch{}
 return next;
}
export function courseComplete(c,p){return !!p.done['course:'+c.id]||(c.lessons.length>0&&c.lessons.every(l=>p.done[l.id]));}
export function courseCount(c,p){return courseComplete(c,p)?c.lessons.length:c.lessons.filter(l=>p.done[l.id]).length;}
export function scoreQuiz(previous,correct,total,mistakes){return{best:Math.max(previous?.best||0,correct),total,attempts:(previous?.attempts||0)+1,last:correct,mistakes,updated:new Date().toISOString()};}
