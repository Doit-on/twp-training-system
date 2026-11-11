/**
 * ============================================================================
 * EMS Enterprise - Training Center TWP
 * Version: 1.5.0
 * Architecture: Google Apps Script Backend (Serverless) + Google Sheets Database
 * Security: Zero-Trust Data Isolation + Multi-Operator Stamping + Concurrency Lock
 * Features: Multi-Device Sync + Team QR Pairing + PPC Standard A4 Report Engine (PDF & Word .docx)
 * ============================================================================
 */

const SYSTEM_VERSION = '1.18.1';
const DEFAULT_ADMIN_PASS = 'admin0000';

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
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
    message: 'Google Apps Script Web App ทำงานอย่างสมบูรณ์ พร้อมรับคำสั่ง doPost จากระบบ v1.9.0 เรียบร้อยแล้ว'
  }, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * API Gateway รองรับคำสั่งจาก Antigravity Single-Page Application (SPA)
 */
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

  // ผูกคะแนนเฉลี่ยลงใน Requests
  requests.forEach(function(req) {
    const stats = evalMap[req.eventId];
    if (stats && stats.count > 0) {
      req.evalCount = stats.count;
      req.evalAvg = Number(((stats.q1 + stats.q2 + stats.q3 + stats.q4 + stats.q5) / (stats.count * 5)).toFixed(2));
    } else {
      req.evalCount = 0;
      req.evalAvg = 0;
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

  return {
    masterData: masterData,
    requests: requests.reverse(), // คำขอล่าสุดขึ้นก่อน
    autoOptions: autoOptions,
    systemVersion: SYSTEM_VERSION
  };
}

// ------------------- TEAM A: CREATE / EDIT REQUEST -------------------

function createRequestTeamA(payload) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Event_Requests');
  const now = new Date().toISOString();
  
  const eventId = 'EVT-' + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + '-' + Math.floor(1000 + Math.random() * 9000);
  const operator = payload.operatorName || payload.saleName || 'ทีม A (Sales)';

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
    '', // A4_Docx_Url (col 31)
    payload.isOutOfPlan || 'NO', // Is_Out_Of_Plan (col 32)
    payload.outOfPlanReason || '', // Out_Of_Plan_Reason (col 33)
    payload.annualPlanId || '' // Annual_Plan_ID (col 34)
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
  const { eventId, decision, teamBSpeaker, teamBNotes, actualBudget, operatorName } = payload;
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
        'Need_Accommodation', 'Room_Count', 'Need_Transportation', 'Transport_Details', 'A4_Docx_Url', 'Is_Out_Of_Plan', 'Out_Of_Plan_Reason', 'Annual_Plan_ID'
      ]
    },
    {
      name: 'QR_Tokens',
      headers: ['Token_ID', 'Event_ID', 'Course_Title', 'Speaker_Name', 'Event_Date', 'Expires_At', 'Status']
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
  if (!payload || !payload.email) {
    throw new Error('กรุณาระบุอีเมลผู้รับ');
  }

  const recipient = payload.email.trim();
  const nameTh = payload.nameTh || 'ผู้เข้าร่วมการอบรม';
  const nameEn = payload.nameEn || '';
  const school = payload.school || '-';
  const courseTopic = payload.courseTopic || 'หลักสูตรพัฒนาศักยภาพครูผู้สอน';
  const certId = payload.certId || ('TWP-ECERT-' + Date.now());
  const eventDate = payload.eventDate || new Date().toLocaleDateString('th-TH');
  const token = payload.token || '';
  const driveUrl = 'https://drive.google.com/drive/u/0/folders/1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk';
  const certWebUrl = 'https://doit-on.github.io/twp-training-system/survey.html?t=' + encodeURIComponent(token);

  const subject = '🏅 วุฒิบัตรการฝึกอบรม (e-Certificate): ' + nameTh + ' - สำนักพิมพ์ไทยวัฒนาพานิช จำกัด';

  const htmlBody = 
    '<div style="font-family: \'Sarabun\', Tahoma, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">' +
      '<!-- Header -->' +
      '<div style="background: #08539E; padding: 24px 20px; text-align: center; color: #ffffff;">' +
        '<div style="display: inline-block; background: #ffffff; color: #08539E; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 8px; margin-bottom: 8px;">TWP</div>' +
        '<h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">สำนักพิมพ์ไทยวัฒนาพานิช จำกัด</h2>' +
        '<div style="font-size: 11px; opacity: 0.9; margin-top: 3px; letter-spacing: 1.5px; color: #e0f2fe;">THAI WATANA PANICH PUBLISHING HOUSE</div>' +
      '</div>' +
      
      '<!-- Body Content -->' +
      '<div style="padding: 28px 24px; color: #1e293b; line-height: 1.65;">' +
        '<div style="display: inline-block; background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #bfdbfe;">' +
          '✓ บันทึกผลการประเมินและออกวุฒิบัตรเรียบร้อยแล้ว' +
        '</div>' +
        
        '<h3 style="color: #08539E; margin-top: 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">' +
          'วุฒิบัตรการฝึกอบรมพัฒนาวิชาชีพทางการศึกษา' +
        '</h3>' +
        
        '<p style="font-size: 15px; margin: 12px 0 6px 0;">เรียน <strong>' + nameTh + '</strong> ' + (nameEn ? '(' + nameEn + ')' : '') + '</p>' +
        '<p style="font-size: 14px; color: #475569; margin-top: 0;">' +
          'สำนักพิมพ์ไทยวัฒนาพานิช จำกัด ขอแสดงความยินดีและขอบพระคุณท่านที่ได้เข้าร่วมการอบรมเชิงปฏิบัติการและตอบแบบประเมินผลโครงการ' +
        '</p>' +
        
        '<!-- Certificate Data Card -->' +
        '<div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 18px 0; font-size: 13.5px;">' +
          '<div style="margin-bottom: 8px;"><strong>หลักสูตร:</strong> <span style="color: #08539E; font-weight: bold;">' + courseTopic + '</span></div>' +
          '<div style="margin-bottom: 8px;"><strong>หน่วยงาน / โรงเรียน:</strong> ' + school + '</div>' +
          '<div style="margin-bottom: 8px;"><strong>วันที่จัดอบรม:</strong> ' + eventDate + '</div>' +
          '<div><strong>เลขที่วุฒิบัตร (Cert No.):</strong> <span style="font-family: monospace; font-weight: bold; color: #08539E; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">' + certId + '</span></div>' +
        '</div>' +
        
        '<!-- Action Buttons -->' +
        '<div style="text-align: center; margin: 26px 0; display: flex; flex-direction: column; gap: 10px;">' +
          '<a href="' + certWebUrl + '" style="background: #08539E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(8,83,158,0.25);">' +
            '🖨️ คลิกเพื่อเปิดดูและพิมพ์วุฒิบัตร (A4 แนวนอน)' +
          '</a>' +
          '<br>' +
          '<a href="' + driveUrl + '" style="background: #f59e0b; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block; margin-top: 6px;">' +
            '📁 เข้าสู่คลัง Google Drive ดาวน์โหลดสไลด์และเอกสารอบรม' +
          '</a>' +
        '</div>' +
        
        '<p style="font-size: 13px; color: #64748b; line-height: 1.6;">' +
          '* วุฒิบัตรฉบับนี้ออกอย่างเป็นทางการโดย บริษัท ไทยวัฒนาพานิช จำกัด ได้รับการลงนามรับรองความถูกต้องโดย <strong>ผศ.อินทิรา บุนนาค (กรรมการผู้จัดการ)</strong> และวิทยากรประจำหลักสูตร ท่านสามารถจัดเก็บอีเมลนี้ไว้เป็นหลักฐานอ้างอิงการฝึกอบรมได้ตลอดเวลา' +
        '</p>' +
        
        '<!-- Footer -->' +
        '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #94a3b8; text-align: center;">' +
          'บริษัท ไทยวัฒนาพานิช จำกัด • ศูนย์ฝึกอบรมและพัฒนาวิชาชีพครู (TWP Training Center)<br>' +
          'ระบบจัดส่งวุฒิบัตรอิเล็กทรอนิกส์อัตโนมัติ (EMS Enterprise v' + SYSTEM_VERSION + ')' +
        '</div>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: htmlBody
  });

  // Log dispatch event to System_Logs
  try {
    const ss = getSpreadsheet();
    let logSheet = ss.getSheetByName('System_Logs');
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'SEND_ECERTIFICATE_EMAIL',
        'SYSTEM',
        recipient,
        'SUCCESS',
        'ส่งวุฒิบัตรไปยัง ' + recipient + ' (' + certId + ')'
      ]);
    }
  } catch(e) {}

  return {
    sent: true,
    recipient: recipient,
    certId: certId,
    timestamp: new Date().toISOString()
  };
}

/**
 * ฟังก์ชันสำหรับกด "เรียกใช้" (Run) ในหน้า Google Apps Script 1 ครั้ง
 * เพื่ออนุมัติสิทธิ์ (Authorize Permissions) ให้กับ MailApp.sendEmail
 */
function testMailAuthorization() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log('MailApp Authorization SUCCESS! Remaining daily quota: ' + quota);
  return 'สิทธิ์การส่งอีเมลได้รับการอนุมัติเรียบร้อยแล้ว โควตาคงเหลือวันนี้: ' + quota + ' ฉบับ';
}
