const fs = require('fs');

console.log('=== PATCHING REGISTER.HTML WITH PREFIX-TOLERANT SEARCH & FULL METADATA RESOLUTION ===');

['register.html', 'frontend/register.html'].forEach(filePath => {
  let regHtml = fs.readFileSync(filePath, 'utf8');

  // 1. Add TITLE_PREFIXES_REGEX, stripTitlePrefix, and matchAttendeeSearch helpers
  const helperJs = `
    // -------------------------------------------------------------------------
    // SMART PREFIX-TOLERANT ATTENDEE NAME MATCHER (THAI & ENGLISH)
    // Supports: นาย, นางสาว, นาง, คุณ, น.ส., ดร., ผศ.ดร., Mr., Mrs., Ms., Miss, etc.
    // -------------------------------------------------------------------------
    const TITLE_PREFIXES_REGEX = /^(นาย|นางสาว|นาง|คุณ|น\\.ส\\.|น\\.ส|นส\\.|นส|ดร\\.|ดร|ผศ\\.ดร\\.|รศ\\.ดร\\.|ศ\\.ดร\\.|ผศ\\.|รศ\\.|ศ\\.|อาจารย์|อ\\.|ว่าที่ร้อยตรี|ว่าที่ ร\\.ต\\.|ว่าที่ ร\\.ต|mr\\.|mr|mrs\\.|mrs|ms\\.|ms|miss|dr\\.|dr|prof\\.|prof|khun)\\s*/i;

    function stripTitlePrefix(str) {
      if (!str) return '';
      return String(str)
        .trim()
        .toLowerCase()
        .replace(TITLE_PREFIXES_REGEX, '')
        .trim();
    }

    function matchAttendeeSearch(att, query) {
      if (!query) return true;
      const rawQ = String(query).trim().toLowerCase();
      const cleanQ = stripTitlePrefix(rawQ);
      const rawQNoSpace = rawQ.replace(/\\s+/g, '');
      const cleanQNoSpace = cleanQ.replace(/\\s+/g, '');

      const fields = [
        att.nameTh || '',
        att.nameEn || '',
        att.school || att.schoolName || '',
        att.email || ''
      ];

      for (const f of fields) {
        if (!f) continue;
        const rawF = String(f).trim().toLowerCase();
        const cleanF = stripTitlePrefix(rawF);
        const rawFNoSpace = rawF.replace(/\\s+/g, '');
        const cleanFNoSpace = cleanF.replace(/\\s+/g, '');

        // 1. Direct contains
        if (rawF.includes(rawQ)) return true;
        // 2. Direct contains without spaces
        if (rawQNoSpace && rawFNoSpace.includes(rawQNoSpace)) return true;
        // 3. Clean contains (prefix stripped)
        if (cleanQ && cleanF.includes(cleanQ)) return true;
        if (cleanQNoSpace && cleanFNoSpace.includes(cleanQNoSpace)) return true;
        // 4. Reverse clean (in case DB has prefix but search didn't, or vice-versa)
        if (cleanQ && rawF.includes(cleanQ)) return true;
        if (cleanQNoSpace && rawFNoSpace.includes(cleanQNoSpace)) return true;
      }

      // Phone number match (digits only, match partial or last 4 digits)
      const phoneDigits = (att.phone || '').replace(/[^0-9]/g, '');
      const qDigits = rawQ.replace(/[^0-9]/g, '');
      if (qDigits.length >= 3 && phoneDigits && (phoneDigits.includes(qDigits) || phoneDigits.endsWith(qDigits))) {
        return true;
      }

      return false;
    }
`;

  // Insert helperJs before handleAttendeeSearch if not already inserted
  const searchTarget = 'function handleAttendeeSearch(query) {';
  if (!regHtml.includes('TITLE_PREFIXES_REGEX') && regHtml.includes(searchTarget)) {
    regHtml = regHtml.replace(searchTarget, helperJs + '\n    ' + searchTarget);
    console.log(`Inserted smart prefix matcher in ${filePath}`);
  }

  // 2. Replace handleAttendeeSearch with updated version using matchAttendeeSearch
  const oldHandleAttendeeSearch = `    function handleAttendeeSearch(query) {
      const q = (query || '').trim().toLowerCase();
      const btnClear = document.getElementById('btnClearSearch');
      if (btnClear) {
        if (q) btnClear.classList.remove('hidden');
        else btnClear.classList.add('hidden');
      }

      if (!q) {
        // Render all attendees by default so the user sees the database immediately!
        renderAttendeesList(attendees, false);
        return;
      }

      filteredAttendees = attendees.filter(att => {
        const nameTh = (att.nameTh || '').toLowerCase();
        const nameEn = (att.nameEn || '').toLowerCase();
        const school = (att.school || '').toLowerCase();
        const phone = (att.phone || '').replace(/[^0-9]/g, '');
        const qClean = q.replace(/[^0-9]/g, '');

        const matchText = nameTh.includes(q) || nameEn.includes(q) || school.includes(q);
        const matchPhone = qClean && phone && (phone.includes(qClean) || phone.endsWith(qClean));

        return matchText || matchPhone;
      });

      renderAttendeesList(filteredAttendees, true);
    }`;

  const newHandleAttendeeSearch = `    function handleAttendeeSearch(query) {
      const q = (query || '').trim();
      const btnClear = document.getElementById('btnClearSearch');
      if (btnClear) {
        if (q) btnClear.classList.remove('hidden');
        else btnClear.classList.add('hidden');
      }

      if (!q) {
        // Render all attendees by default so the user sees the database immediately!
        filteredAttendees = attendees;
        renderAttendeesList(attendees, false);
        return;
      }

      filteredAttendees = attendees.filter(att => matchAttendeeSearch(att, q));
      renderAttendeesList(filteredAttendees, true);
    }`;

  if (regHtml.includes(oldHandleAttendeeSearch)) {
    regHtml = regHtml.replace(oldHandleAttendeeSearch, newHandleAttendeeSearch);
    console.log(`Updated handleAttendeeSearch in ${filePath}`);
  }

  // 3. Improve default state
  const oldCurrentEventDef = `    // State
    let currentEvent = {
      eventId: targetEventId,
      courseTopic: 'Active Learning สู่สมรรถนะผู้เรียนด้วยสื่อนวัตกรรมดิจิทัล',
      schoolName: 'โรงเรียนเตรียมอุดมศึกษาพัฒนาการ',
      speakerName: 'ศ.ดร.ประสาน ปัญญาเลิศ',
      eventDate: '20 พฤศจิกายน 2569'
    };`;

  const newCurrentEventDef = `    // State
    let currentEvent = {
      eventId: targetEventId || 'EVT-GENERAL',
      courseTopic: urlParams.get('topic') ? decodeURIComponent(urlParams.get('topic')) : 'โครงการฝึกอบรมเชิงปฏิบัติการ TWP',
      schoolName: urlParams.get('school') ? decodeURIComponent(urlParams.get('school')) : '',
      speakerName: urlParams.get('speaker') ? decodeURIComponent(urlParams.get('speaker')) : '',
      eventDate: urlParams.get('date') ? decodeURIComponent(urlParams.get('date')) : ''
    };`;

  if (regHtml.includes(oldCurrentEventDef)) {
    regHtml = regHtml.replace(oldCurrentEventDef, newCurrentEventDef);
    console.log(`Updated currentEvent initialization in ${filePath}`);
  }

  // 4. Update resolveEventMetadata
  const resolveTarget = "function resolveEventMetadata() {";
  const resolveEnd = "    function updateSyncIndicator(status, message) {";
  const startIdx = regHtml.indexOf(resolveTarget);
  const endIdx = regHtml.indexOf(resolveEnd);

  if (startIdx !== -1 && endIdx !== -1) {
    const newResolveEventCode = `function resolveEventMetadata() {
      // 1. URL params (Direct from Standee QR Code)
      if (urlParams.get('topic')) currentEvent.courseTopic = decodeURIComponent(urlParams.get('topic'));
      if (urlParams.get('school')) currentEvent.schoolName = decodeURIComponent(urlParams.get('school'));
      if (urlParams.get('speaker')) currentEvent.speakerName = decodeURIComponent(urlParams.get('speaker'));
      if (urlParams.get('date')) currentEvent.eventDate = decodeURIComponent(urlParams.get('date'));

      // 2. Local storage requests store (if opened on host coordinator device)
      if (targetEventId) {
        const stored = localStorage.getItem('twp_requests_store');
        if (stored) {
          try {
            const reqs = JSON.parse(stored);
            const found = reqs.find(r => String(r.eventId || '').trim().toUpperCase() === String(targetEventId).trim().toUpperCase());
            if (found) {
              if (found.courseTopic && !urlParams.get('topic')) currentEvent.courseTopic = found.courseTopic;
              if (found.schoolName && !urlParams.get('school')) currentEvent.schoolName = found.schoolName;
              if ((found.teamBSpeaker || found.speakerType) && !urlParams.get('speaker')) currentEvent.speakerName = found.teamBSpeaker || found.speakerType;
              if ((found.trainingDate || found.eventDate) && !urlParams.get('date')) currentEvent.eventDate = found.trainingDate || found.eventDate;
            }
          } catch(e) {}
        }
      }

      // Render UI
      if (document.getElementById('dispEventId')) document.getElementById('dispEventId').innerText = currentEvent.eventId || '-';
      if (document.getElementById('dispEventDate')) document.getElementById('dispEventDate').innerText = currentEvent.eventDate || '-';
      if (document.getElementById('dispEventTopic')) document.getElementById('dispEventTopic').innerText = currentEvent.courseTopic || '-';
      if (document.getElementById('dispEventSchool')) document.getElementById('dispEventSchool').innerText = currentEvent.schoolName || '-';
      if (document.getElementById('dispEventSpeaker')) document.getElementById('dispEventSpeaker').innerText = currentEvent.speakerName || 'วิทยากรผู้ทรงคุณวุฒิ';

      // Update Go to survey button link
      const btnSurvey = document.getElementById('btnGoToSurvey');
      if (btnSurvey) {
        btnSurvey.href = \`survey.html?evt=\${encodeURIComponent(currentEvent.eventId)}&topic=\${encodeURIComponent(currentEvent.courseTopic)}&school=\${encodeURIComponent(currentEvent.schoolName)}&speaker=\${encodeURIComponent(currentEvent.speakerName)}&date=\${encodeURIComponent(currentEvent.eventDate)}\`;
      }
    }\n\n`;

    regHtml = regHtml.substring(0, startIdx) + newResolveEventCode + regHtml.substring(endIdx);
    console.log(`Updated resolveEventMetadata in ${filePath}`);
  } else {
    console.error(`Could not locate resolveEventMetadata region in ${filePath}`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, regHtml, 'utf8');
});

console.log('Finished updating register.html and frontend/register.html!');
