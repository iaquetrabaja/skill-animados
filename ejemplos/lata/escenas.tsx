import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {cue} from './cues';

export const ACENTO = '#ffc83d';
export const CLAVES = ['lata', 'hundido', 'presion', 'plano', 'abombaria', 'cupula', 'aluminio'];

const ROJO = '#ff5a5a';
const VERDE = '#4ade80';
const AZUL = '#7fe0ff';
const LATA = '#d8dde3';
const LATA_OSC = '#8d96a0';
const ROJA = '#c8323a';

const useEntra = (desde: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - desde, fps, config: {damping}});
};

const Etiqueta: React.FC<{children: React.ReactNode; desde: number; top: number; size?: number; color?: string}> = ({children, desde, top, size = 60, color = '#f2f2f2'}) => {
  const e = useEntra(desde);
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontSize: size, fontWeight: 800, color,
      opacity: e, transform: `translateY(${(1 - e) * 30}px)`, letterSpacing: -1}}>{children}</div>
  );
};

/** Lata de lado, en corte. `fondo`: 1 = cúpula hacia dentro, 0 = plano, -1 = abombado hacia fuera. */
const Lata: React.FC<{x: number; y: number; s?: number; fondo: number; corte?: boolean; colorFondo?: string}> = ({x, y, s = 1, fondo, corte, colorFondo = LATA_OSC}) => {
  const h = 70 * fondo; // cuánto sube (o baja) el centro del fondo
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-150 -330 L-120 -380 L120 -380 L150 -330 L150 300 L-150 300 Z" fill={corte ? 'rgba(216,221,227,.12)' : ROJA} stroke={LATA} strokeWidth={8} />
      {!corte && <rect x={-150} y={-120} width={300} height={140} fill="#f2f2f2" opacity={0.9} />}
      <rect x={-120} y={-392} width={240} height={16} rx={6} fill={LATA} />
      <path d={`M-150 300 Q0 ${300 - 2 * h} 150 300`} fill="none" stroke={colorFondo} strokeWidth={12} />
    </g>
  );
};

/** 1 · «¿Por qué el fondo de una lata está hundido hacia dentro?» */
const E1: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const h = cue('hundido');
  const gira = interpolate(frame, [cue('fondo') - 4, cue('fondo') + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <g transform={`translate(540 860) rotate(${180 * gira}) translate(-540 -860)`}>
          <Lata x={540} y={860} s={1.4} fondo={1} colorFondo={frame >= h ? ACENTO : LATA_OSC} />
        </g>
      </svg>
      <Etiqueta desde={0} top={200} size={72}>¿Por qué está hundido?</Etiqueta>
    </AbsoluteFill>
  );
};

/** 2 · «Porque dentro hay mucha presión.» */
const E2: React.FC<{desde: number}> = ({desde}) => {
  const frame = useCurrentFrame();
  const p = cue('presion');
  const empuja = 1 + 0.12 * Math.sin(Math.max(0, frame - p) / 3);
  const flechas = [[0, -1], [0, 1], [-1, 0], [1, 0], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <Lata x={540} y={900} s={1.4} fondo={1} corte />
        {frame >= p - 2 && flechas.map(([dx, dy], i) => (
          <g key={i} transform={`translate(${540 + dx * 60} ${880 + dy * 120}) scale(${empuja * 1.4})`}>
            <path d={`M0 0 L${dx * 90} ${dy * 120}`} stroke={AZUL} strokeWidth={10} strokeLinecap="round" />
            <circle cx={dx * 90} cy={dy * 120} r={12} fill={AZUL} />
          </g>
        ))}
        {[...Array(14)].map((_, i) => (
          <circle key={'b' + i} cx={440 + ((i * 53) % 200)} cy={1150 - (((frame - desde) * 4 + i * 70) % 600)} r={6 + (i % 3) * 3} fill="none" stroke="#c9eaff" strokeWidth={3} opacity={0.5} />
        ))}
      </svg>
      <Etiqueta desde={p} top={200} size={76} color={AZUL}>Mucha presión dentro</Etiqueta>
    </AbsoluteFill>
  );
};

/** 3 · «Un fondo plano se abombaría, y esa cúpula aguanta mucho más.» */
const E3: React.FC<{desde: number}> = () => {
  const frame = useCurrentFrame();
  const ab = cue('abombaria');
  const c = cue('cupula');
  const sale = interpolate(frame, [ab, ab + 14], [0, -1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <Lata x={280} y={900} s={0.95} fondo={sale} corte colorFondo={frame >= ab ? ROJO : LATA_OSC} />
        {frame >= c - 2 && <Lata x={800} y={900} s={0.95} fondo={1} corte colorFondo={VERDE} />}
      </svg>
      <Etiqueta desde={cue('plano') - 4} top={300} size={60}>
        <span style={{position: 'absolute', left: 120, width: 340, color: frame >= ab ? ROJO : '#f2f2f2'}}>Plano</span>
      </Etiqueta>
      <Etiqueta desde={ab} top={1250} size={52} color={ROJO}><span style={{position: 'absolute', left: 90, width: 400}}>se abomba ✕</span></Etiqueta>
      <Etiqueta desde={c} top={300} size={60} color={VERDE}><span style={{position: 'absolute', left: 620, width: 340}}>Cúpula</span></Etiqueta>
      <Etiqueta desde={cue('aguanta')} top={1250} size={52} color={VERDE}><span style={{position: 'absolute', left: 590, width: 400}}>aguanta ✓</span></Etiqueta>
    </AbsoluteFill>
  );
};

/** 4 · «Así gastan menos aluminio.» */
const E4: React.FC<{desde: number}> = ({desde}) => {
  const frame = useCurrentFrame();
  const fino = interpolate(frame, [desde, desde + 20], [16, 5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <g transform="translate(540 900) scale(1.4)">
          <path d="M-150 -330 L-120 -380 L120 -380 L150 -330 L150 300 L-150 300 Z" fill={ROJA} stroke={LATA} strokeWidth={fino} />
          <rect x={-150} y={-120} width={300} height={140} fill="#f2f2f2" opacity={0.9} />
          <path d="M-150 300 Q0 160 150 300" fill="none" stroke={ACENTO} strokeWidth={12} />
        </g>
      </svg>
      <Etiqueta desde={cue('aluminio') - 4} top={220} size={80} color={ACENTO}>Menos aluminio</Etiqueta>
      <Etiqueta desde={cue('aluminio') + 6} top={1400} size={52}>paredes finísimas</Etiqueta>
    </AbsoluteFill>
  );
};

export const ESCENAS: {desde: () => number; Componente: React.FC<{desde: number}>}[] = [
  {desde: () => 0, Componente: E1},
  {desde: () => cue('porque') - 2, Componente: E2},
  {desde: () => cue('un') - 2, Componente: E3},
  {desde: () => cue('asi') - 2, Componente: E4},
];
