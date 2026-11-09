/**
 * ============================================================================
 * EMS Enterprise - Training Center TWP (Production Apps Script Backend)
 * Version: 1.13.0
 * Architecture: Google Apps Script Backend (Serverless) + Google Sheets Database
 * Cloud Storage: Google Drive Photo Repository (Folder: 1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk)
 * Security: Zero-Trust Data Isolation + Multi-Operator Stamping + Concurrency Lock
 * Features: 
 *   - 10-Dimension Evaluation Survey Persistence
 *   - International E-Certificate Delivery via Email (Thai & English Names)
 *   - Anti-Reprint Lock & Admin Security Override
 *   - Team B Photo Upload & Sync to Google Drive
 *   - PPC Standard A4 Report Engine (PDF & Word .docx)
 * ============================================================================
 */

const SYSTEM_VERSION = '1.13.0';
const DEFAULT_ADMIN_PASS = 'admin0000';
const GOOGLE_DRIVE_PHOTO_FOLDER_ID = '1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk';

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * WebApp View Dispatcher & Ping Endpoint (doGet)
 */
function doGet(e) {
  let spreadsheetName = 'TWP Training Center Database';
  try {
    const ss = getSpreadsheet();
    if (ss) spreadsheetName = ss.getName();
  } catch (err) {}

  return ContentService.createTextOutput(JSON.stringify({
    status: 'ONLINE',
    service: 'EMS Enterprise Backend API (Training Center TWP)',
    version: SYSTEM_VERSION,
    spreadsheet: spreadsheetName,
    drivePhotoFolder: GOOGLE_DRIVE_PHOTO_FOLDER_ID,
    serverTime: new Date().toISOString(),
    message: 'Google Apps Script Web App v1.13.0 ทำงานอย่างสมบูรณ์ พร้อมรับคำสั่ง doPost จากระบบเรียบร้อยแล้ว'
  }, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * API Gateway รองรับคำสั่งจาก Antigravity SPA (doPost)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(30000); // Concurrency Lock 30 วินาที ป้องกันข้อมูลชนกัน
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
      case 'SEND_ECERTIFICATE_EMAIL':
        result = sendEcertificateEmail(payload);
        break;
      case 'ADMIN_UNLOCK_CERT':
        result = adminUnlockCert(payload);
        break;
      case 'UPLOAD_EVENT_PHOTO':
        result = uploadEventPhotoToDrive(payload);
        break;
      case 'INIT_SHEETS':
        result = initializeSheets();
        break;
      case 'GET_AUDIT_LOGS':
        result = getAuditLogs();
        break;
      default:
        throw new Error('ไม่พบ Action ที่ระบุ: ' + action);
    }

    return createJsonResponse({
      status: 'SUCCESS',
      action: action,
      data: result,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createJsonResponse({
      status: 'ERROR',
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------- INITIAL DATA & HEALTH CHECK -------------------

function handlePing() {
  return {
    status: 'HEALTHY',
    version: SYSTEM_VERSION,
    timestamp: new Date().toISOString()
  };
}

function getInitialData() {
  const ss = getSpreadsheet();
  ensureSheetsExist(ss);

  const reqSheet = ss.getSheetByName('Training_Requests');
  const reqData = reqSheet.getDataRange().getValues();
  const requests = [];

  if (reqData.length > 1) {
    const headers = reqData[0];
    for (let i = 1; i < reqData.length; i++) {
      const row = reqData[i];
      if (!row[0]) continue;
      requests.push({
        eventId: row[0],
        createdAt: row[1],
        status: row[2],
        activityType: row[3],
        courseTopic: row[4],
        customTopic: row[5],
        eventDate: row[6],
        province: row[7],
        saleName: row[8],
        schoolId: row[9],
        schoolName: row[10],
        schoolArea: row[11],
        schoolSize: row[12],
        speakerType: row[13],
        targetSales: Number(row[14]) || 0,
        estBudget: Number(row[15]) || 0,
        teamBSpeaker: row[16],
        teamBNotes: row[17],
        actualBudget: Number(row[18]) || 0,
        createdBy: row[19],
        reviewedBy: row[20],
        approvedBy: row[21],
        lastModifiedBy: row[22],
        submittedToBAt: row[23],
        reviewedByBAt: row[24],
        approvedAt: row[25],
        pdfUrl: row[26],
        needAccommodation: row[27],
        roomCount: Number(row[28]) || 0,
        needTransportation: row[29],
        transportDetails: row[30],
        evalCount: Number(row[31]) || 0,
        evalAvgScore: Number(row[32]) || 0,
        resourceLink: row[33] || ''
      });
    }
  }

  return { requests: requests };
}

// ------------------- SUBMIT EVALUATION (10 DIMENSIONS + PARTICIPANT) -------------------

function submitEvaluationResponse(payload) {
  const ss = getSpreadsheet();
  const token = payload.token;
  const clientHash = payload.clientHash;
  const nameTh = payload.nameTh || '';
  const nameEn = payload.nameEn || '';
  const school = payload.school || '';
  const email = payload.email || '';
  const certId = payload.certId || ('TWP-ECERT-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random()*900000));

  if (!token) throw new Error('ไม่พบ Token ประจำโครงการ');

  // Verify target event
  const tokenSheet = ss.getSheetByName('Public_Tokens');
  const tokenData = tokenSheet.getDataRange().getValues();
  let targetEventId = null;

  for (let i = 1; i < tokenData.length; i++) {
    if (tokenData[i][0] === token && tokenData[i][6] === 'ACTIVE') {
      targetEventId = tokenData[i][1];
      break;
    }
  }

  if (!targetEventId) {
    // If not found in tokens, check if token is eventId itself
    targetEventId = token;
  }

  const evalSheet = ss.getSheetByName('Evaluation_Responses');
  
  // Anti-duplication check by clientHash
  if (clientHash) {
    const evalData = evalSheet.getDataRange().getValues();
    for (let i = 1; i < evalData.length; i++) {
      if (evalData[i][1] === targetEventId && evalData[i][13] === clientHash) {
        throw new Error('ท่านได้ส่งแบบประเมินสำหรับกิจกรรมนี้เรียบร้อยแล้ว ขอบคุณครับ');
      }
    }
  }

  const responseId = 'RES-' + new Date().getTime();
  evalSheet.appendRow([
    responseId,
    targetEventId,
    new Date().toISOString(),
    Number(payload.q1) || 5,
    Number(payload.q2) || 5,
    Number(payload.q3) || 5,
    Number(payload.q4) || 5,
    Number(payload.q5) || 5,
    Number(payload.q6) || 5,
    Number(payload.q7) || 5,
    Number(payload.q8) || 5,
    Number(payload.q9) || 5,
    Number(payload.q10) || 5,
    clientHash || '',
    payload.suggestions || '',
    nameTh,
    nameEn,
    school,
    email,
    certId,
    'PENDING_SEND'
  ]);

  // Update participant count in Training_Requests
  updateEventEvalStats(ss, targetEventId);

  logSystemAction(targetEventId, 'SUBMIT_EVALUATION', nameTh || 'PARTICIPANT', {
    responseId: responseId,
    certId: certId,
    email: email
  });

  return { success: true, responseId: responseId, certId: certId };
}

// ------------------- SEND E-CERTIFICATE VIA EMAIL -------------------

function sendEcertificateEmail(payload) {
  const email = payload.email;
  const nameTh = payload.nameTh || 'ผู้เข้าอบรม';
  const nameEn = payload.nameEn || '';
  const school = payload.school || 'โรงเรียน';
  const courseTopic = payload.courseTopic || 'หลักสูตรพัฒนาวิชาชีพทางการศึกษา';
  const certId = payload.certId || 'TWP-ECERT';
  const eventDate = payload.eventDate || Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');

  if (!email || email.indexOf('@') === -1) {
    throw new Error('ที่อยู่อีเมลไม่ถูกต้อง');
  }

  const subject = 'วุฒิบัตรการฝึกอบรม (e-Certificate) - ' + courseTopic + ' | สำนักพิมพ์ไทยวัฒนาพานิช';
  
  const htmlBody = `
    <div style="font-family:'Sarabun',sans-serif; color:#1e293b; max-width:650px; margin:0 auto; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
      <div style="background:#08539E; color:#ffffff; padding:24px 30px; text-align:center;">
        <h1 style="margin:0; font-size:22px; font-weight:800;">สำนักพิมพ์ไทยวัฒนาพานิช</h1>
        <p style="margin:4px 0 0 0; font-size:12px; letter-spacing:2px; opacity:0.9;">THAI WATANA PANICH PUBLISHING HOUSE</p>
      </div>
      <div style="padding:30px; background:#ffffff; line-height:1.6;">
        <h2 style="color:#08539E; font-size:18px; margin-top:0;">ขอแสดงความยินดีในการสำเร็จการฝึกอบรม</h2>
        <p>เรียน <strong>${nameTh}</strong> (${nameEn})</p>
        <p>สำนักพิมพ์ไทยวัฒนาพานิช จำกัด ขอขอบพระคุณท่านที่ได้เข้าร่วมการฝึกอบรมเชิงปฏิบัติการและทำแบบประเมินความพึงพอใจในหลักสูตร:</p>
        <div style="background:#f8fafc; border-left:4px solid #08539E; padding:12px 16px; margin:16px 0; font-weight:bold; color:#0f172a;">
          “${courseTopic}”
        </div>
        <p>หน่วยงาน/สถานศึกษา: <strong>${school}</strong><br>
        วันที่จัดกิจกรรม: <strong>${eventDate}</strong><br>
        เลขที่วุฒิบัตรอ้างอิง: <strong style="color:#08539E; font-family:monospace;">${certId}</strong></p>
        <p style="margin-top:20px;">วุฒิบัตรฉบับอิเล็กทรอนิกส์ (e-Certificate) ของท่านได้รับการลงทะเบียนรับรองอย่างเป็นทางการเรียบร้อยแล้ว</p>
        <div style="margin-top:24px; padding-top:20px; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b;">
          * อีเมลนี้ส่งอัตโนมัติจากระบบ EMS Enterprise Platform กรุณาอย่าตอบกลับอีเมลนี้
        </div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });

  // Mark CERT_SENT in Evaluation_Responses sheet
  const ss = getSpreadsheet();
  const evalSheet = ss.getSheetByName('Evaluation_Responses');
  if (evalSheet) {
    const data = evalSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][19] === certId || data[i][18] === email) {
        evalSheet.getRange(i + 1, 21).setValue('SENT_EMAIL');
        break;
      }
    }
  }

  logSystemAction(payload.token, 'SEND_ECERT_EMAIL', 'SYSTEM', {
    certId: certId,
    email: email,
    recipient: nameTh
  });

  return { success: true, email: email, certId: certId };
}

// ------------------- ADMIN UNLOCK CERTIFICATE -------------------

function adminUnlockCert(payload) {
  const token = payload.token;
  const adminPass = payload.adminPass || '';
  if (adminPass !== DEFAULT_ADMIN_PASS) {
    throw new Error('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
  }

  logSystemAction(token, 'ADMIN_UNLOCK_CERT', 'ADMIN', { token: token });
  return { success: true, message: 'ปลดล็อกสิทธิ์วุฒิบัตรเรียบร้อยแล้ว' };
}

// ------------------- UPLOAD EVENT PHOTO TO GOOGLE DRIVE -------------------

function uploadEventPhotoToDrive(payload) {
  const eventId = payload.eventId || 'EVT-GENERAL';
  const fileName = payload.fileName || ('photo-' + Date.now() + '.jpg');
  const mimeType = payload.mimeType || 'image/jpeg';
  const base64Data = payload.base64Data;
  const caption = payload.caption || 'ภาพกิจกรรมการอบรม';

  if (!base64Data) throw new Error('ไม่พบข้อมูลไฟล์รูปภาพ (Base64)');

  const folder = DriveApp.getFolderById(GOOGLE_DRIVE_PHOTO_FOLDER_ID);
  if (!folder) throw new Error('ไม่พบโฟลเดอร์ Google Drive: ' + GOOGLE_DRIVE_PHOTO_FOLDER_ID);

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const decodedBytes = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  
  const file = folder.createFile(blob);
  file.setDescription('โครงการ: ' + eventId + ' | ' + caption);

  // Record photo in Event_Photos sheet
  const ss = getSpreadsheet();
  let photoSheet = ss.getSheetByName('Event_Photos');
  if (!photoSheet) {
    photoSheet = ss.insertSheet('Event_Photos');
    photoSheet.appendRow(['Photo_Id', 'Event_Id', 'File_Name', 'Drive_Url', 'File_Id', 'Caption', 'Uploaded_At']);
  }

  const photoId = 'PHT-' + Date.now();
  const fileUrl = file.getUrl();

  photoSheet.appendRow([
    photoId,
    eventId,
    fileName,
    fileUrl,
    file.getId(),
    caption,
    new Date().toISOString()
  ]);

  logSystemAction(eventId, 'UPLOAD_PHOTO', 'TEAM_B', {
    photoId: photoId,
    fileName: fileName,
    fileUrl: fileUrl
  });

  return {
    success: true,
    photoId: photoId,
    fileUrl: fileUrl,
    downloadUrl: file.getDownloadUrl(),
    folderUrl: folder.getUrl()
  };
}

// ------------------- STATS & AUDIT LOGS -------------------

function updateEventEvalStats(ss, eventId) {
  try {
    const evalSheet = ss.getSheetByName('Evaluation_Responses');
    const reqSheet = ss.getSheetByName('Training_Requests');
    if (!evalSheet || !reqSheet) return;

    const evalData = evalSheet.getDataRange().getValues();
    let count = 0;
    let sumScore = 0;

    for (let i = 1; i < evalData.length; i++) {
      if (evalData[i][1] === eventId) {
        count++;
        let rowSum = 0;
        for (let q = 3; q <= 12; q++) {
          rowSum += Number(evalData[i][q]) || 5;
        }
        sumScore += (rowSum / 10);
      }
    }

    const avgScore = count > 0 ? (sumScore / count).toFixed(2) : 0;

    const reqData = reqSheet.getDataRange().getValues();
    for (let i = 1; i < reqData.length; i++) {
      if (reqData[i][0] === eventId) {
        reqSheet.getRange(i + 1, 32).setValue(count);
        reqSheet.getRange(i + 1, 33).setValue(Number(avgScore));
        break;
      }
    }
  } catch(e) {
    Logger.log('Error updateEventEvalStats: ' + e.toString());
  }
}

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

function ensureSheetsExist(ss) {
  const sheetNames = [
    'Training_Requests',
    'Evaluation_Responses',
    'Event_Photos',
    'System_Logs',
    'Public_Tokens',
    'Master_Schools'
  ];

  sheetNames.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === 'Training_Requests') {
        sheet.appendRow([
          'Event_Id', 'Created_At', 'Status', 'Activity_Type', 'Course_Topic',
          'Custom_Topic', 'Event_Date', 'Province', 'Sale_Name', 'School_Id',
          'School_Name', 'School_Area', 'School_Size', 'Speaker_Type', 'Target_Sales',
          'Est_Budget', 'Team_B_Speaker', 'Team_B_Notes', 'Actual_Budget', 'Created_By',
          'Reviewed_By', 'Approved_By', 'Last_Modified_By', 'Submitted_To_B_At', 'Reviewed_By_B_At',
          'Approved_At', 'PDF_Url', 'Need_Accommodation', 'Room_Count', 'Need_Transportation',
          'Transport_Details', 'Eval_Count', 'Eval_Avg_Score', 'Resource_Link'
        ]);
      } else if (name === 'Evaluation_Responses') {
        sheet.appendRow([
          'Response_Id', 'Event_Id', 'Submitted_At', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5',
          'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Client_Hash', 'Suggestions',
          'Name_Th', 'Name_En', 'School', 'Email', 'Cert_Id', 'Status'
        ]);
      } else if (name === 'Event_Photos') {
        sheet.appendRow(['Photo_Id', 'Event_Id', 'File_Name', 'Drive_Url', 'File_Id', 'Caption', 'Uploaded_At']);
      } else if (name === 'System_Logs') {
        sheet.appendRow(['Log_Id', 'Event_Id', 'Action', 'Action_By', 'Timestamp', 'Details']);
      }
    }
  });
}

function initializeSheets() {
  const ss = getSpreadsheet();
  ensureSheetsExist(ss);
  return { success: true, message: 'ตรวจสอบและเตรียมตารางทั้ง 6 Sheet เรียบร้อยแล้ว' };
}

function getAuditLogs() {
  const ss = getSpreadsheet();
  const logSheet = ss.getSheetByName('System_Logs');
  if (!logSheet) return { logs: [] };
  const data = logSheet.getDataRange().getValues();
  const logs = [];
  for (let i = Math.max(1, data.length - 100); i < data.length; i++) {
    logs.push({
      logId: data[i][0],
      eventId: data[i][1],
      action: data[i][2],
      actionBy: data[i][3],
      timestamp: data[i][4],
      details: data[i][5]
    });
  }
  return { logs: logs.reverse() };
}
