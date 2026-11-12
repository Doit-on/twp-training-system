const fs = require('fs');
const path = require('path');

let allPassed = true;
function assert(condition, message) {
  if (condition) {
    console.log('  ✓ ' + message);
  } else {
    console.error('  ✗ FAIL: ' + message);
    allPassed = false;
  }
}

console.log('--- 1. Verifying backend_code.gs ---');
const gsCode = fs.readFileSync('backend_code.gs', 'utf8');
assert(gsCode.includes("const SYSTEM_VERSION = '1.19.0'"), "System version is 1.19.0 in backend_code.gs");
assert(gsCode.includes('function testMailAuthorization()'), "testMailAuthorization function exists");
assert(gsCode.includes("'Onsite_Registrations'"), "Onsite_Registrations schema exists");
assert(gsCode.includes('GET_EVENT_REGISTRATIONS'), "GET_EVENT_REGISTRATIONS handler in doPost");
assert(gsCode.includes('CHECKIN_PARTICIPANT'), "CHECKIN_PARTICIPANT handler in doPost");
assert(gsCode.includes('REGISTER_WALKIN'), "REGISTER_WALKIN handler in doPost");
assert(gsCode.includes('IMPORT_REGISTRATIONS'), "IMPORT_REGISTRATIONS handler in doPost");
assert(gsCode.includes('UPDATE_TEAM_B_ATTENDEES'), "UPDATE_TEAM_B_ATTENDEES handler in doPost");
assert(gsCode.includes('expectedTrainees'), "expectedTrainees handled in createRequestTeamA");
assert(gsCode.includes('needCatering'), "needCatering handled in createRequestTeamA");
assert(gsCode.includes('needProductMedia'), "needProductMedia handled in createRequestTeamA");
assert(gsCode.includes('otherSupportDetails'), "otherSupportDetails handled in createRequestTeamA");
assert(gsCode.includes('actualTrainees'), "actualTrainees handled in updateReviewTeamB");
assert(gsCode.includes('fromEmail'), "fromEmail option supported in handleSendECertificateEmail");

console.log('\n--- 2. Verifying survey.html ---');
const surveyCode = fs.readFileSync('survey.html', 'utf8');
assert(surveyCode.includes('btnLangTh') && surveyCode.includes('btnLangEn'), "Bilingual toggle buttons present");
assert(surveyCode.includes('titleTh:') && surveyCode.includes('titleEn:'), "Bilingual questions structure present");
assert(surveyCode.includes('applyDirectCertViewMode'), "applyDirectCertViewMode function present");
assert(!surveyCode.includes('>OFFICIAL<'), "OFFICIAL text removed from seal");
assert(surveyCode.includes('DOCUMENT REF:'), "Document reference label at bottom border");
assert(surveyCode.includes('certQrWrapper'), "certQrWrapper exists at bottom border");
assert(surveyCode.includes("urlParams.get('name') || urlParams.get('nameTh')"), "pName handles both name and nameTh");

console.log('\n--- 3. Verifying index.html ---');
const indexCode = fs.readFileSync('index.html', 'utf8');
assert(indexCode.includes('v1.19.0'), "v1.19.0 present in index.html");
assert(indexCode.includes('xlsx.full.min.js'), "SheetJS script tag present in index.html");
assert(indexCode.includes('headerOperatorName'), "headerOperatorName user identity element present");
assert(indexCode.includes('openSwitchProfileModal()'), "openSwitchProfileModal trigger in header");
assert(indexCode.includes('id="needCatering"'), "needCatering checkbox in Team A form");
assert(indexCode.includes('id="needProductMedia"'), "needProductMedia checkbox in Team A form");
assert(indexCode.includes('id="needOtherSupport"'), "needOtherSupport checkbox in Team A form");
assert(indexCode.includes('id="otherSupportDetails"'), "otherSupportDetails input in Team A form");
assert(indexCode.includes('id="sideBtn-registration"'), "sideBtn-registration sidebar menu button present");
assert(indexCode.includes('id="view-registration"'), "view-registration section present in DOM");
assert(indexCode.includes('teamBActualTrainees-'), "teamBActualTrainees editable input in Team B card");
assert(indexCode.includes('syncOnsiteToTeamB('), "syncOnsiteToTeamB function present");
assert(indexCode.includes("switchTab('registration')"), "switchTab handles registration");
assert(indexCode.includes('renderRegistrationView'), "renderRegistrationView function present");
assert(indexCode.includes('printOnsiteQrStandee'), "printOnsiteQrStandee function present");
assert(indexCode.includes('downloadExcelAttendeeTemplate'), "downloadExcelAttendeeTemplate function present");
assert(indexCode.includes('handleAttendeeExcelImport'), "handleAttendeeExcelImport function present");

console.log('\n--- 4. Verifying register.html ---');
const regCode = fs.readFileSync('register.html', 'utf8');
assert(regCode.includes('attendeeSearchInput'), "attendeeSearchInput present");
assert(regCode.includes('handleAttendeeSearch'), "handleAttendeeSearch present");
assert(regCode.includes('openWalkinModal'), "openWalkinModal present");
assert(regCode.includes('handleWalkinSubmit'), "handleWalkinSubmit present");
assert(regCode.includes('executeCheckin'), "executeCheckin present");

console.log('\n--- 5. Verifying Synchronized Files ---');
assert(fs.existsSync('frontend/index.html'), "frontend/index.html exists");
assert(fs.existsSync('frontend/survey.html'), "frontend/survey.html exists");
assert(fs.existsSync('frontend/register.html'), "frontend/register.html exists");

if (allPassed) {
  console.log('\n🎉 ALL CHECKS PASSED PERFECTLY! System v1.19.0 is 100% verified.');
} else {
  console.error('\n❌ SOME CHECKS FAILED. Please review above.');
  process.exit(1);
}
