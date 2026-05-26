// Replace SPREADSHEET_ID and optionally SHEET_NAME before deployment.
const SPREADSHEET_ID = '1cee3NSaPg55sWBVlxjxUNRmC5OJ8HPi1pOA3Cb49K9Y'; // filled from user
const SHEET_NAME = 'Sheet1'; // <-- optional sheet name

function _getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function _parseParams(e) {
  let params = {};
  if (e.postData && e.postData.type === 'application/json') {
    try { params = JSON.parse(e.postData.contents || '{}'); } catch (err) { params = {}; }
  }
  // If params empty, try URL/form parameters
  if ((!params || Object.keys(params).length === 0) && e.parameter) {
    params = Object.assign({}, e.parameter);
  }
  // Some clients send JSON body but postData.type may differ; try parsing contents anyway
  if ((!params || Object.keys(params).length === 0) && e.postData && e.postData.contents) {
    try { params = JSON.parse(e.postData.contents); } catch (err) { /* ignore */ }
  }
  // Support nested `user` object
  if (params.user && typeof params.user === 'object') {
    params = Object.assign({}, params.user, params);
    delete params.user;
  }
  return params || {};
}

function appendRowForUser(params) {
  const sheet = _getSheet();
  const row = [
    params.fullName || '',
    params.email || '',
    params.passwordHash || '',
    params.salt || '',
    params.createdAt || '',
    params.trialEndsAt || '',
    params.membershipStatus || '',
    new Date()
  ];
  sheet.appendRow(row);
}

function doPost(e){
  const params = _parseParams(e);
  appendRowForUser(params);
  return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  return doPost(e);
}
