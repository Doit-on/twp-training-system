const fs = require('fs');

let backend = fs.readFileSync('backend_code.gs', 'utf8');

// 1. Version Bump in header comment and SYSTEM_VERSION
backend = backend.replace(/Version: 1\.[0-9]+\.[0-9]+/g, 'Version: 1.19.1');
backend = backend.replace(/const SYSTEM_VERSION = '[^']+';/g, "const SYSTEM_VERSION = '1.19.1';");
backend = backend.replace(/ระบบ v1\.[0-9]+\.[0-9]+/g, 'ระบบ v1.19.1');

// 2. Add testSendCertificateEmail at the top beside testMailAuthorization
const authBlockOld = `function testMailAuthorization() {
  return authorizeMail();
}`;

const authBlockNew = `function testMailAuthorization() {
  return authorizeMail();
}

/**
 * ฟังก์ชันสำหรับทดสอบส่งอีเมลวุฒิบัตร (e-Certificate) จาก Google Apps Script Editor
 * สามารถเลือกชื่อฟังก์ชันนี้ในแถบเครื่องมือด้านบนแล้วกด "เรียกใช้" ได้ทันที
 */
function testSendCertificateEmail() {
  const adminEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'admin@twp.co.th';
  Logger.log('กำลังทดสอบส่งอีเมลวุฒิบัตรไปยัง: ' + adminEmail);
  const testPayload = {
    email: adminEmail,
    nameTh: 'นายทดสอบ ระบบวุฒิบัตร',
    nameEn: 'Mr. Test TWP Certificate',
    school: 'โรงเรียนสาธิตไทยวัฒนาพานิช',
    courseTopic: 'Active Learning สู่สมรรถนะผู้เรียนด้วยสื่อนวัตกรรมดิจิทัล',
    certId: 'TWP-TEST-' + Math.floor(100000 + Math.random() * 900000),
    eventDate: new Date().toLocaleDateString('th-TH'),
    speakerName: 'ศ.ดร.ประสาน ปัญญาเลิศ',
    token: 'TEST-TOKEN-999'
  };
  return handleSendECertificateEmail(testPayload);
}`;

if (backend.includes(authBlockOld)) {
  backend = backend.replace(authBlockOld, authBlockNew);
}

// 3. Ensure handleSendECertificateEmail has fallback for direct execution
const handleSendOldStart = `function handleSendECertificateEmail(payload) {
  // หากถูกกด "เรียกใช้" จาก Google Apps Script Editor โดยตรง (ไม่มี payload)
  // ให้เตรียมข้อมูลจำลองสำหรับการทดสอบและขอสิทธิ์ Authorization ทันที โดยไม่ throw error
  if (!payload || !payload.email) {
    const defaultEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'admin@twp.co.th';
    payload = {
      email: defaultEmail,
      nameTh: 'ผู้ทดสอบระบบ (Test Admin)',
      nameEn: 'System Administrator',
      school: 'โรงเรียนสาธิตพัฒนา',
      courseTopic: 'การพัฒนาศักยภาพครูผู้สอนสู่สมรรถนะ',
      certId: 'TWP-TEST-' + Date.now().toString().slice(-6),
      eventDate: new Date().toLocaleDateString('th-TH')
    };
  }`;

if (!backend.includes('ผู้ทดสอบระบบ (Test Admin)')) {
  // Replace standard handleSendECertificateEmail start
  backend = backend.replace(/function handleSendECertificateEmail\(payload\)\s*\{/, handleSendOldStart);
}

// 4. In handleGetEventRegistrations, return eventInfo lookup
const handleGetOldReturn = `  return {
    registrations: registrations,
    stats: {
      total: registrations.length,
      checkedIn: checkedInCount,
      walkIns: walkInCount
    }
  };`;

const handleGetNewReturn = `  // Lookup event metadata from Requests sheet
  let eventInfo = null;
  try {
    const reqSheet = ss.getSheetByName('Requests');
    if (reqSheet && eventId) {
      const reqRows = reqSheet.getDataRange().getValues();
      for (let j = 1; j < reqRows.length; j++) {
        if (String(reqRows[j][0]).trim() === String(eventId).trim()) {
          eventInfo = {
            eventId: reqRows[j][0],
            schoolName: reqRows[j][2] || '',
            courseTopic: reqRows[j][3] || '',
            eventDate: reqRows[j][5] || '',
            speakerName: reqRows[j][8] || ''
          };
          break;
        }
      }
    }
  } catch (err) {
    Logger.log('Could not load eventInfo: ' + err.message);
  }

  return {
    registrations: registrations,
    stats: {
      total: registrations.length,
      checkedIn: checkedInCount,
      walkIns: walkInCount
    },
    eventInfo: eventInfo
  };`;

if (backend.includes(handleGetOldReturn)) {
  backend = backend.replace(handleGetOldReturn, handleGetNewReturn);
}

fs.writeFileSync('backend_code.gs', backend, 'utf8');
console.log('backend_code.gs updated successfully to v1.19.1!');
