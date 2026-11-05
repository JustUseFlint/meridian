// Hand-built SVG illustration system: one ink weight, flat fills, shared palette
const INK='#2A2420';
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt)));
 return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const S=`stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const BIRDS=['feather','tuft','comb'];

function mascotSVG(t,size=200){
 const c=t.col,d=shade(c,-.3),l=shade(c,.55);let back='',ears='',face='',acc='',front='';
 switch(t.ear){
  case 'round':ears=`<circle cx="62" cy="62" r="16" fill="${c}" ${S}/><circle cx="138" cy="62" r="16" fill="${c}" ${S}/><circle cx="62" cy="62" r="7" fill="${l}"/><circle cx="138" cy="62" r="7" fill="${l}"/>`;break;
  case 'pointy':ears=`<path d="M52 82 L58 34 L86 64Z" fill="${c}" ${S}/><path d="M148 82 L142 34 L114 64Z" fill="${c}" ${S}/><path d="M60 70 L62 48 L75 62Z" fill="${l}"/><path d="M140 70 L138 48 L125 62Z" fill="${l}"/>`;break;
  case 'horn':ears=`<path d="M62 66 C40 60 36 40 44 30 C50 46 62 50 74 56Z" fill="#F2E6CF" ${S}/><path d="M138 66 C160 60 164 40 156 30 C150 46 138 50 126 56Z" fill="#F2E6CF" ${S}/>`;break;
  case 'feather':ears=`<path d="M88 50 C86 34 96 26 104 24 C100 34 106 42 112 50Z" fill="${d}" ${S}/>`;break;
  case 'tuft':ears=`<path d="M58 70 L54 38 L80 58Z" fill="${d}" ${S}/><path d="M142 70 L146 38 L120 58Z" fill="${d}" ${S}/>`;break;
  case 'comb':ears=`<path d="M84 50 C80 34 92 30 96 40 C98 26 110 26 108 40 C114 32 124 38 116 52Z" fill="#D9473B" ${S}/>`;break;
  case 'antler':ears=`<path d="M70 58 L58 30 M62 40 L48 34 M60 34 L64 22 M130 58 L142 30 M138 40 L152 34 M140 34 L136 22" fill="none" stroke="#8A6A4A" stroke-width="5" stroke-linecap="round"/><ellipse cx="56" cy="74" rx="14" ry="8" fill="${c}" ${S} transform="rotate(-25 56 74)"/><ellipse cx="144" cy="74" rx="14" ry="8" fill="${c}" ${S} transform="rotate(25 144 74)"/>`;break;
  case 'mane':back=`<circle cx="100" cy="100" r="70" fill="${d}" ${S}/>`+Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2;return `<circle cx="${100+Math.cos(a)*66}" cy="${100+Math.sin(a)*66}" r="14" fill="${d}"/>`}).join('');break;
 }
 const bird=BIRDS.includes(t.ear);
 face=`<ellipse cx="80" cy="98" rx="6" ry="7.5" fill="${INK}"/><ellipse cx="120" cy="98" rx="6" ry="7.5" fill="${INK}"/><circle cx="82" cy="95" r="2.2" fill="#fff"/><circle cx="122" cy="95" r="2.2" fill="#fff"/><ellipse cx="68" cy="114" rx="8" ry="5" fill="#F29B8B" opacity=".55"/><ellipse cx="132" cy="114" rx="8" ry="5" fill="#F29B8B" opacity=".55"/>`+
  (bird?`<path d="M92 108 L108 108 L100 122Z" fill="#F0B43C" ${S}/>`:`<ellipse cx="100" cy="110" rx="12" ry="9" fill="${l}" ${S}/><ellipse cx="100" cy="106" rx="5" ry="3.5" fill="${INK}"/><path d="M95 116 Q100 120 105 116" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`);
 let shell='';
 if(t.ear==='none')shell=`<path d="M48 150 C48 112 152 112 152 150Z" fill="${d}" ${S}/><path d="M76 120 L100 134 L124 120 M100 134 L100 150 M64 140 L76 120 M136 140 L124 120" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
 const hand=(x,y)=>`<circle cx="${x}" cy="${y}" r="9" fill="${c}" ${S}/>`;
 switch(t.acc){
  case 'lantern':acc=`<path d="M156 118 L156 128" stroke="${INK}" stroke-width="3"/><rect x="146" y="128" width="20" height="26" rx="5" fill="#FFD66B" ${S}/><path d="M144 128 L168 128 M144 154 L168 154" stroke="${INK}" stroke-width="3"/><circle cx="156" cy="141" r="5" fill="#FFF3C4"/>`+hand(156,120);break;
  case 'megaphone':acc=`<path d="M146 136 L176 118 L176 156Z" fill="#F4EDE1" ${S}/><rect x="138" y="130" width="12" height="14" rx="3" fill="${d}" ${S}/>`+hand(142,148);break;
  case 'blueprint':acc=`<rect x="140" y="120" width="16" height="44" rx="8" fill="#9FC3DA" ${S} transform="rotate(20 148 142)"/><path d="M150 128 L144 156" stroke="#fff" stroke-width="2"/>`+hand(146,146);break;
  case 'sprout':acc=`<path d="M154 160 L154 128" stroke="#3E7D45" stroke-width="4"/><path d="M154 136 C140 124 140 114 146 112 C152 116 156 126 154 136Z" fill="#7CC07A" ${S}/><path d="M154 130 C166 118 172 118 174 122 C170 130 162 134 154 130Z" fill="#7CC07A" ${S}/><path d="M142 160 L166 160 L162 176 L146 176Z" fill="#C97A4A" ${S}/>`+hand(140,166);break;
  case 'compass':acc=`<circle cx="156" cy="142" r="15" fill="#F4E3B5" ${S}/><path d="M156 130 L161 142 L156 154 L151 142Z" fill="#D2483A" stroke="${INK}" stroke-width="2"/>`+hand(142,152);break;
  case 'hammer':acc=`<path d="M150 170 L162 120" stroke="#8A5A33" stroke-width="7" stroke-linecap="round"/><rect x="148" y="108" width="30" height="14" rx="3" fill="#8D97A0" ${S} transform="rotate(14 163 115)"/>`+hand(154,152);break;
  case 'scroll':acc=`<rect x="138" y="126" width="30" height="34" rx="3" fill="#F4E8CC" ${S}/><path d="M144 136 L162 136 M144 144 L162 144 M144 152 L156 152" stroke="${INK}" stroke-width="2"/>`+hand(140,150);break;
  case 'shield':acc=`<path d="M136 118 L172 118 L172 140 C172 158 154 168 154 168 C154 168 136 158 136 140Z" fill="#C8A55A" ${S}/><path d="M154 126 L154 160 M140 138 L168 138" stroke="${INK}" stroke-width="2.5"/>`;break;
  case 'crown':front=`<path d="M70 52 L74 28 L88 42 L100 22 L112 42 L126 28 L130 52Z" fill="#F0C04A" ${S}/>`;acc=`<rect x="146" y="118" width="6" height="46" fill="#C84A3A" ${S}/>`+hand(149,148);break;
  case 'flag':acc=`<path d="M152 172 L152 96" stroke="${INK}" stroke-width="4"/><path d="M152 98 L184 106 L152 118Z" fill="#E9B44C" ${S}/>`+hand(152,148);break;
  case 'book':acc=`<path d="M130 140 L154 134 L178 140 L178 166 L154 160 L130 166Z" fill="#E9DFC7" ${S}/><path d="M154 134 L154 160" stroke="${INK}" stroke-width="2.5"/>`;break;
  case 'telescope':acc=`<rect x="138" y="114" width="44" height="13" rx="4" fill="#C8A55A" ${S} transform="rotate(-25 160 120)"/>`+hand(148,138);break;
  case 'glasses':front=`<circle cx="80" cy="98" r="14" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="120" cy="98" r="14" fill="none" stroke="${INK}" stroke-width="3"/><path d="M94 98 L106 98" stroke="${INK}" stroke-width="3"/>`;break;
  case 'helmet':front=`<path d="M58 70 C58 30 142 30 142 70Z" fill="#C9A24A" ${S}/><path d="M100 36 C96 22 112 14 120 20" fill="none" stroke="#C84A3A" stroke-width="7" stroke-linecap="round"/>`;break;
 }
 return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t.animal} mascot">
 <ellipse cx="100" cy="186" rx="52" ry="7" fill="${INK}" opacity=".12"/>${back}${ears}
 <path d="M44 120 C44 60 156 60 156 120 C156 168 132 182 100 182 C68 182 44 168 44 120Z" fill="${c}" ${S}/>
 <ellipse cx="100" cy="150" rx="30" ry="24" fill="${l}" opacity=".9"/>${shell}
 <ellipse cx="74" cy="182" rx="14" ry="7" fill="${d}" ${S}/><ellipse cx="126" cy="182" rx="14" ry="7" fill="${d}" ${S}/>
 ${face}${front}${acc}</svg>`;
}

const PROPS={
 lighthouse:(x,y)=>`<path d="M${x-10} ${y} L${x-6} ${y-56} L${x+6} ${y-56} L${x+10} ${y}Z" fill="#F6F1E6" ${S}/><path d="M${x-8} ${y-18} L${x+8} ${y-18} M${x-7} ${y-36} L${x+7} ${y-36}" stroke="#D2483A" stroke-width="6"/><rect x="${x-8}" y="${y-68}" width="16" height="12" fill="#FFD66B" ${S}/><path d="M${x-10} ${y-68} L${x} ${y-78} L${x+10} ${y-68}Z" fill="#D2483A" ${S}/><path d="M${x+10} ${y-64} L${x+44} ${y-74} L${x+44} ${y-54}Z" fill="#FFE9A0" opacity=".6"/>`,
 house:(x,y)=>`<rect x="${x-12}" y="${y-18}" width="24" height="18" fill="#F4E8D4" ${S}/><path d="M${x-15} ${y-16} L${x} ${y-30} L${x+15} ${y-16}Z" fill="#C46A4A" ${S}/><rect x="${x-3}" y="${y-9}" width="6" height="9" fill="${INK}"/>`,
 flag:(x,y)=>`<path d="M${x} ${y} L${x} ${y-50}" stroke="${INK}" stroke-width="3"/><path d="M${x} ${y-50} C${x+12} ${y-56} ${x+20} ${y-44} ${x+32} ${y-50} L${x+32} ${y-34} C${x+20} ${y-28} ${x+12} ${y-40} ${x} ${y-34}Z" fill="#D2483A" ${S}/>`,
 factory:(x,y)=>`<path d="M${x-22} ${y} L${x-22} ${y-20} L${x-10} ${y-28} L${x-10} ${y-20} L${x+2} ${y-28} L${x+2} ${y-20} L${x+22} ${y-20} L${x+22} ${y}Z" fill="#B9A58C" ${S}/><rect x="${x+12}" y="${y-44}" width="8" height="24" fill="#9C8770" ${S}/><circle cx="${x+18}" cy="${y-52}" r="5" fill="#E8E2D8" opacity=".8"/><circle cx="${x+24}" cy="${y-60}" r="7" fill="#E8E2D8" opacity=".6"/>`,
 tower:(x,y)=>`<rect x="${x-9}" y="${y-52}" width="18" height="52" fill="#E9E0CF" ${S}/><path d="M${x-12} ${y-52} L${x} ${y-70} L${x+12} ${y-52}Z" fill="#6A5F8E" ${S}/><rect x="${x-3}" y="${y-42}" width="6" height="8" fill="${INK}"/>`,
 bridge:(x,y)=>`<path d="M${x-28} ${y} Q${x} ${y-24} ${x+28} ${y}" fill="none" stroke="${INK}" stroke-width="3"/><path d="M${x-28} ${y-6} L${x+28} ${y-6}" stroke="#8A5A33" stroke-width="5"/><path d="M${x-14} ${y-6} L${x-14} ${y-14} M${x} ${y-6} L${x} ${y-18} M${x+14} ${y-6} L${x+14} ${y-14}" stroke="${INK}" stroke-width="2"/>`,
 tent:(x,y)=>`<path d="M${x-20} ${y} L${x} ${y-32} L${x+20} ${y}Z" fill="#E9B44C" ${S}/><path d="M${x} ${y-32} L${x-5} ${y} L${x+5} ${y}Z" fill="${INK}"/>`,
 tree:(x,y)=>`<rect x="${x-3}" y="${y-14}" width="6" height="14" fill="#8A5A33"/><circle cx="${x}" cy="${y-26}" r="15" fill="#5E9B5E" ${S}/><circle cx="${x-5}" cy="${y-30}" r="4" fill="#8CC48C"/>`,
 windmill:(x,y)=>`<path d="M${x-8} ${y} L${x-5} ${y-40} L${x+5} ${y-40} L${x+8} ${y}Z" fill="#F4E8D4" ${S}/><g transform="translate(${x} ${y-40})"><path d="M0 0 L-4 -26 L4 -26Z M0 0 L26 -4 L26 4Z M0 0 L4 26 L-4 26Z M0 0 L-26 4 L-26 -4Z" fill="#E7D7B8" ${S}/></g>`,
 castle:(x,y)=>`<path d="M${x-26} ${y} L${x-26} ${y-34} L${x-20} ${y-34} L${x-20} ${y-28} L${x-12} ${y-28} L${x-12} ${y-34} L${x-6} ${y-34} L${x-6} ${y-22} L${x+6} ${y-22} L${x+6} ${y-34} L${x+12} ${y-34} L${x+12} ${y-28} L${x+20} ${y-28} L${x+20} ${y-34} L${x+26} ${y-34} L${x+26} ${y}Z" fill="#CFC2AA" ${S}/><path d="M${x-5} ${y} L${x-5} ${y-10} Q${x} ${y-16} ${x+5} ${y-10} L${x+5} ${y}Z" fill="${INK}"/>`,
 wall:(x,y)=>`<rect x="${x-30}" y="${y-14}" width="60" height="14" fill="#BFAF95" ${S}/><path d="M${x-30} ${y-7} L${x+30} ${y-7} M${x-15} ${y-14} L${x-15} ${y-7} M${x+5} ${y-14} L${x+5} ${y-7} M${x-5} ${y-7} L${x-5} ${y} M${x+18} ${y-7} L${x+18} ${y}" stroke="${INK}" stroke-width="1.5"/>`,
 ship:(x,y)=>`<path d="M${x-22} ${y-8} L${x+22} ${y-8} L${x+14} ${y+4} L${x-14} ${y+4}Z" fill="#8A5A33" ${S}/><path d="M${x} ${y-8} L${x} ${y-46}" stroke="${INK}" stroke-width="3"/><path d="M${x+2} ${y-44} L${x+20} ${y-14} L${x+2} ${y-14}Z" fill="#F6F1E6" ${S}/>`,
 temple:(x,y)=>`<path d="M${x-24} ${y-28} L${x} ${y-42} L${x+24} ${y-28}Z" fill="#E9DFC7" ${S}/><rect x="${x-24}" y="${y-4}" width="48" height="4" fill="#E9DFC7" ${S}/>${[-16,-5,5,16].map(o=>`<rect x="${x+o-3}" y="${y-28}" width="6" height="24" fill="#F4EDE1" ${S}/>`).join('')}`,
 observatory:(x,y)=>`<rect x="${x-14}" y="${y-20}" width="28" height="20" fill="#E9E0CF" ${S}/><path d="M${x-16} ${y-20} A16 16 0 0 1 ${x+16} ${y-20}Z" fill="#6A5F8E" ${S}/><path d="M${x+2} ${y-30} L${x+16} ${y-44}" stroke="${INK}" stroke-width="5"/>`,
 greenhouse:(x,y)=>`<path d="M${x-20} ${y} L${x-20} ${y-16} A20 16 0 0 1 ${x+20} ${y-16} L${x+20} ${y}Z" fill="#CFE8D6" ${S}/><path d="M${x} ${y-32} L${x} ${y} M${x-20} ${y-16} L${x+20} ${y-16}" stroke="${INK}" stroke-width="1.5"/>`
};

function islandSVG(t,{w=320,mascot=true}={}){
 const i=t.isl,seed=t.n;
 const blob=(cx,cy,rx,ry,k)=>{let p='';for(let a=0;a<=12;a++){const th=a/12*Math.PI*2,r=1+Math.sin(th*3+seed+k)*.06+Math.cos(th*2+seed*1.7)*.05;p+=(a?'L':'M')+(cx+Math.cos(th)*rx*r).toFixed(1)+' '+(cy+Math.sin(th)*ry*r).toFixed(1)}return p+'Z'};
 const slots=[[92,128],[160,112],[226,130]];
 return `<svg viewBox="0 0 320 220" width="${w}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${i.name}">
 <path d="${blob(160,150,150,52,0)}" fill="#BFE0E4" opacity=".7"/>
 <path d="${blob(160,148,132,44,1)}" fill="${i.sand}" ${S}/>
 <path d="${blob(160,138,108,32,2)}" fill="${i.grass}"/>
 <path d="M40 176 q10 -6 20 0 M250 182 q10 -6 20 0 M150 196 q8 -5 16 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>
 ${i.props.map((p,k)=>PROPS[p](slots[k][0],slots[k][1])).join('')}
 ${mascot?`<g transform="translate(144 124) scale(.22)">${mascotSVG(t).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g>`:''}
 </svg>`;
}
