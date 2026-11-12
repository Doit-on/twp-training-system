const fs = require('fs');

console.log('=== PATCHING INDEX.HTML WITH SMART STANDee URL & PREFIX SEARCH ===');

['index.html', 'frontend/index.html'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Helper: getRegisterFullUrl + smart prefix search
  const newHelpers = `
    // -------------------------------------------------------------------------
    // UNIVERSAL REGISTRATION URL BUILDER (WITH STAND-ALONE EVENT METADATA)
    // -------------------------------------------------------------------------
    function getRegisterFullUrl(eventId) {
      const eid = eventId || currentRegEventId || currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId) || '';
      const req = (AppState.requests && AppState.requests.find(r => String(r.eventId || '').trim().toUpperCase() === String(eid).trim().toUpperCase())) || {};

      let baseUrl = 'https://doit-on.github.io/twp-training-system/register.html';
      if (window.location.origin && window.location.origin.startsWith('http') && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
        let path = window.location.pathname || '/';
        if (path.endsWith('/')) {
          path = path + 'register.html';
        } else if (path.endsWith('index.html')) {
          path = path.slice(0, -10) + 'register.html';
        } else if (!path.endsWith('register.html')) {
          const lastSlash = path.lastIndexOf('/');
          path = path.substring(0, lastSlash + 1) + 'register.html';
        }
        baseUrl = window.location.origin + path;
      }

      const params = new URLSearchParams();
      params.set('event', eid);
      if (req.courseTopic) params.set('topic', req.courseTopic);
      if (req.schoolName) params.set('school', req.schoolName);
      if (req.eventDate || req.trainingDate) params.set('date', req.eventDate || req.trainingDate);
      if (req.teamBSpeaker || req.speakerType) params.set('speaker', req.teamBSpeaker || req.speakerType);
      if (AppState.gasEndpoint) params.set('ep', AppState.gasEndpoint);

      return \`\${baseUrl}?\${params.toString()}\`;
    }

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

        if (rawF.includes(rawQ)) return true;
        if (rawQNoSpace && rawFNoSpace.includes(rawQNoSpace)) return true;
        if (cleanQ && cleanF.includes(cleanQ)) return true;
        if (cleanQNoSpace && cleanFNoSpace.includes(cleanQNoSpace)) return true;
        if (cleanQ && rawF.includes(cleanQ)) return true;
        if (cleanQNoSpace && rawFNoSpace.includes(cleanQNoSpace)) return true;
      }

      const phoneDigits = (att.phone || '').replace(/[^0-9]/g, '');
      const qDigits = rawQ.replace(/[^0-9]/g, '');
      if (qDigits.length >= 3 && phoneDigits && (phoneDigits.includes(qDigits) || phoneDigits.endsWith(qDigits))) {
        return true;
      }

      return false;
    }
`;

  // Insert before function filterAttendeeTable()
  const filterTarget = 'function filterAttendeeTable() {';
  if (!content.includes('getRegisterFullUrl(') && content.includes(filterTarget)) {
    content = content.replace(filterTarget, newHelpers + '\n    ' + filterTarget);
    console.log(`Inserted getRegisterFullUrl and smart prefix matcher in ${filePath}`);
  }

  // 2. Update filterAttendeeTable to use matchAttendeeSearch
  const oldFilterAttendee = `      if (q) {
        list = list.filter(a => {
          const th = (a.nameTh || '').toLowerCase();
          const en = (a.nameEn || '').toLowerCase();
          const sc = (a.school || '').toLowerCase();
          const ph = (a.phone || '').toLowerCase();
          return th.includes(q) || en.includes(q) || sc.includes(q) || ph.includes(q);
        });
      }`;

  const newFilterAttendee = `      if (q) {
        list = list.filter(a => matchAttendeeSearch(a, q));
      }`;

  if (content.includes(oldFilterAttendee)) {
    content = content.replace(oldFilterAttendee, newFilterAttendee);
    console.log(`Updated filterAttendeeTable in ${filePath}`);
  }

  // 3. Update generateOnsiteQrStandee to use getRegisterFullUrl
  const oldGenStandee = `    function generateOnsiteQrStandee(eventId) {
      const qrWrap = document.getElementById('standeeQrWrapper');
      if (!qrWrap || !window.QRCode) return;
      qrWrap.innerHTML = '';

      const req = AppState.requests.find(r => r.eventId === eventId);
      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      const registerUrl = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}\`;

      new QRCode(qrWrap, {
        text: registerUrl,
        width: 140,
        height: 140,
        colorDark: '#08539E',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      const btnTest = document.getElementById('btnTestOpenRegisterPage');
      if (btnTest) btnTest.href = registerUrl;
    }`;

  const newGenStandee = `    function generateOnsiteQrStandee(eventId) {
      const qrWrap = document.getElementById('standeeQrWrapper');
      if (!qrWrap || !window.QRCode) return;
      qrWrap.innerHTML = '';

      const registerUrl = getRegisterFullUrl(eventId);

      new QRCode(qrWrap, {
        text: registerUrl,
        width: 140,
        height: 140,
        colorDark: '#08539E',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      const btnTest = document.getElementById('btnTestOpenRegisterPage');
      if (btnTest) btnTest.href = registerUrl;
    }`;

  if (content.includes(oldGenStandee)) {
    content = content.replace(oldGenStandee, newGenStandee);
    console.log(`Updated generateOnsiteQrStandee in ${filePath}`);
  }

  // 4. Update printOnsiteQrStandee to accept targetEventId and use getRegisterFullUrl
  const oldPrintStandeeSig = 'function printOnsiteQrStandee() {\n      const eventId = currentRegEventId || (AppState.requests && AppState.requests[0]?.eventId);';
  const newPrintStandeeSig = 'function printOnsiteQrStandee(targetEventId) {\n      const eventId = targetEventId || currentRegEventId || currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId);\n      currentRegEventId = eventId;';

  if (content.includes(oldPrintStandeeSig)) {
    content = content.replace(oldPrintStandeeSig, newPrintStandeeSig);
    console.log(`Updated printOnsiteQrStandee signature in ${filePath}`);
  }

  const oldPrintStandeeUrl = `      const req = AppState.requests.find(r => r.eventId === eventId);
      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      const registerUrl = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}\`;`;

  const newPrintStandeeUrl = `      const req = (AppState.requests && AppState.requests.find(r => String(r.eventId || '').trim().toUpperCase() === String(eventId).trim().toUpperCase())) || {};
      const registerUrl = getRegisterFullUrl(eventId);`;

  if (content.includes(oldPrintStandeeUrl)) {
    content = content.replace(oldPrintStandeeUrl, newPrintStandeeUrl);
    console.log(`Updated printOnsiteQrStandee registerUrl in ${filePath}`);
  }

  // 5. Update event card's button from printQrDeskSign to printOnsiteQrStandee
  const oldCardBtn = `<button type="button" onclick="printQrDeskSign('\${req.eventId}')" class="py-2.5 px-3 bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs btn-tactile cursor-pointer" title="พิมพ์ป้ายตั้งโต๊ะ A4 วางโต๊ะลงทะเบียน">`;
  const newCardBtn = `<button type="button" onclick="printOnsiteQrStandee('\${req.eventId}')" class="py-2.5 px-3 bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs btn-tactile cursor-pointer" title="พิมพ์ป้ายตั้งโต๊ะ A4 วางโต๊ะลงทะเบียน">`;

  if (content.includes(oldCardBtn)) {
    content = content.replace(oldCardBtn, newCardBtn);
    console.log(`Updated card button to printOnsiteQrStandee in ${filePath}`);
  }

  // 6. Make printQrDeskSign alias to printOnsiteQrStandee
  const oldPrintQrDeskSign = `    function printQrDeskSign(eventId) {
      openQrModalFor(eventId, 'SURVEY');
      showAlert('เปิดหน้าต่างพิมพ์ใบตั้งโต๊ะ A4 เรียบร้อยแล้ว', 'info');
      setTimeout(() => {
        window.print();
      }, 350);
    }`;

  const newPrintQrDeskSign = `    function printQrDeskSign(eventId) {
      printOnsiteQrStandee(eventId);
    }`;

  if (content.includes(oldPrintQrDeskSign)) {
    content = content.replace(oldPrintQrDeskSign, newPrintQrDeskSign);
    console.log(`Updated printQrDeskSign alias in ${filePath}`);
  }

  // 7. Update updateLandingRegCard to use getRegisterFullUrl
  const oldLandingRegBtn = `      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      if (btnOpen) {
        btnOpen.href = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}\`;
      }`;

  const newLandingRegBtn = `      if (btnOpen) {
        btnOpen.href = getRegisterFullUrl(eventId);
      }`;

  if (content.includes(oldLandingRegBtn)) {
    content = content.replace(oldLandingRegBtn, newLandingRegBtn);
    console.log(`Updated updateLandingRegCard btnOpen.href in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Finished updating index.html and frontend/index.html!');
