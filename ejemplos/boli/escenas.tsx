import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {cue} from './cues';

export const ACENTO = '#ffc83d';
export const CLAVES = ['agujero', 'agujeros', 'aire', 'iso', 'obligatorio', 'ocho', 'tinta', 'vacio', 'dos', 'vida', 'garganta', 'cuerpo'];

const CREMA = '#ece6d8';
const GRIS = '#8e8a80';
const TINTA = '#2f6fe0';

const useEntra = (desde: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - desde, fps, config: {damping}});
};

/** Trazo que se dibuja (strokeDashoffset). */
const Trazo: React.FC<{d: string; desde: number; dur?: number; color?: string; w?: number}> = ({d, desde, dur = 12, color = ACENTO, w = 8}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [desde, desde + dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={p} />;
};

const Etiqueta: React.FC<{children: React.ReactNode; desde: number; top: number; size?: number; color?: string}> = ({children, desde, top, size = 56, color = '#f2f2f2'}) => {
  const e = useEntra(desde);
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontSize: size, fontWeight: 800, color,
      opacity: e, transform: `translateY(${(1 - e) * 30}px)`, letterSpacing: -1}}>{children}</div>
  );
};

/** La tapa del boli en grande, con su agujero. */
const Tapa: React.FC<{x?: number; y?: number; s?: number}> = ({x = 540, y = 760, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-300} width={140} height={520} rx={40} fill="#3b6fd8" />
    <rect x={-70} y={-300} width={140} height={520} rx={40} fill="url(#brillo)" />
    <rect x={62} y={-260} width={34} height={360} rx={14} fill="#2c55aa" />
    <ellipse cx={0} cy={-300} rx={70} ry={22} fill="#4a80ea" />
    <circle cx={0} cy={-300} r={16} fill="#0c0c0e" />
  </g>
);

/** 1 · «¿Por qué la tapa del boli tiene un agujero?» */
const E1: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const a = cue('agujero');
  const pulso = 1 + 0.08 * Math.sin(Math.max(0, frame - a) / 4);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs><linearGradient id="brillo" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".25" /><stop offset=".4" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <Tapa />
        {frame >= a - 2 && <circle cx={540} cy={460} r={60 * pulso} fill="none" stroke={ACENTO} strokeWidth={8} />}
      </svg>
      <Etiqueta desde={0} top={190} size={64}>¿Por qué tiene un agujero?</Etiqueta>
    </AbsoluteFill>
  );
};

/** 2 · «No, no es para ahorrar plástico.» */
const E2: React.FC<{desde: number}> = ({desde}) => {
  const t = cue('ahorrar');
  return (
    <AbsoluteFill>
      <Etiqueta desde={desde} top={700} size={84} color={GRIS}>¿Para ahorrar plástico?</Etiqueta>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <Trazo d="M140 770 L940 830" desde={t + 2} dur={10} color="#ff5a5a" w={12} />
      </svg>
      <Etiqueta desde={t + 8} top={900} size={120} color="#ff5a5a">No.</Etiqueta>
    </AbsoluteFill>
  );
};

/** 3 · La garganta: la tapa atascada y el aire que pasa por el agujero. */
const E3: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const aire = cue('aire');
  const flujo = (frame - aire) / 2;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <path d="M380 260 C380 600 420 900 440 1300 L640 1300 C660 900 700 600 700 260" fill="#3a2a2a" stroke="#c98a7a" strokeWidth={10} />
        <Tapa x={540} y={900} s={0.55} />
        {frame >= aire - 2 && [0, 1, 2, 3, 4].map((i) => {
          const yy = 1250 - ((flujo * 14 + i * 160) % 900);
          return <path key={i} d={`M540 ${yy} l-18 30 m18 -30 l18 30`} stroke="#7fe0ff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />;
        })}
      </svg>
      <Etiqueta desde={cue('garganta') - 4} top={180} size={58}>Se queda en la garganta…</Etiqueta>
      <Etiqueta desde={aire} top={1370} size={64} color="#7fe0ff">…y el aire sigue pasando</Etiqueta>
    </AbsoluteFill>
  );
};

/** 4 · La norma ISO 11540. */
const E4: React.FC<{desde: number}> = ({desde}) => {
  const e = useEntra(desde);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 760, padding: 56, borderRadius: 28, background: '#16161a', border: '2px solid #2a2a30',
        transform: `translateY(${(1 - e) * 60}px) scale(${0.9 + 0.1 * e})`, opacity: e, marginTop: -200}}>
        <div style={{color: GRIS, fontSize: 34, fontWeight: 500, marginBottom: 18}}>Norma internacional</div>
        <div style={{color: '#fff', fontSize: 130, fontWeight: 800, letterSpacing: -4}}>ISO 11540</div>
        <div style={{color: CREMA, fontSize: 40, fontWeight: 500, marginTop: 18}}>Tapas de bolis y rotuladores</div>
      </div>
      <Etiqueta desde={cue('obligatorio')} top={1290} size={72} color={ACENTO}>OBLIGATORIO</Etiqueta>
      <Etiqueta desde={cue('ninos')} top={420} size={58} color="#7fe0ff">Niños de 0 a 14 años</Etiqueta>
    </AbsoluteFill>
  );
};

/** 5 · «al menos ocho litros de aire por minuto» */
const E5: React.FC<{desde: number}> = ({desde}) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [desde, desde + 20], [0, 8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{color: '#7fe0ff', fontSize: 420, fontWeight: 800, marginTop: -260, letterSpacing: -12}}>{n}</div>
      <div style={{color: '#f2f2f2', fontSize: 64, fontWeight: 800, marginTop: -40}}>litros de aire</div>
      <div style={{color: GRIS, fontSize: 52, fontWeight: 500}}>por minuto, como mínimo</div>
    </AbsoluteFill>
  );
};

/** El boli entero, tumbado. */
const Boli: React.FC<{marca1?: number; marca2?: number}> = ({marca1, marca2}) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <polygon points="120,900 180,880 180,940" fill={CREMA} />
      <rect x={180} y={872} width={640} height={76} rx={10} fill="rgba(220,230,255,.18)" stroke="#9fb4e6" strokeWidth={3} />
      <rect x={200} y={898} width={560} height={24} rx={8} fill={TINTA} />
      <rect x={820} y={866} width={150} height={88} rx={30} fill="#3b6fd8" />
      <circle cx={600} cy={872} r={9} fill="#0c0c0e" stroke="#9fb4e6" strokeWidth={3} />
      <circle cx={975} cy={910} r={10} fill="#0c0c0e" />
      {marca1 !== undefined && frame >= marca1 && <circle cx={975} cy={910} r={44} fill="none" stroke={ACENTO} strokeWidth={8} />}
      {marca2 !== undefined && frame >= marca2 && <circle cx={600} cy={872} r={44} fill="none" stroke={ACENTO} strokeWidth={8} />}
    </svg>
  );
};

/** 6 · «Pero tu boli tiene otro agujero, en el cuerpo.» */
const E6: React.FC<{desde: number}> = () => (
  <AbsoluteFill>
    <Boli marca2={cue('cuerpo')} />
    <Etiqueta desde={cue('otro')} top={560} size={70}>Otro agujero</Etiqueta>
  </AbsoluteFill>
);

/** 7 · La tinta y el vacío. */
const E7: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const v = cue('vacio');
  const baja = interpolate(frame, [cue('tinta'), cue('tinta') + 40], [0, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <rect x={470} y={420} width={140} height={760} rx={20} fill="rgba(220,230,255,.12)" stroke="#9fb4e6" strokeWidth={4} />
        <rect x={500} y={460 + baja} width={80} height={660 - baja} rx={10} fill={TINTA} />
        <polygon points="540,1240 500,1180 580,1180" fill={CREMA} />
        <circle cx={470} cy={520} r={10} fill="#0c0c0e" stroke="#9fb4e6" strokeWidth={3} />
        {frame < v && <path d="M330 520 l120 0 m-20 -16 l20 16 l-20 16" stroke="#7fe0ff" strokeWidth={8} fill="none" strokeLinecap="round" />}
        {frame >= v && <Trazo d="M380 470 L560 570 M560 470 L380 570" desde={v} dur={8} color="#ff5a5a" w={12} />}
      </svg>
      <Etiqueta desde={cue('tinta')} top={220} size={64}>Entra aire, baja la tinta</Etiqueta>
      <Etiqueta desde={v} top={1330} size={64} color="#ff5a5a">Sin agujero: vacío</Etiqueta>
    </AbsoluteFill>
  );
};

/** 8 · «tu boli tiene dos agujeros. Y uno de ellos puede salvar una vida.» */
const E8: React.FC<{desde: number}> = ({desde}) => (
  <AbsoluteFill>
    <Boli marca1={desde + 4} marca2={desde + 10} />
    <Etiqueta desde={desde} top={560} size={90} color={ACENTO}>2 agujeros</Etiqueta>
    <Etiqueta desde={cue('vida')} top={1120} size={64}>Uno puede salvar una vida</Etiqueta>
  </AbsoluteFill>
);

export const ESCENAS: {desde: () => number; Componente: React.FC<{desde: number}>}[] = [
  {desde: () => 0, Componente: E1},
  {desde: () => cue('no') - 2, Componente: E2},
  {desde: () => cue('nino') - 2, Componente: E3},
  {desde: () => cue('obligatorio') - 2, Componente: E4},
  {desde: () => cue('ocho') - 2, Componente: E5},
  {desde: () => cue('otro') - 2, Componente: E6},
  {desde: () => cue('tinta') - 2, Componente: E7},
  {desde: () => cue('dos') - 2, Componente: E8},
];
