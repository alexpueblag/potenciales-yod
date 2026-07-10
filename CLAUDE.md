# Potenciales YOD · board de cálculo de potencial

Calculador de potencial de desarrollos (módulo 1: VERTICAL usos mixtos), sheet-driven.
Front: `index.html` único en GitHub Pages (`alexpueblag/potenciales-yod`).
Backend: Google Apps Script en `gas/` (NO se sube al repo público — está en `.gitignore`).
BD: Google Sheet **"YOD - POTENCIALES"** · 1 hoja por tipo de desarrollo · **1 fila = 1 caso**.

## Contratos

- `doGet`: `?recurso=meta` (ping) · `?recurso=lista&k=CLAVE&tipo=vertical` · `?recurso=caso&k=CLAVE&id=…` o `&palabra=…`
- `doPost` (text/plain JSON, sin preflight): `tipo=guardar | estado | archivar`, siempre con `k` (clave) y `request_id` (idempotencia 6 h).
- Upsert **por `caso_id`** (no por credenciales — corrige el punto débil de CroKiss). La `palabra` es única entre casos vivos; repetirla en otro caso → error `palabra_ocupada`.
- Columnas leídas por encabezado, auto-sanadas: agregar columnas en el Sheet nunca rompe. Las variables del motor son columnas `in*` editables directo en Sheets.
- El correo (MailApp) manda la palabra + enlace `?open=CASO_ID`; ese enlace **nunca** devuelve la clave del board.
- La clave del board vive en la hoja `CONFIG` (servidor); el HTML público no contiene ningún secreto.

## Reglas de oro

1. **Apps Script**: al cambiar `gas/Code.gs` → `npx clasp push` y luego **actualizar la implementación EXISTENTE** (`npx clasp redeploy <deploymentId>` o editor → Implementar → Administrar → lápiz → Nueva versión). **NUNCA crear implementación nueva**: cambia la URL `/exec` y rompe el board y los enlaces `?open=` enviados.
2. **Pruebas**: filas de prueba con `source='test'` y archivarlas al terminar (`archivado=si`). Nunca borrar filas.
3. **Deploy front**: editar `index.html` → commit → `git push` → Ctrl+Shift+R. Nada de publicar desde clones viejos.
4. Respaldo semanal automático del Sheet a Drive "Potenciales Respaldos" (domingo 3 AM, conserva 8).
5. Los siguientes tipos de desarrollo (RESIDENCIAL, LOGISTICO) = hoja nueva en el Sheet + entrada en `CFG.HOJAS_TIPO` + motor nuevo en el front. La infraestructura (clave, palabra, seguimiento, historial) se reutiliza tal cual.

## URLs y datos

- Sitio: https://alexpueblag.github.io/potenciales-yod/
- Apps Script (editor): https://script.google.com/d/115k1wTxnEdPaPyAVqDo9-N2mAhS5d50eoQT9W83nxrXe99EfPhwpC_dw/edit
- `/exec`: `https://script.google.com/macros/s/AKfycbzCoMIKfgiKELs0efVYE0q20UfPXif-6rvfjZlCPgVuTTIljFqsMrUa9uE_4E18QHgB/exec`
- Sheet: lo crea `setup()` (el ID queda en Script Properties, llave `SHEET_ID`).
- Motor original de referencia: `~/Documents/Codex/2026-07-09/crea-una-tarea-programada-llamada-weekday/outputs/torre-ruisenor-v3.html`

## Preview local

`.claude/launch.json` (raíz de /Users/a.) tiene el server `potenciales` (puerto 8797).
Sin clave puedes entrar con "Trabajar sin conexión" (modo local, no escribe a la nube).
