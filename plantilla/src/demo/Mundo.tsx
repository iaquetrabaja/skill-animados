import React from 'react';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const ease=(v:number)=>{const p=clamp(v);return p*p*(3-2*p)};
export const span=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;

export const Defs=()=> <defs>
 <linearGradient id="room" x2="0" y2="1"><stop stopColor="#163b48"/><stop offset=".6" stopColor="#102932"/><stop offset="1" stopColor="#081b23"/></linearGradient>
 <radialGradient id="light"><stop stopColor="#fff0c6" stopOpacity=".32"/><stop offset="1" stopColor="#fff0c6" stopOpacity="0"/></radialGradient>
 <linearGradient id="wood" x2=".8" y2="1"><stop stopColor="#ad7954"/><stop offset=".4" stopColor="#6b4332"/><stop offset="1" stopColor="#2e2628"/></linearGradient>
 <radialGradient id="egg" cx=".28" cy=".23" r=".85"><stop stopColor="#fffbe6"/><stop offset=".35" stopColor="#edd1a6"/><stop offset=".78" stopColor="#bd8e66"/><stop offset="1" stopColor="#6d5140"/></radialGradient>
 <linearGradient id="glass"><stop stopColor="#c7f5ff" stopOpacity=".3"/><stop offset=".18" stopColor="#b6e5fa" stopOpacity=".03"/><stop offset=".7" stopColor="#fff" stopOpacity=".08"/><stop offset="1" stopColor="#d0faff" stopOpacity=".3"/></linearGradient>
 <linearGradient id="water" x2=".65" y2="1"><stop stopColor="#9cf8ee" stopOpacity=".48"/><stop offset=".45" stopColor="#48c3cc" stopOpacity=".26"/><stop offset="1" stopColor="#158caa" stopOpacity=".58"/></linearGradient>
 <linearGradient id="steel"><stop stopColor="#9bb2c0"/><stop offset=".3" stopColor="#f1fafc"/><stop offset=".52" stopColor="#9dafb7"/><stop offset=".8" stopColor="#47616d"/><stop offset="1" stopColor="#c6d4da"/></linearGradient>
 <linearGradient id="ocean" x2="0" y2="1"><stop stopColor="#6ec2d7"/><stop offset=".35" stopColor="#147a9b"/><stop offset="1" stopColor="#06445f"/></linearGradient>
 <radialGradient id="sky"><stop stopColor="#ffefc2"/><stop offset=".55" stopColor="#afd9df"/><stop offset="1" stopColor="#659eb5"/></radialGradient>
 <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="shadow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="9"/></filter>
 </defs>;

export const Kitchen=()=> <g>
 <rect width="1080" height="1920" fill="url(#room)"/>
 <g opacity=".3"><path d="M0 600H1080M0 760H1080M0 920H1080M0 1080H1080M160 450V1200M420 450V1200M680 450V1200M940 450V1200" stroke="#7da9ae" strokeWidth="2"/></g>
 <g opacity=".55" filter="url(#blur)"><rect x="-50" y="150" width="290" height="620" rx="30" fill="#e9d8ac"/><path d="M80 150V760M-50 460H250" stroke="#294d54" strokeWidth="24"/></g>
 <ellipse cx="220" cy="620" rx="690" ry="660" fill="url(#light)"/>
 <path d="M0 1260L1080 1190V1920H0Z" fill="url(#wood)"/>
 <path d="M0 1260L1080 1190V1225L0 1290Z" fill="#d0a57d" opacity=".55"/>
 {Array.from({length:12},(_,i)=><path key={i} d={`M0 ${1300+i*65}Q500 ${1200+i*78} 1080 ${1250+i*70}`} fill="none" stroke="#e9c39f" strokeWidth="2" opacity=".07"/>)}
 <ellipse cx="540" cy="1270" rx="370" ry="90" fill="#000" opacity=".28" filter="url(#shadow)"/>
 <rect y="1470" width="1080" height="450" fill="#071a25" opacity=".62"/>
 </g>;

export const Egg:React.FC<{x:number;y:number;s?:number;r?:number;wet?:boolean}>=({x,y,s=1,r=0,wet=false})=><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
 <path d="M0 -102C49 -102 84 -37 84 15C84 69 49 99 0 100C-49 99 -84 69 -84 15C-84 -37 -49 -102 0 -102Z" fill="url(#egg)" stroke="#fff0cd88" strokeWidth="2"/>
 {Array.from({length:38},(_,i)=><circle key={i} cx={Math.sin(i*2.87)*55} cy={Math.cos(i*1.37)*72} r={1+(i%3)*.45} fill="#77573c" opacity=".16"/>)}
 <ellipse cx="-26" cy="-38" rx="20" ry="35" transform="rotate(22)" fill="#fff8dc" opacity=".2"/>
 {wet&&<path d="M-39 -65Q-57 -27 -56 15" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".6" fill="none"/>}
 </g>;

export const Glass:React.FC<{x:number;y:number;s?:number;eggY?:number;eggScale?:number;salt?:number;ripple?:number;title?:string;opacity?:number}>=({x,y,s=1,eggY=420,eggScale=1,salt=0,ripple=0,title,opacity=1})=><g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
 <ellipse cy="590" rx="220" ry="37" fill="#000" opacity=".32" filter="url(#shadow)"/>
 <path d="M-188 10L-165 540Q0 604 165 540L188 10Z" fill="url(#glass)" stroke="#cff5ff66" strokeWidth="3"/>
 <path d="M-182 142L-165 531Q0 581 165 531L182 142Z" fill="url(#water)"/>
 <ellipse cy="142" rx="182" ry="43" fill="#8fe7df" opacity={.23+salt*.1} stroke="#c5ffff88" strokeWidth="2"/>
 <g opacity=".18">{Array.from({length:24},(_,i)=><circle key={i} cx={Math.sin(i*8.3)*147} cy={194+(i*73)%310} r={1.5+(i%3)} fill="#c2ffed"/>)}</g>
 <Egg x={0} y={eggY} s={eggScale} wet/>
 <path d="M-182 142L-165 531Q0 581 165 531L182 142Z" fill="#0d9ec5" opacity=".07"/>
 {ripple>0&&[1,2,3].map(i=><ellipse key={i} cy="142" rx={40+ripple*130/i} ry={(40+ripple*130/i)*.23} fill="none" stroke="#d3fffa" strokeWidth="2" opacity={(1-ripple)*.55}/>)}
 <ellipse cy="0" rx="188" ry="49" fill="none" stroke="#d1edfa" strokeWidth="5" opacity=".8"/>
 <path d="M-160 36L-140 500" stroke="#fff" strokeWidth="13" opacity=".17" strokeLinecap="round"/>
 <path d="M153 48L134 507" stroke="#fff" strokeWidth="5" opacity=".39" strokeLinecap="round"/>
 <path d="M-164 540Q0 598 164 540" stroke="#d9faff" opacity=".65" strokeWidth="8" fill="none"/>
 {title&&<text x="0" y="665" textAnchor="middle" fill="#fff4dc" fontSize="44" fontWeight="700">{title}</text>}
 </g>;

export const Shaker:React.FC<{x:number;y:number;r?:number;s?:number}>=({x,y,r=0,s=1})=><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
 <path d="M-53 -100H53L68 80Q0 116 -68 80Z" fill="#cfe9f077" stroke="#c5e9e9" strokeWidth="3"/>
 <path d="M-57 0H57L65 80Q0 105 -65 80Z" fill="#e9e5d5"/>
 <ellipse cy="-100" rx="53" ry="16" fill="url(#steel)"/><rect x="-53" y="-124" width="106" height="27" rx="6" fill="url(#steel)"/><ellipse cy="-124" rx="53" ry="16" fill="#d6e6ec"/>
 {[-25,0,25].map((x,i)=><circle key={i} cx={x} cy={-126+(i%2)*7} r="4" fill="#45616c"/>)}
 <rect x="-39" y="0" width="78" height="51" rx="6" fill="#244956"/>
 <text y="34" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700">SAL</text>
 </g>;

export const Arrow:React.FC<{x:number;y:number;len:number;up?:boolean;color:string;label:string}>=({x,y,len,up=false,color,label})=><g transform={`translate(${x} ${y})`}>
 <path d={`M0 0V${up?-len:len}`} fill="none" stroke={color} strokeWidth="17" strokeLinecap="round"/>
 <path d={up?`M-22 ${-len+22}L0 ${-len}L22 ${-len+22}`:`M-22 ${len-22}L0 ${len}L22 ${len-22}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
 <text x="0" y={up?-len-35:len+55} textAnchor="middle" fill={color} fontSize="43" fontWeight="700">{label}</text>
 </g>;

export const Grains:React.FC<{t:number;start:number;end:number;x?:number;y?:number}>=({t,start,end,x=500,y=500})=><g>
 {Array.from({length:80},(_,i)=>{
 const local=t-start-i*.034;const dur=.75+(i%5)*.025;
 if(local<0||local>dur||t>end+.6)return null;
 const p=local/dur;const gx=x+Math.sin(i*5.13)*52*p,gy=y+570*p*p;
 return <rect key={i} x={gx} y={gy} width={5+(i%3)} height={7+(i%2)} rx="1" fill="#fff9de" opacity={p>.8?1-(p-.8)*5:1} transform={`rotate(${i*13} ${gx} ${gy})`}/>;
 })}
 </g>;

export const Ocean:React.FC<{t:number}>=({t})=><g>
 <rect width="1080" height="1920" fill="url(#sky)"/>
 <circle cx="210" cy="420" r="145" fill="#fff4ce" opacity=".8"/>
 <path d="M0 760Q140 690 300 760T610 760T1080 760V1920H0Z" fill="url(#ocean)"/>
 {Array.from({length:13},(_,i)=><path key={i} d={`M-100 ${830+i*70}Q130 ${805+i*70+Math.sin(t+i)*12} 370 ${830+i*70}T850 ${830+i*70}T1330 ${830+i*70}`} fill="none" stroke="#c0f8ef" strokeWidth={i%3===0?5:2} opacity={.12+i*.009}/>)}
 <g transform={`translate(540 ${1000+Math.sin(t*1.7)*8}) rotate(-7)`}>
 <ellipse cy="102" rx="350" ry="45" fill="#003f54" opacity=".22"/>
 <path d="M-178 8Q-50 -23 100 0L192 65L164 87L58 44L-120 55Z" fill="#cf9b77"/>
 <path d="M-70 1L35 2L65 45L-78 47Z" fill="#fb735f"/>
 <path d="M-102 15L-175 72L-266 64M-87 28L-30 90L70 110" fill="none" stroke="#e3ae84" strokeWidth="30" strokeLinecap="round"/>
 <circle cx="-185" cy="-4" r="53" fill="#e6b38b"/>
 <path d="M-234 -13Q-225 -76 -166 -52L-146 -19Q-190 -38 -216 -7" fill="#3f302d"/>
 <path d="M-214 -8L-190 -5M-179 -3L-156 0" stroke="#223c40" strokeWidth="12" strokeLinecap="round"/>
 <path d="M-194 26Q-175 36 -162 23" stroke="#754a3b" strokeWidth="4" fill="none"/>
 </g>
 <path d={`M100 ${1140+Math.sin(t)*7}Q300 1095 520 1150T1000 1145`} stroke="#adf3e1" strokeWidth="6" opacity=".45" fill="none"/>
 <rect y="1450" width="1080" height="470" fill="#052f42" opacity=".8"/>
 </g>;
