# Aplicación de incidencias vecinales

Este proyecto proporciona una interfaz web y un script de Google Apps Script para registrar incidencias vecinales (iluminación, deterioros, fugas de agua, etc.) desde dispositivos móviles y guardarlas en una hoja de cálculo de Google Sheets junto con la fotografía y la ubicación GPS.

## Contenido

- `web/`: interfaz web lista para incrustar en Google Sites.
  - `index.html`: formulario de registro.
  - `styles.css`: estilos del formulario.
  - `app.js`: lógica de geolocalización, captura de imagen y envío a Google Apps Script.
  - `embed.html`: versión autocontenida lista para pegarse en un bloque de código de Google Sites.
- `apps_script/Code.gs`: backend sin servidor que guarda la incidencia en Google Sheets y almacena la fotografía en Google Drive.

## Requisitos previos

1. **Cuenta de Google** con acceso a Google Drive, Google Sheets y Google Apps Script.
2. **Carpeta en Google Drive** para almacenar las fotografías (debe compartir archivos con "Cualquiera con el enlace").
3. **Hoja de cálculo de Google Sheets** donde se registrarán las incidencias.

## Pasos de implementación

### 1. Configurar Google Sheets y Apps Script

1. Crea una hoja de cálculo en Google Sheets.
2. Abre <kbd>Extensiones → Apps Script</kbd> y pega el contenido de `apps_script/Code.gs` en el editor.
3. Reemplaza las constantes:
   - `FOLDER_ID` por el ID de la carpeta de Google Drive donde guardarás las fotografías.
   - (Opcional) cambia `SHEET_NAME` si deseas otro nombre de pestaña.
4. Guarda el proyecto, selecciona <kbd>Desplegar → Implementar como aplicación web</kbd>.
5. Elige **Cualquiera** como nivel de acceso y copia la URL que genera la implementación.

### 2. Preparar la interfaz web

#### Opción A: incrustar directamente en Google Sites

1. Abre `web/embed.html` y reemplaza el texto `https://script.google.com/macros/s/REEMPLAZA_CON_TU_URL/exec` por la URL del Web App desplegado en el paso anterior.
2. Entra a tu Google Site, selecciona la página donde quieres mostrar el formulario y ve a **Insertar → Incrustar → Insertar código**.
3. Pega el contenido completo de `web/embed.html`, pulsa **Siguiente** y luego **Insertar**.
4. Ajusta el tamaño del bloque incrustado para que ocupe el ancho disponible (por ejemplo, 100% de ancho y alto mínimo 900 px).
5. Publica el sitio. El formulario quedará operativo dentro de Google Sites sin necesidad de servidores adicionales.

#### Opción B: alojar los archivos en otro servicio web

1. Copia los archivos de la carpeta `web/` al alojamiento que prefieras (Netlify, GitHub Pages, servidor propio, etc.).
2. Edita `web/app.js` y reemplaza la constante `APPS_SCRIPT_URL` por la URL del Web App desplegado en el paso anterior.
3. Publica el sitio. Si quieres integrarlo en Google Sites desde un hosting externo, usa **Insertar → Incrustar → Insertar URL** y proporciona la dirección pública de tu formulario.

### 3. Uso de la aplicación

1. Desde un dispositivo móvil u ordenador, abre la página publicada.
2. Completa los datos obligatorios: nombre, apellido, tipo de incidencia, descripción y fotografía.
3. Pulsa **Obtener ubicación actual** para capturar las coordenadas GPS (necesita permisos del navegador).
4. Envía la incidencia. Se registrará en la hoja de cálculo y la imagen se guardará en la carpeta de Drive especificada.

## Personalización

- Puedes añadir más tipos de incidencias editando las opciones del `<select>` en `web/index.html`.
- Ajusta estilos en `web/styles.css` para adaptarlos a la identidad visual de tu municipio o comunidad.
- Amplía el script de Apps Script para enviar notificaciones por correo o integrarlo con otros sistemas municipales.

## Seguridad y privacidad

- Revisa la política de privacidad antes de publicar el formulario y asegúrate de informar a los vecinos sobre el uso de sus datos personales.
- Si manejas información sensible, restringe el acceso al Web App y aplica controles de acceso en la hoja de cálculo.

## Desarrollo local

Puedes abrir `web/index.html` directamente en tu navegador para realizar pruebas. Al no contar con la URL del Apps Script, el envío devolverá un error controlado. Para pruebas sin backend, comenta temporalmente la lógica de `fetch` en `web/app.js`.
