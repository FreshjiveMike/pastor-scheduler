// In your Apps Script editor:
const SHEET_ID = SpreadsheetApp.getActive().getId();

function doGet(e) {
  // Always return availability JSON
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Availability');
  const rows = sheet.getDataRange().getValues();
  const slots = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, region, start, end] = rows[i];
    slots.push({ id, region, start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  }
  return ContentService
    .createTextOutput(JSON.stringify(slots))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // If slotId present → booking, else → new availability
  if (data.slotId) {
    const bs = ss.getSheetByName('Bookings');
    bs.appendRow([
      data.slotId,
      data.name,
      data.church,
      data.email,
      data.meetingType,
      new Date()
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'booked' }))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    const as = ss.getSheetByName('Availability');
    const newId = Utilities.getUuid();
    as.appendRow([ newId, data.region, data.start, data.end ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'added', id: newId }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
