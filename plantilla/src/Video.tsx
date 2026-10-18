import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {PALABRAS, FPS} from './cues';
import {ESCENAS, CLAVES, ACENTO} from './escenas';

const {fontFamily} = loadFont('normal', {weights: ['500', '800'], subsets: ['latin']});

/** Fondo oscuro con rejilla suave. */
const Fondo: React.FC = () => (
  <AbsoluteFill style={{background: '#0c0c0e'}}>
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(60% 45% at 50% 42%, rgba(255,255,255,.06), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Subtítulos de 2-4 palabras; la palabra clave en el color de acento. */
const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const grupos: {palabras: typeof PALABRAS; ini: number; fin: number}[] = [];
  let actual: typeof PALABRAS = [];
  PALABRAS.forEach((p, i) => {
    actual.push(p);
    const corte = actual.length >= 3 || /[.,;:?!]$/.test(p.texto) || i === PALABRAS.length - 1;
    if (corte) {
      grupos.push({palabras: actual, ini: actual[0].t, fin: actual[actual.length - 1].f});
      actual = [];
    }
  });
  const g = grupos.find((x, i) => t >= x.ini - 0.05 && t < (grupos[i + 1]?.ini ?? x.fin + 0.6));
  if (!g) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1500}}>
      <div style={{fontFamily, fontWeight: 800, fontSize: 64, color: '#f2f2f2', textAlign: 'center', padding: '0 80px',
        textShadow: '0 4px 24px rgba(0,0,0,.8)', lineHeight: 1.15}}>
        {g.palabras.map((p) => (
          <span key={p.t} style={{color: CLAVES.includes(p.w) ? ACENTO : undefined, opacity: t >= p.t - 0.05 ? 1 : 0.35}}>
            {p.texto.replace(/[.,;:]$/, '')}{' '}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{voz: string}> = ({voz}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Fondo />
      {ESCENAS.map((E, i) => {
        const desde = E.desde();
        const hasta = ESCENAS[i + 1] ? ESCENAS[i + 1].desde() : 1e9;
        // La escena anterior se apaga en 6 fotogramas mientras entra la nueva: nunca hay un fotograma vacío.
        if (frame < desde - 2 || frame >= hasta + 6) return null;
        // La primera escena ya está entera en el fotograma 0 (es la miniatura).
        const entra = desde <= 0 ? 1 : spring({frame: frame - desde + 2, fps, config: {damping: 16}});
        const sale = interpolate(frame, [hasta, hasta + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        // Acercamiento lento y continuo: la imagen nunca está quieta del todo.
        const zoom = 1 + 0.06 * Math.min(1, (frame - desde) / Math.max(1, Math.min(hasta, desde + 300) - desde));
        return (
          <AbsoluteFill key={i} style={{zIndex: frame >= hasta ? 0 : 1, opacity: interpolate(entra, [0, 1], [0, 1]) * sale,
            transform: `scale(${interpolate(entra, [0, 1], [0.94, 1]) * zoom})`}}>
            <E.Componente desde={desde} />
          </AbsoluteFill>
        );
      })}
      <Subtitulos />
      <Audio src={voz} />
    </AbsoluteFill>
  );
};
