const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

// 1. Landing Page Card HTML to insert after line 823 in view-dashboard
const landingCardHtml = `
      <!-- ======================================================== -->
      <!-- ONSITE REGISTRATION & ATTENDANCE HUB (Landing Page Card) -->
      <!-- ======================================================== -->
      <div class="bg-gradient-to-br from-white via-amber-50/40 to-blue-50/50 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-md space-y-4">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-md">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  ระบบลงทะเบียนหน้างาน & เช็กชื่อรับวุฒิบัตร (Onsite Check-in Hub)
                </h3>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cloud Database Active</span>
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                สแกน QR เช็กชื่อ ยืนยันตัวตนรายบุคคล และนับจำนวนผู้เข้าอบรมจริงอัตโนมัติ ซิงก์เชื่อมโยงกับทีม B และออกวุฒิบัตรทันที
              </p>
            </div>
          </div>

          <!-- Project Selector & Full View Action -->
          <div class="flex items-center gap-2 self-start md:self-auto">
            <div class="flex items-center space-x-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <i class="fa-solid fa-calendar-check text-[#08539E]"></i>
              <span class="font-bold text-slate-600">โครงการ:</span>
              <select id="landingRegEventSelect" onchange="onLandingRegEventChange(this.value)" class="bg-transparent font-bold text-blue-900 focus:outline-none cursor-pointer max-w-[210px] truncate">
                <!-- Dynamically populated -->
              </select>
            </div>
            <button type="button" onclick="switchTab('registration')" class="btn-touch px-4 py-2 bg-[#08539E] hover:bg-[#07488a] active:bg-[#063b72] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <span>เปิดระบบเต็มรูปแบบ</span>
              <i class="fa-solid fa-arrow-right text-amber-300"></i>
            </button>
          </div>
        </div>

        <!-- 4 Quick Stats & Action Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-[11px] text-slate-500 block font-semibold">รายชื่อในฐานข้อมูล</span>
            <span id="landingRegTotal" class="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-slate-400">คน (Excel + Walk-in)</span>
          </div>

          <div class="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span class="text-[11px] text-emerald-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i>เช็กชื่อเข้างานแล้ว
            </span>
            <span id="landingRegCheckedIn" class="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5 block">0</span>
            <span id="landingRegPct" class="text-[10px] text-emerald-600 font-bold">0% ของเป้าหมาย</span>
          </div>

          <div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
            <span class="text-[11px] text-amber-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-hourglass-half text-amber-600"></i>ยังไม่เช็กชื่อ
            </span>
            <span id="landingRegPending" class="text-xl sm:text-2xl font-black text-amber-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-amber-700">คน</span>
          </div>

          <div class="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-2xs">
            <span class="text-[11px] text-indigo-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-user-plus text-indigo-600"></i>Walk-in หน้างาน
            </span>
            <span id="landingRegWalkin" class="text-xl sm:text-2xl font-black text-indigo-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-indigo-700">คน</span>
          </div>

        </div>

        <!-- Quick Launch Bar (3 Buttons: Print Standee, Open Mobile Check-in, Import Excel) -->
        <div class="pt-1 flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="printOnsiteQrStandeeFromLanding()" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-print"></i>
              <span>พิมพ์ป้ายตั้งโต๊ะ A4 ให้สแกน</span>
            </button>
            <a id="landingBtnOpenRegister" href="register.html" target="_blank" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-mobile-screen-button text-[#08539E]"></i>
              <span>เปิดหน้าจอเช็กชื่อ (Mobile/Tablet)</span>
            </a>
            <button type="button" onclick="triggerLandingExcelImport()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-file-excel"></i>
              <span>นำเข้าไฟล์รายชื่อ (Excel)</span>
            </button>
          </div>

          <span class="text-[11px] text-slate-500 font-medium">
            <i class="fa-solid fa-shield-halved text-blue-600 mr-1"></i>เชื่อมต่อตรงกับ Google Sheets ไม่สูญหาย
          </span>
        </div>

      </div>
`;

// Insert after KPI grid
const oldKpiGridEnd = `          <div id="statAvgSatisfaction" class="text-2xl font-black text-purple-600 mt-2">0.00 / 5.0</div>
          <div class="text-[11px] text-slate-400 mt-1" id="statEvalPercent">จากผู้ประเมินปิดลูป</div>
        </div>

      </div>`;

if (index.includes(oldKpiGridEnd)) {
  index = index.replace(oldKpiGridEnd, oldKpiGridEnd + '\n' + landingCardHtml);
  console.log('Inserted Landing Page Registration Card successfully!');
} else {
  console.error('Could not find oldKpiGridEnd in index.html');
  process.exit(1);
}

// 2. Fix IMPORT_REGISTRATIONS payload in handleAttendeeExcelImport
const oldImportPost = `          // Post to backend
          if (AppState.gasEndpoint) {
            postToBackend('IMPORT_REGISTRATIONS', {
              eventId: eventId,
              attendees: parsedAttendees
            }).catch(e => console.log('Offline imported'));
          }`;

const newImportPost = `          // Post to backend (Support both participants and attendees keys)
          if (AppState.gasEndpoint) {
            postToBackend('IMPORT_REGISTRATIONS', {
              eventId: eventId,
              participants: parsedAttendees,
              attendees: parsedAttendees
            }).then(res => {
              console.log('Import saved on Google Sheets successfully:', res);
            }).catch(e => console.log('Offline imported'));
          }`;

if (index.includes(oldImportPost)) {
  index = index.replace(oldImportPost, newImportPost);
  console.log('Updated IMPORT_REGISTRATIONS payload to send both participants and attendees!');
}

// 3. Add JS functions for Landing Page Registration Hub
const landingRegJs = `
    // -------------------------------------------------------------------------
    // LANDING PAGE ON-SITE REGISTRATION CARD CONTROLLER
    // -------------------------------------------------------------------------
    let currentLandingRegEventId = null;

    function populateLandingRegEventSelect() {
      const select = document.getElementById('landingRegEventSelect');
      if (!select) return;

      const requests = AppState.requests || [];
      if (requests.length === 0) {
        select.innerHTML = '<option value="">-- ไม่พบโครงการ --</option>';
        return;
      }

      if (!currentLandingRegEventId) {
        currentLandingRegEventId = requests[0].eventId;
      }

      select.innerHTML = requests.map(r => \`
        <option value="\${r.eventId}" \${r.eventId === currentLandingRegEventId ? 'selected' : ''}>
          \${r.eventId} - \${r.courseTopic || 'อบรม'} (\${r.schoolName || ''})
        </option>
      \`).join('');

      updateLandingRegCard();
    }

    function onLandingRegEventChange(eventId) {
      currentLandingRegEventId = eventId;
      updateLandingRegCard();
    }

    function updateLandingRegCard() {
      const eventId = currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) return;

      const btnOpen = document.getElementById('landingBtnOpenRegister');
      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      if (btnOpen) {
        btnOpen.href = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}\`;
      }

      // Check local cached attendees
      let list = [];
      try {
        const cached = localStorage.getItem('twp_onsite_attendees_' + eventId);
        if (cached) list = JSON.parse(cached);
      } catch(e) {}

      const total = list.length;
      const checked = list.filter(a => a.checkinStatus === 'CHECKED_IN').length;
      const pending = total - checked;
      const walkin = list.filter(a => a.regType === 'WALKIN').length;

      const req = AppState.requests.find(r => r.eventId === eventId);
      const targetTrainees = Number(req?.actualTrainees || req?.expectedTrainees) || (total > 0 ? total : 50);
      const pct = targetTrainees > 0 ? Math.round((checked / targetTrainees) * 100) : 0;

      const elTotal = document.getElementById('landingRegTotal');
      const elChecked = document.getElementById('landingRegCheckedIn');
      const elPending = document.getElementById('landingRegPending');
      const elWalkin = document.getElementById('landingRegWalkin');
      const elPct = document.getElementById('landingRegPct');

      if (elTotal) elTotal.innerText = total;
      if (elChecked) elChecked.innerText = checked;
      if (elPending) elPending.innerText = pending;
      if (elWalkin) elWalkin.innerText = walkin;
      if (elPct) elPct.innerText = pct + '% ของเป้าหมาย';

      // Background sync from backend if online
      if (AppState.gasEndpoint && list.length === 0) {
        postToBackend('GET_EVENT_REGISTRATIONS', { eventId: eventId })
          .then(res => {
            if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
              localStorage.setItem('twp_onsite_attendees_' + eventId, JSON.stringify(res.data));
              updateLandingRegCard();
            }
          }).catch(e => {});
      }
    }

    function printOnsiteQrStandeeFromLanding() {
      const eventId = currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) {
        showAlert('กรุณาเลือกโครงการที่ต้องการพิมพ์ป้ายตั้งโต๊ะก่อนครับ', 'warning');
        return;
      }
      currentRegEventId = eventId;
      printOnsiteQrStandee();
    }

    function triggerLandingExcelImport() {
      const eventId = currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) {
        showAlert('กรุณาเลือกโครงการก่อนนำเข้าไฟล์รายชื่อครับ', 'warning');
        return;
      }
      currentRegEventId = eventId;
      switchTab('registration');
      setTimeout(() => {
        const fileInp = document.getElementById('regExcelFileInput');
        if (fileInp) fileInp.click();
      }, 150);
    }
`;

// Insert landingRegJs right before renderDashboardArchives
const insertMarker = 'function renderDashboardArchives() {';
if (index.includes(insertMarker)) {
  index = index.replace(insertMarker, landingRegJs + '\n    ' + insertMarker);
  console.log('Inserted Landing Reg JS functions successfully!');
} else {
  console.error('Could not find insertMarker in index.html');
  process.exit(1);
}

// Call populateLandingRegEventSelect inside renderDashboard
const oldRenderDashboardCall = `      renderTopicBreakdown(topicStats);
      renderTopicSatisfaction(topicStats);`;

const newRenderDashboardCall = `      renderTopicBreakdown(topicStats);
      renderTopicSatisfaction(topicStats);
      populateLandingRegEventSelect();`;

if (index.includes(oldRenderDashboardCall)) {
  index = index.replace(oldRenderDashboardCall, newRenderDashboardCall);
  console.log('Added populateLandingRegEventSelect inside renderDashboard!');
}

fs.writeFileSync('index.html', index, 'utf8');
fs.writeFileSync('frontend/index.html', index, 'utf8');
console.log('index.html and frontend/index.html updated successfully!');
