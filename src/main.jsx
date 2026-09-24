import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{BookOpen,Map,Library,Target,Check,Play,ArrowRight,ChevronRight,ChevronDown,Trophy,Search,GraduationCap,ScrollText,ExternalLink,CheckCircle2,Lightbulb,Route,Layers3,Compass,Clock,FileText,Brain,MessageCircleQuestion,BookMarked,Circle,LockKeyhole}from'lucide-react';
import './style.css';
import './revision.css';

const STORE='bibledegree-local-v2';
const labels={learn:'Learn',courses:'Curriculum',practice:'Practice',progress:'Journey',roadmap:'Roadmap'};
const icons={learn:Map,courses:Library,practice:Target,progress:Trophy,roadmap:Route};
const staticTranscriptCourses=new Set(['c4','c9','c61']);

function empty(){return{version:2,selected:null,done:{},quiz:{}}}
function load(){
 try{
  const v2=JSON.parse(localStorage.getItem(STORE)||'null');
  if(v2?.version===2)return{...empty(),...v2,done:v2.done||{},quiz:v2.quiz||{}};
  const old=JSON.parse(localStorage.getItem('bibledegree-v1')||'null');
  if(old?.people){
   const legacy=old.people[old.active]||old.people.Dalmo||old.people.Viv||{};
   return{version:2,selected:old.selected||null,done:legacy.done||{},quiz:legacy.quiz||{}};
  }
 }catch{}
 return empty();
}
function ext(url){return/^https?:\/\//.test(url||'')?url:'#'}
function courseDone(c,state){return!!state.done['course:'+c.id]||(c.lessons?.length>0&&c.lessons.every(l=>state.done[l.id]))}
function lessonDone(l,state){return!!state.done[l.id]}
function courseCount(c,state){return c.lessons?.filter(l=>lessonDone(l,state)).length||0}
function nav(path){location.hash=path}

function App(){
 const[catalog,setCatalog]=useState([]),[state,setState]=useState(load),[route,setRoute]=useState(location.hash.slice(1)||'/learn'),[error,setError]=useState(''),[toast,setToast]=useState(''),[search,setSearch]=useState(''),[filter,setFilter]=useState('All'),[showAll,setShowAll]=useState(false);
 useEffect(()=>{fetch('/data/catalog.json').then(r=>{if(!r.ok)throw Error('Could not load the curriculum');return r.json()}).then(setCatalog).catch(e=>setError(e.message))},[]);
 useEffect(()=>{const h=()=>{setRoute(location.hash.slice(1)||'/learn');window.scrollTo(0,0)};addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);
 useEffect(()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch{setError('This browser could not save local progress.')}},[state]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(t)}},[toast]);
 function update(fn){setState(s=>{const n=structuredClone(s);fn(n);return n})}
 function notify(msg){setToast(msg)}
 const course=catalog.find(c=>c.id===state.selected)||catalog[0];
 const lessonId=route.startsWith('/lesson/')?route.split('/')[2].split('?')[0]:null;
 const lessonCourse=lessonId?catalog.find(c=>c.lessons?.some(l=>l.id===lessonId)):null;
 const lesson=lessonCourse?.lessons?.find(l=>l.id===lessonId);
 const totalCourses=catalog.length;
 const totalLessons=catalog.reduce((n,c)=>n+(c.lessons?.length||0),0);
 const lessonsDone=Object.keys(state.done).filter(k=>!k.startsWith('course:')&&state.done[k]).length;
 const coursesDone=catalog.filter(c=>courseDone(c,state)).length;
 const next=course?.lessons?.find(l=>!lessonDone(l,state))||course?.lessons?.[0];
 function selectCourse(c){update(n=>n.selected=c.id);setShowAll(false);nav('/learn')}
 function markLesson(l,value=true){update(n=>{if(value)n.done[l.id]=new Date().toISOString();else delete n.done[l.id]});notify(value?'Lesson complete':'Lesson marked incomplete')}
 function toggleCourse(c){update(n=>{const key='course:'+c.id;if(n.done[key])delete n.done[key];else n.done[key]=new Date().toISOString()});notify('Course progress updated')}
 function recordQuiz(id,correct,total,mistakes){update(n=>{const prev=n.quiz[id];n.quiz[id]={best:Math.max(prev?.best||0,correct),total,attempts:(prev?.attempts||0)+1,last:correct,mistakes,updated:new Date().toISOString()}})}
 if(error&&!catalog.length)return <div className="loading"><BookOpen size={48}/><h1>Could not open the curriculum.</h1><p>{error}</p><button onClick={()=>location.reload()}>Try again</button></div>;
 if(!course)return <div className="loading"><BookOpen className="breathe" size={52}/><h2>Opening the library…</h2></div>;
 return <>
  <aside className="sidebar">
   <a href="#/learn" className="brand"><BookOpen size={35} strokeWidth={3}/><span>bible<span>degree</span></span></a>
   <nav>{Object.entries(labels).map(([k,v])=>{const Icon=icons[k];return <a key={k} href={'#/'+k} className={route==='/'+k?'active':''}><Icon/><span>{v}</span></a>})}</nav>
   <div className="sidebar-bottom local-note"><LockKeyhole size={20}/><span>Progress stays in this browser.<small>Accounts and cloud sync come later.</small></span></div>
  </aside>
  <div className="shell">
   <header className="topbar"><a href="#/learn" className="mobile-brand"><BookOpen/> bibledegree</a><span className="top-context">A FREE THEOLOGICAL EDUCATION</span><div className="top-stats"><span title="Lessons completed"><CheckCircle2 size={22}/>{lessonsDone}<small>lessons</small></span><span title="Courses completed"><GraduationCap size={22}/>{coursesDone}<small>courses</small></span></div></header>
   <div className={'body-grid '+(lesson?'lecture-grid':'')}><main id="main">
    {route==='/learn'&&<LearnPage course={course} state={state} next={next} showAll={showAll} setShowAll={setShowAll} toggleCourse={toggleCourse}/>} 
    {route==='/courses'&&<CurriculumPage catalog={catalog} state={state} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} selectCourse={selectCourse}/>} 
    {lesson&&<Lesson key={lesson.id} lesson={lesson} course={lessonCourse} state={state} mark={markLesson} recordQuiz={recordQuiz} notify={notify}/>} 
    {lessonId&&!lesson&&<div className="empty-state"><h1>Lesson not found</h1><a className="button primary" href="#/courses">Browse curriculum</a></div>}
    {route==='/practice'&&<PracticePage catalog={catalog} state={state} next={next}/>} 
    {route==='/progress'&&<JourneyPage catalog={catalog} state={state} coursesDone={coursesDone} lessonsDone={lessonsDone} totalCourses={totalCourses} totalLessons={totalLessons}/>} 
    {route==='/roadmap'&&<RoadmapPage/>}
   </main></div>
   <MobileNav route={route}/>
  </div>
  {toast&&<div className="toast">{toast}</div>}
 </>;
}

function MobileNav({route}){return <nav className="mobile-bottom-nav">{Object.entries(labels).map(([k,v])=>{const Icon=icons[k];return <a key={k} href={'#/'+k} className={route==='/'+k?'active':''}><Icon size={21}/><span>{v}</span></a>})}</nav>}

function LearnPage({course,state,next,showAll,setShowAll,toggleCourse}){
 const done=courseCount(course,state),all=course.lessons?.length||0;
 return <>
  <div className="page-heading"><div><p className="eyebrow">ONE LECTURE AT A TIME</p><h1>Your learning path</h1></div><button className="text-button" onClick={()=>nav('/courses')}>Change course <ChevronDown size={18}/></button></div>
  <section className="course-banner"><div><span>{course.section.toUpperCase()} · CURRENT COURSE</span><h2>{course.title}</h2><p>{course.professor}</p></div><div className="banner-icon"><ScrollText size={48} strokeWidth={1.7}/></div><div className="banner-progress"><div className="track"><i style={{width:(all?100*done/all:0)+'%'}}/></div><small>{done} / {all} lessons</small></div></section>
  {course.note&&<p className="source-note">{course.note}</p>}
  <div className="path-intro"><span>{courseDone(course,state)?'COURSE COMPLETE':'YOUR NEXT LESSON'}</span><p>{next?.title||'Open the source course to begin'}</p></div>
  {all?<div className="learning-path">{course.lessons.slice(0,showAll?undefined:10).map((l,i)=>{const finished=lessonDone(l,state),active=l.id===next?.id;return <React.Fragment key={l.id}>{i>0&&i%6===0&&<div className="unit-divider"><span>CHAPTER {Math.floor(i/6)+1}</span><strong>Keep going deeper</strong></div>}<div className={'path-stop '+(active?'current ':'')+(finished?'finished':'')} style={{'--offset':`${[0,64,98,64,0,-64,-98,-64][i%8]}px`}}>{active&&<span className="start-callout">{finished?'REVISIT':'START HERE'}</span>}<a className="lesson-node" href={'#/lesson/'+l.id} aria-label={'Lesson '+(i+1)+': '+l.title}>{finished?<Check size={34} strokeWidth={4}/>:active?<Play size={31} fill="currentColor"/>:<BookOpen size={29}/>}</a><div className="path-label"><span>LECTURE {i+1}{l.duration?' · '+l.duration:''}</span><strong>{l.title}</strong>{staticTranscriptCourses.has(course.id)&&<small className="static-badge">STATIC TRANSCRIPT</small>}</div>{i===2&&<img src="/lamb.webp" className="path-lamb" alt="A cheerful lamb reading a book"/>}</div></React.Fragment>})}</div>:<div className="empty-state"><Library size={42}/><h2>Continue at the course provider</h2><p>{course.sourceIssue||'This course does not yet have a verified lecture index.'}</p><a className="button primary" href={ext(course.url)} target="_blank" rel="noreferrer">Open course <ExternalLink size={18}/></a></div>}
  {!showAll&&all>10&&<button className="button outline more-lessons" onClick={()=>setShowAll(true)}>Show all {all} lectures <ChevronDown size={18}/></button>}
  <div className="course-footer"><a href={ext(course.url)} target="_blank" rel="noreferrer">Original course <ExternalLink size={15}/></a><button className="text-button" onClick={()=>toggleCourse(course)}>{state.done['course:'+course.id]?'Undo course completion':'Mark course completed'}</button></div>
 </>;
}

function CurriculumPage({catalog,state,search,setSearch,filter,setFilter,selectCourse}){
 const sections=['All','Biblical Studies','Theology & History','Philosophy, Ethics, etc.','Electives'];
 const visible=catalog.filter(c=>(filter==='All'||c.section===filter)&&`${c.title} ${c.professor} ${c.area}`.toLowerCase().includes(search.toLowerCase()));
 return <>
  <div className="page-heading"><div><p className="eyebrow">THE WHOLE MAP</p><h1>Curriculum</h1><p>Courses remain grouped by field; the map below also shows the most important prerequisite relationships.</p></div></div>
  {!search&&filter==='All'&&<PrerequisiteMap catalog={catalog} selectCourse={selectCourse}/>} 
  <label className="search-box"><Search size={22}/><input placeholder="Find a course, professor, or subject" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  <div className="filter-row">{sections.map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f==='Philosophy, Ethics, etc.'?'Philosophy & ethics':f}</button>)}</div>
  {sections.slice(1).map(section=>{const list=visible.filter(c=>c.section===section);if(!list.length)return null;return <section className="catalog-section" key={section}><div className="section-title-row"><h2>{section}</h2><span>{list.length} courses</span></div><div className="course-list">{list.map((c,i)=><button key={c.id} className="course-card" onClick={()=>selectCourse(c)}><div className={'course-emblem tone-'+i%4}>{courseDone(c,state)?<Check size={31}/>:<BookOpen size={31}/>}</div><div><small>{c.area}</small><h3>{c.title}</h3><p>{c.professor}</p><span>{c.lessons?.length?`${c.lessons.length} lectures · `:''}{c.hours} hours{courseDone(c,state)?' · Completed':''}</span></div><ChevronRight size={22}/></button>)}</div></section>})}
  {!visible.length&&<p className="empty-state">No courses match. Try another title or professor.</p>}
  <p className="fineprint">This is an independent-study curriculum, not an accredited degree. Provider hours are estimates and parallel alternatives are separate courses, not additional degree requirements.</p>
 </>;
}

function PrerequisiteMap({catalog,selectCourse}){
 const find=(fn)=>catalog.filter(fn);
 const byArea=(name)=>find(c=>(c.area||'').trim()===name);
 const title=(rx)=>find(c=>rx.test(c.title));
 const tracks=[
  {name:'New Testament',tone:'nt',stages:[{label:'Survey',courses:byArea('NT Survey')},{label:'Greek',courses:title(/^Biblical Greek$|^Biblical Greek II$/i)},{label:'Exegesis method',courses:byArea('Interpreting the NT')},{label:'Book exegesis',courses:byArea('NT Exegesis')}]},
  {name:'Old Testament',tone:'ot',stages:[{label:'Survey',courses:byArea('OT Survey')},{label:'Hebrew',courses:find(c=>/^Hebrew I$|^Hebrew II$/i.test(c.area||c.title))},{label:'Exegesis method',courses:byArea('Interpreting the OT')},{label:'Book exegesis',courses:byArea('OT Exegesis')}]},
  {name:'Theology',tone:'theology',stages:[{label:'Foundations',courses:find(c=>/^Theology I/i.test(c.area||''))},{label:'Systematic depth',courses:find(c=>/^Theology II/i.test(c.area||''))},{label:'Advanced doctrines',courses:title(/Biblical Theology|Doctrine of Christ|Atonement/i)}]},
  {name:'Church history',tone:'history',stages:[{label:'Early → medieval',courses:find(c=>/Church History to the Reformation/i.test(c.area||''))},{label:'Reformation → modern',courses:find(c=>/Church History from the Reformation/i.test(c.area||''))},{label:'Historical theology',courses:title(/Historical Theology|Luther and Calvin/i)}]},
  {name:'Philosophy',tone:'philosophy',stages:[{label:'Introduction',courses:title(/^Introduction to Philosophy$/i)},{label:'History of thought',courses:title(/History of Philosophy|Ancient.*Philosophy|Modern Philosophy/i)},{label:'Advanced traditions',courses:title(/Analytic Tradition|Ideas of the Twentieth Century/i)}]}
 ].map(t=>({...t,stages:t.stages.filter(s=>s.courses.length)})).filter(t=>t.stages.length>1);
 return <section className="dependency-card"><div className="dependency-heading"><div><span className="eyebrow">PREREQUISITE TREE</span><h2>See how the disciplines build.</h2></div><Layers3 size={34}/></div><p className="dependency-note">Arrows show a sensible learning sequence, not formal admission requirements from the original providers. Courses within the same stage are usually parallel options.</p><div className="dependency-map">{tracks.map(track=><div className={'dependency-track '+track.tone} key={track.name}><h3>{track.name}</h3><div className="dependency-chain">{track.stages.map((stage,i)=><React.Fragment key={stage.label}><div className="dependency-stage"><span>{stage.label}</span><div>{stage.courses.slice(0,6).map(c=><button key={c.id} onClick={()=>selectCourse(c)}>{c.title}</button>)}</div></div>{i<track.stages.length-1&&<div className="dependency-arrow"><ArrowRight size={22}/></div>}</React.Fragment>)}</div></div>)}</div></section>;
}

function PracticePage({catalog,state,next}){
 const items=Object.entries(state.quiz).map(([id,q])=>{const c=catalog.find(c=>c.lessons?.some(l=>l.id===id));const l=c?.lessons?.find(l=>l.id===id);return{c,l,q}}).filter(x=>x.l);
 return <><div className="page-heading"><div><p className="eyebrow">RETRIEVAL OVER RE-READING</p><h1>Practice</h1></div></div><div className="practice-hero"><Target size={65}/><div><h2>Understanding grows when you retrieve it.</h2><p>Quizzes are bundled static content. Your attempts stay only in this browser.</p></div></div><h2 className="section-heading">Review queue</h2>{items.length?items.map(({c,l,q})=><a className="review-card" key={l.id} href={'#/lesson/'+l.id+'?tab=quiz'}><div><h3>{l.title}</h3><p>{c.title} · {q.attempts} attempt{q.attempts===1?'':'s'}{q.mistakes?.length?` · ${q.mistakes.length} to revisit`:''}</p></div><strong>{Math.round(q.best/q.total*100)}%</strong><ChevronRight/></a>):<div className="empty-state"><Lightbulb size={42}/><h3>Your review queue is empty.</h3><p>Take a static quiz inside a curated lecture. Results will appear here.</p>{next&&<a className="button primary" href={'#/lesson/'+next.id+'?tab=quiz'}>Open the next lecture <ArrowRight size={18}/></a>}</div>}</>;
}

function JourneyPage({catalog,state,coursesDone,lessonsDone,totalCourses,totalLessons}){
 const quizValues=Object.values(state.quiz);const avg=quizValues.length?Math.round(quizValues.reduce((n,q)=>n+(q.best/q.total*100),0)/quizValues.length):0;
 const sections=[...new Set(catalog.map(c=>c.section))];
 return <><div className="page-heading"><div><p className="eyebrow">LOCAL PROGRESS</p><h1>Your journey</h1><p>No profile, account, streak, or cloud sync. This browser is the learner record for now.</p></div></div><div className="journey-hero generic-journey"><img src="/lamb.webp" alt="Reading lamb"/><div><h2>{coursesDone} courses completed</h2><p>{lessonsDone} of {totalLessons} indexed lectures completed.</p><span className="gold-text">{quizValues.length?`${avg}% average best quiz score`:'Quizzes will appear as static guides are curated.'}</span></div></div><div className="journey-stats"><div><strong>{coursesDone}/{totalCourses}</strong><span>courses</span></div><div><strong>{lessonsDone}</strong><span>lectures</span></div><div><strong>{quizValues.length}</strong><span>quizzes tried</span></div></div><h2 className="section-heading">Progress by field</h2><div className="field-progress-grid">{sections.map(section=>{const list=catalog.filter(c=>c.section===section),done=list.filter(c=>courseDone(c,state)).length;return <section className="panel" key={section}><span className="eyebrow">{section}</span><h3>{done} / {list.length} courses</h3><div className="track"><i style={{width:(list.length?100*done/list.length:0)+'%'}}/></div></section>})}</div><p className="fineprint">When Google sign-in is added later, this local progress can be migrated to an account. Until then, clearing this browser’s site data will clear progress.</p></>;
}

function RoadmapPage(){
 const academic=[
  ['Biblical studies, languages & exegesis','Strong','The current curriculum already has unusually deep NT/OT surveys, Greek, Hebrew, exegesis, book studies, textual criticism, backgrounds, and biblical theology.'],
  ['Systematic theology & Christian ethics','Strong','Two systematic theology sequences plus ethics, apologetics, Christology, atonement, and biblical theology.'],
  ['Church history & historical theology','Strong','Early/medieval, Reformation/modern, historical theology, Luther/Calvin, and ancient/medieval context.'],
  ['Preaching / homiletics','Source next','An MDiv needs a substantial preaching course with sermon preparation, delivery, and theological interpretation.'],
  ['Pastoral theology & pastoral care','Source next','Pastoral presence, counseling boundaries, crisis care, grief, family systems, referral, and chaplaincy basics.'],
  ['Worship / liturgy','Source next','History and theology of Christian worship plus practical planning and leadership.'],
  ['World Christianity & missions','Source next','Christianity beyond the North Atlantic, mission history/theology, contextualization, and intercultural ministry.'],
  ['World religions & interfaith engagement','Source next','At least one substantial course in a non-Christian religious tradition and responsible comparative/interfaith work.'],
  ['Leadership / Christian education','Source next','Organizational leadership, governance, teaching, discipleship, and formation.'],
  ['Public theology / church & society','Source next','Theological engagement with policy, economics, race, justice, ecology, and public life.'],
  ['Supervised ministry / field education','Cannot be pure OCW','A real MDiv normally includes supervised field education or internship. The site can structure reflection and competencies, but a human supervisor and ministry context are essential.']
 ];
 const product=[
  ['Now','Anonymous local progress','No profiles. Progress and quiz results live in localStorage only.'],
  ['Now','Static lesson corpus','Runtime AI generation is removed. Transcripts and study guides are versioned files in the repository.'],
  ['Now','Prerequisite map','Core course sequences show how survey → language → exegesis method → book exegesis builds.'],
  ['Next','Finish static content procurement','Acquire or generate transcripts once, then author and review summaries, mastery questions, reflection prompts, quizzes, and reading links for every lecture.'],
  ['Later','Google OAuth + cloud sync','Accounts, cross-device progress, and migration of browser-local progress.'],
  ['Later','Course-aware chatbot','A lesson/course chatbot grounded in the complete static corpus. It answers questions; it does not regenerate canonical lesson content.']
 ];
 return <><div className="page-heading"><div><p className="eyebrow">FROM BIBLE DEGREE TO MDiv-SCALE</p><h1>Roadmap</h1><p>The target is content-area parity with a serious MDiv curriculum—not accredited status, and not merely more academic electives.</p></div></div><section className="roadmap-intro"><Compass size={54}/><div><h2>The academic core is already deep. The missing half is formation for ministry.</h2><p>Current MDiv curricula commonly require preaching, pastoral theology, worship, global Christianity, non-Christian religions, leadership or education, public theology, and supervised ministry in addition to Bible, theology, history, and ethics.</p><div className="source-links"><a href="https://divinity.yale.edu/learning-at-yds/courses-calendars/curriculum" target="_blank" rel="noreferrer">Yale curriculum <ExternalLink size={14}/></a><a href="https://divinity.duke.edu/programs/master-divinity-mdiv" target="_blank" rel="noreferrer">Duke MDiv <ExternalLink size={14}/></a></div></div></section><h2 className="section-heading">Degree-content parity</h2><div className="roadmap-list">{academic.map(([name,status,copy])=><article key={name}><div><span className={'roadmap-status '+(status==='Strong'?'strong':'next')}>{status}</span><h3>{name}</h3><p>{copy}</p></div></article>)}</div><h2 className="section-heading">Product roadmap</h2><div className="roadmap-list product-roadmap">{product.map(([when,name,copy])=><article key={name}><span className="roadmap-when">{when}</span><div><h3>{name}</h3><p>{copy}</p></div></article>)}</div></>;
}

function Lesson({lesson:l,course:c,state,mark,recordQuiz,notify}){
 const params=new URLSearchParams((location.hash.split('?')[1]||''));
 const[tab,setTab]=useState(params.get('tab')||'summary'),[lecture,setLecture]=useState(null),[guide,setGuide]=useState(null),[loading,setLoading]=useState(true),[quizActive,setQuizActive]=useState(false);
 const i=c.lessons.findIndex(x=>x.id===l.id),next=c.lessons[i+1],prev=c.lessons[i-1];
 useEffect(()=>{let live=true;setLoading(true);Promise.all([
  fetch('/data/lectures/'+l.id+'.json').then(r=>r.ok?r.json():null).catch(()=>null),
  fetch('/data/guides/'+l.id+'.json').then(r=>r.ok?r.json():null).catch(()=>null)
 ]).then(([a,b])=>{if(live){setLecture(a);setGuide(b);setLoading(false)}});return()=>{live=false}},[l.id]);
 const transcript=lecture?.transcript||'';
 const summary=guide?.summary||l.overview||lecture?.overview||'';
 const readings=[...(l.readings||[]),...(guide?.readings||[])].filter((x,idx,arr)=>x?.url&&arr.findIndex(y=>y.url===x.url)===idx);
 const hasGuide=!!guide;
 const vid=l.videoId;
 const tabs=[['summary','Summary',FileText],['transcript','Transcript',ScrollText],['mastery','Mastery',Brain],['reflection','Reflection',MessageCircleQuestion],['quiz','Quiz',Target],['readings','Readings',BookMarked]];
 return <div className="lesson-page">
  <div className="lesson-top"><a href="#/learn"><ArrowRight className="flip" size={18}/> Back to course</a><span>{c.title} · Lecture {i+1}</span></div>
  <section className="lecture-hero"><div className="lecture-video">{vid?<iframe src={'https://www.youtube-nocookie.com/embed/'+vid+'?rel=0'} title={l.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:<div className="provider-player"><Play size={44}/><h3>Watch at the original provider</h3><a className="button primary" href={ext(l.url||c.url)} target="_blank" rel="noreferrer">Open lecture <ExternalLink size={17}/></a></div>}</div><div className="lecture-heading"><span className="eyebrow">LECTURE {i+1} OF {c.lessons.length}</span><h1>{l.title}</h1><p>{c.professor}</p><div className="lecture-status-row">{transcript&&<span><CheckCircle2 size={16}/> Static transcript</span>}{hasGuide&&<span><CheckCircle2 size={16}/> Curated study guide</span>}{!hasGuide&&<span className="pending"><Clock size={16}/> Study guide queued</span>}</div><button className={'button '+(lessonDone(l,state)?'outline':'primary')} onClick={()=>mark(l,!lessonDone(l,state))}>{lessonDone(l,state)?<><Check size={18}/> Completed</>:<>Mark complete <Check size={18}/></>}</button></div></section>
  <div className="lesson-tabs">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setQuizActive(false)}}><Icon size={18}/>{label}</button>)}</div>
  <section className="lesson-content">{loading?<div className="loading-inline">Loading the static lesson assets…</div>:<>
   {tab==='summary'&&<SummaryTab summary={summary} guide={guide} lesson={l}/>} 
   {tab==='transcript'&&<TranscriptTab transcript={transcript} lesson={l}/>} 
   {tab==='mastery'&&<MasteryTab guide={guide}/>} 
   {tab==='reflection'&&<ReflectionTab guide={guide}/>} 
   {tab==='quiz'&&<QuizTab guide={guide} lesson={l} recordQuiz={recordQuiz} notify={notify} active={quizActive} setActive={setQuizActive} existing={state.quiz[l.id]}/>} 
   {tab==='readings'&&<ReadingsTab readings={readings} lesson={l} course={c}/>} 
  </>}</section>
  <div className="lesson-pager">{prev?<a href={'#/lesson/'+prev.id}><ArrowRight className="flip" size={18}/> Previous</a>:<span/>}{next?<a href={'#/lesson/'+next.id}>Next lecture <ArrowRight size={18}/></a>:<a href="#/learn">Course path <ArrowRight size={18}/></a>}</div>
 </div>;
}

function ContentPending({type='study guide'}){return <div className="content-pending"><Clock size={34}/><h3>Static {type} not curated yet.</h3><p>This page will never generate canonical lesson content on demand. The transcript, summary, questions, reflections, quiz, and readings are being researched once, reviewed, and committed as versioned files.</p></div>}
function SummaryTab({summary,guide,lesson}){return <div className="reading-column"><div className="content-label">STATIC SUMMARY</div>{summary?<><h2>{lesson.title}</h2>{String(summary).split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>)}{guide?.sourceNote&&<aside className="source-note-box">{guide.sourceNote}</aside>}{guide?.keyIdeas?.length>0&&<><h2>Key ideas</h2><div className="key-ideas">{guide.keyIdeas.map((x,i)=><article key={i}><span>{i+1}</span><div><h3>{x.title}</h3><p>{x.explanation}</p></div></article>)}</div></>}</>:<ContentPending type="summary"/>}</div>}
function TranscriptTab({transcript,lesson}){return <div className="reading-column"><div className="content-label">STATIC TRANSCRIPT</div>{transcript?<><h2>{lesson.title}</h2><pre className="transcript-text">{transcript}</pre></>:<ContentPending type="transcript"/>}</div>}
function MasteryTab({guide}){return <div className="reading-column"><div className="content-label">CONTENT MASTERY</div>{guide?.mastery?.length?<><h2>Can you explain it without looking?</h2><p className="muted">Retrieve first. Then open the answer.</p>{guide.mastery.map((m,i)=><details className="mastery-card" key={i}><summary><span>{i+1}</span>{m.question}</summary><p>{m.answer}</p></details>)}</>:<ContentPending type="mastery set"/>}</div>}
function ReflectionTab({guide}){return <div className="reading-column"><div className="content-label">REFLECTION</div>{guide?.reflection?.length?<><h2>Bring the lecture into dialogue with your life.</h2><div className="reflection-list">{guide.reflection.map((q,i)=><article key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{q}</p></article>)}</div><p className="fineprint">Reflection responses are intentionally not stored here. Use whatever private or communal practice serves you best.</p></>:<ContentPending type="reflection set"/>}</div>}
function ReadingsTab({readings,lesson,course}){return <div className="reading-column"><div className="content-label">READINGS & SOURCES</div><h2>Read alongside the lecture.</h2>{readings.length?<div className="reading-list">{readings.map((r,i)=><a key={i} href={ext(r.url)} target="_blank" rel="noreferrer"><div><small>{r.kind||'Reading'}</small><h3>{r.title}</h3><p>{r.access||'Open source'}</p></div><ExternalLink size={18}/></a>)}</div>:<ContentPending type="reading list"/>}<a className="source-link" href={ext(lesson.url||course.url)} target="_blank" rel="noreferrer">Original lecture source <ExternalLink size={15}/></a></div>}
function QuizTab({guide,lesson,recordQuiz,notify,active,setActive,existing}){
 const q=guide?.quiz||[];const[answers,setAnswers]=useState({}),[submitted,setSubmitted]=useState(false);
 useEffect(()=>{setAnswers({});setSubmitted(false);setActive(false)},[lesson.id]);
 if(!q.length)return <ContentPending type="quiz"/>;
 function submit(){const mistakes=[];let correct=0;q.forEach((x,i)=>{if(answers[i]===x.answer)correct++;else mistakes.push(i)});recordQuiz(lesson.id,correct,q.length,mistakes);setSubmitted(true);notify(`${correct} / ${q.length} correct`)}
 if(!active&&!submitted)return <div className="quiz-start"><Target size={50}/><h2>{q.length}-question mastery quiz</h2><p>Everything here is bundled static content—no quiz is generated while you study.</p>{existing&&<p className="muted">Best score: {existing.best}/{existing.total}</p>}<button className="button primary" onClick={()=>setActive(true)}>Start quiz <ArrowRight size={18}/></button></div>;
 return <div className="quiz-list"><div className="content-label">MASTERY QUIZ</div>{q.map((x,i)=><article className="quiz-question" key={i}><span className="question-number">{i+1}</span><h3>{x.question}</h3><div>{x.options.map((o,j)=>{const selected=answers[i]===j,correct=submitted&&j===x.answer,wrong=submitted&&selected&&j!==x.answer;return <button disabled={submitted} className={(selected?'selected ':'')+(correct?'correct ':'')+(wrong?'wrong':'')} onClick={()=>setAnswers(a=>({...a,[i]:j}))} key={j}><Circle size={16} fill={selected?'currentColor':'none'}/>{o}</button>})}</div>{submitted&&<p className="quiz-explanation">{x.explanation}</p>}</article>)}{!submitted?<button className="button primary quiz-submit" disabled={Object.keys(answers).length<q.length} onClick={submit}>Check answers</button>:<button className="button outline quiz-submit" onClick={()=>{setAnswers({});setSubmitted(false);setActive(true)}}>Try again</button>}</div>;
}

createRoot(document.getElementById('root')).render(<App/>);
