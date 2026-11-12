const fs = require('fs');

let backend = fs.readFileSync('backend_code.gs', 'utf8');

// 1. In handleBatchImportRegistrations, accept participants OR attendees
const oldBatchStart = `function handleBatchImportRegistrations(payload) {
  const { eventId, participants } = payload;
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new Error('ไม่พบข้อมูลรายชื่อสำหรับนำเข้า');
  }`;

const newBatchStart = `function handleBatchImportRegistrations(payload) {
  const eventId = payload ? payload.eventId : '';
  const participants = (payload && (payload.participants || payload.attendees)) || [];
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new Error('ไม่พบข้อมูลรายชื่อสำหรับนำเข้า');
  }`;

if (backend.includes(oldBatchStart)) {
  backend = backend.replace(oldBatchStart, newBatchStart);
  console.log('Updated handleBatchImportRegistrations to accept payload.attendees!');
} else {
  console.log('Searching via regex for handleBatchImportRegistrations');
  backend = backend.replace(/function handleBatchImportRegistrations\(payload\)\s*\{\s*const\s*\{\s*eventId,\s*participants\s*\}\s*=\s*payload;\s*if\s*\(!participants[^}]*\{[^}]*\}/, newBatchStart);
}

// 2. Add handleCancelCheckin in backend_code.gs
const cancelCheckinCode = `
function handleCancelCheckin(payload) {
  const regId = payload ? payload.regId : '';
  const eventId = payload ? payload.eventId : '';
  if (!regId) throw new Error('กรุณาระบุ regId ที่ต้องการยกเลิก');

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  if (!sheet) throw new Error('ไม่พบชีต Onsite_Registrations');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(regId).trim()) {
      sheet.getRange(i + 1, 9).setValue('PENDING'); // checkinStatus
      sheet.getRange(i + 1, 10).setValue('');        // checkinTime
      return { success: true, regId: regId, status: 'PENDING', message: 'ยกเลิกการเช็กชื่อเรียบร้อยแล้ว' };
    }
  }
  return { success: false, message: 'ไม่พบรหัสผู้ลงทะเบียน: ' + regId };
}
`;

if (!backend.includes('function handleCancelCheckin')) {
  backend = backend + '\n' + cancelCheckinCode;
  console.log('Added handleCancelCheckin function!');
}

// 3. Add CANCEL_CHECKIN and UNDO_CHECKIN cases to doPost
const oldDispatchCase = `      case 'CHECKIN_PARTICIPANT':
        result = handleCheckinParticipant(payload);
        break;`;

const newDispatchCase = `      case 'CHECKIN_PARTICIPANT':
        result = handleCheckinParticipant(payload);
        break;
      case 'CANCEL_CHECKIN':
      case 'UNDO_CHECKIN':
        result = handleCancelCheckin(payload);
        break;`;

if (backend.includes(oldDispatchCase) && !backend.includes('CANCEL_CHECKIN')) {
  backend = backend.replace(oldDispatchCase, newDispatchCase);
  console.log('Added CANCEL_CHECKIN dispatcher case in doPost!');
}

fs.writeFileSync('backend_code.gs', backend, 'utf8');
fs.writeFileSync('C:/Users/nipon/.gemini/antigravity/brain/3d702a86-92d8-44a8-8d58-e35fee520aa1/backend_code.gs', backend, 'utf8');
console.log('backend_code.gs updated and synced to artifact directory!');
