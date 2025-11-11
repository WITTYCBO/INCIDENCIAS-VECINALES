const SHEET_NAME = 'Incidencias';
const FOLDER_ID = 'REEMPLAZA_CON_ID_DE_CARPETA_DRIVE';

function doPost(e) {
  try {
    if (!e?.postData?.contents) {
      throw new Error('Solicitud vacía.');
    }

    const payload = JSON.parse(e.postData.contents);
    const incident = payload.incident || {};
    const photo = payload.photo || {};

    if (!incident.firstName || !incident.lastName || !incident.incidentType) {
      throw new Error('Faltan campos obligatorios.');
    }
    if (!photo.data) {
      throw new Error('No se recibió la imagen.');
    }

    const sheet = getOrCreateSheet();
    const fileUrl = savePhotoToDrive(photo, incident);

    sheet.appendRow([
      new Date(),
      incident.firstName,
      incident.lastName,
      incident.phone || '',
      incident.email || '',
      incident.incidentType,
      incident.description || '',
      incident.latitude || '',
      incident.longitude || '',
      fileUrl,
      incident.timestamp || new Date().toISOString(),
    ]);

    return buildResponse({ status: 'success', message: 'Incidencia registrada', fileUrl });
  } catch (error) {
    return buildResponse({ status: 'error', message: error.message });
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Fecha de registro',
      'Nombre',
      'Apellido',
      'Teléfono',
      'Correo',
      'Tipo de incidencia',
      'Descripción',
      'Latitud',
      'Longitud',
      'URL fotografía',
      'Timestamp cliente',
    ]);
  }
  return sheet;
}

function savePhotoToDrive(photo, incident) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(photo.data), photo.type || 'image/jpeg', photo.name || 'incidencia.jpg');
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const fileName = `${timestamp}_${incident.incidentType || 'incidencia'}.${(photo.name || 'jpg').split('.').pop()}`;
  blob.setName(fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function buildResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(body.status === 'success' ? 200 : 400);
}
