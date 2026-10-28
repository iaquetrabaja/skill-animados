// Fondos con profundidad: el espacio, el cielo de día o al atardecer, las nubes y el suelo.
import {G, W, H, V3, azar, con, gama, lienzo, mezColor, rgba, ruido, una} from './base';
import {Camara, proyecta} from './camara';
import {brillo, destello} from './luz';

/** Fondo del espacio: negro azulado con nebulosa suave. `tono` cambia el color de la nebulosa. */
export function espacio(g: G, tono = '#3a2a6e', fuerza = 1) {
  g.fillStyle = '#04050c';
  g.fillRect(0, 0, W, H);
  const neb = una(`nebulosa-${tono}`, () => {
    const c = lienzo(270, 480);
    const cg = c.getContext('2d')!;
    const n = ruido(77);
    const img = cg.createImageData(270, 480);
    const [r, gg, b] = mezColor(tono, tono, 0);
    for (let y = 0; y < 480; y++) for (let x = 0; x < 270; x++) {
      const v = Math.pow(Math.max(0, n(x / 70, y / 70, 5) - 0.42) * 2.2, 1.6);
      const i = (y * 270 + x) * 4;
      img.data[i] = r * v; img.data[i + 1] = gg * v; img.data[i + 2] = b * v; img.data[i + 3] = 255;
    }
    cg.putImageData(img, 0, 0);
    return c;
  });
  con(g, {modo: 'lighter', alpha: fuerza}, () => g.drawImage(neb, 0, 0, W, H));
}

type Estrella = {p: V3; r: number; c: string};
const listaEstrellas = (semilla: number, n: number, radio: number) => una(`estrellas-${semilla}-${n}-${radio}`, () => {
  const r = azar(semilla);
  const colores = ['#ffffff', '#cfe0ff', '#fff1d6', '#ffd2b0', '#bcd3ff'];
  return Array.from({length: n}, (): Estrella => {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, d = radio * (0.35 + r() * 0.65);
    const s = Math.sqrt(1 - u * u);
    return {p: [Math.cos(a) * s * d, u * d, Math.sin(a) * s * d], r: 0.6 + Math.pow(r(), 6) * 3.2, c: colores[Math.floor(r() * colores.length)]};
  });
});

/** Estrellas en 3D alrededor de la cámara: al moverla, se mueven con paralaje. Con `antes` (la cámara de un instante antes) dejan estela. */
export function estrellas(g: G, cam: Camara, antes: Camara | null = null, semilla = 1, n = 1400, radio = 400) {
  const lista = listaEstrellas(semilla, n, radio);
  con(g, {modo: 'lighter'}, () => {
    for (const e of lista) {
      const p: V3 = [e.p[0] + cam.pos[0], e.p[1] + cam.pos[1], e.p[2] + cam.pos[2]];
      const q = proyecta(cam, p);
      if (!q || q.x < -20 || q.x > W + 20 || q.y < -20 || q.y > H + 20) continue;
      const tam = Math.min(5, e.r * (1400 / Math.max(900, cam.f)) ** -0.3);
      g.fillStyle = rgba(e.c, Math.min(1, 0.35 + e.r * 0.3));
      if (antes) {
        const pa: V3 = [e.p[0] + antes.pos[0], e.p[1] + antes.pos[1], e.p[2] + antes.pos[2]];
        const qa = proyecta(antes, pa);
        if (qa && Math.hypot(qa.x - q.x, qa.y - q.y) > 2) {
          g.strokeStyle = g.fillStyle;
          g.lineWidth = tam;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(qa.x, qa.y);
          g.lineTo(q.x, q.y);
          g.stroke();
          continue;
        }
      }
      g.beginPath();
      g.arc(q.x, q.y, tam, 0, Math.PI * 2);
      g.fill();
      if (e.r > 2.4) brillo(g, q.x, q.y, e.r * 9, e.c, 0.35);
    }
  });
}

/**
 * Cielo de la Tierra según la altura del Sol: `sol` 1 = mediodía, 0 = horizonte, negativo = noche.
 * `horizonte` es la y de la línea del horizonte. `planeta: 'marte'` invierte los colores (cielo ocre, sol azulado).
 */
export function cielo(g: G, sol: number, horizonte = H * 0.72, planeta: 'tierra' | 'marte' = 'tierra') {
  const s = Math.max(-0.3, Math.min(1, sol));
  const dia = Math.max(0, Math.min(1, (s + 0.15) / 0.6));
  const gr = g.createLinearGradient(0, 0, 0, horizonte);
  if (planeta === 'marte') {
    gr.addColorStop(0, rgba(gama(dia, ['#120c10', '#6e4a36', '#a8774f'])));
    gr.addColorStop(0.7, rgba(gama(dia, ['#2a1a18', '#b07e57', '#d4a473'])));
    gr.addColorStop(1, rgba(gama(dia, ['#3b2620', '#c79567', '#e6bf8a'])));
  } else {
    const ocaso = Math.max(0, 1 - Math.abs(s - 0.02) / 0.32);
    gr.addColorStop(0, rgba(gama(dia, ['#060a1c', '#1b3a7a', '#1d5fd1'])));
    gr.addColorStop(0.55, rgba(mezColor(gama(dia, ['#0e1638', '#3f6fc2', '#4d95f0']), '#c4567a', ocaso * 0.6)));
    gr.addColorStop(0.85, rgba(mezColor('#8ec5ff', '#ff8a3c', Math.min(1, ocaso * 1.1)), 0.35 + dia * 0.65));
    gr.addColorStop(1, rgba(mezColor('#cfe7ff', '#ffb347', ocaso)));
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, W, horizonte + 2);
}

/** El Sol (o cualquier estrella vista de cerca): disco con borde suave, corona y destello. */
export function sol(g: G, x: number, y: number, radio: number, color = '#fff6dc', corona = 1, t = 0) {
  brillo(g, x, y, radio * 9, color, 0.55 * corona);
  brillo(g, x, y, radio * 3.2, color, 0.8 * corona);
  const gr = g.createRadialGradient(x, y, 0, x, y, radio);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(0.75, rgba(color));
  gr.addColorStop(1, rgba(color, 0.9));
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, radio, 0, Math.PI * 2);
  g.fill();
  destello(g, x, y, radio * 6, color, 0.5 * corona, t * 0.05);
}

/** Nubes: manchas suaves de ruido que se desplazan con `t`. `capa` 0 lejos … 1 cerca. Color según la luz (`luz` hex). */
export function nubes(g: G, t: number, y: number, alto: number, capa = 0.5, luz = '#ffffff', fuerza = 0.85, semilla = 5) {
  const spr = una(`nube-${semilla}`, () => {
    const c = lienzo(512, 160);
    const cg = c.getContext('2d')!;
    const n = ruido(semilla);
    const img = cg.createImageData(512, 160);
    for (let yy = 0; yy < 160; yy++) for (let x = 0; x < 512; x++) {
      const borde = Math.sin(Math.PI * yy / 160) * Math.min(1, Math.min(x, 512 - x) / 60);
      const v = Math.max(0, n(x / 90, yy / 45, 5) * borde * 1.9 - 0.55);
      const i = (yy * 512 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.min(255, v * 520);
    }
    cg.putImageData(img, 0, 0);
    return c;
  });
  const tinte = una(`nube-${semilla}-${luz}`, () => {
    const c = lienzo(512, 160);
    const cg = c.getContext('2d')!;
    cg.drawImage(spr, 0, 0);
    cg.globalCompositeOperation = 'source-atop';
    const gr = cg.createLinearGradient(0, 0, 0, 160);
    gr.addColorStop(0, luz);
    gr.addColorStop(1, rgba(mezColor(luz, '#55607a', 0.55)));
    cg.fillStyle = gr;
    cg.fillRect(0, 0, 512, 160);
    return c;
  });
  const ancho = W * (1.3 + capa * 1.4);
  const off = ((t * (20 + capa * 90)) % ancho + ancho) % ancho;
  con(g, {alpha: fuerza}, () => {
    for (let k = -1; k < 2; k++) g.drawImage(tinte, -off + k * ancho, y, ancho, alto);
  });
}

/** Colinas en capas hasta el horizonte. `luz` colorea el borde de las colinas (luz de cielo o de atardecer). */
export function colinas(g: G, horizonte: number, base = '#1d3b2a', luz = '#9fd0ff', semilla = 3) {
  const n = ruido(semilla);
  for (let capa = 0; capa < 3; capa++) {
    const y0 = horizonte + capa * 70;
    const col = mezColor(luz, base, 0.55 + capa * 0.2);
    g.fillStyle = rgba(col);
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) g.lineTo(x, y0 - n(x / 260 + capa * 9, capa * 3, 3) * (120 - capa * 25));
    g.lineTo(W, H);
    g.closePath();
    g.fill();
  }
  const gr = g.createLinearGradient(0, horizonte, 0, H);
  gr.addColorStop(0, rgba(base, 0));
  gr.addColorStop(1, rgba('#020405', 0.85));
  g.fillStyle = gr;
  g.fillRect(0, horizonte - 120, W, H - horizonte + 120);
}
