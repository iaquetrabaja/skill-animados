// Lámina del kit: lo que ya está dibujado, con el nombre de cada función. Se renderiza a docs/kit.jpg.
import * as k from './motor';
import type {Plano} from './motor/Pelicula';

const caja = (g: k.G, x: number, y: number, w: number, h: number, nombre: string, f: () => void) => {
  g.save();
  g.beginPath();
  g.roundRect(x, y, w, h, 24);
  g.clip();
  f();
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.18)';
  g.lineWidth = 2;
  g.beginPath();
  g.roundRect(x, y, w, h, 24);
  g.stroke();
  g.font = `700 30px ${k.LETRA}`;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(0,0,0,.55)';
  g.fillRect(x, y + h - 52, w, 52);
  g.fillStyle = '#ffffff';
  g.fillText(nombre, x + 18, y + h - 16);
};

export const MUESTRARIO: Plano = {
  nombre: 'muestrario',
  desde: 0,
  dibuja(g, t) {
    g.fillStyle = '#0b0d14';
    g.fillRect(0, 0, k.W, k.H);
    const W2 = 500, H2 = 440, X = [30, 550], Y = [40, 500, 960, 1420];
    caja(g, X[0], Y[0], W2, H2, 'espacio · estrellas · esfera(tierra)', () => {
      g.translate(X[0], Y[0]);
      k.con(g, {escala: W2 / k.W}, () => {
        k.espacio(g, '#2a2060');
        k.estrellas(g, k.mira([0, 0, t], [0, 0, t + 30]), null, 1);
      });
      k.esfera(g, 250, 220, 150, k.tierra(), {giro: t * 0.4, brilloMar: true});
      k.atmosfera(g, 250, 220, 150, '#6ab8ff');
    });
    caja(g, X[1], Y[0], W2, H2, 'marte · luna · gaseoso · roca', () => {
      g.translate(X[1], Y[0]);
      g.fillStyle = '#05060c';
      g.fillRect(0, 0, W2, H2);
      k.esfera(g, 140, 150, 100, k.marte(), {giro: t * 0.3});
      k.esfera(g, 360, 140, 80, k.luna(), {giro: t * 0.2});
      k.esfera(g, 250, 320, 70, k.gaseoso(), {giro: t * 0.5});
      k.roca(g, 420, 320, 50, 3, 0.4);
    });
    caja(g, X[0], Y[1], W2, H2, 'cielo · sol · nubes · colinas · persona', () => {
      g.translate(X[0], Y[1]);
      k.con(g, {escala: W2 / k.W}, () => {
        g.translate(0, -760);
        k.cielo(g, 0.25, 1400);
        k.sol(g, 760, 900, 80, '#ffe2b0', 1, t);
        k.nubes(g, t, 700, 320, 0.4, '#ffe0c8', 0.8, 5);
        k.colinas(g, 1400, '#2a2a22', '#ffb070', 4);
        k.persona(g, 520, 1500, 360, '#06080c', 'senala', '#ffb070');
      });
    });
    caja(g, X[1], Y[1], W2, H2, 'cielo(marte) · brillo · destello', () => {
      g.translate(X[1], Y[1]);
      k.con(g, {escala: W2 / k.W}, () => {
        g.translate(0, -640);
        k.cielo(g, 0.05, 1300, 'marte');
        k.brillo(g, 540, 1240, 700, '#6fa8ff', 0.9);
        k.sol(g, 540, 1240, 40, '#f4f7ff', 0.6, t);
        k.colinas(g, 1300, '#3a2018', '#7a8fc0', 12);
      });
    });
    caja(g, X[0], Y[2], W2, H2, 'prisma · haz · ESPECTRO', () => {
      g.translate(X[0], Y[2]);
      g.fillStyle = '#05060c';
      g.fillRect(0, 0, W2, H2);
      const p = k.prisma(g, 220, 230, 200, 0, 0);
      k.haz(g, -10, 160, p.entrada[0], p.entrada[1], '#ffffff', 16);
      k.ESPECTRO.forEach((c, i) => k.haz(g, p.salida[0], p.salida[1], 520, 200 + i * 28, c, 12));
      k.prisma(g, 220, 230, 200, 0, 1);
    });
    caja(g, X[1], Y[2], W2, H2, 'nube3D · bola · chispas', () => {
      g.translate(X[1], Y[2]);
      g.fillStyle = '#0a1a3a';
      g.fillRect(0, 0, W2, H2);
      k.con(g, {escala: W2 / k.W}, () => k.nube3D(g, k.mira([0, 0, t * 4], [0, 0, t * 4 + 30]), 7, 260, [[-12, -20, 2], [12, 20, 60]], 0.35, '#9cc7ff', {t, mueve: 0.4}));
      k.bola(g, 250, 220, 60, '#ffb347');
      k.chispas(g, 0.25 + (t % 1) * 0.6, 0.2, 250, 220, '#ffd36b', 22, 300, 2);
    });
    caja(g, X[0], Y[3], W2, H2, 'grafico · pastilla · cifra', () => {
      g.translate(X[0], Y[3]);
      g.fillStyle = '#071510';
      g.fillRect(0, 0, W2, H2);
      k.grafico(g, 40, 150, 420, 200, [10, 14, 12, 18, 16, 25, 22, 31, 40], 0.4 + 0.6 * ((t * 0.4) % 1));
      k.cifra(g, 250, 70, 0, 483, 1, {tam: 80, prefijo: '$', color: '#4ade80'});
      k.pastilla(g, 250, 160, '+2.700 %', 1, {color: '#4ade80', tam: 30});
    });
    caja(g, X[1], Y[3], W2, H2, 'movil · fogonazo · vineta · grano', () => {
      g.translate(X[1], Y[3]);
      const gr = g.createLinearGradient(0, 0, W2, H2);
      gr.addColorStop(0, '#1b1030');
      gr.addColorStop(1, '#3a1450');
      g.fillStyle = gr;
      g.fillRect(0, 0, W2, H2);
      k.brillo(g, 250, 200, 260, '#bf5af2', 0.6);
      k.movil(g, 250, 200, 340, (w, h) => {
        g.fillStyle = '#10131c';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#2b6cff';
        g.beginPath();
        g.roundRect(w * 0.3, 40, w * 0.62, 50, 18);
        g.fill();
        g.fillStyle = '#2a2f3c';
        g.beginPath();
        g.roundRect(w * 0.08, 110, w * 0.7, 80, 18);
        g.fill();
      }, -0.08);
    });
  },
};
