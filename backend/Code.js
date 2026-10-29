/**
 * ============================================================================
 * EMS Enterprise - Training Workflow & Closed-Loop Evaluation System
 * Version: 1.0.0
 * Architecture: Google Apps Script Backend (Serverless) + Google Sheets Database
 * Security: Zero-Trust Data Isolation + Multi-Operator Stamping + Concurrency Lock
 * ============================================================================
 */

const SYSTEM_VERSION = '1.1.0';
const DEFAULT_ADMIN_PASS = 'admin0000';

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * WebApp View Dispatcher & Ping Endpoint
 */
function doGet(e) {
  // รองรับการ Ping แบบเบาผ่าน GET สำหรับทดสอบ Latency
  if (e && e.parameter && e.parameter.action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'SUCCESS',
      action: 'ping',
      version: SYSTEM_VERSION,
      serverTime: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const token = e && e.parameter ? e.parameter.t : null;

  // โหมดหน้าประเมินสำหรับผู้เข้าอบรม (Public Zero-Trust Survey)
  if (token) {
    const surveyData = validateAndGetSurveyData(token);
    const template = HtmlService.createTemplateFromFile('SurveyView');
    template.eventData = surveyData;
    template.systemVersion = SYSTEM_VERSION;
    return template.evaluate()
      .setTitle('แบบประเมินความพึงพอใจการจัดอบรม | EMS Enterprise')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // โหมดหน้าหลักระบบบริหารจัดการภายใน (Internal Workflow Portal)
  const template = HtmlService.createTemplateFromFile('Index');
  template.systemVersion = SYSTEM_VERSION;
  return template.evaluate()
    .setTitle('ระบบบริหารคำขอจัดอบรมและประเมินผล (EMS Enterprise v' + SYSTEM_VERSION + ')')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

  // ดึง Event Requests
  const reqSheet = ss.getSheetByName('Event_Requests');
  const reqRows = reqSheet.getDataRange().getValues();
  const requests = [];

  for (let i = 1; i < reqRows.length; i++) {
    const r = reqRows[i];
    if (!r[0]) continue;
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

  return {
    masterData: masterData,
    requests: requests.reverse(), // คำขอล่าสุดขึ้นก่อน
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
    payload.transportDetails || ''
  ];

  sheet.appendRow(rowData);

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
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
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
        'Need_Accommodation', 'Room_Count', 'Need_Transportation', 'Transport_Details'
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
}
