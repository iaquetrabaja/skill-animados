# Revisar en movimiento

Es lo que más cuenta. La demo necesitó varias rondas de mirar y arreglar; el primer intento nunca es el bueno.

## Cada vez que cambies algo, míralo

Desde `plantilla/`:

```
npx remotion still src/index.ts Video ../salida/f.png --frame=245      un fotograma (segundo × 30)
npx remotion render src/index.ts Video ../salida/tramo.mp4 --frames=180-300 --scale=0.5   un tramo, rápido
npx remotion studio                                                    el editor, para moverte por el vídeo
python ../herramientas/revisa.py ../salida/video.mp4                  hoja con un fotograma cada medio segundo
```

Abre siempre la imagen o el vídeo que sale. Lo que no has mirado no está revisado.

## La medida de movimiento

`python herramientas/movimiento.py salida/video.mp4` (lo hace solo `animados.py render`). No pasa si:
- más del 30 % de los fotogramas están casi quietos;
- el primer segundo está casi quieto;
- hay 1,5 s seguidos sin cambios.

Es una medida, no una nota: un vídeo puede pasarla y seguir siendo malo. Pero uno que no la pasa es una diapositiva.

## Lo que hay que buscar, porque ya ha fallado

- Un material que no parece lo que es (una textura pixelada, un planeta con una mancha blanca, rocas que parecen bolas).
- Algo que salta de un fotograma al siguiente al empezar o acabar un movimiento, o en un corte.
- Algo importante cortado por el borde o tapado por el subtítulo.
- Más de un segundo seguido en que no cambia nada, salvo el respiro de lo que remata.
- Una escena gris o plana, como una pared.
- Un brillo, latido o caída que sigue cuando cambia el plano.
- El subtítulo sobre un fondo muy claro: pon un velo oscuro suave detrás o cambia el fondo.
- Texto que dura menos de medio segundo o que no se lee en un móvil.
- Lo que la voz nombra y no se ve (o se ve antes de que lo diga).

## Una pasada como quien pasa de largo

¿En qué segundo me iría? Ahí falta algo que pase con la voz. Antes de enseñarlo entero:
- ¿El final enlaza con el principio?
- ¿Hay un segundo «¡hala!» a mitad, cuando la gente empieza a irse?
- ¿Alguna parte parece una clase (una cosa partida en dos con rótulos, un esquema)? Que pasen cosas en su lugar.
- ¿Lo que se dice se comprueba en la imagen?

## El sonido

Escucha la voz entera: una transcripción no prueba pronunciación ni naturalidad. Si añades efectos o música (`herramientas/audio.py`, `herramientas/sonidos.py`), cada sonido va en lo que se mueve y nunca tapa la voz.
