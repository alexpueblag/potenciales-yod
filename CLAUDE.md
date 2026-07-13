# Potenciales YOD — estado de seguridad

El frontend público está en mantenimiento desde el chunk 14 de YOD OS.

- No publicar endpoints, claves compartidas, casos, coordenadas ni modelos financieros.
- No usar secretos en URL, `localStorage` o archivos del repositorio.
- Los borradores y colas históricos del navegador se preservan sin sincronización para una migración controlada; no se deben leer ni eliminar automáticamente.
- La reapertura requiere identidad individual, ACL del lado servidor, separación entre datos públicos/operativos/financieros y bitácora por actor.
- Todo deployment anterior debe permanecer archivado y no reutilizarse.

Fuente de control: YOD OS · Control Maestro.
