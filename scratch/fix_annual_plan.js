const fs = require('fs');

console.log('--- 1. PATCHING BACKEND_CODE.GS FOR ANNUAL PLANS ---');

let backend = fs.readFileSync('backend_code.gs', 'utf8');

// Ensure Annual_Plans sheet is registered in ensureRequiredSheets
if (!backend.includes("name: 'Annual_Plans'")) {
  const targetSheet = `{
      name: 'Evaluation_Responses',`;
  const annualSheetDef = `{
      name: 'Annual_Plans',
      headers: ['Plan_ID', 'Seq_No', 'Title', 'Target_Audience', 'Principle_Budget', 'Target_Sales', 'Quarter_Or_Date', 'Approver_Name', 'Approver_Role', 'Status', 'Notes', 'Created_At']
    },
    {
      name: 'Evaluation_Responses',`;
  backend = backend.replace(targetSheet, annualSheetDef);
  console.log('Registered Annual_Plans sheet in ensureRequiredSheets');
}

// Add Annual Plans Handlers to backend
const annualBackendHandlers = `
// ============================================================================
// ANNUAL MASTER PLANS ENGINE (ผศ.อินทิรา บุนนาค อนุมัติหลักการ)
// ============================================================================

function handleGetAnnualPlans() {
  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) return { plans: [] };

  const rows = sheet.getDataRange().getValues();
  const plans = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r[0]) {
      plans.push({
        planId: r[0],
        seqNo: Number(r[1]) || (i),
        title: r[2] || '',
        targetAudience: r[3] || '',
        principleBudget: Number(r[4]) || 0,
        targetSales: Number(r[5]) || 0,
        quarterOrDate: r[6] || '',
        approverName: r[7] || 'ผศ.อินทิรา บุนนาค',
        approverRole: r[8] || 'กรรมการผู้จัดการ',
        status: r[9] || 'APPROVED_PRINCIPLE',
        notes: r[10] || '',
        createdAt: r[11] || ''
      });
    }
  }

  // Sort by seqNo
  plans.sort((a, b) => a.seqNo - b.seqNo);
  return { plans: plans, total: plans.length };
}

function handleSaveAnnualPlans(payload) {
  const plans = payload ? (payload.plans || (payload.plan ? [payload.plan] : [])) : [];
  if (!Array.isArray(plans) || plans.length === 0) {
    throw new Error('ไม่พบข้อมูลโครงการอนุมัติหลักการสำหรับบันทึก');
  }

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  let sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) {
    sheet = ss.insertSheet('Annual_Plans');
    sheet.appendRow(['Plan_ID', 'Seq_No', 'Title', 'Target_Audience', 'Principle_Budget', 'Target_Sales', 'Quarter_Or_Date', 'Approver_Name', 'Approver_Role', 'Status', 'Notes', 'Created_At']);
  }

  // Re-write rows safely
  const existingHeaders = sheet.getRange(1, 1, 1, 12).getValues()[0];
  sheet.clearContents();
  sheet.appendRow(existingHeaders);

  const now = new Date().toISOString();
  const rows = plans.map(p => [
    p.planId || ('PLAN-2569-' + String(p.seqNo).padStart(2, '0')),
    p.seqNo || 1,
    p.title || '',
    p.targetAudience || '',
    Number(p.principleBudget) || 0,
    Number(p.targetSales) || 0,
    p.quarterOrDate || '',
    p.approverName || 'ผศ.อินทิรา บุนนาค',
    p.approverRole || 'กรรมการผู้จัดการ',
    p.status || 'APPROVED_PRINCIPLE',
    p.notes || '',
    p.createdAt || now
  ]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 12).setValues(rows);
  }

  return { success: true, savedCount: rows.length };
}

function handleDeleteAnnualPlan(payload) {
  const planId = payload ? payload.planId : '';
  if (!planId) throw new Error('กรุณาระบุ planId ที่ต้องการลบ');

  const ss = getSpreadsheet();
  ensureRequiredSheets(ss);
  const sheet = ss.getSheetByName('Annual_Plans');
  if (!sheet) return { success: true };

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(planId).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, deletedPlanId: planId };
    }
  }

  return { success: false, message: 'ไม่พบรหัสโครงการ: ' + planId };
}
`;

if (!backend.includes('function handleGetAnnualPlans')) {
  backend = backend + '\n' + annualBackendHandlers;
  console.log('Added Annual Plans handlers to backend_code.gs');
}

// Add to doPost dispatcher
if (!backend.includes("case 'GET_ANNUAL_PLANS':")) {
  const targetCase = `      case 'IMPORT_REGISTRATIONS':
        result = handleBatchImportRegistrations(payload);
        break;`;
  const annualCases = `      case 'IMPORT_REGISTRATIONS':
        result = handleBatchImportRegistrations(payload);
        break;
      case 'GET_ANNUAL_PLANS':
        result = handleGetAnnualPlans();
        break;
      case 'SAVE_ANNUAL_PLANS':
        result = handleSaveAnnualPlans(payload);
        break;
      case 'DELETE_ANNUAL_PLAN':
        result = handleDeleteAnnualPlan(payload);
        break;`;
  backend = backend.replace(targetCase, annualCases);
  console.log('Added annual plans cases to doPost in backend_code.gs');
}

fs.writeFileSync('backend_code.gs', backend, 'utf8');
fs.writeFileSync('C:/Users/nipon/.gemini/antigravity/brain/3d702a86-92d8-44a8-8d58-e35fee520aa1/backend_code.gs', backend, 'utf8');
console.log('backend_code.gs updated successfully!');

console.log('--- 2. PATCHING INDEX.HTML MODAL NESTING & CLOUD SYNC ---');

let index = fs.readFileSync('index.html', 'utf8');

// Un-nest annualPlanModal from customerDirectoryModal
const oldNestedBlock = `      <!-- Table Container (Scrollable) -->
      <div class="flex-1 overflow-y-auto border border-slate-200 rounded-xl custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-100 text-slate-700 sticky top-0 z-10 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th class="p-2.5">รหัส</th>
              <th class="p-2.5">ชื่อโรงเรียน / สถานศึกษา</th>
              <th class="p-2.5">จังหวัด / อำเภอ</th>
              <th class="p-2.5">สพม. เขต</th>
              <th class="p-2.5 text-center">ขนาด</th>
              <th class="p-2.5 text-right">นร.รวม</th>
              <th class="p-2.5">ผู้แทนขาย (ทีม A)</th>
              <th class="p-2.5 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody id="customerTableBody" class="divide-y divide-slate-100 bg-white">
            <!-- Rows rendered dynamically by JS -->
          </tbody>
        </table>
      </div>

      <!-- MODAL: ADD / EDIT ANNUAL PRINCIPLE-APPROVED PLAN -->
  <div id="annualPlanModal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar" onclick="event.stopPropagation()">
      
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-file-circle-check"></i>
          </div>
          <div>
            <h3 id="annualPlanModalTitle" class="font-bold text-slate-800 text-sm">บันทึกโครงการอนุมัติหลักการประจำปี</h3>
            <p class="text-[11px] text-slate-400">กรอกข้อมูลโครงการที่ได้รับอนุมัติหลักการจากกรรมการผู้จัดการแล้ว</p>
          </div>
        </div>
        <button onclick="closeAnnualPlanModal()" class="text-slate-400 hover:text-slate-600 text-lg"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <form id="annualPlanForm" onsubmit="handleSaveAnnualPlan(event)" class="space-y-3 text-xs">
        <input type="hidden" id="planEditId" value="">

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ลำดับที่ *</label>
            <input type="number" id="planSeqInput" min="1" required placeholder="เช่น 1, 2, 3..." class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสโครงการหลักการ *</label>
            <input type="text" id="planCodeInput" required placeholder="เช่น PLAN-2569-01" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่องานอบรม / โครงการที่ได้รับอนุมัติหลักการ *</label>
          <input type="text" id="planTitleInput" required placeholder="เช่น งานอบรมใหญ่ Active Learning สู่สมรรถนะผู้เรียนระดับชาติ..." class="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">วัตถุประสงค์และกลุ่มเป้าหมาย</label>
          <input type="text" id="planTargetAudienceInput" placeholder="เช่น ครูผู้สอนระดับมัธยมศึกษา 500 คน ทั่วประเทศ..." class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">กรอบงบประมาณที่อนุมัติ (บาท) *</label>
            <input type="number" id="planBudgetInput" min="0" required placeholder="เช่น 150000" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">เป้าหมายยอดขายที่คาดหวัง (บาท) *</label>
            <input type="number" id="planTargetSalesInput" min="0" required placeholder="เช่น 1500000" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ช่วงเวลาจัดงานตามแผน</label>
            <input type="text" id="planQuarterInput" placeholder="เช่น พฤศจิกายน 2569 (ไตรมาส 1)" class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ผู้อนุมัติหลักการ</label>
            <input type="text" id="planApproverInput" readonly value="ผศ.อินทิรา บุนนาค (กรรมการผู้จัดการ)" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-600 font-medium">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
          <textarea id="planNotesInput" rows="2" placeholder="ระบุรายละเอียดเพิ่มเติม..." class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="closeAnnualPlanModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition">
            ยกเลิก
          </button>
          <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition btn-tactile">
            <i class="fa-solid fa-floppy-disk mr-1"></i>บันทึกโครงการอนุมัติหลักการ
          </button>
        </div>
      </form>
    </div>
  </div>

    <!-- Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 flex-shrink-0 text-xs">
        <span class="text-slate-400 text-[11px]">ฐานข้อมูล สพม. ปีการศึกษา 2568 • บริษัท ไทยวัฒนาพานิช จำกัด</span>
        <button onclick="closeCustomerDirectoryModal()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition">ปิดหน้าต่าง</button>
      </div>

    </div>
  </div>`;

const newCleanBlock = `      <!-- Table Container (Scrollable) -->
      <div class="flex-1 overflow-y-auto border border-slate-200 rounded-xl custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-100 text-slate-700 sticky top-0 z-10 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th class="p-2.5">รหัส</th>
              <th class="p-2.5">ชื่อโรงเรียน / สถานศึกษา</th>
              <th class="p-2.5">จังหวัด / อำเภอ</th>
              <th class="p-2.5">สพม. เขต</th>
              <th class="p-2.5 text-center">ขนาด</th>
              <th class="p-2.5 text-right">นร.รวม</th>
              <th class="p-2.5">ผู้แทนขาย (ทีม A)</th>
              <th class="p-2.5 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody id="customerTableBody" class="divide-y divide-slate-100 bg-white">
            <!-- Rows rendered dynamically by JS -->
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 flex-shrink-0 text-xs">
        <span class="text-slate-400 text-[11px]">ฐานข้อมูล สพม. ปีการศึกษา 2568 • บริษัท ไทยวัฒนาพานิช จำกัด</span>
        <button onclick="closeCustomerDirectoryModal()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition">ปิดหน้าต่าง</button>
      </div>

    </div>
  </div>

  <!-- ======================================================== -->
  <!-- MODAL: ADD / EDIT ANNUAL PRINCIPLE-APPROVED PLAN (STANDALONE) -->
  <!-- ======================================================== -->
  <div id="annualPlanModal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar" onclick="event.stopPropagation()">
      
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-file-circle-check"></i>
          </div>
          <div>
            <h3 id="annualPlanModalTitle" class="font-bold text-slate-800 text-sm">บันทึกโครงการอนุมัติหลักการประจำปี</h3>
            <p class="text-[11px] text-slate-400">กรอกข้อมูลโครงการที่ได้รับอนุมัติหลักการจากกรรมการผู้จัดการแล้ว</p>
          </div>
        </div>
        <button type="button" onclick="closeAnnualPlanModal()" class="text-slate-400 hover:text-slate-600 text-lg"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <form id="annualPlanForm" onsubmit="handleSaveAnnualPlan(event)" class="space-y-3 text-xs">
        <input type="hidden" id="planEditId" value="">

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ลำดับที่ *</label>
            <input type="number" id="planSeqInput" min="1" required placeholder="เช่น 1, 2, 3..." class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสโครงการหลักการ *</label>
            <input type="text" id="planCodeInput" required placeholder="เช่น PLAN-2569-01" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่องานอบรม / โครงการที่ได้รับอนุมัติหลักการ *</label>
          <input type="text" id="planTitleInput" required placeholder="เช่น งานอบรมใหญ่ Active Learning สู่สมรรถนะผู้เรียนระดับชาติ..." class="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">วัตถุประสงค์และกลุ่มเป้าหมาย</label>
          <input type="text" id="planTargetAudienceInput" placeholder="เช่น ครูผู้สอนระดับมัธยมศึกษา 500 คน ทั่วประเทศ..." class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">กรอบงบประมาณที่อนุมัติ (บาท) *</label>
            <input type="number" id="planBudgetInput" min="0" required placeholder="เช่น 150000" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">เป้าหมายยอดขายที่คาดหวัง (บาท) *</label>
            <input type="number" id="planTargetSalesInput" min="0" required placeholder="เช่น 1500000" class="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ช่วงเวลาจัดงานตามแผน</label>
            <input type="text" id="planQuarterInput" placeholder="เช่น พฤศจิกายน 2569 (ไตรมาส 1)" class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ผู้อนุมัติหลักการ</label>
            <input type="text" id="planApproverInput" readonly value="ผศ.อินทิรา บุนนาค (กรรมการผู้จัดการ)" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-600 font-medium">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
          <textarea id="planNotesInput" rows="2" placeholder="ระบุรายละเอียดเพิ่มเติม..." class="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="closeAnnualPlanModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer">
            ยกเลิก
          </button>
          <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition btn-tactile cursor-pointer">
            <i class="fa-solid fa-floppy-disk mr-1"></i>บันทึกโครงการอนุมัติหลักการ
          </button>
        </div>
      </form>
    </div>
  </div>`;

if (index.includes(oldNestedBlock)) {
  index = index.replace(oldNestedBlock, newCleanBlock);
  console.log('Successfully un-nested annualPlanModal into a standalone modal!');
} else {
  console.error('Could not find oldNestedBlock in index.html');
  process.exit(1);
}

// 3. Update handleSaveAnnualPlan to sync with backend Google Sheets
const oldHandleSaveAnnualPlan = `      // Sort by seqNo
      plans.sort((a, b) => a.seqNo - b.seqNo);
      AppState.annualPlans = plans;
      localStorage.setItem('twp_annual_principle_plans', JSON.stringify(plans));

      closeAnnualPlanModal();
      showAlert('บันทึกโครงการอนุมัติหลักการ ' + code + ' เรียบร้อยแล้ว', 'success');
      renderAnnualPlanView();`;

const newHandleSaveAnnualPlan = `      // Sort by seqNo
      plans.sort((a, b) => a.seqNo - b.seqNo);
      AppState.annualPlans = plans;
      localStorage.setItem('twp_annual_principle_plans', JSON.stringify(plans));

      // Post to Google Sheets Backend for Multi-Device Cloud Sync
      if (AppState.gasEndpoint) {
        postToBackend('SAVE_ANNUAL_PLANS', { plans: plans })
          .then(res => console.log('Annual plans synced to Google Sheets:', res))
          .catch(e => console.log('Offline saved annual plan'));
      }

      closeAnnualPlanModal();
      showAlert('บันทึกโครงการอนุมัติหลักการ ' + code + ' เรียบร้อยแล้ว', 'success');
      renderAnnualPlanView();`;

if (index.includes(oldHandleSaveAnnualPlan)) {
  index = index.replace(oldHandleSaveAnnualPlan, newHandleSaveAnnualPlan);
  console.log('Updated handleSaveAnnualPlan to sync with backend Google Sheets!');
}

// 4. Update deleteAnnualPlan to sync with backend
const oldDeleteAnnualPlan = `      let plans = (AppState.annualPlans || []).filter(p => p.planId !== planId);
      AppState.annualPlans = plans;
      localStorage.setItem('twp_annual_principle_plans', JSON.stringify(plans));
      showAlert('ลบโครงการอนุมัติหลักการ ' + planId + ' เรียบร้อยแล้ว', 'info');
      renderAnnualPlanView();`;

const newDeleteAnnualPlan = `      let plans = (AppState.annualPlans || []).filter(p => p.planId !== planId);
      AppState.annualPlans = plans;
      localStorage.setItem('twp_annual_principle_plans', JSON.stringify(plans));
      if (AppState.gasEndpoint) {
        postToBackend('DELETE_ANNUAL_PLAN', { planId: planId })
          .catch(e => console.log('Offline deleted annual plan'));
      }
      showAlert('ลบโครงการอนุมัติหลักการ ' + planId + ' เรียบร้อยแล้ว', 'info');
      renderAnnualPlanView();`;

if (index.includes(oldDeleteAnnualPlan)) {
  index = index.replace(oldDeleteAnnualPlan, newDeleteAnnualPlan);
  console.log('Updated deleteAnnualPlan to sync with backend Google Sheets!');
}

// 5. In initApp / loadInitialData, load annual plans from backend
const oldInitDataFetch = `      loadRequestsFromStorage();`;
const newInitDataFetch = `      loadRequestsFromStorage();
      loadAnnualPlansFromCloud();`;

const loadAnnualCloudFn = `
    function loadAnnualPlansFromCloud() {
      if (!AppState.gasEndpoint) return;
      postToBackend('GET_ANNUAL_PLANS', {})
        .then(res => {
          if (res && res.status === 'SUCCESS' && res.data && Array.isArray(res.data.plans) && res.data.plans.length > 0) {
            AppState.annualPlans = res.data.plans;
            localStorage.setItem('twp_annual_principle_plans', JSON.stringify(res.data.plans));
            renderAnnualPlanView();
          }
        })
        .catch(e => console.log('Offline load annual plans'));
    }
`;

if (index.includes(oldInitDataFetch) && !index.includes('loadAnnualPlansFromCloud')) {
  index = index.replace(oldInitDataFetch, newInitDataFetch);
  index = index.replace('function renderAnnualPlanView() {', loadAnnualCloudFn + '\n    function renderAnnualPlanView() {');
  console.log('Added loadAnnualPlansFromCloud on app startup!');
}

fs.writeFileSync('index.html', index, 'utf8');
fs.writeFileSync('frontend/index.html', index, 'utf8');
console.log('index.html and frontend/index.html updated successfully!');
