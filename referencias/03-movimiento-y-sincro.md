# Movimiento y sincronización

## La regla de la palabra

Todo arranca en una palabra de `cues.json`, nunca en un segundo escrito a mano. En la plantilla:

```tsx
const t = cue('gancho');          // fotograma en el que se dice «gancho»
const entra = spring({frame: frame - t, fps, config: {damping: 14}});
```

- El dibujo entra **2 fotogramas antes** de la palabra (`cue('gancho') - 2`). El ojo va un poco por delante del oído.
- Si la palabra sale dos veces, usa `cue('gancho', 2)` para la segunda.

## Movimientos que valen

- **Entrar:** escala de 0,85 a 1 con `spring` y opacidad de 0 a 1 en 6 fotogramas.
- **Señalar:** un recuadro o un círculo que se dibuja con `strokeDashoffset` en 10-12 fotogramas.
- **Contar:** las cifras suben con `interpolate` y redondeo, en 15-25 fotogramas.
- **Acercar:** `scale` de la escena entera de 1 a 1,6, con el punto de origen en el detalle.
- **Salir:** casi nunca hace falta: tapa con la escena siguiente.

## Lo que no

- Nada de rebotes exagerados, giros por girar ni transiciones de PowerPoint.
- Nunca dos cosas entrando a la vez en lados opuestos de la pantalla.
- Sin parpadeos: si algo tiene que llamar la atención, que cambie de color, no que parpadee más de dos veces.

## Zona segura

En vertical, deja libres los 200 px de abajo (subtítulos y botones de la app) y los 150 de arriba. Lo importante va entre el 20 % y el 70 % de la altura.
