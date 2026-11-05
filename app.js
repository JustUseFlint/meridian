// Meridian v3 — gem progression, themed adaptive sessions, confidence-gated typing
const $=s=>document.querySelector(s), app=$('#app'), sheet=$('#sheet');
const KEY='meridian.v3', TKEY='meridian.theme', CONFIRM=.80, RELEASE=.55, MIN_CONFIRM=28;
// Gem-tinted type colours
TYPES.forEach(t=>{const g=GEMS[t.id];t.col=`hsl(${g.h[0]} ${Math.max(g.sat,40)}% 58%)`;t.bg=`hsla(${g.h[0]},${g.sat}%,55%,.13)`;t.gem=g.name});
// ---------- item bank ----------
ITEMS.forEach(i=>i.th=i.th||'core');
QUIZZES.forEach(q=>q.items.forEach(i=>i.th=q.id));
const ALL=[...ITEMS,...QUIZZES.flatMap(q=>q.items),...BANK];
const byId=Object.fromEntries(ALL.map(i=>[i.id,i]));
const themeById=Object.fromEntries(THEMES.map(t=>[t.id,t]));
let st=JSON.parse(localStorage.getItem(KEY)||'null')||{v:3,sessions:[],shards:[],typeLock:null,practice:{}};
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const allAns=()=>st.sessions.flatMap(x=>x.ans).concat(st.active?st.active.ans:[]);
st.done=true; // research view compatibility
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
// ---------- scoring ----------
const RANKV=[1,.4,-.4,-1];
function score(hist=allAns()){
 const sum={},wt={};DK.forEach(d=>{sum[d]=0;wt[d]=.6});
 for(const h of hist){const it=byId[h.id];if(!it)continue;
  if(it.t==='S'){for(const[d,w]of Object.entries(it.o[h.a].w)){sum[d]+=Math.sign(w)*Math.min(1,Math.abs(w)+.25)*Math.abs(w);wt[d]+=Math.abs(w)}}
  else if(it.t==='K'){h.a.forEach((oi,r)=>{for(const[d,w]of Object.entries(it.o[oi].w)){sum[d]+=RANKV[r]*w*.8;wt[d]+=Math.abs(w)*.45}})}
  else{const x=it.t==='R'?h.a:h.a/2;for(const[d,w]of Object.entries(it.w)){sum[d]+=x*w;wt[d]+=Math.abs(w)}}}
 const s={},u={};DK.forEach(d=>{s[d]=Math.max(-1,Math.min(1,sum[d]/wt[d]*1.35));u[d]=1/Math.sqrt(1+2.2*(wt[d]-.6))});
 return{s,u};
}
const confOf=u=>Math.round(100*DK.reduce((a,d)=>a+(1-u[d]),0)/DK.length);
function dist(s,t){let d=0;POL.forEach((k,i)=>d+=1.3*(s[k]-t.c[i])**2);B5.forEach((k,i)=>d+=.8*(s[k]-t.c[4+i])**2);MOR.forEach((k,i)=>d+=.6*(s[k]-(t.m[i]*2-1))**2);return d}
// Probability of each type = share of 600 plausible "you"s (sampled from your scores ± uncertainty) nearest that type
const probCache={};
function typeProbs(s,u,key){if(key&&probCache[key])return probCache[key];let x=hash(key||'p');const rnd=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};
 const g=()=>{let a=0;while(!a)a=rnd();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*rnd())};
 const cnt={};TYPES.forEach(t=>cnt[t.id]=0);const N=600;
 for(let i=0;i<N;i++){const v={};DK.forEach(d=>v[d]=Math.max(-1,Math.min(1,s[d]+g()*u[d]*.6)));let b=null,bd=1e9;for(const t of TYPES){const dd=dist(v,t);if(dd<bd){bd=dd;b=t}}cnt[b.id]++}
 const r=TYPES.map(t=>({t,p:cnt[t.id]/N})).sort((a,b)=>b.p-a.p);if(key)probCache[key]=r;return r}
function matchTypes(s){return TYPES.map(t=>({t,d:dist(s,t)})).sort((a,b)=>a.d-b.d).map(r=>({...r,fit:Math.round(100*Math.exp(-r.d/6))}))}
function model(hist=allAns()){const{s,u}=score(hist),n=hist.length,probs=typeProbs(s,u,'h'+hash(JSON.stringify(hist)));
 return{s,u,n,probs,conf:confOf(u)}}
// ---------- type status (confidence-gated) ----------
function typeStatus(M=model()){const top=M.probs[0];
 if(st.typeLock){const p=(M.probs.find(r=>r.t.id===st.typeLock)||{p:0}).p;
  if(p<RELEASE&&M.n>=MIN_CONFIRM){st.typeLock=null;st.released=(st.released||0)+1;save()} else return{state:'confirmed',t:tById(st.typeLock),p,M}}
 if(top.p>=CONFIRM&&M.n>=MIN_CONFIRM){st.typeLock=top.t.id;st.lockedAt=Date.now();save();return{state:'confirmed',t:top.t,p:top.p,M,justNow:true}}
 return{state:'forming',t:top.t,p:top.p,M}}
// ---------- unlock map ----------
const doneThemes=()=>new Set(st.sessions.map(x=>x.theme));
const SHARDS=[
 {k:'overview',name:'Profile overview',feat:'Your forming portrait, communication and work style',need:'Finish Foundations',ok:c=>c.n>=1},
 {k:'compass',name:'Political compass',feat:'Economic × Authority chart, four-axis labels and nearest ideologies',need:'Finish Foundations',ok:c=>c.n>=1},
 {k:'traits',name:'Big Five traits',feat:'Trait bars with confidence bands, facets and tips',need:'Complete 2 sessions',ok:c=>c.n>=2},
 {k:'culture',name:'Culture × Scope compass',feat:'Progressive–Traditional × Nationalist–Globalist chart',need:'A Power & Policy or Nation & World session, or 4 sessions',ok:c=>c.th.has('politics')||c.th.has('nation')||c.n>=4},
 {k:'morals',name:'Moral foundations',feat:'Six-foundation radar and what drives your judgments',need:'A Moral Dilemmas or Meaning session, or 4 sessions',ok:c=>c.th.has('morals')||c.th.has('faith')||c.n>=4},
 {k:'values',name:'Values circle',feat:'Ten Schwartz values derived from your profile',need:'Reach 55% overall confidence',ok:c=>c.conf>=55},
 {k:'relationships',name:'Relationships',feat:'Fit with all 16 types at work, in love, friendship and conflict',need:'A Love or Social session, and 50% confidence',ok:c=>(c.th.has('romance')||c.th.has('social'))&&c.conf>=50},
 {k:'careers',name:'Careers & income',feat:'Best and worst career fits, environment and income estimates',need:'A Work & Ambition session',ok:c=>c.th.has('career')},
 {k:'growth',name:'Growth tools',feat:'Blind spots, stress profile and a weekly practice tracker',need:'A Stress or Curiosity session',ok:c=>c.th.has('stress')||c.th.has('mind')},
 {k:'confirm',name:'Type confirmed',feat:'Your gem, your type and how rare it is',need:`Reach ${CONFIRM*100}% confidence in one type`,ok:c=>!!c.lock},
 {k:'famous',name:'Famous matches',feat:'Public figures who share your tendencies, plotted against you',need:'Confirm your type and complete 4 sessions',ok:c=>!!c.lock&&c.n>=4},
 {k:'complete',name:'Complete gem',feat:'Personal research insights and your shareable gem card',need:'Confirmed type, 70% confidence and 5 different themes',ok:c=>!!c.lock&&c.conf>=70&&c.th.size>=5}
];
const has=k=>st.shards.includes(SHARDS.findIndex(x=>x.k===k));
function evalShards(){const M=model(),ts=typeStatus(M),c={n:st.sessions.length,th:doneThemes(),conf:M.conf,lock:st.typeLock};const gained=[];
 SHARDS.forEach((x,i)=>{if(!st.shards.includes(i)&&x.ok(c)){st.shards.push(i);gained.push(i)}});save();return{gained,ts,M}}
const gemOf=()=>st.typeLock||'prism';
const myGem=(o={})=>gemSVG(gemOf(),{unlocked:new Set(st.shards),...o});
function mascotSVG(t,size=120){return gemSVG(t.id,{unlocked:'all',size})}
function islandSVG(t){return gemSVG(t.id,{unlocked:'all',size:120})}
// ---------- adaptive selection ----------
function themePool(th){const used=new Set(allAns().map(h=>h.id));return ALL.filter(i=>!used.has(i.id)&&(th==='core'?i.th==='core':i.th===th))}
function bridgePool(th){const F=new Set(themeById[th].focus||DK),used=new Set(allAns().map(h=>h.id));return ALL.filter(i=>!used.has(i.id)&&i.th!==th&&dimsOf(i).some(d=>F.has(d)))}
function dimsOf(it){const ws={};if(it.t==='S'||it.t==='K')it.o.forEach(o=>{for(const[d,w]of Object.entries(o.w))ws[d]=Math.max(ws[d]||0,Math.abs(w))});else for(const[d,w]of Object.entries(it.w))ws[d]=Math.abs(w);const r=Object.keys(ws).sort((a,b)=>ws[b]-ws[a]);r.ws=ws;return r}
function nextItem(sess){const M=model(),{s,u}=M,th=themeById[sess.theme],F=new Set(th.focus||DK);
 let pool=themePool(sess.theme);let bridge=false;if(!pool.length){pool=bridgePool(sess.theme);bridge=true}
 pool=pool.filter(i=>!i.if||i.if(s));if(!pool.length)return null;
 const a=M.probs[0].t,b=M.probs[1].t,va=vecOf(a),vb=vecOf(b),last=sess.ans.length?byId[sess.ans[sess.ans.length-1].id].t:null;
 let best=null,bv=-1e9;
 for(const it of pool){const ws=dimsOf(it).ws;let v=0;
  for(const[d,w]of Object.entries(ws)){v+=w*u[d]*(F.has(d)?1.6:.6)+w*Math.abs(va[d]-vb[d])*.35}
  if(it.if)v+=.3; if(it.t===last)v-=.25; v+=(hash(it.id+sess.start)%100)/600;
  if(v>bv){bv=v;best=it}}
 best.__bridge=bridge;return best}
// ---------- helpers ----------
function go(r){location.hash=r}
window.addEventListener('hashchange',()=>render());
const pct=p=>Math.round(p*100)+'%';
const ago=ts=>{const d=(Date.now()-ts)/864e5;return d<1/24?'just now':d<1?Math.round(d*24)+'h ago':Math.round(d)+'d ago'};
const fmtDate=ts=>new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const DIM_THEME={econ:'politics',auth:'politics',trad:'faith',glob:'nation',O:'mind',C:'career',E:'social',A:'social',N:'stress',care:'morals',equa:'morals',prop:'career',loya:'nation',autr:'morals',puri:'faith'};
function needed(M){const a=vecOf(M.probs[0].t),b=vecOf(M.probs[1].t);const ds=DK.map(d=>({d,v:Math.abs(a[d]-b[d])*M.u[d]})).sort((x,y)=>y.v-x.v).slice(0,2);return ds.map(x=>x.d)}
function setTheme(m){document.documentElement.dataset.theme=m;localStorage.setItem(TKEY,m);document.querySelector('meta[name=theme-color]').content=m==='light'?'#F3F2F7':'#07080C'}
setTheme(localStorage.getItem(TKEY)||'dark');
const ICON={home:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',themes:'<path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z"/>',profile:'<path d="M12 3l7 6-7 12L5 9z"/>',journal:'<path d="M6 3h11a1 1 0 011 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 011-1zM9 8h6M9 12h6"/>',research:'<path d="M10 3v6L5 19a1 1 0 001 2h12a1 1 0 001-2l-5-10V3M8 3h8"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',check:'<path d="M5 12l5 5 9-10"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',back:'<path d="M19 12H5M11 6l-6 6 6 6"/>'};
const ic=(k,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const NAV=[['home','Home'],['themes','Themes'],['profile','Profile'],['journal','Journal'],['research','Research'],['settings','Settings']];
function shell(on,body){app.innerHTML=`<div class="shell"><nav class="rail" aria-label="Main"><a class="logo" href="#home">${gemSVG(gemOf(),{unlocked:new Set(st.shards),size:30})}<span>Meridian</span></a>${NAV.map(([k,l])=>`<a href="#${k}" class="${on===k?'on':''}" ${on===k?'aria-current="page"':''}>${ic(k)}<span>${l}</span></a>`).join('')}</nav><main class="main">${body}</main></div>`}
function nav(){return ''} function topbar(){return ''}
// ---------- router ----------
function render(){const raw=location.hash.slice(1),r=raw||(st.sessions.length?'home':'intro'),[k,arg]=r.split('/');
 document.body.className='r-'+k;window.scrollTo(0,0);closeSheet(true);
 if(!st.sessions.length&&!['intro','quiz','research','settings'].includes(k)&&!(k==='done'))return intro();
 ({intro,home,themes,profile,journal,session,research:researchView,settings,quiz,done,vault}[k]||home)(arg)}
// ---------- intro ----------
function intro(){app.innerHTML=`<section class="intro"><header class="ibar"><span class="wordmark">Meridian</span><button class="ghost" onclick="go('research')">The science</button></header>
 <div class="ihero"><div class="igem">${gemSVG('prism',{unlocked:'all',size:300,cls:'float'})}</div>
 <div class="icopy"><p class="eyebrow">Personality · politics · morals</p><h1>A compass that<br><em>earns</em> its answer.</h1>
 <p class="lede">Meridian measures 15 dimensions at once and chooses every next question from what it is still unsure about. It won\u2019t name your type until it is ${CONFIRM*100}% confident, and each session you finish unlocks another shard of your gem.</p>
 <div class="cta"><button class="btn primary" onclick="startSession('core')">Begin Foundations ${ic('arrow')}</button><span class="muted">18 questions · about 6 minutes · saved on this device</span></div></div></div>
 <div class="isteps">${[['01','Adaptive','Trade-offs, sliders, scenarios and rankings, chosen live to cut your uncertainty.'],['02','Honest','You see candidate types and their odds until one passes '+CONFIRM*100+'%.'],['03','Unlocked','12 shards, 12 real features: compasses, relationships, careers, growth tools.']].map(([n,h,p])=>`<div><span>${n}</span><b>${h}</b><p>${p}</p></div>`).join('')}</div></section>`}
// ---------- sessions ----------
function startSession(th){if(!st.sessions.length&&th!=='core')th='core';
 if(st.active&&st.active.theme===th&&st.active.ans.length)return go('quiz');
 const M=model();st.active={theme:th,start:Date.now(),ans:[],n:themeById[th].n,before:{s:M.s,conf:M.conf,top:M.probs.slice(0,3).map(r=>[r.t.id,r.p]),u:M.u},insight:false};save();
 if(location.hash==='#quiz')quiz();else go('quiz')}
let rankSel=[],sliderV=0,qAnim='in';
function quiz(){const A=st.active;if(!A)return go(st.sessions.length?'themes':'intro');
 const T=themeById[A.theme];
 if(A.ans.length>=A.n)return finishSession();
 if(!A.insight&&A.ans.length===Math.floor(A.n/2))return insightView();
 const it=nextItem(A);if(!it)return finishSession();
 A.cur=it.id;const M=model(),i=A.ans.length,focusD=dimsOf(it).slice(0,2);rankSel=[];sliderV=0;
 const meters=(T.focus||['econ','auth','O','E','A','care']).slice(0,4);
 app.innerHTML=`<section class="quiz" data-item="${it.id}"><header class="qtop"><button class="ghost icon" onclick="${i?'qBack()':'quitSession()'}" aria-label="${i?'Previous question':'Leave session'}">${ic('back')}</button>
 <div class="qmeta"><b>${T.title}</b><span>${i+1} of ${A.n}</span></div><button class="ghost" onclick="quitSession()">Save &amp; exit</button></header>
 <div class="qprog" role="progressbar" aria-valuemin="0" aria-valuemax="${A.n}" aria-valuenow="${i}">${Array.from({length:A.n},(_,k)=>`<i class="${k<i?'on':k===i?'cur':''}"></i>`).join('')}</div>
 <div class="qbody ${qAnim}"><p class="qfmt">${{L:'How true is this of you?',P:'Trade-off',S:'Scenario',R:'Slide to your answer',K:'Rank all four'}[it.t]}${it.__bridge?' · bonus question from another theme':''}</p>
 <h2 class="qtext">${esc(it.q)}</h2><div class="qin">${inputFor(it)}</div></div>
 <aside class="qside"><div class="lconf"><div class="lc-head"><span>Overall confidence</span><b>${M.conf}%</b></div><span class="lbar"><i style="width:${M.conf}%"></i></span></div>
 <div class="sharpen">Now sharpening <b>${focusD.map(d=>DIMS[d].name).join(' & ')}</b></div>
 <div class="lmeters">${meters.map(d=>`<div><span>${DIMS[d].name}</span><span class="lbar sm"><i style="width:${Math.round((1-M.u[d])*100)}%"></i></span></div>`).join('')}</div>
 <div class="cands"><p class="eyebrow">Leading candidates</p>${M.probs.slice(0,3).map(r=>`<div class="cand">${gemSVG(r.t.id,{unlocked:new Set(st.shards.length?st.shards:[0,1,2]),size:28})}<span>${r.t.name}</span><b>${pct(r.p)}</b></div>`).join('')}</div></aside></section>`;
 qAnim='in';}
function inputFor(it){
 if(it.t==='L')return `<div class="likert">${['Strongly disagree','Disagree','Unsure','Agree','Strongly agree'].map((l,k)=>`<button class="opt lk${k}" onclick="answer(${k-2})"><i></i>${l}</button>`).join('')}</div>`;
 if(it.t==='P')return `<div class="trade"><div class="tcard a"><span>A</span>${esc(it.a)}</div><div class="tcard b"><span>B</span>${esc(it.b)}</div></div>
  <div class="tscale" role="group" aria-label="Choose between A and B">${[['A',-2],['Lean A',-1],['Torn',0],['Lean B',1],['B',2]].map(([l,v])=>`<button class="opt" onclick="answer(${v})">${l}</button>`).join('')}</div>`;
 if(it.t==='S')return `<div class="scen">${it.o.map((o,k)=>`<button class="opt" onclick="answer(${k})"><span class="ol">${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>`;
 if(it.t==='R')return `<div class="slider"><div class="poles"><span>${esc(it.a)}</span><span>${esc(it.b)}</span></div><input type="range" min="-100" max="100" value="0" step="1" aria-label="${esc(it.q)}" oninput="sliderV=this.value/100;this.style.setProperty('--v',(+this.value+100)/2+'%');document.getElementById('sv').textContent=svLabel(sliderV)" style="--v:50%">
  <p class="sv" id="sv">Centre</p><button class="btn primary wide" onclick="answer(+sliderV.toFixed(2))">Confirm ${ic('arrow')}</button></div>`;
 if(it.t==='K')return `<div class="rank">${it.o.map((o,k)=>`<button class="opt" data-k="${k}" onclick="rankTap(${k})"><span class="rn"></span>${esc(o.t)}</button>`).join('')}</div><div class="rank-act"><button class="ghost" onclick="rankReset()">Reset</button><button class="btn primary" id="rk" disabled onclick="answer(rankSel.slice())">Confirm order ${ic('arrow')}</button></div><p class="muted center">Tap in order, from most to least.</p>`}
const svLabel=v=>Math.abs(v)<.1?'Centre':(Math.abs(v)<.45?'Leaning ':Math.abs(v)<.85?'Mostly ':'Fully ')+(v<0?'left':'right');
function rankTap(k){if(rankSel.includes(k))return;rankSel.push(k);if(rankSel.length===3)rankSel.push([0,1,2,3].find(x=>!rankSel.includes(x)));
 document.querySelectorAll('.rank .opt').forEach(b=>{const r=rankSel.indexOf(+b.dataset.k);b.classList.toggle('on',r>=0);b.querySelector('.rn').textContent=r>=0?r+1:''});$('#rk').disabled=rankSel.length<4}
function rankReset(){rankSel=[];document.querySelectorAll('.rank .opt').forEach(b=>{b.classList.remove('on');b.querySelector('.rn').textContent=''});$('#rk').disabled=true}
function answer(a){const A=st.active;A.ans.push({id:A.cur,a,ts:Date.now()});save();const b=document.querySelector('.qbody');if(b){b.classList.add('out');setTimeout(quiz,170)}else quiz()}
function qBack(){const A=st.active;A.ans.pop();if(A.ans.length<Math.floor(A.n/2))A.insight=false;save();quiz()}
function quitSession(){const A=st.active;if(A&&!A.ans.length){st.active=null;save()}go(st.sessions.length?'home':'intro')}
function moved(before,after,n=5){return DK.map(d=>({d,b:before.s[d],a:after.s[d],dv:after.s[d]-before.s[d]})).sort((x,y)=>Math.abs(y.dv)-Math.abs(x.dv)).slice(0,n)}
function insightView(){const A=st.active,M=model(),mv=moved(A.before,M,1)[0],D=DIMS[mv.d],ts=M.probs;
 const line=D.lo?`You read as <b>${word(M.s[mv.d],D.lo,D.hi)}</b> on ${D.name}${Math.abs(mv.dv)>.05?`, a shift of ${Math.round(Math.abs(mv.dv)*50)} points ${mv.dv>0?'toward '+D.hi.toLowerCase():'toward '+D.lo.toLowerCase()} this session`:''}.`:`Your <b>${D.name}</b> intuition is ${M.s[mv.d]>.3?'strong':M.s[mv.d]<-.3?'weak':'moderate'} (${pctl(M.s[mv.d])}/100)${Math.abs(mv.dv)>.05?`, ${mv.dv>0?'up':'down'} ${Math.round(Math.abs(mv.dv)*50)} this session`:''}.`;
 app.innerHTML=`<section class="insight"><div class="in-card"><p class="eyebrow">Halfway · what we just learned</p><h2>${line}</h2>
 <div class="in-grid"><div><span>Confidence</span><b>${A.before.conf}% → ${M.conf}%</b></div><div><span>Leading candidate</span><b>${ts[0].t.name} · ${pct(ts[0].p)}</b></div></div>
 <p class="muted">${ts[0].p>=CONFIRM?'That candidate is above the '+CONFIRM*100+'% bar. A few more answers to make sure it holds.':`The next questions will focus on what separates ${ts[0].t.name} from ${ts[1].t.name}: ${needed(M).map(d=>DIMS[d].name).join(' and ')}.`}</p>
 <button class="btn primary" onclick="st.active.insight=true;save();quiz()">Keep going ${ic('arrow')}</button></div></section>`}
function finishSession(){const A=st.active;if(!A||!A.ans.length){st.active=null;save();return go('themes')}
 const after=model(st.sessions.flatMap(x=>x.ans).concat(A.ans));const rec={theme:A.theme,start:A.start,end:Date.now(),ans:A.ans.map(({id,a})=>({id,a})),before:{s:A.before.s,conf:A.before.conf,top:A.before.top},after:{s:after.s,conf:after.conf,top:after.probs.slice(0,3).map(r=>[r.t.id,r.p])}};
 st.sessions.push(rec);st.active=null;const lockBefore=st.typeLock;const{gained,ts}=evalShards();rec.gained=gained;rec.lockNew=!lockBefore&&!!st.typeLock;save();go('done/'+(st.sessions.length-1))}
function done(i){const x=st.sessions[+i];if(!x)return go('home');const T=themeById[x.theme],mv=moved(x.before,x.after,5),ts=typeStatus();
 const fresh=new Set(x.gained||[]);
 app.innerHTML=`<section class="done"><div class="burst" aria-hidden="true"></div>
 <div class="d-gem">${gemSVG(gemOf(),{unlocked:new Set(st.shards),fresh,size:260,cls:'float'})}</div>
 <p class="eyebrow">${T.title} complete</p><h1>${x.lockNew?`You are <em>${ts.t.name}</em>`:fresh.size?`${fresh.size} shard${fresh.size>1?'s':''} unlocked`:'Profile sharpened'}</h1>
 <p class="lede">${x.lockNew?`${pct(ts.p)} of plausible versions of you land on ${ts.t.name}, past the ${CONFIRM*100}% bar. Your gem is now the ${GEMS[ts.t.id].name}.`:ts.state==='confirmed'?`Still ${ts.t.name} at ${pct(ts.p)} certainty.`:`Your type is still forming. Leading: ${ts.t.name} at ${pct(ts.p)}; it needs ${CONFIRM*100}%.`} ${st.shards.length}/12 shards.</p>
 <div class="d-stats"><div><span>Confidence</span><b>${x.before.conf}% <i>→</i> ${x.after.conf}%</b></div><div><span>Answers</span><b>${x.ans.length}</b></div><div><span>Shards</span><b>${st.shards.length}/12</b></div></div>
 ${fresh.size?`<div class="unlocks">${[...fresh].map((j,k)=>`<button class="unlock" style="--d:${.5+k*.15}s" onclick="go('${SHARDS[j].k==='confirm'||SHARDS[j].k==='complete'?'home':'profile/'+tabFor(SHARDS[j].k)}')"><span class="u-ic">${ic('check')}</span><div><b>${SHARDS[j].name}</b><span>${SHARDS[j].feat}</span></div>${ic('arrow')}</button>`).join('')}</div>`:''}
 <div class="card moved"><h3>Scores that moved</h3>${mv.map(m=>{const D=DIMS[m.d];return `<div class="mv"><span>${D.name}</span><div class="mvt"><i class="b" style="left:${pctl(m.b)}%"></i><i class="a" style="left:${pctl(m.a)}%"></i><i class="ln" style="left:${Math.min(pctl(m.a),pctl(m.b))}%;width:${Math.abs(pctl(m.a)-pctl(m.b))}%"></i></div><em>${m.dv>=0?'+':''}${Math.round(m.dv*50)}</em></div>`}).join('')}<p class="muted">Hollow dot = before this session, filled = now. Points on a 0–100 scale.</p></div>
 <div class="cta center"><button class="btn primary" onclick="startSession('${x.theme==='core'?'politics':x.theme}')">${x.theme==='core'?'Next: Power & Policy':'Another '+T.title+' session'}</button><button class="btn line" onclick="go('home')">Dashboard</button></div></section>`}
const tabFor=k=>({overview:'overview',compass:'compass',culture:'compass',values:'compass',traits:'traits',morals:'morals',relationships:'relationships',careers:'careers',growth:'growth',famous:'matches'}[k]||'overview');
