// Meridian v4 — attribution, compare, informant ratings, Barnum, mediation, rally, taste, AOT
function openSheet(html,label){
 sheet.innerHTML=`<div class="sheet-bg" onclick="closeSheet()"></div><div class="sheet-card" role="dialog" aria-label="${esc(label||'Details')}"><button class="x" onclick="closeSheet()" aria-label="Close">\u00d7</button>${html}</div>`;
 sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('open'))}
function copyText(t,btn){
 const done=()=>{if(btn){const old=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=old,1600)}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done).catch(()=>prompt('Copy this:',t));
 else{prompt('Copy this:',t);done()}}
function shareURL(h){return location.href.replace(/#.*$/,'')+'#'+h}
function b64u(u8){return btoa(String.fromCharCode.apply(null,u8)).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')}
function unb64u(s){s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}

// ---------- 1. Why am I here? ----------
function itemTouches(it,d){
 if(!it)return false;
 if(it.t==='S'||it.t==='K')return (it.o||[]).some(o=>o.w&&o.w[d]!=null);
 return !!(it.w&&it.w[d]!=null)}
function locateAns(h){
 for(let si=0;si<st.sessions.length;si++){const j=st.sessions[si].ans.findIndex(x=>x.id===h.id);if(j>=0)return{si,j}}
 return null}
function attribFor(d,hist){
 hist=hist||allAns();const base=score(hist,true).s[d],out=[];
 hist.forEach((h,i)=>{const it=byId[h.id];if(!it||!itemTouches(it,d))return;
  const dv=base-score(hist.filter((_,k)=>k!==i),true).s[d];if(Math.abs(dv)<.002)return;
  out.push({h,it,dv,loc:locateAns(h)})});
 return out.sort((a,b)=>Math.abs(b.dv)-Math.abs(a.dv)).slice(0,6)}
function dimToward(d,dv){
 const D=DIMS[d];if(D.lo&&D.hi)return dv>0?D.hi:D.lo;
 return dv>0?'higher '+D.name:'lower '+D.name}
function whyHere(d){
 const D=DIMS[d],M=model(),rows=attribFor(d),v=M.s[d];
 const head=D.lo?`You score as <b>${word(v,D.lo,D.hi)}</b> on ${D.name} (${pctl(v)}/100).`:`Your <b>${D.name}</b> score is ${pctl(v)}/100.`;
 const list=rows.length?rows.map(r=>{
  const pts=Math.round(r.dv*50),can=r.loc;
  return `<article class="why-item"><p>${esc(r.it.q)}</p><b>${esc(ansLabel(r.it,r.h.a))}</b>
   <span class="why-move">${pts>=0?'+':''}${pts} toward ${esc(dimToward(d,r.dv))}</span>
   ${can?`<button class="btn line sm" onclick="whyEdit('${d}',${can.si},${can.j})">Change answer</button>`:''}</article>`}).join('')
  :`<p class="muted">No single answer moved this score much yet. More questions that touch ${D.name} will fill this in.</p>`;
 openSheet(`<p class="eyebrow">Why am I here?</p><h2>${D.name}</h2><p>${head}</p>
  <p class="muted">These are the answers that moved this score the most. Changing one rescored your profile instantly. Nothing is sent anywhere.</p>
  <div class="why-list">${list}</div>`,D.name+' attribution')}
function whyInput(it,d,si,j){
 if(it.t==='L')return `<div class="likert">${['Strongly disagree','Disagree','Unsure','Agree','Strongly agree'].map((l,k)=>`<button class="opt lk${k}" onclick="whySet(${si},${j},'${d}',${k-2})"><i></i>${l}</button>`).join('')}</div>`;
 if(it.t==='P')return `<div class="trade"><div class="tcard a"><span>A</span>${esc(it.a)}</div><div class="tcard b"><span>B</span>${esc(it.b)}</div></div>
  <div class="tscale">${[['A',-2],['Lean A',-1],['Torn',0],['Lean B',1],['B',2]].map(([l,v])=>`<button class="opt" onclick="whySet(${si},${j},'${d}',${v})">${l}</button>`).join('')}</div>`;
 if(it.t==='S')return `<div class="scen">${it.o.map((o,k)=>`<button class="opt" onclick="whySet(${si},${j},'${d}',${k})"><span class="ol">${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>`;
 if(it.t==='R'){sliderV=0;return `<div class="slider"><div class="poles"><span>${esc(it.a)}</span><span>${esc(it.b)}</span></div>
  <input type="range" min="-100" max="100" value="0" step="1" oninput="sliderV=this.value/100;this.style.setProperty('--v',(+this.value+100)/2+'%');document.getElementById('wsv').textContent=svLabel(sliderV)" style="--v:50%">
  <p class="sv" id="wsv">Centre</p><button class="btn primary wide" onclick="whySet(${si},${j},'${d}',+sliderV.toFixed(2))">Save change ${ic('arrow')}</button></div>`}
 rankSel=[];
 return `<div class="rank">${it.o.map((o,k)=>`<button class="opt" data-k="${k}" onclick="rankTap(${k})"><span class="rn"></span>${esc(o.t)}</button>`).join('')}</div>
  <div class="rank-act"><button class="ghost" onclick="rankReset()">Reset</button><button class="btn primary" id="rk" disabled onclick="whySet(${si},${j},'${d}',rankSel.slice())">Save order ${ic('arrow')}</button></div>
  <p class="muted center">Tap in order, from most to least.</p>`}
function whyEdit(d,si,j){
 const h=st.sessions[si]&&st.sessions[si].ans[j],it=h&&byId[h.id];if(!it)return;
 openSheet(`<p class="eyebrow">Change answer</p><h2 class="qtext">${esc(it.q)}</h2>
  <p class="muted">Was: ${esc(ansLabel(it,h.a))}. Your profile will rescore as soon as you pick a new answer.</p>
  <div class="qin">${whyInput(it,d,si,j)}</div>
  <button class="ghost" onclick="whyHere('${d}')">Back</button>`,'Change answer')}
function whySet(si,j,d,a){
 const sess=st.sessions[si];if(!sess||!sess.ans[j])return;
 sess.ans[j].a=a;
 const hist=st.sessions.slice(0,si+1).flatMap(x=>x.ans),m=model(hist);
 sess.after={s:m.s,conf:m.conf,top:m.probs.slice(0,3).map(r=>[r.t.id,r.p])};
 save();typeStatus();evalShards();
 if(/^#profile/.test(location.hash))profile(tab||'overview');
 whyHere(d)}

// ---------- 2. Compare overlay ----------
function packProfile(){
 const M=model(),ts=typeStatus(),u8=new Uint8Array(18);
 DK.forEach((d,i)=>u8[i]=Math.max(0,Math.min(255,Math.round((M.s[d]+1)*127.5))));
 u8[15]=Math.max(0,TYPES.findIndex(t=>t.id===ts.t.id));u8[16]=M.conf;u8[17]=Math.round((ts.p||0)*255);
 return 'C.'+b64u(u8)}
function unpackProfile(code){
 code=decodeURIComponent(String(code||'')).replace(/^C\./,'');
 const u8=unb64u(code);if(u8.length<17)throw new Error('short');
 const s={};DK.forEach((d,i)=>s[d]=u8[i]/127.5-1);
 const t=TYPES[u8[15]]||TYPES[0];
 return{s,t,conf:u8[16],p:(u8[17]||0)/255}}
function compareHome(){
 const code=packProfile(),url=shareURL('compare/'+code);
 shell('profile',`<div class="page"><header class="ph"><p class="eyebrow">Compare</p><h1>Overlay two compasses.</h1>
  <p class="lede">Send a friend this link. When they open it in Meridian, they\u2019ll see both of you on one chart \u2014 plus the three issues you\u2019d argue about and the foundations you share. The code is just your scores, not your answers.</p></header>
  <div class="card"><h3>Your share link</h3><input class="gsearch" readonly value="${esc(url)}" onclick="this.select()">
   <div class="row"><button class="btn primary sm" onclick="copyText('${esc(url)}',this)">Copy link</button>
   <button class="btn line sm" onclick="copyText('${code}',this)">Copy short code</button></div></div>
  <div class="card"><h3>Paste a friend\u2019s code</h3><input class="gsearch" id="cmpin" placeholder="C.\u2026 or paste their link" aria-label="Friend code">
   <button class="btn line sm" onclick="comparePaste()">Open overlay</button></div>
  <p class="muted"><a href="#profile/growth">Back to Growth</a></p></div>`)}
function comparePaste(){const raw=($('#cmpin')&&$('#cmpin').value||'').trim();if(!raw)return;
 const m=raw.match(/compare\/(C\.[A-Za-z0-9_-]+)/)||raw.match(/(C\.[A-Za-z0-9_-]+)/);
 if(!m)return alert('That doesn\u2019t look like a Meridian compare code.');go('compare/'+m[1])}
function compare(arg){
 if(!arg){if(!st.sessions.length)return intro();return compareHome()}
 let them;try{them=unpackProfile(arg)}catch(e){shell('profile',`<div class="page"><header class="ph"><h1>That code didn\u2019t work.</h1><p class="lede">Ask your friend to copy the link again from Meridian.</p><button class="btn line" onclick="go('compare')">Back</button></div>`);return}
 if(!st.sessions.length)return compareGuest(them);
 compareOverlay(them)}
function compareGuest(them){
 app.innerHTML=`<div class="page solo"><a class="back" href="#intro">${ic('back')} Meridian</a>
  <header class="ph"><p class="eyebrow">A friend\u2019s profile</p><h1>${esc(them.t.name)}</h1>
  <p class="lede">This is a compact snapshot of their scores. Take Foundations to overlay yours on the same compass.</p></header>
  <div class="card center">${gemSVG(them.t.id,{unlocked:'all',size:160})}<p class="muted">${GEMS[them.t.id].name} \u00b7 ${them.conf}% confidence</p>
   ${quad(them.s,'econ','auth')}</div>
  <button class="btn primary" onclick="startSession('core')">Begin Foundations ${ic('arrow')}</button></div>`}
function compareOverlay(them){
 const mine=model(),meT=typeStatus().t,tips=pairTips(mine.s,them.s);
 const shared=MOR.filter(d=>mine.s[d]>.15&&them.s[d]>.15).sort((a,b)=>Math.min(mine.s[b],them.s[b])-Math.min(mine.s[a],them.s[a]));
 const pts=[{x:them.s.econ,y:them.s.auth,r:7,c:'#E7A23B',o:1,l:them.t.name}];
 shell('profile',`<div class="page"><a class="back" href="#compare">${ic('back')} Compare</a>
  <header class="ph"><p class="eyebrow">Two-person overlay</p><h1>You &amp; ${esc(them.t.name)}</h1></header>
  <div class="cmp-hero">${[['You',meT,mine.conf],['Them',them.t,them.conf]].map(([lab,t,c],i)=>`<div class="card center"><p class="eyebrow">${lab}</p>${gemSVG(t.id,{unlocked:i? 'all':new Set(st.shards),size:110})}<b>${esc(t.name)}</b><span class="muted">${c}% confidence</span></div>`).join('')}</div>
  <div class="grid2"><div class="card"><h3>Economic \u00d7 Authority</h3>${quad(mine.s,'econ','auth',{u:mine.u,pts})}
   <p class="muted">Violet ring = you (with uncertainty). Amber dot = them.</p></div>
   <div class="card"><h3>Culture \u00d7 Scope</h3>${quad(mine.s,'glob','trad',{u:mine.u,pts:[{x:them.s.glob,y:them.s.trad,r:7,c:'#E7A23B',o:1,l:them.t.name}]})}</div></div>
  <div class="card"><h3>Three issues you\u2019d argue about</h3>
   <ul class="ticks">${tips.map(x=>`<li><b>${x.area[0].toUpperCase()+x.area.slice(1)}</b> \u2014 you: ${pctl(mine.s[x.k])}/100, them: ${pctl(them.s[x.k])}/100. ${x.tip}</li>`).join('')}</ul></div>
  <div class="card"><h3>Foundations you share</h3>
   ${shared.length?`<div class="vtop">${shared.map(d=>`<span class="chip">${MORAL_TXT[d][0]}</span>`).join('')}</div><p>You both give weight to ${shared.map(d=>MORAL_TXT[d][0].toLowerCase()).join(' and ')}. Start there before the disagreements.</p>`
    :`<p>Few foundations are strong for both of you. You\u2019ll need to name common ground on purpose \u2014 often a shared care for people you both love, even when the moral language differs.</p>`}
   <p class="muted">Personality similarity predicts relationship satisfaction only weakly; shared values predict pairing much more (Luo &amp; Klohnen, 2005; political similarity is mostly who we choose, not who we become).</p></div>
  <div class="card"><h3>All four political axes</h3><div class="divbars">${POL.map(k=>divRow(k,mine.s[k],them.s[k],'You','Them')).join('')}</div></div>
  <div class="row"><button class="btn line sm" onclick="go('compare')">Share yours back</button></div></div>`)}
function divRow(k,you,them,a='You',b='Them'){
 const g=you-them,lab=AXLAB[k]?AXLAB[k]:[DIMS[k].lo||'Low',DIMS[k].hi||'High',DIMS[k].name];
 const note=Math.abs(g)<.12?'aligned':(g>0?`${a}: more ${lab[1]}`:`${a}: more ${lab[0]}`);
 return `<div class="divrow"><span>${lab[2]}</span><div class="divtrack" title="${a} vs ${b}"><i class="them" style="left:${pctl(them)}%"></i><i class="you" style="left:${pctl(you)}%"></i></div><em>${note}</em></div>`}
function ideoBars(s,x){return `<div class="divbars">${POL.map((k,j)=>divRow(k,s[k],x.c[j],'You',x.n)).join('')}</div><p class="muted tiny">Filled = you \u00b7 hollow = this ideology</p>`}

// ---------- 3. Friends rate you ----------
const RATE_ITEMS=[
 {id:'rO1',d:'O',rev:0,q:'They enjoy unusual ideas, abstract art or taking things apart just to understand them.'},
 {id:'rO2',d:'O',rev:1,q:'They prefer familiar routines and well-worn entertainment to anything strange or new.'},
 {id:'rO3',d:'O',rev:0,q:'They like conversations that wander into theory, meaning or how the world could be otherwise.'},
 {id:'rC1',d:'C',rev:0,q:'They finish what they start and keep their space, calendar or tools in working order.'},
 {id:'rC2',d:'C',rev:1,q:'They leave tasks unfinished and improvise deadlines.'},
 {id:'rC3',d:'C',rev:0,q:'People can count on them to be on time and prepared.'},
 {id:'rE1',d:'E',rev:0,q:'They light up around groups of people and often start the conversation.'},
 {id:'rE2',d:'E',rev:1,q:'They need a lot of solitude to feel like themselves.'},
 {id:'rA1',d:'A',rev:0,q:'They assume good intentions and will smooth over a conflict to keep the peace.'},
 {id:'rA2',d:'A',rev:1,q:'They are blunt, even when it costs them goodwill.'},
 {id:'rN1',d:'N',rev:0,q:'They worry, replay conversations and feel pressure early.'},
 {id:'rN2',d:'N',rev:1,q:'They stay calm when plans fall apart.'}
];
let rateDraft=null;
function rateShareLink(){if(!st.rateId){st.rateId=Math.random().toString(36).slice(2,8);save()}return shareURL('rate/'+st.rateId)}
function scoreRate(ans){
 const sum={},n={};B5.forEach(d=>{sum[d]=0;n[d]=0});
 RATE_ITEMS.forEach((it,i)=>{const raw=ans[i];if(raw==null)return;const v=(raw/2)*(it.rev?-1:1);sum[it.d]+=v;n[it.d]++});
 const s={};B5.forEach(d=>s[d]=n[d]?Math.max(-1,Math.min(1,sum[d]/n[d])):0);return s}
function packInformant(ans,name){
 const s=scoreRate(ans),u8=new Uint8Array(18);
 B5.forEach((d,i)=>u8[i]=Math.max(0,Math.min(255,Math.round((s[d]+1)*127.5))));
 RATE_ITEMS.forEach((_,i)=>u8[5+i]=(ans[i]+2)&7);
 u8[17]=Math.min(50,(name||'').length);
 return 'I.'+b64u(u8)+(name?('.'+encodeURIComponent(name).replace(/%/g,'~')):'')}
function unpackInformant(code){
 code=decodeURIComponent(String(code||'').trim());
 const nm=(code.match(/^I\.[A-Za-z0-9_-]+(?:\.(.+))$/)||[])[1];
 const body=(code.match(/^(I\.[A-Za-z0-9_-]+)/)||[])[1];if(!body)throw new Error('fmt');
 const u8=unb64u(body.slice(2));if(u8.length<17)throw new Error('short');
 const s={};B5.forEach((d,i)=>s[d]=u8[i]/127.5-1);
 const a=RATE_ITEMS.map((_,i)=> (u8[5+i]&7)-2 );
 const name=nm?decodeURIComponent(nm.replace(/~/g,'%')):'';
 return{s,a,name}}
function rate(arg){
 rateDraft=rateDraft&&rateDraft.tok===arg?rateDraft:{tok:arg||'',i:0,ans:Array(RATE_ITEMS.length).fill(null),name:''};
 if(rateDraft.done)return rateDone();
 const i=rateDraft.i,it=RATE_ITEMS[i];
 const top=st.sessions.length?`<p class="muted">Same-browser demo: answers can be saved into the profile on this device, and you\u2019ll still get a code to send.</p>`:'';
 app.innerHTML=`<section class="quiz rateq"><header class="qtop"><button class="ghost icon" onclick="${i?'rateDraft.i--;rate()':'go(st.sessions.length?\'tools/rate\':\'intro\')'}" aria-label="Back">${ic('back')}</button>
  <div class="qmeta"><b>Describe them</b><span>${i+1} of ${RATE_ITEMS.length}</span></div><span></span></header>
  <div class="qprog">${RATE_ITEMS.map((_,k)=>`<i class="${k<i?'on':k===i?'cur':''}"></i>`).join('')}</div>
  <div class="qbody in"><p class="qfmt">How true is this of them?</p>
  <h2 class="qtext">${esc(it.q)}</h2>
  <div class="likert">${['Strongly disagree','Disagree','Unsure','Agree','Strongly agree'].map((l,k)=>`<button class="opt lk${k}" onclick="rateAns(${k-2})"><i></i>${l}</button>`).join('')}</div>
  ${top}<p class="muted">Answer how they actually are, not how they wish they were. Their answers stay on this device until you copy a result code \u2014 Meridian has no server.</p></div></section>`}
function rateAns(v){rateDraft.ans[rateDraft.i]=v;if(rateDraft.i<RATE_ITEMS.length-1){rateDraft.i++;rate()}else{rateDraft.done=true;rateDone()}}
function rateDone(){
 const s=scoreRate(rateDraft.ans),code=packInformant(rateDraft.ans,rateDraft.name),local=!!st.sessions.length;
 app.innerHTML=`<div class="page solo"><header class="ph"><p class="eyebrow">Thank you</p><h1>Send this code back.</h1>
  <p class="lede">There is no account and nothing was uploaded. Copy the code and paste it to the person who asked, in any message.</p></header>
  <div class="card"><label class="muted" for="rn">Optional name they\u2019ll see</label>
   <input class="gsearch" id="rn" placeholder="Alex, my sister\u2026" value="${esc(rateDraft.name||'')}" oninput="rateDraft.name=this.value">
   <button class="btn line sm" onclick="rateDraft.done=true;rateDone()">Refresh code with name</button></div>
  <div class="card"><h3>Result code</h3><input class="gsearch" readonly value="${esc(packInformant(rateDraft.ans,rateDraft.name))}" onclick="this.select()">
   <button class="btn primary" onclick="copyText(packInformant(rateDraft.ans,rateDraft.name),this)">Copy code</button></div>
  <div class="card"><h3>What you just described</h3>${B5.map(d=>`<div class="mrow"><b>${DIMS[d].name}</b><span class="mbar"><i style="width:${pctl(s[d])}%"></i></span><em>${pctl(s[d])}</em></div>`).join('')}
   <p class="muted">These bars are your view of them, not a diagnosis.</p></div>
  ${local?`<div class="card"><h3>This device also has a Meridian profile</h3><p>Save these ratings into it? Useful if you just rated yourself as a demo, or if you and your friend share this browser.</p>
   <button class="btn line" onclick="ingestInformant(packInformant(rateDraft.ans,rateDraft.name||'Friend on this device'));go('tools/rate')">Save to this profile</button></div>`:''}
  <button class="ghost" onclick="rateDraft=null;go('intro')">Done</button></div>`}
function ingestInformant(code){
 let p;try{p=unpackInformant(code)}catch(e){alert('That doesn\u2019t look like a friend-rating code.');return false}
 st.informants=st.informants||[];
 st.informants.push({at:Date.now(),name:p.name||('Friend '+(st.informants.length+1)),s:p.s,a:p.a});
 save();return true}
function rateDesk(){
 st.informants=st.informants||[];
 const url=rateShareLink(),list=st.informants,self=st.sessions.length?model().s:null;
 const mean=list.length?(()=>{const m={};B5.forEach(d=>m[d]=list.reduce((a,x)=>a+x.s[d],0)/list.length);return m})():null;
 const johari=self&&mean?B5.map(d=>{
  const a=self[d],b=mean[d],gap=a-b;
  let cell,blurb;
  if(Math.abs(gap)<.35){cell='arena';blurb='You and your friends see this similarly.'}
  else if(Math.abs(b)>Math.abs(a)+.12){cell='blind';blurb='They see a stronger lean here than you report \u2014 a possible blind spot.'}
  else{cell='facade';blurb='You report a stronger lean than they see \u2014 something you may keep closer in.'}
  return{d,a,b,cell,blurb}})():null;
 shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
  <header class="ph"><p class="eyebrow">Friends rate you</p><h1>How you see yourself, and how they see you.</h1>
  <p class="lede">Send the link. They answer 12 questions <em>about you</em>, then paste a result code back. Friends tend to see Openness more accurately than we do; we see our own emotional reactivity more accurately than they do (Vazire, 2010).</p></header>
  <div class="card"><h3>Ask a friend</h3><input class="gsearch" readonly value="${esc(url)}" onclick="this.select()">
   <div class="row"><button class="btn primary sm" onclick="copyText('${esc(url)}',this)">Copy invite link</button>
   <button class="btn line sm" onclick="go('rate/'+(st.rateId||''))">Try the form yourself</button></div>
   <p class="muted">No account, no server. They copy a code; you paste it below.</p></div>
  <div class="card"><h3>Paste a result code</h3><input class="gsearch" id="ratein" placeholder="I.\u2026" aria-label="Friend result code">
   <button class="btn line sm" onclick="(function(){const v=$('#ratein')&&$('#ratein').value;if(ingestInformant(v))rateDesk()})()">Add to my profile</button></div>
  ${list.length&&self?`<div class="card"><h3>Self vs friends (${list.length} rating${list.length>1?'s':''})</h3>
    ${B5.map(d=>`<div class="cmp-trait"><div class="b5l"><b>${DIMS[d].name}</b><em>you ${pctl(self[d])} \u00b7 they ${pctl(mean[d])}</em></div>
     <div class="divtrack tall"><i class="them" style="left:${pctl(mean[d])}%"></i><i class="you" style="left:${pctl(self[d])}%"></i></div></div>`).join('')}
    <p class="muted">Filled = you \u00b7 hollow = friend average</p></div>
    <div class="card"><h3>Johari-style summary</h3>
     <div class="johari">${johari.map(x=>`<div class="jcell ${x.cell}"><p class="eyebrow">${x.cell==='arena'?'Agreement':x.cell==='blind'?'Blind spot':'Fa\u00e7ade'}</p><b>${DIMS[x.d].name}</b><p>${x.blurb}</p></div>`).join('')}</div>
     <p class="muted">Named after the Johari window (Luft &amp; Ingham, 1955). This is a trait comparison, not a clinical reading. Openness mismatches are common and often informative; treat Neuroticism mismatches gently \u2014 you usually know your inner weather better than they do.</p>
     <ul class="ticks">${list.map((x,i)=>`<li>${esc(x.name)} \u00b7 ${fmtDate(x.at)} <button class="ghost sm" onclick="st.informants.splice(${i},1);save();rateDesk()">Remove</button></li>`).join('')}</ul></div>`
   :`<div class="card"><p class="muted">Once a friend pastes a code back, you\u2019ll see self vs informant means here.</p></div>`}</div>`)}

// ---------- 4. Barnum honesty check ----------
const BARNUM_TEXT='You have a great need for other people to like and admire you, yet you tend to be critical of yourself. You have unused capacities that you have not turned to your advantage. While you have some personality weaknesses, you are generally able to compensate for them. Disciplined and controlled on the outside, you tend to be worrisome and insecure inside. At times you have serious doubts as to whether you have made the right decision or done the right thing. You prefer a certain amount of change and variety and become dissatisfied when hemmed in by restrictions and limitations. You pride yourself as an independent thinker and do not accept others\u2019 statements without satisfactory proof. You have found it unwise to be too frank in revealing yourself to others. Some of your aspirations tend to be pretty unrealistic.';
function barnumReal(s,t){
 const top=B5.slice().sort((a,b)=>Math.abs(s[b])-Math.abs(s[a]))[0];
 const mo=MOR.slice().sort((a,b)=>s[b]-s[a]);
 const lines=[
  `On economics you read as ${axisLabel('econ',s.econ).toLowerCase()} (${pctl(s.econ)}/100) and on authority as ${axisLabel('auth',s.auth).toLowerCase()} (${pctl(s.auth)}/100).`,
  `Culturally you lean ${axisLabel('trad',s.trad).toLowerCase()} and in scope ${axisLabel('glob',s.glob).toLowerCase()}.`,
  `Your most marked Big Five trait is being ${word(s[top],DIMS[top].lo,DIMS[top].hi)} \u2014 ${DIMS[top].name} at ${pctl(s[top])}/100.`,
  `You judge most readily through ${MORAL_TXT[mo[0]][0].toLowerCase()} (${pctl(s[mo[0]])}/100); ${MORAL_TXT[mo[5]][0].toLowerCase()} is the foundation that lands least (${pctl(s[mo[5]])}/100).`,
  s.N>.25?`You feel pressure early and replay hard conversations (emotional reactivity ${pctl(s.N)}/100).`:s.N<-.25?`You stay steadier than most when plans break (emotional reactivity ${pctl(s.N)}/100).`:`Your emotional reactivity sits near the middle (${pctl(s.N)}/100): some weather, not a storm.`,
  t?`Among Meridian\u2019s types, the nearest summary of this pattern is ${t.name} \u2014 but the scores above are the result, not the label.`:''
 ].filter(Boolean);
 return lines.join(' ')}
function barnumView(){
 if(!(has('growth')||has('complete'))){shell('profile',`<div class="page">${lockedCard('growth')}</div>`);return}
 const s=model().s,t=typeStatus().t;
 if(st.barnum&&st.barnum.hit!=null&&!st.barnum.quiz){
  const hit=st.barnum.hit;
  shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
   <header class="ph"><p class="eyebrow">Barnum check</p><h1>${hit?'You picked the real one.':'You picked the generic sketch.'}</h1></header>
   <div class="card"><p>${hit?'That is encouraging \u2014 the paragraph was built only from your scores. It is still worth remembering that feeling understood is not the same as being measured. People also prefer specific-sounding feedback when it is merely flattering.':'You are in good company. Forer (1949) gave students a single generic sketch and they rated it as highly accurate. In a 1985 study, bogus 16PF feedback was rated <em>more</em> accurate than real feedback. The statements below are the classic Barnum set: they feel intimate because they are true of almost everyone.'}</p>
    <p class="muted">Forer, B. R. (1949). The fallacy of personal validation. <em>Journal of Abnormal and Social Psychology</em>. See also the 1985 finding that inverted or bogus personality feedback is accepted unless it is obviously the opposite of the person.</p></div>
   <div class="grid2"><div class="card"><h3>The real paragraph</h3><p>${esc(barnumReal(s,t))}</p><p class="muted">Every clause cites a score you can inspect with \u201cWhy am I here?\u201d on your profile.</p></div>
    <div class="card"><h3>The Barnum paragraph</h3><p>${esc(BARNUM_TEXT)}</p></div></div>
   <button class="btn line" onclick="st.barnum={quiz:1,slot:Math.random()<.5?0:1};save();barnumView()">Try again with a fresh shuffle</button></div>`);return}
 if(!st.barnum||st.barnum.slot==null){st.barnum={quiz:1,slot:Math.random()<.5?0:1};save()}
 const real=barnumReal(s,t),paras=st.barnum.slot===0?[real,BARNUM_TEXT]:[BARNUM_TEXT,real];
 shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
  <header class="ph"><p class="eyebrow">An experiment</p><h1>Which sketch feels more like you?</h1>
  <p class="lede">One paragraph is written from your actual Meridian scores. The other is a generic sketch that would fit almost anyone. We won\u2019t say which is which until you pick. This is optional, and a little disorienting on purpose.</p></header>
  <div class="grid2">${paras.map((p,i)=>`<button class="card pick-card" onclick="barnumPick(${i})"><p class="eyebrow">Portrait ${'AB'[i]}</p><p>${esc(p)}</p><span class="chip">This feels more accurate</span></button>`).join('')}</div>
  <p class="muted">You can back out any time. After you choose, we\u2019ll reveal which was which and cite the research this is based on.</p></div>`)}
function barnumPick(i){st.barnum={picked:i,slot:st.barnum.slot,hit:i===st.barnum.slot,at:Date.now()};save();barnumView()}

// ---------- 5. Conflict mediation scripts ----------
const FOUND_VOICE={
 care:{reflect:'It sounds as if the fear underneath this, for you, is that someone vulnerable gets hurt and nobody steps in.',share:'Neither of us wants people left to suffer when help was possible.',ask:'Who do you worry will be hurt if we get this wrong \u2014 and who do you worry will be hurt if we do nothing?'},
 equa:{reflect:'It sounds as if dignity and a level field matter here more than any official story about who deserves what.',share:'Neither of us wants a world where some people count and others are written off.',ask:'What would equal treatment actually require in this case, in your view?'},
 prop:{reflect:'It sounds as if the sting is mismatch \u2014 effort, rule-keeping or contribution not lining up with what people get back.',share:'Neither of us thinks outcomes should float completely free of what people put in.',ask:'What would a fair return for effort look like here, without discarding people who fall behind?'},
 loya:{reflect:'It sounds as if standing with your people \u2014 family, team, country \u2014 is the honour at stake, not an abstract chart.',share:'Neither of us wants to abandon the people we are responsible for.',ask:'Who counts as \u201cus\u201d in this, for you, and what would loyalty to them actually demand?'},
 autr:{reflect:'It sounds as if legitimate roles and a workable order matter here \u2014 someone has to be trusted to decide.',share:'Neither of us wants chaos with nobody responsible.',ask:'Whose judgement do you think has been earned here, and what would make that authority legitimate to you?'},
 puri:{reflect:'It sounds as if something sacred is at risk of being treated as cheap, dirty or interchangeable.',share:'Neither of us thinks everything is merely a tool.',ask:'What, for you, should not be traded away here \u2014 and why does it feel like more than a preference?'}
};
const CONFLICTS=[
 {id:'tax',name:'Taxes and the safety net',left:'You tend to see taxes as how a society shares risk so no one is discarded.',right:'You tend to see taxes as a limited bill for shared goods, with earnings beyond that belonging to the person who produced them.',
  say:{left:{care:'A safety net is how we keep neighbours from falling through the floor when illness or luck turns.',equa:'Asking more of those who have more is how we keep dignity from tracking the accident of birth.',prop:'People who gained the most from shared roads, courts and schools can fairly return a larger share.',loya:'Looking after the worker next door is what loyalty to a country actually looks like.',autr:'A state that can pay for courts, order and defence has to collect what those institutions cost.',puri:'A society that lets children go hungry while others warehouse surplus has lost a sense of what is decent.'},
      right:{care:'Leaving people more of what they earn is often how families actually care for their own sick, old and young.',equa:'Treating people equally can mean not conscripting some citizens to fund other people\u2019s plans.',prop:'People should keep what their effort produced; a tax bill that ignores effort starts to feel like taking.',loya:'A country that punishes the people who build and employ is not standing with its own producers.',autr:'A state that grows by taking more each year starts to forget it is a servant, not a parent.',puri:'There is something corrosive about teaching that what you make was never really yours.'}}},
 {id:'borders',name:'Immigration and belonging',left:'You tend to treat people as people first, and borders as tools that should not outrank human claims.',right:'You tend to treat a country as a home with a door: belonging comes with limits and duties.',
  say:{left:{care:'People fleeing danger are not a category; they are someone\u2019s child, and a decent country has room for mercy.',equa:'Accident of birth should not decide who gets safety.',prop:'Those who come and contribute should be able to earn a place, same as anyone else.',loya:'A confident country can stand with newcomers without forgetting the people already here.',autr:'Orderly process is how welcome stays legitimate, not how it dies.',puri:'Hospitality is an old virtue. Closing every door treats outsiders as contamination, and that should bother us.'},
      right:{care:'A country that cannot look after the people already under its roof will not care well for anyone new.',equa:'Rules that apply to some arrivals and not others teach everyone that the law is a suggestion.',prop:'Belonging should track contribution, learning the language, and keeping the law.',loya:'A nation is a particular people with a particular story, not a hotel. Loyalty starts at the door.',autr:'Borders are how a government remains a government rather than a corridor.',puri:'A shared way of life is allowed to be treasured. Unlimited inflows can dissolve what newcomers themselves came to join.'}}},
 {id:'speech',name:'Free speech and harm',left:'You tend to treat speech as a liberty that dies by a thousand reasonable exceptions.',right:'You tend to treat some speech as a public harm that a decent society is allowed to restrain.',
  say:{left:{care:'Protecting ugly speech is often how we protect the next unpopular minority who needs to speak.',equa:'The state or the platform should not get to decide whose words are too costly to hear.',prop:'Bad arguments should lose in the open, not be hidden so they can claim martyrdom.',loya:'A free people should be trusted to hear hard things without being managed like children.',autr:'The right to dissent is older than any current institution\u2019s comfort.',puri:'There is something unclean about a public square that only permits approved feelings.'},
      right:{care:'Words are not weightless. Some of them target people who already have less room to stand.',equa:'A right that only the well-platformed can exercise without being swarmed is not equal speech.',prop:'Liberty is not a prize for cruelty; abuse has costs we currently dump on the target.',loya:'A community is allowed to defend its members from coordinated humiliation.',autr:'Every functioning institution draws a line somewhere. Pretending otherwise is a pose.',puri:'Some speech is degrading on purpose. A culture can refuse to treat that as just another viewpoint.'}}},
 {id:'climate',name:'Climate and energy',left:'You tend to treat climate as a duty to people who will live with what we emit.',right:'You tend to treat energy policy as a livelihoods question first, with climate as one cost among others.',
  say:{left:{care:'The people who did the least to cause this will be hurt first, and that should decide the pace.',equa:'Those who profited from emissions can fairly carry more of the repair.',prop:'Cheap energy that socialises the damage is not a bargain \u2014 it is a bill sent to someone else.',loya:'Leaving our descendants a poorer home is a failure of loyalty to our own line.',autr:'This is large enough that rules, not vibes, have to do some of the work.',puri:'There is a stewardship duty here: land, water and air are not ours to spoil and walk away from.'},
      right:{care:'Energy poverty is also harm. A policy that prices working families out of heat is not compassion.',equa:'Rules written in rich capitals should not land hardest on people who already have less slack.',prop:'Innovation and abundant energy have lifted more people than rationing ever did.',loya:'A country that weakens its own industry in a global market is not standing with its workers.',autr:'Targets without a workable plan are sermons, not government.',puri:'Care for the land is older than this debate. It does not require treating ordinary life as a stain.'}}},
 {id:'crime',name:'Crime and punishment',left:'You tend to see crime through the lives around it \u2014 prevention, proportion, a path back.',right:'You tend to see crime first as a violation that deserves a clear, certain answer.',
  say:{left:{care:'A prison that manufactures more damaged people is not protecting the next victim.',equa:'Who gets stopped, charged and sentenced still tracks power. That should trouble us.',prop:'The penalty should fit the act, not the example we wish we were setting.',loya:'Safe streets are how we are loyal to the neighbourhood, including the kid who might still turn around.',autr:'Authority that cannot admit error loses the right to be trusted.',puri:'Caging people casually degrades us too. Punishment can be real without being theatrical.'},
      right:{care:'The person most often forgotten in this debate is the next victim, who is usually someone with little protection.',equa:'A law that is not enforced for some is not a law for anyone.',prop:'People who harm others should bear a cost that matches what they took.',loya:'Standing with a community means standing with the people trying to live ordinary, safe lives there.',autr:'Clear rules, swiftly applied, are how order remains something other than a wish.',puri:'There are acts that should still shock us. Treating them as paperwork is its own kind of decay.'}}},
 {id:'family',name:'Family, gender and tradition',left:'You tend to treat family forms as something people should be free to revise as they learn who they are.',right:'You tend to treat inherited family forms as carrying wisdom, not just habit.',
  say:{left:{care:'The test of a family is whether the people in it are safe and seen, not whether it matches a template.',equa:'Roles that trap people by sex or birth are not neutral traditions; they are assignments.',prop:'Commitment should be judged by the care people actually give, not the title they hold.',loya:'Loyalty to a family can include telling the truth about what it cost someone.',autr:'Earned respect inside a household is better than obedience for its own sake.',puri:'What is sacred here is the person, not the custom that happens to surround them.'},
      right:{care:'Children do better, on average, with stable, committed adults. That is a care argument, not a scold.',equa:'Freedom that ignores what children need is freedom for the adults only.',prop:'Promises should mean something. A culture that treats vows as optional teaches people not to invest.',loya:'A people that cannot describe what a family is will have trouble standing together at all.',autr:'Some forms lasted because they work at scale, not because nobody had imagination.',puri:'Sex, parenthood and vow-making are not just lifestyle accessories. Treating them as such cheapens them.'}}}
];
let medTopic='tax',medOpp=null;
function typeFoundations(t){return MOR.map((k,i)=>({k,v:t.m[i]*2-1})).sort((a,b)=>b.v-a.v)}
function mediateView(){
 if(!(has('growth')||has('morals'))){shell('profile',`<div class="page">${lockedCard('growth')}</div>`);return}
 const s=model().s,me=typeStatus().t,opp=tById(medOpp)||matchTypes(s).slice(-1)[0].t;medOpp=opp.id;
 const C=CONFLICTS.find(x=>x.id===medTopic)||CONFLICTS[0];
 const lean=({tax:s.econ,borders:-s.glob,speech:s.auth,climate:s.econ-(s.care+s.glob)*.3,crime:s.auth,family:s.trad})[C.id]||s.econ;
 const side=lean<0?'left':'right';
 const their=typeFoundations(opp),mine=typeFoundations(me);
 const f=their[0].k,f2=their[1].k;
 const shared=MOR.filter(d=>s[d]>.12&&(opp.m[MOR.indexOf(d)]*2-1)>.12);
 const script=(who,targetT,targetFound,speakerSide)=>{
  const V=FOUND_VOICE[targetFound],say=C.say[speakerSide][targetFound];
  return `<ol class="steps script">
   <li><b>Reflect their value.</b> ${V.reflect}</li>
   <li><b>Say what you share.</b> ${shared.length?`We both give real weight to ${shared.map(d=>MORAL_TXT[d][0].toLowerCase()).join(' and ')}. `:''}${V.share}</li>
   <li><b>Restate your view in their language.</b> ${say}</li>
   <li><b>Ask a question.</b> ${V.ask}</li></ol>`};
 shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
  <header class="ph"><p class="eyebrow">Conflict scripts</p><h1>Understand, don\u2019t corner.</h1>
  <p class="lede">Pick a topic and who you\u2019re talking with. You get a four-step script that recasts <em>your</em> view in <em>their</em> moral language \u2014 and the same courtesy in reverse. Moral reframing can make an argument more persuasive (Feinberg &amp; Willer, 2015). Showing both scripts is how this stays a bridge, not a trick. Braver Angels\u2019 rule: understand, don\u2019t persuade.</p></header>
  <div class="card"><h3>Topic</h3><div class="seg">${CONFLICTS.map(c=>`<button class="${medTopic===c.id?'on':''}" onclick="medTopic='${c.id}';mediateView()">${c.name}</button>`).join('')}</div></div>
  <div class="card"><h3>You\u2019re talking with</h3>
   <select class="gsearch" onchange="medOpp=this.value;mediateView()">${TYPES.map(t=>`<option value="${t.id}" ${t.id===opp.id?'selected':''}>${t.name}${t.id===me.id?' (your type)':''}</option>`).join('')}</select>
   <p class="muted">Default is your furthest type. Their strongest foundations: <b>${MORAL_TXT[f][0]}</b> and <b>${MORAL_TXT[f2][0]}</b>.</p></div>
  <div class="card"><h3>How you tend to see this</h3><p>${C[side]}</p></div>
  <div class="grid2">
   <div class="card"><h3>Your script, toward a ${opp.name}</h3>${script('you',opp,f,side)}</div>
   <div class="card"><h3>Their script, toward you</h3><p class="muted">If they were trying to be heard by someone with your foundations (${MORAL_TXT[mine[0].k][0]}).</p>${script('them',me,mine[0].k,side==='left'?'right':'left')}</div>
  </div>
  <p class="muted">Use this to be understood, not to win. The other person should be allowed to see the same page.</p></div>`)}

// ---------- 6. Reframe Rally ----------
const RALLY=[
 {id:'r1',setup:'You support stronger environmental rules. Your listener scores high on Purity and Loyalty, low on Care-as-harm.',q:'Which opening is most likely to land?',
  opts:[{t:'Pollution hurts vulnerable communities first, and we have a duty to protect them.',ok:0,why:'Care/harm framing \u2014 the language the environmental left already uses. It rarely moves high-purity audiences.'},{t:'We inherited land, water and air that should be kept unspoiled for our children. Desecrating them is a failure of stewardship.',ok:1,why:'Purity plus loyalty to descendants. Feinberg & Willer (2013) found purity framing nearly closed the left\u2013right gap on environmental attitudes.'},{t:'Every serious scientist agrees, so opposing this is anti-expertise.',ok:0,why:'Appeals to expert authority often harden skepticism in audiences who already distrust institutions.'}]},
 {id:'r2',setup:'You want a more generous safety net. Your listener scores high on Proportionality (\u201cearned rewards\u201d) and Loyalty.',q:'Which opening is most likely to land?',
  opts:[{t:'Nobody should be left behind; inequality itself is the moral emergency.',ok:0,why:'Equality/care language. It tells them their fairness intuition (effort should match reward) does not count.'},{t:'People who work should be able to stand on their own \u2014 and a floor against medical bills or job loss is how we keep our own from being discarded when luck turns.',ok:1,why:'Proportionality plus loyalty: the net as a way to honour work and stand with \u201cus\u201d, not as a rebuke of earning.'},{t:'The rich extracted this money, so taking it back is justice.',ok:0,why:'A blame frame that casts their group as the villain. It triggers defence, not curiosity.'}]},
 {id:'r3',setup:'You want tighter borders. Your listener scores high on Care and Equality.',q:'Which opening is most likely to land?',
  opts:[{t:'A country is not a country without a door, and we owe our own people first.',ok:0,why:'Loyalty/sovereignty language \u2014 your language, not theirs. It sounds like you are ranking some people as worth less.'},{t:'Uncontrolled inflows let employers bid down the wages of the people who already have the least power, and they strain the services those neighbours depend on.',ok:1,why:'Care plus equality: harm to the already-vulnerable, and a fairness claim about who currently bears the cost.'},{t:'If you cared about this country you would already agree with me.',ok:0,why:'A loyalty test. It questions their character instead of making a case.'}]},
 {id:'r4',setup:'You want to protect wide free-speech rules. Your listener scores high on Care and is worried about targeted harassment.',q:'Which opening is most likely to land?',
  opts:[{t:'Facts don\u2019t care about feelings, and adults should get over it.',ok:0,why:'It dismisses the harm they are pointing at. People rarely update after being told their fear is childish.'},{t:'The same protections that keep ugly speech legal are the ones that let unpopular minorities, whistleblowers and protest movements speak when institutions would rather they stayed quiet.',ok:1,why:'Care for the vulnerable, applied to the speakers who will next need the rule. It does not deny that words can wound.'},{t:'The Founders already settled this; further discussion is unpatriotic.',ok:0,why:'Authority plus loyalty. That is your side\u2019s shorthand, not a care argument.'}]},
 {id:'r5',setup:'You favour more policing in a high-crime neighbourhood. Your listener scores high on Care and Equality and worries about abuse.',q:'Which opening is most likely to land?',
  opts:[{t:'Order is a form of care: the next victim is usually someone with little protection, and reliable response is how we stop abandoning them.',ok:1,why:'Care plus equality \u2014 safety as something the least protected are owed, not as a tribute to authority.'},{t:'Criminals understand only strength. Anything else is naivet\u00e9.',ok:0,why:'A dominance frame. It confirms their fear that \u201cmore policing\u201d means contempt for the people who get stopped.'},{t:'This is how it has always been done, and tradition knows better than activists.',ok:0,why:'Authority and tradition, which are the foundations they weigh least.'}]},
 {id:'r6',setup:'You want a listener who scores high on Authority and Purity to support same-sex marriage.',q:'Which opening is most likely to land?',
  opts:[{t:'Love is love, and opposing this is just bigotry.',ok:0,why:'A moral indictment. It may be how you feel; it does not give them a story they can join.'},{t:'Marriage is a promise of fidelity, care and stability. Letting more people take that vow seriously strengthens the institution rather than mocking it.',ok:1,why:'Purity (the vow as sacred) plus authority (the institution). Research on moral reframing finds arguments like this move some conservative audiences where equality frames do not.'},{t:'Young people have already decided, so history will judge you.',ok:0,why:'A status threat dressed up as inevitability. It rarely opens a door.'}]},
 {id:'r7',setup:'You are sceptical of large climate spending. Your listener scores high on Care and Universalism (global concern).',q:'Which opening is most likely to land?',
  opts:[{t:'The science is exaggerated and the activists are hypocrites.',ok:0,why:'It attacks their trusted people. Even if you believe it, it ends the conversation.'},{t:'A policy that raises heating costs on people who already have no slack, or that shifts dirty production onto poorer countries, can harm the same people we claim to protect.',ok:1,why:'Care aimed at energy poverty and displaced harm \u2014 their foundation, applied to a cost they may not have weighed.'},{t:'Markets will handle it; government just gets in the way.',ok:0,why:'An economic-liberty slogan with no care content.'}]},
 {id:'r8',setup:'You want a listener high in Loyalty and Authority to support independent courts even when their side loses a case.',q:'Which opening is most likely to land?',
  opts:[{t:'No one is above the law, especially not leaders you happen to like.',ok:0,why:'Technically an equality claim, but the sting (\u201cleaders you like\u201d) makes it a jab.'},{t:'A country that keeps its word \u2014 including to rules that sometimes cost our own side \u2014 is how loyalty to the republic stays something more than loyalty to a person.',ok:1,why:'Loyalty to the country and respect for an earned institution (the court) rather than for a faction.'},{t:'Judges are experts; your feelings about the outcome are irrelevant.',ok:0,why:'Expertise-as-authority, aimed downward. It invites them to see the court as an occupying force.'}]}
];
function rallyView(){
 if(!has('morals')){shell('profile',`<div class="page">${lockedCard('morals')}</div>`);return}
 if(!st.rally||!st.rally.order||st.rally.i==null)st.rally={order:RALLY.map(x=>x.id).sort(()=>Math.random()-.5),i:0,ok:0,pick:null};
 const R=st.rally;
 if(R.i>=R.order.length){
  shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
   <header class="ph"><p class="eyebrow">Reframe Rally</p><h1>Round over: ${R.ok} / ${R.order.length}.</h1>
   <p class="lede">The point is not to become a better spin doctor. It is to notice when you are speaking your moral language to someone who does not live there.</p></header>
   <button class="btn primary" onclick="st.rally=null;save();rallyView()">Play again</button></div>`);return}
 const item=RALLY.find(x=>x.id===R.order[R.i]);
 const reveal=R.pick!=null;
 shell('profile',`<div class="page"><a class="back" href="#profile/growth">${ic('back')} Growth</a>
  <header class="ph"><p class="eyebrow">Reframe Rally \u00b7 ${R.i+1} / ${R.order.length} \u00b7 ${R.ok} correct</p>
  <h1>${reveal?(item.opts[R.pick].ok?'That would land.':'That would miss.'):'Pick the frame that would reach them.'}</h1>
  <p class="lede">${esc(item.setup)}</p></header>
  <div class="card"><h3>${esc(item.q)}</h3>
   <div class="rally-opts">${item.opts.map((o,i)=>`<button class="opt ${reveal?(o.ok?'good':(R.pick===i?'bad':'')):''}" ${reveal?'disabled':''} onclick="rallyPick(${i})">${esc(o.t)}</button>`).join('')}</div>
   ${reveal?`<p class="why-note">${esc(item.opts[R.pick].why)}${!item.opts[R.pick].ok?`<br><br>The better frame: ${esc(item.opts.find(x=>x.ok).t)}`:''}</p>`:''}</div>
  ${reveal?`<button class="btn primary" onclick="st.rally.i++;st.rally.pick=null;save();rallyView()">Next ${ic('arrow')}</button>`:''}
  <p class="muted">Scored against moral-reframing patterns from Feinberg &amp; Willer (2013, 2015). This trains empathy, not victory.</p></div>`)}
function rallyPick(i){const R=st.rally,item=RALLY.find(x=>x.id===R.order[R.i]);R.pick=i;if(item.opts[i].ok)R.ok++;save();rallyView()}

// ---------- 7. Taste shelf ----------
const TASTE={
 highO:[{k:'book',t:'The Overstory',by:'Richard Powers',w:'A novel that treats attention to living things as a moral act \u2014 built for high Openness.'},{k:'book',t:'Invisible Cities',by:'Italo Calvino',w:'Cities that are really ways of seeing. Aesthetic, cerebral, unhurried.'},{k:'film',t:'Arrival',by:'Denis Villeneuve',w:'Language, time and grief braided together; it rewards sitting with strangeness.'},{k:'film',t:'Spirited Away',by:'Hayao Miyazaki',w:'A spirit-world coming-of-age that takes wonder seriously without explaining it away.'},{k:'podcast',t:'In Our Time',by:'Melvyn Bragg',w:'Forty minutes with people who have spent a life on one hard subject.'}],
 lowO:[{k:'book',t:'A Man Called Ove',by:'Fredrik Backman',w:'Communal, character-first, more hearth than experiment \u2014 a good fit when novelty is not the draw.'},{k:'film',t:'Paddington 2',by:'Paul King',w:'Warmth, manners and a neighbourhood that still works. Rentfrow\u2019s \u201cCommunal\u201d factor in film form.'},{k:'film',t:'The Intouchables',by:'Nakache & Toledano',w:'Friendship across a gulf, told plainly and with humour.'},{k:'book',t:'The Thursday Murder Club',by:'Richard Osman',w:'Familiar pleasures, sharp observation, no homework.'},{k:'podcast',t:'Heavyweight',by:'Jonathan Goldstein',w:'Ordinary people revisiting one unfinished thing. Intimate, not abstract.'}],
 highE:[{k:'film',t:'Ocean\u2019s Eleven',by:'Steven Soderbergh',w:'Group energy, timing, talk \u2014 extraversion as choreography.'},{k:'podcast',t:'Wait Wait\u2026 Don\u2019t Tell Me!',by:'NPR',w:'Quick, social, performed intelligence.'},{k:'book',t:'The Amazing Adventures of Kavalier & Clay',by:'Michael Chabon',w:'A big, talkative novel about making things with other people.'}],
 lowE:[{k:'film',t:'Lost in Translation',by:'Sofia Coppola',w:'Two reserved people recognising each other in a loud city.'},{k:'book',t:'A Gentleman in Moscow',by:'Amor Towles',w:'A whole life inside one building; interiority as adventure.'},{k:'podcast',t:'On Being',by:'Krista Tippett',w:'Slow conversation. Room to think before you speak.'}],
 highC:[{k:'book',t:'The Checklist Manifesto',by:'Atul Gawande',w:'How careful systems outperform heroic memory \u2014 catnip if you are methodical.'},{k:'film',t:'Spotlight',by:'Tom McCarthy',w:'Patience, records, a team that does the unglamorous work.'},{k:'book',t:'Meditations',by:'Marcus Aurelius',w:'A working notebook about self-command, not a vibe.'}],
 lowC:[{k:'book',t:'The Wind-Up Bird Chronicle',by:'Haruki Murakami',w:'A plot that wanders on purpose. Permission to not have a plan.'},{k:'film',t:'After Hours',by:'Martin Scorsese',w:'One night that refuses to stay on schedule.'}],
 highA:[{k:'film',t:'Won\u2019t You Be My Neighbor?',by:'Morgan Neville',w:'A portrait of practised kindness that is never sticky-sweet.'},{k:'book',t:'Anne of Green Gables',by:'L. M. Montgomery',w:'Affection, imagination and the work of making a home with difficult people.'}],
 lowA:[{k:'film',t:'No Country for Old Men',by:'Coen brothers',w:'A hard world, no pleading for likeability.'},{k:'book',t:'Crime and Punishment',by:'Fyodor Dostoevsky',w:'A mind arguing with itself, unsparing about motive.'},{k:'film',t:'The Social Network',by:'David Fincher',w:'Ambition and sharpness without a request that you approve.'}],
 highN:[{k:'film',t:'Lady Bird',by:'Greta Gerwig',w:'Feeling everything, especially at home \u2014 without treating sensitivity as a joke.'},{k:'book',t:'The Year of Magical Thinking',by:'Joan Didion',w:'Grief observed at close range, with a cool eye still working.'}],
 lowN:[{k:'book',t:'Endurance',by:'Alfred Lansing',w:'A calm account of an uncalm situation. Steadiness as a plot.'},{k:'film',t:'Apollo 13',by:'Ron Howard',w:'Competence under pressure, told without melodrama.'}]
};
const STEEL={
 left:[{k:'book',t:'A Conflict of Visions',by:'Thomas Sowell',w:'The cleanest map of why \u201ccare\u201d and \u201cconstraint\u201d talk past each other. Even if you reject his politics, the schema is clarifying.'},{k:'book',t:'The Righteous Mind',by:'Jonathan Haidt',w:'Why loyal, authority-minded and purity-minded people are not simply missing a compassion module.'},{k:'book',t:'Reflections on the Revolution in France',by:'Edmund Burke',w:'The original caution against redesigning a society from a desk.'},{k:'podcast',t:'Conversations with Coleman',by:'Coleman Hughes',w:'Long, civil arguments that often come from the right of his guest \u2014 useful as a steelman gym.'}],
 right:[{k:'book',t:'The Fire Next Time',by:'James Baldwin',w:'Moral clarity about race and belonging that does not flatter the reader.'},{k:'book',t:'Evicted',by:'Matthew Desmond',w:'Poverty as a system of extraction, reported from inside it.'},{k:'book',t:'The Origins of Totalitarianism',by:'Hannah Arendt',w:'How loneliness, ideology and bureaucratic cruelty braid. A warning, not a team jersey.'},{k:'book',t:'Justice',by:'Michael Sandel',w:'A patient tour of what we owe one another when markets are not the whole answer.'}],
 lib:[{k:'book',t:'The Great Transformation',by:'Karl Polanyi',w:'Markets as things societies build and can also be injured by \u2014 the case many libertarians never have to answer.'},{k:'book',t:'A Theory of Justice',by:'John Rawls',w:'The veil of ignorance, argued carefully rather than sloganised.'},{k:'book',t:'Development as Freedom',by:'Amartya Sen',w:'Liberty measured by what people can actually do, not only by what the state is forbidden to do.'}],
 authleft:[{k:'book',t:'Seeing Like a State',by:'James C. Scott',w:'How well-meant official schemes flatten the local knowledge they need.'},{k:'book',t:'The Road to Serfdom',by:'F. A. Hayek',w:'The classical warning about planning that eats the freedom it claimed to serve.'},{k:'book',t:'On Liberty',by:'John Stuart Mill',w:'Still the clearest case that even a benevolent majority should not own the inner life.'}]
};
function pickTaste(s){
 const bag=[],used=new Set();
 const take=(arr,n)=>{for(const x of arr){if(bag.length>=12)return;const id=x.t+'|'+x.by;if(used.has(id)||!x.t||x.t.includes('?'))continue;used.add(id);bag.push(x);if(--n<=0)break}};
 take(s.O>.15?TASTE.highO:TASTE.lowO,3);take(s.E>.15?TASTE.highE:TASTE.lowE,2);take(s.C>.2?TASTE.highC:TASTE.lowC,1);
 take(s.A>.15?TASTE.highA:TASTE.lowA,1);take(s.N>.2?TASTE.highN:TASTE.lowN,1);
 if(bag.length<8)take([...TASTE.highO,...TASTE.lowO,...TASTE.highE],4);
 const steel=s.auth>0.25&&s.econ<0?STEEL.authleft:s.econ>0.2&&s.auth<0?STEEL.lib:s.econ<0||s.trad<0?STEEL.left:STEEL.right;
 return{bag:bag.slice(0,10),steel}}
function tasteCard(x){return `<article class="taste"><span class="chip">${x.k}</span><b>${esc(x.t)}</b><span>${esc(x.by)}</span><p>${esc(x.w)}</p></article>`}
function tasteTab(s,t){
 const {bag,steel}=pickTaste(s),opp=ideoNear(s).slice(-1)[0];
 return `<div class="stack"><div class="card"><h3>A shelf that fits how you attend</h3>
  <p>Picks lean on your Openness, Extraversion, Conscientiousness and emotional style, following evidence that entertainment taste tracks personality beyond demographics (Rentfrow et al., 2011). They are starting points, not a test of sophistication.</p></div>
  <div class="taste-grid">${bag.map(tasteCard).join('')}</div>
  <div class="card"><h3>Steelman shelf</h3>
  <p>Works from the side of the map you are furthest from${opp?` (your distant ideology: <b>${esc(opp.n)}</b>)`:''}. Read to understand the best version of a case you do not make, not to collect enemies.</p></div>
  <div class="taste-grid">${steel.map(tasteCard).join('')}</div>
  <p class="muted">Hand-curated, no recommendation engine, no affiliate links. If a title already feels like homework you did at twenty, skip it and take the next one.</p></div>`}

// ---------- 11. AOT / intellectual humility ----------
function aotScore(hist){
 hist=hist||allAns();let sum=0,n=0;
 for(const h of hist){const it=byId[h.id];if(!it||it.aot==null)continue;
  const x=it.t==='R'?h.a:it.t==='L'||it.t==='P'?h.a/2:null;if(x==null)continue;
  sum+=x*it.aot;n++}
 return n?{v:Math.max(-1,Math.min(1,sum/Math.max(n*.65,1))),n}:null}
function aotPanel(){
 const a=aotScore();
 if(!a)return `<div class="card"><h3>How you hold beliefs</h3><p>A short set of questions about changing your mind, seeking counter-evidence and saying \u201cI don\u2019t know\u201d lives in Curiosity &amp; Thinking. Finish a session there to unlock this panel.</p>
  <button class="btn line sm" onclick="startSession('mind')">Start Curiosity &amp; Thinking</button></div>`;
 const label=a.v>.35?'open and provisional':a.v>.1?'mostly open':a.v<-.35?'firm and defending':a.v<-.1?'leans firm':'mixed';
 return `<div class="card"><h3>How you hold beliefs</h3>
  <div class="aot-score"><b>${pctl(a.v)}</b><span>${label} \u00b7 ${a.n} item${a.n>1?'s':''}</span></div>
  <div class="axt aot-bar"><i style="left:${pctl(a.v)}%"></i></div>
  <div class="b5p"><span>Holds firmly</span><span>Updates readily</span></div>
  <p>${a.v>.25?'You treat beliefs as something that should move when the evidence does, and you are unusually willing to look for reasons you might be wrong.':a.v<-.25?'You hold views firmly and may experience changing your mind as costly. That can be warranted \u2014 some conclusions deserve loyalty \u2014 and it can also hide counter-evidence.':'You mix conviction with some willingness to revise. The interesting question is which topics still feel unrevisable.'}</p>
  <p class="muted">Inspired by actively open-minded thinking (Stanovich &amp; Toplak, 2023) and intellectual-humility research. This is not a moral grade: flexibility can be unmoored, and firmness can be earned. Items are Meridian\u2019s own wording, not a copyrighted scale.</p></div>`}

// ---------- Tools dock + router ----------
function toolsDock(){
 const items=[
  {ok:true,href:'#compare',name:'Friend compare',blurb:'A link that overlays two compasses and names three disagreements.'},
  {ok:true,href:'#tools/rate',name:'Friends rate you',blurb:'They answer 12 Big Five items about you and send a code back.'},
  {ok:has('growth')||has('complete'),href:'#tools/barnum',need:'growth',name:'Barnum honesty check',blurb:'Pick which paragraph feels like you \u2014 one is real, one is generic.'},
  {ok:has('growth')||has('morals'),href:'#tools/mediate',need:'growth',name:'Conflict scripts',blurb:'A four-step script in the other person\u2019s moral language, and theirs in yours.'},
  {ok:has('morals'),href:'#tools/rally',need:'morals',name:'Reframe Rally',blurb:'A short game: choose the frame that would actually reach them.'},
  {ok:has('complete'),href:'#profile/shelf',need:'complete',name:'Taste & steelman shelf',blurb:'Books, films and podcasts for your traits, plus a shelf from the other side.'}
 ];
 return `<div class="card"><h3>Tools</h3><div class="tool-list">${items.map(x=>x.ok?`<a class="trow" href="${x.href}"><div><b>${x.name}</b><span>${x.blurb}</span></div>${ic('arrow')}</a>`
  :`<div class="trow dim"><div><b>${x.name}</b><span>Unlocks with the ${SHARDS.find(s=>s.k===x.need).name} shard.</span></div>${ic('lock')}</div>`).join('')}</div></div>`}
function tools(arg){
 if(!st.sessions.length)return go('intro');
 if(arg==='barnum')return barnumView();
 if(arg==='rally')return rallyView();
 if(arg==='mediate')return mediateView();
 if(arg==='shelf')return go('profile/shelf');
 if(arg==='compare')return go('compare');
 if(arg==='rate')return rateDesk();
 go('profile/growth')}

if('serviceWorker' in navigator){
 window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{})})}
