/**
 * Website enquiries -> an email and a row in a Google Sheet.
 *
 * Both forms on the site ("Book a consultation" and "Request a call back") post here
 * at the same moment they open WhatsApp. Setup steps are in README.md next to this file.
 */

const EMAIL_TO = 'advmanojchowdhary@rediff.com'; // who gets each enquiry
const EMAIL_CC = 'anushkapchowdhary@gmail.com'; // copy; set to '' for none
const SHEET_TITLE = 'Website enquiries: M.K. Chowdhary';
const TAB_NAME = 'Requests';
const HEADERS = ['Received', 'Type', 'Name', 'Phone', 'When', 'Meeting', 'Area', 'Message'];

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  let book;
  if (id) {
    book = SpreadsheetApp.openById(id);
  } else {
    book = SpreadsheetApp.create(SHEET_TITLE);
    props.setProperty('SHEET_ID', book.getId());
  }
  let tab = book.getSheetByName(TAB_NAME);
  if (!tab) {
    tab = book.getSheets()[0];
    tab.setName(TAB_NAME);
    tab.appendRow(HEADERS);
    tab.setFrozenRows(1);
    tab.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return tab;
}

/** Run this once from the editor: it creates the sheet, logs its link and sends a test email. */
function setup() {
  Logger.log('Your sheet: ' + getSheet_().getParent().getUrl());
  sendMail_('Test: website enquiries are connected', 'If you can read this, enquiry emails from the website will arrive here.');
}

// Keep a value as plain text: cap its length, and stop it being read as a formula (=, +, -, @).
function clean_(value) {
  const text = String(value || '').trim().slice(0, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function sendMail_(subject, body) {
  const mail = { to: EMAIL_TO, subject: subject, body: body };
  if (EMAIL_CC) mail.cc = EMAIL_CC;
  MailApp.sendEmail(mail);
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (!p.name || !p.phone) return reply_('missing name or phone');
  const type = p.type === 'Appointment' ? 'Appointment' : 'Call back';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), type, clean_(p.name), clean_(p.phone), clean_(p.when), clean_(p.mode), clean_(p.area), clean_(p.message)]);
  } finally {
    lock.releaseLock();
  }

  const lines = ['Name: ' + clean_(p.name), 'Phone: ' + clean_(p.phone)];
  if (type === 'Appointment') {
    lines.push('Date: ' + (clean_(p.when) || '-'), 'Meeting: ' + (clean_(p.mode) || '-'), 'Area: ' + (clean_(p.area) || '-'));
    if (p.message) lines.push('', 'Matter: ' + clean_(p.message));
  } else {
    lines.push('Best time to call: ' + (clean_(p.when) || '-'));
  }
  lines.push('', 'Sent from the website. The visitor was also shown WhatsApp with the same details.');
  sendMail_((type === 'Appointment' ? 'Appointment request: ' : 'Call back request: ') + String(p.name).slice(0, 80), lines.join('\n'));
  return reply_('ok');
}

function doGet() {
  return reply_('The enquiry endpoint is running.');
}

function reply_(text) {
  return ContentService.createTextOutput(text);
}
