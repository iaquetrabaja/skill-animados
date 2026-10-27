import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {arco, Bloque, Estallido, progreso, suave, Sobre} from './kit';

/** Demostración gráfica original, sin narración ni promesas de resultados. */
export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const phase = f < 120 ? 0 : f < 240 ? 1 : 2;
  const titulos = ['Del correo al trabajo hecho', 'Cada paso tiene una función', 'Una idea. Una acción visible.'];
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%, #243959, #0a101d 80%)', color: '#fafcff', fontFamily: 'Arial, sans-serif'}}>
    {[104,172,240].map(t => <Sequence key={t} from={t} durationInFrames={18}><Audio src={staticFile('sfx/logro.wav')} volume={.25}/></Sequence>)}
    <div style={{position:'absolute', top:190, left:90, right:90, fontSize:36, color:'#a8bacf', letterSpacing:5}}>ANIMADOS · DEMO SIN VOZ</div>
    <div style={{position:'absolute', top:280, left:90, right:90, fontWeight:800, fontSize:78, lineHeight:1.08}}>{titulos[phase]}</div>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <ellipse cx="540" cy="1190" rx="410" ry="95" fill="#ffffff06"/>
      <path d="M175 1070H900" stroke="#ffffff15" strokeWidth="12" strokeDasharray="12 20"/>
      <Bloque x={100} y={930} w={200} h={190} color="#83cfff"><path d="M35 75H165V140H35ZM35 75L100 115L165 75" fill="none" stroke="#17364f" strokeWidth="7"/></Bloque>
      <Bloque x={440} y={870} w={200} h={250} color="#b7a0ff"><rect x="35" y="55" width="130" height="105" rx="26" fill="#211d48"/><circle cx="75" cy="99" r="11" fill="#8fffe1"/><circle cx="126" cy="99" r="11" fill="#8fffe1"/><path d="M75 133Q100 151 125 133M100 35V15" stroke="#8fffe1" strokeWidth="6" fill="none"/></Bloque>
      <Bloque x={780} y={930} w={200} h={190} color="#82e3ad"><path d="M45 100L85 135L155 55" fill="none" stroke="#15472c" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/></Bloque>
      {[0, 1, 2].map(i => {
        const start = 12 + i * 68;
        const p1 = suave(progreso(f, start, 40));
        const p2 = suave(progreso(f, start + 52, 40));
        const pos = p2 > 0 ? arco(p2, [540, 820], [880, 880], 130) : arco(p1, [200, 880], [540, 820], 180);
        if(f < start) return null;
        return <Sobre key={i} x={pos[0]} y={pos[1] + (p2 === 1 ? i * 24 : 0)} escala={.75} color={p2 > 0 ? '#8df0ba' : '#ffda7a'}/>;
      })}
      <Estallido frame={f} desde={104} x={880} y={865}/>
      <Estallido frame={f} desde={172} x={880} y={865}/>
      <Estallido frame={f} desde={240} x={880} y={865}/>
      <text x="200" y="1240" textAnchor="middle" fill="#b2c7df" fontSize="34">RECIBE</text>
      <text x="540" y="1240" textAnchor="middle" fill="#b2c7df" fontSize="34">PROCESA</text>
      <text x="880" y="1240" textAnchor="middle" fill="#b2c7df" fontSize="34">ENTREGA</text>
    </svg>
    <div style={{position:'absolute', bottom:270, left:90, right:90, fontSize:42, lineHeight:1.3, color:'#b8c9df'}}>Objetos con volumen · movimiento con destino · pausas para entender</div>
  </AbsoluteFill>;
};
