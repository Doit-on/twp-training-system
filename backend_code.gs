/**
 * ============================================================================
 * EMS Enterprise - Training Center TWP
 * Version: 1.21.0
 * Architecture: Google Apps Script Backend (Serverless) + Google Sheets Database
 * Security: Zero-Trust Data Isolation + Multi-Operator Stamping + Concurrency Lock
 * Features: Multi-Device Sync + Team QR Pairing + PPC Standard A4 Report Engine (PDF & Word .docx)
 * ============================================================================
 */

const SYSTEM_VERSION = '1.21.0';
const DEFAULT_ADMIN_PASS = 'admin0000';
// =============================================================================
// MULTI-ACCOUNT GOOGLE SHEETS CONNECTIVITY (Cross-Account Shared Editor Access)
// =============================================================================
// เพื่อส่งข้อมูลแยกไปยัง Google Sheet ใน Account อื่นๆ เช่น แผนกการเงิน/บัญชี หรือ ผู้บริหาร
// ให้เปิด Google Sheet ปลายทางใน Account นั้น แล้วกด "Share" ใส่อีเมลของ Account นี้ในฐานะ "Editor"
const SECONDARY_FINANCE_SHEET_ID = ''; // ใส่ Google Sheet ID ของฝ่ายการเงิน/บัญชี (ถ้ามี)
const SECONDARY_AUDIT_SHEET_ID = '';   // ใส่ Google Sheet ID ของฝ่ายตรวจสอบ/ผู้บริหาร (ถ้ามี)


function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * ============================================================================
 * ฟังก์ชันสำหรับกด "เรียกใช้" (Run) ใน Google Apps Script เพื่ออนุมัติสิทธิ์ส่งอีเมล (Authorize MailApp)
 * เมื่อเลือกฟังก์ชันนี้แล้วกด "เรียกใช้" Google จะแสดงป๊อปอัป "ให้สิทธิ์เข้าถึง (Authorization Required)" ทันที
 * ============================================================================
 */
function authorizeMail() {
  const myEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'admin@twp.co.th';
  const quota = MailApp.getRemainingDailyQuota();
  MailApp.sendEmail({
    to: myEmail,
    subject: '[TWP Training] อนุมัติสิทธิ์ส่งอีเมลวุฒิบัตรสำเร็จ (Authorization Success)',
    body: 'ยินดีด้วยครับ! สิทธิ์ MailApp.sendEmail ได้รับการอนุมัติเรียบร้อยแล้ว\nโควตาส่งอีเมลวันนี้คงเหลือ: ' + quota + ' ฉบับ\nระบบ e-Certificate สามารถจัดส่งอีเมลให้ผู้เข้าอบรมได้ทันที 100%'
  });
  Logger.log('MailApp Authorization SUCCESS! Remaining daily quota: ' + quota);
  return 'สิทธิ์การส่งอีเมลได้รับการอนุมัติเรียบร้อยแล้ว โควตาคงเหลือวันนี้: ' + quota + ' ฉบับ';
}

function testMailAuthorization() {
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
}

/**
 * WebApp View Dispatcher & Ping Endpoint
 */
function doGet(e) {
  let spreadsheetName = 'TWP Training Center Database';
  try {
    const ss = getSpreadsheet();
    if (ss) spreadsheetName = ss.getName();
  } catch (err) {}

  // หากเปิดลิงก์ตรงในเบราว์เซอร์ จะแสดงสถานะ Online และข้อมูลระบบทันที ให้ผู้ใช้ตรวจสอบได้ใน 1 วินาที
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ONLINE',
    service: 'EMS Enterprise Backend API (Training Center TWP)',
    version: SYSTEM_VERSION,
    spreadsheet: spreadsheetName,
    serverTime: new Date().toISOString(),
    message: 'Google Apps Script Web App ทำงานอย่างสมบูรณ์ พร้อมรับคำสั่ง doPost จากระบบ v1.19.1 เรียบร้อยแล้ว'
  }, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * API Gateway รองรับคำสั่งจาก Antigravity Single-Page Application (SPA)
 */

// -----------------------------------------------------------------------------
// V1.21.0: AUDIT LOGS, CHECKLIST & INCIDENT LOGGING HANDLERS
// -----------------------------------------------------------------------------
function handleLogAuditTrail(payload) {
  const { eventId, operatorName, actionType, details, oldData, newData } = payload || {};
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Audit_Logs');
  if (sheet) {
    sheet.appendRow([
      'LOG-' + Date.now(),
      eventId || 'GENERAL',
      new Date().toISOString(),
      operatorName || 'System',
      actionType || 'UPDATE',
      details || '',
      typeof oldData === 'object' ? JSON.stringify(oldData) : String(oldData || ''),
      typeof newData === 'object' ? JSON.stringify(newData) : String(newData || '')
    ]);
  }
  return { success: true };
}

function handleUpdateOperationChecklist(payload) {
  const { eventId, checklist, incidentLog, operatorName } = payload || {};
  if (!eventId) throw new Error('Missing eventId');

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  
  // If incidentLog provided, append to Incident_Logs sheet
  if (incidentLog && incidentLog.details) {
    const incSheet = ss.getSheetByName('Incident_Logs');
    if (incSheet) {
      incSheet.appendRow([
        'INC-' + Date.now(),
        eventId,
        new Date().toISOString(),
        incidentLog.category || 'GENERAL',
        incidentLog.severity || 'NORMAL',
        incidentLog.details || '',
        incidentLog.resolution || '',
        operatorName || 'Team B'
      ]);
    }
  }

  // Also log audit trail
  handleLogAuditTrail({
    eventId: eventId,
    operatorName: operatorName || 'Team B',
    actionType: 'UPDATE_CHECKLIST',
    details: 'บันทึก Operation Checklist และอุปสรรคหน้างาน'
  });

  return { success: true };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000); // รอคิวล็อกได้สูงสุด 15 วินาที
    if (!hasLock) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'ระบบกำลังประมวลผลคำขอของผู้ใช้อื่นพร้อมกัน กรุณาลองใหม่อีกครั้งใน 5 วินาที'
      });
    }

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('ไม่พบข้อมูล Payload ในคำขอ');
    }

    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload || {};
    let result = {};

    switch(action) {
      case 'PING':
        result = handlePing();
        break;
      case 'GET_INITIAL_DATA':
        result = getInitialData();
        break;
      case 'CREATE_REQUEST_A':
        result = createRequestTeamA(payload);
        break;
      case 'UPDATE_REVIEW_B':
        result = updateReviewTeamB(payload);
        break;
      case 'SAVE_EXPENSES':
        result = handleSaveExpenses(payload);
        break;
      case 'EXEC_DECISION':
        result = handleExecDecision(payload);
        break;
      case 'SUBMIT_EVALUATION':
        result = submitEvaluationResponse(payload);
        break;
      case 'ADMIN_LOGIN':
        result = handleAdminLogin(payload);
        break;
      case 'ADMIN_INIT_SHEETS':
        result = handleAdminInitSheets(payload);
        break;
      case 'ADMIN_GET_LOGS':
        result = handleAdminGetLogs(payload);
        break;
      case 'ADMIN_UPDATE_SETTINGS':
        result = handleAdminUpdateSettings(payload);
        break;
      case 'SETUP_ALL_PPC_SHEETS':
        result = setupAllPpcSheets();
        break;
      case 'GET_PPC_REPORT_DATA':
        result = getPpcReportData(payload.eventId);
        break;
      case 'EXPORT_PPC_REPORT_PDF':
        result = exportPpcReportPdf(payload.eventId);
        break;
      case 'EXPORT_PPC_REPORT_DOCX':
        result = exportPpcReportDocx(payload.eventId);
        break;
      case 'SEND_ECERTIFICATE_EMAIL':
        result = handleSendECertificateEmail(payload);
        break;
      case 'GET_EVENT_REGISTRATIONS':
        result = handleGetEventRegistrations(payload);
        break;
      case 'CHECKIN_PARTICIPANT':
        result = handleCheckinParticipant(payload);
        break;
      case 'UPDATE_OPERATION_CHECKLIST':
        data = handleUpdateOperationChecklist(payload);
        break;
      case 'LOG_AUDIT_TRAIL':
        data = handleLogAuditTrail(payload);
        break;
      case 'CANCEL_CHECKIN':
      case 'UNDO_CHECKIN':
        result = handleCancelCheckin(payload);
        break;
      case 'REGISTER_WALKIN':
        result = handleRegisterWalkin(payload);
        break;
      case 'IMPORT_REGISTRATIONS':
        result = handleBatchImportRegistrations(payload);
        break;
      case 'GET_ANNUAL_PLANS':
        result = handleGetAnnualPlans();
        break;
      case 'SAVE_ANNUAL_PLANS':
        result = handleSaveAnnualPlans(payload);
        break;
      case 'DELETE_ANNUAL_PLAN':
        result = handleDeleteAnnualPlan(payload);
        break;
      case 'UPDATE_TEAM_B_ATTENDEES':
        result = handleUpdateTeamBAttendees(payload);
        break;
      default:
        throw new Error('ไม่พบ Action ที่ระบุ: ' + action);
    }

    return createJsonResponse({ status: 'SUCCESS', data: result, version: SYSTEM_VERSION });
  } catch (err) {
    return createJsonResponse({ status: 'ERROR', message: err.toString(), version: SYSTEM_VERSION });
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------- PING & HEALTH CHECK -------------------

function handlePing() {
  const ss = getSpreadsheet();
  return {
    pong: true,
    serverTime: new Date().toISOString(),
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    version: SYSTEM_VERSION
  };
}

// ------------------- INITIAL DATA FETCH -------------------

function getInitialData() {
  const ss = getSpreadsheet();
  
  // ตรวจสอบและสร้างชีตอัตโนมัติหากยังไม่มี
  ensureRequiredSheets(ss);

  // ดึง PPC Master Data
  const ppcSheet = ss.getSheetByName('PPC_Master');
  const ppcData = ppcSheet.getDataRange().getValues();
  const masterData = {
    provinces: [],
    sales: [],
    schools: []
  };

  const provinceSet = new Set();
  const salesMap = new Map();

  for (let i = 1; i < ppcData.length; i++) {
    const row = ppcData[i];
    if (!row[0] && !row[1]) continue;
    const zone = String(row[0] || '').trim();
    const prov = String(row[1] || '').trim();
    const saleId = String(row[2] || '').trim();
    const saleName = String(row[3] || '').trim();
    const schoolId = String(row[4] || '').trim();
    const schoolName = String(row[5] || '').trim();
    const tier = String(row[6] || '').trim();

    if (prov) provinceSet.add(prov);
    if (saleName && !salesMap.has(saleName)) {
      salesMap.set(saleName, { saleId, saleName, province: prov, zone });
    }
    if (schoolId) {
      masterData.schools.push({ schoolId, schoolName, province: prov, zone, tier, saleName });
    }
  }

  masterData.provinces = Array.from(provinceSet).sort();
  masterData.sales = Array.from(salesMap.values());

  // ดึง QR Tokens เพื่อผูกรหัสลับแบบ Zero-Trust
  const tokenSheet = ss.getSheetByName('QR_Tokens');
  const tokenRows = tokenSheet ? tokenSheet.getDataRange().getValues() : [];
  const tokenMap = {};
  for (let i = 1; i < tokenRows.length; i++) {
    const tr = tokenRows[i];
    if (tr[0] && tr[1]) {
      tokenMap[tr[1]] = tr[0]; // eventId -> Token_ID
    }
  }

  // ดึง Event Requests
  const reqSheet = ss.getSheetByName('Event_Requests');
  const reqRows = reqSheet.getDataRange().getValues();
  const requests = [];

  for (let i = 1; i < reqRows.length; i++) {
    const r = reqRows[i];
    if (!r[0]) continue;

    let actualExp = null;
    if (r[35]) {
      try {
        actualExp = typeof r[35] === 'string' ? JSON.parse(r[35]) : r[35];
      } catch (e) {
        actualExp = null;
      }
    }

    requests.push({
      eventId: r[0],
      createdAt: r[1],
      status: r[2],
      activityType: r[3],
      courseTopic: r[4],
      customTopic: r[5],
      eventDate: r[6] ? Utilities.formatDate(new Date(r[6]), "GMT+7", "yyyy-MM-dd") : '',
      province: r[7],
      saleName: r[8],
      schoolId: r[9],
      schoolName: r[10],
      speakerType: r[11],
      venueType: r[12],
      objective: r[13],
      targetSales: Number(r[14]) || 0,
      estBudget: Number(r[15]) || 0,
      teamBSpeaker: r[16] || '',
      teamBNotes: r[17] || '',
      actualBudget: Number(r[18]) || 0,
      createdBy: r[19] || '',
      reviewedBy: r[20] || '',
      approvedBy: r[21] || '',
      lastModifiedBy: r[22] || '',
      submittedToBAt: r[23] || '',
      reviewedByBAt: r[24] || '',
      approvedAt: r[25] || '',
      pdfUrl: r[26] || '',
      needAccommodation: r[27] || 'NO',
      roomCount: Number(r[28]) || 0,
      needTransportation: r[29] || 'NO',
      transportDetails: r[30] || '',
      docxUrl: r[31] || '',
      isOutOfPlan: r[32] || 'NO',
      outOfPlanReason: r[33] || '',
      annualPlanId: r[34] || '',
      actualExpenses: actualExp,
      actualExpensesTotal: actualExp ? ((Number(actualExp.expSpeaker)||0) + (Number(actualExp.expTravel)||0) + (Number(actualExp.expAccom)||0) + (Number(actualExp.expFood)||0) + (Number(actualExp.expDocKit)||0) + (Number(actualExp.expVenue)||0) + (Number(actualExp.expMisc)||0)) : (Number(r[18]) || 0),
      token: tokenMap[r[0]] || (r[36] || ''),
      expectedTrainees: (r[35] !== '' && r[35] !== undefined && r[35] !== null) ? Number(r[35]) : 50,
      actualTrainees: (r[36] !== '' && r[36] !== undefined && r[36] !== null) ? Number(r[36]) : ((r[35] !== '' && r[35] !== undefined && r[35] !== null) ? Number(r[35]) : 50),
      needCatering: r[37] || 'NO',
      needProductMedia: r[38] || 'NO',
      otherSupportDetails: r[39] || '',
      speakerSignature: r[40] || '',
      speakers: r[41] ? (function() { try { return JSON.parse(r[41]); } catch(e) { return []; } })() : [],
      rowIndex: i + 1
    });
  }

  // ดึงสถิติ Evaluation
  const evalSheet = ss.getSheetByName('Evaluation_Responses');
  const evalRows = evalSheet.getDataRange().getValues();
  const evalMap = {};
  for (let i = 1; i < evalRows.length; i++) {
    const er = evalRows[i];
    const eId = er[1];
    if (!eId) continue;
    if (!evalMap[eId]) {
      evalMap[eId] = { count: 0, q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    }
    evalMap[eId].count += 1;
    evalMap[eId].q1 += Number(er[3]) || 0;
    evalMap[eId].q2 += Number(er[4]) || 0;
    evalMap[eId].q3 += Number(er[5]) || 0;
    evalMap[eId].q4 += Number(er[6]) || 0;
    evalMap[eId].q5 += Number(er[7]) || 0;
  }

  // ดึงสถิติ Onsite Registrations
  const regSheet = ss.getSheetByName('Onsite_Registrations');
  const regMap = {};
  if (regSheet) {
    const regRows = regSheet.getDataRange().getValues();
    for (let i = 1; i < regRows.length; i++) {
      const rr = regRows[i];
      const rEventId = rr[1];
      if (!rEventId) continue;
      if (!regMap[rEventId]) {
        regMap[rEventId] = { total: 0, checkedIn: 0, walkIns: 0 };
      }
      regMap[rEventId].total += 1;
      if (rr[8] === 'CHECKED_IN') regMap[rEventId].checkedIn += 1;
      if (rr[10] === 'WALK_IN') regMap[rEventId].walkIns += 1;
    }
  }

  // ผูกคะแนนเฉลี่ยและสถิติ Onsite ลงใน Requests
  requests.forEach(function(req) {
    const stats = evalMap[req.eventId];
    if (stats && stats.count > 0) {
      req.evalCount = stats.count;
      req.evalAvg = Number(((stats.q1 + stats.q2 + stats.q3 + stats.q4 + stats.q5) / (stats.count * 5)).toFixed(2));
    } else {
      req.evalCount = 0;
      req.evalAvg = 0;
    }

    const rStats = regMap[req.eventId];
    if (rStats) {
      req.onsiteTotal = rStats.total;
      req.onsiteCheckedIn = rStats.checkedIn;
      req.onsiteWalkIns = rStats.walkIns;
    } else {
      req.onsiteTotal = 0;
      req.onsiteCheckedIn = 0;
      req.onsiteWalkIns = 0;
    }
  });

  // รวมตัวเลือกอัตโนมัติ (Auto-Learned Options จากประวัติที่เคยบันทึก)
  const optionSets = {
    activityTypes: new Set(['อบรมวิชาการ', 'Workshop เชิงปฏิบัติการ', 'Workshop Hosting', 'ติวนักเรียน', 'สัมมนาวิชาการผู้บริหาร', 'อบรมออนไลน์']),
    courseTopics: new Set(['อบรมคศ.3-4 นวัตกรรมการเรียนรู้', 'Active Learning สู่สมรรถนะผู้เรียน', 'Coding & STEM Education', 'เทคนิคการวัดและประเมินผล', 'AI เพื่อการจัดการเรียนการสอน']),
    speakerTypes: new Set(['อาจารย์ที่ปรึกษา', 'ทีมวิชาการภายใน', 'อาจารย์ภายนอก', 'Supplier/Partner']),
    venueTypes: new Set(['โรงเรียน', 'โรงแรม', 'ออนไลน์ (Zoom/Meet)', 'หอประชุมประจำจังหวัด']),
    teamBSpeakers: new Set(['ศ.ดร.ประสาน ปัญญาเลิศ', 'ดร.สมเกียรติ นวัตกรรม']),
    transportDetails: new Set(['รถตู้รับ-ส่งสนามบิน-โรงแรม', 'รถตู้รับ-ส่งสถานีรถไฟ-โรงเรียน', 'รถตู้บริษัทพร้อมคนขับ'])
  };

  requests.forEach(function(req) {
    if (req.activityType) optionSets.activityTypes.add(req.activityType);
    if (req.courseTopic) optionSets.courseTopics.add(req.courseTopic);
    if (req.speakerType) optionSets.speakerTypes.add(req.speakerType);
    if (req.venueType) optionSets.venueTypes.add(req.venueType);
    if (req.teamBSpeaker) optionSets.teamBSpeakers.add(req.teamBSpeaker);
    if (req.transportDetails) optionSets.transportDetails.add(req.transportDetails);
  });

  const autoOptions = {
    activityTypes: Array.from(optionSets.activityTypes),
    courseTopics: Array.from(optionSets.courseTopics),
    speakerTypes: Array.from(optionSets.speakerTypes),
    venueTypes: Array.from(optionSets.venueTypes),
    teamBSpeakers: Array.from(optionSets.teamBSpeakers),
    transportDetails: Array.from(optionSets.transportDetails)
  };

  // Load Incident_Logs
  const incSheet = ss.getSheetByName('Incident_Logs');
  const incRows = incSheet ? incSheet.getDataRange().getValues() : [];
  const incidentLogs = [];
  for (let i = 1; i < incRows.length; i++) {
    const ir = incRows[i];
    if (ir[0]) {
      incidentLogs.push({
        logId: String(ir[0]),
        eventId: String(ir[1] || ''),
        createdAt: ir[2] ? Utilities.formatDate(new Date(ir[2]), "GMT+7", "yyyy-MM-dd HH:mm") : '',
        category: String(ir[3] || 'GENERAL'),
        severity: String(ir[4] || 'NORMAL'),
        details: String(ir[5] || ''),
        resolution: String(ir[6] || ''),
        operatorName: String(ir[7] || 'Team B')
      });
    }
  }

  // Load Audit_Logs
  const auditSheet = ss.getSheetByName('Audit_Logs');
  const auditRows = auditSheet ? auditSheet.getDataRange().getValues() : [];
  const auditLogs = [];
  for (let i = 1; i < auditRows.length; i++) {
    const ar = auditRows[i];
    if (ar[0]) {
      auditLogs.push({
        logId: String(ar[0]),
        eventId: String(ar[1] || ''),
        createdAt: ar[2] ? Utilities.formatDate(new Date(ar[2]), "GMT+7", "yyyy-MM-dd HH:mm") : '',
        operatorName: String(ar[3] || 'System'),
        actionType: String(ar[4] || 'UPDATE'),
        details: String(ar[5] || ''),
        oldData: ar[6] || '',
        newData: ar[7] || ''
      });
    }
  }

  return {
    masterData: masterData,
    requests: requests.reverse(), // คำขอล่าสุดขึ้นก่อน
    autoOptions: autoOptions,
    systemVersion: SYSTEM_VERSION,
    incidentLogs: incidentLogs,
    auditLogs: auditLogs
  };
}

// ------------------- TEAM A: CREATE / EDIT REQUEST -------------------

function createRequestTeamA(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const now = new Date().toISOString();
  // EDIT_REQUEST_A_CHECK: Support editing request prior to Team B review
  if (payload.eventId) {
    const data = sheet.getDataRange().getValues();
    let targetRowIndex = -1;
    let existingStatus = '';
    let oldValues = null;

    for (let r = 1; r < data.length; r++) {
      if (String(data[r][0]).trim() === String(payload.eventId).trim()) {
        targetRowIndex = r + 1; // 1-based index
        existingStatus = String(data[r][2]).trim();
        oldValues = {
          topic: data[r][4],
          school: data[r][10],
          targetSales: data[r][14],
          estBudget: data[r][15]
        };
        break;
      }
    }

    if (targetRowIndex > -1) {
      if (existingStatus === 'APPROVED' || existingStatus === 'COMPLETED') {
        throw new Error('ไม่อนุญาตให้แก้ไขโครงการที่ได้รับการอนุมัติงบประมาณแล้ว (Status: ' + existingStatus + ') เพื่อความถูกต้องตามระเบียบการเงิน');
      }
      if (existingStatus === 'WAITING_EXEC') {
        throw new Error('คำขอนี้อยู่ระหว่างการพิจารณาอนุมัติของผู้บริหาร ไม่สามารถแก้ไขได้โดยตรง');
      }

      const operator = payload.operatorName || payload.saleName || 'ทีม A (Sales)';
      sheet.getRange(targetRowIndex, 4).setValue(payload.activityType || '');
      sheet.getRange(targetRowIndex, 5).setValue(payload.courseTopic || '');
      sheet.getRange(targetRowIndex, 6).setValue(payload.customTopic || '');
      sheet.getRange(targetRowIndex, 7).setValue(payload.eventDate || '');
      sheet.getRange(targetRowIndex, 8).setValue(payload.province || '');
      sheet.getRange(targetRowIndex, 9).setValue(payload.saleName || '');
      sheet.getRange(targetRowIndex, 10).setValue(payload.schoolId || '');
      sheet.getRange(targetRowIndex, 11).setValue(payload.schoolName || '');
      sheet.getRange(targetRowIndex, 12).setValue(payload.speakerType || '');
      sheet.getRange(targetRowIndex, 13).setValue(payload.venueType || '');
      sheet.getRange(targetRowIndex, 14).setValue(payload.objective || '');
      sheet.getRange(targetRowIndex, 15).setValue(Number(payload.targetSales) || 0);
      sheet.getRange(targetRowIndex, 16).setValue(Number(payload.estBudget) || 0);
      sheet.getRange(targetRowIndex, 23).setValue(operator); // Last_Modified_By
      sheet.getRange(targetRowIndex, 28).setValue(payload.needAccommodation ? 'YES' : 'NO');
      sheet.getRange(targetRowIndex, 29).setValue(Number(payload.roomCount) || 0);
      sheet.getRange(targetRowIndex, 30).setValue(payload.needTransportation ? 'YES' : 'NO');
      sheet.getRange(targetRowIndex, 31).setValue(payload.transportDetails || '');
      sheet.getRange(targetRowIndex, 33).setValue(payload.isOutOfPlan || 'NO');
      sheet.getRange(targetRowIndex, 34).setValue(payload.outOfPlanReason || '');
      sheet.getRange(targetRowIndex, 35).setValue(payload.annualPlanId || '');
      sheet.getRange(targetRowIndex, 36).setValue(Number(payload.expectedTrainees) || 50);
      sheet.getRange(targetRowIndex, 38).setValue(payload.needCatering === 'YES' ? 'YES' : 'NO');
      sheet.getRange(targetRowIndex, 39).setValue(payload.needProductMedia === 'YES' ? 'YES' : 'NO');
      sheet.getRange(targetRowIndex, 40).setValue(payload.otherSupportDetails || '');

      handleLogAuditTrail({
        eventId: payload.eventId,
        operatorName: operator,
        actionType: 'EDIT_REQUEST_A',
        details: 'ทีม A ปรับปรุงคำขอจัดอบรมก่อนทีม B รับงาน',
        oldData: oldValues,
        newData: {
          topic: payload.courseTopic,
          school: payload.schoolName,
          targetSales: payload.targetSales,
          estBudget: payload.estBudget
        }
      });

      return {
        success: true,
        eventId: payload.eventId,
        message: 'อัปเดตคำขอจัดอบรม ' + payload.eventId + ' เรียบร้อยแล้ว'
      };
    }
  }
  
  const eventId = 'EVT-' + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + '-' + Math.floor(1000 + Math.random() * 9000);
  const operator = payload.operatorName || payload.saleName || 'ทีม A (Sales)';

  const expectedTrainees = (payload.expectedTrainees !== undefined && payload.expectedTrainees !== null && payload.expectedTrainees !== '') ? Number(payload.expectedTrainees) : 50;
  const needCatering = payload.needCatering === 'YES' ? 'YES' : 'NO';
  const needProductMedia = payload.needProductMedia === 'YES' ? 'YES' : 'NO';
  const otherSupportDetails = payload.otherSupportDetails || '';
  const speakersJson = JSON.stringify(payload.speakers || []);
  const speakerSig = payload.speakerSignature || (payload.speakers && payload.speakers[0] ? payload.speakers[0].signature : '') || '';

  const rowData = [
    eventId,
    now,
    'WAITING_B',
    payload.activityType || '',
    payload.courseTopic || '',
    payload.customTopic || '',
    payload.eventDate || '',
    payload.province || '',
    payload.saleName || '',
    payload.schoolId || '',
    payload.schoolName || '',
    payload.speakerType || '',
    payload.venueType || '',
    payload.objective || '',
    Number(payload.targetSales) || 0,
    Number(payload.estBudget) || 0,
    '', // TeamB_Speaker
    '', // TeamB_Notes
    0,  // Actual_Budget
    operator, // Created_By
    '',       // Reviewed_By
    '',       // Approved_By
    operator, // Last_Modified_By
    now,      // Submitted_To_B_At
    '',       // Reviewed_By_B_At
    '',       // Approved_At
    '',       // A4_PDF_Url
    payload.needAccommodation ? 'YES' : 'NO',
    Number(payload.roomCount) || 0,
    payload.needTransportation ? 'YES' : 'NO',
    payload.transportDetails || '',
    '', // A4_Docx_Url (col 32)
    payload.isOutOfPlan || 'NO', // Is_Out_Of_Plan (col 33)
    payload.outOfPlanReason || '', // Out_Of_Plan_Reason (col 34)
    payload.annualPlanId || '', // Annual_Plan_ID (col 35)
    expectedTrainees, // Expected_Trainees (col 36)
    expectedTrainees, // Actual_Trainees default (col 37)
    needCatering, // Need_Catering (col 38)
    needProductMedia, // Need_Product_Media (col 39)
    otherSupportDetails, // Other_Support_Details (col 40)
    speakerSig, // Speaker_Signature_Data (col 41)
    speakersJson // Speakers_JSON (col 42)
  ];

  sheet.appendRow(rowData);

  sendWorkflowEmailNotification('TEAM_A_CREATED', { eventId: eventId, schoolName: payload.schoolName, province: payload.province, courseTopic: payload.courseTopic || payload.customTopic, eventDate: payload.eventDate, estBudget: payload.estBudget, targetSales: payload.targetSales, saleName: payload.saleName || operator, isOutOfPlan: payload.isOutOfPlan || 'NO', outOfPlanReason: payload.outOfPlanReason || '' });

  logSystemAction(eventId, 'TEAM_A_CREATE', operator, {
    estBudget: payload.estBudget,
    targetSales: payload.targetSales,
    schoolName: payload.schoolName
  });

  return { success: true, eventId: eventId };
}

// ------------------- TEAM B: REVIEW & CONFIRM -------------------

function updateReviewTeamB(payload) {
  const { eventId, decision, teamBSpeaker, teamBNotes, actualBudget, operatorName, actualTrainees, speakerSignature, speakers } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const operator = operatorName || 'เจ้าหน้าที่วิชาการ (ทีม B)';

  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) throw new Error('ไม่พบรหัสคำขอ ' + eventId);

  const nextStatus = decision === 'RETURN_TO_A' ? 'RETURNED_TO_A' : 'WAITING_EXEC';

  sheet.getRange(targetRow, 3).setValue(nextStatus);
  sheet.getRange(targetRow, 17).setValue(teamBSpeaker || '');
  sheet.getRange(targetRow, 18).setValue(teamBNotes || '');
  sheet.getRange(targetRow, 19).setValue(Number(actualBudget) || 0);
  sheet.getRange(targetRow, 21).setValue(operator);
  sheet.getRange(targetRow, 23).setValue(operator);
  sheet.getRange(targetRow, 25).setValue(now); // Reviewed_By_B_At

  // Col 37: Actual_Trainees (ทีม B ปรับยอดผู้เข้าร่วมจริง)
  if (actualTrainees !== undefined && actualTrainees !== null && actualTrainees !== '') {
    sheet.getRange(targetRow, 37).setValue(Number(actualTrainees) || 0);
  }
  // Col 41: Speaker_Signature_Data
  if (speakerSignature) {
    sheet.getRange(targetRow, 41).setValue(speakerSignature);
  }
  // Col 42: Speakers_JSON
  if (speakers && Array.isArray(speakers) && speakers.length > 0) {
    sheet.getRange(targetRow, 42).setValue(JSON.stringify(speakers));
  }

  logSystemAction(eventId, decision === 'RETURN_TO_A' ? 'TEAM_B_RETURN' : 'TEAM_B_CONFIRM', operator, {
    status: nextStatus,
    actualBudget: actualBudget,
    teamBSpeaker: teamBSpeaker
  });

  return { success: true, eventId: eventId, newStatus: nextStatus };
}

// ------------------- TEAM B: ACTUAL EXPENSES SETTLEMENT (7 หมวด) -------------------

function handleSaveExpenses(payload) {
  const { eventId, actualExpenses, actualBudget, operatorName } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const operator = operatorName || 'ฝ่ายพัฒนาวิชาการ (ทีม B)';

  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) throw new Error('ไม่พบรหัสคำขอ ' + eventId);

  // ปรับสถานะเป็น COMPLETED (ปิดงานสมบูรณ์) และบันทึกยอดงบตัดจ่ายจริง 7 หมวด
  sheet.getRange(targetRow, 3).setValue('COMPLETED');
  if (actualBudget !== undefined && actualBudget !== null) {
    sheet.getRange(targetRow, 19).setValue(Number(actualBudget) || 0); // Col 19: Actual_Budget
  }
  sheet.getRange(targetRow, 23).setValue(operator); // Last_Modified_By
  
  // บันทึก JSON ค่าใช้จ่ายจริง 7 หมวดลงใน Column 36 (Actual_Expenses_JSON)
  const expensesJson = JSON.stringify(actualExpenses || {});
  sheet.getRange(targetRow, 36).setValue(expensesJson);

  logSystemAction(eventId, 'SETTLE_EXPENSES', operator, {
    actualBudget: actualBudget,
    actualExpenses: actualExpenses
  });

  return {
    success: true,
    eventId: eventId,
    status: 'COMPLETED',
    actualBudget: actualBudget,
    actualExpenses: actualExpenses
  };
}

// ------------------- EXECUTIVE: APPROVAL / REJECTION -------------------

function handleExecDecision(payload) {
  const { eventId, decision, approvedBy, rejectReason } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const operator = approvedBy || 'ผู้บริหาร (Management)';

  let targetRow = -1;
  let eventRow = null;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      targetRow = i + 1;
      eventRow = data[i];
      break;
    }
  }

  if (targetRow === -1) throw new Error('ไม่พบรหัสคำขอ ' + eventId);

  if (decision === 'REJECT') {
    sheet.getRange(targetRow, 3).setValue('REJECTED');
    sheet.getRange(targetRow, 22).setValue(operator);
    sheet.getRange(targetRow, 23).setValue(operator);
    sheet.getRange(targetRow, 26).setValue(now);

    logSystemAction(eventId, 'EXEC_REJECT', operator, { reason: rejectReason || 'ไม่อนุมัติ' });
    return { success: true, eventId: eventId, status: 'REJECTED' };
  }

  // กรณีอนุมัติ (APPROVE)
  // 1. ออกรหัสลับ Token ป้องกันข้อมูลรั่วไหล (Zero-Trust)
  const token = Utilities.getUuid().replace(/-/g, '').substring(0, 16);
  const tokenSheet = ss.getSheetByName('QR_Tokens');
  const courseName = eventRow[4] === 'อื่นๆ' ? eventRow[5] : eventRow[4];
  const speakerName = eventRow[16] || eventRow[11] || 'วิทยากรผู้ทรงคุณวุฒิ';
  const eventDate = eventRow[6] ? Utilities.formatDate(new Date(eventRow[6]), "GMT+7", "yyyy-MM-dd") : '';
  const expiresAt = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();

  tokenSheet.appendRow([
    token,
    eventId,
    courseName,
    speakerName,
    eventDate,
    expiresAt,
    'ACTIVE'
  ]);

  // 2. สร้างเอกสาร Memo A4 PDF ลง Google Drive
  let pdfUrl = '';
  try {
    pdfUrl = generateA4MemoPDF(eventRow, operator);
  } catch (pdfErr) {
    pdfUrl = 'PDF_GEN_ERROR: ' + pdfErr.toString();
  }

  // 3. ปรับสถานะเป็น APPROVED และบันทึก Audit
  sheet.getRange(targetRow, 3).setValue('APPROVED');
  sheet.getRange(targetRow, 22).setValue(operator);
  sheet.getRange(targetRow, 23).setValue(operator);
  sheet.getRange(targetRow, 26).setValue(now);
  sheet.getRange(targetRow, 27).setValue(pdfUrl);

  logSystemAction(eventId, 'EXEC_APPROVE', operator, {
    tokenIssued: token,
    pdfUrl: pdfUrl
  });

  return {
    success: true,
    eventId: eventId,
    status: 'APPROVED',
    token: token,
    pdfUrl: pdfUrl
  };
}

// ------------------- ZERO-TRUST SURVEY VALIDATION & SUBMISSION -------------------

function validateAndGetSurveyData(token) {
  const ss = getSpreadsheet();
  const tokenSheet = ss.getSheetByName('QR_Tokens');
  if (!tokenSheet) return { valid: false, message: 'ระบบยังไม่พร้อมให้บริการ' };

  const data = tokenSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      const status = data[i][6];
      const expiresAt = new Date(data[i][5]);
      if (status !== 'ACTIVE' || (expiresAt && expiresAt < new Date())) {
        return { valid: false, message: 'ลิงก์การประเมินนี้หมดอายุหรือถูกปิดแล้ว' };
      }
      return {
        valid: true,
        token: token,
        courseTitle: data[i][2],
        speakerName: data[i][3],
        eventDate: data[i][4] ? Utilities.formatDate(new Date(data[i][4]), "GMT+7", "dd/MM/yyyy") : '-'
      };
    }
  }
  return { valid: false, message: 'ไม่พบรหัสโครงการ หรือลิงก์การประเมินไม่ถูกต้อง' };
}

function submitEvaluationResponse(payload) {
  const { token, q1, q2, q3, q4, q5, suggestions, clientHash } = payload;
  const ss = getSpreadsheet();
  const tokenSheet = ss.getSheetByName('QR_Tokens');
  const tokenData = tokenSheet.getDataRange().getValues();

  let targetEventId = null;
  for (let i = 1; i < tokenData.length; i++) {
    if (tokenData[i][0] === token && tokenData[i][6] === 'ACTIVE') {
      targetEventId = tokenData[i][1];
      break;
    }
  }

  if (!targetEventId) throw new Error('Token ไม่ถูกต้อง หรือหมดอายุแล้ว');

  const evalSheet = ss.getSheetByName('Evaluation_Responses');
  
  // ตรวจจับ Duplicate จาก Client Hash หากส่งมา
  if (clientHash) {
    const evalData = evalSheet.getDataRange().getValues();
    for (let i = 1; i < evalData.length; i++) {
      if (evalData[i][1] === targetEventId && evalData[i][9] === clientHash) {
        throw new Error('ท่านได้ส่งแบบประเมินสำหรับกิจกรรมนี้เรียบร้อยแล้ว ขอบคุณครับ');
      }
    }
  }

  const responseId = 'RES-' + new Date().getTime();
  evalSheet.appendRow([
    responseId,
    targetEventId,
    new Date().toISOString(),
    Number(q1) || 5,
    Number(q2) || 5,
    Number(q3) || 5,
    Number(q4) || 5,
    Number(q5) || 5,
    suggestions || '',
    clientHash || ''
  ]);

  return { success: true, responseId: responseId };
}

// ------------------- AUDIT LOGGING -------------------

function logSystemAction(eventId, action, actionBy, detailsObj) {
  try {
    const ss = getSpreadsheet();
    const logSheet = ss.getSheetByName('System_Logs');
    if (!logSheet) return;
    const logId = 'LOG-' + new Date().getTime();
    logSheet.appendRow([
      logId,
      eventId || '',
      action,
      actionBy || 'SYSTEM',
      new Date().toISOString(),
      JSON.stringify(detailsObj || {})
    ]);
  } catch (e) {
    Logger.log('Log Error: ' + e.toString());
  }
}

// ------------------- PDF MEMO ENGINE (A4 / SARABUN FONT) -------------------

function generateA4MemoPDF(eventRow, approvedBy) {
  const eventId = eventRow[0];
  const createdAtFormatted = eventRow[1] ? Utilities.formatDate(new Date(eventRow[1]), "GMT+7", "dd/MM/yyyy") : '-';
  const eventDateFormatted = eventRow[6] ? Utilities.formatDate(new Date(eventRow[6]), "GMT+7", "dd/MM/yyyy") : '-';
  const courseTopic = eventRow[4] === 'อื่นๆ' ? (eventRow[5] || eventRow[4]) : eventRow[4];
  const schoolDisplay = (eventRow[10] || '-') + (eventRow[9] ? ' (' + eventRow[9] + ')' : '');
  const estBudgetNum = Number(eventRow[15]) || 0;
  const actualBudgetNum = Number(eventRow[18]) || estBudgetNum;
  const targetSalesNum = Number(eventRow[14]) || 0;

  const costRatio = targetSalesNum > 0 ? ((actualBudgetNum / targetSalesNum) * 100).toFixed(1) : 'N/A';

  const needAccom = eventRow[27] === 'YES' || eventRow[27] === 'ต้องการ';
  const roomCount = Number(eventRow[28]) || 0;
  const accomDisplay = needAccom ? `ต้องการห้องพัก (${roomCount} ห้อง)` : 'ไม่ต้องการห้องพัก';

  const needTrans = eventRow[29] === 'YES' || eventRow[29] === 'ต้องการ';
  const transDetails = eventRow[30] || '';
  const transDisplay = needTrans ? `ต้องการรถรับ-ส่ง ${transDetails ? '(' + transDetails + ')' : ''}` : 'ไม่ต้องการรถรับ-ส่ง';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page { size: A4 portrait; margin: 18mm; }
        body { font-family: 'Sarabun', sans-serif; font-size: 13pt; line-height: 1.4; color: #1f2937; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
        .org-title { font-size: 18pt; font-weight: bold; color: #1e3a8a; }
        .doc-title { font-size: 15pt; font-weight: 600; margin-top: 4px; color: #374151; }
        .doc-meta { font-size: 11pt; color: #6b7280; margin-top: 4px; }
        .table-section { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 16px; }
        .table-section th, .table-section td { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 12pt; }
        .table-section th { background-color: #f3f4f6; text-align: left; font-weight: 600; }
        .highlight-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 14px 0; font-size: 12pt; }
        .sign-grid { width: 100%; border-collapse: collapse; margin-top: 36px; text-align: center; font-size: 12pt; }
        .sign-grid td { padding: 8px; vertical-align: bottom; }
        .stamp-status { border: 2px solid #16a34a; color: #16a34a; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="org-title">บันทึกข้อความขออนุมัติจัดกิจกรรมและจัดสรรงบประมาณ</div>
        <div class="doc-title">EMS Enterprise Training & Workshop Approval Memo</div>
        <div class="doc-meta">รหัสคำขอ: <strong>${eventId}</strong> | วันที่ทำรายการ: ${createdAtFormatted} | สถานะ: <span class="stamp-status">APPROVED</span></div>
      </div>

      <table class="table-section">
        <tr>
          <th width="25%">ประเภทกิจกรรม</th>
          <td width="75%">${eventRow[3] || '-'} - <strong>${courseTopic}</strong></td>
        </tr>
        <tr>
          <th>หน่วยงาน/โรงเรียน (PPC)</th>
          <td>${schoolDisplay} | <strong>จังหวัด:</strong> ${eventRow[7] || '-'}</td>
        </tr>
        <tr>
          <th>วันที่จัดกิจกรรม</th>
          <td>${eventDateFormatted} | <strong>สถานที่:</strong> ${eventRow[12] || '-'}</td>
        </tr>
        <tr>
          <th>ผู้แทนขายผู้ดูแล (ทีม A)</th>
          <td>${eventRow[8] || '-'}</td>
        </tr>
        <tr>
          <th>วัตถุประสงค์เชิงกลยุทธ์</th>
          <td>${eventRow[13] || '-'}</td>
        </tr>
        <tr>
          <th>ที่พักและยานพาหนะ</th>
          <td><strong>ห้องพัก:</strong> ${accomDisplay} &nbsp;|&nbsp; <strong>รถรับ-ส่ง:</strong> ${transDisplay}</td>
        </tr>
      </table>

      <table class="table-section">
        <thead>
          <tr>
            <th width="34%">รายการตรวจสอบ</th>
            <th width="33%">ข้อเสนอเบื้องต้น (ทีม A)</th>
            <th width="33%">การกลั่นกรองวิชาการ (ทีม B)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>วิทยากรผู้บรรยาย</strong></td>
            <td>${eventRow[11] || '-'}</td>
            <td><strong style="color:#2563eb;">${eventRow[16] || '-'}</strong></td>
          </tr>
          <tr>
            <td><strong>งบประมาณที่ขอ / ตัดจ่าย</strong></td>
            <td>${estBudgetNum.toLocaleString()} บาท</td>
            <td><strong style="color:#16a34a;">${actualBudgetNum.toLocaleString()} บาท</strong></td>
          </tr>
          <tr>
            <td><strong>เป้าหมายยอดขายอ้างอิง</strong></td>
            <td>${targetSalesNum.toLocaleString()} บาท</td>
            <td>Cost-to-Sales: <strong>${costRatio}%</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="highlight-box">
        <strong>ความเห็นและข้อเสนอแนะเพิ่มเติมจากฝ่ายวิชาการ (ทีม B):</strong><br>
        ${eventRow[17] || 'หลักสูตรและวิทยากรมีความพร้อม สอดคล้องตามมาตรฐานวิชาการ'}
      </div>

      <table class="sign-grid">
        <tr>
          <td width="33%">
            ................................................<br>
            ( ${eventRow[19] || eventRow[8] || 'ผู้แทนขาย'} )<br>
            <strong>ผู้ขออนุมัติ (ทีม A)</strong><br>
            <span style="font-size: 10pt; color: #6b7280;">วันที่: ${createdAtFormatted}</span>
          </td>
          <td width="33%">
            ................................................<br>
            ( ${eventRow[20] || 'ฝ่ายวิชาการ/ปฏิบัติการ'} )<br>
            <strong>ผู้ตรวจสอบ (ทีม B)</strong><br>
            <span style="font-size: 10pt; color: #6b7280;">ผ่านการตรวจสอบวิชาการ</span>
          </td>
          <td width="33%">
            ................................................<br>
            ( ${approvedBy || 'ผู้มีอำนาจลงนาม'} )<br>
            <strong>ผู้อนุมัติ (ผู้บริหาร)</strong><br>
            <span style="font-size: 10pt; color: #6b7280;">อนุมัติเมื่อ: ${Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm")}</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = Utilities.newBlob(html, 'text/html', eventId + '_Memo.html').getAs('application/pdf');
  const file = DriveApp.createFile(blob).setName(eventId + '_Approval_Memo.pdf');
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    // โดเมนองค์กรบางแห่งอาจปิดสิทธิ์ ANYONE_WITH_LINK ให้ข้ามโดยไม่ให้ฟังก์ชันพัง
  }
  return file.getUrl();
}

// ------------------- ADMIN CONTROLLER (PASSWORD: admin0000) -------------------

function verifyAdmin(password) {
  const ss = getSpreadsheet();
  const setSheet = ss.getSheetByName('System_Settings');
  let validPass = DEFAULT_ADMIN_PASS;

  if (setSheet) {
    const data = setSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'ADMIN_PASS' && data[i][1]) {
        validPass = String(data[i][1]).trim();
        break;
      }
    }
  }

  if (password !== validPass) {
    throw new Error('รหัสผ่าน Admin ไม่ถูกต้อง');
  }
  return true;
}

function handleAdminLogin(payload) {
  verifyAdmin(payload.password);
  return { authorized: true, message: 'เข้าสู่ระบบ Admin สำเร็จ' };
}

function handleAdminInitSheets(payload) {
  verifyAdmin(payload.password);
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  return { success: true, message: 'ตรวจสอบและสร้างโครงสร้าง Sheet ทั้ง 6 แผ่นเรียบร้อยแล้ว' };
}

function handleAdminGetLogs(payload) {
  verifyAdmin(payload.password);
  const ss = getSpreadsheet();
  const logSheet = ss.getSheetByName('System_Logs');
  if (!logSheet) return { logs: [] };

  const data = logSheet.getDataRange().getValues();
  const logs = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    logs.push({
      logId: data[i][0],
      eventId: data[i][1],
      action: data[i][2],
      actionBy: data[i][3],
      timestamp: data[i][4],
      details: data[i][5]
    });
  }
  return { logs: logs.reverse().slice(0, 100) };
}

function handleAdminUpdateSettings(payload) {
  verifyAdmin(payload.password);
  const ss = getSpreadsheet();
  const setSheet = ss.getSheetByName('System_Settings');
  if (!setSheet) ensureRequiredSheets(ss);

  if (payload.newPassword) {
    setSheet.appendRow(['ADMIN_PASS', payload.newPassword, 'รหัสผ่านเข้าหลังบ้าน', new Date().toISOString()]);
  }

  logSystemAction('ADMIN', 'UPDATE_SETTINGS', 'ADMIN', { update: 'Settings modified' });
  return { success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' };
}

// ------------------- SCHEMA AUTO-INITIALIZATION -------------------

function ensureRequiredSheets(ss) {
  const required = [
    {
      name: 'PPC_Master',
      headers: ['Zone_ID', 'Province', 'Sale_ID', 'Sale_Name', 'School_ID', 'School_Name', 'Account_Tier']
    },
    {
      name: 'Event_Requests',
      headers: [
        'Event_ID', 'Created_At', 'Status', 'Activity_Type', 'Course_Topic', 'Custom_Topic',
        'Event_Date', 'Province', 'Sale_Name', 'School_ID', 'School_Name', 'Speaker_Type',
        'Venue_Type', 'Objective', 'Target_Sales', 'Est_Budget', 'TeamB_Speaker', 'TeamB_Notes',
        'Actual_Budget', 'Created_By', 'Reviewed_By', 'Approved_By', 'Last_Modified_By',
        'Submitted_To_B_At', 'Reviewed_By_B_At', 'Approved_At', 'A4_PDF_Url',
        'Need_Accommodation', 'Room_Count', 'Need_Transportation', 'Transport_Details', 'A4_Docx_Url', 'Is_Out_Of_Plan', 'Out_Of_Plan_Reason', 'Annual_Plan_ID',
        'Expected_Trainees', 'Actual_Trainees', 'Need_Catering', 'Need_Product_Media', 'Other_Support_Details', 'Speaker_Signature_Data', 'Speakers_JSON'
      ]
    },
    {
      name: 'Onsite_Registrations',
      headers: ['Reg_ID', 'Event_ID', 'Timestamp', 'Name_TH', 'Name_EN', 'School_Name', 'Email', 'Phone', 'Checkin_Status', 'Checkin_Time', 'Reg_Type']
    },
    {
      name: 'QR_Tokens',
      headers: ['Token_ID', 'Event_ID', 'Course_Title', 'Speaker_Name', 'Event_Date', 'Expires_At', 'Status']
    },
    {
      name: 'Annual_Plans',
      headers: ['Plan_ID', 'Seq_No', 'Title', 'Target_Audience', 'Principle_Budget', 'Target_Sales', 'Quarter_Or_Date', 'Approver_Name', 'Approver_Role', 'Status', 'Notes', 'Created_At']
    },
    {
      name: 'Evaluation_Responses',
      headers: ['Response_ID', 'Event_ID', 'Timestamp', 'Score_Q1', 'Score_Q2', 'Score_Q3', 'Score_Q4', 'Score_Q5', 'Suggestions', 'Client_Hash']
    },
    {
      name: 'System_Logs',
      headers: ['Log_ID', 'Event_ID', 'Action', 'Action_By', 'Timestamp', 'Details']
    },
    {
      name: 'System_Settings',
      headers: ['Setting_Key', 'Setting_Value', 'Description', 'Updated_At']
    }
  ];

  required.forEach(function(item) {
    let sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
      sheet.appendRow(item.headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, item.headers.length)
        .setBackground('#1e3a8a')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    } else {
      // ตรวจสอบและอัปเกรดคอลัมน์ใหม่หากชีตเดิมมีคอลัมน์ไม่ครบ
      const lastCol = sheet.getLastColumn();
      if (lastCol < item.headers.length) {
        for (let c = lastCol; c < item.headers.length; c++) {
          sheet.getRange(1, c + 1).setValue(item.headers[c])
            .setBackground('#1e3a8a')
            .setFontColor('#ffffff')
            .setFontWeight('bold');
        }
      }
    }
  });

  // ตรวจสอบและสร้างชีตสรุปภาพรวม KPI ของ PPC
  if (typeof createPpcSummarySheet === 'function') {
    createPpcSummarySheet(ss, '#08539E', '#FFFFFF');
  }
}


// ==========================================
// WORKFLOW NOTIFICATION SETTINGS & HELPER
// ==========================================
const NOTIFICATION_CONFIG = {
  ENABLE_EMAIL: true,
  // ระบุอีเมลทีมวิชาการ (ทีม B) เพื่อรับแจ้งเตือนเมื่อทีม A สร้างคำขอ
  ACADEMIC_TEAM_EMAIL: '', 
  // ระบุอีเมลผู้บริหาร (ผศ.อินทิรา บุนนาค / ผู้จัดการทั่วไป) เพื่อรับแจ้งเตือนเมื่อทีม B ตรวจสอบผ่าน
  EXECUTIVE_EMAIL: '',
  // URL หน้าเว็บระบบ TWP เพื่อสร้างลิงก์ตรงในอีเมล
  WEB_APP_URL: '' 
};

function sendWorkflowEmailNotification(type, data) {
  try {
    if (!NOTIFICATION_CONFIG.ENABLE_EMAIL) return;
    const scriptProps = PropertiesService.getScriptProperties();
    const academicEmail = NOTIFICATION_CONFIG.ACADEMIC_TEAM_EMAIL || scriptProps.getProperty('ACADEMIC_TEAM_EMAIL') || '';
    const execEmail = NOTIFICATION_CONFIG.EXECUTIVE_EMAIL || scriptProps.getProperty('EXECUTIVE_EMAIL') || '';
    const appUrl = NOTIFICATION_CONFIG.WEB_APP_URL || scriptProps.getProperty('WEB_APP_URL') || '';

    if (type === 'TEAM_A_CREATED' && academicEmail) {
      const directLink = appUrl ? (appUrl + (appUrl.includes('?') ? '&' : '?') + 'tab=teamB&eventId=' + data.eventId) : '';
      MailApp.sendEmail({
        to: academicEmail,
        subject: '🔔 [TWP Training] มีคำขอจัดอบรมใหม่รอตรวจสอบ: ' + (data.schoolName || '') + ' (' + data.eventId + ')',
        htmlBody: '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">' +
          '<h2 style="color: #08539E; margin-top: 0;">คำขอจัดอบรมใหม่รอฝ่ายวิชาการ (ทีม B) ตรวจสอบ</h2>' +
          '<p><strong>รหัสคำขอ:</strong> ' + data.eventId + '</p>' +
          '<p><strong>โรงเรียน:</strong> ' + (data.schoolName || '') + ' (' + (data.province || '') + ')</p>' +
          '<p><strong>หัวข้ออบรม:</strong> ' + (data.courseTopic || '') + '</p>' +
          '<p><strong>วันที่จัดงาน:</strong> ' + (data.eventDate || '-') + '</p>' +
          '<p><strong>งบประมาณที่ขอ:</strong> ฿' + Number(data.estBudget || 0).toLocaleString() + ' บาท</p>' +
          '<p><strong>ผู้เสนอขอ:</strong> ' + (data.saleName || '-') + '</p>' +
          (directLink ? '<p style="margin-top: 20px;"><a href="' + directLink + '" style="background-color: #08539E; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold;">คลิกเพื่อเปิดตรวจงานทันที</a></p>' : '') +
          '</div>'
      });
    } else if (type === 'TEAM_B_APPROVED' && execEmail) {
      const directLink = appUrl ? (appUrl + (appUrl.includes('?') ? '&' : '?') + 'tab=exec&eventId=' + data.eventId) : '';
      MailApp.sendEmail({
        to: execEmail,
        subject: '📑 [TWP Training] คำขอจัดอบรมผ่านการตรวจสอบ รอท่านอนุมัติ: ' + (data.schoolName || '') + ' (' + data.eventId + ')',
        htmlBody: '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">' +
          '<h2 style="color: #08539E; margin-top: 0;">คำขอจัดอบรมรอท่านพิจารณาลงนามอนุมัติ</h2>' +
          '<p><strong>รหัสคำขอ:</strong> ' + data.eventId + '</p>' +
          '<p><strong>โรงเรียน:</strong> ' + (data.schoolName || '') + ' (' + (data.province || '') + ')</p>' +
          '<p><strong>หัวข้ออบรม:</strong> ' + (data.courseTopic || '') + '</p>' +
          '<p><strong>วิทยากร:</strong> ' + (data.teamBSpeaker || '-') + '</p>' +
          '<p><strong>งบประมาณตัดจ่ายจริง:</strong> ฿' + Number(data.actualBudget || 0).toLocaleString() + ' บาท</p>' +
          '<p><strong>ความเห็นฝ่ายวิชาการ:</strong> ' + (data.teamBNotes || '-') + '</p>' +
          (directLink ? '<p style="margin-top: 20px;"><a href="' + directLink + '" style="background-color: #d97706; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold;">คลิกเพื่อพิจารณาและลงนามอนุมัติ</a></p>' : '') +
          '</div>'
      });
    }
  } catch(err) {
    Logger.log('sendWorkflowEmailNotification error: ' + err.message);
  }
}

// ==========================================
// E-CERTIFICATE PARTICIPANT EMAIL DISPATCHER
// ==========================================
function handleSendECertificateEmail(payload) {
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
  }

  const recipient = (payload.email || '').trim();
  const nameTh = payload.nameTh || 'ผู้เข้าร่วมการอบรม';
  const nameEn = payload.nameEn || '';
  const school = payload.school || '-';
  const courseTopic = payload.courseTopic || 'หลักสูตรพัฒนาศักยภาพครูผู้สอน';
  const certId = payload.certId || ('TWP-ECERT-' + Date.now());
  const eventDate = payload.eventDate || new Date().toLocaleDateString('th-TH');
  const token = payload.token || '';
  const speakerName = payload.speakerName || '';
  const driveUrl = payload.driveUrl || 'https://drive.google.com/drive/u/0/folders/1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk';
  
  // Real QR code image for Google Drive materials
  const driveQrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(driveUrl);

  // Direct Certificate Web URL: Bypasses survey Step 1 and lands directly on locked completed e-Certificate
  const certWebUrl = 'https://doit-on.github.io/twp-training-system/survey.html'
    + '?step=2'
    + '&view=cert'
    + '&cert=' + encodeURIComponent(certId)
    + '&name=' + encodeURIComponent(nameTh)
    + (nameEn ? '&nameEn=' + encodeURIComponent(nameEn) : '')
    + '&school=' + encodeURIComponent(school)
    + '&topic=' + encodeURIComponent(courseTopic)
    + '&date=' + encodeURIComponent(eventDate)
    + (speakerName ? '&speaker=' + encodeURIComponent(speakerName) : '')
    + '&t=' + encodeURIComponent(token);

  const subject = '🏅 วุฒิบัตรการฝึกอบรม (e-Certificate): ' + nameTh + ' - สำนักพิมพ์ไทยวัฒนาพานิช จำกัด';

  const htmlBody = 
    '<div style="background-color: #0f172a; padding: 24px 12px; font-family: \'Sarabun\', Tahoma, Arial, sans-serif;">' +
      '<div style="max-width: 780px; margin: 0 auto;">' +
        
        '<!-- Verified Alert Header -->' +
        '<div style="background: #10b981; color: #ffffff; padding: 10px 16px; border-radius: 12px 12px 0 0; font-size: 13px; font-weight: bold; text-align: center; letter-spacing: 0.3px;">' +
          '✓ วุฒิบัตรการฝึกอบรมพัฒนาวิชาชีพทางการศึกษา (Official e-Certificate) • ฉบับจริงสมบูรณ์' +
        '</div>' +

        '<!-- THE OFFICIAL E-CERTIFICATE SHEET (A4 LANDSCAPE RATIO) -->' +
        '<div style="background: #ffffff; border: 8px solid #08539E; outline: 3px solid #C5A059; outline-offset: -5px; padding: 36px 28px; text-align: center; box-shadow: 0 12px 36px rgba(0,0,0,0.35); position: relative;">' +
          
          '<!-- TWP Official 3-Ring Logo -->' +
          '<div style="margin-bottom: 8px;">' +
            '<img src="https://raw.githubusercontent.com/doit-on/twp-training-system/main/assets/logo.png" alt="TWP Logo" style="height: 60px; width: auto; display: inline-block;">' +
          '</div>' +

          '<!-- Publisher Headline -->' +
          '<div style="font-size: 24px; font-weight: 900; color: #08539E; letter-spacing: 0.5px; line-height: 1.2; margin-bottom: 2px;">' +
            'สำนักพิมพ์ไทยวัฒนาพานิช' +
          '</div>' +
          '<div style="font-size: 10.5px; font-weight: bold; color: #64748b; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px;">' +
            'THAI WATANA PANICH PUBLISHING HOUSE' +
          '</div>' +

          '<!-- Certificate Title -->' +
          '<div style="font-size: 17px; font-weight: bold; color: #b45309; margin-bottom: 2px;">' +
            'วุฒิบัตรการฝึกอบรมพัฒนาวิชาชีพทางการศึกษา' +
          '</div>' +
          '<div style="font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 14px;">' +
            'Certificate of Professional Educational Development' +
          '</div>' +

          '<div style="font-size: 13px; color: #475569; margin-bottom: 8px;">' +
            'วุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า' +
          '</div>' +

          '<!-- PARTICIPANT NAME (PROMINENT & VERIFIED IN CERTIFICATE) -->' +
          '<div style="font-size: 28px; font-weight: 900; color: #08539E; line-height: 1.25; margin: 8px 0 4px 0;">' +
            nameTh +
          '</div>' +
          (nameEn ? '<div style="font-size: 16px; font-weight: bold; color: #334155; font-style: italic; margin-bottom: 4px;">' + nameEn + '</div>' : '') +
          
          '<div style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 16px;">' +
            school +
          '</div>' +

          '<!-- COURSE & ACHIEVEMENT DETAILS -->' +
          '<div style="font-size: 13px; color: #334155; margin-bottom: 6px;">' +
            'ได้ผ่านการฝึกอบรมเชิงปฏิบัติการตามโครงการพัฒนาศักยภาพครูผู้สอน หลักสูตร:' +
          '</div>' +
          '<div style="font-size: 19px; font-weight: 900; color: #08539E; margin-bottom: 10px; line-height: 1.4; padding: 0 10px;">' +
            '“' + courseTopic + '”' +
          '</div>' +
          '<div style="font-size: 12.5px; color: #64748b; margin-bottom: 22px;">' +
            'ให้ไว้ ณ วันที่ ' + eventDate +
          '</div>' +

          '<!-- SIGNATURES, GOLD BADGE & VERIFICATION TABLE -->' +
          '<table style="width: 100%; border-top: 1.5px solid #e2e8f0; padding-top: 16px; margin-top: 14px;" cellpadding="0" cellspacing="0">' +
            '<tr>' +
              '<!-- Speaker Signatory -->' +
              '<td style="width: 35%; text-align: center; vertical-align: bottom;">' +
                '<div style="height: 38px; line-height: 38px;">' +
                  '<span style="font-family: cursive, \'Brush Script MT\', sans-serif; font-size: 19px; color: #08539E; font-weight: bold;">' +
                    (speakerName || 'ศ.ดร.ประสาน ปัญญาเลิศ') +
                  '</span>' +
                '</div>' +
                '<div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-top: 4px;">' + (speakerName || 'ศ.ดร.ประสาน ปัญญาเลิศ') + '</div>' +
                '<div style="font-size: 11px; color: #64748b;">วิทยากรประจำหลักสูตร</div>' +
                '<div style="font-size: 10px; color: #94a3b8;">ฝ่ายพัฒนาวิชาการและนวัตกรรมการเรียนรู้</div>' +
              '</td>' +

              '<!-- Center: Gold Medal Seal & Cert ID -->' +
              '<td style="width: 30%; text-align: center; vertical-align: middle;">' +
                '<div style="display: inline-block; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 50%; width: 56px; height: 56px; line-height: 54px; text-align: center; font-size: 26px; box-shadow: 0 2px 8px rgba(245,158,11,0.3);">' +
                  '🏅' +
                '</div>' +
                '<div style="font-size: 9px; font-family: monospace; font-weight: bold; color: #08539E; margin-top: 5px;">' +
                  'CERT NO: ' + certId +
                '</div>' +
              '</td>' +

              '<!-- Executive Signatory -->' +
              '<td style="width: 35%; text-align: center; vertical-align: bottom;">' +
                '<div style="height: 38px; line-height: 38px;">' +
                  '<span style="font-family: cursive, \'Brush Script MT\', sans-serif; font-size: 20px; color: #08539E; font-weight: bold;">' +
                    'ผศ.อินทิรา บุนนาค' +
                  '</span>' +
                '</div>' +
                '<div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-top: 4px;">ผศ.อินทิรา บุนนาค</div>' +
                '<div style="font-size: 11px; color: #64748b;">กรรมการผู้จัดการ</div>' +
                '<div style="font-size: 10px; color: #08539E; font-weight: bold;">บริษัท ไทยวัฒนาพานิช จำกัด</div>' +
              '</td>' +
            '</tr>' +
          '</table>' +

          '<!-- Certificate Footnote -->' +
          '<table style="width: 100%; border-top: 1px solid #f1f5f9; margin-top: 16px; padding-top: 8px; font-size: 9.5px; color: #94a3b8;" cellpadding="0" cellspacing="0">' +
            '<tr>' +
              '<td style="text-align: left;">วุฒิบัตรอิเล็กทรอนิกส์ออกตามมาตรฐานการอบรม สำนักพิมพ์ไทยวัฒนาพานิช จำกัด</td>' +
              '<td style="text-align: right;">เอกสารนี้ได้รับการรับรองความถูกต้องแล้ว</td>' +
            '</tr>' +
          '</table>' +

        '</div>' +

        '<!-- DIRECT ACTION: PRINT / SAVE PDF -->' +
        '<div style="text-align: center; margin: 18px 0 14px 0;">' +
          '<a href="' + certWebUrl + '" target="_blank" style="background: #08539E; color: #ffffff; padding: 13px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14.5px; display: inline-block; box-shadow: 0 4px 12px rgba(8,83,158,0.3);">' +
            '🖨️ พิมพ์ / บันทึก PDF (A4 แนวนอน)' +
          '</a>' +
          '<div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">' +
            '* ท่านสามารถบันทึกภาพวุฒิบัตรด้านบนไปใช้งานได้ทันที หรือกดปุ่มนี้เพื่อเปิดพิมพ์เป็นไฟล์ PDF แนวนอน (ไม่มีการกรอกข้อมูลซ้ำ)' +
          '</div>' +
        '</div>' +

        '<!-- GOOGLE DRIVE TRAINING MATERIALS BLOCK WITH QR CODE -->' +
        '<div style="background: #ffffff; border: 2px solid #fcd34d; border-radius: 14px; padding: 20px; margin-top: 18px;">' +
          '<table style="width: 100%;" cellpadding="0" cellspacing="0">' +
            '<tr>' +
              '<td style="width: 140px; text-align: center; vertical-align: middle;">' +
                '<img src="' + driveQrImageUrl + '" alt="QR Drive" style="width: 120px; height: 120px; border: 2px solid #f59e0b; border-radius: 8px; background: #ffffff; padding: 4px; display: block; margin: 0 auto;">' +
                '<div style="font-size: 10px; color: #92400e; font-weight: bold; margin-top: 5px;">สแกนเปิด Google Drive</div>' +
              '</td>' +
              '<td style="padding-left: 20px; vertical-align: middle; text-align: left;">' +
                '<div style="font-size: 16px; font-weight: 900; color: #92400e; margin-bottom: 4px;">' +
                  '📁 คลังสื่อและเอกสารประกอบการอบรม (Google Drive)' +
                '</div>' +
                '<div style="font-size: 13px; color: #78350f; line-height: 1.5; margin-bottom: 12px;">' +
                  'ท่านสามารถสแกน QR Code ด้านข้าง หรือคลิกปุ่มด้านล่างเพื่อดาวน์โหลดสไลด์บรรยาย คู่มือการจัดกิจกรรม และภาพถ่ายกิจกรรมความละเอียดสูงได้ทันที' +
                '</div>' +
                '<a href="' + driveUrl + '" target="_blank" style="background: #d97706; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 2px 6px rgba(217,119,6,0.3);">' +
                  '📂 เข้าสู่ Google Drive เพื่อดาวน์โหลดไฟล์ & สื่อการสอน &raquo;' +
                '</a>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</div>' +

        '<!-- Footer -->' +
        '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #334155; font-size: 11.5px; color: #64748b; text-align: center;">' +
          'บริษัท ไทยวัฒนาพานิช จำกัด • ศูนย์ฝึกอบรมและพัฒนาวิชาชีพครู (TWP Training Center)<br>' +
          'ระบบจัดส่งวุฒิบัตรอิเล็กทรอนิกส์อัตโนมัติ (EMS Enterprise v' + SYSTEM_VERSION + ')' +
        '</div>' +
      '</div>' +
    '</div>';

  const mailOptions = {
    to: recipient,
    subject: subject,
    htmlBody: htmlBody,
    name: 'สำนักพิมพ์ไทยวัฒนาพานิช จำกัด (TWP Training Center)'
  };

  // สามารถระบุอีเมลผู้ส่งเพิ่มเติมได้หากบัญชีได้ตั้งค่า Send As Alias ไว้ (เช่น skillboostenglish@gmail.com)
  if (payload.fromEmail) {
    mailOptions.from = payload.fromEmail;
  }

  MailApp.sendEmail(mailOptions);

  return {
    sent: true,
    recipient: recipient,
    certId: certId,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// ONSITE REGISTRATION & HYBRID ATTENDANCE CHECK-IN ENGINE (v1.19.1)
// ============================================================================

function handleGetEventRegistrations(payload) {
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
    if (!eventId || rowEid === eventId) {
      const isCheckedIn = (r[8] === 'CHECKED_IN');
      const isWalkIn = (r[10] === 'WALK_IN');
      if (isCheckedIn) checkedInCount++;
      if (isWalkIn) walkInCount++;

      registrations.push({
        regId: r[0],
        eventId: r[1],
        timestamp: r[2],
        nameTh: r[3],
        nameEn: r[4],
        schoolName: r[5],
        email: r[6],
        phone: r[7],
        checkinStatus: r[8] || 'PENDING',
        checkinTime: r[9] || '',
        regType: r[10] || 'PRE_REGISTERED',
        rowIndex: i + 1
      });
    }
  }

  // Lookup event metadata from Requests sheet
  let eventInfo = null;
  try {
    const reqSheet = ss.getSheetByName('Requests');
    if (reqSheet && eventId) {
      const reqRows = reqSheet.getDataRange().getValues();
      for (let j = 1; j < reqRows.length; j++) {
        if (String(reqRows[j][0] || '').trim().toUpperCase() === eventId) {
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
  };
}

function handleCheckinParticipant(payload) {
  const { regId, eventId } = payload;
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  if (!sheet) throw new Error('ไม่พบชีต Onsite_Registrations');

  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  let found = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === regId) {
      sheet.getRange(i + 1, 9).setValue('CHECKED_IN');
      sheet.getRange(i + 1, 10).setValue(now);
      found = true;
      break;
    }
  }

  if (!found) throw new Error('ไม่พบรหัสผู้ลงทะเบียน: ' + regId);
  return { success: true, regId: regId, checkinTime: now };
}

function handleRegisterWalkin(payload) {
  const { eventId, nameTh, nameEn, schoolName, email, phone } = payload;
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  const now = new Date().toISOString();
  const regId = 'REG-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

  const row = [
    regId,
    eventId || 'GENERAL',
    now,
    nameTh || '',
    nameEn || '',
    schoolName || '',
    email || '',
    phone || '',
    'CHECKED_IN',
    now,
    'WALK_IN'
  ];

  sheet.appendRow(row);
  return { success: true, regId: regId, checkinTime: now, nameTh: nameTh };
}

function handleBatchImportRegistrations(payload) {
  const eventId = payload ? payload.eventId : '';
  const participants = (payload && (payload.participants || payload.attendees)) || [];
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new Error('ไม่พบข้อมูลรายชื่อสำหรับนำเข้า');
  }

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Onsite_Registrations');
  const now = new Date().toISOString();

  const rows = participants.map((p, idx) => [
    'REG-' + Date.now().toString().slice(-5) + '-' + (idx + 1),
    eventId || 'GENERAL',
    now,
    p.nameTh || p.name || '',
    p.nameEn || '',
    p.schoolName || p.school || '',
    p.email || '',
    p.phone || '',
    'PENDING',
    '',
    'PRE_REGISTERED'
  ]);

  if (rows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  }

  return { success: true, importedCount: rows.length };
}

function handleUpdateTeamBAttendees(payload) {
  const { eventId, actualTrainees, operatorName } = payload;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const data = sheet.getDataRange().getValues();
  const operator = operatorName || 'ทีม B (วิชาการ)';

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventId) {
      sheet.getRange(i + 1, 37).setValue(Number(actualTrainees) || 0);
      sheet.getRange(i + 1, 23).setValue(operator);
      return { success: true, eventId: eventId, actualTrainees: actualTrainees };
    }
  }
  throw new Error('ไม่พบรหัสคำขอ: ' + eventId);
}

/**
 * ฟังก์ชันสำหรับกด "เรียกใช้" (Run) ในหน้า Google Apps Script 1 ครั้ง
 * เพื่ออนุมัติสิทธิ์ (Authorize Permissions) ให้กับ MailApp.sendEmail
 */
function testMailAuthorization() {
  const quota = MailApp.getRemainingDailyQuota();
  const myEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  if (myEmail) {
    MailApp.sendEmail({
      to: myEmail,
      subject: '[TWP] ทดสอบการอนุมัติสิทธิ์ส่งอีเมลวุฒิบัตร (Authorization Test)',
      body: 'ยินดีด้วยครับ! สิทธิ์ MailApp.sendEmail ได้รับการอนุมัติเรียบร้อยแล้ว\nโควตาส่งอีเมลวันนี้คงเหลือ: ' + quota + ' ฉบับ\nระบบ e-Certificate สามารถส่งอีเมลให้ผู้เข้าอบรมได้ทันทีแล้วครับ'
    });
  }
  Logger.log('MailApp Authorization SUCCESS! Remaining daily quota: ' + quota);
  return 'สิทธิ์การส่งอีเมลได้รับการอนุมัติเรียบร้อยแล้ว โควตาคงเหลือวันนี้: ' + quota + ' ฉบับ';
}

function authorizeMail() {
  return testMailAuthorization();
}


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


// ============================================================================
// ANNUAL MASTER PLANS ENGINE (ผศ.อินทิรา บุนนาค อนุมัติหลักการ)
// ============================================================================

function handleGetAnnualPlans() {
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) return { plans: [] };

  const rows = sheet.getDataRange().getValues();
  const plans = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r[0]) {
      plans.push({
        planId: r[0],
        seqNo: Number(r[1]) || (i),
        title: r[2] || '',
        targetAudience: r[3] || '',
        principleBudget: Number(r[4]) || 0,
        targetSales: Number(r[5]) || 0,
        quarterOrDate: r[6] || '',
        approverName: r[7] || 'ผศ.อินทิรา บุนนาค',
        approverRole: r[8] || 'กรรมการผู้จัดการ',
        status: r[9] || 'APPROVED_PRINCIPLE',
        notes: r[10] || '',
        createdAt: r[11] || ''
      });
    }
  }

  // Sort by seqNo
  plans.sort((a, b) => a.seqNo - b.seqNo);
  return { plans: plans, total: plans.length };
}

function handleSaveAnnualPlans(payload) {
  const plans = payload ? (payload.plans || (payload.plan ? [payload.plan] : [])) : [];
  if (!Array.isArray(plans) || plans.length === 0) {
    throw new Error('ไม่พบข้อมูลโครงการอนุมัติหลักการสำหรับบันทึก');
  }

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  let sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) {
    sheet = ss.insertSheet('Annual_Plans');
    sheet.appendRow(['Plan_ID', 'Seq_No', 'Title', 'Target_Audience', 'Principle_Budget', 'Target_Sales', 'Quarter_Or_Date', 'Approver_Name', 'Approver_Role', 'Status', 'Notes', 'Created_At']);
  }

  // Re-write rows safely
  const existingHeaders = sheet.getRange(1, 1, 1, 12).getValues()[0];
  sheet.clearContents();
  sheet.appendRow(existingHeaders);

  const now = new Date().toISOString();
  const rows = plans.map(p => [
    p.planId || ('PLAN-2569-' + String(p.seqNo).padStart(2, '0')),
    p.seqNo || 1,
    p.title || '',
    p.targetAudience || '',
    Number(p.principleBudget) || 0,
    Number(p.targetSales) || 0,
    p.quarterOrDate || '',
    p.approverName || 'ผศ.อินทิรา บุนนาค',
    p.approverRole || 'กรรมการผู้จัดการ',
    p.status || 'APPROVED_PRINCIPLE',
    p.notes || '',
    p.createdAt || now
  ]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 12).setValues(rows);
  }

  return { success: true, savedCount: rows.length };
}

function handleDeleteAnnualPlan(payload) {
  const planId = payload ? payload.planId : '';
  if (!planId) throw new Error('กรุณาระบุ planId ที่ต้องการลบ');

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) return { success: true };

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(planId).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, deletedPlanId: planId };
    }
  }

  return { success: false, message: 'ไม่พบรหัสโครงการ: ' + planId };
}
