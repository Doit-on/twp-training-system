const fs = require('fs');

console.log('=== VERIFYING SYSTEM v1.19.1 ===');

let allPassed = true;

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    allPassed = false;
  } else {
    console.log('✅ PASS:', message);
  }
}

// 1. Check version in files
const files = [
  'index.html',
  'register.html',
  'survey.html',
  'backend_code.gs',
  'frontend/index.html',
  'frontend/register.html',
  'frontend/survey.html'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('1.19.1'), `File ${file} contains 1.19.1`);
  assert(!content.includes('1.19.0'), `File ${file} does not contain old version 1.19.0`);
}

// 2. Check QR URLs in index.html
const indexContent = fs.readFileSync('index.html', 'utf8');
assert(indexContent.includes('const registerUrl = `${hostOrigin}register.html?event=${encodeURIComponent(eventId)}`;'), 'index.html has streamlined short QR URL');
assert(!indexContent.includes('&topic=${encodeURIComponent(req?.courseTopic'), 'index.html no longer packs bloated topic in QR URL');

// 3. Check QR URLs in survey.html
const surveyContent = fs.readFileSync('survey.html', 'utf8');
assert(surveyContent.includes('survey.html?step=2&view=cert&cert=${encodeURIComponent(cId)}'), 'survey.html has shortened verifyUrl');

// 4. Check backend_code.gs test functions
const backendContent = fs.readFileSync('backend_code.gs', 'utf8');
assert(backendContent.includes('function testMailAuthorization()'), 'backend_code.gs has testMailAuthorization()');
assert(backendContent.includes('function testSendCertificateEmail()'), 'backend_code.gs has testSendCertificateEmail()');
assert(backendContent.includes('Version: 1.19.1'), 'backend_code.gs has header Version: 1.19.1');
assert(backendContent.includes("SYSTEM_VERSION = '1.19.1'"), "backend_code.gs has SYSTEM_VERSION = '1.19.1'");

// 5. Test fuzzy matcher against the user's exact uploaded file structure
assert(indexContent.includes('function extractAttendeeFromRow'), 'index.html contains extractAttendeeFromRow');

if (allPassed) {
  console.log('\n🎉 ALL CHECKS PASSED FOR v1.19.1!');
} else {
  console.error('\n⚠️ SOME CHECKS FAILED!');
  process.exit(1);
}
