const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let rawContent = fs.readFileSync(indexPath, 'utf8');
const isCrlf = rawContent.includes('\r\n');
let content = rawContent.replace(/\r\n/g, '\n');

function replaceOnce(search, replace, label) {
  const normSearch = search.replace(/\r\n/g, '\n');
  const normReplace = replace.replace(/\r\n/g, '\n');
  const count = content.split(normSearch).length - 1;
  if (count !== 1) {
    throw new Error(`Replacement failed for [${label}]: found ${count} occurrences, expected 1.`);
  }
  content = content.replace(normSearch, normReplace);
  console.log(`✓ Replaced [${label}] successfully.`);
}

// 1. Head & Title & SheetJS
replaceOnce(
  `<title>Training Center TWP - ระบบบริหารคำขอจัดอบรมและประเมินผล v1.18.1</title>`,
  `<title>Training Center TWP - ระบบบริหารคำขอจัดอบรมและประเมินผล v1.19.0</title>`,
  'Title Version Bump'
);

replaceOnce(
  `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>`,
  `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n  <!-- SheetJS library for Excel import (.xlsx / .csv) -->\n  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>`,
  'SheetJS CDN'
);

// 2. Top Header: User Profile Pill
const targetHeaderLandingBtn = `          <!-- Landing Page Button -->
          <button onclick="showLandingPage()" title="กลับหน้าแรก Landing Page" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0">`;

const headerUserPill = `          <!-- Operator / User Identity Selector Pill (Top Header) -->
          <div onclick="openSwitchProfileModal()" title="คลิกเพื่อสลับผู้ใช้งานหรือเปลี่ยนทีม (Switch User / Team Profile)" class="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl cursor-pointer transition shadow-2xs shrink-0">
            <div class="w-6 h-6 rounded-full bg-[#08539E] text-white flex items-center justify-center text-[10px] font-bold">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="text-left leading-tight hidden sm:block">
              <div class="flex items-center gap-1.5">
                <span id="headerOperatorName" class="text-xs font-bold text-slate-800">ผู้ใช้งาน</span>
                <span id="headerOperatorTeamBadge" class="text-[9px] px-1.5 py-0.2 bg-blue-600 text-white font-bold rounded-md">ส่วนกลาง</span>
              </div>
              <div id="headerOperatorMeta" class="text-[9px] text-slate-500 font-medium">เจ้าหน้าที่ปฏิบัติการ • TWP</div>
            </div>
            <i class="fa-solid fa-chevron-down text-slate-400 text-[10px] ml-0.5"></i>
          </div>

          <!-- Landing Page Button -->
          <button onclick="showLandingPage()" title="กลับหน้าแรก Landing Page" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0">`;

replaceOnce(targetHeaderLandingBtn, headerUserPill, 'Header User Selector Pill');

// 3. Sidebar Button: Add Onsite Registration button
const targetSideEvalBtn = `          <button onclick="switchTab('evaluation')" id="sideBtn-evaluation" class="sidebar-nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-medium text-blue-100 cursor-pointer" title="5. แท่น QR & ผลประเมินปิดลูป">
            <i class="fa-solid fa-qrcode sidebar-icon text-indigo-400 w-5 text-center mr-3 text-sm"></i>
            <span class="sidebar-text truncate">5. แท่น QR & ประเมิน</span>
          </button>`;

const sideRegBtn = `          <button onclick="switchTab('evaluation')" id="sideBtn-evaluation" class="sidebar-nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-medium text-blue-100 cursor-pointer" title="5. แท่น QR & ผลประเมินปิดลูป">
            <i class="fa-solid fa-qrcode sidebar-icon text-indigo-400 w-5 text-center mr-3 text-sm"></i>
            <span class="sidebar-text truncate">5. แท่น QR & ประเมิน</span>
          </button>

          <button onclick="switchTab('registration')" id="sideBtn-registration" class="sidebar-nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-blue-100 cursor-pointer" title="6. ลงทะเบียนหน้างาน & นำเข้า Excel">
            <div class="flex items-center min-w-0">
              <i class="fa-solid fa-id-card-clip sidebar-icon text-amber-300 w-5 text-center mr-3 text-sm"></i>
              <span class="sidebar-text truncate">6. ลงทะเบียนหน้างาน</span>
            </div>
            <span id="sideBadgeRegistration" class="sidebar-badge-full bg-amber-500/40 text-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">QR</span>
          </button>`;

replaceOnce(targetSideEvalBtn, sideRegBtn, 'Sidebar Registration Button');

// 4. Team A Form: Support Needs Checkboxes
const targetTeamASupport = `            <div class="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
              <i class="fa-solid fa-hotel text-indigo-600"></i>
              <span>ความต้องการสนับสนุนด้านสถานที่พัก และ ยานพาหนะรับ-ส่ง</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- ส่วนห้องพัก -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needAccommodation" onchange="toggleAccommodationFields(this.checked)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการห้องพัก</span>
                  </label>
                  <span id="accomBadge" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">ไม่ต้องการ</span>
                </div>
                <div id="roomCountWrap" class="hidden pt-1">
                  <label class="block text-xs text-slate-600 mb-1">จำนวนห้องพักที่ต้องการ (ห้อง) *</label>
                  <input type="number" id="roomCount" min="1" value="1" placeholder="ระบุจำนวนห้อง..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <!-- ส่วนรถรับ-ส่ง -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needTransportation" onchange="toggleTransportFields(this.checked)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการรถรับ-ส่ง</span>
                  </label>
                  <span id="transBadge" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">ไม่ต้องการ</span>
                </div>
                <div id="transportDetailsWrap" class="hidden pt-1">
                  <label class="block text-xs text-slate-600 mb-1">รายละเอียดเส้นทาง/จุดรับ-ส่ง *</label>
                  <input type="text" id="transportDetails" list="transportDetailsList" placeholder="เลือกหรือพิมพ์ เช่น รถตู้รับ-ส่งสนามบิน-โรงแรม-โรงเรียน..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <datalist id="transportDetailsList"></datalist>
                </div>
              </div>
            </div>`;

const newTeamASupport = `            <div class="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
              <i class="fa-solid fa-hand-holding-heart text-indigo-600"></i>
              <span>ความต้องการสนับสนุนด้านสถานที่พัก รถรับ-ส่ง อาหาร และสื่อส่งเสริม</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- ส่วนห้องพัก -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needAccommodation" onchange="toggleAccommodationFields(this.checked)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการห้องพัก</span>
                  </label>
                  <span id="accomBadge" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">ไม่ต้องการ</span>
                </div>
                <div id="roomCountWrap" class="hidden pt-1">
                  <label class="block text-xs text-slate-600 mb-1">จำนวนห้องพักที่ต้องการ (ห้อง) *</label>
                  <input type="number" id="roomCount" min="1" value="1" placeholder="ระบุจำนวนห้อง..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <!-- ส่วนรถรับ-ส่ง -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needTransportation" onchange="toggleTransportFields(this.checked)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการรถรับ-ส่ง</span>
                  </label>
                  <span id="transBadge" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">ไม่ต้องการ</span>
                </div>
                <div id="transportDetailsWrap" class="hidden pt-1">
                  <label class="block text-xs text-slate-600 mb-1">รายละเอียดเส้นทาง/จุดรับ-ส่ง *</label>
                  <input type="text" id="transportDetails" list="transportDetailsList" placeholder="เลือกหรือพิมพ์ เช่น รถตู้รับ-ส่งสนามบิน-โรงแรม-โรงเรียน..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <datalist id="transportDetailsList"></datalist>
                </div>
              </div>

              <!-- ส่วนอาหาร-เบรค (ใหม่ตามข้อเรียกร้องทีม A) -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needCatering" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการอาหาร-เบรค</span>
                  </label>
                  <span class="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">ระบุความต้องการ</span>
                </div>
                <p class="text-[10px] text-slate-400">ขอรับการสนับสนุนอาหารกลางวัน อาหารว่าง หรือเครื่องดื่มสำหรับผู้เข้าอบรม</p>
              </div>

              <!-- ส่วนสื่อสนับสนุนสินค้า (ใหม่ตามข้อเรียกร้องทีม A) -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needProductMedia" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>ต้องการให้เตรียมสื่อสนับสนุนสินค้า</span>
                  </label>
                  <span class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">สื่อ/แคตตาล็อก</span>
                </div>
                <p class="text-[10px] text-slate-400">เตรียมแคตตาล็อก ตัวอย่างสื่อการสอน หรือชุดสาธิตสินค้าสำหรับจัดแสดง</p>
              </div>

              <!-- ส่วนอื่นๆ ระบุเพิ่มเติม (ใหม่ตามข้อเรียกร้องทีม A) -->
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" id="needOtherSupport" onchange="toggleOtherSupportFields(this.checked)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <span>อื่นๆ (ระบุเพิ่มเติมอิสระ)</span>
                  </label>
                  <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">พิมพ์เพิ่มได้อิสระ</span>
                </div>
                <div id="otherSupportWrap" class="hidden pt-1">
                  <input type="text" id="otherSupportDetails" placeholder="พิมพ์รายละเอียดความต้องการสนับสนุนอื่นๆ เพิ่มเติมที่ต้องการ..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>
            </div>`;

replaceOnce(targetTeamASupport, newTeamASupport, 'Team A Support Checkboxes');

// 5. Add Section: view-registration right after view-evaluation
const targetEvalContainerEnd = `        <div id="approvedEventsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </section>`;

const newRegistrationSection = `        <div id="approvedEventsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- TAB: ONSITE REGISTRATION & CHECK-IN (HYBRID)              -->
    <!-- ======================================================== -->
    <section id="view-registration" class="hidden space-y-6">
      
      <!-- Top Header & Instructions -->
      <div class="bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-amber-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center space-x-2 text-xs text-amber-200">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบเช็กชื่อผู้เข้าอบรมอัจฉริยะ (Hybrid Onsite Check-in System)</span>
          </div>
          <h2 class="text-lg sm:text-xl font-black text-white">ลงทะเบียนหน้างาน • ป้ายตั้งโต๊ะ QR • นำเข้า Excel</h2>
          <p class="text-xs text-amber-100/90 max-w-xl">
            ผู้เข้าอบรมสแกน QR ยืนยันรายชื่อด้วยตนเองผ่านมือถือ (ค้นหาได้ทั้งภาษาไทยและอังกฤษ) หรือลงทะเบียน Walk-in ยอดผู้เข้าร่วมจะซิงค์ตรงเข้าสู่ฝ่ายวิชาการ (ทีม B) เพื่อใช้ออกวุฒิบัตรและประเมินผลโครงการ
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="printOnsiteQrStandee()" class="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-print text-amber-600"></i>
            <span>พิมพ์ป้ายตั้งโต๊ะ A4 QR Standee</span>
          </button>
          <button type="button" onclick="downloadExcelAttendeeTemplate()" class="px-3.5 py-2.5 bg-amber-900/60 hover:bg-amber-900/80 text-white border border-white/20 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer" title="ดาวน์โหลดไฟล์ตัวอย่าง Excel สำหรับกรอกรายชื่อผู้สมัครล่วงหน้า">
            <i class="fa-solid fa-file-excel text-emerald-400"></i>
            <span>แม่แบบ Excel</span>
          </button>
        </div>
      </div>

      <!-- Event Selector & KPI Summary Dashboard -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
            <div>
              <label for="regEventSelect" class="block text-xs font-bold text-slate-800">เลือกโครงการ / หลักสูตรที่กำลังจัดอบรม:</label>
              <p class="text-[11px] text-slate-400">เลือกรหัสโครงการเพื่อเปิดระบบสแกน QR และจัดการรายชื่อ</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <select id="regEventSelect" onchange="onRegEventSelected(this.value)" class="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none min-w-[260px]">
              <!-- Rendered dynamically -->
            </select>
            <button type="button" onclick="syncActiveOnsiteToTeamB()" class="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0" title="ส่งยอดผู้เช็กชื่อจริงเข้าสู่ทีม B ทันที">
              <i class="fa-solid fa-share-from-square text-amber-300"></i>
              <span>ส่งยอดเข้าทีม B</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Metrics -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span class="text-[11px] text-slate-500 block font-medium">รวมผู้มีสิทธิ์ในระบบ</span>
            <span id="kpiRegTotal" class="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-slate-400">คน (Excel + Walk-in)</span>
          </div>

          <div class="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
            <span class="text-[11px] text-emerald-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i>เช็กชื่อเข้างานแล้ว
            </span>
            <span id="kpiRegCheckedIn" class="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5 block">0</span>
            <span id="kpiRegPct" class="text-[10px] text-emerald-600 font-bold">0% ของทั้งหมด</span>
          </div>

          <div class="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
            <span class="text-[11px] text-amber-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-hourglass-half text-amber-600"></i>ยังไม่เช็กชื่อ
            </span>
            <span id="kpiRegPending" class="text-xl sm:text-2xl font-black text-amber-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-amber-700">คน</span>
          </div>

          <div class="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200">
            <span class="text-[11px] text-indigo-800 block font-semibold flex items-center justify-center gap-1">
              <i class="fa-solid fa-user-plus text-indigo-600"></i>Walk-in หน้างาน
            </span>
            <span id="kpiRegWalkin" class="text-xl sm:text-2xl font-black text-indigo-800 font-mono mt-0.5 block">0</span>
            <span class="text-[10px] text-indigo-700">คน</span>
          </div>
        </div>

      </div>

      <!-- Action Grid: Card 1 (A4 QR Standee Preview) & Card 2 (Excel Import) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- Card 1: Printable A4 QR Standee Preview -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-qrcode text-amber-600 text-base"></i>
                <h3 class="text-sm font-bold text-slate-800">ป้ายตั้งโต๊ะสำหรับสแกนเข้างาน (A4 Standee)</h3>
              </div>
              <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">พิมพ์ตั้งโต๊ะ</span>
            </div>
            <p class="text-xs text-slate-500">
              สามารถพิมพ์ออกเครื่องพิมพ์ (A4) ตั้งไว้ที่จุดลงทะเบียน เพื่อให้ผู้เข้าร่วมสแกนด้วยกล้องมือถือหรือ LINE
            </p>
          </div>

          <!-- Standee Visual Card (Clean, framed) -->
          <div id="standeePreviewBox" class="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-5 border-2 border-dashed border-blue-300 text-center space-y-3">
            <div class="flex items-center justify-center gap-2">
              <img src="assets/logo.png" alt="TWP Logo" class="h-8 w-auto object-contain">
              <div class="text-left leading-tight">
                <div class="font-extrabold text-[#08539E] text-xs">สำนักพิมพ์ไทยวัฒนาพานิช จำกัด</div>
                <div class="text-[9px] text-slate-400 font-serif">THAI WATANA PANICH</div>
              </div>
            </div>

            <div>
              <div class="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block">จุดลงทะเบียนและเช็กชื่อเข้าอบรม</div>
              <div id="standeeEventTopic" class="text-xs sm:text-sm font-black text-slate-900 mt-1 line-clamp-2 px-2">-</div>
              <div id="standeeEventMeta" class="text-[10px] text-slate-500 mt-0.5">-</div>
            </div>

            <!-- QR Container -->
            <div class="flex justify-center py-1">
              <div id="standeeQrWrapper" class="p-2 bg-white rounded-xl shadow-sm border border-slate-200"></div>
            </div>

            <div class="bg-white/90 rounded-xl p-2.5 border border-slate-200 text-[10px] text-slate-600 space-y-1 max-w-sm mx-auto text-left">
              <div class="font-bold text-[#08539E] flex items-center gap-1">
                <i class="fa-solid fa-mobile-screen-button"></i>
                <span>ขั้นตอนการเช็กชื่อ:</span>
              </div>
              <div>1. สแกน QR ด้วยกล้องสมาร์ตโฟน หรือแอป LINE</div>
              <div>2. พิมพ์ค้นหาชื่อ-นามสกุลของท่าน (ภาษาไทย หรือ English)</div>
              <div>3. กดปุ่ม "ยืนยันเช็กชื่อ" เพื่อรับสิทธิ์วุฒิบัตร (e-Certificate)</div>
            </div>
          </div>

          <div class="pt-1 flex items-center justify-between gap-2">
            <a id="btnTestOpenRegisterPage" href="register.html" target="_blank" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-up-right-from-square text-xs"></i>
              <span>ทดสอบเปิดหน้าเช็กชื่อ</span>
            </a>
            <button type="button" onclick="printOnsiteQrStandee()" class="btn-touch px-4 py-2 bg-[#08539E] hover:bg-[#07488a] active:bg-[#063b72] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-print text-amber-300"></i>
              <span>สั่งพิมพ์ป้ายตั้งโต๊ะ (A4)</span>
            </button>
          </div>
        </div>

        <!-- Card 2: Excel Import Container -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-file-excel text-emerald-600 text-base"></i>
                <h3 class="text-sm font-bold text-slate-800">นำเข้ารายชื่อล่วงหน้าด้วยไฟล์ Excel (.xlsx / .csv)</h3>
              </div>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">SheetJS Engine</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              นำเข้าไฟล์รายชื่อผู้เข้าร่วมที่สมัครล่วงหน้าจากโรงเรียน ระบบจะแมปรายชื่อเข้าสู่ฐานข้อมูล ช่วยให้ผู้เข้าอบรมค้นหาชื่อตัวเองเพื่อเช็กชื่อได้ทันที
            </p>
          </div>

          <!-- Drag and Drop / File Input Box -->
          <div class="border-2 border-dashed border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-6 text-center space-y-3 transition">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto shadow-inner">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <label for="regExcelFileInput" class="cursor-pointer text-xs font-bold text-emerald-800 hover:text-emerald-950 underline decoration-2 underline-offset-2">
                คลิกเพื่อเลือกไฟล์ Excel
              </label>
              <span class="text-xs text-slate-500"> หรือลากไฟล์มาวางที่นี่</span>
              <p class="text-[10px] text-slate-400 mt-1">รองรับไฟล์ .xlsx, .xls, .csv (หัวตาราง: Name_TH, Name_EN, School, Email, Phone)</p>
            </div>
            <input type="file" id="regExcelFileInput" accept=".xlsx, .xls, .csv" onchange="handleAttendeeExcelImport(event)" class="hidden">
            <div class="pt-1">
              <button type="button" onclick="document.getElementById('regExcelFileInput').click()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-folder-open"></i>
                <span>เลือกไฟล์จากเครื่อง...</span>
              </button>
            </div>
          </div>

          <!-- Instructions & Template Download -->
          <div class="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="font-bold text-slate-800 text-[11px]">ยังไม่มีแบบฟอร์ม?</div>
              <div class="text-[10px] text-slate-500">ดาวน์โหลดแม่แบบ Excel ที่มีหัวตารางมาตรฐาน</div>
            </div>
            <button type="button" onclick="downloadExcelAttendeeTemplate()" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-download"></i>
              <span>โหลดแม่แบบ .xlsx</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Live Attendee Table Card -->
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-users text-[#08539E]"></i>
              <span>ทะเบียนผู้เข้าร่วมและการเช็กชื่อสด (Live Check-in Roster)</span>
            </h3>
            <p class="text-xs text-slate-400">รายชื่อผู้มีสิทธิ์ สถานะการสแกน และสามารถกดเช็กชื่อได้ด้วยเจ้าหน้าที่</p>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" onclick="openAdminAddWalkinModal()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>+ เพิ่ม Walk-in หน้างาน</span>
            </button>
            <button type="button" onclick="exportCurrentAttendeesToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs" title="ส่งออกรายชื่อทั้งหมดเป็นไฟล์ Excel">
              <i class="fa-solid fa-file-export text-xs"></i>
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>

        <!-- Table Filters & Search -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <!-- Filter Tabs -->
          <div class="flex space-x-1 overflow-x-auto pb-1" id="regFilterTabs">
            <button type="button" onclick="filterRegAttendees('ALL')" id="regFilter-ALL" class="px-3 py-1.5 rounded-xl font-bold bg-[#08539E] text-white">ทั้งหมด (<span id="countPillAll">0</span>)</button>
            <button type="button" onclick="filterRegAttendees('CHECKED')" id="regFilter-CHECKED" class="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">เช็กชื่อแล้ว (<span id="countPillChecked">0</span>)</button>
            <button type="button" onclick="filterRegAttendees('PENDING')" id="regFilter-PENDING" class="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">ยังไม่เช็กชื่อ (<span id="countPillPending">0</span>)</button>
            <button type="button" onclick="filterRegAttendees('WALKIN')" id="regFilter-WALKIN" class="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">Walk-in (<span id="countPillWalkin">0</span>)</button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-72">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" id="regTableSearchInput" oninput="filterAttendeeTable()" placeholder="ค้นหา: ชื่อ, โรงเรียน, เบอร์โทร..." class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto border border-slate-200 rounded-2xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-3 w-12 text-center">#</th>
                <th class="py-3 px-3">ชื่อ-นามสกุล (ไทย)</th>
                <th class="py-3 px-3">Full Name (English)</th>
                <th class="py-3 px-3">โรงเรียน / หน่วยงาน</th>
                <th class="py-3 px-3">อีเมล & เบอร์โทร</th>
                <th class="py-3 px-3 text-center">ประเภท</th>
                <th class="py-3 px-3 text-center">สถานะเช็กชื่อ</th>
                <th class="py-3 px-3 text-center">การกระทำ</th>
              </tr>
            </thead>
            <tbody id="regAttendeesTableBody" class="divide-y divide-slate-100">
              <tr>
                <td colspan="8" class="py-8 text-center text-slate-400">ยังไม่มีรายชื่อผู้เข้าอบรมในโครงการนี้ (นำเข้าด้วย Excel หรือลงทะเบียนหน้างาน)</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </section>`;

replaceOnce(targetEvalContainerEnd, newRegistrationSection, 'View Registration Section');

// 6. Add JavaScript Helper: toggleOtherSupportFields
const targetToggleTransport = `    function toggleTransportFields(checked) {
      const wrap = document.getElementById('transportDetailsWrap');
      const badge = document.getElementById('transBadge');
      if (checked) {
        wrap.classList.remove('hidden');
        badge.className = 'text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold';
        badge.innerText = 'ต้องการรถรับ-ส่ง';
      } else {
        wrap.classList.add('hidden');
        badge.className = 'text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold';
        badge.innerText = 'ไม่ต้องการ';
      }
    }`;

const newToggleTransportWithOther = `    function toggleTransportFields(checked) {
      const wrap = document.getElementById('transportDetailsWrap');
      const badge = document.getElementById('transBadge');
      if (checked) {
        wrap.classList.remove('hidden');
        badge.className = 'text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold';
        badge.innerText = 'ต้องการรถรับ-ส่ง';
      } else {
        wrap.classList.add('hidden');
        badge.className = 'text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold';
        badge.innerText = 'ไม่ต้องการ';
      }
    }

    function toggleOtherSupportFields(checked) {
      const wrap = document.getElementById('otherSupportWrap');
      if (wrap) {
        if (checked) {
          wrap.classList.remove('hidden');
          document.getElementById('otherSupportDetails')?.focus();
        } else {
          wrap.classList.add('hidden');
        }
      }
    }`;

replaceOnce(targetToggleTransport, newToggleTransportWithOther, 'toggleOtherSupportFields JS');

// 7. Team B card: actualTrainees override
const targetTeamBFin = `            <!-- Financials & Notes -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">งบประมาณจริงที่ตัดจ่าย (บาท) *</label>
                <input type="number" id="actualBudget-\${req.eventId}" value="\${req.actualBudget || req.estBudget}" class="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ข้อเสนอแนะเพิ่มเติมเชิงวิชาการ</label>
                <textarea id="teamBNotes-\${req.eventId}" rows="2" placeholder="ระบุความเห็นด้านหลักสูตร เอกสาร หรือการเตรียมการ..." class="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">\${req.teamBNotes || ''}</textarea>
              </div>
            </div>`;

const newTeamBFin = `            <!-- Trainees, Financials & Notes -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>ผู้เข้าอบรมจริง (คน) *</span>
                  <button type="button" onclick="syncOnsiteToTeamB('\${req.eventId}')" class="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-qrcode text-emerald-600"></i>
                    <span>ใช้ยอดสแกน (<span id="teamBOnsiteBadge-\${req.eventId}">\${req.actualTrainees || req.onsiteCheckedIn || req.expectedTrainees || 50}</span>)</span>
                  </button>
                </label>
                <input type="number" id="teamBActualTrainees-\${req.eventId}" min="1" value="\${req.actualTrainees || req.onsiteCheckedIn || req.expectedTrainees || 50}" class="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none" title="ทีม B สามารถแก้ไขจำนวนผู้เข้าร่วมจริงเพื่อใช้ในการประเมินได้">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">งบประมาณจริงที่ตัดจ่าย (บาท) *</label>
                <input type="number" id="actualBudget-\${req.eventId}" value="\${req.actualBudget || req.estBudget}" class="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ข้อเสนอแนะเพิ่มเติมเชิงวิชาการ</label>
                <textarea id="teamBNotes-\${req.eventId}" rows="2" placeholder="ระบุความเห็นด้านหลักสูตร เอกสาร หรือการเตรียมการ..." class="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">\${req.teamBNotes || ''}</textarea>
              </div>
            </div>`;

replaceOnce(targetTeamBFin, newTeamBFin, 'Team B Actual Trainees Input');

// 8. Update handleTeamASubmit payload
const targetTeamASubmitPayload = `        needTransportation: needTrans ? 'YES' : 'NO',
        transportDetails: transDetails,
        resourceLink: document.getElementById('resourceLink')?.value?.trim() || '',`;

const newTeamASubmitPayload = `        needTransportation: needTrans ? 'YES' : 'NO',
        transportDetails: transDetails,
        needCatering: document.getElementById('needCatering')?.checked ? 'YES' : 'NO',
        needProductMedia: document.getElementById('needProductMedia')?.checked ? 'YES' : 'NO',
        otherSupportDetails: document.getElementById('needOtherSupport')?.checked ? (document.getElementById('otherSupportDetails')?.value.trim() || '') : '',
        resourceLink: document.getElementById('resourceLink')?.value?.trim() || '',`;

replaceOnce(targetTeamASubmitPayload, newTeamASubmitPayload, 'handleTeamASubmit payload');

// 9. Reset checkboxes in handleTeamASubmit
const targetTeamAReset = `            document.getElementById('needTransportation').checked = false;
            toggleTransportFields(false);
            if (document.getElementById('resourceLink')) document.getElementById('resourceLink').value = '';`;

const newTeamAReset = `            document.getElementById('needTransportation').checked = false;
            toggleTransportFields(false);
            if (document.getElementById('needCatering')) document.getElementById('needCatering').checked = false;
            if (document.getElementById('needProductMedia')) document.getElementById('needProductMedia').checked = false;
            if (document.getElementById('needOtherSupport')) document.getElementById('needOtherSupport').checked = false;
            if (document.getElementById('otherSupportDetails')) document.getElementById('otherSupportDetails').value = '';
            toggleOtherSupportFields(false);
            if (document.getElementById('resourceLink')) document.getElementById('resourceLink').value = '';`;

replaceOnce(targetTeamAReset, newTeamAReset, 'handleTeamASubmit reset');

// 10. Update handleTeamBAction & add syncOnsiteToTeamB
const targetHandleTeamBAction = `    function handleTeamBAction(eventId, decision) {
      harvestTeamBSpeakersFromDOM(eventId);
      const req = AppState.requests.find(r => r.eventId === eventId);
      const speakers = (req && req.speakers) ? req.speakers : [];
      const speaker = (req && req.teamBSpeaker) ? req.teamBSpeaker : (document.getElementById('teamBSpeaker-' + eventId)?.value || '');
      const actualBudget = Number(document.getElementById('actualBudget-' + eventId)?.value) || 0;
      const notes = document.getElementById('teamBNotes-' + eventId)?.value || '';

      const payload = {
        eventId: eventId,
        decision: decision,
        teamBSpeaker: speaker,
        speakers: speakers,
        speakerSignature: speakers[0]?.signature || null,
        actualBudget: actualBudget,
        teamBNotes: notes,
        operatorName: AppState.operatorName
      };`;

const newHandleTeamBAction = `    function syncOnsiteToTeamB(eventId) {
      const req = AppState.requests.find(r => r.eventId === eventId);
      const cached = localStorage.getItem('twp_onsite_attendees_' + eventId);
      let count = 0;
      if (cached) {
        try {
          const list = JSON.parse(cached);
          count = list.filter(a => a.checkinStatus === 'CHECKED_IN').length;
        } catch(e) {}
      }
      if (count === 0 && req && (req.onsiteCheckedIn || req.actualTrainees)) {
        count = req.onsiteCheckedIn || req.actualTrainees;
      }
      if (count === 0) count = req?.expectedTrainees || 50;

      const inp = document.getElementById('teamBActualTrainees-' + eventId);
      if (inp) {
        inp.value = count;
        showAlert(\`ดึงยอดสแกนลงทะเบียนจริง \${count} คน เข้าสู่ช่องประเมินทีม B เรียบร้อยแล้ว\`, 'success');
      }
      if (req) req.actualTrainees = count;
    }

    function handleTeamBAction(eventId, decision) {
      harvestTeamBSpeakersFromDOM(eventId);
      const req = AppState.requests.find(r => r.eventId === eventId);
      const speakers = (req && req.speakers) ? req.speakers : [];
      const speaker = (req && req.teamBSpeaker) ? req.teamBSpeaker : (document.getElementById('teamBSpeaker-' + eventId)?.value || '');
      const actualBudget = Number(document.getElementById('actualBudget-' + eventId)?.value) || 0;
      const actualTrainees = Number(document.getElementById('teamBActualTrainees-' + eventId)?.value) || Number(req?.actualTrainees) || Number(req?.expectedTrainees) || 50;
      const notes = document.getElementById('teamBNotes-' + eventId)?.value || '';

      const payload = {
        eventId: eventId,
        decision: decision,
        teamBSpeaker: speaker,
        speakers: speakers,
        speakerSignature: speakers[0]?.signature || null,
        actualBudget: actualBudget,
        actualTrainees: actualTrainees,
        teamBNotes: notes,
        operatorName: AppState.operatorName
      };`;

replaceOnce(targetHandleTeamBAction, newHandleTeamBAction, 'handleTeamBAction & syncOnsiteToTeamB');

// Also update applyLocalTeamB in handleTeamBAction
const targetApplyLocalTeamB = `          if (speakers[0]?.signature) req.speakerSignature = speakers[0].signature;
          req.actualBudget = actualBudget;
          req.teamBNotes = notes;`;

const newApplyLocalTeamB = `          if (speakers[0]?.signature) req.speakerSignature = speakers[0].signature;
          req.actualBudget = actualBudget;
          req.actualTrainees = actualTrainees;
          req.teamBNotes = notes;`;

replaceOnce(targetApplyLocalTeamB, newApplyLocalTeamB, 'applyLocalTeamB actualTrainees');

// 11. switchTab: include 'registration'
const targetSwitchTabList = `['dashboard', 'annualPlan', 'teamA', 'teamB', 'exec', 'evaluation', 'teamBExpenses', 'fy2569Tu'].forEach(id => {`;
const newSwitchTabList = `['dashboard', 'annualPlan', 'teamA', 'teamB', 'exec', 'evaluation', 'teamBExpenses', 'fy2569Tu', 'registration'].forEach(id => {`;
replaceOnce(targetSwitchTabList, newSwitchTabList, 'switchTab registration id list');

const targetSwitchTabCall = `      } else if (tabId === 'dashboard') {
        renderDashboard();
      }`;

const newSwitchTabCall = `      } else if (tabId === 'registration') {
        renderRegistrationView();
      } else if (tabId === 'dashboard') {
        renderDashboard();
      }`;

replaceOnce(targetSwitchTabCall, newSwitchTabCall, 'switchTab call renderRegistrationView');

// 12. updateTopBarTitle: add registration
const targetTopBarTitles = `fy2569Tu: { title: 'แผนติดตามยอดขายเป้าหมาย TU ปี 2569', sub: 'เชื่อมโยงผลกระทบจากการจัดอบรมสู่ยอดขายจริงตามกลุ่มเป้าหมาย', icon: 'fa-crosshairs', color: 'text-rose-600' }
      };`;

const newTopBarTitles = `fy2569Tu: { title: 'แผนติดตามยอดขายเป้าหมาย TU ปี 2569', sub: 'เชื่อมโยงผลกระทบจากการจัดอบรมสู่ยอดขายจริงตามกลุ่มเป้าหมาย', icon: 'fa-crosshairs', color: 'text-rose-600' },
        registration: { title: 'ลงทะเบียนหน้างาน & เช็กชื่อผู้เข้าอบรม', sub: 'ระบบสแกน QR เช็กชื่อ, ป้ายตั้งโต๊ะพิมพ์ได้, นำเข้า Excel และ Walk-in ไฮบริด', icon: 'fa-id-card-clip', color: 'text-amber-600' }
      };`;

replaceOnce(targetTopBarTitles, newTopBarTitles, 'updateTopBarTitle registration');

// 13. Append Full JavaScript Module for Onsite Registration
const regJsModule = `
    // ========================================================
    // ONSITE REGISTRATION & CHECK-IN MODULE (v1.19.0)
    // ========================================================
    let currentRegEventId = null;
    let currentRegAttendees = [];
    let currentRegFilter = 'ALL';

    function renderRegistrationView() {
      populateRegEventDropdown();
      if (!currentRegEventId && AppState.requests && AppState.requests.length > 0) {
        currentRegEventId = AppState.requests[0].eventId;
      }
      if (currentRegEventId) {
        const select = document.getElementById('regEventSelect');
        if (select) select.value = currentRegEventId;
        loadRegEventData(currentRegEventId);
      }
    }

    function populateRegEventDropdown() {
      const select = document.getElementById('regEventSelect');
      if (!select) return;
      const requests = AppState.requests || [];
      if (requests.length === 0) {
        select.innerHTML = '<option value="">ยังไม่มีโครงการในระบบ</option>';
        return;
      }
      select.innerHTML = requests.map(r => {
        return \`<option value="\${r.eventId}">\${r.eventId} : \${r.schoolName} - \${r.courseTopic}</option>\`;
      }).join('');
    }

    function onRegEventSelected(eventId) {
      currentRegEventId = eventId;
      loadRegEventData(eventId);
    }

    function loadRegEventData(eventId) {
      if (!eventId) return;
      const req = AppState.requests.find(r => r.eventId === eventId);
      
      // Update Standee Preview Info
      const stTopic = document.getElementById('standeeEventTopic');
      const stMeta = document.getElementById('standeeEventMeta');
      if (stTopic) stTopic.innerText = req?.courseTopic || '-';
      if (stMeta) stMeta.innerText = \`\${req?.schoolName || '-'} • \${req?.eventDate || '-'}\`;

      // Generate Standee QR
      generateOnsiteQrStandee(eventId);

      // Load Cached Attendees
      const localStoreKey = 'twp_onsite_attendees_' + eventId;
      const cached = localStorage.getItem(localStoreKey);
      if (cached) {
        try {
          currentRegAttendees = JSON.parse(cached);
          updateRegKpis();
          filterAttendeeTable();
        } catch(e) {
          currentRegAttendees = [];
        }
      } else {
        currentRegAttendees = [];
      }

      // Fetch Latest from Backend
      if (AppState.gasEndpoint) {
        postToBackend('GET_EVENT_REGISTRATIONS', { eventId: eventId })
          .then(res => {
            if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
              currentRegAttendees = res.data;
              localStorage.setItem(localStoreKey, JSON.stringify(currentRegAttendees));
              updateRegKpis();
              filterAttendeeTable();
            }
          })
          .catch(e => console.log('Offline registration loaded'));
      } else {
        updateRegKpis();
        filterAttendeeTable();
      }
    }

    function generateOnsiteQrStandee(eventId) {
      const qrWrap = document.getElementById('standeeQrWrapper');
      if (!qrWrap || !window.QRCode) return;
      qrWrap.innerHTML = '';

      const req = AppState.requests.find(r => r.eventId === eventId);
      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      const registerUrl = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}&topic=\${encodeURIComponent(req?.courseTopic || '')}&school=\${encodeURIComponent(req?.schoolName || '')}&speaker=\${encodeURIComponent(req?.teamBSpeaker || req?.speakerType || '')}&date=\${encodeURIComponent(req?.eventDate || '')}\`;

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
    }

    function printOnsiteQrStandee() {
      const eventId = currentRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) {
        showAlert('กรุณาเลือกโครงการที่ต้องการพิมพ์ป้ายตั้งโต๊ะก่อนครับ', 'warning');
        return;
      }
      const req = AppState.requests.find(r => r.eventId === eventId);
      const hostOrigin = window.location.origin + window.location.pathname.replace(/[^\\/]*$/, '');
      const registerUrl = \`\${hostOrigin}register.html?event=\${encodeURIComponent(eventId)}&topic=\${encodeURIComponent(req?.courseTopic || '')}&school=\${encodeURIComponent(req?.schoolName || '')}&speaker=\${encodeURIComponent(req?.teamBSpeaker || req?.speakerType || '')}&date=\${encodeURIComponent(req?.eventDate || '')}\`;

      const win = window.open('', '_blank');
      if (!win) {
        alert('กรุณาอนุญาตป็อปอัปในเบราว์เซอร์เพื่อเปิดพิมพ์ป้ายตั้งโต๊ะ A4 ครับ');
        return;
      }

      win.document.write(\`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ป้ายตั้งโต๊ะลงทะเบียน - \${eventId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"><\\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\\/script>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: 'Sarabun', sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; }
    .standee-frame {
      border: 8px solid #08539E;
      outline: 3px solid #C5A059;
      outline-offset: -5px;
      min-height: calc(100vh - 20mm);
      box-sizing: border-box;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
    }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body onload="window.print()">
  <div class="no-print bg-[#08539E] text-white p-3 flex justify-between items-center shadow-md">
    <div class="font-bold text-sm">🖨️ ตัวอย่างป้ายตั้งโต๊ะ A4 สำหรับตั้งจุดลงทะเบียน (Onsite QR Standee)</div>
    <div class="space-x-2">
      <button onclick="window.print()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">สั่งพิมพ์ A4</button>
      <button onclick="window.close()" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs">ปิด</button>
    </div>
  </div>

  <div class="standee-frame">
    <!-- Header -->
    <div class="space-y-2">
      <img src="assets/logo.png" alt="TWP Logo" class="h-16 w-auto mx-auto object-contain">
      <div class="text-2xl font-black text-[#08539E]">สำนักพิมพ์ไทยวัฒนาพานิช จำกัด</div>
      <div class="text-xs font-bold text-slate-500 tracking-widest uppercase">THAI WATANA PANICH PUBLISHING HOUSE</div>
      <div class="pt-3">
        <span class="inline-block px-6 py-1.5 bg-amber-500 text-white font-black text-lg rounded-full shadow-sm">
          จุดลงทะเบียน & เช็กชื่อผู้เข้าอบรม
        </span>
      </div>
    </div>

    <!-- Event Detail -->
    <div class="my-4 p-6 bg-blue-50/70 border-2 border-blue-200 rounded-3xl space-y-2 max-w-xl mx-auto">
      <div class="text-xs font-bold text-slate-500 font-mono">รหัสโครงการ: \${eventId}</div>
      <div class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">“\${req?.courseTopic || '-'}”</div>
      <div class="text-sm font-bold text-[#08539E]">\${req?.schoolName || '-'}</div>
      <div class="text-xs text-slate-600">วันที่จัดอบรม: \${req?.eventDate || '-'} | วิทยากร: \${req?.teamBSpeaker || req?.speakerType || '-'}</div>
    </div>

    <!-- Large QR Code for Scanning -->
    <div class="space-y-2">
      <div id="printQrContainer" class="p-4 bg-white inline-block rounded-3xl border-4 border-[#08539E] shadow-md"></div>
      <div class="text-base font-bold text-[#08539E] tracking-wide">สแกน QR Code ด้วยกล้องมือถือ หรือแอป LINE</div>
    </div>

    <!-- 3 Steps Instructions -->
    <div class="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-300 text-left text-xs space-y-1.5 text-slate-700">
      <div class="font-bold text-[#08539E] text-sm mb-1 flex items-center gap-1.5">
        <i class="fa-solid fa-list-check"></i>
        <span>ขั้นตอนง่ายๆ 3 ขั้นตอน:</span>
      </div>
      <div><strong>1. สแกน QR Code</strong> เปิดกล้องสมาร์ตโฟนแล้วส่องที่รูปภาพด้านบน</div>
      <div><strong>2. ค้นหารายชื่อ</strong> พิมพ์ชื่อ-นามสกุลของท่าน (ภาษาไทย หรือ ภาษาอังกฤษ)</div>
      <div><strong>3. กดยืนยันเช็กชื่อ</strong> ระบบจะบันทึกเวลาและเปิดสิทธิ์รับวุฒิบัตร (e-Certificate) ทันที</div>
      <div class="text-[10px] text-amber-700 pt-1 font-semibold">* หากไม่พบชื่อ สามารถกด "ลงทะเบียน Walk-in" ได้ทันทีครับ</div>
    </div>

    <!-- Footnote -->
    <div class="text-[10px] text-slate-400 pt-2 border-t border-slate-200 flex justify-between px-2">
      <span>ระบบบริหารคำขอและวุฒิบัตร Training Center TWP • Version 1.19.0</span>
      <span>Official Attendance & e-Certificate Verification Standard</span>
    </div>
  </div>

  <script>
    new QRCode(document.getElementById('printQrContainer'), {
      text: "\${registerUrl}",
      width: 220,
      height: 220,
      colorDark: '#08539E',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  <\\/script>
</body>
</html>\`);
      win.document.close();
    }

    function downloadExcelAttendeeTemplate() {
      const templateData = [
        {
          'Name_TH': 'นายสมชาย มุ่งมั่นพัฒนา',
          'Name_EN': 'Mr. Somchai Mungmunpattana',
          'School_Name': 'โรงเรียนเตรียมอุดมศึกษาพัฒนาการ',
          'Email': 'somchai@example.com',
          'Phone': '0812345678'
        },
        {
          'Name_TH': 'นางสาววิไลลักษณ์ การเรียนรู้',
          'Name_EN': 'Ms. Wilailak Karnrianroo',
          'School_Name': 'โรงเรียนเตรียมอุดมศึกษาพัฒนาการ',
          'Email': 'wilailak@example.com',
          'Phone': '0898765432'
        },
        {
          'Name_TH': 'อาจารย์กิตติศักดิ์ สร้างสรรค์',
          'Name_EN': 'Mr. Kittisak Sangsan',
          'School_Name': 'โรงเรียนสาธิตมหาวิทยาลัย...',
          'Email': 'kittisak@example.com',
          'Phone': '0851122334'
        }
      ];

      if (window.XLSX) {
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendees');
        XLSX.writeFile(wb, 'แบบฟอร์มรายชื่อผู้เข้าอบรม_TWP_Template.xlsx');
        showAlert('ดาวน์โหลดแม่แบบ Excel (Template) สำเร็จแล้ว', 'success');
      } else {
        // Fallback CSV download
        let csvContent = 'data:text/csv;charset=utf-8,\\uFEFFName_TH,Name_EN,School_Name,Email,Phone\\n' +
          'นายสมชาย มุ่งมั่นพัฒนา,Mr. Somchai Mungmunpattana,โรงเรียนเตรียมอุดมศึกษาพัฒนาการ,somchai@example.com,0812345678\\n' +
          'นางสาววิไลลักษณ์ การเรียนรู้,Ms. Wilailak Karnrianroo,โรงเรียนเตรียมอุดมศึกษาพัฒนาการ,wilailak@example.com,0898765432\\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'แบบฟอร์มรายชื่อผู้เข้าอบรม_TWP_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert('ดาวน์โหลดแม่แบบรายชื่อสำเร็จแล้ว', 'success');
      }
    }

    function handleAttendeeExcelImport(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const eventId = currentRegEventId || (AppState.requests && AppState.requests[0]?.eventId);
      if (!eventId) {
        showAlert('กรุณาเลือกโครงการที่ต้องการนำเข้ารายชื่อก่อนครับ', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            showAlert('ไม่พบข้อมูลรายชื่อในไฟล์ Excel กรุณาตรวจสอบไฟล์อีกครั้ง', 'error');
            return;
          }

          const parsedAttendees = rawRows.map((r, idx) => {
            const nameTh = r['Name_TH'] || r['ชื่อ-นามสกุล'] || r['ชื่อ'] || r['Name'] || '';
            const nameEn = r['Name_EN'] || r['Full Name'] || r['English Name'] || '';
            const school = r['School_Name'] || r['โรงเรียน'] || r['สถานศึกษา'] || r['School'] || '';
            const email = r['Email'] || r['อีเมล'] || '';
            const phone = String(r['Phone'] || r['เบอร์โทร'] || r['เบอร์ติดต่อ'] || '');

            return {
              regId: 'REG-' + Date.now().toString().slice(-6) + '-' + (idx + 1),
              eventId: eventId,
              nameTh: String(nameTh).trim(),
              nameEn: String(nameEn).trim(),
              school: String(school).trim(),
              email: String(email).trim(),
              phone: phone.trim(),
              checkinStatus: 'PENDING',
              checkinTime: '',
              regType: 'PRE'
            };
          }).filter(a => a.nameTh);

          if (parsedAttendees.length === 0) {
            showAlert('ไม่พบแถวที่มีชื่อ-นามสกุล (ภาษาไทย) ในไฟล์', 'warning');
            return;
          }

          // Merge or Replace
          currentRegAttendees = [...currentRegAttendees, ...parsedAttendees];
          localStorage.setItem('twp_onsite_attendees_' + eventId, JSON.stringify(currentRegAttendees));

          // Post to backend
          if (AppState.gasEndpoint) {
            postToBackend('IMPORT_REGISTRATIONS', {
              eventId: eventId,
              attendees: parsedAttendees
            }).catch(e => console.log('Offline imported'));
          }

          showAlert(\`นำเข้ารายชื่อผู้เข้าอบรมสำเร็จ \${parsedAttendees.length} ท่าน\`, 'success');
          updateRegKpis();
          filterAttendeeTable();
        } catch(err) {
          console.error(err);
          showAlert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel: ' + err.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
      event.target.value = '';
    }

    function updateRegKpis() {
      const list = currentRegAttendees || [];
      const total = list.length;
      const checked = list.filter(a => a.checkinStatus === 'CHECKED_IN').length;
      const pending = total - checked;
      const walkin = list.filter(a => a.regType === 'WALKIN').length;
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

      const elTotal = document.getElementById('kpiRegTotal');
      const elChecked = document.getElementById('kpiRegCheckedIn');
      const elPending = document.getElementById('kpiRegPending');
      const elWalkin = document.getElementById('kpiRegWalkin');
      const elPct = document.getElementById('kpiRegPct');

      if (elTotal) elTotal.innerText = total;
      if (elChecked) elChecked.innerText = checked;
      if (elPending) elPending.innerText = pending;
      if (elWalkin) elWalkin.innerText = walkin;
      if (elPct) elPct.innerText = \`\${pct}% ของทั้งหมด\`;

      const pAll = document.getElementById('countPillAll');
      const pChk = document.getElementById('countPillChecked');
      const pPnd = document.getElementById('countPillPending');
      const pWlk = document.getElementById('countPillWalkin');
      if (pAll) pAll.innerText = total;
      if (pChk) pChk.innerText = checked;
      if (pPnd) pPnd.innerText = pending;
      if (pWlk) pWlk.innerText = walkin;

      // Update Team B badge in request object
      const req = AppState.requests.find(r => r.eventId === currentRegEventId);
      if (req) {
        req.onsiteCheckedIn = checked;
        req.onsiteTotal = total;
        const bBadge = document.getElementById('teamBOnsiteBadge-' + currentRegEventId);
        if (bBadge) bBadge.innerText = checked;
      }
    }

    function filterRegAttendees(status) {
      currentRegFilter = status;
      ['ALL', 'CHECKED', 'PENDING', 'WALKIN'].forEach(st => {
        const btn = document.getElementById('regFilter-' + st);
        if (btn) {
          if (st === status) {
            btn.className = 'px-3 py-1.5 rounded-xl font-bold bg-[#08539E] text-white';
          } else {
            btn.className = 'px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200';
          }
        }
      });
      filterAttendeeTable();
    }

    function filterAttendeeTable() {
      const q = (document.getElementById('regTableSearchInput')?.value || '').trim().toLowerCase();
      let list = currentRegAttendees || [];

      if (currentRegFilter === 'CHECKED') {
        list = list.filter(a => a.checkinStatus === 'CHECKED_IN');
      } else if (currentRegFilter === 'PENDING') {
        list = list.filter(a => a.checkinStatus !== 'CHECKED_IN');
      } else if (currentRegFilter === 'WALKIN') {
        list = list.filter(a => a.regType === 'WALKIN');
      }

      if (q) {
        list = list.filter(a => {
          const th = (a.nameTh || '').toLowerCase();
          const en = (a.nameEn || '').toLowerCase();
          const sc = (a.school || '').toLowerCase();
          const ph = (a.phone || '').toLowerCase();
          return th.includes(q) || en.includes(q) || sc.includes(q) || ph.includes(q);
        });
      }

      renderRegTable(list);
    }

    function renderRegTable(list) {
      const tbody = document.getElementById('regAttendeesTableBody');
      if (!tbody) return;

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-slate-400">ไม่พบรายชื่อผู้เข้าอบรมตามเงื่อนไขที่เลือก</td></tr>';
        return;
      }

      tbody.innerHTML = list.map((a, idx) => {
        const isChecked = (a.checkinStatus === 'CHECKED_IN');
        return \`
          <tr class="hover:bg-slate-50/80 transition \${isChecked ? 'bg-emerald-50/20' : ''}">
            <td class="py-3 px-3 text-center text-slate-400 font-mono">\${idx + 1}</td>
            <td class="py-3 px-3 font-bold text-slate-900">\${a.nameTh || '-'}</td>
            <td class="py-3 px-3 text-slate-600 italic font-serif">\${a.nameEn || '-'}</td>
            <td class="py-3 px-3 text-slate-700 truncate max-w-[180px]">\${a.school || '-'}</td>
            <td class="py-3 px-3 text-slate-600 font-mono text-[11px]">
              <div>\${a.email || '-'}</div>
              <div class="text-slate-400">\${a.phone || '-'}</div>
            </td>
            <td class="py-3 px-3 text-center">
              \${a.regType === 'WALKIN'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Walk-in</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">ล่วงหน้า</span>'}
            </td>
            <td class="py-3 px-3 text-center">
              \${isChecked
                ? \`<div class="space-y-0.5"><span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]"><i class="fa-solid fa-circle-check text-emerald-600"></i> เช็กชื่อแล้ว</span><div class="text-[9px] text-slate-400 font-mono">\${a.checkinTime || ''}</div></div>\`
                : '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-500 font-medium rounded-full text-[10px]">ยังไม่มา</span>'}
            </td>
            <td class="py-3 px-3 text-center">
              <button type="button" onclick="toggleAttendeeCheckin('\${a.regId}')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition \${isChecked ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200' : 'bg-[#08539E] hover:bg-[#07488a] text-white shadow-2xs'}">
                \${isChecked ? 'ยกเลิก' : 'เช็กชื่อ'}
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function toggleAttendeeCheckin(regId) {
      const a = currentRegAttendees.find(item => item.regId === regId);
      if (!a) return;

      const isChecked = (a.checkinStatus === 'CHECKED_IN');
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

      if (isChecked) {
        a.checkinStatus = 'PENDING';
        a.checkinTime = '';
      } else {
        a.checkinStatus = 'CHECKED_IN';
        a.checkinTime = nowStr;
      }

      localStorage.setItem('twp_onsite_attendees_' + currentRegEventId, JSON.stringify(currentRegAttendees));
      updateRegKpis();
      filterAttendeeTable();

      // Post update to backend
      if (AppState.gasEndpoint) {
        postToBackend('CHECKIN_PARTICIPANT', {
          eventId: currentRegEventId,
          regId: regId,
          checkinStatus: a.checkinStatus,
          checkinTime: a.checkinTime
        }).catch(e => console.log('Offline checked in'));
      }
    }

    function syncActiveOnsiteToTeamB() {
      if (!currentRegEventId) return;
      const checked = (currentRegAttendees || []).filter(a => a.checkinStatus === 'CHECKED_IN').length;
      syncOnsiteToTeamB(currentRegEventId);
      showAlert(\`ส่งยอดผู้เช็กชื่อจริง \${checked} คน เข้าสู่ฝ่ายวิชาการ (ทีม B) เรียบร้อยแล้ว\`, 'success');
    }

    function openAdminAddWalkinModal() {
      const name = prompt('กรุณาระบุชื่อ-นามสกุล ผู้เข้าอบรม (Walk-in):');
      if (!name || !name.trim()) return;
      const req = AppState.requests.find(r => r.eventId === currentRegEventId);
      const school = prompt('โรงเรียน / หน่วยงาน:', req?.schoolName || '');
      const email = prompt('อีเมลสำหรับรับ e-Certificate (ถ้ามี):', '');
      const phone = prompt('เบอร์โทรศัพท์ติดต่อ (ถ้ามี):', '');

      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      const newAtt = {
        regId: 'REG-WALKIN-' + Date.now().toString().slice(-6),
        eventId: currentRegEventId,
        nameTh: name.trim(),
        nameEn: '',
        school: school || (req?.schoolName || ''),
        email: email || '',
        phone: phone || '',
        checkinStatus: 'CHECKED_IN',
        checkinTime: nowStr,
        regType: 'WALKIN'
      };

      currentRegAttendees.unshift(newAtt);
      localStorage.setItem('twp_onsite_attendees_' + currentRegEventId, JSON.stringify(currentRegAttendees));
      updateRegKpis();
      filterAttendeeTable();

      if (AppState.gasEndpoint) {
        postToBackend('REGISTER_WALKIN', newAtt).catch(e => console.log('Offline walkin logged'));
      }
      showAlert(\`บันทึกและเช็กชื่อผู้เข้าอบรม Walk-in: \${name} เรียบร้อยแล้ว\`, 'success');
    }

    function exportCurrentAttendeesToExcel() {
      if (!currentRegAttendees || currentRegAttendees.length === 0) {
        showAlert('ยังไม่มีรายชื่อผู้เข้าอบรมให้ส่งออก', 'warning');
        return;
      }
      const exportData = currentRegAttendees.map((a, idx) => ({
        'ลำดับ': idx + 1,
        'ชื่อ-สกุล (ไทย)': a.nameTh,
        'Full Name (EN)': a.nameEn,
        'โรงเรียน/หน่วยงาน': a.school,
        'อีเมล': a.email,
        'เบอร์โทร': a.phone,
        'ประเภท': a.regType === 'WALKIN' ? 'Walk-in' : 'ล่วงหน้า',
        'สถานะเช็กชื่อ': a.checkinStatus === 'CHECKED_IN' ? 'เช็กชื่อแล้ว' : 'ยังไม่มา',
        'เวลาเช็กชื่อ': a.checkinTime || ''
      }));

      if (window.XLSX) {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Checkin_Roster');
        XLSX.writeFile(wb, \`รายชื่อผู้เข้าอบรม_\${currentRegEventId}.xlsx\`);
        showAlert('ส่งออกไฟล์ Excel สำเร็จแล้ว', 'success');
      }
    }
`;

// Insert the JS module before the closing script tag </script>
const targetClosingScript = `      renderAnnualPlanView();
    }
  </script>`;

replaceOnce(targetClosingScript, `      renderAnnualPlanView();
    }

${regJsModule}
  </script>`, 'Registration JS Module');

// 14. Version Bump occurrences across the file
content = content.replace(/v1\.18\.1/g, 'v1.19.0');
content = content.replace(/v1\.18\.0/g, 'v1.19.0');
console.log('✓ Bumped remaining v1.18.x strings to v1.19.0');

// Restore CRLF if file was CRLF originally
if (isCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

// Save updated index.html
fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 Successfully patched index.html with all v1.19.0 updates!');
