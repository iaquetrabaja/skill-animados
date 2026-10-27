import React, {useId} from 'react';

/** Funciones puras: el mismo fotograma siempre produce el mismo dibujo. */
export const progreso = (f: number, desde: number, duracion: number) => Math.max(0, Math.min(1, (f - desde) / Math.max(1, duracion)));
export const suave = (p: number) => p * p * (3 - 2 * p);
export const arco = (p: number, a: [number, number], b: [number, number], altura = 120): [number, number] =>
  [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p - Math.sin(p * Math.PI) * altura];

/** Volumen sencillo: material con iluminación y sombra de contacto. */
export const Bloque: React.FC<{x: number; y: number; w: number; h: number; color?: string; children?: React.ReactNode}> =
({x, y, w, h, color = '#73dbfa', children}) => {
  const id = useId().replace(/:/g, '');
  return <g transform={`translate(${x} ${y})`}>
    <defs><linearGradient id={id} x2="0.8" y2="1"><stop stopColor="#fff" stopOpacity=".75"/><stop offset=".25" stopColor={color}/><stop offset="1" stopColor="#15263e"/></linearGradient></defs>
    <ellipse cx={w / 2 + 12} cy={h + 25} rx={w * .56} ry={20} fill="#000" opacity=".28"/>
    <path d={`M0 0L18 -16H${w + 18}V${h - 16}L${w} ${h}Z`} fill={color} opacity=".55"/>
    <rect width={w} height={h} rx="18" fill={`url(#${id})`} stroke="#ffffff44" strokeWidth="2"/>
    {children}
  </g>;
};

/** Explosión gráfica finita, sin aleatoriedad. */
export const Estallido: React.FC<{frame: number; desde: number; x: number; y: number; color?: string}> =
({frame, desde, x, y, color = '#ffd56a'}) => {
  const p = progreso(frame, desde, 24);
  if (frame < desde || p >= 1) return null;
  return <g transform={`translate(${x} ${y})`} opacity={1 - p}>
    <circle r={20 + p * 260} fill="none" stroke={color} strokeWidth={18 * (1 - p)}/>
    {Array.from({length: 14}, (_, i) => {
      const ang = i * Math.PI * 2 / 14;
      return <g key={i} transform={`translate(${Math.cos(ang) * p * 330} ${Math.sin(ang) * p * 330 + p * p * 100}) rotate(${i * 45 + p * 120})`}><rect width="15" height="32" rx="4" fill={i % 2 ? color : '#ff777e'}/></g>;
    })}
  </g>;
};

export const Sobre: React.FC<{x: number; y: number; escala?: number; color?: string}> = ({x, y, escala = 1, color = '#ffd56a'}) =>
  <g transform={`translate(${x} ${y}) scale(${escala})`}><rect x="-62" y="-40" width="124" height="80" rx="12" fill={color} stroke="#ffffff88" strokeWidth="2"/><path d="M-56 -33L0 10L56 -33M-56 33L-20 0M56 33L20 0" stroke="#61451c" strokeWidth="4" fill="none"/></g>;
