const fs = require('fs');

console.log('=== PATCHING BACKEND_CODE.GS ===');

let code = fs.readFileSync('backend_code.gs', 'utf8');

const oldGetReg = `function handleGetEventRegistrations(payload) {
  const eventId = payload ? payload.eventId : '';
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  if (!sheet) return { registrations: [], stats: { total: 0, checkedIn: 0, walkIns: 0 } };

  const rows = sheet.getDataRange().getValues();
  const registrations = [];
  let checkedInCount = 0;
  let walkInCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!eventId || r[1] === eventId) {`;

const newGetReg = `function handleGetEventRegistrations(payload) {
  const eventId = payload ? String(payload.eventId || '').trim().toUpperCase() : '';
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  if (!sheet) return { registrations: [], stats: { total: 0, checkedIn: 0, walkIns: 0 } };

  const rows = sheet.getDataRange().getValues();
  const registrations = [];
  let checkedInCount = 0;
  let walkInCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rowEid = String(r[1] || '').trim().toUpperCase();
    if (!eventId || rowEid === eventId) {`;

if (code.includes(oldGetReg)) {
  code = code.replace(oldGetReg, newGetReg);
  console.log('Updated eventId matching loop in handleGetEventRegistrations');
} else {
  console.error('Could not find oldGetReg in backend_code.gs');
  process.exit(1);
}

const oldReqLookup = `    if (reqSheet && eventId) {
      const reqRows = reqSheet.getDataRange().getValues();
      for (let j = 1; j < reqRows.length; j++) {
        if (String(reqRows[j][0]).trim() === String(eventId).trim()) {`;

const newReqLookup = `    if (reqSheet && eventId) {
      const reqRows = reqSheet.getDataRange().getValues();
      for (let j = 1; j < reqRows.length; j++) {
        if (String(reqRows[j][0] || '').trim().toUpperCase() === eventId) {`;

if (code.includes(oldReqLookup)) {
  code = code.replace(oldReqLookup, newReqLookup);
  console.log('Updated reqSheet lookup in handleGetEventRegistrations');
} else {
  console.error('Could not find oldReqLookup in backend_code.gs');
  process.exit(1);
}

fs.writeFileSync('backend_code.gs', code, 'utf8');

// Also update artifact backend_code
const artifactPath = 'C:/Users/nipon/.gemini/antigravity/brain/3d702a86-92d8-44a8-8d58-e35fee520aa1/backend_code.gs';
if (fs.existsSync(artifactPath)) {
  fs.writeFileSync(artifactPath, code, 'utf8');
  console.log('Updated artifact backend_code.gs');
}

console.log('backend_code.gs updated successfully!');
