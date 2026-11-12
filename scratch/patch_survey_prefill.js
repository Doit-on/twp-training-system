const fs = require('fs');

['register.html', 'frontend/register.html'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldCode = `    function showCheckinSuccessPass(att) {
      document.getElementById('successAttendeeNameTh').innerText = att.nameTh;
      document.getElementById('successAttendeeNameEn').innerText = att.nameEn || '';
      document.getElementById('successAttendeeSchool').innerText = att.school || currentEvent.schoolName;
      document.getElementById('successCheckinTime').innerText = 'เวลาเช็กชื่อ: ' + (att.checkinTime || '');

      const card = document.getElementById('checkinSuccessCard');`;

  const newCode = `    function showCheckinSuccessPass(att) {
      document.getElementById('successAttendeeNameTh').innerText = att.nameTh;
      document.getElementById('successAttendeeNameEn').innerText = att.nameEn || '';
      document.getElementById('successAttendeeSchool').innerText = att.school || currentEvent.schoolName;
      document.getElementById('successCheckinTime').innerText = 'เวลาเช็กชื่อ: ' + (att.checkinTime || '');

      // Seamlessly wire attendee Thai/English name and school directly into Survey & e-Certificate link!
      const btnSurvey = document.getElementById('btnGoToSurvey');
      if (btnSurvey) {
        btnSurvey.href = \`survey.html?evt=\${encodeURIComponent(currentEvent.eventId)}&topic=\${encodeURIComponent(currentEvent.courseTopic)}&school=\${encodeURIComponent(att.school || currentEvent.schoolName)}&speaker=\${encodeURIComponent(currentEvent.speakerName)}&date=\${encodeURIComponent(currentEvent.eventDate)}&nameTh=\${encodeURIComponent(att.nameTh || '')}&nameEn=\${encodeURIComponent(att.nameEn || '')}&name=\${encodeURIComponent(att.nameTh || '')}&regId=\${encodeURIComponent(att.regId || '')}&email=\${encodeURIComponent(att.email || '')}&phone=\${encodeURIComponent(att.phone || '')}\`;
      }

      const card = document.getElementById('checkinSuccessCard');`;

  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated showCheckinSuccessPass in ${filePath}`);
  } else {
    console.error(`Could not find oldCode in ${filePath}`);
  }
});
