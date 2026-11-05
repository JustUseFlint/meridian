// Meridian v3 — gems (procedural faceted SVG, 12 individually lockable shards) + ideologies
const GEMS={
 lighthouse:{name:'Amber Brilliant',shape:'round',h:[36,18],sat:92},
 firebrand:{name:'Ruby Trillion',shape:'trillion',h:[352,8],sat:85},
 architect:{name:'Sapphire Emerald-cut',shape:'emerald',h:[218,236],sat:80},
 freeradical:{name:'Fire Opal Pear',shape:'pear',h:[14,320],sat:90},
 maverick:{name:'Citrine Marquise',shape:'marquise',h:[44,28],sat:92},
 builder:{name:'Bronze Asscher',shape:'asscher',h:[28,40],sat:55},
 steward:{name:'Jade Cushion',shape:'cushion',h:[152,132],sat:62},
 guardian:{name:'Garnet Shield',shape:'shield',h:[340,0],sat:70},
 tribune:{name:'Sunstone Kite',shape:'kite',h:[14,30],sat:88},
 pioneer:{name:'Tanzanite Hexagon',shape:'hexagon',h:[246,262],sat:72},
 sage:{name:'Amethyst Oval',shape:'oval',h:[278,300],sat:65},
 gardener:{name:'Peridot Octagon',shape:'octagon',h:[88,110],sat:72},
 cartographer:{name:'Paraíba Compass',shape:'compass',h:[178,196],sat:85},
 hearth:{name:'Rose Quartz Heart',shape:'heart',h:[334,350],sat:70},
 contrarian:{name:'Hematite Baguette',shape:'baguette',h:[220,280],sat:18},
 commander:{name:'Heliodor Pentagon',shape:'pentagon',h:[50,40],sat:90}
};
const PRISM={name:'Forming prism',shape:'round',h:[200,300],sat:30};
function polyR(pts){return th=>{const dx=Math.cos(th),dy=Math.sin(th);let best=1e9;
 for(let i=0;i<pts.length;i++){const[a,b]=pts[i],[c,d]=pts[(i+1)%pts.length];const ex=c-a,ey=d-b,den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;
  const t=(a*ey-b*ex)/den,u=(a*dy-b*dx)/den;if(t>0&&u>=-1e-9&&u<=1+1e-9)best=Math.min(best,t)}return best}}
const reg=(n,rot=-Math.PI/2,sx=1,sy=1)=>Array.from({length:n},(_,i)=>{const a=rot+i*2*Math.PI/n;return[Math.cos(a)*sx,Math.sin(a)*sy]});
const SHAPES={
 round:()=>1, oval:th=>1/Math.hypot(Math.cos(th)/.78,Math.sin(th)/1),
 cushion:th=>1/Math.pow(Math.pow(Math.abs(Math.cos(th)),3.2)+Math.pow(Math.abs(Math.sin(th)),3.2),1/3.2)*.92,
 trillion:polyR(reg(3,-Math.PI/2,1.08,1.08)), hexagon:polyR(reg(6,-Math.PI/2)), octagon:polyR(reg(8,-Math.PI/8)), pentagon:polyR(reg(5,-Math.PI/2,1.02,1.02)),
 asscher:polyR([[-.62,-.86],[.62,-.86],[.86,-.62],[.86,.62],[.62,.86],[-.62,.86],[-.86,.62],[-.86,-.62]]),
 emerald:polyR([[-.42,-1],[.42,-1],[.7,-.74],[.7,.74],[.42,1],[-.42,1],[-.7,.74],[-.7,-.74]]),
 baguette:polyR([[-.42,-1],[.42,-1],[.42,1],[-.42,1]]),
 kite:polyR([[0,-1.05],[.72,-.25],[0,1.05],[-.72,-.25]]),
 shield:polyR([[-.85,-.8],[.85,-.8],[.85,.05],[0,1.02],[-.85,.05]]),
 compass:polyR(Array.from({length:16},(_,i)=>{const a=-Math.PI/2+i*Math.PI/8,r=i%2?.74:1;return[Math.cos(a)*r,Math.sin(a)*r]})),
 marquise:th=>{const c=Math.cos(th),s=Math.sin(th);let lo=0,hi=2;for(let k=0;k<30;k++){const m=(lo+hi)/2,x=c*m,y=s*m;(x*x+(Math.abs(y)+.0)*0)<0;const inside=Math.hypot(x-.9,y)<=1.45&&Math.hypot(x+.9,y)<=1.45;inside?lo=m:hi=m}return lo},
 pear:th=>{const c=Math.cos(th),s=Math.sin(th);let lo=0,hi=2;for(let k=0;k<30;k++){const m=(lo+hi)/2,x=c*m,y=s*m;const inside=Math.hypot(x,y-.22)<=.78||(y<.22&&Math.abs(x)<=.78*(y+1.05)/1.27&&y>-1.05);inside?lo=m:hi=m}return lo},
 heart:th=>{const c=Math.cos(th),s=Math.sin(th);let lo=0,hi=2;for(let k=0;k<30;k++){const m=(lo+hi)/2,x=c*m*1.15,y=-s*m*1.15+.12;const v=Math.pow(x*x+y*y-1,3)-x*x*y*y*y;v<=0?lo=m:hi=m}return lo}
};
const gemCache={};
function gemGeom(shape){if(gemCache[shape])return gemCache[shape];const R=SHAPES[shape];const P=[];
 for(let i=0;i<24;i++){const a=-Math.PI/2+i*Math.PI/12;P.push(a)}
 const pt=(a,k)=>{const r=R(a)*k;return[+(Math.cos(a)*r*100).toFixed(2),+(Math.sin(a)*r*100).toFixed(2)]};
 const O=P.map(a=>pt(a,1)),M=[],T=[];for(let j=0;j<12;j++){M.push(pt(P[2*j+1],.7));T.push(pt(P[2*j],.42))}
 const C=[0,0],shards=[];
 for(let j=0;j<12;j++){const jm=(j+11)%12,jn=(j+1)%12;
  shards.push([[O[2*j],O[2*j+1],M[j]],[O[2*j+1],O[(2*j+2)%24],M[j]],[O[2*j],M[j],T[j],M[jm]],[M[j],T[j],T[jn]],[T[j],T[jn],C]])}
 return gemCache[shape]={shards,outline:O}}
let gemUid=0;
// opts: unlocked (Set of shard idx or 'all'), size, fresh (Set idx to animate), glow
function gemSVG(id,opts={}){const g=id==='prism'?PRISM:GEMS[id]||PRISM,{shards,outline}=gemGeom(g.shape),u=++gemUid;
 const un=opts.unlocked==='all'?new Set([...Array(12).keys()]):opts.unlocked||new Set(),fresh=opts.fresh||new Set(),size=opts.size||200;
 const L=-2.3; // light from upper left
 const fac=(poly,j,k)=>{const cx=poly.reduce((a,p)=>a+p[0],0)/poly.length,cy=poly.reduce((a,p)=>a+p[1],0)/poly.length;const ang=Math.atan2(cy,cx);
  const b=.5+.5*Math.cos(ang-L)*(k===4?.35:1)+(k===4?.18:k===3?.08:0)+((j*7+k*3)%5-2)*.035;
  let fill;if(un.has(j)){const h=g.h[0]+(g.h[1]-g.h[0])*(.5+.5*Math.sin(ang*2+k)),l=Math.max(14,Math.min(86,24+b*52));fill=`hsl(${h.toFixed(0)} ${g.sat}% ${l.toFixed(0)}%)`}
  else{const l=13+b*14;fill=`hsl(228 9% ${l.toFixed(0)}%)`}
  return `<polygon points="${poly.map(p=>p.join(',')).join(' ')}" fill="${fill}"/>`};
 const out=outline.map(p=>p.join(',')).join(' ');
 const anyOn=un.size>0;
 return `<svg class="gem${opts.cls?' '+opts.cls:''}" viewBox="-130 -130 260 260" width="${size}" height="${size}" role="img" aria-label="${esc(g.name)}, ${un.size} of 12 shards unlocked">
 <defs><radialGradient id="gg${u}"><stop offset="0" stop-color="hsl(${g.h[0]} ${g.sat}% 60%)" stop-opacity=".55"/><stop offset="1" stop-color="hsl(${g.h[1]} ${g.sat}% 50%)" stop-opacity="0"/></radialGradient>
 <linearGradient id="gs${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="hsl(${(g.h[0]+120)%360} 90% 70%)" stop-opacity=".12"/><stop offset="1" stop-color="hsl(${(g.h[1]+200)%360} 90% 60%)" stop-opacity=".18"/></linearGradient>
 <clipPath id="gc${u}"><polygon points="${out}"/></clipPath></defs>
 ${anyOn?`<circle r="128" fill="url(#gg${u})" opacity="${(.25+.75*un.size/12).toFixed(2)}" class="gem-glow"/>`:''}
 <g stroke-linejoin="round">${shards.map((sh,j)=>`<g class="shard${un.has(j)?' on':''}${fresh.has(j)?' fresh':''}" data-i="${j}" style="--d:${(j*.06).toFixed(2)}s">${sh.map((p,k)=>fac(p,j,k)).join('')}</g>`).join('')}</g>
 <g clip-path="url(#gc${u})" style="mix-blend-mode:screen" pointer-events="none"><rect x="-130" y="-130" width="260" height="260" fill="url(#gs${u})" opacity="${anyOn?1:.35}"/></g>
 <g fill="none" stroke="rgba(255,255,255,${anyOn?.28:.09})" stroke-width=".7">${shards.map(sh=>sh.map(p=>`<polygon points="${p.map(q=>q.join(',')).join(' ')}"/>`).join('')).join('')}</g>
 <polygon points="${out}" fill="none" stroke="rgba(255,255,255,${anyOn?.5:.14})" stroke-width="1.4"/>
 ${un.size===12?`<g class="spark"><path d="M-58 -70l3 -12 3 12 12 3 -12 3 -3 12 -3 -12 -12 -3z" fill="#fff" opacity=".9"/><circle cx="40" cy="-52" r="2.4" fill="#fff"/></g>`:''}
 </svg>`}

// Ideologies on the four political axes (econ: equality→markets, auth: liberty→order, trad: progress→tradition, glob: national→global)
const IDEOLOGIES=[
 ['Libertarian socialism',[-.85,-.85,-.6,.3],'Abolish concentrated power of both bosses and states; run economies through co-ops, unions and federated councils.'],
 ['Democratic socialism',[-.75,-.1,-.5,.3],'Democratic control over major industries alongside free elections and civil liberties.'],
 ['State socialism',[-.85,.7,-.1,-.2],'A strong central state owns and plans the commanding heights of the economy.'],
 ['Social democracy',[-.45,.05,-.35,.35],'Markets kept, but tamed by a large welfare state, strong unions and progressive taxes.'],
 ['Progressive liberalism',[-.3,-.2,-.65,.55],'Expanding rights and inclusion, with active government to reduce inequality.'],
 ['Green politics',[-.5,-.2,-.5,.5],'Ecological limits come first; decentralised, sustainable economies and grassroots democracy.'],
 ['Left populism',[-.6,.1,-.1,-.45],'"The people" against economic elites; redistribution with national economic sovereignty.'],
 ['Communitarianism',[-.15,.3,.35,-.25],'Community, shared values and mutual obligation over pure individualism or pure markets.'],
 ['Technocratic centrism',[.05,.3,-.15,.6],'Evidence, expertise and institutions over ideology; incremental, managed reform.'],
 ['Classical liberalism',[.5,-.45,-.15,.45],'Limited government, rule of law, free trade and individual rights.'],
 ['Right-libertarianism',[.85,-.85,0,.2],'Maximum individual liberty and free markets; the state as night-watchman at most.'],
 ['Fiscal conservatism',[.6,.15,.25,.2],'Balanced budgets, low taxes and restraint in spending; cautious on social change.'],
 ['Christian democracy',[-.05,.3,.6,.2],'Social market economy guided by religious ethics, family and subsidiarity.'],
 ['Traditional conservatism',[.35,.45,.75,-.1],'Inherited institutions, religion and custom carry wisdom; change slowly.'],
 ['National conservatism',[.25,.55,.65,-.7],'Sovereignty, borders and national culture first; skeptical of global institutions.'],
 ['Right populism',[.2,.45,.5,-.8],'"The people" against cultural and global elites; strong borders and strong leaders.'],
 ['Paternalistic statism',[0,.85,.4,-.3],'Order, discipline and a strong executive guiding society for its own good.'],
 ['Liberal internationalism',[.25,.1,-.35,.85],'Open trade, alliances and global institutions as the guarantors of peace and prosperity.']
];
function ideoNear(s){return IDEOLOGIES.map(([n,c,d])=>{const dist=Math.hypot(s.econ-c[0],s.auth-c[1],s.trad-c[2],s.glob-c[3]);return{n,c,d,dist,sim:Math.round(100*Math.max(0,1-dist/2.4))}}).sort((a,b)=>a.dist-b.dist)}
const AXLAB={econ:['Left','Right','Economic'],auth:['Libertarian','Authoritarian','Authority'],trad:['Progressive','Traditional','Culture'],glob:['Nationalist','Globalist','Scope']};
function axisLabel(k,v){const[lo,hi]=AXLAB[k],a=Math.abs(v);return a<.12?'Centrist':(a<.35?'Leans ':a<.65?'':'Strongly ')+(v<0?lo:hi).replace(/^./,c=>a<.35?c.toLowerCase():c)}
