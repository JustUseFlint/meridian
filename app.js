const $=s=>document.querySelector(s), app=$('#app'), sheet=$('#sheet');
const KEY='meridian.v1', MIN=24, MAX=40, THRESH=.5;
const DK=Object.keys(DIMS), POL=['econ','auth','trad','glob'], B5=['O','C','E','A','N'], MOR=['care','equa','prop','loya','autr','puri'];
let st=JSON.parse(localStorage.getItem(KEY)||'null')||{hist:[]};
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const byId=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}

// ---------- scoring ----------
function score(hist=st.hist){
 const sum={},wt={};DK.forEach(d=>{sum[d]=0;wt[d]=.6});
 for(const h of hist){const it=byId[h.id];
  if(it.t==='S'){for(const[d,w]of Object.entries(it.o[h.a].w)){sum[d]+=Math.sign(w)*Math.min(1,Math.abs(w)+.25)*Math.abs(w);wt[d]+=Math.abs(w)}}
  else for(const[d,w]of Object.entries(it.w)){sum[d]+=(h.a/2)*Math.sign(w)*Math.abs(w);wt[d]+=Math.abs(w)}}
 const s={},u={};DK.forEach(d=>{s[d]=Math.max(-1,Math.min(1,sum[d]/wt[d]*1.35));u[d]=1/Math.sqrt(1+2.2*(wt[d]-.6))});
 return{s,u};
}
function nextItem(){
 const n=st.hist.length,{s,u}=score();const used=new Set(st.hist.map(h=>h.id));
 if(n>=MAX)return null;
 if(n>=MIN&&Math.max(...DK.map(d=>u[d]))<THRESH)return null;
 let best=null,bv=-1;
 for(const it of ITEMS){if(used.has(it.id))continue;if(it.if&&!it.if(s))continue;
  const ws=it.t==='S'?it.o.reduce((a,o)=>{for(const[d,w]of Object.entries(o.w))a[d]=Math.max(a[d]||0,Math.abs(w));return a},{}):it.w;
  let v=Object.entries(ws).reduce((a,[d,w])=>a+Math.abs(w)*u[d],0);
  if(it.if)v+=.35; // follow-ups get priority once unlocked
  if(n&&st.hist[n-1]&&byId[st.hist[n-1].id].t===it.t)v-=.15; // vary formats
  v+=(hash(it.id+n)%100)/1000;
  if(v>bv){bv=v;best=it}}
 if(n>=MIN&&bv<.32)return null;
 return best;
}
function matchTypes(s){
 return TYPES.map(t=>{let d=0;POL.forEach((k,i)=>d+=1.3*(s[k]-t.c[i])**2);B5.forEach((k,i)=>d+=.8*(s[k]-t.c[4+i])**2);MOR.forEach((k,i)=>d+=.6*(s[k]-(t.m[i]*2-1))**2);return{t,d}})
  .sort((a,b)=>a.d-b.d).map(r=>({...r,fit:Math.round(100*Math.exp(-r.d/6))}));
}

// ---------- router ----------
function go(r){location.hash=r}
window.addEventListener('hashchange',render);
function render(){
 const r=location.hash.slice(1)||(st.done?'results':'intro');
 document.body.className='r-'+r.split('/')[0];window.scrollTo(0,0);
 ({intro,quiz,results,map,method}[r.split('/')[0]]||intro)(r.split('/')[1]);
}

// ---------- intro (dark, glassy, avatar grid) ----------
function intro(){
 app.innerHTML=`<section class="intro">
 <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
 <header class="topbar dark"><span class="brand"><i></i>Meridian</span><button class="ghost" onclick="go('map')">Archipelago</button></header>
 <div class="intro-grid">
  <div class="intro-copy">
   <p class="eyebrow">Personality × Politics × Morals</p>
   <h1>Not a letter code.<br><em>A whole map of you.</em></h1>
   <p class="lede">An adaptive test that reads how you think, what you value, and where you land across four political axes — then sends you to the island of your type.</p>
   <div class="cta-row"><button class="btn amber" onclick="startQuiz()">${st.hist.length&&!st.done?'Resume test':'Begin the test'}</button><button class="btn glass" onclick="go('method')">How it works</button></div>
   <ul class="facts"><li><b>24–40</b><span>questions, chosen live</span></li><li><b>15</b><span>dimensions scored</span></li><li><b>16</b><span>types &amp; islands</span></li></ul>
  </div>
  <div class="glass avatar-card">
   <p class="mini">Who lives here</p>
   <div class="avatars">${TYPES.map(t=>`<button class="av" style="--c:${t.bg}" onclick="openType('${t.id}')" aria-label="${t.name}">${mascotSVG(t,64)}</button>`).join('')}</div>
   <p class="mini dim">Tap any resident to meet them.</p>
  </div>
 </div></section>`;
}
function startQuiz(){if(st.done){st={hist:[]};save()}go('quiz')}

// ---------- quiz ----------
let pendingPoll=null;
function quiz(){
 if(pendingPoll)return pollView();
 const it=nextItem();if(!it){st.done=true;save();return go('results')}
 const n=st.hist.length+1,{u}=score();const conf=Math.round(100*DK.reduce((a,d)=>a+Math.min(1,(1-u[d])/(1-THRESH)),0)/DK.length);
 const est=Math.max(MIN,Math.min(MAX,n+Math.round(DK.filter(d=>u[d]>=THRESH).length*1.6)));
 const fmt={L:'Statement',P:'Trade-off',S:'Scenario'}[it.t];
 const follow=it.if?`<span class="chip amber-chip">Follow-up · based on your answers</span>`:'';
 let body='';
 if(it.t==='L')body=`<div class="likert">${[['Strongly disagree',-2],['Disagree',-1],['Unsure',0],['Agree',1],['Strongly agree',2]].map(([l,v],k)=>`<button class="lk lk${k}" onclick="answer(${v})"><span class="dot"></span>${l}</button>`).join('')}</div>`;
 if(it.t==='P')body=`<div class="pair"><button class="tile t-a" onclick="answer(-2)"><span class="tl">A</span>${esc(it.a)}</button><button class="tile t-b" onclick="answer(2)"><span class="tl">B</span>${esc(it.b)}</button></div>
  <div class="lean"><button onclick="answer(-1)">Lean A</button><button onclick="answer(0)">Truly torn</button><button onclick="answer(1)">Lean B</button></div>`;
 if(it.t==='S')body=`<div class="scene">${it.o.map((o,k)=>`<button class="tile p${k}" onclick="answer(${k})"><span class="tl">${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>`;
 app.innerHTML=`<section class="quiz">
 <header class="topbar"><button class="ghost dk" onclick="back()" ${n===1?'disabled':''}>← Back</button><span class="brand dk"><i></i>Meridian</span><button class="ghost dk" onclick="go('intro')">Exit</button></header>
 <div class="qwrap">
  <div class="prog"><div class="bar"><i style="width:${Math.round((n-1)/est*100)}%"></i></div><div class="prog-meta"><span>Question ${n} <em>of ~${est}</em></span><span>Model confidence ${conf}%</span></div></div>
  <article class="qcard">
   <div class="qhead"><span class="chip">${fmt}</span>${follow}</div>
   <h2>${esc(it.q)}</h2>${body}
  </article>
  <p class="hint">${it.t==='P'?'Both options are reasonable. Pick the one you\u2019d actually choose.':it.t==='S'?'Go with your first instinct, not the ideal answer.':'There are no right answers \u2014 this item loads on several dimensions at once.'}</p>
 </div></section>`;
}
function answer(a){const it=nextItem();st.hist.push({id:it.id,a});save();
 if(it.t!=='L'&&st.hist.length%4===0)pendingPoll={it,a};
 quiz();}
function back(){st.hist.pop();save();pendingPoll=null;quiz()}
function pollView(){
 const{it,a}=pendingPoll;const opts=it.t==='S'?it.o.map(o=>o.t):[it.a,'Torn',it.b];
 let raw=opts.map((_,k)=>(8+hash(it.id+"x"+k)%60)**1.6);const tot=raw.reduce((x,y)=>x+y);const pct=raw.map(v=>Math.round(v/tot*100));
 const mine=it.t==='S'?a:(a<0?0:a>0?2:1);
 app.innerHTML=`<section class="poll"><div class="poll-bg">${opts.map((o,k)=>`<span style="--h:${hash(o)%360}"></span>`).join('')}</div>
 <div class="poll-card glass"><p class="eyebrow">How others answered</p><h2>${esc(it.q)}</h2>
 ${opts.map((o,k)=>`<div class="pbar ${k===mine?'me':''}"><i style="--w:${pct[k]}%"></i><span>${esc(o)}${k===mine?' · <b>you</b>':''}</span><em>${pct[k]}%</em></div>`).join('')}
 <p class="demo">Demo data for illustration — not real responses.</p>
 <button class="btn amber wide" onclick="pendingPoll=null;quiz()">Continue</button></div></section>`;
}

// ---------- results ----------
let tab='overview';
function results(){
 if(!st.hist.length)return go('intro');
 const{s,u}=score();const ranked=matchTypes(s);const top=ranked[0],t=top.t,alt=ranked[1];
 app.innerHTML=`<section class="results" style="--tc:${t.col};--tb:${t.bg}">
 <header class="topbar"><span class="brand dk"><i></i>Meridian</span><div><button class="ghost dk" onclick="go('map')">Archipelago</button><button class="ghost dk" onclick="shareCard()">Share</button></div></header>
 <div class="hero">
  <div class="hero-num" aria-hidden="true">${String(t.n).padStart(2,'0')}</div>
  <div class="hero-copy"><p class="eyebrow">Your type · ${top.fit}% fit</p><h1>${t.name}</h1><p class="tag">“${t.tag}”</p>
   <div class="hero-stats"><div><b>${t.animal}</b><span>Mascot</span></div><div><b>${t.isl.name}</b><span>Home island</span></div><div><b>${st.hist.length}</b><span>Questions</span></div></div></div>
  <div class="hero-mascot">${mascotSVG(t,260)}</div>
 </div>
 <nav class="tabs" role="tablist">${['overview','compass','traits','morals','matches','glossary'].map(k=>`<button role="tab" class="${tab===k?'on':''}" onclick="tab='${k}';results()">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</nav>
 <div class="panel">${panels[tab](s,u,t,alt,ranked)}</div>
 <footer class="foot"><button class="btn line" onclick="if(confirm('Start over? Your current result will be cleared.'))startQuiz()">Retake</button><button class="btn dark" onclick="shareCard()">Get share card</button></footer>
 </section>`;
 const tb=document.querySelector('.tabs .on');tb&&tb.scrollIntoView({inline:'center',block:'nearest'});
}
const pctl=v=>Math.round((v+1)*50);
function barRow(d,s,u){const D=DIMS[d],v=s[d];return `<div class="drow"><div class="dlab"><span>${D.lo}</span><b>${D.name}</b><span>${D.hi}</span></div>
 <div class="dtrack"><i class="mid"></i><i class="fill" style="${v<0?`right:50%;width:${-v*50}%`:`left:50%;width:${v*50}%`}"></i><i class="knob" style="left:${pctl(v)}%"></i></div>
 <div class="dconf">${conf(u[d])}</div></div>`}
const conf=x=>{const c=Math.round((1-x)*100);return `<span class="cm"><i style="width:${c}%"></i></span>${c<55?'Low':c<68?'Fair':'Good'} confidence`};
function word(v,lo,hi){const a=Math.abs(v);return a<.15?'balanced':(a<.45?'leaning ':'strongly ')+(v<0?lo.toLowerCase():hi.toLowerCase())}
const panels={
 overview(s,u,t,alt){return `<div class="grid2">
  <div class="card"><h3>Summary</h3><p class="big">${t.sum}</p><p>You read as <b>${word(s.econ,'equality','markets')}</b> on economics, <b>${word(s.auth,'liberty','order')}</b> on authority, <b>${word(s.trad,'progress','tradition')}</b> on culture and <b>${word(s.glob,'national','global')}</b> in scope.</p>
   <p class="muted">Runner-up: <a href="#" onclick="openType('${alt.t.id}');return false">${alt.t.name}</a> (${alt.fit}% fit). Types are a summary — your dimension scores below are the real result.</p></div>
  <div class="card island-card" style="background:${t.bg}"><h3>${t.isl.name}</h3>${islandSVG(t)}<p class="muted">Home of ${t.name}. ${t.isl.props.map(p=>p).join(', ')} — the island reflects your compass.</p><button class="btn line sm" onclick="go('map')">See all islands</button></div>
  <div class="card"><h3>Strengths</h3><ul class="pill-list good">${t.str.map(x=>`<li>${x}</li>`).join('')}${traitNote(s,true)}</ul></div>
  <div class="card"><h3>Watch-outs</h3><ul class="pill-list warn">${t.wk.map(x=>`<li>${x}</li>`).join('')}${traitNote(s,false)}</ul></div></div>`},
 compass(s,u){return `<div class="grid2"><div class="card"><h3>Economic × Authority</h3>${plot(s)}<p class="muted">The classic two axes — shown here as one slice of four.</p></div>
  <div class="card"><h3>Four political axes</h3>${POL.map(d=>barRow(d,s,u)).join('')}<p class="muted">Culture and scope are measured separately because they often diverge from economics (Feldman &amp; Johnston, 2014).</p></div></div>`},
 traits(s,u){return `<div class="card"><h3>Big Five personality</h3>${B5.map(d=>barRow(d,s,u)).join('')}<p class="muted">Continuous scores, not boxes. Items in the style of the public-domain IPIP, balanced-keyed. No population norms, so these are relative to the scale midpoint, not percentiles.</p></div>`},
 morals(s,u){return `<div class="grid2"><div class="card"><h3>Moral foundations</h3>${radar(s)}</div><div class="card"><h3>What drives your judgments</h3>${MOR.map(d=>`<div class="mrow"><b>${DIMS[d].name}</b><span class="mbar"><i style="width:${pctl(s[d])}%"></i></span><em>${pctl(s[d])}</em></div>`).join('')}<p class="muted">Six foundations from MFQ-2 (Atari et al., 2023). Scores are 0–100 on this test’s own scale.</p></div></div>`},
 matches(s,u,t,alt){const ppl=[...t.fam.map(f=>[...f,t]),[...alt.t.fam[0],alt.t]];return `<div class="card"><h3>Shares tendencies with</h3><p class="muted">Approximate, based on public record of stated views and conduct — not a claim about anyone’s inner psychology. People appear across the whole spectrum.</p>
  <div class="people">${ppl.map(([nm,era,ty])=>`<div class="person"><span class="mono" style="background:${ty.bg};color:${ty.col}">${nm.split(' ').filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join('')}</span><div><b>${nm}</b><span>${era==='historical'?'Historical':'Contemporary'} · ${ty.name}</span></div></div>`).join('')}</div></div>`},
 glossary(){return `<div class="card"><h3>Glossary</h3><dl class="gloss">${GLOSSARY.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="muted"><a href="#method">Method &amp; references →</a></p></div>`}
};
function traitNote(s,good){const d=B5.slice().sort((a,b)=>Math.abs(s[b])-Math.abs(s[a]))[0],v=s[d];
 const g={O:['Generates fresh ideas','Values the familiar'],C:['Follows through','Adapts on the fly'],E:['Energises groups','Listens deeply'],A:['Cooperative','Holds firm under pressure'],N:['Emotionally attuned','Unflappable']},
 b={O:['Can chase novelty','May resist new evidence'],C:['Perfectionism','Loose ends'],E:['Talks over others','Hard to read'],A:['People-pleasing','Bluntness costs allies'],N:['Worry spirals','Can miss real risks']};
 return `<li class="trait">${(good?g:b)[d][v>=0?0:1]} <small>from your ${DIMS[d].name}</small></li>`}
function plot(s){const x=150+s.econ*120,y=150-(-s.auth)*-120;return `<svg viewBox="0 0 300 300" class="plot"><rect x="30" y="30" width="120" height="120" fill="#F6D9D2"/><rect x="150" y="30" width="120" height="120" fill="#DCE6F1"/><rect x="30" y="150" width="120" height="120" fill="#DDEEDD"/><rect x="150" y="150" width="120" height="120" fill="#F4EAC9"/>
 <path d="M150 30V270M30 150H270" stroke="#2A2420" stroke-width="1.5"/><text x="150" y="22" text-anchor="middle">Order</text><text x="150" y="292" text-anchor="middle">Liberty</text><text x="26" y="154" text-anchor="end" transform="rotate(-90 22 150)" >Equality</text><text x="278" y="154" transform="rotate(90 278 150)" text-anchor="middle">Markets</text>
 ${TYPES.map(t=>`<circle cx="${150+t.c[0]*120}" cy="${150-t.c[1]*120}" r="4" fill="${t.col}" opacity=".5"><title>${t.name}</title></circle>`).join('')}
 <circle cx="${x}" cy="${150-s.auth*120}" r="11" fill="#2A2420"/><circle cx="${x}" cy="${150-s.auth*120}" r="5" fill="#F3B13C"/></svg>`}
function radar(s){const c=150,R=105,pts=MOR.map((d,i)=>{const a=-Math.PI/2+i*Math.PI/3,r=R*(s[d]+1)/2;return[c+Math.cos(a)*r,c+Math.sin(a)*r,a]});
 return `<svg viewBox="0 0 300 300" class="plot">${[.33,.66,1].map(k=>`<polygon points="${MOR.map((_,i)=>{const a=-Math.PI/2+i*Math.PI/3;return(c+Math.cos(a)*R*k)+','+(c+Math.sin(a)*R*k)}).join(' ')}" fill="none" stroke="#D8CFBF"/>`).join('')}
 <polygon points="${pts.map(p=>p[0]+','+p[1]).join(' ')}" fill="var(--tc)" fill-opacity=".35" stroke="var(--tc)" stroke-width="2.5"/>
 ${MOR.map((d,i)=>{const a=-Math.PI/2+i*Math.PI/3;return `<text x="${c+Math.cos(a)*(R+24)}" y="${c+Math.sin(a)*(R+24)+4}" text-anchor="middle">${DIMS[d].name}</text>`}).join('')}</svg>`}

// ---------- archipelago ----------
function map(){
 const mine=st.done?matchTypes(score().s)[0].t.id:null;
 app.innerHTML=`<section class="map"><header class="topbar"><button class="ghost dk" onclick="history.length>1?history.back():go('intro')">← Back</button><span class="brand dk"><i></i>The Archipelago</span><span></span></header>
 <div class="map-intro"><h1>Sixteen islands.<br><em>One of them is yours.</em></h1><p>Islands drift by compass: equality to the west, markets to the east, liberty to the south, order to the north.</p></div>
 <div class="sea">${TYPES.slice().sort((a,b)=>(b.c[1]-a.c[1])||(a.c[0]-b.c[0])).map(t=>`<button class="isle ${t.id===mine?'mine':''}" onclick="openType('${t.id}')" style="--tb:${t.bg}">${islandSVG(t,{w:240})}<span><b>${String(t.n).padStart(2,'0')}</b> ${t.name}${t.id===mine?' · you':''}</span></button>`).join('')}</div></section>`;
}
function openType(id){const t=TYPES.find(x=>x.id===id);
 sheet.innerHTML=`<div class="sheet-bg" onclick="closeSheet()"></div><div class="sheet-card" style="--tb:${t.bg};--tc:${t.col}" role="dialog" aria-label="${t.name}">
 <button class="x" onclick="closeSheet()" aria-label="Close">×</button>
 <div class="sh-top">${mascotSVG(t,120)}<div><p class="eyebrow">No. ${String(t.n).padStart(2,'0')} · ${t.animal}</p><h2>${t.name}</h2><p class="tag">“${t.tag}”</p></div></div>
 <p>${t.sum}</p><div class="sh-isl">${islandSVG(t)}<b>${t.isl.name}</b></div>
 <div class="grid2 tight"><div><h4>Strengths</h4><ul>${t.str.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>Watch-outs</h4><ul>${t.wk.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
 <h4>Shares tendencies with</h4><p class="muted">${t.fam.map(f=>f[0]).join(' · ')} <br><small>Approximate, from public record.</small></p></div>`;
 sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'));}
function closeSheet(){sheet.classList.remove('open');setTimeout(()=>sheet.hidden=true,250)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});

// ---------- method ----------
function method(){app.innerHTML=`<section class="method"><header class="topbar"><button class="ghost dk" onclick="history.back()">← Back</button><span class="brand dk"><i></i>Method</span><span></span></header><article class="card prose">
 <h1>How Meridian works</h1>
 <p><b>What we measure.</b> 15 dimensions: four political axes (economic, authority, culture, scope), the Big Five personality traits, and the six moral foundations of MFQ-2.</p>
 <p><b>Why the questions feel different.</b> Most tests ask "Do you agree the rich should pay more tax?" — the answer is the label. Here, items are trade-offs between two good things, concrete scenarios, and statements that load on several dimensions at once, with balanced keying.</p>
 <p><b>Adaptive.</b> After each answer the model updates every score and its uncertainty, then picks the question that will tell it the most about what it is least sure of. Follow-ups unlock based on where you are leaning. The test stops when every dimension is measured well enough (24–40 questions).</p>
 <p><b>Honest limits.</b> Item weights are set by hand from the literature, not fitted to a population sample, and there are no norms. Treat this as a thoughtful mirror, not a diagnosis. "How others answered" bars are demo data. Famous-person matches are approximate, based on public record.</p>
 <h3>Key sources</h3><ul class="refs"><li>Goldberg et al. (2006). The International Personality Item Pool. <i>J. Research in Personality</i>, 40, 84–96.</li><li>Atari, Haidt, Graham et al. (2023). Morality beyond the WEIRD. <i>JPSP</i>, 125(5), 1157–1188.</li><li>Graham, Haidt &amp; Nosek (2009). <i>JPSP</i>, 96(5), 1029–1046.</li><li>Schwartz (1992). Universals in the content and structure of values. <i>Adv. Exp. Soc. Psych.</i>, 25.</li><li>Altemeyer (1981). <i>Right-Wing Authoritarianism</i>.</li><li>Pratto et al. (1994). Social dominance orientation. <i>JPSP</i>, 67(4).</li><li>Iyer et al. (2012). Understanding libertarian morality. <i>PLoS ONE</i>.</li><li>Feldman &amp; Johnston (2014). <i>Political Psychology</i>, 35(3).</li><li>McCrae &amp; Costa (1989); Pittenger (2005) on MBTI validity.</li><li>van der Linden &amp; Glas (2000). <i>Computerized Adaptive Testing</i>.</li></ul></article></section>`}

// ---------- share card ----------
function shareCard(){const{s}=score(),t=matchTypes(s)[0].t;
 const bars=POL.map((d,i)=>`<text x="80" y="${1010+i*62}" font-size="26" fill="#6B6158" font-family="Helvetica,Arial">${DIMS[d].name}</text><rect x="330" y="${990+i*62}" width="670" height="14" rx="7" fill="#E7DDCB"/><circle cx="${330+pctl(s[d])/100*670}" cy="${997+i*62}" r="16" fill="${t.col}" stroke="#2A2420" stroke-width="4"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#F7F1E6"/><rect x="40" y="40" width="1000" height="860" rx="48" fill="${t.bg}"/>
 <text x="1000" y="380" text-anchor="end" font-size="360" font-weight="900" fill="${t.col}" opacity=".18" font-family="Impact,Helvetica">${String(t.n).padStart(2,'0')}</text>
 <text x="90" y="130" font-size="30" letter-spacing="6" fill="#6B6158" font-family="Helvetica,Arial">MERIDIAN · MY TYPE</text>
 <text x="90" y="230" font-size="92" font-weight="700" fill="#2A2420" font-family="Georgia,serif">${t.name}</text>
 <text x="90" y="290" font-size="34" font-style="italic" fill="#4A423B" font-family="Georgia,serif">${t.tag.replace(/&/g,'&amp;')}</text>
 <g transform="translate(280 360) scale(2.6)">${mascotSVG(t).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g>${bars}
 <text x="80" y="1300" font-size="26" fill="#6B6158" font-family="Helvetica,Arial">Home: ${t.isl.name.replace(/&/g,'&amp;')} · justuseflint.github.io/meridian</text></svg>`;
 const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=1080;c.height=1350;c.getContext('2d').drawImage(img,0,0);
  c.toBlob(async b=>{const f=new File([b],'meridian-'+t.id+'.png',{type:'image/png'});const url=URL.createObjectURL(b);
   sheet.innerHTML=`<div class="sheet-bg" onclick="closeSheet()"></div><div class="sheet-card share" role="dialog"><button class="x" onclick="closeSheet()">×</button><h2>Your share card</h2><img src="${url}" alt="Share card"><div class="cta-row"><a class="btn dark" download="${f.name}" href="${url}">Download PNG</a>${navigator.canShare&&navigator.canShare({files:[f]})?`<button class="btn amber" id="nshare">Share…</button>`:''}</div></div>`;
   sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'));const ns=$('#nshare');if(ns)ns.onclick=()=>navigator.share({files:[f],title:'My Meridian type'}).catch(()=>{});});};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}

render();
