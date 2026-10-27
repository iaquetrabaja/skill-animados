---
name: animados
description: Prepara y produce vídeos explicativos animados en Remotion con investigación, guion visual, narración opcional, subtítulos y revisión. Úsala para crear o mejorar un Reel, Short o explicación animada con código. Funciona con Claude Code y Codex; en un chat sin ejecución prepara los archivos y el plan sin fingir un render.
---

# Animados

Lee `AGENTS.md`. Conserva el estilo y la intención del usuario. El objetivo es explicar mediante acciones visibles, no llenar una plantilla con titulares. No promete resultados de audiencia.

## Elige el modo disponible

- Con acceso local: `python herramientas/animados.py doctor`. Crea una carpeta nueva con `crear nombre`. No instales modelos grandes ni consumas APIs de pago sin que el usuario haya elegido esa opción.
- Sin acceso local: entrega guion, storyboard, archivos y pasos para ejecutarlos. Consulta `referencias/06-asistentes.md`. No afirmes que has visto o renderizado un vídeo si no pudiste hacerlo.
- Para probar el motor primero: `instalar`, `demo`; la demo no tiene narración. La composición Video de muestra contiene silencio.

## Construcción

1. Investiga los datos sustantivos con fuentes primarias cuando existan. Guarda URLs, fecha y qué afirma cada una en `investigacion.md`. Separa metáforas de hechos; no fuerces tres fuentes para una afirmación sencilla ni inventes cifras.
2. Propón varios ganchos si el usuario aún no tiene uno; elige según público y objetivo. Escribe `guion.txt`: una idea por frase, duración estimada según lectura real. Consulta `referencias/01-guion-y-texto.md`.
3. Crea `escenas.md`: frase, objeto, acción causal, palabra o tiempo que la dispara, destino, pausa y transición. Lee `referencias/02-frase-a-dibujo.md` y `referencias/07-calidad.md` antes de dibujar. Diseña escenas completas; alterna plano general, detalle y comparación cuando ayuden.
4. Usa una grabación o narración autorizada. Qwen es opcional, no trae voz por defecto. `voz_local.py --help` explica la muestra. Escucha la voz completa: una transcripción no prueba pronunciación, acento ni naturalidad. Texto hablado alternativo: `[ISO 11540|ISO once mil quinientos cuarenta]`.
5. Ejecuta `palabras.py voz.wav plantilla/public/cues.json --guion guion.txt`. Si la alineación falla, revisa el audio y guion. Solo interpola con `--permitir-estimados` si vas a revisar esos tramos; el JSON los marca. No uses cues demo con una voz nueva.
6. Escribe `src/escenas.tsx`. `cue('palabra', aparición)` y `fin(...)` anclan acciones. En piezas no narradas usa tiempos de storyboard declarados. El kit `src/kit.tsx` ofrece volumen y trayectorias; compón objetos nuevos si hacen falta, no conviertas todos los temas en el mismo diagrama. Animaciones puras por fotograma, IDs estables, sin Math.random, reloj real ni descargas al renderizar. Lee `referencias/03-movimiento-y-sincro.md`.
7. `python herramientas/animados.py validar RUTA/plantilla`, luego `render RUTA/plantilla`. Corrige errores antes de exportar. Mantén 1080×1920, 30 fps y H.264 como salida vertical de referencia; adaptar otro formato requiere revisar encuadre y textos, no estirar el vídeo.

## Revisión y entrega

- `revisa.py` genera hojas de contacto; compruébalas. Son un muestreo, no inspección de todos los fotogramas.
- Reproduce entradas, colisiones y cortes; escucha toda la narración. Revisa 0.2 s antes y después de los eventos importantes.
- Comprueba bordes, subtítulos, texto en móvil, continuidad, picos de sonido y hechos. Corrige y vuelve a exportar los tramos afectados.
- Entrega MP4, guion, storyboard, fuentes y un resumen honesto de controles realizados/pendientes. Portadas/post solo si los pide o ayudan al encargo.
- No publiques el resultado en redes por el mero hecho de producirlo.

Las referencias en `ejemplos/` son modificables; no prueban que sus datos sigan vigentes. No copies material de terceros sin permiso.
