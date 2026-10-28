// Subtítulos palabra a palabra, encima del lienzo. Tres estilos; ninguno lleva cajas fijas ni repite un título.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Voz, Palabra, limpia} from './voz';

export type EstiloSubtitulos = 'frase' | 'gigante' | 'resalte' | 'ninguno';

const FUENTE = 'Onest';
let cargada: Promise<void> | null = null;
export const cargarFuente = () => {
  if (!cargada) {
    const f = new FontFace(FUENTE, `url(${staticFile('letra/Onest.ttf')})`, {weight: '100 900'});
    cargada = f.load().then((x) => void document.fonts.add(x));
  }
  return cargada;
};

/** Agrupa palabras en golpes cortos que se leen de un vistazo: corta en la puntuación o al llegar al máximo. */
export function grupos(palabras: Palabra[], maxPalabras: number, maxLetras: number) {
  const out: Palabra[][] = [];
  let actual: Palabra[] = [];
  let letras = 0;
  palabras.forEach((p, i) => {
    if (actual.length && (actual.length >= maxPalabras || letras + p.texto.length > maxLetras)) {
      out.push(actual);
      actual = [];
      letras = 0;
    }
    actual.push(p);
    letras += p.texto.length + 1;
    const pausa = palabras[i + 1] ? palabras[i + 1].t - p.f > 0.35 : true;
    if (/[.,;:?!…]$/.test(p.texto) || pausa) {
      out.push(actual);
      actual = [];
      letras = 0;
    }
  });
  if (actual.length) out.push(actual);
  return out;
}

const SOMBRA = '0 3px 0 rgba(0,0,0,.45), 0 0 30px rgba(0,0,0,.85), 0 0 8px rgba(0,0,0,.95), 0 0 2px rgba(0,0,0,1)';

export const Subtitulos: React.FC<{voz: Voz; t: number; estilo: EstiloSubtitulos; claves: string[]; acento?: string}> = ({voz, t, estilo, claves, acento = '#ffd84d'}) => {
  const [espera] = useState(() => delayRender('Fuente de los subtítulos'));
  useEffect(() => {
    cargarFuente().then(() => continueRender(espera)).catch(() => continueRender(espera));
  }, [espera]);
  if (estilo === 'ninguno') return null;
  const gigante = estilo === 'gigante';
  const lista = grupos(voz.palabras, gigante ? 2 : 5, gigante ? 14 : 26);
  const k = lista.findIndex((gr, i) => t >= gr[0].t - 0.08 && t < (lista[i + 1]?.[0].t ?? gr[gr.length - 1].f + 0.7) - 0.08);
  if (k < 0) return null;
  const gr = lista[k];
  const desde = t - (gr[0].t - 0.08);
  const pop = Math.min(1, desde / 0.12);
  const clave = new Set(claves.map(limpia));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{
        position: 'absolute', left: 70, right: 70, top: gigante ? 1180 : 330, minHeight: 160,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: '0 22px',
        fontFamily: `${FUENTE}, Arial, sans-serif`, fontWeight: 800, fontSize: gigante ? 128 : 74, lineHeight: 1.12,
        letterSpacing: gigante ? -2 : -0.5, textAlign: 'center',
        transform: `scale(${0.94 + 0.06 * pop})`, opacity: pop,
      }}>
        {gr.map((p, i) => {
          const dicha = t >= p.t - 0.06;
          const ahora = dicha && t < p.f + 0.05;
          const esClave = clave.has(p.w);
          const color = esClave && dicha ? acento : '#ffffff';
          const resalte = estilo === 'resalte' && ahora;
          return (
            <span key={`${p.t}-${i}`} style={{
              color: resalte ? '#0b0d14' : color, opacity: dicha ? 1 : 0.6, textShadow: resalte ? 'none' : SOMBRA,
              background: resalte ? acento : 'transparent', borderRadius: 14, padding: resalte ? '0 12px' : 0, margin: resalte ? '0 -12px' : 0,
              textTransform: gigante ? 'uppercase' : 'none',
            }}>{p.texto}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
