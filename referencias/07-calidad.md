# De una presentación a una explicación animada

## Antes de renderizar

Cada plano debe responder: ¿qué entiende el espectador gracias al movimiento? Anota objeto, causa, cambio, destino y tiempo de lectura. Una etiqueta no sustituye la acción.

- **Mecanismo:** muestra la pieza completa, acerca el detalle y vuelve al conjunto para enseñar la consecuencia.
- **Antes/después:** mismo encuadre y escala; cambia una variable, no todo el dibujo.
- **Proceso:** el objeto sale de A, pasa por B, cambia y se posa en C. No lo teletransportes.
- **Metáfora:** una casa que estalla puede representar una idea descartada, pero identifícala como metáfora. Escombros finitos, sonido de impacto opcional y tiempo de reposo; no una explosión eterna.
- **Interfaz real:** usa una captura autorizada, conserva proporciones y acerca el control preciso; no inventes un botón de la herramienta.

## Piezas propias incluidas

`src/kit.tsx`: `Bloque` ilumina un volumen con sombra de contacto; `Sobre` representa un objeto; `arco`, `progreso` y `suave` calculan trayectorias; `Estallido` dispara partículas finitas. `Demo.tsx` muestra su composición. No es una biblioteca 3D ni pretende sustituir dibujos específicos de cada tema.

La luz llega de arriba a la izquierda. Mantén perspectiva, escala y material entre planos. No pongas una sombra flotante en un objeto apoyado. No uses contadores globales para IDs SVG: al renderizar en paralelo pueden cambiar. React.useId evita ese problema.

## Ritmo y lectura

Anticipación breve → acción clara → reposo. El reposo deja entender el resultado. Si entra un objeto, no hagas entrar simultáneamente otro lejos del foco. Alterna detalle/visión general cuando cambia la explicación, no por una frecuencia fija.

En vertical reserva ~150 px arriba, ~250 px abajo y ~80 px laterales; prueba también la interfaz real de la plataforma. Subtítulos en su propia franja, máximo 2–4 palabras por grupo y ajuste de tamaño para palabras largas. Si hay cifra larga, usa un plano dedicado. No publiques texto cortado.

## Audio y comprobación

La voz manda. Música con licencia, baja bajo la voz; efectos solo en acciones que se ven. Comprueba picos y escucha en altavoz de móvil. No afirmes naturalidad de una voz solo por transcribirla.

Revisa hojas de contacto, movimiento y audio por separado. Para cambios de motor, prueba además el mismo fotograma aislado y dentro de una secuencia: deben coincidir. No prometas que una prueba automática detecta todos los solapes visuales.
