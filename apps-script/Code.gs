/**
 * Equinox Lead Inbox — Google Apps Script Web App
 * Receives leads directly from all website forms (or /api/lead), appends them to the "Leads" sheet,
 * and immediately emails eqinoxwellness@gmail.com with one-tap WhatsApp and phone call links.
 *
 * Easy Setup (3 Minutes):
 * 1. Open Google Sheets (https://sheets.new). Name it "Equinox Clinic Leads".
 * 2. Click: Extensions > Apps Script.
 * 3. Replace all code in the editor with this file. Click Save (Ctrl+S).
 * 4. Run setup() once to create table headers with dropdowns. Approve permissions when prompted.
 * 5. Click: Deploy > New deployment.
 *    - Select type: "Web app"
 *    - Description: "Equinox Lead Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click Deploy. Copy the Web App URL (ends with /exec).
 * 7. Paste that URL into js/main.js -> CLINIC_CONFIG.googleSheetWebAppUrl (or set APPS_SCRIPT_URL in .env).
 */

const SHEET_NAME = 'Leads';
const DEFAULT_NOTIFICATION_EMAIL = 'eqinoxwellness@gmail.com';

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

function doGet(e) {
  return out_({
    ok: true,
    status: 'Equinox Google Sheet Web App Active',
    clinic: 'Equinox Aesthetic & Wellness Centre, Satya Nagar, Bhubaneswar',
    notificationEmail: DEFAULT_NOTIFICATION_EMAIL,
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const props = PropertiesService.getScriptProperties();
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const secret = props.getProperty('SECRET');
    if (secret && body.secret && body.secret !== secret) {
      return out_({ ok: false, error: 'unauthorised' });
    }

    const L = body.lead || body || {};
    const sh = getSheet_();
    if (sh.getLastRow() === 0) setup();

    const now = new Date();
    const id = nextId_(props, now);
    const a = L.last || {}, f = L.first || {};
    const row = [
      id,
      Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'),
      L.name || 'Visitor',
      "'" + (L.phone || L.mobile || ''),
      L.serviceName || L.service || 'General Consultation',
      L.preferredTime || 'Anytime',
      a.source || L.source || 'Website',
      a.medium || L.medium || 'Direct',
      a.campaign || L.campaign || '',
      a.term || L.term || '',
      a.content || '',
      a.gclid || '',
      a.fbclid || '',
      a.msclkid || '',
      f.source || '',
      f.medium || '',
      f.campaign || '',
      f.landing || '',
      a.landing || L.pageUrl || '',
      a.referrer || L.referrer || 'Direct',
      L.page || '',
      L.pagesCount || 1,
      L.pages || '',
      L.sections || '',
      L.maxScroll || '',
      L.secondsOnSite || '',
      L.device || (/Mobi/i.test(L.device || '') ? 'Mobile' : 'Desktop'),
      'New', '', '', '', '', '', '', '', clean_(L.notes || '')
    ].map(clean_);

    sh.appendRow(row);

    // Send direct notification email to eqinoxwellness@gmail.com
    try {
      notify_(props, id, L);
    } catch (mailErr) {
      Logger.log('Mail notification notice: ' + mailErr);
    }

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
  const to = props.getProperty('NOTIFY_EMAIL') || DEFAULT_NOTIFICATION_EMAIL;
  if (!to) return;

  const name = L.name || 'Visitor';
  const phone = L.phone || L.mobile || '';
  const service = L.serviceName || L.service || 'Doctor Consultation';
  const preferredTime = L.preferredTime || 'Anytime';
  const notes = L.notes || 'None provided';
  const pageUrl = L.pageUrl || 'Website';
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');

  const waHello = 'Namaskar ' + name.split(' ')[0] + ', this is Equinox Aesthetic & Wellness Centre, Satya Nagar. Thank you for your consultation request regarding ' + service + '. Is now a good time to speak?';
  const waLink = 'https://wa.me/91' + phone + '?text=' + encodeURIComponent(waHello);
  const telLink = 'tel:+91' + phone;

  const html =
    '<div style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1.5px solid #C59A3F; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">' +
    '  <div style="background: linear-gradient(135deg, #1A1108 0%, #2A1A0A 100%); padding: 24px; text-align: center; border-bottom: 2px solid #C59A3F;">' +
    '    <h1 style="color: #F6D27A; margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">✦ Equinox Aesthetic &amp; Wellness Centre</h1>' +
    '    <p style="color: #FAF7F2; margin: 0; font-size: 13px; opacity: 0.85;">Satya Nagar, Bhubaneswar · Direct Clinical Lead Notification</p>' +
    '  </div>' +
    '  <div style="padding: 28px 24px; color: #1A1108;">' +
    '    <div style="background: #E8F5E9; border-left: 4px solid #10B981; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">' +
    '      <strong style="color: #065F46; font-size: 15px;">New Consultation Request Received (' + id + ')</strong>' +
    '      <div style="color: #047857; font-size: 13px; margin-top: 2px;">Time: ' + timestamp + ' IST</div>' +
    '    </div>' +
    '    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">' +
    '      <tr style="border-bottom: 1px solid #EADCC8;">' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700; width: 38%;">Patient Name:</td>' +
    '        <td style="padding: 10px 0; color: #1A1108; font-weight: 700; font-size: 16px;">' + esc_(name) + '</td>' +
    '      </tr>' +
    '      <tr style="border-bottom: 1px solid #EADCC8;">' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700;">Mobile Number:</td>' +
    '        <td style="padding: 10px 0; color: #1A1108; font-weight: 700; font-size: 16px;">' +
    '          <a href="' + telLink + '" style="color: #8A641A; text-decoration: underline;">+91 ' + esc_(phone) + '</a>' +
    '        </td>' +
    '      </tr>' +
    '      <tr style="border-bottom: 1px solid #EADCC8;">' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700;">Requested Service:</td>' +
    '        <td style="padding: 10px 0; color: #1A1108; font-weight: 600;">' + esc_(service) + '</td>' +
    '      </tr>' +
    '      <tr style="border-bottom: 1px solid #EADCC8;">' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700;">Preferred Contact Time:</td>' +
    '        <td style="padding: 10px 0; color: #1A1108;">' + esc_(preferredTime) + '</td>' +
    '      </tr>' +
    '      <tr style="border-bottom: 1px solid #EADCC8;">' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700;">Patient Notes:</td>' +
    '        <td style="padding: 10px 0; color: #333333; font-style: italic;">“' + esc_(notes) + '”</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <td style="padding: 10px 0; color: #8A641A; font-weight: 700;">Submitted On:</td>' +
    '        <td style="padding: 10px 0; color: #666666; font-size: 12px; word-break: break-all;">' + esc_(pageUrl) + '</td>' +
    '      </tr>' +
    '    </table>' +
    '    <div style="text-align: center; margin: 28px 0 16px;">' +
    '      <a href="' + waLink + '" style="display: inline-block; background: #25D366; color: #FFFFFF; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; margin: 6px; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">' +
    '        💬 Reply on WhatsApp' +
    '      </a>' +
    '      <a href="' + telLink + '" style="display: inline-block; background: #1A1108; color: #F6D27A; border: 1.5px solid #C59A3F; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; margin: 6px;">' +
    '        📞 Call +91 ' + esc_(phone) +
    '      </a>' +
    '    </div>' +
    '  </div>' +
    '  <div style="background: #F4EFEB; padding: 16px; text-align: center; border-top: 1px solid #EADCC8; font-size: 12px; color: #7A654C;">' +
    '    Plot No. 69, 1st Floor, Kali Mandir Road, Satya Nagar, Bhubaneswar 751007<br>' +
    '    Medical Desk: +91 63725 28534 · Email: ' + DEFAULT_NOTIFICATION_EMAIL +
    '  </div>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: to,
      subject: '🚨 New Patient Lead [' + id + ']: ' + service + ' — ' + name,
      htmlBody: html,
      name: 'Equinox Medical Desk'
    });
  } catch (e) {
    Logger.log('Email delivery notice: ' + e);
  }
}

function esc_(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
