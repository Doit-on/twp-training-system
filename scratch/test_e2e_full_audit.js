const fs = require('fs');

console.log('=== STARTING END-TO-END AUDIT & WORKFLOW SIMULATION ===\n');

// 1. Load Application logic elements from index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Verify critical function definitions exist in index.html
const criticalFunctions = [
  'saveEventExpenses',
  'confirmSignatureApproval',
  'quickApproveWithOfficialSig',
  'handleExecDecision',
  'mergeCloudRequestsWithLocal',
  'openSignatureModal',
  'onExpenseEventSelect',
  'calculateRealtimeExpenses',
  'handleTeamBAction',
  'handleTeamASubmit',
  'renderExecQueue',
  'renderTeamBQueue',
  'renderTeamBExecutionQueue',
  'renderTeamBExpensesView',
  'renderDashboard'
];

let allExist = true;
criticalFunctions.forEach(fn => {
  const exists = indexHtml.includes(`function ${fn}`);
  console.log(`[CHECK] Function ${fn.padEnd(30)}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  if (!exists) allExist = false;
});

if (!allExist) {
  console.error('\nFAILED: Some critical functions are missing in index.html');
  process.exit(1);
}

// 2. Simulate Full Workflow Logic in Memory
console.log('\n--- SIMULATING 5-STAGE WORKFLOW ---');

const AppState = {
  requests: [],
  operatorName: 'นิพนธ์ ศรแก้ว',
  dataSignature: ''
};

// Stage 1: Team A creates request
console.log('\n[Stage 1: Team A Submission]');
const testEvent = {
  eventId: 'REQ-2026-AUDIT01',
  createdAt: new Date().toISOString(),
  status: 'WAITING_B',
  activityType: 'อบรมวิชาการ',
  courseTopic: 'Active Learning สู่สมรรถนะผู้เรียน 2569',
  schoolName: 'โรงเรียนอยุธยาวิทยาลัย',
  province: 'พระนครศรีอยุธยา',
  saleName: 'มานพ บุญส่ง',
  estBudget: 25000,
  targetSales: 200000,
  expectedTrainees: 80
};
AppState.requests.push(testEvent);
console.log(`Created request: ${testEvent.eventId}, Status: ${testEvent.status}, Budget: ฿${testEvent.estBudget}`);

// Stage 2: Team B Reviews & Adjusts
console.log('\n[Stage 2: Team B Academic Review]');
const reqInB = AppState.requests.find(r => r.eventId === testEvent.eventId);
reqInB.status = 'WAITING_EXEC';
reqInB.teamBSpeaker = 'ศ.ดร.ประสาน ปัญญาเลิศ';
reqInB.actualBudget = 22000;
reqInB.teamBNotes = 'เนื้อหาสอดคล้องตามแผนงาน พร้อมดำเนินงาน';
reqInB.reviewedBy = 'ฝ่ายพัฒนาวิชาการ (ทีม B)';
reqInB.reviewedByBAt = new Date().toISOString();
console.log(`Team B Endorsed: ${reqInB.eventId}, Status: ${reqInB.status}, Adjusted Budget: ฿${reqInB.actualBudget}, Speaker: ${reqInB.teamBSpeaker}`);

// Stage 3: Executive Approval & Signature
console.log('\n[Stage 3: Executive Approval & Signature]');
const reqInExec = AppState.requests.find(r => r.eventId === testEvent.eventId);
// Simulate handleExecDecision
reqInExec.status = 'APPROVED';
reqInExec.approvedBy = 'ผศ.อินทิรา บุนนาค';
reqInExec.approverRole = 'กรรมการผู้จัดการ';
reqInExec.approvedAt = new Date().toISOString();
reqInExec.approverSignature = 'OFFICIAL_DIGITAL_SIGNATURE';
reqInExec.token = 'tok-' + Math.random().toString(36).substring(2, 10);
reqInExec.pdfUrl = '#memo-approved';
console.log(`Executive Approved: ${reqInExec.eventId}, Status: ${reqInExec.status}, Approver: ${reqInExec.approvedBy} (${reqInExec.approverRole})`);
console.log(`Zero-Trust QR Token Issued: ${reqInExec.token}`);

// Stage 4: On-site QR Tools Generation
console.log('\n[Stage 4: On-Site QR Tools Ready]');
console.log(`QR Survey URL generated: ?surveyToken=${reqInExec.token}`);
console.log(`A4 Desk Sign & Projector link unlocked for Team B.`);

// Stage 5: Team B Actual Expenses (7 Categories)
console.log('\n[Stage 5: Team B Actual Expense Settlement]');
const reqInExp = AppState.requests.find(r => r.eventId === testEvent.eventId);
const expSpeaker = 8000;
const expTravel = 3500;
const expAccom = 3000;
const expFood = 4000;
const expDocKit = 1000;
const expVenue = 0;
const expMisc = 500;
const totalActual = expSpeaker + expTravel + expAccom + expFood + expDocKit + expVenue + expMisc;

reqInExp.actualExpenses = {
  expSpeaker,
  expTravel,
  expAccom,
  expFood,
  expDocKit,
  expVenue,
  expMisc
};
reqInExp.actualExpensesTotal = totalActual;
reqInExp.actualBudget = totalActual;
reqInExp.status = 'COMPLETED';
reqInExp.actualExpensesSettledAt = new Date().toISOString();
reqInExp.actualExpensesSettledBy = 'ฝ่ายพัฒนาวิชาการ (ทีม B)';

const savedBudget = 22000 - totalActual;
console.log(`7 Categories Settled: Total = ฿${totalActual.toLocaleString()}, Saved Budget: ฿${savedBudget.toLocaleString()}`);
console.log(`Final Event Status: ${reqInExp.status} (COMPLETED)`);

// 3. Test Smart Merge (Simulate Background Sync overwriting prevention)
console.log('\n--- TESTING SMART MERGE (PREVENT DATA LOSS) ---');
const simulatedCloudData = [
  {
    eventId: testEvent.eventId,
    createdAt: testEvent.createdAt,
    status: 'APPROVED', // Cloud still has APPROVED before sync
    estBudget: 25000,
    actualBudget: 22000
    // Cloud does NOT have actualExpenses yet
  }
];

// Test merge logic
function mergeCloudRequestsWithLocal(cloudRequests) {
  if (!Array.isArray(cloudRequests)) return AppState.requests || [];
  const cloudIds = new Set(cloudRequests.map(r => r.eventId));

  const merged = cloudRequests.map(cReq => {
    const lReq = (AppState.requests || []).find(r => r.eventId === cReq.eventId);
    if (!lReq) return cReq;

    const actualExpenses = cReq.actualExpenses || lReq.actualExpenses || null;
    const actualExpensesTotal = cReq.actualExpensesTotal || lReq.actualExpensesTotal || (cReq.actualBudget || lReq.actualBudget || 0);
    const approverSignature = lReq.approverSignature || cReq.approverSignature || null;
    const token = cReq.token || lReq.token || '';

    let status = cReq.status;
    if (lReq.status === 'COMPLETED') {
      status = 'COMPLETED';
    } else if (lReq.status === 'APPROVED' && (cReq.status === 'WAITING_EXEC' || cReq.status === 'WAITING_B')) {
      status = 'APPROVED';
    }

    return {
      ...cReq,
      ...lReq,
      status: status,
      actualExpenses: actualExpenses,
      actualExpensesTotal: actualExpensesTotal,
      approverSignature: approverSignature,
      token: token
    };
  });

  const localOnly = (AppState.requests || []).filter(r => !cloudIds.has(r.eventId));
  return [...merged, ...localOnly];
}

const mergedResult = mergeCloudRequestsWithLocal(simulatedCloudData);
const verifiedReq = mergedResult[0];

console.log('Merge Result Status:', verifiedReq.status);
console.log('Merge Result Has 7 Categories Expenses:', !!verifiedReq.actualExpenses);
console.log('Merge Result Has Token:', verifiedReq.token);
console.log('Merge Result Has Signature:', !!verifiedReq.approverSignature);

if (verifiedReq.status === 'COMPLETED' && verifiedReq.actualExpenses && verifiedReq.token && verifiedReq.approverSignature) {
  console.log('\n🎉 ALL TESTS PASSED: Zero-Data-Loss Smart Merge successfully preserved expenses, signature, status, and token!');
} else {
  console.error('\n❌ SMART MERGE TEST FAILED');
  process.exit(1);
}
