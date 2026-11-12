const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. ADDING UPLOADED FILE INFO & CANCELLATION FOR EXCEL IMPORT ---');

// In view-registration Card 2: Excel Import Container
const oldExcelDropBox = `            <input type="file" id="regExcelFileInput" accept=".xlsx, .xls, .csv" onchange="handleAttendeeExcelImport(event)" class="hidden">
            <div class="pt-1">
              <button type="button" onclick="document.getElementById('regExcelFileInput').click()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-folder-open"></i>
                <span>เลือกไฟล์จากเครื่อง...</span>
              </button>
            </div>
          </div>`;

const newExcelDropBox = `            <input type="file" id="regExcelFileInput" accept=".xlsx, .xls, .csv" onchange="handleAttendeeExcelImport(event)" class="hidden">
            <div class="pt-1">
              <button type="button" onclick="document.getElementById('regExcelFileInput').click()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-folder-open"></i>
                <span>เลือกไฟล์จากเครื่อง...</span>
              </button>
            </div>
          </div>

          <!-- Active Uploaded Excel File Card & Cancellation -->
          <div id="regExcelUploadedFileInfo" class="hidden bg-emerald-50/90 border border-emerald-300 rounded-2xl p-3.5 space-y-2 text-left">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
                  <i class="fa-solid fa-file-excel"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span id="regExcelUploadedFileName" class="text-xs font-bold text-slate-800 truncate">ไฟล์ตัวอย่าง.xlsx</span>
                    <span class="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-md">โหลดเข้าแล้ว</span>
                  </div>
                  <div id="regExcelUploadedFileMeta" class="text-[10px] text-slate-500 mt-0.5">ขนาด 0 KB • นำเข้า 0 ท่าน</div>
                </div>
              </div>
              <button type="button" onclick="cancelAttendeeExcelImport()" class="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs" title="ยกเลิกไฟล์นี้และลบรายชื่อที่เพิ่งนำเข้าออกจากระบบ">
                <i class="fa-solid fa-trash-can text-xs"></i>
                <span>ยกเลิกไฟล์นี้</span>
              </button>
            </div>
          </div>`;

if (index.includes(oldExcelDropBox)) {
  index = index.replace(oldExcelDropBox, newExcelDropBox);
  console.log('Added regExcelUploadedFileInfo card in view-registration!');
} else {
  console.error('Could not find oldExcelDropBox in index.html');
  process.exit(1);
}

// In Landing Page Card: Also add Active Uploaded File Info banner
const oldLandingButtons = `        <!-- Quick Launch Bar (3 Buttons: Print Standee, Open Mobile Check-in, Import Excel) -->
        <div class="pt-1 flex flex-wrap items-center justify-between gap-2.5">`;

const newLandingButtons = `        <!-- Landing Page Active Uploaded Excel File Banner -->
        <div id="landingExcelUploadedFileInfo" class="hidden bg-emerald-50/90 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <i class="fa-solid fa-file-excel text-emerald-600 text-base"></i>
            <div class="min-w-0">
              <span id="landingExcelUploadedFileName" class="font-bold text-slate-800 truncate block">ไฟล์ที่โหลดล่าสุด</span>
              <span id="landingExcelUploadedFileMeta" class="text-[10px] text-slate-500">ข้อมูลนำเข้าในระบบ</span>
            </div>
          </div>
          <button type="button" onclick="cancelAttendeeExcelImport()" class="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0">
            <i class="fa-solid fa-xmark"></i>
            <span>ยกเลิกไฟล์</span>
          </button>
        </div>

        <!-- Quick Launch Bar (3 Buttons: Print Standee, Open Mobile Check-in, Import Excel) -->
        <div class="pt-1 flex flex-wrap items-center justify-between gap-2.5">`;

if (index.includes(oldLandingButtons)) {
  index = index.replace(oldLandingButtons, newLandingButtons);
  console.log('Added landingExcelUploadedFileInfo banner in Landing Page Card!');
}

console.log('--- 2. ADDING UPLOADED FILE INFO & CANCELLATION FOR SPEAKER SIGNATURE ---');

// In Speaker Signature Modal
const oldSpkActions = `      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <button type="button" onclick="clearSpeakerSigCanvas()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer">
            <i class="fa-solid fa-rotate-left mr-1"></i>ล้าง
          </button>
          <button type="button" onclick="document.getElementById('spkSigFileInput').click()" class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1" title="อัปโหลดภาพลายเซ็น (PNG/JPG)">
            <i class="fa-solid fa-image text-purple-600"></i>
            <span>แนบไฟล์ภาพ</span>
          </button>
        </div>`;

const newSpkActions = `      <!-- Active Uploaded Signature File Tag -->
      <div id="spkSigUploadedFileInfo" class="hidden bg-purple-50/90 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <i class="fa-solid fa-image text-purple-600"></i>
          <div class="min-w-0">
            <span id="spkSigUploadedFileName" class="font-bold text-slate-800 truncate block">ชื่อไฟล์ภาพ.png</span>
            <span id="spkSigUploadedFileMeta" class="text-[10px] text-slate-500">ขนาด 0 KB</span>
          </div>
        </div>
        <button type="button" onclick="cancelSpeakerSigFileUpload()" class="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0" title="ยกเลิกไฟล์ภาพลายเซ็นนี้">
          <i class="fa-solid fa-trash-can text-[10px]"></i>
          <span>ยกเลิกไฟล์นี้</span>
        </button>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <button type="button" onclick="clearSpeakerSigCanvas()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer">
            <i class="fa-solid fa-rotate-left mr-1"></i>ล้าง
          </button>
          <button type="button" onclick="document.getElementById('spkSigFileInput').click()" class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1" title="อัปโหลดภาพลายเซ็น (PNG/JPG)">
            <i class="fa-solid fa-image text-purple-600"></i>
            <span>แนบไฟล์ภาพ</span>
          </button>
        </div>`;

if (index.includes(oldSpkActions)) {
  index = index.replace(oldSpkActions, newSpkActions);
  console.log('Added spkSigUploadedFileInfo in Speaker Signature Modal!');
}

console.log('--- 3. ADDING SELECTED FILES LIST & CANCELLATION FOR EVENT PHOTOS ---');

const oldEventPhotosUploadArea = `              <input type="file" id="eventPhotoFileInput" multiple accept="image/*" class="hidden" onchange="handleEventPhotoSelected(event)">
              <button type="button" onclick="document.getElementById('eventPhotoFileInput').click()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer">
                <i class="fa-solid fa-folder-open text-[#08539E]"></i>
                <span>เลือกรูปภาพ...</span>
              </button>
              <button type="button" id="btnUploadPhotos" onclick="uploadSelectedEventPhotos()" class="px-4 py-1.5 bg-[#08539E] hover:bg-[#07488a] active:bg-[#063b72] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 cursor-pointer">
                <i class="fa-solid fa-cloud-arrow-up text-amber-300"></i>
                <span>อัปโหลด</span>
              </button>`;

const newEventPhotosUploadArea = `              <input type="file" id="eventPhotoFileInput" multiple accept="image/*" class="hidden" onchange="handleEventPhotoSelected(event)">
              <button type="button" onclick="document.getElementById('eventPhotoFileInput').click()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer">
                <i class="fa-solid fa-folder-open text-[#08539E]"></i>
                <span>เลือกรูปภาพ...</span>
              </button>
              <button type="button" id="btnUploadPhotos" onclick="uploadSelectedEventPhotos()" class="px-4 py-1.5 bg-[#08539E] hover:bg-[#07488a] active:bg-[#063b72] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 cursor-pointer">
                <i class="fa-solid fa-cloud-arrow-up text-amber-300"></i>
                <span>อัปโหลด</span>
              </button>
            </div>

            <!-- Active Selected Event Photos List & Cancellation -->
            <div id="eventPhotosSelectedListContainer" class="hidden bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 space-y-1.5 text-xs text-left">
              <div class="flex items-center justify-between border-b border-blue-200/60 pb-1 text-[11px] font-bold text-blue-900">
                <span id="eventPhotosSelectedCount">เลือกรูปภาพ 0 ไฟล์</span>
                <button type="button" onclick="cancelAllSelectedEventPhotos()" class="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer">
                  <i class="fa-solid fa-xmark"></i>
                  <span>ยกเลิกทั้งหมด</span>
                </button>
              </div>
              <div id="eventPhotosSelectedChips" class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar"></div>`;

if (index.includes(oldEventPhotosUploadArea)) {
  index = index.replace(oldEventPhotosUploadArea, newEventPhotosUploadArea);
  console.log('Added eventPhotosSelectedListContainer for Event Photos!');
}

console.log('--- 4. IMPLEMENTING CONTROLLER JAVASCRIPT FUNCTIONS ---');

const fileCancellationJs = `
    // -------------------------------------------------------------------------
    // FILE MANAGEMENT, DISPLAY & CANCELLATION CONTROLLER
    // -------------------------------------------------------------------------

    // 1. EXCEL ATTENDEE IMPORT FILE MANAGEMENT
    function renderUploadedExcelFileInfo(eventId) {
      const eid = eventId || currentRegEventId;
      if (!eid) return;

      const metaKey = 'twp_last_excel_' + eid;
      let meta = null;
      try {
        const stored = localStorage.getItem(metaKey);
        if (stored) meta = JSON.parse(stored);
      } catch(e) {}

      const card = document.getElementById('regExcelUploadedFileInfo');
      const nameEl = document.getElementById('regExcelUploadedFileName');
      const metaEl = document.getElementById('regExcelUploadedFileMeta');

      const landingCard = document.getElementById('landingExcelUploadedFileInfo');
      const landingNameEl = document.getElementById('landingExcelUploadedFileName');
      const landingMetaEl = document.getElementById('landingExcelUploadedFileMeta');

      if (meta && meta.fileName) {
        const text = \`ขนาด \${meta.fileSize || '0 KB'} • นำเข้าสำเร็จ \${meta.count || 0} ท่าน • \${meta.time || ''}\`;
        if (card && nameEl && metaEl) {
          nameEl.innerText = meta.fileName;
          metaEl.innerText = text;
          card.classList.remove('hidden');
        }
        if (landingCard && landingNameEl && landingMetaEl) {
          landingNameEl.innerText = meta.fileName;
          landingMetaEl.innerText = text;
          landingCard.classList.remove('hidden');
        }
      } else {
        if (card) card.classList.add('hidden');
        if (landingCard) landingCard.classList.add('hidden');
      }
    }

    function cancelAttendeeExcelImport() {
      const eventId = currentRegEventId || currentLandingRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) return;

      const metaKey = 'twp_last_excel_' + eventId;
      let meta = null;
      try {
        const stored = localStorage.getItem(metaKey);
        if (stored) meta = JSON.parse(stored);
      } catch(e) {}

      const fileName = meta?.fileName || 'ไฟล์ Excel ที่โหลดเข้าล่าสุด';
      const count = meta?.count || 0;

      const confirmCancel = confirm(\`คุณต้องการยกเลิกไฟล์: "\\n\${fileName}"\\n\\nและล้างรายชื่อที่เพิ่งนำเข้า (\${count} ท่าน) ออกจากโครงการ \${eventId} ใช่หรือไม่?\`);
      if (!confirmCancel) return;

      // Remove imported attendees belonging to this batch
      if (meta && Array.isArray(meta.attendeeRegIds) && meta.attendeeRegIds.length > 0) {
        const idSet = new Set(meta.attendeeRegIds);
        currentRegAttendees = (currentRegAttendees || []).filter(a => !idSet.has(a.regId));
      } else {
        // Fallback: clear PRE registered attendees of this event
        currentRegAttendees = (currentRegAttendees || []).filter(a => a.regType === 'WALKIN');
      }

      // Update storage
      localStorage.setItem('twp_onsite_attendees_' + eventId, JSON.stringify(currentRegAttendees));
      localStorage.removeItem(metaKey);

      // Reset file input
      const fileInp = document.getElementById('regExcelFileInput');
      if (fileInp) fileInp.value = '';

      // Hide display cards
      renderUploadedExcelFileInfo(eventId);

      // Post update to backend
      if (AppState.gasEndpoint) {
        postToBackend('IMPORT_REGISTRATIONS', {
          eventId: eventId,
          participants: currentRegAttendees,
          attendees: currentRegAttendees
        }).catch(e => console.log('Offline cancelled'));
      }

      updateRegKpis();
      filterAttendeeTable();
      updateLandingRegCard();
      showAlert(\`ยกเลิกไฟล์ "\${fileName}" และล้างรายชื่อเรียบร้อยแล้ว\`, 'info');
    }

    // 2. SPEAKER SIGNATURE FILE MANAGEMENT
    function displayUploadedSpeakerSigFileInfo(file) {
      if (!file) return;
      const card = document.getElementById('spkSigUploadedFileInfo');
      const nameEl = document.getElementById('spkSigUploadedFileName');
      const metaEl = document.getElementById('spkSigUploadedFileMeta');
      if (card && nameEl && metaEl) {
        nameEl.innerText = file.name;
        metaEl.innerText = \`ขนาด \${(file.size / 1024).toFixed(1)} KB • ไฟล์ภาพลายเซ็น\`;
        card.classList.remove('hidden');
      }
    }

    function cancelSpeakerSigFileUpload() {
      clearSpeakerSigCanvas();
      spkUploadedSigDataUrl = null;
      const fileInp = document.getElementById('spkSigFileInput');
      if (fileInp) fileInp.value = '';
      const card = document.getElementById('spkSigUploadedFileInfo');
      if (card) card.classList.add('hidden');
      const ph = document.getElementById('spkSigPlaceholder');
      if (ph) ph.style.display = 'flex';
      showAlert('ยกเลิกไฟล์ภาพลายเซ็นเรียบร้อยแล้ว', 'info');
    }

    // 3. EVENT PHOTOS FILE MANAGEMENT
    function renderSelectedEventPhotosChips() {
      const container = document.getElementById('eventPhotosSelectedListContainer');
      const chipsEl = document.getElementById('eventPhotosSelectedChips');
      const countEl = document.getElementById('eventPhotosSelectedCount');
      if (!container || !chipsEl || !countEl) return;

      const files = selectedEventPhotosToUpload || [];
      if (files.length === 0) {
        container.classList.add('hidden');
        return;
      }

      countEl.innerText = \`เลือกรูปภาพ \${files.length} ไฟล์ พร้อมอัปโหลด\`;
      chipsEl.innerHTML = files.map((f, idx) => \`
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-[11px] font-medium text-slate-700 shadow-2xs">
          <i class="fa-solid fa-image text-blue-600 text-[10px]"></i>
          <span class="max-w-[140px] truncate">\${f.name}</span>
          <span class="text-[9px] text-slate-400 font-mono">(\${(f.size/1024).toFixed(0)}KB)</span>
          <button type="button" onclick="removeSingleSelectedPhoto(\${idx})" class="text-rose-500 hover:text-rose-700 p-0.5 ml-0.5 cursor-pointer" title="ลบไฟล์นี้">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </span>
      \`).join('');

      container.classList.remove('hidden');
    }

    function removeSingleSelectedPhoto(index) {
      if (!selectedEventPhotosToUpload) return;
      selectedEventPhotosToUpload.splice(index, 1);
      renderSelectedEventPhotosChips();
    }

    function cancelAllSelectedEventPhotos() {
      selectedEventPhotosToUpload = [];
      const fileInp = document.getElementById('eventPhotoFileInput');
      if (fileInp) fileInp.value = '';
      renderSelectedEventPhotosChips();
      showAlert('ยกเลิกไฟล์ภาพที่เลือกทั้งหมดแล้ว', 'info');
    }
`;

// Insert fileCancellationJs right before renderDashboardArchives
const insertHook = 'function renderDashboardArchives() {';
if (index.includes(insertHook)) {
  index = index.replace(insertHook, fileCancellationJs + '\n    ' + insertHook);
  console.log('Inserted fileCancellationJs functions successfully!');
} else {
  console.error('Could not find insertHook');
  process.exit(1);
}

// Update handleAttendeeExcelImport to record metadata and show info card
const oldImportSuccess = `          showAlert(\`นำเข้ารายชื่อผู้เข้าอบรมสำเร็จ \${parsedAttendees.length} ท่าน\`, 'success');
          updateRegKpis();
          filterAttendeeTable();`;

const newImportSuccess = `          // Record last uploaded Excel metadata
          const lastExcelMeta = {
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
            count: parsedAttendees.length,
            eventId: eventId,
            attendeeRegIds: parsedAttendees.map(a => a.regId)
          };
          localStorage.setItem('twp_last_excel_' + eventId, JSON.stringify(lastExcelMeta));
          renderUploadedExcelFileInfo(eventId);

          showAlert(\`นำเข้ารายชื่อจาก "\${file.name}" สำเร็จ \${parsedAttendees.length} ท่าน\`, 'success');
          updateRegKpis();
          filterAttendeeTable();
          updateLandingRegCard();`;

if (index.includes(oldImportSuccess)) {
  index = index.replace(oldImportSuccess, newImportSuccess);
  console.log('Updated handleAttendeeExcelImport to record metadata and update UI!');
}

// In openOnsiteRegistrationModal, render uploaded file info card
const oldOpenRegModal = `      currentRegEventId = eventId;
      const select = document.getElementById('regEventSelect');`;

const newOpenRegModal = `      currentRegEventId = eventId;
      renderUploadedExcelFileInfo(eventId);
      const select = document.getElementById('regEventSelect');`;

if (index.includes(oldOpenRegModal)) {
  index = index.replace(oldOpenRegModal, newOpenRegModal);
  console.log('Added renderUploadedExcelFileInfo in openOnsiteRegistrationModal!');
}

// In handleSpeakerSigFileUpload, display uploaded file info
const oldSpkUploadSuccess = `        spkUploadedSigDataUrl = dataUrl;
        hasDrawnSpkSig = true;`;

const newSpkUploadSuccess = `        spkUploadedSigDataUrl = dataUrl;
        hasDrawnSpkSig = true;
        displayUploadedSpeakerSigFileInfo(file);`;

if (index.includes(oldSpkUploadSuccess)) {
  index = index.replace(oldSpkUploadSuccess, newSpkUploadSuccess);
  console.log('Added displayUploadedSpeakerSigFileInfo in handleSpeakerSigFileUpload!');
}

// In handleEventPhotoSelected, render selected event photos chips
const oldEventPhotoSelected = `    function handleEventPhotoSelected(e) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      selectedEventPhotosToUpload = files;
      showAlert('เลือกรูปภาพ ' + files.length + ' ภาพ พร้อมอัปโหลด', 'info');
    }`;

const newEventPhotoSelected = `    function handleEventPhotoSelected(e) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      selectedEventPhotosToUpload = files;
      renderSelectedEventPhotosChips();
      showAlert('เลือกรูปภาพ ' + files.length + ' ภาพ พร้อมอัปโหลด (สามารถลบหรือยกเลิกได้ด้านบน)', 'info');
    }`;

if (index.includes(oldEventPhotoSelected)) {
  index = index.replace(oldEventPhotoSelected, newEventPhotoSelected);
  console.log('Updated handleEventPhotoSelected to render chips with cancel buttons!');
}

// In importSystemBackupJson, add confirmation dialog showing filename and size
const oldImportJson = `    function importSystemBackupJson(e) {
      const file = e.target.files[0];
      if (!file) return;`;

const newImportJson = `    function importSystemBackupJson(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const sizeKb = (file.size / 1024).toFixed(1);
      const confirmImport = confirm(\`คุณต้องการนำเข้าไฟล์สำรองข้อมูล:\\n"\${file.name}" (\${sizeKb} KB)\\n\\nเพื่อกู้คืนฐานข้อมูลคำขอจัดอบรมใช่หรือไม่? (สามารถกดยกเลิกได้หากเลือกไฟล์ผิด)\`);
      if (!confirmImport) {
        e.target.value = '';
        showAlert('ยกเลิกการนำเข้าไฟล์สำรองข้อมูลแล้ว', 'info');
        return;
      }`;

if (index.includes(oldImportJson)) {
  index = index.replace(oldImportJson, newImportJson);
  console.log('Updated importSystemBackupJson with confirmation and cancel protection!');
}

// In updateLandingRegCard, also call renderUploadedExcelFileInfo
const oldUpdateLanding = `      if (elWalkin) elWalkin.innerText = walkin;
      if (elPct) elPct.innerText = pct + '% ของเป้าหมาย';`;

const newUpdateLanding = `      if (elWalkin) elWalkin.innerText = walkin;
      if (elPct) elPct.innerText = pct + '% ของเป้าหมาย';
      renderUploadedExcelFileInfo(eventId);`;

if (index.includes(oldUpdateLanding)) {
  index = index.replace(oldUpdateLanding, newUpdateLanding);
  console.log('Added renderUploadedExcelFileInfo in updateLandingRegCard!');
}

fs.writeFileSync('index.html', index, 'utf8');
fs.writeFileSync('frontend/index.html', index, 'utf8');
console.log('index.html and frontend/index.html updated successfully with complete file management!');
