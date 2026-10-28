# Sitios, planos y cortes

## Las palabras

- **Sitio:** el lugar donde está la cosa de la que habla la voz (el espacio con la Tierra, el aire por dentro, una cocina). Una cosa nueva, un sitio nuevo.
- **Plano:** un sitio con una cámara. Dentro de un plano no hay cortes: la cámara va de una cosa a otra con la voz. En la demo, «la Tierra crece → entramos en el aire → los rayos rebotan» es un solo plano de 11 s.
- **Corte:** el paso a otro sitio. Se hace en la palabra que trae ese sitio.

## El plan (`plan.md`)

Una fila por frase:

| Frase | Lo que se ve de la primera palabra a la última | Palabra fuerte | Cámara | Paso al siguiente |
|---|---|---|---|---|
| «Al llegar a la Tierra, choca con las moléculas del aire.» | La Tierra gira y crece hasta que su atmósfera llena la pantalla; aparecen las moléculas | «moléculas» | Se acerca sin parar | Sigue (mismo sitio) |

Leyendo solo la segunda columna, alguien tendría que poder contar el vídeo.

## Lo que se ve

1. **Lo que dice la frase.** Dice «choca»: algo choca. Dice «sale disparado»: sale disparado. El mecanismo aparece cuando la voz habla de él, no antes.
2. **Idea nueva, imagen nueva.** Llega algo, la cosa se transforma o se corta a otro sitio. La misma imagen durante tres ideas es una diapositiva.
3. **Escena entera y grande.** La cosa principal llena media pantalla o más. Nunca un dibujo pequeño en medio de un fondo vacío ni iconos encima de un fondo.
4. **Se entiende sin saber nada.** Se enseña lo que hace la cosa, no a qué se parece su nombre.
5. **Color y luz.** Nada gris ni apagado. Si la cosa es gris, lo de alrededor lleva el color.
6. **Sin títulos que repiten la voz.** Lo que dice la voz ya está en el subtítulo. En la imagen, solo lo que el subtítulo no dice: una cifra, una comparación (`azul ×5` / `rojo ×1`).

## Los cambios de plano

1. **Mismo sitio, sin corte:** la cámara se mueve (se acerca, se aleja, gira, baja con lo que cae). Otro momento de la misma cosa (el atardecer del mismo paisaje) tampoco es otro sitio: la cosa cambia delante de la cámara.
2. **Otro sitio, corte en su palabra** («Y en Marte…»).
3. **Antes de un corte, todo ha terminado** y la imagen reposa 0,15–0,3 s. Nada se corta a medio caer, a medio brillar ni con la cámara en marcha.
4. **Un plano dura al menos 1,5 s** (el motor no deja menos de 1,2 s) y su acción empieza y acaba dentro.
5. **Lo que la voz nombra se ve entero y casi quieto al menos medio segundo.** En una lista, cada cosa llega, frena y se queda.
6. **El primer fotograma de cada plano ya enseña lo que es.**

## El gancho

El primer segundo decide si se quedan. Escribe dos ideas de primer segundo, una línea cada una: lo que se ve del fotograma 0 al segundo 1. Si una dice «una imagen quieta», «un número que corre» o «la cámara se acerca despacio», cambia la idea antes de dibujarla.

- Si el tema es una pregunta, se ve la pregunta pasando, exagerada.
- Si lo sorprendente se puede comprobar, se comprueba ya, como una acción.
- Nada que parpadee o cambie de color a saltos: parece un fallo.

Dibuja primero el gancho, renderiza solo ese tramo (`npx remotion render src/index.ts Video ../salida/gancho.mp4 --frames=0-120`) y enséñaselo al usuario antes de dibujar el resto.

## El final

El remate da la vuelta al gancho. Si se puede, el último fotograma enlaza con el primero para que el vídeo se vea dos veces sin notarlo.
