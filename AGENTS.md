# Trabajar en Animados

Lee `SKILL.md` para producir un vídeo. Sirve igual a Codex y a Claude Code.
No publiques, instales modelos grandes ni uses servicios de pago solo por leer estas instrucciones.

- Código y materiales propios, MIT. No incorporar archivos de cursos privados, voces personales, claves ni vídeos ajenos.
- Cada vídeo va en `proyectos/<nombre>/`. No sobrescribir otros trabajos.
- La plantilla usa Remotion 4 para montar y exportar; el dibujo es un lienzo 2D (`plantilla/src/motor/`). Mantén las versiones fijadas.
- Todo sale de `t`: ningún fotograma depende del anterior (el render dibuja trozos en paralelo). Azar siempre con semilla (`k.azar`), nunca `Math.random`, el reloj ni descargas al renderizar. Lo pesado, una vez, con `k.una`.
- Whisper estima los tiempos. Una palabra interpolada se marca como estimada y se revisa a mano.
- Antes de entregar cambios del taller: `python -m unittest discover -s tests`, `python herramientas/animados.py validar`, render de la demo y revisión visual.
- Si cambias el kit, vuelve a sacar la lámina: `cd plantilla && npx remotion still src/index.ts Muestrario ../docs/kit.jpg --frame=45`.
- No se exige voz de IA: una grabación del usuario funciona sin descargar modelos.
