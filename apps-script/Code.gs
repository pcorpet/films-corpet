/**
 * Soirée cinéma — public, read-only JSONP bridge for the GitHub Pages frontend.
 * Configure SPREADSHEET_ID in Project Settings > Script Properties.
 */
function doGet(event) {
  var payload = JSON.stringify(getFilms());
  var callback = event && event.parameter && event.parameter.callback;
  if (callback) {
    // Accept a single JavaScript identifier only. Never evaluate caller-supplied code.
    if (!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(callback)) {
      return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
    }
    return ContentService.createTextOutput(callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

/** Return only the fields used by the selector. This project never edits Sheets. */
function getFilms() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  var sheetName = properties.getProperty('FILM_SHEET_NAME') || 'Films';
  var membersSheetName = properties.getProperty('MEMBERS_SHEET_NAME') || 'Personnes';
  if (!spreadsheetId) {
    throw new Error('Configuration manquante : ajouter SPREADSHEET_ID dans les propriétés du script.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error('Onglet introuvable : ' + sheetName);

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 4) return { members: [], films: [] };

  // Row 3 contains the headers; rows 4+ contain films. Ignore the formula control rows.
  var headers = values[2].map(function (value) { return String(value || '').trim(); });
  var memberData = getMemberData(spreadsheet, membersSheetName);
  var memberHeaders = memberData.members;
  var memberColumns = memberHeaders.map(function (name) { return headers.indexOf(name); });
  var films = values.slice(3).filter(function (row) { return row[0] && row[0].trim(); }).map(function (row) {
    var votes = {};
    memberHeaders.forEach(function (name, index) {
      var column = memberColumns[index];
      votes[name] = column < 0 || row[column] === '' ? null : Number(row[column]);
    });
    function cell(name) {
      var index = headers.indexOf(name);
      return index < 0 ? '' : String(row[index] || '').trim();
    }
    return {
      title: cell('Film'),
      age: parseFloat(cell('PEGI')) || null,
      duration: cell('DUREE'),
      genre: cell('Type de film'),
      availability: cell('Dispo sur'),
      votes: votes
    };
  });
  return { members: memberHeaders, memberInfo: memberData.memberInfo, films: films };
}

/** Read member names and details from the spreadsheet, never from source code. */
function getMemberData(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return { members: [], memberInfo: {} };

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return { members: [], memberInfo: {} };
  var headers = values[0].map(function (value) { return String(value || '').trim().toLocaleLowerCase(); });
  var nameColumn = headers.indexOf('prénom');
  var birthYearColumn = headers.indexOf('année de naissance');
  var genderColumn = headers.indexOf('genre');
  if (nameColumn < 0) return { members: [], memberInfo: {} };
  var currentYear = Number(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), 'yyyy'));
  var members = [];
  var memberInfo = {};

  values.slice(1).forEach(function (row) {
    var name = String(row[nameColumn] || '').trim();
    if (!name || members.indexOf(name) >= 0) return;
    var birthYear = birthYearColumn < 0 ? NaN : Number(row[birthYearColumn]);
    var genderText = genderColumn < 0 ? '' : String(row[genderColumn] || '').trim().toLocaleLowerCase();
    members.push(name);
    memberInfo[name] = {
      age: Number.isInteger(birthYear) && birthYear > 1900 ? currentYear - birthYear : null,
      gender: ['f', 'femme', 'féminin', 'feminin'].indexOf(genderText) >= 0 ? 'f' :
        (['m', 'homme', 'masculin'].indexOf(genderText) >= 0 ? 'm' : '')
    };
  });
  return { members: members, memberInfo: memberInfo };
}
