// Meridian v2 — painted art, deep tabs, relationships, careers, rarity, dashboard, research
// ---------- art overrides ----------
function mascotSVG(t,size=200){return `<img class="masc" src="img/m-${t.id}.webp" alt="${t.animal} mascot for ${t.name}" style="height:${size}px" loading="lazy" decoding="async">`}
function islandSVG(t){return `<img class="isl" src="img/i-${t.id}.webp" alt="${esc(t.isl.name)}, the island of ${t.name}" decoding="async">`}
const tById=id=>TYPES.find(t=>t.id===id);
const vecOf=t=>{const v={};POL.forEach((k,i)=>v[k]=t.c[i]);B5.forEach((k,i)=>v[k]=t.c[4+i]);MOR.forEach((k,i)=>v[k]=t.m[i]*2-1);return v};
const pad2=n=>String(n).padStart(2,'0');
const money=v=>'$'+(v>=1e6?(v/1e6).toFixed(2)+'M':Math.round(v/1000)+'k');

// ---------- rarity: share of a simulated population nearest each type ----------
// Assumption: each of the 15 dimensions ~ Normal(0, 0.45), independent, clipped to [-1,1]. Seeded, so stable.
const RARITY=(()=>{let x=20260511;const rnd=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};
 const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const N=12000,cnt={};TYPES.forEach(t=>cnt[t.id]=0);
 for(let i=0;i<N;i++){const s={};DK.forEach(d=>s[d]=Math.max(-1,Math.min(1,gauss()*.45)));cnt[matchTypes(s)[0].t.id]++}
 const out={};const sorted=TYPES.map(t=>t.id).sort((a,b)=>cnt[a]-cnt[b]);
 TYPES.forEach(t=>{const share=cnt[t.id]/N*100;out[t.id]={share,rank:sorted.indexOf(t.id)+1,rarer:Math.round(TYPES.filter(o=>cnt[o.id]>cnt[t.id]).length/15*100)}});return out})();
const rareTxt=r=>r.share<3?'Rare':r.share<6?'Uncommon':r.share<9?'Common':'Very common';

// ---------- illustrative income / net worth model ----------
// Directions from published Big Five–income findings (see Research): C+, N−, A− (esp. men), E small +, O ~0.
const ECON_BASE={inc:60000,nw:192900};
function econEst(v){const inc=ECON_BASE.inc*Math.exp(.10*v.C-.08*v.N-.06*v.A+.05*v.E);
 const nw=ECON_BASE.nw*Math.exp(.20*v.C-.14*v.N-.05*v.A+.03*v.E+.04*v.econ);return{inc:Math.round(inc/500)*500,nw:Math.round(nw/1000)*1000}}

// ---------- compatibility ----------
const DOMAINS={
 work:{name:'Work',w:{C:1.2,auth:.5,O:.4,prop:.5},comp:{E:.6},lowA:.8,why:'Matched pace and standards (Conscientiousness), similar views on hierarchy, and complementary energy.'},
 friend:{name:'Friendship',w:{O:1,E:.6,econ:.4,trad:.6,glob:.3,care:.4},comp:{},lowA:.4,why:'Shared curiosity, social rhythm and worldview.'},
 romance:{name:'Romance',w:{trad:1,puri:.8,loya:.6,O:.7,C:.6,care:.5},comp:{E:.3},lowA:.6,lowN:.8,why:'Shared values around tradition and loyalty, similar openness and daily habits, and emotional steadiness between you.'},
 parent:{name:'Co-parenting',w:{trad:1,autr:1,C:.8,care:.6,puri:.5},comp:{},lowA:.4,why:'Agreement on rules, routine and moral teaching.'},
 conflict:{name:'Disagreements',w:{econ:.4,auth:.4,trad:.4},comp:{},lowA:1.4,lowN:1.2,why:'How smoothly you argue: both partners\u2019 Agreeableness and steadiness, plus how far apart your politics are.'}};
function rawCompat(a,b,dom){const D=DOMAINS[dom];let d=0;
 for(const[k,w]of Object.entries(D.w))d+=w*(a[k]-b[k])**2;
 for(const[k,w]of Object.entries(D.comp))d+=w*(.9-Math.abs(a[k]-b[k]))**2*.5;
 if(D.lowA)d+=D.lowA*Math.max(0,-(a.A+b.A)/2)*1.2;
 if(D.lowN)d+=D.lowN*Math.max(0,(a.N+b.N)/2)*1.2;return d}
const CRANGE=(()=>{const r={};for(const dom in DOMAINS){let lo=1e9,hi=-1e9;TYPES.forEach(a=>TYPES.forEach(b=>{const v=rawCompat(vecOf(a),vecOf(b),dom);lo=Math.min(lo,v);hi=Math.max(hi,v)}));r[dom]=[lo,hi]}return r})();
function compat(a,b,dom){const rs=TYPES.map(o=>rawCompat(a,vecOf(o),dom)),lo=Math.min(CRANGE[dom][0],...rs),hi=Math.max(...rs);const v=rawCompat(a,b,dom);return Math.max(8,Math.min(98,Math.round(95-(v-lo)/(hi-lo||1)*62)))}
const DIFF_TIP={
 econ:['money and fairness','Agree early on how you split costs and what "fair" means.'],
 auth:['rules and freedom','Decide together which rules are fixed and which are negotiable.'],
 trad:['tradition and change','Name one tradition each of you will protect, and one you\u2019ll rethink.'],
 glob:['local vs global priorities','Respect that "home first" and "world first" can both come from care.'],
 O:['novelty','Alternate: one new thing, one familiar thing.'],
 C:['planning and tidiness','Agree on deadlines and shared spaces; let the rest be loose.'],
 E:['social energy','Plan recovery time after social events without guilt.'],
 A:['directness','The direct one softens the opening; the gentle one says the real thing.'],
 N:['emotional reactivity','The steadier one reassures without dismissing; the sensitive one names needs early.'],
 care:['compassion','Show care in the other person\u2019s language, not just yours.'],equa:['equality','Talk about whether equal means identical.'],prop:['merit','Talk about effort versus outcome before money comes up.'],
 loya:['loyalty','Clarify what loyalty requires — and what it doesn\u2019t.'],autr:['respect for authority','Decide whose expertise you defer to, and when.'],puri:['the sacred','Ask what is non-negotiable for each of you.']};
function pairTips(a,b){return DK.map(k=>[k,Math.abs(a[k]-b[k])]).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,g])=>({k,g,area:DIFF_TIP[k][0],tip:DIFF_TIP[k][1],same:g<.35}))}
function sharedStrength(a,b){return DK.map(k=>[k,Math.abs(a[k]-b[k]),Math.abs(a[k]+b[k])]).filter(x=>x[2]>.6).sort((x,y)=>x[1]-y[1]).slice(0,2).map(x=>DIMS[x[0]].name)}

// ---------- router ----------
function render(){
 const raw=location.hash.slice(1),r=raw||(st.done?'dash/home':'intro'),[k,arg]=r.split('/');
 document.body.className='r-'+k;window.scrollTo(0,0);
 ({intro,quiz,results,map,method,research,dash,take,session,changed}[k]||intro)(arg);
}
function topbar(title,back){return `<header class="topbar"><button class="ghost dk" onclick="${back||"history.length>1?history.back():go('intro')"}">← Back</button><span class="brand dk"><i></i>${title}</span><span class="tb-spacer"></span></header>`}
const nav=(on)=>`<nav class="dnav" aria-label="Dashboard">${[['home','Home'],['history','History'],['quizzes','Questionnaires'],['research','Research'],['profile','Profile']].map(([k,l])=>`<button class="${on===k?'on':''}" onclick="go('${k==='research'?'research':'dash/'+k}')">${l}</button>`).join('')}</nav>`;

// ---------- intro patch: research + dashboard entry ----------
const _intro=intro;
intro=function(){_intro();const tb=document.querySelector('.intro .topbar');
 tb.innerHTML=`<span class="brand"><i></i>Meridian</span><span class="tb-r"><button class="ghost" onclick="go('research')">Research</button><button class="ghost" onclick="go('map')">Archipelago</button></span>`;
 if(st.done){const cta=document.querySelector('.intro .cta-row');cta.innerHTML=`<button class="btn amber" onclick="go('dash/home')">Open my dashboard</button><button class="btn glass" onclick="go('results')">View my profile</button>`}};

// ---------- core quiz completion → record session ----------
const _quiz=quiz;
quiz=function(){if(!pendingPoll&&!nextItem()&&!st.done){st.done=true;st.extra=st.extra||[];st.sessions=st.sessions||[];
  const {s}=score();st.sessions.push({kind:'core',qid:'core',title:'Core assessment',date:Date.now(),answers:st.hist.slice(),type:matchTypes(s)[0].t.id,after:s});save();return go('results')}
 return _quiz()};
startQuiz=function(){if(st.done){if(!confirm('Retake the core assessment? This clears your profile, history and themed results.'))return;st={hist:[]};save()}go('quiz')};

// ---------- results ----------
const TABS=[['overview','Overview'],['compass','Compass'],['traits','Traits'],['morals','Morals'],['relationships','Relationships'],['careers','Careers'],['matches','Famous matches'],['glossary','Glossary']];
results=function(){
 if(!st.hist.length)return go('intro');
 const{s,u}=score();const ranked=matchTypes(s);const top=ranked[0],t=top.t,alt=ranked[1],R=RARITY[t.id];
 app.innerHTML=`<section class="results" style="--tc:${t.col};--tb:${t.bg}">
 <header class="topbar"><span class="brand dk"><i></i>Meridian</span><div class="tb-r"><button class="ghost dk" onclick="go('dash/home')">Dashboard</button><button class="ghost dk hide-s" onclick="go('map')">Archipelago</button><button class="ghost dk" onclick="shareCard()">Share</button></div></header>
 <div class="hero">
  <div class="hero-num" aria-hidden="true">${pad2(t.n)}</div>
  <div class="hero-copy"><p class="eyebrow">Your type · ${top.fit}% fit</p><h1>${t.name}</h1><p class="tag">“${t.tag}”</p>
   <div class="hero-stats"><div><b>${t.animal}</b><span>Mascot</span></div><div><b>${R.share.toFixed(1)}%</b><span>Est. share of people</span></div><div><b>${allAns().length}</b><span>Answers</span></div></div></div>
  <div class="hero-mascot">${mascotSVG(t,320)}</div>
 </div>
 <nav class="tabs" role="tablist">${TABS.map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" onclick="tab='${k}';results()">${l}</button>`).join('')}</nav>
 <div class="panel">${panels[tab](s,u,t,alt,ranked)}</div>
 <footer class="foot"><button class="btn dark" onclick="go('dash/home')">Go to my dashboard →</button><button class="btn line" onclick="shareCard()">Get share card</button></footer>
 </section>`;
 const tb=document.querySelector('.tabs .on');tb&&tb.scrollIntoView({inline:'center',block:'nearest'});
};
const sec=(title,body,cls='')=>`<div class="card ${cls}"><h3>${title}</h3>${body}</div>`;
const lead=(t)=>`<p class="lead">${t}</p>`;

panels.overview=function(s,u,t,alt){const E=EXT[t.id],R=RARITY[t.id];
 const top2=B5.slice().sort((a,b)=>Math.abs(s[b])-Math.abs(s[a])).slice(0,2);
 return `<div class="stack">
 <div class="grid2">
  ${sec('Who you are',`<p class="big">${t.sum}</p><p>You read as <b>${word(s.econ,'equality','markets')}</b> on economics, <b>${word(s.auth,'liberty','order')}</b> on authority, <b>${word(s.trad,'progress','tradition')}</b> on culture and <b>${word(s.glob,'national','global')}</b> in scope.</p><p>Your most distinctive traits are <b>${top2.map(d=>word(s[d],DIMS[d].lo,DIMS[d].hi)+' ('+DIMS[d].name+')').join('</b> and <b>')}</b>.</p><p class="muted">Runner-up: <a href="#" onclick="openType('${alt.t.id}');return false">${alt.t.name}</a> (${alt.fit}% fit). Your dimension scores are the real result; the type is a summary.</p>`)}
  <div class="card rarity"><h3>How rare is ${t.name}?</h3><div class="rare-big"><b>${R.share.toFixed(1)}%</b><span>${rareTxt(R)} · rarer than ${R.rarer}% of types</span></div>
   <div class="rare-bar">${TYPES.slice().sort((a,b)=>RARITY[a.id].share-RARITY[b.id].share).map(o=>`<i title="${o.name} ${RARITY[o.id].share.toFixed(1)}%" style="flex:${RARITY[o.id].share};background:${o.id===t.id?t.col:'#E2D7C4'}"></i>`).join('')}</div>
   <p class="muted">Model estimate, not survey data. We simulated 12,000 people from Meridian\u2019s assumed population distribution and counted how many land nearest each type. <a href="#research">Method</a></p></div>
 </div>
 <div class="grid2">
  ${sec('How you communicate',`<p>${E.comm}</p>`)}
  ${sec('Under stress',`<p>${E.stress}</p>`)}
  ${sec('At work',`<p>${E.work}</p>`)}
  ${sec('In relationships',`<p>${E.love}</p>`)}
 </div>
 <div class="grid2">
  <div class="card"><h3>Strengths</h3><ul class="pill-list good">${t.str.map(x=>`<li>${x}</li>`).join('')}${traitNote(s,true)}</ul></div>
  <div class="card"><h3>Watch-outs</h3><ul class="pill-list warn">${t.wk.map(x=>`<li>${x}</li>`).join('')}${traitNote(s,false)}</ul></div>
 </div>
 <div class="grid2">
  ${sec('Blind spots',`<ul class="ticks">${E.blind.map(x=>`<li>${x}</li>`).join('')}</ul>`)}
  ${sec('Your growth plan',`<ol class="steps">${E.growth.map(x=>`<li>${x}</li>`).join('')}</ol>`)}
 </div>
 <div class="card island-card" style="background:${t.bg}"><div class="isl-row"><div>${islandSVG(t)}</div><div><p class="eyebrow">Home island</p><h3>${t.isl.name}</h3><p>Every island is built from its type\u2019s compass: what the residents build, protect and gather around.</p><button class="btn line sm" onclick="go('map')">Explore all 16 islands</button></div></div></div>
 </div>`};

panels.compass=function(s,u,t,alt,ranked){
 const near=TYPES.map(o=>({o,d:Math.hypot(s.econ-o.c[0],s.auth-o.c[1])})).sort((a,b)=>a.d-b.d).slice(0,3);
 return `<div class="stack"><div class="grid2"><div class="card"><h3>Economic × Authority</h3>${plot(s)}<p class="muted">Dark dot = you. Coloured dots = the 16 types. Nearest on this slice: ${near.map(n=>n.o.name).join(', ')}.</p></div>
  <div class="card"><h3>Four political axes</h3>${POL.map(d=>barRow(d,s,u)).join('')}<p class="muted">Culture and scope are measured separately because they often diverge from economics (Feldman &amp; Johnston, 2014).</p></div></div>
  <div class="grid2">${POL.map(d=>{const v=s[d],A=AXIS_TXT[d];return sec(DIMS[d].name+' axis',`<p class="q">${A[0]}</p><p><b>You: ${word(v,DIMS[d].lo,DIMS[d].hi)}</b> (${pctl(v)}/100).</p><ul class="ticks"><li>${A[1]}</li><li>${A[2]}</li></ul><p class="muted">${Math.abs(v)<.15?'Balanced scores often mean you weigh this case-by-case. That is a position, not indecision.':Math.abs(v)<.45?'A moderate lean: you can usually see the other side\u2019s best argument.':'A strong lean: this axis likely shapes how you vote and which arguments feel obvious to you.'}</p>`)}).join('')}</div>
  ${sec('Reading your compass',`<p>Two-axis charts flatten people. Someone can favour markets and progressive culture, or state welfare and tradition. That is why Meridian keeps four axes and links them to moral intuitions rather than party labels.</p><p class="muted">Your confidence bars show how settled each score is. Themed questionnaires in your dashboard tighten them.</p>`)}</div>`};

panels.traits=function(s,u){return `<div class="stack">${sec('Big Five overview',B5.map(d=>barRow(d,s,u)).join('')+`<p class="muted">Continuous scores, not boxes. No population norms, so these are relative to the scale midpoint, not percentiles.</p>`)}
 ${B5.map(d=>{const v=s[d],F=FACETS[d],hi=v>=0;return `<div class="card trait-card"><div class="tc-head"><div><p class="eyebrow">${DIMS[d].name}</p><h3>${word(v,DIMS[d].lo,DIMS[d].hi).replace(/^./,c=>c.toUpperCase())}</h3></div><b class="tc-num">${pctl(v)}</b></div>
  <p>${Math.abs(v)<.15?'You sit near the middle: you can flex either way depending on the situation. '+F.hi.split('.')[0].replace('You are','People high here are')+'; '+F.lo.split('.')[0].replace('You','people low here').replace('You are','people low here are')+'.':(hi?F.hi:F.lo)}</p>
  <h4>What this trait is made of</h4><ul class="facets">${F.facets.map(([n,x])=>`<li><b>${n}</b><span>${x}</span></li>`).join('')}</ul>
  <div class="tip"><b>Try this</b> ${F.tip[hi?'hi':'lo']}</div></div>`}).join('')}
 <p class="muted center">Facet structure follows the public-domain IPIP-NEO. Meridian scores the five traits; it does not yet score each facet separately.</p></div>`};

panels.morals=function(s,u){const order=MOR.slice().sort((a,b)=>s[b]-s[a]);
 const indiv=(s.care+s.equa)/2,bind=(s.loya+s.autr+s.puri)/3;
 return `<div class="stack"><div class="grid2"><div class="card"><h3>Moral foundations</h3>${radar(s)}</div><div class="card"><h3>What drives your judgments</h3>${MOR.map(d=>`<div class="mrow"><b>${DIMS[d].name}</b><span class="mbar"><i style="width:${pctl(s[d])}%"></i></span><em>${pctl(s[d])}</em></div>`).join('')}<p class="muted">Six foundations from MFQ-2 (Atari et al., 2023), scored 0–100 on this test\u2019s own scale.</p></div></div>
 <div class="grid2">${sec('Your moral centre',`<p>Your strongest intuitions are <b>${MORAL_TXT[order[0]][0]}</b> and <b>${MORAL_TXT[order[1]][0]}</b>. Your weakest is <b>${MORAL_TXT[order[5]][0]}</b>.</p><p>${indiv-bind>.25?'You lean on the "individualising" foundations (care, equality) more than the "binding" ones (loyalty, authority, purity). Research links this pattern with progressive politics (Graham, Haidt & Nosek, 2009).':bind-indiv>.25?'You weigh the "binding" foundations (loyalty, authority, purity) as heavily as or more than care and equality. Research links this broader moral palette with conservative politics (Graham, Haidt & Nosek, 2009).':'You draw fairly evenly on individualising and binding foundations, which often makes it easier to understand both left and right.'}</p>`)}
  ${sec('Talking across the divide',`<p>Arguments land better when they speak to the listener\u2019s foundations, not yours. Studies on "moral reframing" found that recasting an argument in the other side\u2019s moral terms made it more persuasive (Feinberg &amp; Willer, 2015).</p><p class="muted">Try framing your next disagreement around ${MORAL_TXT[order[5]][0].toLowerCase()} — the foundation you lean on least.</p>`)}</div>
 <div class="grid2">${MOR.map(d=>sec(MORAL_TXT[d][0],`<p>${MORAL_TXT[d][1]}</p><p><b>${pctl(s[d])}/100</b> — ${s[d]>.3?'a strong intuition for you; violations here feel wrong before you can explain why.':s[d]<-.3?'a weak intuition for you; arguments based on it may feel unconvincing.':'moderate: it matters, but other values can outweigh it.'}</p>`,'mini-card')).join('')}</div></div>`};

let relDom='romance';
panels.relationships=function(s,u,t){const list=TYPES.map(o=>({o,v:compat(s,vecOf(o),relDom)})).sort((a,b)=>b.v-a.v);
 const best=list.slice(0,3),hard=list.slice(-3).reverse();
 const card=(x,good)=>`<button class="rel-card ${good?'g':'h'}" onclick="openPair('${x.o.id}')" style="--rb:${x.o.bg}">${mascotSVG(x.o,96)}<div><b>${x.o.name}</b><span>${x.v}% · ${DOMAINS[relDom].name}</span><em>${good?(sharedStrength(s,vecOf(x.o)).length?'Shared: '+sharedStrength(s,vecOf(x.o)).join(', '):'Complementary rhythm'):'Friction: '+pairTips(s,vecOf(x.o))[0].area}</em></div></button>`;
 return `<div class="stack">${sec('Relationships',`<p>How you are likely to get on with each type, based on your actual scores. Pick an area of life:</p><div class="seg">${Object.entries(DOMAINS).map(([k,d])=>`<button class="${relDom===k?'on':''}" onclick="relDom='${k}';results()">${d.name}</button>`).join('')}</div><p class="muted">${DOMAINS[relDom].why}</p>`)}
 <div class="grid2"><div class="card"><h3>Easiest matches</h3><div class="rel-list">${best.map(x=>card(x,1)).join('')}</div></div><div class="card"><h3>Hardest matches</h3><div class="rel-list">${hard.map(x=>card(x,0)).join('')}</div><p class="muted">Hard is not doomed. These pairings need more explicit agreements.</p></div></div>
 ${sec('All 16 types',`<div class="rel-all">${list.map(x=>`<button class="rel-row" onclick="openPair('${x.o.id}')"><span class="rr-name"><i style="background:${x.o.col}"></i>${x.o.name}${x.o.id===t.id?' <small>(your type)</small>':''}</span><span class="mbar"><i style="width:${x.v}%;background:${x.o.col}"></i></span><em>${x.v}</em></button>`).join('')}</div><p class="muted">Scores are a model of similarity and complementarity on Meridian\u2019s dimensions, not tested predictions of relationship outcomes. Research finds that personality similarity predicts relationship satisfaction only weakly; low Neuroticism in either partner is a more consistent predictor (Malouff et al., 2010).</p>`)}
 ${sec('Your relationship habits',`<ul class="ticks"><li><b>Communicating:</b> ${EXT[t.id].comm}</li><li><b>Loving:</b> ${EXT[t.id].love}</li><li><b>When it gets tense:</b> ${EXT[t.id].stress}</li></ul>`)}</div>`};
function openPair(id){const o=tById(id),{s}=score(),b=vecOf(o),tips=pairTips(s,b),sh=sharedStrength(s,b);
 sheet.innerHTML=`<div class="sheet-bg" onclick="closeSheet()"></div><div class="sheet-card" style="--tb:${o.bg};--tc:${o.col}" role="dialog" aria-label="You and ${o.name}"><button class="x" onclick="closeSheet()" aria-label="Close">×</button>
 <div class="sh-top">${mascotSVG(o,120)}<div><p class="eyebrow">You &amp; No. ${pad2(o.n)}</p><h2>${o.name}</h2><p class="tag">“${o.tag}”</p></div></div>
 ${Object.entries(DOMAINS).map(([k,d])=>{const v=compat(s,b,k);return `<div class="mrow"><b>${d.name}</b><span class="mbar"><i style="width:${v}%"></i></span><em>${v}</em></div>`}).join('')}
 <h4>Common ground</h4><p>${sh.length?'You share strong leanings on '+sh.join(' and ')+'.':'Few strong shared leanings — you\u2019ll need to build common ground deliberately.'}</p>
 <h4>Where you\u2019ll differ</h4><ul>${tips.map(x=>`<li><b>${x.area[0].toUpperCase()+x.area.slice(1)}</b>${x.same?' (small gap)':''} — ${x.tip}</li>`).join('')}</ul>
 <p class="muted">Model-based estimate from your scores and this type\u2019s centre.</p></div>`;sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'))}

panels.careers=function(s,u,t){const E=EXT[t.id],me=econEst(s),ty=econEst(vecOf(t));
 const all=TYPES.map(o=>({o,e:econEst(vecOf(o))})).sort((a,b)=>b.e.inc-a.e.inc);
 const maxI=all[0].e.inc;
 const env=[];if(s.C>.2)env.push('clear goals and accountability');if(s.C<-.2)env.push('flexible schedules and variety');if(s.E>.2)env.push('people-facing, collaborative work');if(s.E<-.2)env.push('deep focus with limited meetings');if(s.O>.2)env.push('novel problems and room to experiment');if(s.O<-.2)env.push('proven methods and concrete outcomes');if(s.A>.2)env.push('cooperative, mission-driven teams');if(s.A<-.2)env.push('competitive or critical roles');if(s.N>.2)env.push('psychologically safe, predictable cultures');if(s.N<-.2)env.push('high-pressure, high-stakes settings');
 return `<div class="stack"><div class="grid2">
 <div class="card"><h3>Careers that fit</h3><ul class="career good">${E.good.map(([n,r])=>`<li><b>${n}</b><span>${r}</span></li>`).join('')}</ul></div>
 <div class="card"><h3>Careers that fight you</h3><ul class="career poor">${E.poor.map(([n,r])=>`<li><b>${n}</b><span>${r}</span></li>`).join('')}</ul><p class="muted">Anyone can succeed anywhere. These are roles where your defaults work against the job\u2019s daily demands.</p></div></div>
 ${sec('Your ideal environment',`<p>Based on your trait scores, you are likely to do best with ${env.length?env.join(', '):'a balanced mix of structure and freedom'}.</p><p class="muted">Across hundreds of studies, Conscientiousness is the Big Five trait that most consistently predicts job performance across occupations (Barrick &amp; Mount, 1991).</p>`)}
 <div class="grid2"><div class="card money"><p class="eyebrow">Illustrative estimate</p><h3>Average income</h3><div class="m-big">${money(ty.inc)}<small>/yr for a typical ${t.name}</small></div><div class="m-sub">Your profile: <b>${money(me.inc)}</b></div>
  <p class="muted">Not real data. A model that nudges a US baseline up or down by trait direction.</p></div>
  <div class="card money"><p class="eyebrow">Illustrative estimate</p><h3>Net worth</h3><div class="m-big">${money(ty.nw)}<small>for a typical ${t.name}</small></div><div class="m-sub">Your profile: <b>${money(me.nw)}</b></div>
  <p class="muted">Not real data. Household net worth varies far more with age, inheritance and location than with personality.</p></div></div>
 ${sec('Income estimate by type <span class="badge">Illustrative</span>',`<div class="inc-chart">${all.map(x=>`<div class="ic-row ${x.o.id===t.id?'me':''}"><span>${x.o.name}</span><i style="width:${x.e.inc/maxI*100}%;background:${x.o.col}"></i><em>${money(x.e.inc)}</em></div>`).join('')}</div>`)}
 <details class="card method-note"><summary><b>How these estimates are made</b></summary>
  <p><b>Baselines.</b> Income starts from about $60,000, roughly the median for full-time US workers in recent Bureau of Labor Statistics releases. Net worth starts from $192,900, the median US household net worth in the Federal Reserve\u2019s 2022 Survey of Consumer Finances.</p>
  <p><b>Adjustments.</b> Each type\u2019s trait centre shifts those baselines in the direction published research reports: higher Conscientiousness and lower Neuroticism are linked to higher earnings (e.g., Judge et al., 1999), and higher Agreeableness to lower earnings, especially for men (Judge, Livingston &amp; Hurst, 2012). Extraversion gets a small positive weight and Openness none. The sizes of the adjustments are Meridian\u2019s own assumptions, kept deliberately small, because real effects are modest and depend on job, gender, education and country.</p>
  <p><b>What this is not.</b> We have no income data on Meridian users or types. Treat these figures as a way to show which way traits push, not a forecast for you.</p></details></div>`};

panels.matches=function(s,u,t,alt,ranked){const ppl=[...t.fam.map(f=>[...f,t]),[...alt.t.fam[0],alt.t],[...ranked[2].t.fam[0],ranked[2].t]];
 return `<div class="stack">${sec('People who share your tendencies',`<p class="muted">Approximate, based on the public record of stated views and conduct — not a claim about anyone\u2019s inner psychology. People appear across the whole spectrum.</p>
 <div class="people">${ppl.map(([nm,era,ty])=>`<div class="person"><span class="mono" style="background:${ty.bg};color:${ty.col}">${nm.split(' ').filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join('')}</span><div><b>${nm}</b><span>${era==='historical'?'Historical':'Contemporary'} · ${ty.name}</span><span class="why">${ty.id===t.id?'Like you: '+ty.str[0].toLowerCase()+', '+ty.str[1].toLowerCase()+'.':'From your runner-up type, '+ty.name+'.'}</span></div></div>`).join('')}</div>`)}
 ${sec('Your three closest types',ranked.slice(0,3).map((r,i)=>`<button class="near" onclick="openType('${r.t.id}')" style="--rb:${r.t.bg}">${mascotSVG(r.t,72)}<div><b>${i+1}. ${r.t.name}</b><span>${r.fit}% fit · ${r.t.tag}</span></div></button>`).join(''))}
 ${sec('Your opposite',(()=>{const o=ranked[ranked.length-1].t;return `<button class="near" onclick="openType('${o.id}')" style="--rb:${o.bg}">${mascotSVG(o,72)}<div><b>${o.name}</b><span>${o.fam.map(f=>f[0]).join(' · ')}</span></div></button><p class="muted">Reading the best case for your opposite type is one of the fastest ways to sharpen your own views.</p>`})())}</div>`};

const GLOSS2=[['Trait vs. type','Traits are continuous dimensions on which everyone has a score; types sort people into boxes. Research strongly favours traits; types are useful shorthand.'],['Facet','A narrower sub-trait within a Big Five domain, e.g. Orderliness within Conscientiousness.'],['Test–retest reliability','How similar your scores are when you retake a test. Big Five scales are high; MBTI letter assignments flip often (Pittenger, 2005).'],['Heritability','The share of variation in a trait across a population linked to genetic differences. About 40% for Big Five traits in a meta-analysis (Vukasović & Bratko, 2015). It says nothing about any one person.'],['Maturity principle','The finding that people tend to become more conscientious, agreeable and emotionally stable as they age (Roberts et al., 2006).'],['Individualising vs. binding','Care and fairness focus on individuals; loyalty, authority and purity bind groups together (Graham et al., 2009).'],['Moral reframing','Presenting an argument in the moral terms of the audience, not your own (Feinberg & Willer, 2015).'],['Computerised adaptive testing','Choosing each next question by what will be most informative, given answers so far.'],['Lexical hypothesis','The idea that important personality differences become words in language, the basis of the Big Five (Allport & Odbert, 1936; Goldberg, 1990).'],['Social desirability','The pull to answer how you think you should. Trade-off questions reduce it.']];
panels.glossary=function(){const all=[...GLOSSARY,...GLOSS2];return `<div class="stack">${sec('Glossary',`<input class="gsearch" placeholder="Search ${all.length} terms" oninput="filterGloss(this.value)" aria-label="Search glossary"><dl class="gloss" id="gl">${all.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="muted"><a href="#research">Research &amp; method →</a></p>`)}</div>`};
function filterGloss(q){q=q.toLowerCase();document.querySelectorAll('#gl>div').forEach(d=>d.hidden=q&&!d.textContent.toLowerCase().includes(q))}

// ---------- type sheet: add rarity ----------
const _openType=openType;openType=function(id){_openType(id);const R=RARITY[id],t=tById(id);const tag=sheet.querySelector('.sh-top .tag');tag&&tag.insertAdjacentHTML('afterend',`<p class="rare-chip">${R.share.toFixed(1)}% est. · ${rareTxt(R)}</p>`);
 sheet.querySelector('.sh-isl').insertAdjacentHTML('afterend',`<div class="grid2 tight"><div><h4>Communicates</h4><p class="sm">${EXT[id].comm}</p></div><div><h4>Under stress</h4><p class="sm">${EXT[id].stress}</p></div></div>`)};

// ---------- dashboard ----------
function confPct(){const{u}=score();return Math.round(100*DK.reduce((a,d)=>a+(1-u[d]),0)/DK.length)}
function dash(tabk='home'){
 if(!st.done)return go('intro');st.sessions=st.sessions||[];st.extra=st.extra||[];
 const{s,u}=score(),t=matchTypes(s)[0].t,done=new Set(st.sessions.map(x=>x.qid));
 let body='';
 if(tabk==='home'){const lowest=DK.slice().sort((a,b)=>u[b]-u[a]).slice(0,3);const sugg=QUIZZES.filter(q=>!done.has(q.id)).map(q=>({q,v:q.items.reduce((a,it)=>a+Object.keys(it.w||it.o.reduce((m,o)=>Object.assign(m,o.w),{})).filter(k=>lowest.includes(k)).length,0)})).sort((a,b)=>b.v-a.v)[0];
  body=`<div class="dh-hero" style="--tb:${t.bg};--tc:${t.col}"><div><p class="eyebrow">Your profile</p><h1>${t.name}</h1><p class="tag">“${t.tag}”</p><div class="cta-row"><button class="btn dark" onclick="tab='overview';go('results')">Open full profile</button>${sugg?`<button class="btn line" onclick="go('take/${sugg.q.id}')">Next: ${sugg.q.title}</button>`:''}</div></div>${mascotSVG(t,220)}</div>
  <div class="kpis"><div class="card kpi"><b>${confPct()}%</b><span>Avg. confidence</span></div><div class="card kpi"><b>${st.sessions.length}</b><span>Questionnaires done</span></div><div class="card kpi"><b>${allAns().length}</b><span>Answers given</span></div><div class="card kpi"><b>${RARITY[t.id].share.toFixed(1)}%</b><span>Est. share of people</span></div></div>
  <div class="grid2">${sec('Confidence by dimension',DK.map(d=>{const c=Math.round((1-u[d])*100);return `<div class="mrow"><b>${DIMS[d].name}${DIMS[d].grp==='moral'?' <small>(moral)</small>':''}</b><span class="mbar"><i style="width:${c}%;background:${c<55?'#D9A25B':c<68?'#B9A86A':'#6C9A6B'}"></i></span><em>${c}</em></div>`}).join('')+`<p class="muted">Least certain: ${lowest.map(d=>DIMS[d].name).join(', ')}. ${sugg?`<b>${sugg.q.title}</b> targets these best.`:''}</p>`)}
  ${sec('Snapshot',`<div class="snap">${POL.map(d=>barRow(d,s,u)).join('')}</div><p class="muted"><a href="#results" onclick="tab='compass'">See compass detail →</a></p>`)}</div>`}
 if(tabk==='history'){body=sec('History',st.sessions.length?`<ol class="hist">${st.sessions.map((x,i)=>{const q=x.qid==='core'?{col:'#2A2420',bg:'#EFE6D6'}:QUIZZES.find(q=>q.id===x.qid);return `<li><button onclick="go('session/${i}')" style="--qc:${q.col};--qb:${q.bg}"><span class="h-dot"></span><div><b>${x.title}</b><span>${new Date(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} · ${x.answers.length} answers${x.typeChange?' · type changed':''}</span></div><em>View →</em></button></li>`}).reverse().join('')}</ol>`:'<p>No questionnaires yet.</p>')}
 if(tabk==='quizzes'){body=`<div class="qlib-head"><h2>Questionnaires</h2><p class="muted">Each one asks new questions and refines the same profile. Your type can change.</p></div><div class="qlib">${QUIZZES.map(q=>`<button class="qtile ${done.has(q.id)?'done':''}" style="--qc:${q.col};--qb:${q.bg}" onclick="go('take/${q.id}')"><span class="qt-n">${q.items.length} questions · ~${q.mins} min</span><b>${q.title}</b><span>${q.blurb}</span><em>${done.has(q.id)?'✓ Completed · retake':'Start →'}</em></button>`).join('')}</div>`}
 if(tabk==='profile'){body=`<div class="grid2">${sec('Your data',`<p>Everything is stored only in this browser (localStorage). Nothing is sent to a server.</p><div class="cta-row"><button class="btn dark" onclick="exportJSON()">Export JSON</button><button class="btn line" onclick="importJSON()">Import JSON</button></div>`)}
  ${sec('Reset',`<p>Clear only themed questionnaires, or everything including the core assessment.</p><div class="cta-row"><button class="btn line" onclick="if(confirm('Remove all themed questionnaire answers?')){st.extra=[];st.sessions=st.sessions.filter(x=>x.qid==='core');save();dash('profile')}">Clear themed results</button><button class="btn warn" onclick="if(confirm('Delete everything and start over?')){localStorage.removeItem(KEY);st={hist:[]};go('intro')}">Delete all data</button></div>`)}
  ${sec('About Meridian',`<p>An adaptive test of personality, morals and politics. Read how it works and its limits on the <a href="#research">Research</a> page.</p>`)}</div>`}
 app.innerHTML=`<section class="dash" style="--tc:${t.col};--tb:${t.bg}"><header class="topbar"><span class="brand dk"><i></i>Meridian</span><div class="tb-r"><button class="ghost dk" onclick="tab='overview';go('results')">My profile</button></div></header>${nav(tabk)}<div class="dwrap">${body}</div></section>`;
}
function exportJSON(){const b=new Blob([JSON.stringify({app:'meridian',version:2,exported:new Date().toISOString(),state:st,scores:score().s},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='meridian-profile.json';a.click()}
function importJSON(){const i=document.createElement('input');i.type='file';i.accept='application/json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(!d.state||!Array.isArray(d.state.hist))throw 0;st=d.state;save();go('dash/home')}catch(e){alert('That file isn\u2019t a Meridian export.')}};i.click()}

// ---------- themed questionnaire ----------
let tq=null;
function take(qid){const Q=QUIZZES.find(q=>q.id===qid);if(!Q||!st.done)return go('dash/quizzes');
 if(!tq||tq.qid!==qid)tq={qid,ans:[],before:score().s,beforeType:matchTypes(score().s)[0].t.id};
 const i=tq.ans.length,it=Q.items[i];if(!it)return finishTake(Q);
 let bodyH='';
 if(it.t==='L')bodyH=`<div class="likert">${[['Strongly disagree',-2],['Disagree',-1],['Unsure',0],['Agree',1],['Strongly agree',2]].map(([l,v],k)=>`<button class="lk lk${k}" onclick="tAns(${v})"><span class="dot"></span>${l}</button>`).join('')}</div>`;
 if(it.t==='P')bodyH=`<div class="pair"><button class="tile t-a" onclick="tAns(-2)"><span class="tl">A</span>${esc(it.a)}</button><button class="tile t-b" onclick="tAns(2)"><span class="tl">B</span>${esc(it.b)}</button></div><div class="lean"><button onclick="tAns(-1)">Lean A</button><button onclick="tAns(0)">Truly torn</button><button onclick="tAns(1)">Lean B</button></div>`;
 if(it.t==='S')bodyH=`<div class="scene">${it.o.map((o,k)=>`<button class="tile p${k}" onclick="tAns(${k})"><span class="tl">${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>`;
 app.innerHTML=`<section class="quiz" style="--qc:${Q.col}"><header class="topbar"><button class="ghost dk" onclick="tBack()" ${i===0?'disabled':''}>← Back</button><span class="brand dk"><i></i>${Q.title}</span><button class="ghost dk" onclick="tq=null;go('dash/quizzes')">Exit</button></header>
 <div class="qwrap"><div class="prog"><div class="bar"><i style="width:${Math.round(i/Q.items.length*100)}%;background:${Q.col}"></i></div><div class="prog-meta"><span>Question ${i+1} <em>of ${Q.items.length}</em></span><span>${Q.title}</span></div></div>
 <article class="qcard"><div class="qhead"><span class="chip">${{L:'Statement',P:'Trade-off',S:'Scenario'}[it.t]}</span></div><h2>${esc(it.q)}</h2>${bodyH}</article><p class="hint">Answers here are added to your profile. Your type can change.</p></div></section>`}
function tAns(a){const Q=QUIZZES.find(q=>q.id===tq.qid);tq.ans.push({id:Q.items[tq.ans.length].id,a});take(tq.qid)}
function tBack(){tq.ans.pop();take(tq.qid)}
function finishTake(Q){st.extra=(st.extra||[]).filter(h=>!Q.items.some(it=>it.id===h.id)).concat(tq.ans);
 const after=score().s,ty=matchTypes(after)[0].t.id;
 st.sessions.push({kind:'theme',qid:Q.id,title:Q.title,date:Date.now(),answers:tq.ans,before:tq.before,after,beforeType:tq.beforeType,type:ty,typeChange:ty!==tq.beforeType});save();
 const idx=st.sessions.length-1;tq=null;go('changed/'+idx)}
function changed(i){const x=st.sessions[+i];if(!x||!x.before)return go('dash/history');
 const deltas=DK.map(d=>({d,v:x.after[d]-x.before[d]})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));const t=tById(x.type),bt=tById(x.beforeType);
 app.innerHTML=`<section class="dash" style="--tc:${t.col};--tb:${t.bg}">${topbar('What changed',"go('dash/home')")}<div class="dwrap">
 <div class="dh-hero"><div><p class="eyebrow">${x.title} · complete</p><h1>${x.typeChange?'Your type shifted':'Your type held'}</h1><p class="tag">${x.typeChange?`${bt.name} → <b>${t.name}</b>`:`Still ${t.name}, with a sharper profile.`}</p><div class="cta-row"><button class="btn dark" onclick="go('dash/quizzes')">More quizzes</button><button class="btn line" onclick="go('session/${i}')">Review answers</button></div></div>${mascotSVG(t,200)}</div>
 ${sec('Biggest movements',deltas.slice(0,6).map(({d,v})=>`<div class="delta"><b>${DIMS[d].name}</b><span class="dbar"><i class="mid"></i><i class="dv ${v<0?'neg':''}" style="${v<0?`right:50%;width:${Math.min(50,-v*100)}%`:`left:50%;width:${Math.min(50,v*100)}%`}"></i></span><em>${v>=0?'+':''}${Math.round(v*50)}</em></div>`).join('')+`<p class="muted">Points on a 0–100 scale. Small moves mean earlier answers already pinned that dimension down.</p>`)}
 </div></section>`}
const ansLabel=(it,a)=>it.t==='L'?['Strongly disagree','Disagree','Unsure','Agree','Strongly agree'][a+2]:it.t==='P'?(a===-2?'A: '+it.a:a===2?'B: '+it.b:a===0?'Truly torn':a<0?'Lean A ('+it.a+')':'Lean B ('+it.b+')'):it.o[a].t;
function session(i){const x=(st.sessions||[])[+i];if(!x)return go('dash/history');
 app.innerHTML=`<section class="dash">${topbar(x.title,"go('dash/history')")}<div class="dwrap">${sec(x.title,`<p class="muted">${new Date(x.date).toLocaleString()} · ${x.answers.length} answers${x.type?' · result: '+tById(x.type).name:''}</p><ol class="answers">${x.answers.map(h=>{const it=byId[h.id];return it?`<li><p>${esc(it.q)}</p><b>${esc(ansLabel(it,h.a))}</b></li>`:''}).join('')}</ol>${x.before?`<button class="btn line sm" onclick="go('changed/${i}')">See what changed</button>`:''}`)}</div></section>`}

// ---------- research ----------
function lifespanChart(){const W=640,H=260,P=40,ages=[10,20,30,40,50,60,70,80];
 // Illustrative curves: direction from Roberts, Walton & Viechtbauer (2006) and Soto et al. (2011). Magnitudes are NOT real data.
 const L={C:[-.5,-.3,0,.15,.28,.36,.4,.4],A:[-.2,-.2,-.05,.08,.18,.28,.35,.38],N:[.3,.25,.1,0,-.1,-.18,-.22,-.2],O:[0,.22,.18,.12,.06,0,-.08,-.18],E:[.15,.1,.05,.02,0,-.03,-.06,-.1]};
 const col={C:'#3F6E8C',A:'#4F8A5B',N:'#C25B6B',O:'#E9A23B',E:'#6A5F8E'};
 const x=i=>P+i*(W-2*P)/(ages.length-1),y=v=>H/2-v*(H/2-P)*1.6;
 return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Illustrative lifespan trait trends"><line x1="${P}" x2="${W-P}" y1="${y(0)}" y2="${y(0)}" stroke="#D8CFBF" stroke-dasharray="4 4"/>
 ${ages.map((a,i)=>`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${a}</text>`).join('')}
 ${Object.entries(L).map(([k,v])=>`<path d="${v.map((p,i)=>(i?'L':'M')+x(i)+' '+y(p)).join('')}" fill="none" stroke="${col[k]}" stroke-width="3" stroke-linecap="round"/><text x="${W-P+6}" y="${y(v[v.length-1])+4}" fill="${col[k]}" font-weight="700">${k}</text>`).join('')}
 <text x="${P}" y="16">Higher ↑</text><text x="${P}" y="${H-24}">Lower ↓</text></svg>`}
function rarityChart(){const L=TYPES.slice().sort((a,b)=>RARITY[b.id].share-RARITY[a.id].share);const mx=RARITY[L[0].id].share;
 return `<div class="inc-chart">${L.map(t=>`<div class="ic-row"><span>${t.name}</span><i style="width:${RARITY[t.id].share/mx*100}%;background:${t.col}"></i><em>${RARITY[t.id].share.toFixed(1)}%</em></div>`).join('')}</div>`}
function research(){
 const TL=[['c. 400 BC – 200 AD','Four temperaments','Hippocrates and later Galen link personality to four bodily "humours": sanguine, choleric, melancholic, phlegmatic.'],['1921','Jung\u2019s Psychological Types','Introduces introversion/extraversion and cognitive "functions" — philosophical rather than empirical.'],['1936','The lexical hypothesis','Allport & Odbert catalogue thousands of English trait words, laying the groundwork for factor-based models.'],['1940s–1962','Myers–Briggs Type Indicator','Isabel Briggs Myers and Katharine Briggs turn Jung\u2019s ideas into a 16-type questionnaire; it becomes hugely popular in workplaces.'],['1949','Cattell\u2019s 16PF','Factor analysis of trait words yields 16 personality factors.'],['1954','Two-axis politics','Hans Eysenck proposes a two-dimensional model of political attitudes, an ancestor of today\u2019s political compass charts.'],['1961–1990','The Big Five emerges','Tupes & Christal (1961) find five recurring factors; Goldberg (1990) and Costa & McCrae\u2019s NEO inventories consolidate the model.'],['2004','HEXACO','Ashton & Lee add Honesty–Humility as a sixth factor, based on cross-language lexical studies.'],['2004–2023','Moral Foundations Theory','Haidt and colleagues propose several moral foundations; MFQ-2 (Atari et al., 2023) splits fairness into Equality and Proportionality.']];
 const FIND=[['Traits are stable but not fixed','Rank-order stability of personality rises through adulthood, yet mean levels keep changing across the lifespan (Roberts & DelVecchio, 2000; Roberts et al., 2006).'],['The maturity principle','On average people become more conscientious, more agreeable and less neurotic from adolescence into middle age (Roberts, Walton & Viechtbauer, 2006).'],['Openness peaks young','Cross-sectional data from over a million people suggest Openness rises into early adulthood and then declines slowly (Soto, John, Gosling & Potter, 2011).'],['Personality and politics','Openness is consistently associated with liberal attitudes and Conscientiousness with conservative attitudes (Carney et al., 2008; Gerber et al., 2010).'],['Heritability','Twin and family studies attribute roughly 40% of the variation in Big Five traits to genetic differences (Vukasović & Bratko, 2015).'],['Types vs. traits','MBTI assigns many people a different type on retest, and personality scores fall on continuous, roughly bell-shaped distributions rather than in distinct clusters (Pittenger, 2005).'],['Traits predict life outcomes','Personality traits predict mortality, divorce and occupational attainment about as well as socioeconomic status and cognitive ability do (Roberts et al., 2007).'],['Change is possible','A meta-analysis of interventions found that personality traits, especially Neuroticism, shifted measurably after therapy (Roberts et al., 2017).']];
 const REFS=['Allport, G. W., & Odbert, H. S. (1936). Trait-names: A psycho-lexical study. Psychological Monographs, 47(1).','Ashton, M. C., & Lee, K. (2007). Empirical, theoretical, and practical advantages of the HEXACO model. Personality and Social Psychology Review, 11(2), 150–166.','Atari, M., Haidt, J., Graham, J., et al. (2023). Morality beyond the WEIRD. Journal of Personality and Social Psychology, 125(5), 1157–1188.','Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance. Personnel Psychology, 44(1), 1–26.','Carney, D. R., Jost, J. T., Gosling, S. D., & Potter, J. (2008). The secret lives of liberals and conservatives. Political Psychology, 29(6), 807–840.','Feinberg, M., & Willer, R. (2015). From gulf to bridge: When do moral arguments facilitate political influence? Personality and Social Psychology Bulletin, 41(12), 1665–1681.','Feldman, S., & Johnston, C. (2014). Understanding the determinants of political ideology. Political Psychology, 35(3), 337–358.','Gerber, A. S., Huber, G. A., Doherty, D., Dowling, C. M., & Ha, S. E. (2010). Personality and political attitudes. American Political Science Review, 104(1), 111–133.','Goldberg, L. R. (1990). An alternative "description of personality": The Big-Five factor structure. JPSP, 59(6), 1216–1229.','Graham, J., Haidt, J., & Nosek, B. A. (2009). Liberals and conservatives rely on different sets of moral foundations. JPSP, 96(5), 1029–1046.','Judge, T. A., Higgins, C. A., Thoresen, C. J., & Barrick, M. R. (1999). The Big Five personality traits, general mental ability, and career success across the life span. Personnel Psychology, 52(3), 621–652.','Judge, T. A., Livingston, B. A., & Hurst, C. (2012). Do nice guys — and gals — really finish last? JPSP, 102(2), 390–407.','Malouff, J. M., Thorsteinsson, E. B., Schutte, N. S., Bhullar, N., & Rooke, S. E. (2010). The Five-Factor Model of personality and relationship satisfaction of intimate partners: A meta-analysis. Journal of Research in Personality, 44(1), 124–127.','Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator. Consulting Psychology Journal, 57(3), 210–221.','Roberts, B. W., & DelVecchio, W. F. (2000). The rank-order consistency of personality traits from childhood to old age. Psychological Bulletin, 126(1), 3–25.','Roberts, B. W., Walton, K. E., & Viechtbauer, W. (2006). Patterns of mean-level change in personality traits across the life course. Psychological Bulletin, 132(1), 1–25.','Roberts, B. W., Kuncel, N. R., Shiner, R., Caspi, A., & Goldberg, L. R. (2007). The power of personality. Perspectives on Psychological Science, 2(4), 313–345.','Roberts, B. W., Luo, J., Briley, D. A., et al. (2017). A systematic review of personality trait change through intervention. Psychological Bulletin, 143(2), 117–141.','Soto, C. J., John, O. P., Gosling, S. D., & Potter, J. (2011). Age differences in personality traits from 10 to 65. JPSP, 100(2), 330–348.','Vukasović, T., & Bratko, D. (2015). Heritability of personality: A meta-analysis of behavior genetic studies. Psychological Bulletin, 141(4), 769–785.'];
 app.innerHTML=`<section class="research">${st.done?`<header class="topbar"><span class="brand dk"><i></i>Meridian</span><div class="tb-r"><button class="ghost dk" onclick="tab='overview';go('results')">My profile</button></div></header>${nav('research')}`:topbar('Research')}
 <div class="dwrap rs">
 <div class="rs-hero"><p class="eyebrow">Research</p><h1>What science actually knows<br><em>about personality.</em></h1><p class="lede-d">The models behind Meridian, how personality changes across a life, and where our own estimates come from.</p>
 <nav class="rs-toc">${[['science','The science'],['history','History of type models'],['lifespan','Across the lifespan'],['findings','Key findings'],['meridian','Meridian\u2019s method'],['refs','References']].map(([k,l])=>`<a href="#research" onclick="document.getElementById('${k}').scrollIntoView({behavior:'smooth'});return false">${l}</a>`).join('')}</nav></div>
 <div class="card" id="science"><h3>The science in brief</h3><div class="grid3"><div><b>Big Five</b><p>Openness, Conscientiousness, Extraversion, Agreeableness and Neuroticism. Found again and again across languages, ages and methods. Each is a continuous scale.</p></div><div><b>Moral foundations</b><p>Intuitive moral concerns — care, equality, proportionality, loyalty, authority, purity — that people weigh differently and that track politics.</p></div><div><b>Political dimensions</b><p>Economic and social attitudes are partly separate. One left–right line misses many people; two axes miss some more.</p></div></div></div>
 <div class="card" id="history"><h3>A short history of type models</h3><ol class="timeline">${TL.map(([d,h,p])=>`<li><span>${d}</span><b>${h}</b><p>${p}</p></li>`).join('')}</ol></div>
 <div class="card" id="lifespan"><h3>How traits shift across the lifespan <span class="badge">Illustrative chart</span></h3>${lifespanChart()}<p class="muted"><b>Illustrative, not real data.</b> The direction of each line follows published findings (Roberts, Walton &amp; Viechtbauer, 2006; Soto et al., 2011): Conscientiousness and Agreeableness rise through adulthood, Neuroticism falls, and Openness rises in youth then declines in later life. The shapes and sizes are drawn for readability, not taken from any dataset.</p></div>
 <div class="card" id="findings"><h3>Key findings</h3><div class="grid2 find">${FIND.map(([h,p])=>`<div><b>${h}</b><p>${p}</p></div>`).join('')}</div></div>
 <div class="card" id="meridian"><h3>Meridian\u2019s method</h3>
  <div class="grid2 find"><div><b>What we score</b><p>15 dimensions: four political axes, the Big Five, and six MFQ-2 moral foundations. Each answer updates every dimension it loads on.</p></div><div><b>Adaptive questions</b><p>The core test picks each next question by what the model is least sure of, unlocks follow-ups based on how you lean, and stops once confidence is high (24–40 questions).</p></div>
  <div><b>Themed questionnaires</b><p>Eight 12–14 question sets (romance, career, politics, morals, faith, stress, social life, thinking). Answers pool with your core answers, so your profile and type can shift.</p></div><div><b>Types</b><p>16 type centres were placed by hand in the 15-dimension space. Your type is the nearest centre; "fit" falls with distance.</p></div>
  <div><b>Rarity estimates</b><p>We simulate 12,000 people, giving each dimension an independent normal distribution (SD 0.45, clipped), and count which type each lands nearest. Real traits correlate and real populations differ, so these shares are model estimates, not survey results.</p></div><div><b>Income &amp; net worth</b><p>US baselines (BLS median full-time earnings; Fed SCF 2022 median net worth) adjusted by trait direction from published research. Sizes are our assumptions. Illustrative only.</p></div>
  <div><b>Compatibility</b><p>Weighted similarity and complementarity on dimensions relevant to each area of life, plus penalties when both people score low on Agreeableness or high on Neuroticism. Not validated against relationship outcomes.</p></div><div><b>Honest limits</b><p>Item weights come from the literature but were not fitted to a sample. There are no norms, no percentiles for traits, and no clinical use. A thoughtful mirror, not a diagnosis.</p></div></div>
  <h4 class="mt">Model-estimated type shares <span class="badge">Model estimate</span></h4>${rarityChart()}</div>
 <div class="card" id="refs"><h3>References</h3><ol class="refs">${REFS.map(r=>`<li>${r}</li>`).join('')}</ol></div>
 </div></section>`}
method=research;

// ---------- share card: draw mascot onto canvas ----------
shareCard=function(){const{s}=score(),t=matchTypes(s)[0].t;
 const bars=POL.map((d,i)=>`<text x="80" y="${1010+i*62}" font-size="26" fill="#6B6158" font-family="Helvetica,Arial">${DIMS[d].name}</text><rect x="330" y="${990+i*62}" width="670" height="14" rx="7" fill="#E7DDCB"/><circle cx="${330+pctl(s[d])/100*670}" cy="${997+i*62}" r="16" fill="${t.col}" stroke="#2A2420" stroke-width="4"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#F7F1E6"/><rect x="40" y="40" width="1000" height="860" rx="48" fill="${t.bg}"/>
 <text x="1000" y="380" text-anchor="end" font-size="360" font-weight="900" fill="${t.col}" opacity=".18" font-family="Impact,Helvetica">${pad2(t.n)}</text>
 <text x="90" y="130" font-size="30" letter-spacing="6" fill="#6B6158" font-family="Helvetica,Arial">MERIDIAN · MY TYPE</text>
 <text x="90" y="230" font-size="92" font-weight="700" fill="#2A2420" font-family="Georgia,serif">${t.name}</text>
 <text x="90" y="290" font-size="34" font-style="italic" fill="#4A423B" font-family="Georgia,serif">${t.tag.replace(/&/g,'&amp;')}</text>${bars}
 <text x="80" y="1300" font-size="26" fill="#6B6158" font-family="Helvetica,Arial">Home: ${t.isl.name.replace(/&/g,'&amp;')} · ${RARITY[t.id].share.toFixed(1)}% est. · justuseflint.github.io/meridian</text></svg>`;
 const img=new Image(),m=new Image();let n=0;const go2=()=>{if(++n<2)return;const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');g.drawImage(img,0,0);const h=560,w=m.width*h/m.height;g.drawImage(m,540-w/2+120,330,w,h);
  c.toBlob(b=>{const f=new File([b],'meridian-'+t.id+'.png',{type:'image/png'});const url=URL.createObjectURL(b);
   sheet.innerHTML=`<div class="sheet-bg" onclick="closeSheet()"></div><div class="sheet-card share" role="dialog"><button class="x" onclick="closeSheet()">×</button><h2>Your share card</h2><img src="${url}" alt="Share card"><div class="cta-row"><a class="btn dark" download="${f.name}" href="${url}">Download PNG</a>${navigator.canShare&&navigator.canShare({files:[f]})?`<button class="btn amber" id="nshare">Share…</button>`:''}</div></div>`;
   sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'));const ns=$('#nshare');if(ns)ns.onclick=()=>navigator.share({files:[f],title:'My Meridian type'}).catch(()=>{});})};
 img.onload=go2;m.onload=go2;m.src='img/m-'+t.id+'.webp';img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)};

// migrate v1 saves: done but no sessions
if(st.done&&!st.sessions){st.sessions=[{kind:'core',qid:'core',title:'Core assessment',date:Date.now(),answers:st.hist.slice(),type:matchTypes(score().s)[0].t.id}];st.extra=[];save()}
render();
