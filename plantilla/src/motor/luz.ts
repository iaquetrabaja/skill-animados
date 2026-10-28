// Luz que se suma: brillos, haces, destellos y el acabado final (viñeta y grano).
import {G, W, H, RGB, azar, con, lienzo, rgba, una} from './base';

/** Halo radial que ilumina lo de debajo (modo `lighter`). `fuerza` 0..1. */
export function brillo(g: G, x: number, y: number, radio: number, color: string | RGB, fuerza = 1) {
  if (fuerza <= 0 || radio <= 0) return;
  con(g, {modo: 'lighter', alpha: fuerza}, () => {
    const gr = g.createRadialGradient(x, y, 0, x, y, radio);
    gr.addColorStop(0, rgba(color, 0.9));
    gr.addColorStop(0.18, rgba(color, 0.45));
    gr.addColorStop(0.5, rgba(color, 0.12));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(x - radio, y - radio, radio * 2, radio * 2);
  });
}

/** Fogonazo: un brillo blanco que crece y se apaga. `u` 0..1 a lo largo del fogonazo. */
export function fogonazo(g: G, x: number, y: number, radio: number, u: number, color = '#ffffff') {
  if (u <= 0 || u >= 1) return;
  const a = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85;
  brillo(g, x, y, radio * (0.4 + u * 0.8), color, a);
}

/** Haz de luz de (x1,y1) a (x2,y2), con núcleo brillante y halo. `largo` 0..1 recorta el haz desde su origen. */
export function haz(g: G, x1: number, y1: number, x2: number, y2: number, color: string | RGB, ancho = 30, largo = 1, fuerza = 1) {
  if (largo <= 0 || fuerza <= 0) return;
  const x = x1 + (x2 - x1) * largo, y = y1 + (y2 - y1) * largo;
  con(g, {modo: 'lighter', alpha: fuerza}, () => {
    g.lineCap = 'round';
    for (const [w, a] of [[ancho * 3.2, 0.08], [ancho * 1.6, 0.18], [ancho, 0.35], [ancho * 0.35, 0.9]] as const) {
      g.strokeStyle = rgba(color, a);
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x, y);
      g.stroke();
    }
    g.strokeStyle = rgba('#ffffff', 0.55);
    g.lineWidth = ancho * 0.12;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x, y);
    g.stroke();
  });
}

/** Destello de estrella (cuatro puntas finas), para un sol o un reflejo fuerte. */
export function destello(g: G, x: number, y: number, tam: number, color: string | RGB = '#ffffff', fuerza = 1, giro = 0) {
  if (fuerza <= 0) return;
  con(g, {modo: 'lighter', alpha: fuerza, x, y, giro}, () => {
    for (let i = 0; i < 2; i++) {
      g.rotate(Math.PI / 2 * i);
      const gr = g.createLinearGradient(-tam, 0, tam, 0);
      gr.addColorStop(0, rgba(color, 0));
      gr.addColorStop(0.5, rgba(color, 0.8));
      gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.ellipse(0, 0, tam, tam * 0.025 + 1.5, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
  brillo(g, x, y, tam * 0.35, color, fuerza * 0.8);
}

/** Viñeta: oscurece los bordes para llevar la vista al centro. */
export function vineta(g: G, fuerza = 0.55, color = '#000000') {
  const gr = g.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.48, H * 0.75);
  gr.addColorStop(0, rgba(color, 0));
  gr.addColorStop(1, rgba(color, fuerza));
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
}

/** Grano de película. Cambia cada fotograma (con semilla del fotograma), así nunca parece una imagen quieta. */
export function grano(g: G, t: number, fuerza = 0.06) {
  const variantes = una('grano', () => Array.from({length: 6}, (_, k) => {
    const c = lienzo(360, 640);
    const cg = c.getContext('2d')!;
    const img = cg.createImageData(360, 640);
    const r = azar(900 + k);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    cg.putImageData(img, 0, 0);
    return c;
  }));
  con(g, {modo: 'overlay', alpha: fuerza}, () => {
    g.imageSmoothingEnabled = false;
    g.drawImage(variantes[Math.floor(t * 24) % variantes.length], 0, 0, W, H);
  });
}
