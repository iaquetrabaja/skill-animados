import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {cue} from './cues';

export const ACENTO = '#ffc83d';
export const CLAVES = ['gancho', 'suelto', 'roto', 'proposito', 'fuera', 'dentro', 'grueso', 'cero', 'fijo', 'corta', 'larga',
  'alicates', 'bien'];

const AMARILLO = '#f2c230';
const METAL = '#9aa3ad';
const METAL_OSC = '#5d656e';
const ROJO = '#ff5a5a';
const VERDE = '#4ade80';
const AZUL = '#7fe0ff';
const T = 36;
const ZOOM = 'translate(300 900) scale(1.6) translate(-300 -900)'; // los esquemas, ampliados alrededor del borde // grosor del gancho en los esquemas (exagerado para que se vea)

const useEntra = (desde: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - desde, fps, config: {damping}});
};

const suave = (frame: number, a: number, b: number, de: number, a2: number) =>
  interpolate(frame, [a, b], [de, a2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});

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

/** Cinta amarilla con sus marcas, desde x0 hasta x1. El cero va en x0. */
const Cinta: React.FC<{x0: number; x1: number; y: number; numeros?: boolean}> = ({x0, x1, y, numeros = true}) => {
  const marcas = [];
  for (let x = x0, i = 0; x < x1 - 10; x += 20, i++) {
    const larga = i % 5 === 0;
    marcas.push(<line key={i} x1={x} x2={x} y1={y} y2={y + (larga ? 16 : 8)} stroke="#2a2a2a" strokeWidth={larga ? 3 : 2} />);
    if (numeros && i % 5 === 0 && i > 0) marcas.push(<text key={'n' + i} x={x + 4} y={y + 22} fontSize={14} fontWeight={800} fill="#2a2a2a">{i / 5}</text>);
  }
  return (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={26} fill={AMARILLO} />
      {marcas}
    </g>
  );
};

/** Gancho visto de lado: pletina vertical (cara exterior en x) + pestaña remachada sobre la cinta. */
const Gancho: React.FC<{x: number; y: number; alto?: number}> = ({x, y, alto = 120}) => (
  <g>
    <rect x={x} y={y - 12} width={T} height={alto} rx={4} fill={METAL} stroke={METAL_OSC} strokeWidth={3} />
    <rect x={x} y={y - 12} width={150} height={14} rx={4} fill={METAL} stroke={METAL_OSC} strokeWidth={3} />
    <circle cx={x + 70} cy={y - 5} r={5} fill={METAL_OSC} />
    <circle cx={x + 120} cy={y - 5} r={5} fill={METAL_OSC} />
  </g>
);

/** El metro entero: carcasa amarilla, cinta fuera y el gancho, que baila desde `baila`. */
const Metro: React.FC<{baila?: number}> = ({baila}) => {
  const frame = useCurrentFrame();
  const s = baila !== undefined && frame >= baila ? 14 * Math.sin((frame - baila) / 2.2) : 0;
  return (
    <g>
      <rect x={520} y={640} width={400} height={400} rx={70} fill={AMARILLO} />
      <rect x={520} y={640} width={400} height={400} rx={70} fill="url(#brillo)" />
      <rect x={580} y={700} width={280} height={180} rx={24} fill="#1d1d20" />
      <text x={720} y={810} fontSize={72} fontWeight={800} fill={AMARILLO} textAnchor="middle">5 m</text>
      <rect x={590} y={930} width={120} height={70} rx={14} fill="#1d1d20" />
      <Cinta x0={150} x1={530} y={980} numeros={false} />
      <g transform={`translate(${s - 30} 0)`}>
        <Gancho x={150} y={980} />
      </g>
    </g>
  );
};

/** 1 · «¿Por qué el gancho de tu metro está suelto?» */
const E1: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const g = cue('gancho');
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs><linearGradient id="brillo" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <Metro baila={cue('suelto')} />
        {frame >= g - 2 && <circle cx={140} cy={1010} r={96} fill="none" stroke={ACENTO} strokeWidth={8} />}
      </svg>
      <Etiqueta desde={0} top={300} size={70}>¿Por qué baila?</Etiqueta>
    </AbsoluteFill>
  );
};

/** 2 · «No, no está roto. Lo hacen así a propósito.» */
const E2: React.FC<{desde: number}> = ({desde}) => {
  const r = cue('roto');
  return (
    <AbsoluteFill>
      <Etiqueta desde={desde} top={700} size={110} color="#8e8a80">¿Roto?</Etiqueta>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <Trazo d="M330 790 L750 760" desde={r + 2} dur={8} color={ROJO} w={14} />
      </svg>
      <Etiqueta desde={cue('proposito') - 4} top={920} size={100} color={ACENTO}>A propósito</Etiqueta>
    </AbsoluteFill>
  );
};

/** Esquema de lado. `borde`: dónde está la tabla o la pared. `s`: cuánto ha salido el gancho (0 = metido, T = fuera). */
const Esquema: React.FC<{modo: 'fuera' | 'dentro'; s: number; ok: boolean}> = ({modo, s, ok}) => {
  const borde = 300;
  const y = 900;
  // Por fuera, el gancho abraza el canto de la tabla: su cara interior toca el borde.
  // Por dentro, la cara exterior del gancho toca la pared.
  const xGancho = modo === 'fuera' ? borde - T : borde;
  const cero = xGancho + s; // el cero de la cinta va a la cara exterior + lo que ha salido el gancho
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%"><g transform={ZOOM}>
      {modo === 'fuera'
        ? <rect x={borde} y={y + 26} width={720} height={150} fill="#6b4a2f" stroke="#8a6440" strokeWidth={3} />
        : <rect x={60} y={650} width={borde - 60} height={500} fill="#3a3a40" stroke="#55555c" strokeWidth={3} />}
      {modo === 'dentro' && [680, 780, 880, 980, 1080].map((yy) => <line key={yy} x1={60} x2={borde} y1={yy} y2={yy + 40} stroke="#4a4a52" strokeWidth={3} />)}
      <Cinta x0={cero} x1={1040} y={y} />
      <Gancho x={xGancho} y={y} alto={modo === 'fuera' ? 140 : 70} />
      <line x1={borde} x2={borde} y1={y - 160} y2={y + 220} stroke={ok ? VERDE : ROJO} strokeWidth={5} strokeDasharray="14 10" />
      <path d={`M${cero} ${y - 70} l0 60`} stroke={ACENTO} strokeWidth={6} />
      <text x={cero} y={y - 84} fontSize={54} fontWeight={800} fill={ACENTO} textAnchor="middle">0</text>
    </g>
      {ok && <text x={540} y={1330} fontSize={64} fontWeight={800} fill={VERDE} textAnchor="middle">✓ el cero, en el borde</text>}
    </svg>
  );
};

/** 3 · Por fuera: enganchas, tiras y el gancho sale. */
const E3: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const s = suave(frame, cue('tiras'), cue('estira') + 8, 0, T);
  const flecha = suave(frame, cue('tiras'), cue('tiras') + 10, 0, 1);
  return (
    <AbsoluteFill>
      <Esquema modo="fuera" s={s} ok={frame >= cue('estira') + 8} />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <g opacity={flecha}><path d="M560 780 l160 0 m-30 -24 l30 24 l-30 24" stroke={AZUL} strokeWidth={10} fill="none" strokeLinecap="round" /></g>
      </svg>
      <Etiqueta desde={cue('fuera') - 4} top={330} size={76}>Por fuera</Etiqueta>
      <Etiqueta desde={cue('estira')} top={440} size={56} color={AZUL}>tiras → el gancho sale</Etiqueta>
    </AbsoluteFill>
  );
};

/** 4 · Por dentro: contra la pared, empujas y el gancho entra. */
const E4: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const s = suave(frame, cue('empujas'), cue('mete') + 8, T, 0);
  const flecha = suave(frame, cue('empujas'), cue('empujas') + 10, 0, 1);
  return (
    <AbsoluteFill>
      <Esquema modo="dentro" s={s} ok={frame >= cue('mete') + 8} />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <g opacity={flecha}><path d="M760 780 l-160 0 m30 -24 l-30 24 l30 24" stroke={AZUL} strokeWidth={10} fill="none" strokeLinecap="round" /></g>
      </svg>
      <Etiqueta desde={cue('dentro') - 4} top={330} size={76}>Por dentro</Etiqueta>
      <Etiqueta desde={cue('mete')} top={440} size={56} color={AZUL}>empujas → el gancho entra</Etiqueta>
    </AbsoluteFill>
  );
};

/** 5 · «Se mueve justo lo que mide de grueso el propio gancho.» */
const E5: React.FC<{desde: number}> = ({desde}) => {
  const frame = useCurrentFrame();
  const W = 150; // el gancho en grande
  const s = W / 2 + (W / 2) * Math.sin((frame - desde) / 7);
  const g = cue('grueso');
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <rect x={300 + s} y={760} width={680} height={60} fill={AMARILLO} />
        <rect x={150} y={700} width={W} height={380} rx={10} fill={METAL} stroke={METAL_OSC} strokeWidth={4} />
        <rect x={150} y={700} width={420} height={56} rx={10} fill={METAL} stroke={METAL_OSC} strokeWidth={4} />
        <rect x={370} y={716} width={W + 40} height={24} rx={12} fill="#1d1d20" />
        <circle cx={390 + s} cy={728} r={14} fill={METAL_OSC} stroke="#ddd" strokeWidth={3} />
        {frame >= g - 2 && (
          <g>
            <path d={`M150 650 L${150 + W} 650 M150 630 l0 40 M${150 + W} 630 l0 40`} stroke={ACENTO} strokeWidth={6} />
            <text x={150 + W / 2} y={610} fontSize={46} fontWeight={800} fill={ACENTO} textAnchor="middle">grosor</text>
            <path d={`M300 880 L${300 + W} 880 M300 860 l0 40 M${300 + W} 860 l0 40`} stroke={AZUL} strokeWidth={6} />
            <text x={300 + W / 2} y={950} fontSize={46} fontWeight={800} fill={AZUL} textAnchor="middle">holgura</text>
          </g>
        )}
      </svg>
      <Etiqueta desde={cue('gancho', 4)} top={1150} size={72}>Holgura = grosor</Etiqueta>
    </AbsoluteFill>
  );
};

/** 6 · «Así el cero siempre cae en su sitio, midas como midas.» */
const E6: React.FC<{desde: number}> = ({desde}) => {
  const e = useEntra(desde);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{color: ACENTO, fontSize: 460, fontWeight: 800, marginTop: -320, transform: `scale(${0.7 + 0.3 * e})`, opacity: e}}>0</div>
      <Etiqueta desde={cue('sitio') - 4} top={1080} size={64}>siempre en su sitio</Etiqueta>
      <Etiqueta desde={cue('midas', 1)} top={1200} size={58} color={VERDE}>✓ por fuera    ✓ por dentro</Etiqueta>
    </AbsoluteFill>
  );
};

/** 7 · «Si estuviera fijo, una de las dos medidas te saldría corta o larga.» */
const E7: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const c = cue('corta');
  return (
    <AbsoluteFill>
      <Esquema modo="fuera" s={0} ok={false} />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <g transform={ZOOM}><g transform="translate(250 1080)">
          <rect x={-34} y={0} width={68} height={52} rx={8} fill={ROJO} />
          <path d="M-20 0 v-20 a20 20 0 0 1 40 0 v20" stroke={ROJO} strokeWidth={10} fill="none" />
        </g>
        {frame >= c - 2 && <path d={`M${300 - T} 790 l0 30 M300 790 l0 30 M${300 - T} 805 L300 805`} stroke={ROJO} strokeWidth={5} />}</g>
      </svg>
      <Etiqueta desde={cue('fijo') - 4} top={330} size={76} color={ROJO}>Gancho fijo</Etiqueta>
      <Etiqueta desde={c} top={1230} size={64} color={ROJO}>Medida corta…</Etiqueta>
      <Etiqueta desde={cue('larga')} top={1320} size={64} color={ROJO}>…o larga</Etiqueta>
    </AbsoluteFill>
  );
};

/** Unos alicates de lado. */
const Alicates: React.FC = () => (
  <g transform="translate(540 760) rotate(-30)">
    <path d="M-30 0 C-60 120 -70 260 -50 380 L-10 380 C-20 260 -10 120 0 30 Z" fill="#c0392b" />
    <path d="M30 0 C60 120 70 260 50 380 L10 380 C20 260 10 120 0 30 Z" fill="#c0392b" />
    <path d="M-30 0 L-18 -170 L0 -170 L0 20 Z" fill={METAL} />
    <path d="M30 0 L18 -170 L0 -170 L0 20 Z" fill={METAL_OSC} />
    <circle cx={0} cy={10} r={18} fill={METAL_OSC} />
  </g>
);

/** 8 · «Así que no lo aprietes con unos alicates. Ese gancho suelto es lo que hace que tu metro mida bien.» */
const E8: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const a = cue('alicates');
  const s2 = cue('suelto', 2);
  const fuera = suave(frame, s2 - 10, s2, 1, 0);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs><linearGradient id="brillo" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <g opacity={fuera}>
          <Alicates />
          {frame >= a && <Trazo d="M300 520 L780 1000 M780 520 L300 1000" desde={a} dur={8} color={ROJO} w={16} />}
        </g>
        {frame >= s2 - 6 && <g opacity={1 - fuera}><Metro baila={s2} /></g>}
      </svg>
      <Etiqueta desde={cue('bien')} top={1240} size={90} color={VERDE}>✓ Mide bien</Etiqueta>
    </AbsoluteFill>
  );
};

export const ESCENAS: {desde: () => number; Componente: React.FC<{desde: number}>}[] = [
  {desde: () => 0, Componente: E1},
  {desde: () => cue('no') - 2, Componente: E2},
  {desde: () => cue('cuando', 1) - 2, Componente: E3},
  {desde: () => cue('cuando', 2) - 2, Componente: E4},
  {desde: () => cue('mueve') - 4, Componente: E5},
  {desde: () => cue('cero') - 6, Componente: E6},
  {desde: () => cue('si') - 2, Componente: E7},
  {desde: () => cue('aprietes') - 8, Componente: E8},
];
