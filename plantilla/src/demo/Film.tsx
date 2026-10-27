import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import frases from '../../public/demo/frases.json';
import cues from '../../public/demo/cues.json';
import {Arrow, Defs, Egg, Glass, Grains, Kitchen, Ocean, Shaker, clamp,ease,mix,span} from './Mundo';

const TITLE='#fff2d5',GREEN='#91f2c5',RED='#ff8577';
const anchor=(word:string,scene:number,fallback:number)=>{const p=cues.palabras.find(x=>x.w===word&&x.t>=frases[scene].inicio&&x.t<=frases[scene].fin);return p?p.t-frases[scene].inicio:fallback};
const T:React.FC<{a:string;b?:string;color?:string}>=({a,b,color=TITLE})=><g textAnchor="middle" fontFamily="Arial" fontWeight="800" fill={color}><text x="540" y="265" fontSize={Math.min(76,900/(a.length*.59))}>{a}</text>{b&&<text x="540" y="350" fontSize={Math.min(76,900/(b.length*.59))}>{b}</text>}</g>;
const Word:React.FC<{x:number;y:number;text:string;fill?:string;size?:number}>=({x,y,text,fill='#f4eddd',size=39})=><text x={x} y={y} fill={fill} fontFamily="Arial" fontWeight="700" fontSize={size} textAnchor="middle">{text}</text>;

const Hook:React.FC<{t:number;d:number}>=({t,d})=>{
 const hunde=anchor('hunde',0,d*.25),salT=anchor('sal',0,d*.45),empieza=anchor('empieza',0,d*.68),flotar=anchor('flotar',0,d*.88);
 const drop=span(t,Math.max(.05,hunde-.6),hunde+.12),salt=span(t,salT-.12,empieza+.1),rise=span(t,empieza-.05,Math.min(d-.1,flotar+.35));
 const y=mix(mix(-20,420,drop),200,rise);const shake=t>salT-.15&&t<empieza+.1?Math.sin(t*22)*7:0;
 return <><T a="¿POR QUÉ FLOTA?"/><g transform={`translate(540 930) scale(${mix(.91,1,span(t,0,.5))}) translate(-540 -930)`}>
 <Glass x={540} y={590} s={1.03} eggY={y} salt={salt} ripple={drop<1?drop:rise<1&&rise>0?rise:0}/>
 <g opacity={span(t,salT-.65,salT-.2)*(1-span(t,empieza+.12,empieza+.48))}><Shaker x={755} y={530} r={-52+shake} s={1.05}/><Grains t={t} start={salT-.12} end={empieza+.1} x={640} y={510}/></g>
 </g><Word x={540} y={1320} text={rise>.5?'MISMO HUEVO. OTRA AGUA.':salt>.1?'AÑADE SAL':'AGUA DULCE'} fill={rise>.5?GREEN:TITLE}/></>;
};

const Compare:React.FC<{t:number;d:number;final?:boolean}>=({t,d,final=false})=>{
 const reveal=span(t,.1,.5);
 return <><T a={final?'NO ERA MÁS LIGERO.':'EL HUEVO ES EL MISMO.'} b={final?'EL AGUA ERA MÁS DENSA.':'CAMBIA EL AGUA.'}/>
 <g opacity={reveal}><Glass x={290} y={690} s={.72} eggY={420} title="AGUA DULCE"/><Glass x={790} y={690} s={.72} eggY={200} salt={1} title="AGUA CON SAL"/>
 <path d="M475 870H605M585 850L605 870L585 890" fill="none" stroke={GREEN} strokeWidth="7" strokeLinecap="round"/>
 <Word x={290} y={1265} text="SE HUNDE" fill={RED}/><Word x={790} y={1265} text="FLOTA" fill={GREEN}/>
 </g></>;
};

const Dissolve:React.FC<{t:number;d:number}>=({t,d})=>{
 const dissolve=span(t,.55,d*.73);const zoom=span(t,0,.55);
 return <><T a="LA SAL SE DISUELVE."/>
 <g transform={`translate(540 970) scale(${mix(.92,1,zoom)}) translate(-540 -970)`}>
 <rect x="115" y="540" width="850" height="740" rx="80" fill="#0c5671" stroke="#a0f5f177" strokeWidth="4"/>
 <ellipse cx="540" cy="550" rx="425" ry="65" fill="#63cfd6" opacity=".4"/>
 {Array.from({length:62},(_,i)=>{
 const x=180+(i*83)%720,y=620+(i*117)%580;
 return <g key={i} transform={`translate(${x+Math.sin(t*1.6+i)*8} ${y+Math.cos(t*1.4+i)*8})`}><circle r="14" fill="#79d7ea" opacity=".5"/><circle cx="-5" cy="-5" r="5" fill="#dbffff" opacity=".45"/></g>;
 })}
 <g opacity={1-dissolve} transform={`translate(540 ${mix(680,850,span(t,.1,.65))}) rotate(${mix(-25,15,dissolve)}) scale(${1-dissolve*.5})`}><path d="M-80 -65L15 -100L95 -40L0 -5Z" fill="#ffffe8"/><path d="M-80 -65L0 -5V95L-80 35Z" fill="#c7dce0"/><path d="M0 -5L95 -40V55L0 95Z" fill="#93aeb8"/></g>
 {Array.from({length:38},(_,i)=>{
 const a=i*2.4,rad=30+(i%7)*35;
 return <circle key={i} cx={540+Math.cos(a)*rad*dissolve} cy={850+Math.sin(a)*rad*dissolve} r={7+(i%2)*3} fill={i%2?'#ffd99d':'#a7ffd9'} opacity={dissolve*.9}/>;
 })}
 </g><Word x={540} y={1370} text="AUMENTA LA DENSIDAD" fill={GREEN}/><Word x={540} y={1740} text="Partículas: representación simplificada" fill="#9fb5bd" size={26}/></>;
};

const Balance:React.FC<{t:number;d:number}>=({t,d})=>{
 const angle=span(t,.3,d*.72)*7;
 return <><T a="MISMO VOLUMEN." b="MÁS MASA."/>
 <g transform="translate(540 920)">
 <path d="M0 0L-80 350H80Z" fill="url(#steel)"/><rect x="-170" y="340" width="340" height="45" rx="15" fill="url(#steel)"/>
 <g transform={`rotate(${angle})`}>
 <rect x="-360" y="-18" width="720" height="36" rx="18" fill="url(#steel)"/>
 {[-290,290].map((x,i)=><g key={i} transform={`translate(${x} 0) rotate(${-angle})`}>
 <path d="M-120 205L0 -5L120 205" fill="none" stroke="#c4d6d5" strokeWidth="4"/>
 <path d="M-143 205Q0 275 143 205Z" fill="url(#steel)"/>
 <Glass x={0} y={-85} s={.47} eggScale={0}/>
 <Word x={0} y={-145} text={i?'CON SAL':'SIN SAL'} fill={i?GREEN:TITLE} size={36}/>
 {i===1&&<g opacity={span(t,.1,.6)}>{Array.from({length:12},(_,j)=><circle key={j} cx={Math.sin(j*3)*45} cy={30+(j*21)%120} r="4" fill="#fce6b4"/>)}</g>}
 </g>)}
 </g><circle r="29" fill="#be955b" stroke="#f5d4a0" strokeWidth="4"/>
 </g></>;
};

const Forces:React.FC<{t:number;d:number;rise?:boolean}>=({t,d,rise=false})=>{
 const p=rise?span(t,.25,d*.8):span(t,.1,.6);const y=rise?mix(420,200,p):420;
 return <><T a={rise?'EL EMPUJE AUMENTA.':'EL AGUA EMPUJA'} b={rise?'Y LO SOSTIENE.':'HACIA ARRIBA.'}/>
 <Glass x={540} y={590} s={1} eggY={y} salt={rise?p:0}/>
 <g opacity={rise?1:p}><Arrow x={285} y={590+y+55} len={rise?mix(95,180,p):95} up color={GREEN} label="EMPUJE"/><Arrow x={800} y={590+y-70} len={180} color={RED} label="PESO"/></g>
 {rise&&<g opacity={span(t,d*.73,d*.85)}><path d="M470 1275H610M470 1293H610" stroke={GREEN} strokeWidth="8" strokeLinecap="round"/><Word x={540} y={1365} text="EQUILIBRIO" fill={GREEN}/></g>}
 </>;
};

const Captions:React.FC<{t:number}>=({t})=>{
 const words=cues.palabras;let active=words.findIndex((p,i)=>t>=p.t&&t<(words[i+1]?.t??p.f+.28));
 if(active<0)return null;
 const first=Math.floor(active/3)*3,g=words.slice(first,first+3);
 return <div style={{position:'absolute',top:1475,left:72,right:72,textAlign:'center',fontFamily:'Arial',fontWeight:800,fontSize:Math.min(65,1600/g.reduce((n,p)=>n+p.texto.length+1,0)),lineHeight:1.2}}><span style={{display:'inline-block',background:'#04151bdf',padding:'18px 24px',borderRadius:18,boxShadow:'0 8px 40px #0003'}}>{g.map((p,i)=><React.Fragment key={p.t+'-'+i}><span style={{color:first+i===active?'#9af2c7':'#f7f2e7',opacity:t+.04>=p.t?1:.6}}>{p.texto}</span>{i<g.length-1?' ':''}</React.Fragment>)}</span></div>;
};

export const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/30;
 const scene=frases.reduce((n,x,i)=>t>=x.inicio?i:n,0);
 const phrase=frases[scene];const local=t-phrase.inicio;const duration=(frases[scene+1]?.inicio??phrase.fin+.25)-phrase.inicio;
 return <AbsoluteFill style={{background:'#0a202a'}}>
 <Audio src={staticFile('demo/narracion.wav')}/>
 <Sequence from={Math.round((anchor('hunde',0,1)+.12)*30)} durationInFrames={18}><Audio src={staticFile('sfx/agua.wav')} volume={.2}/></Sequence>
 {[0,.2,.4].map((r,i)=><Sequence key={'sal'+i} from={Math.round((anchor('sal',0,2)+r)*30)} durationInFrames={5}><Audio src={staticFile('sfx/sal.wav')} volume={.1}/></Sequence>)}
 <Sequence from={Math.round((frases[1].inicio+.25)*30)} durationInFrames={15}><Audio src={staticFile('sfx/cristal.wav')} volume={.08}/></Sequence>
 {[0,2,3,5,7].map((n)=><Sequence key={n} from={Math.round(frases[n].inicio*30)+4} durationInFrames={12}><Audio src={staticFile(n===3?'sfx/paso.wav':'sfx/aire.wav')} volume={.11}/></Sequence>)}
 <svg viewBox="0 0 1080 1920" width="100%" height="100%"><Defs/>{scene===6?<Ocean t={local}/>:<Kitchen/>}
 <g opacity={1}>{scene===0?<Hook t={local} d={duration}/>:scene===1?<Compare t={local} d={duration}/>:scene===2?<Dissolve t={local} d={duration}/>:scene===3?<Balance t={local} d={duration}/>:scene===4?<Forces t={local} d={duration}/>:scene===5?<Forces t={local} d={duration} rise/>:scene===6?<><T a="MÁS FÁCIL FLOTAR" b="EN AGUA MUY SALADA." color="#153d4b"/></>:<Compare t={local} d={duration} final/>}</g>
 <text x="80" y="130" fill={scene===6?'#244951':'#9bb9bd'} fontFamily="Arial" fontSize="27" letterSpacing="5">HECHO CON ANIMADOS · IA QUE TRABAJA</text>
 <rect x="80" y="1790" width="920" height="4" rx="2" fill="#ffffff18"/><rect x="80" y="1790" width={920*clamp(t/(frases.at(-1)!.fin+.25))} height="4" rx="2" fill="#9af2c7"/>
 </svg><Captions t={t}/>
 </AbsoluteFill>;
};
