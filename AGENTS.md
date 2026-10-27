# Trabajar en Animados

Lee `SKILL.md` para producir un vídeo. Sirve tanto a Codex como a Claude Code.
No publiques, instales modelos grandes ni uses servicios de pago solo por leer estas instrucciones.

- El código y los materiales publicados aquí son propios, MIT. No incorporar archivos de cursos privados, voces personales, claves ni vídeos ajenos.
- Cada vídeo nuevo va en `proyectos/<nombre>/`. No sobrescribir otros trabajos.
- La plantilla usa Remotion 4; conserva las versiones sincronizadas y su licencia independiente.
- Animación determinista: función del fotograma, sin reloj real, Math.random ni contadores globales para IDs SVG. Usa React.useId.
- No fingir precisión: Whisper estima tiempos; una interpolación se identifica como estimada y requiere revisión.
- Antes de entregar cambios: `python -m unittest discover -s tests`, `python herramientas/animados.py validar`, render y revisión visual si cambian las escenas.
- La revisión de contacto es una muestra. Reproducir movimientos/transiciones y escuchar el audio aparte.
- No se exige generar voz con IA: una grabación del usuario funciona sin descargar modelos.
