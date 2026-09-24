(() => {
  const STORE='mdiv-companion-v2';
  let lastGuide=null;
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const response=await nativeFetch(...args);
    const url=String(args[0] instanceof Request?args[0].url:args[0]);
    if(url.includes('/api/ai-study')&&response.ok){
      response.clone().json().then(data=>{lastGuide=data}).catch(()=>{});
    }
    return response;
  };

  function escapeHtml(s=''){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function addSummaryTab(){
    const tabs=document.querySelector('.study-tabs');
    if(!tabs||tabs.querySelector('[data-summary-addon]')||tabs.querySelector('[data-tab="summary"]'))return;
    const transcript=tabs.querySelector('[data-tab="transcript"]');
    const btn=document.createElement('button');btn.className='study-tab';btn.dataset.summaryAddon='1';btn.textContent='Summary';
    tabs.insertBefore(btn,transcript||tabs.children[1]||null);
    btn.addEventListener('click',()=>{
      tabs.querySelectorAll('.study-tab').forEach(x=>x.classList.toggle('active',x===btn));
      const panel=document.getElementById('study-panel');if(!panel)return;
      if(!lastGuide?.summary){panel.innerHTML='<div class="empty"><strong>No study guide yet.</strong><br><br>Build the study guide from Overview first.</div>';return}
      const paras=Array.isArray(lastGuide.summary)?lastGuide.summary:[lastGuide.summary];
      panel.innerHTML=`<div class="eyebrow">AI SUMMARY</div><h2>What this lecture is doing</h2>${paras.filter(Boolean).map(p=>`<p class="serif">${escapeHtml(p)}</p>`).join('')}`;
    });
  }

  function addCourseComplete(){
    const match=location.hash.match(/^#\/course\/(\d+)/);const hero=document.querySelector('.course-hero');
    if(!match||!hero||hero.querySelector('[data-course-complete]'))return;
    const courseId=Number(match[1]);
    let saved;try{saved=JSON.parse(localStorage.getItem(STORE)||'null')}catch{}
    if(!saved?.profiles)return;
    const active=saved.active||'dalmo';const done=!!saved.profiles[active]?.courses?.[courseId];
    const btn=document.createElement('button');btn.className='button white';btn.dataset.courseComplete='1';btn.style.marginTop='14px';btn.textContent=done?'✓ Course complete':'Mark course complete';
    hero.appendChild(btn);
    btn.addEventListener('click',()=>{
      let s;try{s=JSON.parse(localStorage.getItem(STORE)||'null')}catch{}
      if(!s?.profiles)return;const who=s.active||'dalmo';s.profiles[who].courses=s.profiles[who].courses||{};s.profiles[who].courses[courseId]=!s.profiles[who].courses[courseId];localStorage.setItem(STORE,JSON.stringify(s));location.reload();
    });
  }

  function enhance(){addSummaryTab();addCourseComplete()}
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(enhance,0));
  enhance();
})();
