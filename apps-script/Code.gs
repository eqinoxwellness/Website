/**
 * Equinox lead inbox — Google Apps Script web app.
 * Receives leads from /api/lead, appends them to the "Leads" sheet and emails the clinic
 * a summary with one-tap WhatsApp and call links.
 *
 * Setup (5 minutes):
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this file.
 * 2. Project Settings > Script properties: add
 *      SECRET        a long random string (same value as APPS_SCRIPT_SECRET on Vercel)
 *      NOTIFY_EMAIL  comma-separated addresses that should receive each lead
 * 3. Run setup() once and approve permissions. It creates the Leads sheet with headers.
 * 4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 5. Copy the /exec URL into APPS_SCRIPT_URL on Vercel.
 * Re-deploy (Manage deployments > Edit > New version) after any change to this file.
 */

const SHEET_NAME = 'Leads';
const HEADERS = [
  'Lead ID', 'Received (IST)', 'Name', 'Mobile', 'Consultation', 'Preferred time',
  'Source', 'Medium', 'Campaign', 'Keyword / term', 'Ad content', 'GCLID', 'FBCLID', 'MSCLKID',
  'First source', 'First medium', 'First campaign', 'First landing page',
  'Landing page', 'Referrer', 'Form page', 'Pages viewed', 'Journey', 'Sections read',
  'Max scroll %', 'Seconds on site', 'Device',
  'Status', 'Grade', 'Owner', 'First reply at', 'Appointment at', 'Attended', 'Treatment started', 'Value (₹)', 'Notes',
];

function setup() {
  const sh = getSheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  const status = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Contacted', 'Qualified', 'Appointment booked', 'Attended', 'Treatment started', 'Closed-won',
      'Not reachable', 'Out of area', 'Service not offered', 'Not interested', 'Referred out'], true).build();
  const grade = SpreadsheetApp.newDataValidation().requireValueInList(['A', 'B', 'C', 'D'], true).build();
  sh.getRange(2, HEADERS.indexOf('Status') + 1, 5000, 1).setDataValidation(status);
  sh.getRange(2, HEADERS.indexOf('Grade') + 1, 5000, 1).setDataValidation(grade);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const props = PropertiesService.getScriptProperties();
    const body = JSON.parse(e.postData.contents || '{}');
    if (!body.secret || body.secret !== props.getProperty('SECRET')) return out_({ ok: false, error: 'unauthorised' });
    const L = body.lead || {};
    const sh = getSheet_();
    if (sh.getLastRow() === 0) setup();

    const now = new Date();
    const id = nextId_(props, now);
    const a = L.last || {}, f = L.first || {};
    const row = [
      id, Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'), L.name, "'" + L.phone, L.serviceName, L.preferredTime,
      a.source, a.medium, a.campaign, a.term, a.content, a.gclid, a.fbclid, a.msclkid,
      f.source, f.medium, f.campaign, f.landing,
      a.landing, a.referrer, L.page, L.pagesCount, L.pages, L.sections,
      L.maxScroll, L.secondsOnSite, L.device,
      'New', '', '', '', '', '', '', '', '',
    ].map(clean_);
    sh.appendRow(row);
    notify_(props, id, L);
    return out_({ ok: true, leadId: id });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function nextId_(props, now) {
  const ym = Utilities.formatDate(now, 'Asia/Kolkata', 'yyMM');
  const key = 'seq_' + ym;
  const n = Number(props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(n));
  return 'EQX-' + ym + '-' + ('00' + n).slice(-3);
}

// Blocks spreadsheet formula injection from visitor-typed text.
function clean_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  const s = String(v);
  if (s.charAt(0) === "'") return s;
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(props, id, L) {
  const to = props.getProperty('NOTIFY_EMAIL');
  if (!to) return;
  const first = (L.name || '').split(' ')[0];
  const hello = 'Namaskar ' + first + ', this is Equinox Aesthetic & Wellness Centre, Satya Nagar. Thank you for your request about ' +
    (L.serviceName || 'a consultation') + '. Is now a good time to talk?';
  const wa = 'https://wa.me/91' + L.phone + '?text=' + encodeURIComponent(hello);
  const a = L.last || {};
  const src = [a.source, a.medium, a.campaign].filter(String).join(' / ');
  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">' +
    '<p><b>' + esc_(L.name) + '</b> asked for a call back about <b>' + esc_(L.serviceName) + '</b>' +
    (L.preferredTime ? ' (prefers ' + esc_(L.preferredTime.toLowerCase()) + ')' : '') + '.</p>' +
    '<p><a href="' + wa + '" style="background:#1D6B52;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reply on WhatsApp</a>' +
    '&nbsp;&nbsp;<a href="tel:+91' + L.phone + '">Call +91 ' + L.phone + '</a></p>' +
    '<p style="color:#555">Found us via: ' + esc_(src || 'unknown') + (a.term ? ' — searched “' + esc_(a.term) + '”' : '') +
    '<br>Viewed ' + (L.pagesCount || 0) + ' page(s) over ' + Math.round((L.secondsOnSite || 0) / 60) + ' min on ' + esc_(L.device || 'unknown device') + '</p>' +
    '<p style="color:#555">Target: first reply within 5 minutes during clinic hours.</p></div>';
  MailApp.sendEmail({ to: to, subject: 'New lead ' + id + ': ' + L.serviceName + ' — ' + L.name, htmlBody: html, name: 'Equinox website' });
}

function esc_(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
