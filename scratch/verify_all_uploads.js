const fs = require('fs');

console.log('=== VERIFYING FILE UPLOAD & CANCELLATION FEATURES ===');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const checks = [
  { name: 'regExcelUploadedFileInfo element', check: indexHtml.includes('id="regExcelUploadedFileInfo"') },
  { name: 'landingExcelUploadedFileInfo element', check: indexHtml.includes('id="landingExcelUploadedFileInfo"') },
  { name: 'cancelAttendeeExcelImport function call in buttons', check: indexHtml.includes('onclick="cancelAttendeeExcelImport()"') },
  { name: 'spkSigUploadedFileInfo element', check: indexHtml.includes('id="spkSigUploadedFileInfo"') },
  { name: 'cancelSpeakerSigFileUpload function call in button', check: indexHtml.includes('onclick="cancelSpeakerSigFileUpload()"') },
  { name: 'eventPhotosSelectedListContainer element', check: indexHtml.includes('id="eventPhotosSelectedListContainer"') },
  { name: 'cancelAllSelectedEventPhotos function call in button', check: indexHtml.includes('onclick="cancelAllSelectedEventPhotos()"') },
  { name: 'removeSingleSelectedPhoto function call in chips', check: indexHtml.includes('removeSingleSelectedPhoto') },
  { name: 'cancelAttendeeExcelImport implementation', check: indexHtml.includes('function cancelAttendeeExcelImport(') },
  { name: 'displayUploadedSpeakerSigFileInfo implementation', check: indexHtml.includes('function displayUploadedSpeakerSigFileInfo(') },
  { name: 'cancelSpeakerSigFileUpload implementation', check: indexHtml.includes('function cancelSpeakerSigFileUpload(') },
  { name: 'renderSelectedEventPhotosChips implementation', check: indexHtml.includes('function renderSelectedEventPhotosChips(') },
  { name: 'cancelAllSelectedEventPhotos implementation', check: indexHtml.includes('function cancelAllSelectedEventPhotos(') },
  { name: 'importSystemBackupJson confirmation & cancel', check: indexHtml.includes('คุณต้องการนำเข้าไฟล์สำรองข้อมูล') }
];

let allPassed = true;
checks.forEach(c => {
  if (c.check) {
    console.log('  [PASS] ' + c.name);
  } else {
    console.log('  [FAIL] ' + c.name);
    allPassed = false;
  }
});

console.log('\n=== REGISTER.HTML FILE INPUT CHECK ===');
const regHtml = fs.readFileSync('register.html', 'utf8');
const fileInReg = regHtml.toLowerCase().includes('type="file"');
console.log('  register.html has file input: ' + fileInReg);

if (allPassed) {
  console.log('\n>>> ALL 14 VERIFICATIONS PASSED SUCCESSFULLY! <<<');
} else {
  console.log('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
