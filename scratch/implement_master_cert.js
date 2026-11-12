const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

// 1. Add Tab Switcher Buttons into ppcReportModal
const oldModalTopBarEnd = `<button onclick="closePpcReportModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
      </div>

      <!-- Scrollable A4 Document Paper Container -->`;

const newModalTopBarEnd = `<button onclick="closePpcReportModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
      </div>

      <!-- Document Type Selector Tabs (PPC Standards & Master e-Certificate) -->
      <div class="flex flex-wrap items-center justify-between bg-slate-100/90 p-1.5 rounded-xl text-xs font-bold gap-1.5 mt-2.5 border border-slate-200">
        <div class="flex flex-wrap items-center gap-1">
          <button type="button" onclick="switchReportDocType('MEMO')" id="btnDocTypeMemo" class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-file-invoice text-blue-600"></i>
            <span>บันทึกขออนุมัติ A4</span>
          </button>
          <button type="button" onclick="switchReportDocType('EVAL_REPORT')" id="btnDocTypeEval" class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-chart-column text-purple-600"></i>
            <span>รายงานประเมิน A4</span>
          </button>
          <button type="button" onclick="switchReportDocType('SUMMARY')" id="btnDocTypeSummary" class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-table-list text-emerald-600"></i>
            <span>สรุปโครงการ (PPC)</span>
          </button>
          <button type="button" onclick="switchReportDocType('CERTIFICATE')" id="btnDocTypeCert" class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-award text-amber-500"></i>
            <span>แม่แบบวุฒิบัตรกลาง A4 แนวนอน</span>
          </button>
        </div>
        <div id="certPreviewHelperInfo" class="hidden text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
          <i class="fa-solid fa-circle-info text-amber-600"></i>
          <span>แม่แบบกลาง (เว้นชื่อผู้เข้าอบรมไว้ • ไม่ทับซ้อนกับวุฒิบัตรรายบุคคล)</span>
        </div>
      </div>

      <!-- Scrollable A4 Document Paper Container -->`;

if (index.includes(oldModalTopBarEnd)) {
  index = index.replace(oldModalTopBarEnd, newModalTopBarEnd);
  console.log('Added Document Type Selector Tabs successfully!');
} else {
  console.error('Could not find oldModalTopBarEnd in index.html');
  process.exit(1);
}

// 2. Update switchReportDocType
const oldSwitchFnStart = `    function switchReportDocType(type) {
      currentReportDocType = type;
      const btnMemo = document.getElementById('btnDocTypeMemo');
      const btnEval = document.getElementById('btnDocTypeEval');
      const btnSummary = document.getElementById('btnDocTypeSummary');
      const mainTitle = document.getElementById('reportModalMainTitle');

      const activeClass = 'px-3 py-1.5 rounded-lg bg-[#08539E] text-white shadow-sm transition';
      const inactiveClass = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition';

      if (btnMemo) btnMemo.className = type === 'MEMO' ? activeClass : inactiveClass;
      if (btnEval) btnEval.className = type === 'EVAL_REPORT' ? activeClass : inactiveClass;
      if (btnSummary) btnSummary.className = type === 'SUMMARY' ? activeClass : inactiveClass;

      if (mainTitle) {
        if (type === 'MEMO') {
          mainTitle.innerText = 'บันทึกข้อความขออนุมัติปฏิบัติงาน A4';
        } else if (type === 'EVAL_REPORT') {
          mainTitle.innerText = 'รายงานผลการประเมิน 10 ข้อและต้นทุนต่อหัว A4';
        } else {
          mainTitle.innerText = 'รายงานสรุปผลการปฏิบัติงานโครงการ (PPC Summary)';
        }
      }

      renderCurrentReportPaper();
    }`;

const newSwitchFn = `    function switchReportDocType(type) {
      currentReportDocType = type;
      const btnMemo = document.getElementById('btnDocTypeMemo');
      const btnEval = document.getElementById('btnDocTypeEval');
      const btnSummary = document.getElementById('btnDocTypeSummary');
      const btnCert = document.getElementById('btnDocTypeCert');
      const mainTitle = document.getElementById('reportModalMainTitle');
      const paper = document.getElementById('ppcReportPaper');
      const helperInfo = document.getElementById('certPreviewHelperInfo');
      const btnDocx = document.getElementById('btnExportDocx');

      const activeClass = 'px-3 py-1.5 rounded-lg bg-[#08539E] text-white shadow-sm transition font-bold';
      const inactiveClass = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition font-medium hover:bg-slate-200/60';

      if (btnMemo) btnMemo.className = (type === 'MEMO' ? activeClass : inactiveClass);
      if (btnEval) btnEval.className = (type === 'EVAL_REPORT' ? activeClass : inactiveClass);
      if (btnSummary) btnSummary.className = (type === 'SUMMARY' ? activeClass : inactiveClass);
      if (btnCert) btnCert.className = (type === 'CERTIFICATE' ? activeClass : inactiveClass);

      if (mainTitle) {
        if (type === 'MEMO') {
          mainTitle.innerText = 'บันทึกข้อความขออนุมัติปฏิบัติงาน A4';
        } else if (type === 'EVAL_REPORT') {
          mainTitle.innerText = 'รายงานผลการประเมิน 10 ข้อและต้นทุนต่อหัว A4';
        } else if (type === 'CERTIFICATE') {
          mainTitle.innerText = 'แม่แบบวุฒิบัตรอิเล็กทรอนิกส์กลาง (Master e-Certificate A4 Landscape)';
        } else {
          mainTitle.innerText = 'รายงานสรุปผลการปฏิบัติงานโครงการ (PPC Summary)';
        }
      }

      if (helperInfo) {
        if (type === 'CERTIFICATE') helperInfo.classList.remove('hidden');
        else helperInfo.classList.add('hidden');
      }

      if (btnDocx) {
        if (type === 'CERTIFICATE') btnDocx.classList.add('hidden');
        else btnDocx.classList.remove('hidden');
      }

      if (paper) {
        if (type === 'CERTIFICATE') {
          paper.style.maxWidth = '920px';
          paper.style.minHeight = 'auto';
          paper.style.padding = '12px';
          paper.style.border = 'none';
          paper.style.boxShadow = 'none';
          paper.style.background = 'transparent';
        } else {
          paper.style.maxWidth = '794px';
          paper.style.minHeight = '1123px';
          paper.style.padding = '32px';
          paper.style.border = '1px solid #cbd5e1';
          paper.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          paper.style.background = '#ffffff';
        }
      }

      renderCurrentReportPaper();
    }`;

if (index.includes(oldSwitchFnStart)) {
  index = index.replace(oldSwitchFnStart, newSwitchFn);
  console.log('Updated switchReportDocType successfully!');
} else {
  console.error('Could not find oldSwitchFnStart');
  process.exit(1);
}

// 3. Update renderCurrentReportPaper to dispatch CERTIFICATE
const oldDispatchBlock = `      if (currentReportDocType === 'MEMO') {
        paper.innerHTML = renderA4MemoHtmlClient(d);
      } else if (currentReportDocType === 'EVAL_REPORT') {
        paper.innerHTML = renderA4EvalReportHtmlClient(d);
      } else {
        paper.innerHTML = renderPpcReportHtmlClient(d);
      }`;

const newDispatchBlock = `      if (currentReportDocType === 'MEMO') {
        paper.innerHTML = renderA4MemoHtmlClient(d);
      } else if (currentReportDocType === 'EVAL_REPORT') {
        paper.innerHTML = renderA4EvalReportHtmlClient(d);
      } else if (currentReportDocType === 'CERTIFICATE') {
        paper.innerHTML = renderA4CertificateMasterHtmlClient(d);
        generateMasterCertQr(d.eventId);
      } else {
        paper.innerHTML = renderPpcReportHtmlClient(d);
      }`;

if (index.includes(oldDispatchBlock)) {
  index = index.replace(oldDispatchBlock, newDispatchBlock);
  console.log('Updated renderCurrentReportPaper dispatch successfully!');
} else {
  console.error('Could not find oldDispatchBlock');
  process.exit(1);
}

// 4. Update printReportContainer for Landscape Certificate
const oldPrintContainerStart = `    function printReportContainer() {
      const printContents = document.getElementById('ppcReportPaper').innerHTML;
      const docTitle = currentReportDocType === 'MEMO' ? 'บันทึกขออนุมัติปฏิบัติงาน A4 - ' + (currentReportEventId || '') :
                       currentReportDocType === 'EVAL_REPORT' ? 'รายงานผลการประเมิน 10 ข้อและต้นทุนต่อหัว A4 - ' + (currentReportEventId || '') :
                       'รายงานสรุปผลการปฏิบัติงาน PPC - ' + (currentReportEventId || '');
      const win = window.open('', '', 'height=850,width=950');`;

const newPrintContainerStart = `    function printReportContainer() {
      const printContents = document.getElementById('ppcReportPaper').innerHTML;
      const isLandscape = (currentReportDocType === 'CERTIFICATE');
      const docTitle = currentReportDocType === 'MEMO' ? 'บันทึกขออนุมัติปฏิบัติงาน A4 - ' + (currentReportEventId || '') :
                       currentReportDocType === 'EVAL_REPORT' ? 'รายงานผลการประเมิน 10 ข้อและต้นทุนต่อหัว A4 - ' + (currentReportEventId || '') :
                       currentReportDocType === 'CERTIFICATE' ? 'แม่แบบวุฒิบัตรกลาง A4 แนวนอน - ' + (currentReportEventId || '') :
                       'รายงานสรุปผลการปฏิบัติงาน PPC - ' + (currentReportEventId || '');
      const win = window.open('', '', isLandscape ? 'height=750,width=1050' : 'height=850,width=950');`;

if (index.includes(oldPrintContainerStart)) {
  index = index.replace(oldPrintContainerStart, newPrintContainerStart);
  index = index.replace(`            @page { 
              size: A4 portrait; 
              margin: 25mm 20mm 25mm 30mm; 
            }`, `            @page { 
              size: A4 \${isLandscape ? 'landscape' : 'portrait'}; 
              margin: \${isLandscape ? '8mm' : '25mm 20mm 25mm 30mm'}; 
            }`);
  console.log('Updated printReportContainer for Landscape successfully!');
} else {
  console.error('Could not find oldPrintContainerStart');
  process.exit(1);
}

// 5. Add renderA4CertificateMasterHtmlClient, generateMasterCertQr, and testPreviewCertName functions
const helperFns = `
    // -------------------------------------------------------------------------
    // MASTER E-CERTIFICATE RENDERER (A4 LANDSCAPE CENTRAL TEMPLATE)
    // -------------------------------------------------------------------------
    const TWP_EXECUTIVE_SIG_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="50" viewBox="0 0 180 50"><path d="M15 35 Q 35 10, 60 25 T 100 20 T 140 28 Q 160 35, 170 20" stroke="#08539E" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M45 28 Q 65 42, 85 22 T 120 32" stroke="#08539E" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M75 15 L 75 38" stroke="#08539E" stroke-width="1.8" fill="none"/></svg>');
    const TWP_SPEAKER_SIG_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="50" viewBox="0 0 180 50"><path d="M20 30 C 40 10, 50 40, 70 20 C 90 5, 110 35, 130 15 C 145 2, 160 25, 170 18" stroke="#334155" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M50 35 Q 80 45, 110 32" stroke="#334155" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>');

    function renderA4CertificateMasterHtmlClient(d) {
      const speakerName = d.teamBSpeaker || d.speakerType || 'ศ.ดร.ประสาน ปัญญาเลิศ';
      const speakerRole = d.speakerType || 'วิทยากรประจำหลักสูตร';
      
      // Determine speaker signature
      const speakerSigSrc = d.speakerSignature || TWP_SPEAKER_SIG_SVG;
      const execSigSrc = (d.approverSignature && d.approverSignature !== 'OFFICIAL_DIGITAL_SIGNATURE')
        ? d.approverSignature
        : TWP_EXECUTIVE_SIG_SVG;

      // Count registered attendees for this event if available
      const localStoreKey = 'twp_onsite_attendees_' + d.eventId;
      let regCount = 0;
      let checkedInCount = 0;
      try {
        const cached = localStorage.getItem(localStoreKey);
        if (cached) {
          const list = JSON.parse(cached);
          if (Array.isArray(list)) {
            regCount = list.length;
            checkedInCount = list.filter(a => a.checkinStatus === 'CHECKED_IN').length;
          }
        }
      } catch(e) {}

      return \`
        <div class="space-y-4">
          
          <!-- Master Template Notice Banner (Excluded from Print) -->
          <div class="no-print bg-gradient-to-r from-[#08539E] via-blue-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/15">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-lg">
                  <i class="fa-solid fa-award"></i>
                </div>
                <div>
                  <h4 class="text-sm font-black tracking-wide flex items-center gap-2">
                    <span>แม่แบบวุฒิบัตรอิเล็กทรอนิกส์กลาง (Master e-Certificate)</span>
                    <span id="masterCertStatusBadge" class="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold px-2 py-0.5 rounded-full">
                      แม่แบบกลาง (เว้นชื่อผู้เข้าอบรม)
                    </span>
                  </h4>
                  <p class="text-[11px] text-blue-200">
                    แสดงโครงร่างมาตรฐาน A4 แนวนอน สำหรับโครงการ \${d.eventId} • ส่วนชื่อผู้เข้าอบรมจะถูกพิมพ์ลงไปโดยอัตโนมัติเมื่อผู้เข้าอบรมเช็กชื่อหรือทำแบบประเมิน
                  </p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 self-end sm:self-center">
                <button type="button" onclick="printReportContainer()" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <i class="fa-solid fa-print"></i>
                  <span>พิมพ์แม่แบบ A4 แนวนอน</span>
                </button>
                <button type="button" onclick="closePpcReportModal(); openOnsiteRegistrationModal('\${d.eventId}');" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-users"></i>
                  <span>รายชื่อผู้รับวุฒิบัตร (\${checkedInCount}/\${regCount || d.expectedTrainees} คน)</span>
                </button>
              </div>
            </div>

            <!-- Live Name Simulator for Admin Inspection -->
            <div class="bg-white/10 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2 text-blue-100">
                <i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i>
                <span>ทดลองจำลองชื่อผู้เข้าอบรมเพื่อดูการจัดวาง:</span>
              </div>
              <div class="flex items-center gap-2 flex-1 max-w-md">
                <input type="text" id="inputMasterCertSimName" oninput="testPreviewCertName(this.value)" placeholder="พิมพ์ชื่อทดสอบ เช่น นายสมชาย มุ่งมั่นพัฒนา" class="bg-white text-slate-800 px-3 py-1 rounded-lg text-xs w-full focus:outline-none font-medium">
                <button type="button" onclick="resetMasterCertSimName()" class="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer">
                  ล้างค่า
                </button>
              </div>
            </div>
          </div>

          <!-- THE PRINTABLE MASTER E-CERTIFICATE (A4 LANDSCAPE RATIO) -->
          <div id="masterPrintableCertArea" style="background:#ffffff; border:8px solid #08539E; outline:3px solid #C5A059; outline-offset:-5px; padding:32px 36px; min-height:560px; display:flex; flex-direction:column; justify-content:space-between; position:relative; box-shadow:0 12px 32px rgba(0,0,0,0.12); text-align:center; box-sizing:border-box; border-radius:4px;">
            
            <!-- Subtle Watermark -->
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0.04; pointer-events:none; z-index:1;">
              <img src="assets/logo.png" style="width:230px; height:230px; object-fit:contain;">
            </div>

            <!-- HEADER -->
            <div style="position:relative; z-index:2;">
              <img src="assets/logo.png" alt="TWP Logo" style="height:48px; margin:0 auto 6px; display:block; object-fit:contain;">
              <div style="font-size:20pt; font-weight:900; color:#08539E; line-height:1.1; font-family:'Sarabun',sans-serif;">
                สำนักพิมพ์ไทยวัฒนาพานิช
              </div>
              <div style="font-size:8.5pt; font-weight:700; color:#64748b; letter-spacing:3px; text-transform:uppercase; font-family:serif;">
                THAI WATANA PANICH PUBLISHING HOUSE
              </div>
              
              <div style="margin-top:10px;">
                <div style="font-size:13.5pt; font-weight:800; color:#b45309; letter-spacing:0.5px;">
                  วุฒิบัตรการฝึกอบรมพัฒนาวิชาชีพทางการศึกษา
                </div>
                <div style="font-size:9.5pt; color:#64748b; font-style:italic; font-family:serif;">
                  Certificate of Professional Educational Development
                </div>
              </div>

              <div style="font-size:10pt; color:#475569; margin-top:8px; font-weight:500;">
                วุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
              </div>
            </div>

            <!-- CENTRAL PARTICIPANT PLACEHOLDER -->
            <div style="position:relative; z-index:2; margin:14px 0;">
              <div style="display:inline-block; padding:4px 32px; border-bottom:2px dashed #08539E; min-width:320px;">
                <span id="masterCertNameThDisplay" style="font-size:20pt; font-weight:800; color:#08539E; letter-spacing:0.5px; font-family:'Sarabun',sans-serif;">
                  [ ชื่อ - นามสกุล ผู้เข้าร่วมการอบรม ]
                </span>
              </div>
              <div id="masterCertNameEnDisplay" style="font-size:11pt; font-style:italic; color:#64748b; margin-top:4px; font-family:serif;">
                [ Participant Full Name ]
              </div>
              <div style="font-size:11pt; font-weight:600; color:#334155; margin-top:4px;">
                \${d.schoolName}
              </div>
            </div>

            <!-- COURSE & ACHIEVEMENT DETAILS -->
            <div style="position:relative; z-index:2; margin-bottom:12px;">
              <div style="font-size:10.5pt; color:#475569;">
                ได้ผ่านการฝึกอบรมเชิงปฏิบัติการตามโครงการพัฒนาศักยภาพครูผู้สอน หลักสูตร:
              </div>
              <div style="font-size:15.5pt; font-weight:800; color:#08539E; margin:4px 0; line-height:1.25; font-family:'Sarabun',sans-serif;">
                “\${d.courseTopic}”
              </div>
              <div style="font-size:10pt; color:#64748b;">
                ให้ไว้ ณ วันที่ \${d.eventDate}
              </div>
            </div>

            <!-- SIGNATURES & OFFICIAL SEAL SECTION -->
            <div style="position:relative; z-index:2; border-top:1px solid #e2e8f0; padding-top:12px; display:grid; grid-template-columns:1fr auto 1fr; align-items:flex-end;">
              
              <!-- Speaker Signature Column -->
              <div style="text-align:center;">
                <div style="height:42px; display:flex; align-items:flex-end; justify-content:center; margin-bottom:4px;">
                  <img src="\${speakerSigSrc}" style="max-height:40px; max-width:140px; object-fit:contain;" alt="ลายเซ็นวิทยากร">
                </div>
                <div style="font-size:11pt; font-weight:700; color:#1e293b;">( \${speakerName} )</div>
                <div style="font-size:9pt; color:#64748b;">\${speakerRole}</div>
                <div style="font-size:8.5pt; color:#94a3b8;">ฝ่ายพัฒนาวิชาการและนวัตกรรมการเรียนรู้</div>
              </div>

              <!-- Center Gold TWP Emblem Seal -->
              <div style="text-align:center; padding:0 20px;">
                <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #fef3c7, #fde68a); border:1.5px solid #d97706; display:flex; align-items:center; justify-content:center; margin:0 auto 3px; box-shadow:0 2px 6px rgba(217,119,6,0.2);">
                  <img src="assets/logo.png" style="width:28px; height:28px; object-fit:contain; opacity:0.85;">
                </div>
                <div style="font-size:7.5pt; font-weight:700; color:#94a3b8; letter-spacing:1px;">THAI WATANA PANICH</div>
              </div>

              <!-- Executive Director Signature Column -->
              <div style="text-align:center;">
                <div style="height:42px; display:flex; align-items:flex-end; justify-content:center; margin-bottom:4px;">
                  <img src="\${execSigSrc}" style="max-height:40px; max-width:140px; object-fit:contain;" alt="ลายเซ็นผู้บริหาร">
                </div>
                <div style="font-size:11pt; font-weight:700; color:#1e293b;">( \${d.approvedBy || 'ผศ.อินทิรา บุนนาค'} )</div>
                <div style="font-size:9pt; color:#64748b;">\${d.approverRole || 'กรรมการผู้จัดการ'}</div>
                <div style="font-size:8.5pt; color:#08539E; font-weight:600;">บริษัท ไทยวัฒนาพานิช จำกัด</div>
              </div>

            </div>

            <!-- BOTTOM BORDER STRIP: DOCUMENT ID & VERIFICATION QR -->
            <div style="position:relative; z-index:2; margin-top:10px; padding-top:6px; border-top:1px dashed #cbd5e1; display:flex; align-items:center; justify-content:space-between; font-size:8pt; color:#64748b;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700; color:#08539E;">รหัสแม่แบบวุฒิบัตร:</span>
                <span style="font-family:monospace; font-weight:700; background:#f1f5f9; padding:1px 6px; rounded:4px;">TWP-MASTER-\${d.eventId}</span>
                <span style="color:#94a3b8;">• สถานะ: แม่แบบกลางประจำโครงการ</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="masterCertQrContainer" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center;"></div>
                <div style="text-align:right; font-size:7.5pt; line-height:1.2;">
                  <div style="font-weight:700; color:#08539E;">TWP Official e-Certificate Standard</div>
                  <div style="color:#94a3b8;">วุฒิบัตรรายบุคคลออกผ่านระบบลงทะเบียน & ประเมิน</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      \`;
    }

    function generateMasterCertQr(eventId) {
      setTimeout(() => {
        const qrWrap = document.getElementById('masterCertQrContainer');
        if (!qrWrap || !window.QRCode) return;
        qrWrap.innerHTML = '';
        const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
        const verifyUrl = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}\`;
        new QRCode(qrWrap, {
          text: verifyUrl,
          width: 36,
          height: 36,
          colorDark: '#08539E',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }, 50);
    }

    function testPreviewCertName(val) {
      const elTh = document.getElementById('masterCertNameThDisplay');
      const elEn = document.getElementById('masterCertNameEnDisplay');
      const badge = document.getElementById('masterCertStatusBadge');
      if (!elTh) return;
      
      const trimmed = (val || '').trim();
      if (trimmed) {
        elTh.innerText = trimmed;
        elTh.style.color = '#08539E';
        if (elEn) elEn.innerText = 'Mr. / Ms. Participant Name Preview';
        if (badge) badge.innerHTML = '<span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ตัวอย่างจำลองชื่อ (Live Preview)</span>';
      } else {
        elTh.innerText = '[ ชื่อ - นามสกุล ผู้เข้าร่วมการอบรม ]';
        elTh.style.color = '#08539E';
        if (elEn) elEn.innerText = '[ Participant Full Name ]';
        if (badge) badge.innerHTML = '<span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">แม่แบบกลาง (เว้นชื่อผู้เข้าอบรม)</span>';
      }
    }

    function resetMasterCertSimName() {
      const inp = document.getElementById('inputMasterCertSimName');
      if (inp) inp.value = '';
      testPreviewCertName('');
    }
`;

const insertIndex = index.indexOf('function renderA4EvalReportHtmlClient(d) {');
if (insertIndex !== -1) {
  index = index.substring(0, insertIndex) + helperFns + '\n' + index.substring(insertIndex);
  console.log('Inserted helper functions successfully!');
} else {
  console.error('Could not find insert position for helper functions');
  process.exit(1);
}

fs.writeFileSync('index.html', index, 'utf8');
console.log('index.html successfully updated with Master e-Certificate!');
