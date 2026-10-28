// Monta un vídeo: un lienzo que dibuja el plano de cada momento, los subtítulos y el audio.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {G, W, H} from './base';
import {Voz} from './voz';
import {Subtitulos, EstiloSubtitulos, cargarFuente} from './Subtitulos';
import {grano, vineta} from './luz';

export type Plano = {
  /** Nombre corto, para los avisos y la revisión. */
  nombre: string;
  /** Segundo en que empieza. El primero, 0. La imagen entra dos fotogramas antes que su palabra. */
  desde: number;
  /** 'corte' (otro sitio, lo normal) o 'fundido' (rara vez). */
  entrada?: 'corte' | 'fundido';
  /** Dibuja el segundo `t` del vídeo (no del plano). El lienzo llega limpio, en negro. */
  dibuja: (g: G, t: number) => void;
};

export type Acabado = {grano?: number; vineta?: number};

/** Comprueba el orden de los planos y su duración mínima. Lanza error si algo no cuadra: así no se renderiza un fallo. */
export function comprobarPlanos(planos: Plano[], duracion: number) {
  if (!planos.length || planos[0].desde !== 0) throw new Error('El primer plano tiene que empezar en 0');
  planos.forEach((p, i) => {
    const hasta = planos[i + 1]?.desde ?? duracion;
    if (!Number.isFinite(p.desde)) throw new Error(`El plano «${p.nombre}» no tiene un inicio válido`);
    if (hasta - p.desde < 1.2) throw new Error(`El plano «${p.nombre}» dura ${(hasta - p.desde).toFixed(2)} s: un plano necesita al menos 1,2 s`);
  });
}

const FUNDIDO = 0.35;

export const Pelicula: React.FC<{planos: Plano[]; voz: Voz; audio: string; subtitulos?: EstiloSubtitulos; claves?: string[]; acabado?: Acabado; duracion: number}> =
({planos, voz, audio, subtitulos = 'frase', claves = [], acabado = {}, duracion}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const t = frame / fps;
  comprobarPlanos(planos, duracion);
  // El lienzo también escribe con la fuente: se vuelve a dibujar cuando ha cargado.
  const [fuente, setFuente] = useState(false);
  const [espera] = useState(() => delayRender('Fuente del lienzo'));
  useEffect(() => {
    cargarFuente().finally(() => {
      setFuente(true);
      continueRender(espera);
    });
  }, [espera]);

  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    const entra = (p: Plano) => p.desde - (p.desde > 0 ? 2 / fps : 0);
    let i = 0;
    for (let k = 0; k < planos.length; k++) if (t >= entra(planos[k])) i = k;
    const p = planos[i];
    if (p.entrada === 'fundido' && i > 0 && t < entra(p) + FUNDIDO) {
      g.save();
      planos[i - 1].dibuja(g, t);
      g.restore();
      g.save();
      g.globalAlpha = (t - entra(p)) / FUNDIDO;
      // Lo nuevo se pinta en un lienzo aparte para que aparezca entero, no capa a capa.
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const cg = c.getContext('2d')!;
      cg.fillStyle = '#000';
      cg.fillRect(0, 0, W, H);
      p.dibuja(cg, t);
      g.drawImage(c, 0, 0);
      g.restore();
    } else {
      g.save();
      p.dibuja(g, t);
      g.restore();
    }
    if (acabado.vineta !== 0) vineta(g, acabado.vineta ?? 0.45);
    if (acabado.grano !== 0) grano(g, t, acabado.grano ?? 0.05);
  }, [t, planos, fps, acabado, fuente]);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <canvas ref={ref} width={W} height={H} style={{width: '100%', height: '100%'}} />
      <Subtitulos voz={voz} t={t} estilo={subtitulos} claves={claves} />
      <Audio src={audio} />
    </AbsoluteFill>
  );
};
