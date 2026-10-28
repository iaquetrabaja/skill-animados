# Cómo se dibuja

Todo se dibuja en código, en un lienzo de 1080 × 1920, fotograma a fotograma. Sin metraje ni plantillas de diapositivas: el mundo de cada vídeo se construye para él. Mira antes la lámina `docs/kit.jpg` y la demo `plantilla/src/demo/cielo.ts`.

## Un vídeo por dentro

```
plantilla/public/voz.wav       la voz
plantilla/public/cues.json     el segundo de cada palabra (palabras.py)
plantilla/src/video/planos.ts  tus planos, las claves de los subtítulos y la duración
plantilla/src/motor/           el kit: no hace falta tocarlo para un vídeo
```

Un plano:

```ts
import * as k from '../motor';
import type {Plano} from '../motor/Pelicula';
import datos from '../../public/cues.json';

export const voz = k.crearVoz(datos);
const f = (n: number) => voz.frase(n);
const Tsodio = f(4).t('sodio'); // una palabra dentro de su frase: más seguro que en toda la voz

const estrella: Plano = {
  nombre: 'estrella',
  desde: f(4).inicio,          // el primero, 0; la imagen entra dos fotogramas antes que la palabra
  dibuja(g, t) {               // t = segundo del vídeo, no del plano
    const cam = k.mira([0, 0, -20 + t], [0, 0, 0]);
    k.espacio(g);
    k.estrellas(g, cam);
    const enciende = k.suave(k.tramo(t, Tsodio - 0.1, Tsodio + 0.3));
    k.brillo(g, 540, 1000, 500, '#ff9a2e', enciende);
  },
};
export const PLANOS = [estrella /* , ... */];
export const CLAVES = ['sodio'];  // palabras que se marcan en color en el subtítulo
```

`voz.t('palabra', 2)` (la segunda vez que se dice), `voz.fin('palabra')`, `voz.frase(n)` con `inicio`, `fin`, `palabras` y su `t()`. Sin tildes ni signos: «¿Qué» es `'que'`. Si una palabra no está en la voz, el render se para y dice cuál.

## Reglas que no se rompen

- Todo sale de `t`. Nada se guarda de un fotograma al siguiente.
- Azar con semilla: `k.azar(7)`. Nunca `Math.random`.
- Lo pesado (texturas, listas de partículas), una vez: `k.una('clave', () => ...)`. Un fotograma tiene que dibujarse en menos de 0,1 s.
- Lo que cambia `g` (transparencias, modos, giros) va dentro de `k.con(g, {...}, () => ...)`, que lo deja todo como estaba.

## La pantalla

- **Subtítulos:** van arriba, entre y = 330 y 490 (estilo `frase`), o abajo, hacia y = 1180 (estilo `gigante`). Ahí no va nada importante.
- **Lo que tapan las apps:** por encima de y = 270, por debajo de y = 1560 y la columna de botones de la derecha (x > 950 desde y = 1050). Lo importante va dentro.
- **Grande:** la cosa principal ocupa media pantalla o más.

## La cámara

El mundo es 3D aunque se dibuje en 2D: cada cosa tiene su sitio `[x, y, z]`.

- `k.mira(pos, objetivo, focal)` crea una cámara; `k.proyecta(cam, [x, y, z])` da `{x, y, s}` en pantalla (`s` pasa un radio del mundo a píxeles).
- `k.ruta(t, [[t0, {pos, mira}], [t1, {pos, mira, f}]])`: una cámara que pasa por esas claves sin tirones. Pon las claves en palabras.
- `k.orbita(ángulo, distancia, altura)` para girar alrededor de algo; `k.deLejosACerca(cosas)` para dibujar en orden.
- Estelas de estrellas: pasa la cámara de un instante antes a `k.estrellas(g, cam, camAntes)`.
- La cámara solo se mueve cuando la voz lo pide: entra a ver lo que se nombra, se aleja para ver el conjunto, gira, baja con lo que cae. Nunca deriva sola ni tiembla.

## El tiempo del movimiento

- `k.tramo(t, a, b)` va de 0 a 1 entre a y b. `k.suave` arranca y frena. `k.entra` llega rápido y frena largo (lo que entra). `k.sale` arranca despacio (lo que se va). `k.rebote` se pasa un poco y vuelve. `k.pulso(t, t0, ancho)` es un latido. `k.claves(t, [[t, valor], ...])` pasa por varios valores.
- Cada movimiento empieza y acaba en una palabra. Un golpe, rápido y en su palabra; lo que se construye mientras se explica, toda la explicación.
- **La cosa grande hace algo durante toda la frase:** gira, crece, cae, se apaga. Una imagen que aparece y se queda quieta es una diapositiva.

## Luz y volumen: lo que hace que no parezca un esquema

- Un fondo con profundidad, nunca un color plano: `k.espacio` + `k.estrellas`, `k.cielo` + `k.nubes` + `k.colinas`, o un degradado con el brillo de lo que lo ilumina.
- Cada objeto lleva un degradado según la luz, su lado de sombra y un brillo o borde de luz. Las esferas del kit (`k.esfera`) ya tienen textura, giro, sombra y oscurecido del borde.
- La luz se suma: `k.brillo`, `k.haz`, `k.destello`, `k.fogonazo` usan el modo `lighter`.
- Lo invisible va en un color que no se usa para nada más (en la demo, el azul es la luz que rebota).
- Para que algo complejo aparezca o se vaya entero, píntalo en un lienzo aparte (`k.lienzo`) y ponlo con transparencia; si no, cada capa se transparenta por su cuenta.
- La viñeta y el grano los pone el motor. Puedes quitarlos o cambiarlos con `acabado`.

## Las piezas que ya están

| Lámina | Funciones |
|---|---|
| Espacio | `espacio`, `estrellas`, `esfera` + `tierra()` / `marte()` / `luna()` / `gaseoso()` / `estrellaSup()`, `atmosfera`, `roca`, `sol` |
| Cielo y suelo | `cielo(g, alturaSol, horizonte, 'tierra' \| 'marte')`, `sol`, `nubes`, `colinas`, `persona` (`pie`, `mira-arriba`, `senala`) |
| Luz | `brillo`, `haz`, `destello`, `fogonazo`, `vineta`, `grano` |
| Partículas | `nube3D` (moléculas, polvo, células en 3D), `bola`, `chispas` |
| Objetos | `prisma` + `ESPECTRO`, `movil` (dibujas su pantalla), `grafico` (cotización que se dibuja) |
| Cifras | `pastilla` (una etiqueta corta), `cifra` (un número enorme que corre) |
| Utilidades | `azar`, `ruido`, `gama`, `mezColor`, `rgba`, `lienzo`, `una`, `con` |

Cada función explica sus opciones en el comentario de encima, en `plantilla/src/motor/`. Son un punto de partida: se combinan, se les da el color del vídeo y se mueven con la voz.

## Cuando el kit no tiene lo que necesitas

Casi siempre pasará. Dibújalo así:
1. **La forma** con caminos (`beginPath`, `quadraticCurveTo`, `roundRect`) y sus proporciones de verdad. Busca una foto para saber cómo es.
2. **La luz:** degradado por el lado de la luz, sombra al otro y un reflejo.
3. **La textura**, para que no sea plano (`k.ruido`).
4. **Míralo a tamaño completo** (`npx remotion still src/index.ts Video salida.png --frame=N`) antes de moverlo. Si parece un icono, un emoji o un juguete, redibújalo.

Si sirve para otros vídeos, llévalo al kit con su comentario y añádelo a la lámina (`src/muestrario.ts`).
