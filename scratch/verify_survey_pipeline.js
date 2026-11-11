const fs = require('fs');

console.log('=== VERIFYING SURVEY.HTML & INDEX.HTML 2-STEP PIPELINE ===\n');

const surveyHtml = fs.readFileSync('survey.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Verify survey.html elements
const requiredSurveyElements = [
  'id="stepTab1"',
  'id="stepTab2"',
  'id="step1Container"',
  'id="step2Container"',
  'id="btnSubmitEval"',
  'id="participantNameTh"',
  'id="participantNameEn"',
  'id="participantSchool"',
  'id="participantEmail"',
  'id="viewCertNameTh"',
  'id="viewCertNameEn"',
  'id="viewCertSchool"',
  'id="viewCertCourse"',
  'id="viewCertSpeaker"',
  'id="viewCertExecutive"',
  'id="btnSendCertEmail"',
  'id="btnPrintCert"',
  'id="unlockedDriveQrWrapper"',
  'id="btnOpenUnlockedDrive"',
  'id="certQrWrapper"'
];

let allSurveyElementsOk = true;
requiredSurveyElements.forEach(el => {
  const exists = surveyHtml.includes(el);
  console.log(`[SURVEY ELEMENT] ${el.padEnd(30)}: ${exists ? '✅ OK' : '❌ MISSING'}`);
  if (!exists) allSurveyElementsOk = false;
});

// 2. Verify survey.html functions
const requiredSurveyFunctions = [
  'renderQuestions',
  'setRating',
  'resolveEventDetails',
  'handleEvaluationDone',
  'switchToStep2',
  'updateCertLivePreview',
  'sendCertToEmailAction',
  'printCertAction',
  'resetForNewParticipant'
];

let allSurveyFuncsOk = true;
requiredSurveyFunctions.forEach(fn => {
  const exists = surveyHtml.includes(`function ${fn}`);
  console.log(`[SURVEY FUNCTION] ${fn.padEnd(28)}: ${exists ? '✅ OK' : '❌ MISSING'}`);
  if (!exists) allSurveyFuncsOk = false;
});

// 3. Verify that the confusing trainee signatory toolbar was removed
const hasConfusingToolbar = surveyHtml.includes('ผู้ลงนามรับรองวุฒิบัตร (ปรับเปลี่ยนแก้ไขได้)');
console.log(`[SURVEY SECURITY] Confusing signatory editor removed: ${!hasConfusingToolbar ? '✅ REMOVED' : '❌ STILL PRESENT'}`);

// 4. Verify index.html QR generator passes metadata
const hasReqParam = indexHtml.includes('getSurveyFullUrl(token, req)');
const hasTopicParam = indexHtml.includes('&topic=');
const hasSchoolParam = indexHtml.includes('&school=');
const hasSpeakerParam = indexHtml.includes('&speaker=');
console.log(`[INDEX QR URL] getSurveyFullUrl supports metadata: ${hasReqParam && hasTopicParam && hasSchoolParam ? '✅ OK' : '❌ MISSING'}`);

if (!allSurveyElementsOk || !allSurveyFuncsOk || hasConfusingToolbar || !hasTopicParam) {
  console.error('\nFAILED: Verification checks failed.');
  process.exit(1);
}

console.log('\n🎉 ALL CHECKS PASSED PERFECTLY!');
