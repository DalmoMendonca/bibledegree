(() => {
  const courses = (window.CURRICULUM || []).map((c, i) => ({ ...c, id: i }));
  const app = document.getElementById('app');
  const STORE = 'mdiv-companion-v2';
  const categories = [...new Set(courses.map(c => c.category))];

  const defaultProfile = name => ({
    name,
    lessons: {},
    courses: Object.fromEntries(courses.filter(c => c.completed).map(c => [c.id, true])),
    quizScores: {},
    notes: {}
  });

  let state = load();
  let ui = { search: '', category: 'All', courseData: new Map(), tab: 'overview', quizAnswers: {} };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (saved?.profiles?.dalmo && saved?.profiles?.viv) return saved;
    } catch {}
    return { active: 'dalmo', profiles: { dalmo: defaultProfile('Dalmo'), viv: defaultProfile('Viv') } };
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
  function profile() { return state.profiles[state.active]; }
  function esc(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function attr(s='') { return esc(s); }
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] === 'course') return { view:'course', courseId:Number(parts[1]) };
    if (parts[0] === 'lecture') return { view:'lecture', courseId:Number(parts[1]), lessonId:Number(parts[2]) };
    return { view:'home' };
  }
  function go(path='') { location.hash = path ? `#/${path}` : '#/'; }
  function lessonKey(courseId, lessonId) { return `${courseId}:${lessonId}`; }
  function completedLessons(courseId) {
    const p = profile();
    return Object.entries(p.lessons).filter(([k,v]) => v && k.startsWith(`${courseId}:`)).length;
  }
  function totalCompletedCourses() { return courses.filter(c => profile().courses[c.id]).length; }
  function completedHours() { return courses.filter(c => profile().courses[c.id]).reduce((s,c)=>s+(Number(c.hours)||0),0); }
  function totalHours() { return courses.reduce((s,c)=>s+(Number(c.hours)||0),0); }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const el=document.createElement('div'); el.className='toast'; el.textContent=message; document.body.appendChild(el);
    setTimeout(()=>el.remove(),2200);
  }
  function youtubeId(url='') {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0];
      return u.searchParams.get('v') || (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : '');
    } catch { return ''; }
  }
  function sourceLabel(url='') {
    if (/youtube|youtu\.be/.test(url)) return 'Video course';
    if (/biblicaltraining/.test(url)) return 'BiblicalTraining';
    if (/yale|itunes/.test(url)) return 'Open course';
    return 'Course source';
  }

  function shell(content, active='path') {
    app.innerHTML = `
      <div class="shell">
        <header class="topbar"><div class="topbar-inner">
          <a class="brand" href="#/"><span class="brand-mark">M</span><span>MDiv</span></a>
          <div class="grow"></div>
          <div class="profile-switch" aria-label="Learner">
            <button class="profile ${state.active==='dalmo'?'active':''}" data-profile="dalmo" title="Dalmo">D</button>
            <button class="profile ${state.active==='viv'?'active':''}" data-profile="viv" title="Viv">V</button>
          </div>
        </div></header>
        <main class="main">${content}</main>
        <nav class="bottomnav" aria-label="Primary">
          <a class="navitem ${active==='path'?'active':''}" href="#/">PATH</a>
          <a class="navitem ${active==='study'?'active':''}" href="${location.hash || '#/'}">STUDY</a>
          <a class="navitem" href="#/" data-progress-jump>PROGRESS</a>
        </nav>
      </div>`;
    document.querySelectorAll('[data-profile]').forEach(btn => btn.addEventListener('click', () => {
      state.active = btn.dataset.profile; save(); render();
    }));
    document.querySelector('[data-progress-jump]')?.addEventListener('click', e => {
      e.preventDefault(); go(); setTimeout(()=>document.querySelector('.stat-strip')?.scrollIntoView({behavior:'smooth'}),40);
    });
  }

  function home() {
    const p = profile();
    const doneCourses=totalCompletedCourses(), doneHours=completedHours(), hours=totalHours();
    const filtered = courses.filter(c => {
      const q=ui.search.trim().toLowerCase();
      return (ui.category==='All'||c.category===ui.category) && (!q || `${c.title} ${c.professor} ${c.equiv}`.toLowerCase().includes(q));
    });
    const grouped = categories.map(category => [category, filtered.filter(c=>c.category===category)]).filter(([,arr])=>arr.length);
    shell(`
      <section class="hero">
        <div>
          <div class="eyebrow">A FREE SEMINARY COMPANION</div>
          <h1>Build an MDiv-scale education, one lecture at a time.</h1>
          <p>${esc(p.name)}, this path turns ${courses.length} open courses into a coherent ${hours.toLocaleString()}-hour program with lecture pages, transcripts, AI study guides, questions, quizzes, readings, and your own progress.</p>
        </div>
        <div class="stat-strip">
          <div class="stat"><strong>${doneCourses}/${courses.length}</strong><span>courses</span></div>
          <div class="stat"><strong>${doneHours}h</strong><span>completed</span></div>
          <div class="stat"><strong>${Math.round(doneHours/Math.max(1,hours)*100)}%</strong><span>degree path</span></div>
        </div>
      </section>
      <div class="toolbar">
        <input class="search" type="search" placeholder="Search courses, professors, subjects…" value="${attr(ui.search)}" aria-label="Search curriculum" />
        <button class="chip ${ui.category==='All'?'active':''}" data-cat="All">All</button>
        ${categories.map(c=>`<button class="chip ${ui.category===c?'active':''}" data-cat="${attr(c)}">${esc(shortCategory(c))}</button>`).join('')}
      </div>
      ${grouped.length ? grouped.map(([cat,list])=>`
        <section class="section">
          <div class="section-head"><h2 class="section-title">${esc(cat)}</h2><span class="section-count">${list.length} courses</span></div>
          <div class="course-grid">${list.map(courseCard).join('')}</div>
        </section>`).join('') : `<div class="empty">No courses match that search.</div>`}
    `,'path');
    const search=document.querySelector('.search');
    search?.addEventListener('input', e => { ui.search=e.target.value; home(); requestAnimationFrame(()=>{const s=document.querySelector('.search');s?.focus();s?.setSelectionRange(ui.search.length,ui.search.length)}); });
    document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{ui.category=b.dataset.cat;home()}));
  }
  function shortCategory(c){
    if(c==='Philosophy, Ethics, etc.') return 'Philosophy';
    if(c==='Theology & History') return 'Theology';
    return c;
  }
  function courseCard(c) {
    const done=!!profile().courses[c.id];
    return `<a class="course-card ${done?'done':''}" href="#/course/${c.id}">
      <span class="status-dot">${done?'✓':'→'}</span>
      <div class="course-meta"><span>${esc(c.equiv||c.category)}</span><span>·</span><span>${c.hours||'—'}h</span></div>
      <h3>${esc(c.title)}</h3>
      <div class="prof">${esc(c.professor||'Source to be selected')}</div>
      <div class="progress" aria-label="${done?'Complete':'Not complete'}"><i style="width:${done?100:0}%"></i></div>
    </a>`;
  }

  async function getCourseData(c) {
    if (ui.courseData.has(c.id)) return ui.courseData.get(c.id);
    if (!c.url) return { kind:'none', title:c.title, lessons:[], resources:[] };
    try {
      const r=await fetch(`/api/source-course?url=${encodeURIComponent(c.url)}`);
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Could not read course');
      ui.courseData.set(c.id,d); return d;
    } catch(e) { return {kind:'error',title:c.title,lessons:[],resources:[],error:e.message}; }
  }

  function coursePage(courseId) {
    const c=courses[courseId];
    if(!c){go();return}
    shell(`
      <section class="course-hero">
        <a class="back" href="#/">← Degree path</a>
        <h1>${esc(c.title)}</h1>
        <p>${esc(c.professor||'Open course')} · ${c.hours||'—'} hours</p>
        <div class="course-hero-meta">
          <span class="badge">${esc(c.category)}</span><span class="badge">${esc(c.equiv||'Elective')}</span><span class="badge">${esc(sourceLabel(c.url))}</span>
        </div>
      </section>
      <div class="path-wrap">
        ${c.note?`<div class="path-note">${esc(c.note)}</div>`:''}
        <div class="panel" id="course-resources"><h2>Course resources</h2><div class="loading">Reading the original course source…</div></div>
        <section class="section"><div class="section-head"><h2 class="section-title">Lecture path</h2><span class="section-count" id="lesson-count"></span></div><div id="lesson-path"><div class="loading">Building the lecture path…</div></div></section>
      </div>
    `,'study');
    hydrateCourse(c);
  }

  async function hydrateCourse(c){
    const data=await getCourseData(c);
    const lessons=data.lessons||[];
    const resources=data.resources||[];
    document.getElementById('lesson-count').textContent=lessons.length?`${lessons.length} lectures`:'Source course';
    const path=document.getElementById('lesson-path');
    const completed=completedLessons(c.id);
    if(lessons.length){
      path.className='lesson-path';
      path.innerHTML=lessons.map((l,i)=>{
        const key=lessonKey(c.id,i), done=!!profile().lessons[key], current=!done && i===completed;
        const payload=encodeURIComponent(JSON.stringify(l));
        return `<div class="lesson-row"><a class="lesson-node ${done?'complete':current?'current':''}" href="#/lecture/${c.id}/${i}" data-lesson="${payload}"><span class="node-disc">${done?'✓':i+1}</span><span class="node-copy"><strong>${esc(l.title||`Lecture ${i+1}`)}</strong><small>${done?'Complete':current?'Continue':'Lecture'}</small></span></a></div>`;
      }).join('');
      path.querySelectorAll('[data-lesson]').forEach(a=>a.addEventListener('click',()=>sessionStorage.setItem(`mdiv-lesson:${c.id}:${a.href.split('/').pop()}`,decodeURIComponent(a.dataset.lesson))));
    } else {
      path.innerHTML=`<div class="panel empty">${data.kind==='error'?'This provider blocked automatic lecture indexing.':'This source does not expose a discrete lecture list.'}<br><br>${c.url?`<a class="button secondary" href="${attr(c.url)}" target="_blank" rel="noreferrer">Open original course ↗</a>`:'A source course still needs to be selected.'}</div>`;
    }
    const resourcePanel=document.getElementById('course-resources');
    resourcePanel.innerHTML=`<h2>Course resources</h2>
      <div class="resource-list">
        ${c.url?`<a class="resource-link" href="${attr(c.url)}" target="_blank" rel="noreferrer"><strong>Original course</strong><span>Syllabus, lectures, and provider materials ↗</span></a>`:''}
        ${resources.map(r=>`<a class="resource-link" href="${attr(r.url)}" target="_blank" rel="noreferrer"><strong>${esc(r.title||'Course reading')}</strong><span>${esc(r.kind||'Reading')} ↗</span></a>`).join('')}
        <a class="resource-link" href="https://archive.org/search?query=${encodeURIComponent(c.title+' '+(c.professor||''))}" target="_blank" rel="noreferrer"><strong>Search Internet Archive</strong><span>Look for borrowable or public-domain course texts ↗</span></a>
        <a class="resource-link" href="https://books.google.com/books?q=${encodeURIComponent(c.title+' '+(c.professor||''))}" target="_blank" rel="noreferrer"><strong>Search Google Books</strong><span>Previews and full-view editions when available ↗</span></a>
      </div>`;
  }

  async function lecturePage(courseId, lessonId){
    const c=courses[courseId]; if(!c){go();return}
    let lesson=null;
    try { lesson=JSON.parse(sessionStorage.getItem(`mdiv-lesson:${courseId}:${lessonId}`)||'null'); } catch {}
    if(!lesson){ const d=await getCourseData(c); lesson=(d.lessons||[])[lessonId]||{title:`Lecture ${lessonId+1}`,url:c.url}; }
    const key=lessonKey(courseId,lessonId), videoId=lesson.videoId||youtubeId(lesson.url||''), done=!!profile().lessons[key];
    ui.tab='overview'; ui.quizAnswers={};
    shell(`
      <div class="lecture-layout">
        <div>
          <article class="video-card">
            <div class="video-frame">${videoId?`<iframe src="https://www.youtube-nocookie.com/embed/${attr(videoId)}?rel=0" title="${attr(lesson.title||'Lecture')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`:`<div class="video-fallback"><div class="eyebrow">LECTURE ${lessonId+1}</div><h2>${esc(lesson.title||`Lecture ${lessonId+1}`)}</h2><p>This provider does not expose an embeddable player.</p>${lesson.url?`<a class="button white" href="${attr(lesson.url)}" target="_blank" rel="noreferrer">Open lecture ↗</a>`:''}</div>`}</div>
            <div class="video-copy">
              <div class="lecture-kicker">${esc(c.title)} · Lecture ${lessonId+1}</div>
              <h1 class="lecture-title">${esc(lesson.title||`Lecture ${lessonId+1}`)}</h1>
              <div class="lecture-actions">
                <button class="button ${done?'secondary':'primary'}" id="complete-lesson">${done?'✓ Lecture complete':'Mark lecture complete'}</button>
                ${lesson.url?`<a class="button secondary" href="${attr(lesson.url)}" target="_blank" rel="noreferrer">Source ↗</a>`:''}
              </div>
            </div>
          </article>
          <div class="study-tabs" id="tabs">
            <button class="study-tab active" data-tab="overview">Overview</button>
            <button class="study-tab" data-tab="transcript">Transcript</button>
            <button class="study-tab" data-tab="mastery">Mastery</button>
            <button class="study-tab" data-tab="reflection">Reflection</button>
            <button class="study-tab" data-tab="quiz">Quiz</button>
          </div>
          <div id="study-panel" class="panel"></div>
        </div>
        <aside class="study-column">
          <div class="panel">
            <div class="eyebrow">YOUR NOTES</div><h2>Think on the page.</h2>
            <textarea class="notes" id="notes" placeholder="Questions, connections, exegetical observations, disagreements, prayerful reflections…">${esc(profile().notes[key]||'')}</textarea>
            <button class="button secondary" id="save-notes">Save notes</button>
          </div>
        </aside>
      </div>
    `,'study');
    const lectureState={course:c,lesson,courseId,lessonId,key,videoId,transcript:'',guide:null,loadingTranscript:false,loadingGuide:false};
    bindLecture(lectureState);
    renderStudy(lectureState);
  }

  function bindLecture(ls){
    document.getElementById('complete-lesson')?.addEventListener('click',()=>{
      profile().lessons[ls.key]=!profile().lessons[ls.key]; save(); toast(profile().lessons[ls.key]?'Lecture completed':'Lecture reopened'); lecturePage(ls.courseId,ls.lessonId);
    });
    document.getElementById('save-notes')?.addEventListener('click',()=>{
      profile().notes[ls.key]=document.getElementById('notes').value; save(); toast('Notes saved');
    });
    document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{ui.tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===ui.tab));renderStudy(ls)}));
  }

  function renderStudy(ls){
    const panel=document.getElementById('study-panel'); if(!panel)return;
    if(ui.tab==='overview'){
      panel.innerHTML=`<div class="eyebrow">STUDY COMPANION</div><h2>Turn watching into learning.</h2><p class="serif">Load the lecture transcript, then generate a grounded study guide. The guide gives you a substantive summary, content-mastery questions with answers, reflection prompts, and a 12-question comprehension quiz.</p><div class="lecture-actions"><button class="button primary" id="generate-guide">Build study guide</button><button class="button secondary" id="load-transcript">Load transcript</button></div>${ls.guide?`<div class="result">Study guide ready. Use the tabs above.</div>`:''}`;
      document.getElementById('load-transcript')?.addEventListener('click',()=>loadTranscript(ls,true));
      document.getElementById('generate-guide')?.addEventListener('click',()=>generateGuide(ls));
      return;
    }
    if(ui.tab==='transcript'){
      if(ls.loadingTranscript){panel.innerHTML='<div class="loading">Retrieving transcript…</div>';return}
      if(!ls.transcript){panel.innerHTML=`<div class="eyebrow">TRANSCRIPT</div><h2>Lecture text</h2><p class="serif">${ls.videoId?'Captions are loaded directly from the lecture when available.':'For web-based courses, the companion extracts the readable lesson text when the provider exposes it.'}</p><button class="button primary" id="load-transcript">Load transcript</button>`;document.getElementById('load-transcript')?.addEventListener('click',()=>loadTranscript(ls,true));return}
      panel.innerHTML=`<div class="eyebrow">TRANSCRIPT</div><h2>Lecture text</h2><div class="serif transcript-text">${esc(ls.transcript)}</div>`;return;
    }
    if(!ls.guide){panel.innerHTML=`<div class="empty"><strong>No study guide yet.</strong><br><br><button class="button primary" id="generate-guide">Build study guide</button></div>`;document.getElementById('generate-guide')?.addEventListener('click',()=>generateGuide(ls));return}
    if(ui.tab==='mastery'){
      panel.innerHTML=`<div class="eyebrow">CONTENT MASTERY</div><h2>Can you explain it?</h2>${(ls.guide.mastery||[]).map((q,i)=>`<details class="question"><summary><strong>${i+1}. ${esc(q.question)}</strong></summary><p class="serif">${esc(q.answer)}</p></details>`).join('')}`;return;
    }
    if(ui.tab==='reflection'){
      panel.innerHTML=`<div class="eyebrow">REFLECTION</div><h2>Integrate, critique, apply.</h2>${(ls.guide.reflection||[]).map((q,i)=>`<div class="question"><strong>${i+1}. ${esc(q)}</strong></div>`).join('')}`;return;
    }
    if(ui.tab==='quiz') renderQuiz(ls);
  }

  async function loadTranscript(ls, switchTab=false){
    if(ls.transcript){if(switchTab){ui.tab='transcript';syncTabs();renderStudy(ls)}return ls.transcript}
    ls.loadingTranscript=true;if(switchTab){ui.tab='transcript';syncTabs()}renderStudy(ls);
    try{
      const endpoint=ls.videoId?`/api/youtube-transcript?videoId=${encodeURIComponent(ls.videoId)}`:`/api/page-text?url=${encodeURIComponent(ls.lesson.url||ls.course.url)}`;
      const r=await fetch(endpoint);const d=await r.json();if(!r.ok)throw new Error(d.error||'Transcript unavailable');
      ls.transcript=d.text||'';
      if(!ls.transcript)throw new Error('Transcript unavailable');
    }catch(e){toast(e.message||'Transcript unavailable')}
    ls.loadingTranscript=false;renderStudy(ls);return ls.transcript;
  }
  function syncTabs(){document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===ui.tab))}

  async function generateGuide(ls){
    if(ls.loadingGuide)return;ls.loadingGuide=true;
    const panel=document.getElementById('study-panel'); panel.innerHTML='<div class="loading">Reading the lecture and building your study guide…</div>';
    const transcript=await loadTranscript(ls,false);
    if(!transcript){ls.loadingGuide=false;ui.tab='transcript';syncTabs();renderStudy(ls);return}
    try{
      const r=await fetch('/api/ai-study',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({courseTitle:ls.course.title,lectureTitle:ls.lesson.title||`Lecture ${ls.lessonId+1}`,transcript})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not generate study guide');
      ls.guide=d; ui.tab='overview'; syncTabs(); renderStudy(ls); toast('Study guide ready');
    }catch(e){panel.innerHTML=`<div class="empty"><strong>${esc(e.message||'Could not generate study guide')}</strong><br><br><button class="button primary" id="generate-guide">Try again</button></div>`;document.getElementById('generate-guide')?.addEventListener('click',()=>generateGuide(ls))}
    ls.loadingGuide=false;
  }

  function renderQuiz(ls){
    const quiz=ls.guide.quiz||[], answers=ui.quizAnswers;
    const answered=Object.keys(answers).length, score=quiz.reduce((s,q,i)=>s+(answers[i]===q.answerIndex?1:0),0);
    const finished=quiz.length>0&&answered===quiz.length;
    const panel=document.getElementById('study-panel');
    panel.innerHTML=`<div class="eyebrow">COMPREHENSIVE QUIZ</div><h2>Retrieval practice</h2>${finished?`<div class="result">Score: ${score}/${quiz.length} (${Math.round(score/quiz.length*100)}%)</div>`:''}${quiz.map((q,i)=>`<div class="question"><strong>${i+1}. ${esc(q.question)}</strong>${(q.options||[]).map((o,j)=>{const chosen=answers[i]===j, reveal=answers[i]!==undefined;const cls=reveal&&j===q.answerIndex?'correct':chosen&&j!==q.answerIndex?'wrong':chosen?'selected':'';return `<button class="answer-option ${cls}" data-q="${i}" data-a="${j}">${esc(o)}</button>`}).join('')}${answers[i]!==undefined?`<p class="serif">${esc(q.explanation||'')}</p>`:''}</div>`).join('')}`;
    panel.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{ui.quizAnswers[Number(b.dataset.q)]=Number(b.dataset.a);if(Object.keys(ui.quizAnswers).length===quiz.length){profile().quizScores[ls.key]=quiz.reduce((s,q,i)=>s+(ui.quizAnswers[i]===q.answerIndex?1:0),0);save()}renderQuiz(ls)}));
  }

  function render(){
    const r=route();
    if(r.view==='course') return coursePage(r.courseId);
    if(r.view==='lecture') return lecturePage(r.courseId,r.lessonId);
    return home();
  }

  window.addEventListener('hashchange',render);
  if(!location.hash) history.replaceState(null,'','#/');
  render();
})();
