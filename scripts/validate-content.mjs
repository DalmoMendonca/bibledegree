import fs from 'node:fs';
import assert from 'node:assert/strict';
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8'));
const ids=new Set();
for(const c of catalog){assert(c.id&&c.title&&c.url);new URL(c.url);for(const l of c.lessons){assert(!ids.has(l.id),`Duplicate ${l.id}`);ids.add(l.id);assert(l.title);new URL(l.url);if(l.videoId)assert(/^[A-Za-z0-9_-]{11}$/.test(l.videoId));}}
for(const name of fs.readdirSync('public/data/lectures')){const id=name.replace('.json','');assert(ids.has(id),id);const s=JSON.parse(fs.readFileSync('public/data/lectures/'+name));assert(s.transcript?.length>1000);assert(s.sourceUrl&&s.attribution);}
for(const name of fs.readdirSync('public/data/guides')){const g=JSON.parse(fs.readFileSync('public/data/guides/'+name));assert(ids.has(name.replace('.json','')));assert(g.summary&&g.sourceNote);assert(g.quiz.length>=12);for(const q of g.quiz){assert(q.options.length===4);assert(new Set(q.options).size===4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>30);}assert(new Set(g.quiz.map(q=>q.answer)).size===4);}
console.log(`Validated ${catalog.length} courses, ${ids.size} unique lectures, source transcripts, and bundled quiz.`);
