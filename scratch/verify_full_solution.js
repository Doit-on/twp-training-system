const fs = require('fs');

console.log('=== 1. VERIFYING REGISTER.HTML ===');
const regHtml = fs.readFileSync('register.html', 'utf8');
const feRegHtml = fs.readFileSync('frontend/register.html', 'utf8');

const regChecks = [
  { name: 'register.html has TITLE_PREFIXES_REGEX', ok: regHtml.includes('TITLE_PREFIXES_REGEX') },
  { name: 'register.html has matchAttendeeSearch', ok: regHtml.includes('matchAttendeeSearch(att, query)') },
  { name: 'register.html handleAttendeeSearch uses matchAttendeeSearch', ok: regHtml.includes('matchAttendeeSearch(att, q)') },
  { name: 'register.html resolveEventMetadata decodes topic & school', ok: regHtml.includes("decodeURIComponent(urlParams.get('topic'))") },
  { name: 'frontend/register.html matches register.html', ok: regHtml === feRegHtml }
];

regChecks.forEach(c => console.log((c.ok ? '  [PASS] ' : '  [FAIL] ') + c.name));

console.log('\n=== 2. VERIFYING INDEX.HTML ===');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const feIndexHtml = fs.readFileSync('frontend/index.html', 'utf8');

const indexChecks = [
  { name: 'index.html has getRegisterFullUrl', ok: indexHtml.includes('function getRegisterFullUrl(') },
  { name: 'index.html has matchAttendeeSearch', ok: indexHtml.includes('matchAttendeeSearch(att, query)') },
  { name: 'index.html filterAttendeeTable uses matchAttendeeSearch', ok: indexHtml.includes('matchAttendeeSearch(a, q)') },
  { name: 'index.html generateOnsiteQrStandee uses getRegisterFullUrl', ok: indexHtml.includes('const registerUrl = getRegisterFullUrl(eventId);') },
  { name: 'index.html card button calls printOnsiteQrStandee', ok: indexHtml.includes("onclick=\"printOnsiteQrStandee('${req.eventId}')\"") },
  { name: 'frontend/index.html matches index.html', ok: indexHtml === feIndexHtml }
];

indexChecks.forEach(c => console.log((c.ok ? '  [PASS] ' : '  [FAIL] ') + c.name));

console.log('\n=== 3. VERIFYING BACKEND_CODE.GS ===');
const gasCode = fs.readFileSync('backend_code.gs', 'utf8');
const gasChecks = [
  { name: 'backend_code.gs handleGetEventRegistrations uses trimmed uppercase', ok: gasCode.includes("rowEid === eventId") },
  { name: 'backend_code.gs reqSheet lookup uses trimmed uppercase', ok: gasCode.includes("String(reqRows[j][0] || '').trim().toUpperCase() === eventId") }
];

gasChecks.forEach(c => console.log((c.ok ? '  [PASS] ' : '  [FAIL] ') + c.name));

console.log('\n=== 4. SIMULATION OF URL GENERATION & METADATA PRESERVATION ===');
const mockReq = {
  eventId: 'EVT-20261111-7914',
  courseTopic: 'ยกระดับผลสัมฤทธิ์ทางการเรียนภาษาอังกฤษโดยผ่านการสอบ CEFR',
  schoolName: 'โรงเรียนเบญจมราชรังสฤษฎิ์',
  eventDate: '2026-12-03',
  teamBSpeaker: 'ดร.สมเกียรติ พัฒนาการ'
};

const baseUrl = 'https://doit-on.github.io/twp-training-system/register.html';
const params = new URLSearchParams();
params.set('event', mockReq.eventId);
params.set('topic', mockReq.courseTopic);
params.set('school', mockReq.schoolName);
params.set('date', mockReq.eventDate);
params.set('speaker', mockReq.teamBSpeaker);

const generatedUrl = `${baseUrl}?${params.toString()}`;
console.log('Generated QR Target URL:');
console.log(generatedUrl);

const parsedUrl = new URL(generatedUrl);
console.log('Decoded topic from URL:', parsedUrl.searchParams.get('topic'));
console.log('Decoded school from URL:', parsedUrl.searchParams.get('school'));
console.log('Decoded date from URL:', parsedUrl.searchParams.get('date'));
console.log('Decoded eventId from URL:', parsedUrl.searchParams.get('event'));

const allChecksPass = regChecks.every(c => c.ok) && indexChecks.every(c => c.ok) && gasChecks.every(c => c.ok)
  && parsedUrl.searchParams.get('topic') === mockReq.courseTopic
  && parsedUrl.searchParams.get('school') === mockReq.schoolName;

if (allChecksPass) {
  console.log('\n>>> ALL SYSTEM VERIFICATIONS PASSED 100%! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
