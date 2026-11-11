# Changelog

All notable changes to the **EMS Enterprise (Enterprise Training Workflow & Closed-Loop Evaluation System)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.15.2] - 2026-11-11

### Added
- **ระบบคำขอจัดอบรมนอกโครงการอนุมัติหลักการประจำปี พร้อมระบบระบุเหตุผลความจำเป็น (Out-of-Plan Topic Request & Justification Governance):**
  - **ตัวเลือกขอจัดนอกแผนในฟอร์มทีม A:** เพิ่มตัวเลือก `⚡ ไม่อยู่ในโครงการอนุมัติหลักการประจำปี (ขอจัดเป็นกรณีพิเศษ / นอกแผน)` ในดรอปดาวน์โครงการหลักการ
  - **ตรวจจับหัวข้อพิมพ์เองอัตโนมัติ:** เมื่อฝ่ายขายพิมพ์หัวข้อใหม่ที่ไม่มีในโครงการอนุมัติหลักการ ระบบจะสลับเข้าสู่โหมดโครงการนอกแผนโดยอัตโนมัติ
  - **กล่องกรอกเหตุผลความจำเป็นแบบบังคับ (Mandatory Justification Box):** แสดงกล่องเตือนและช่องกรอกเหตุผลความจำเป็น พร้อมระบบตรวจสอบ (Validation) บังคับให้กรอกเหตุผลก่อนส่งคำขอ เพื่อความโปร่งใสและตรวจสอบได้
  - **การส่งต่อข้อมูลตลอดกระบวนการพิจารณา (End-to-End Governance):**
    - **คิวตรวจสอบทีม B (ฝ่ายวิชาการ):** แสดงป้ายสถานะ `[⚡ นอกแผนหลักการ (กรณีพิเศษ)]` พร้อมกรอบไฮไลต์เหตุผลความจำเป็นจากทีม A
    - **คิวพิจารณาอนุมัติของผู้บริหาร (Executive Review):** เน้นย้ำเหตุผลความจำเป็นของโครงการนอกแผนเพื่อให้กรรมการผู้จัดการ / ผู้จัดการทั่วไป พิจารณาอย่างรอบคอบก่อนลงนาม
    - **ตารางสรุปคำขอ Dashboard:** แสดงป้ายกำกับ `[⚡ นอกแผน]` ในตารางติดตามสถานะ
    - **บันทึกข้อความขออนุมัติปฏิบัติงาน A4 (Official Memo):** บรรจุหมายเหตุชี้แจงเหตุผลความจำเป็นของการขอจัดเป็นกรณีพิเศษลงในเอกสารทางการ
    - **ระบบส่งต่อ LINE Handoff:** เพิ่มข้อมูลประเภทโครงการและเหตุผลความจำเป็นในข้อความส่งต่อเข้าแอป LINE โดยอัตโนมัติ
  - **การอัปเดต Backend Schema (Google Sheets & Apps Script):**
    - เพิ่มคอลัมน์ `Is_Out_Of_Plan` (col 32), `Out_Of_Plan_Reason` (col 33), และ `Annual_Plan_ID` (col 34) ในชีต `Event_Requests`
    - อัปเดต `SYSTEM_VERSION = '1.15.2'` ใน `backend_code.gs` และ `backend/Code.js`

## [1.15.1] - 2026-11-09

### Added
- **ระบบกล่องส่งต่องาน 1-Click และแจ้งเตือนฝ่ายถัดไปผ่าน LINE / Email (DS / LMI Inspired Workflow Handoff):**
  - **ป๊อปอัปส่งต่องานทันที (`#handoffModal`):** เด้งขึ้นอัตโนมัติเมื่อทีม A ส่งคำขอสำเร็จ หรือเมื่อทีม B ตรวจสอบผ่านส่งต่อให้ผู้บริหาร
  - **ปุ่มเปิดแอป LINE ทันที (`Open LINE App`):** ใช้ LINE URL Scheme เปิดแอป LINE บนมือถือ/คอมพิวเตอร์ พร้อมข้อความสรุปงานและลิงก์ตรวจงานโดยอัตโนมัติ
  - **ปุ่มคัดลอกข้อความสรุป (1-Click Copy):** คัดลอกข้อความสรุปงาน จัดระเบียบ Emoji พร้อม URL นำไปวางในห้องแชตกลุ่มได้ทันที
  - **ปุ่มส่งอีเมลแจ้งเตือน (Email Notification):** เปิดร่างอีเมลใน Outlook/Gmail พร้อมระบุผู้รับและหัวข้อคำขอ
  - **ระบบ Deep Linking (`?tab=...&eventId=...`):** เมื่อคลิกลิงก์จาก LINE หรือ Email ระบบจะเปิดแท็บนั้น เลื่อนหน้าจอลงไปยังงานนั้นอัตโนมัติ พร้อมทำแถบสีเน้นกะพริบ (Active Highlight)
  - **ปุ่มดึงข้อมูลล่าสุดด้วยตนเอง (`[🔄 ดึงข้อมูลล่าสุด]`):** ติดตั้งบน Header ด้านบน และในคิวงานของทีม B และผู้บริหาร
  - **อัปเดตสคริปต์ Google Apps Script (`backend_code.gs`):** เติมเต็มฟังก์ชัน `createRequestTeamA`, `updateReviewTeamB`, `handleExecDecision` และโมดูลส่งอีเมลแจ้งเตือนอัตโนมัติผ่าน `MailApp` ครบถ้วน 100%
- **แท็บ 1: โครงการอนุมัติหลักการประจำปี (Annual Principle-Approved Master Plan - `#view-annualPlan`):**
  - เพิ่มแท็บหลักลำดับที่ 1 ถัดจาก Dashboard เพื่อให้ทีม A จัดการและบันทึกข้อมูลโครงการที่ได้รับอนุมัติหลักการจากกรรมการผู้จัดการ
  - ตารางแสดงรายการแผนหลักการประจำปี: ลำดับที่, รหัสโครงการ, ชื่องานอบรม, กลุ่มเป้าหมาย, กรอบงบประมาณที่อนุมัติ, เป้าหมายยอดขาย, ช่วงเวลาจัดงาน, ผู้อนุมัติหลักการ (ผศ.อินทิรา บุนนาค กรรมการผู้จัดการ)
  - 4 สรุปการ์ด KPI ภาพรวมงบและเป้าหมายยอดขายโครงการหลักการ
  - โมดอลบันทึก/แก้ไข/ลบโครงการอนุมัติหลักการ (`#annualPlanModal`)
  - ปุ่ม 1-Click นำโครงการหลักการไปกรอกในฟอร์มทีม A ทันที (`useAnnualPlanInTeamA`)
- **การเลือกโครงการอนุมัติหลักการในแบบฟอร์มทีม A (`#annualPlanSelect`):**
  - Dropdown ตัวเลือกโครงการอนุมัติหลักการประจำปีในส่วนหัวของฟอร์มทีม A ดึงข้อมูลอัตโนมัติ (หัวข้ออบรม, กรอบงบประมาณ, เป้าหมายยอดขาย, ผู้อนุมัติ)
  - ยังคงความยืดหยุ่นให้ทีม A ปรับแก้รายละเอียดได้ตามสถานการณ์จริง
- **การเชื่อมโยงทันทีตั้งแต่หน้า Landing Page (Instant Entrance):**
  - เพิ่มการ์ดและปุ่มทางลัดเข้าสู่ "โครงการอนุมัติหลักการประจำปี" ได้โดยตรงจากหน้า Landing Page (`enterAnnualPlan()`)
  - เรนเดอร์ข้อมูล `renderAnnualPlanView()` และ `renderAnnualPlanSelectOptions()` พร้อมกันทันทีที่เปิดแอป (`renderAll()` & `DOMContentLoaded`) 0ms delay
- **Mobile UI Simulator v1.15.1 (8 หน้าจอจำลอง):**
  - เพิ่มหน้าจอที่ 2: จำลองแท็บโครงการอนุมัติหลักการประจำปีบนมือถือพร้อมการ์ดสรุปและปุ่ม 1-click

### Changed
- **การเลือกผู้อนุมัติฝ่ายบริหาร:**
  - กำหนดตำแหน่งผู้บริหาร 2 ตำแหน่งมาตรฐาน: **กรรมการผู้จัดการ** และ **ผู้จัดการทั่วไป**
  - ค่าเริ่มต้นกำหนดให้เป็น **ผศ.อินทิรา บุนนาค (กรรมการผู้จัดการ)**
  - นำป้ายข้อความ "ไม่ใช่ทีม A" ออกจากหน้าจอและโมดอลเพื่อความเป็นมืออาชีพ
- **e-Certificate Signatory:**
  - กำหนดชื่อและตำแหน่งผู้ลงนามวุฒิบัตรเริ่มต้นเป็น **ผศ.อินทิรา บุนนาค (กรรมการผู้จัดการ)** และสามารถแก้ไขได้
- **Version Bump:** อัปเกรดเวอร์ชันระบบเป็น **v1.15.1** ทั่วทุกไฟล์และเอกสาร

---

## [1.15.0] - 2026-11-09

### Added
- **ศูนย์บริหารโครงการปี 2569 & กระทบยอดขาย TU (Dedicated FY2569 Strategic Training & TU Sales Reconciliation Hub):**
  - **แท็บการ์ดงานใหม่โดยเฉพาะ (`tabBtn-fy2569Tu`):** แยกสัดส่วนการวางแผนโครงการปี 2569 ออกจากงานปฏิบัติการประจำวัน (Routine Operations) ปีปัจจุบันอย่างเด็ดขาด 100% ปลอดภัยต่อข้อมูลเดิม
  - **ทางเข้าบันทึกโครงการปี 2569 (Dedicated FY2569 Entry Gateway):** บันทึกคำขอจัดอบรมปี 2569 พร้อมค้นหาจากฐานข้อมูล 2,363 โรงเรียน, ดึงจังหวัดและผู้แทนขาย PPC อัตโนมัติ, กำหนดงบประมาณอบรม และเป้าหมายยอดขาย (Target Sales)
  - **ระบบบันทึกและนำเข้ายอดขายจริงจาก TU (Actual Invoiced TU Ledger):** บันทึกเลขที่บิล/ใบสั่งซื้อ TU, วันที่เปิดบิล, ยอดสั่งซื้อจริง, สถานะบิล (Invoiced / Paid / Pending), และรายการสั่งซื้อ
  - **ตารางกระทบยอดรายโรงเรียนแบบเจาะจง (Concrete Side-by-Side Reconciliation Ledger):** แสดงเปรียบเทียบตัวต่อตัวระหว่างงบอบรม, เป้าขาย, และยอดซื้อจริงจากบิล TU พร้อมคำนวณผลต่าง (+/-), % บรรลุเป้าหมาย, Cost-to-Sales ROI %, และป้ายสถานะ (🟢 ทะลุเป้า, 🟡 รอวางบิล TU, 🔴 ต่ำกว่าเป้า)
  - **ตัวกรองรายตัวแทนขาย PPC และสถานะกระทบยอด:** กรองดูผลงานเฉพาะตัวเซลล์แต่ละท่าน หรือเจาะจงดูสถานะบิล
  - **ปุ่มโหลดชุดข้อมูลจำลองปี 2569 & TU (1-Click Sample Data):** โหลดเคสทดสอบ 5 โรงเรียนหลัก (กทม., เชียงใหม่, ขอนแก่น) พร้อมยอดบิล TU เพื่อให้ผู้บริหารและทีมงานเห็นภาพการกระทบยอดได้ทันที
  - **การนำเข้าไฟล์ยอดขาย TU (CSV/Excel Import):** รองรับการวางข้อมูลบิล TU หลายรายการพร้อมกัน
  - **ออกใบบันทึกกระทบยอด A4 (Official A4 Reconciliation Memo):** พิมพ์รายงานสรุปกระทบยอดงบอบรมเทียบยอดขาย TU สัดส่วน A4 แนวนอน พร้อมช่องลงนาม 3 ฝ่าย (ฝ่ายขาย PPC, ฝ่ายวิชาการ, ผู้บริหาร)

### Changed
- **ปรับเปลี่ยนตัวเลขทุกจุดเป็นเลขอารบิกสากล (Universal Arabic Numerals):**
  - ปรับเปลี่ยนตัวเลขไทยทั้งหมด (เช่น ๑, ๒, ๓, ๒๕๖๙) ในระบบหลัก, ระบบแบบประเมิน, วุฒิบัตร e-Certificate, และเอกสารรายงาน A4 ให้เป็นเลขอารบิกสากล (1, 2, 3, 2569) ตามมาตรฐานสากล
  - อัปเดตป้ายกำกับเวอร์ชันทั่วทั้งระบบเป็น **v1.15.0**

---

## [1.14.0] - 2026-11-09

### Added
- **ระบบวิเคราะห์ผลงานและตัวกรองผู้แทนขายรายบุคคล (PPC Individual Sales Filter & Performance Dossier):**
  - ตัวกรอง Dropdown บน Dashboard: เลือกดูรายปี ๒๕๖๙ (2026) หรือเจาะจงรายบุคคลจาก 13 ผู้แทนขาย PPC
  - การ์ดสรุปผลงานรายตัวเซลล์ (PPC Performance Dossier): แสดงจำนวนโรงเรียนในความรับผิดชอบ (จากฐานข้อมูล 2,363 โรงเรียน), จำนวนงานที่จัด, งบประมาณที่ใช้, เป้าหมายยอดขาย, และ Cost-to-Sales ROI %
- **ศูนย์ทดสอบและเปรียบเทียบยอดขาย TU แบบ Zero-Risk Sandbox (`#tuReconcileModal`):**
  - เปรียบเทียบงบประมาณจัดอบรมของ PPC แต่ละคน กับยอดสั่งซื้อจริงที่บันทึกในระบบ TU (Actual Invoiced)
  - คำนวณ Conversion Rate และความคุ้มค่าของการจัดอบรม โดยไม่กระทบฐานข้อมูลหลัก
- **ระบบสำรองและกู้คืนข้อมูลปลอดภัย ๑ วินาที (System Safety Backup & 1-Click Restore):**
  - ปุ่ม `[📥 สำรองข้อมูล (Backup JSON)]` ดาวน์โหลดไฟล์สำรองข้อมูลทั้งระบบเก็บไว้ในเครื่อง
  - ปุ่ม `[🔄 กู้คืนข้อมูล (Restore JSON)]` กู้คืนข้อมูลกลับคืนสู่สภาพเดิมได้ใน 1 คลิก
  - ปุ่ม `[🛡️ รีเซ็ตสู่ค่าปลอดภัย (Factory Reset)]` รีเซ็ตระบบสู่ค่าตั้งต้นที่ปลอดภัย โดยรักษาฐานข้อมูล 2,363 โรงเรียนและเคสตัวอย่างไว้อย่างสมบูรณ์ 100%

---

## [1.13.0] - 2026-11-09

### Added
- **ระบบวุฒิบัตรอิเล็กทรอนิกส์มาตรฐานสากล (Modern International E-Certificate Platform):**
  - **การระบุชื่อผู้เข้าอบรม ๒ บรรทัด (Thai & English):** ระบุชื่อภาษาไทย (ฟอนต์ Sarabun หนาสง่างาม) และชื่อภาษาอังกฤษ (ฟอนต์ Cormorant Garamond มาตรฐานสากล)
  - **การออกแบบกรอบเกียรติบัตรระดับพรีเมียม (Royal Blue & Metallic Gold Luxury Border):** สัดส่วน A4 แนวนอน (Landscape) มีตราสัญลักษณ์สำนักพิมพ์ไทยวัฒนาพานิช (TWP 1936), ตราประทับสุวรรณ TWP 3D Gold Foil Seal, ลายเซ็นดิจิทัล ดร.นิพนธ์ บริหารพัฒนา, และ Verification QR Code
  - **ระบบดูภาพตัวอย่างสดก่อนส่ง (Live Pre-Submit Preview):** ให้ผู้เข้าอบรมเห็นภาพวุฒิบัตรของตนเองก่อนกดส่ง
  - **ระบบจัดส่งวุฒิบัตรเข้าสู่อีเมลทันที (Instant Email Delivery):** ส่งไฟล์ e-Certificate ความละเอียดสูงตรงเข้าอีเมลผู้เข้าอบรมผ่าน Google Apps Script
  - **ระบบล็อกป้องกันการทำซ้ำ (Anti-Reprint Security Lock):** เมื่อส่งอีเมลแล้ว ระบบจะล็อกปุ่มพิมพ์และส่งซ้ำอัตโนมัติ เพื่อป้องกันการสวมสิทธิ์
  - **แผงควบคุมปลดล็อกสิทธิ์โดยผู้ดูแลระบบ (Admin Override Unlock):** ใน Admin Modal เพิ่มฟังก์ชันค้นหา Token และปลดล็อกสิทธิ์ให้ผู้เข้าอบรมออกวุฒิบัตรใหม่ได้กรณีแก้ไขข้อมูล
- **คลังภาพถ่ายกิจกรรมการอบรมของทีม B และเชื่อมต่อ Google Drive (Team B Photo Repository):**
  - เชื่อมตรงกับโฟลเดอร์ Google Drive รวมภาพกิจกรรมโครงการ: `https://drive.google.com/drive/u/0/folders/1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk`
  - รองรับการเลือกและลากวางรูปภาพหลายไฟล์พร้อมกันจากมือถือ/คอมพิวเตอร์ (Multi-File Image Selector)
  - ระบบพรีวิวภาพขยายใหญ่ (Interactive Lightbox Modal) พร้อมคำบรรยายภาพและปุ่มเปิดดูบน Google Drive
- **อัปเดต Google Apps Script Backend (`backend_code.gs` v1.13.0):**
  - Concurrency Lock 30 วินาที ป้องกันข้อมูลชนกันแม้มีผู้ประเมินพร้อมกัน 100+ คน
  - ฟังก์ชัน `SEND_ECERTIFICATE_EMAIL` ส่งอีเมลเทมเพลตมาตรฐานสำนักพิมพ์ไทยวัฒนาพานิช
  - ฟังก์ชัน `UPLOAD_EVENT_PHOTO` อัปโหลดไฟล์รูปภาพเข้า Google Drive โฟลเดอร์ `1GxHFu2kMPwtl7j3PvnD6wHRb_YwlQGqk` โดยตรง
  - ฟังก์ชัน `ADMIN_UNLOCK_CERT` สำหรับ Admin ปลดล็อกสิทธิ์

---

## [1.12.0] - 2026-11-09

### Added
- **ระบบสร้างและจัดการ QR Code ๒ มิติ (Dual QR Code Presentation & Sharing Hub):**
  - **๑. QR Code แบบประเมินผลการอบรม ๑๐ มิติ:** สแกนเข้าสู่หน้า `survey.html?t=...` ทันทีเมื่อการอบรมเสร็จสิ้น ให้ผู้เข้าร่วมตอบแบบประเมินความพึงพอใจ 10 ข้อบนสมาร์ตโฟน
  - **๒. QR Code คลังไฟล์และเอกสารประกอบ (Cloud Storage / Google Drive):** สแกนเพื่อเข้าถึง Google Drive หรือ OneDrive แหล่งเก็บสไลด์ คู่มือการสอน สื่อดิจิทัล และโฟลเดอร์ภาพถ่ายกิจกรรมโครงการ
  - **โหมดฉายจอห้องอบรม (Presentation Slide View):** ปุ่มลัด `[🖥️ ฉายจอห้องอบรม (Slide)]` เปิดหน้าต่าง Fullscreen สำหรับโปรเจกเตอร์ความละเอียดสูง สแกนง่ายจากทุกตำแหน่งในห้องประชุม
- **แท็บและระบบบันทึกค่าใช้จ่ายจริงของทีม B (Team B Actual Expense Settlement Tab `#view-teamBExpenses`):**
  - แท็บเมนูใหม่ **`ทีม B: สรุปค่าใช้จ่ายจริง`** พร้อม Badge แจ้งเตือน
  - **๗ หมวดรายจ่ายมาตรฐานตามระเบียบบริษัท (Recommended 7 Standard Expense Dimensions):**
    1. ค่าตอบแทนวิทยากรและผู้ช่วยวิทยากร (Honorarium)
    2. ค่ายานพาหนะ การเดินทาง และน้ำมันเชื้อเพลิง (Travel & Fuel)
    3. ค่าห้องพักและที่พักทีมงาน/วิทยากร (Hotel & Stay)
    4. ค่าอาหารกลางวัน อาหารว่าง และเครื่องดื่ม (Catering & Coffee Break)
    5. ค่าเอกสาร คู่มือ และชุดอุปกรณ์การเรียน (Materials, Kits & Printing)
    6. ค่าสถานที่ โสตทัศนูปกรณ์ และห้องประชุม (Venue Rental & AV Tech)
    7. ค่าของที่ระลึก เกียรติบัตร ป้ายไวนิล และเบ็ดเตล็ด (Souvenirs, Certificates & Misc)
  - **ระบบคำนวณและเปรียบเทียบงบประมาณ ๓ มิติแบบ Real-Time (Triple Budget Comparison Box):**
    - เปรียบเทียบงบเสนอเดิม (ทีม A) vs งบตัดจ่ายที่อนุมัติ (ทีม B) vs ค่าใช้จ่ายจริงรวม ๗ หมวด
    - วิเคราะห์เงินประหยัดสุทธิ (Net Savings) และผลต่างต้นทุนต่อหัว (Actual Cost per Head vs Estimated Cost per Head)
    - บันทึกและนำข้อมูลค่าใช้จ่ายจริงไปอัปเดตลงรายงานประเมินผล A4 อัตโนมัติ
- **โครงการตัวอย่างการจัดงานครบวงจร ๑ งาน (`EVT-DEMO-2026` End-to-End Demonstration Exemplar):**
  - รหัสโครงการ: `EVT-DEMO-2026` โรงเรียนเตรียมอุดมศึกษาพัฒนาการ (กรุงเทพมหานคร สพม.กท 2) ขนาด AA (นักเรียน 3,982 คน)
  - หลักสูตร: *Active Learning สู่สมรรถนะผู้เรียนด้วยสื่อนวัตกรรมดิจิทัล*
  - ครบวงจรทุกขั้นตอน: เสนอโครงการ $\rightarrow$ ตรวจวิชาการ $\rightarrow$ ลายเซ็นดิจิทัลผู้อนุมัติ (ดร.นิพนธ์ บริหารพัฒนา) $\rightarrow$ แบบประเมิน 10 ข้อ 48 คน (96.0%, เฉลี่ย 4.91/5.00) $\rightarrow$ สรุปค่าใช้จ่ายจริง 7 หมวด รวม 20,500 บาท (ประหยัด 4,500 บาทจากงบขอเดิม)
  - **พาดหัวเอกสาร A4 ทุกฉบับ (Memo, รายงานผลประเมิน 10 ข้อ, และ PPC Official Summary):**
    `🌟 เอกสารตัวอย่างการใช้ระบบ (End-to-End System Demonstration Exemplar)`
  - ปุ่มลัด **`[⭐ ดูตัวอย่างการจัดงานครบวงจร]`** บนแถบเมนูหลัก Header คลิกเดียวเข้าถึงเอกสารและเคสตัวอย่างได้ทันที

---

## [1.11.0] - 2026-11-09

### Added
- **ฝังฐานข้อมูลลูกค้าสถานศึกษา สพม. ปี 2568 ครบถ้วน 2,363 โรงเรียนทั่วประเทศ (Embedded Customer Master Database):**
  - ฝังฐานข้อมูลสถานศึกษา 2,363 โรงเรียนลงในระบบโดยตรง ทำงานแบบ Offline-First 100% ไม่ต้องรอเชื่อมต่ออินเทอร์เน็ต
  - ข้อมูลครบถ้วนทุกมิติ: สังกัด สพม. เขต, จังหวัด, อำเภอ, ยอดนักเรียนรายระดับชั้น ม.1 - ม.6, รวมนักเรียนทั้งโรงเรียน (รวมทั้งประเทศ 2,214,721 คน), ขนาดโรงเรียน (AA: 125, A: 280, B: 362, C: 419, D: 1,177 แห่ง), หมายเหตุ, และผู้แทนขายผู้ดูแลพื้นที่ (13 รหัสพนักงานประจำ 6 ภาค)
- **หน้าต่างค้นหาและตรวจสอบฐานข้อมูลลูกค้าสถานศึกษา สพม. (`#customerDirectoryModal`):**
  - ปุ่มลัด **`[🏫 ฐานข้อมูลลูกค้า (2,363)]`** บน Header
  - ระบบค้นหาอัจฉริยะแบบ Live Search ค้นหาตามชื่อโรงเรียน, สพม., อำเภอ, จังหวัด หรือชื่อเซลล์
  - ตัวกรอง 2 มิติ: กรองตามภูมิภาค (6 ภาค) และกรองตามขนาดโรงเรียน (AA ถึง D)
  - ปุ่มลัด **`[+ เลือกขออบรม]`** นำชื่อโรงเรียนและจังหวัดไปกรอกฟอร์มขออบรมของทีม A ในคลิกเดียว
- **ระบบ Auto-Complete & Real-Time Customer Profile Card:**
  - แสดงการ์ดสรุปโปรไฟล์ลูกค้าสีเขียวมรกตทันทีที่พิมพ์/เลือกชื่อโรงเรียน: ขนาด, สพม., ยอดนักเรียนรวม, และเซลล์ผู้ดูแล
  - ปรับการเรนเดอร์ `<datalist>` เป็นแบบ High Performance HTML String Generation (ประมวลผลเสร็จใน 15ms)
- **ระบบจัดระเบียบชื่อหน่วยงานอัจฉริยะ (Smart Organization Normalizer):**
  - รองรับการพิมพ์เพิ่มหน่วยงานเองได้อย่างอิสระ ทั้ง **อบต., เทศบาล, อบจ., มหาวิทยาลัย, วิทยาลัย, สถาบัน, ศูนย์การเรียนรู้/สกร.** หรือโรงเรียนเอกชน
  - ไม่บังคับเติมคำว่า "โรงเรียน" หากพิมพ์ชื่อ อบต. หรือเทศบาล
  - สามารถพิมพ์ชื่อและยื่นคำขอจัดอบรมได้ทันทีโดยไม่ถูกบล็อก หรือกดปุ่ม **`[+ บันทึกเข้าฐานข้อมูล]`** เพื่อเก็บไว้ในระบบถาวร
- **ระบบ Synchronous Immediate Rendering & Master Data Shield:**
  - ย้ายการโหลด Master Data ทั้งหมดมาไว้ส่วนบนสุดของระบบ ทำให้ระบบเรนเดอร์เสร็จทันทีที่เปิดหน้าเว็บ (0ms delay)
  - ป้องกันฐานข้อมูลโรงเรียนสูญหาย: ไม่ยอมให้ข้อมูลว่างจาก Google Sheets มาลบหรือทับฐานข้อมูล 2,363 โรงเรียนในเครื่อง

### Fixed
- **แก้ไข SyntaxError ในสคริปต์หลัก:** แก้ไขข้อผิดพลาดบล็อก `catch` และ `MockDatabase` ซ้ำซ้อน ทำให้ทุกฟังก์ชันกลับมาทำงานได้สมบูรณ์แบบ 100%
- **กู้คืนฟังก์ชันการทำงานระบบเต็มรูปแบบ:** กู้คืนฟังก์ชัน Admin, สลับโปรไฟล์, ล็อกเอาต์, และ Concurrency Lock ให้พร้อมใช้งานครบถ้วน

---

## [1.10.0] - 2026-11-09

### Added
- **ฝังฐานข้อมูลลูกค้าสถานศึกษา สพม. ปี 2568 ครบถ้วน 2,363 โรงเรียนทั่วประเทศ (Embedded Customer Master Database):**
  - นำเข้าและฝังฐานข้อมูลลูกค้า 2,363 โรงเรียนลงในระบบอย่างสมบูรณ์แบบ Offline-First (ทำงานได้ตลอดเวลาแม้ไม่มีอินเทอร์เน็ต)
  - ครอบคลุมข้อมูลสำคัญครบทุกมิติ: สังกัด สพม. เขต, จังหวัด, อำเภอ, ยอดนักเรียนรายระดับชั้น ม.1 - ม.6, ยอดนักเรียนรวมทั้งโรงเรียน (รวมทั้งประเทศ 2,214,721 คน), ขนาดโรงเรียน (AA: 125, A: 280, B: 362, C: 419, D: 1,177 แห่ง), หมายเหตุ, และผู้แทนขายผู้รับผิดชอบพื้นที่ (13 รหัสประจำ 6 ภาค)
  - เพิ่มหน้าต่างค้นหาและตรวจสอบ **"ฐานข้อมูลลูกค้าสถานศึกษา สพม." (`#customerDirectoryModal`)** พร้อมระบบ Live Search, กรองตามภาค, กรองตามขนาดโรงเรียน, และปุ่มลัด "เลือกขออบรม"
  - ระบบ Auto-Complete & Real-Time Fuzzy Search ในฟอร์มคำขอทีม A: เมื่อเลือกชื่อโรงเรียน ระบบจะแสดงการ์ดโปรไฟล์ลูกค้าระดับพรีเมียม พร้อมดึงจังหวัดและชื่อเซลล์ลงฟอร์มให้อัตโนมัติ
- **ระบบป๊อปอัปเซ็นชื่ออนุมัติแบบดิจิทัล (Digital Signature Pad for Executive Approval):**
  - หน้าต่างป๊อปอัป `#signatureModal` สำหรับผู้บริหารเพื่อลงลายมือชื่ออนุมัติโครงการแบบ Interactive Signature Pad
  - รองรับการจรดปากกา/นิ้วสัมผัส/เมาส์ บนหน้าจอทุกประเภทอย่างลื่นไหล (iPhone, iPad, สมาร์ทโฟน Android ทุกรุ่น, แท็บเล็ต, PC, โน้ตบุ๊ก)
  - ป้องกันการเลื่อนหน้าจอที่ไม่พึงประสงค์ (touch scroll cancellation) ด้วย `touch-action: none` พร้อมการปรับความคมชัดระดับ Hi-DPI Retina Display
  - บันทึกและนำรูปลายเซ็นต์ดิจิทัลของผู้บริหารไปประทับลงในเอกสารบันทึกข้อความขออนุมัติ A4 และรายงานสรุปประเมิน 10 ข้อ A4 ในช่อง "ผู้มีอำนาจอนุมัติ (ฝ่ายบริหาร)" โดยอัตโนมัติ
- **แบบประเมินความพึงพอใจการอบรมมาตรฐาน 10 ข้อ (10-Question Standard Training Evaluation Survey & QR Code):**
  - ยกระดับแบบประเมินการอบรมใน `survey.html` ครอบคลุม 10 ด้านมาตรฐานระดับสากล:
    1. ความรู้ความเชี่ยวชาญของวิทยากร
    2. ความชัดเจนและเทคนิคในการถ่ายทอด
    3. ความทันสมัยและประโยชน์ของเนื้อหา
    4. การนำความรู้ไปประยุกต์ใช้ในการปฏิบัติงาน
    5. ความครบถ้วนสมบูรณ์ของเอกสารและสื่อ
    6. การบริหารจัดการเวลาในการฝึกอบรม
    7. ความพร้อมของสถานที่และโสตทัศนูปกรณ์
    8. การประสานงานและการให้บริการของเจ้าหน้าที่
    9. ความพึงพอใจในภาพรวมของกิจกรรม
    10. ความสนใจเข้าร่วมกิจกรรมหรือหลักสูตรต่อเนื่อง
  - ระบบสร้าง QR Code ประจำแต่ละโครงการโดยอัตโนมัติ ให้ผู้เข้าร่วมอบรมสแกนเข้าทำแบบประเมินผ่านมือถือได้ทันที พร้อมบันทึกผลคะแนนเรียลไทม์
- **รายงานสรุปผลการประเมินและวิเคราะห์ต้นทุนการจัดอบรมสำหรับผู้บริหาร A4 (Executive 10-Question Evaluation & Cost Analysis Report):**
  - จัดทำรายงานทางการขนาดกระดาษมาตรฐาน A4 ด้วยฟอนต์ **TH Sarabun ขนาด 12pt**
  - จัดระยะขอบกระดาษตามมาตรฐานงานสารบรรณ (กั้นหน้า 30 มม., กั้นหลัง 20 มม., กั้นบน 25 มม., กั้นล่าง 25 มม.)
  - ตารางสรุปคะแนนประเมินทั้ง 10 ด้าน: คะแนนเฉลี่ย (เต็ม 5.00), ร้อยละความพึงพอใจ (%), และระดับคุณภาพ (ดีเลิศ / ดีมาก / ดี / พอใช้)
  - **การประเมินสัดส่วนผู้เข้าร่วมอบรม (Participation Rate %):** เปรียบเทียบผู้เข้าร่วมเป้าหมายที่ตั้งไว้ (Expected Trainees) กับผู้ทำแบบประเมินจริง (Actual Evaluators)
  - **การคำนวณและวิเคราะห์ค่าใช้จ่ายต่อหัว (Cost per Head: บาท/คน):** `งบประมาณใช้จริง ÷ จำนวนผู้ประเมินจริง` เปรียบเทียบกับงบประมาณต่อหัวที่ขอ และเป้าหมายยอดขายเฉลี่ยต่อหัว
  - สรุปข้อคิดเห็นและข้อเสนอแนะเชิงคุณภาพของผู้รับการอบรม
  - ช่องลงนาม 3 ฝ่ายสมบูรณ์ (ผู้เสนอโครงการฝ่ายขาย ทีม A, ผู้ตรวจสอบฝ่ายวิชาการ ทีม B, ผู้มีอำนาจอนุมัติฝ่ายบริหารพร้อมลายเซ็นต์ดิจิทัล)
  - พรีวิวเอกสารเห็นครบถ้วนทั้งหัวกระดาษ (Header) และท้ายกระดาษ (Footer) พร้อมปุ่มสั่งพิมพ์/บันทึกเป็น PDF จากเบราว์เซอร์ได้ทันที
- **ระบบสลับเอกสาร 3 รูปแบบ (3-in-1 Document Switcher):**
  - สามารถสลับดูและพิมพ์เอกสารทั้ง 3 รูปแบบได้จากป๊อปอัปเดียว: `[📄 บันทึกขออนุมัติ A4]`, `[📊 สรุปประเมิน 10 ข้อ A4]`, `[📈 รายงานสรุปผล PPC]`

### Fixed
- **ระบบ Presence Concurrency & Device Tracking:** แก้ไขตัวแปร syncChannel ให้ทำงานร่วมกับ appBroadcastChannel อย่างสมบูรณ์ ทำให้การออกจากระบบ (Logout) ทำงานได้เสถียร 100% ปราศจาก JavaScript Error

---

## [1.9.0] - 2026-11-09

### Added
- **หน้าตรวจสอบคำขอฝ่ายวิชาการทีม B แสดงข้อมูลทีม A ครบถ้วนแบบอ่านอย่างเดียว (Read-Only Dossier):**
  - ดึงข้อมูลข้อเสนอทั้งหมดจากฝ่ายขาย (ทีม A) มาแสดงบนหน้าจอของทีม B อย่างครบถ้วนสมบูรณ์ (หัวข้อหลักสูตร, ประเภทกิจกรรม, โรงเรียน/สถาบัน, จังหวัด, จำนวนผู้เข้าอบรมเป้าหมาย, เป้าหมายยอดขาย, งบประมาณที่ขอ, ความต้องการที่พัก/ห้องพัก, การเดินทาง/ยานพาหนะ, วัตถุประสงค์, ผู้เสนอ และวันเวลาที่ส่ง)
  - ล็อกข้อมูลส่วนของทีม A ไว้ทั้งหมดเพื่อห้ามแก้ไข (`🔒 ข้อมูลเสนอขอจัดอบรมจากทีม A (อ่านอย่างเดียว - ห้ามแก้ไข)`) เพื่อป้องกันการเปลี่ยนแปลงเนื้อหาเดิมของฝ่ายขาย
  - ทีม B แก้ไขได้เฉพาะส่วนงานการกลั่นกรองวิชาการของตนเองเท่านั้น: ยืนยันวิทยากรผู้บรรยาย, งบประมาณตัดจ่ายจริง, และบันทึกความเห็นทางวิชาการ
  - เพิ่มปุ่ม **`[📄 ดูบันทึกขออนุมัติ A4]`** ให้ทีม B สามารถกดพรีวิวเอกสารบันทึกข้อความได้ทันที
- **ส่วนคิวงานผู้บริหาร (Executive Review) แสดงข้อมูลทีม A และ ทีม B เคียงคู่กัน (Dual Dossier):**
  - นำข้อมูลข้อเสนอจากทีม A (ฝ่ายขาย) และข้อมูลการกลั่นกรองจากทีม B (ฝ่ายวิชาการ) มาแสดงคู่กันแบบ Side-by-Side ก่อนทำการตัดสินใจ
  - แถบเปรียบเทียบทางการเงินและโลจิสติกส์: งบประมาณที่ขอ vs งบตัดจ่ายจริง, ยอดเงินที่ประหยัดได้, สัดส่วนงบต่อยอดขาย (ROI Cost-to-Sales %), และสถานะการจัดที่พัก/รถตู้
  - เพิ่มปุ่ม **`[📄 ตรวจบันทึกขออนุมัติ A4]`** เพื่อให้ผู้บริหารตรวจทานเอกสารฉบับทางการก่อนลงนามอนุมัติ
- **ระบบออกบันทึกเสนอขออนุมัติปฏิบัติงาน A4 ฉบับทางการ (Official Operations Approval Memo):**
  - สร้างเอกสารบันทึกข้อความราชการ/บริษัทตามมาตรฐานงานสารบรรณ พิมพ์หัวกระดาษตราสัญลักษณ์ TWP และข้อความ **"บันทึกข้อความ"**
  - ใช้แบบอักษรมาตรฐาน **TH Sarabun New / Sarabun ขนาด 12pt** สำหรับเนื้อหา (หัวข้อขนาด 14pt-16pt หนา)
  - จัดระยะขอบหน้ากระดาษ (Margins) กั้นหน้า-หลังอย่างเหมาะสมตามมาตรฐานงานสารบรรณ: ซ้าย 30 มม. (3 ซม.), ขวา 20 มม. (2 ซม.), บน 25 มม., ล่าง 25 มม. ย่อหน้า 2.5 ซม. พร้อมจัดกระจายข้อความแบบสม่ำเสมอ (Text Justify)
  - โครงสร้าง 4 ประเด็นชัดเจน:
    1. ความเป็นมาและวัตถุประสงค์ (ข้อเสนอฝ่ายขาย - ทีม A)
    2. แผนการจัดกิจกรรมเชิงวิชาการและโลจิสติกส์ (การกลั่นกรองฝ่ายวิชาการ - ทีม B)
    3. ประมาณการงบประมาณและผลตอบแทนที่คาดว่าจะได้รับ (งบเสนอ vs งบตัดจ่ายจริง, ROI)
    4. ข้อพิจารณาและข้อเสนอเพื่อโปรดอนุมัติ
  - บล็อกช่องลงลายมือชื่อ 3 ฝ่าย (Three-Party Signatures): ผู้ขออนุมัติ (ทีม A), ผู้กลั่นกรองเห็นควรอนุมัติ (ทีม B), และคำสั่งการผู้อนุมัติ (ผู้บริหาร) พร้อมวันที่มีผล
- **ระบบสลับพรีวิวเอกสาร (Document Format Switcher):**
  - เมนูสลับมุมมองในหน้าพรีวิว: **`[📄 บันทึกขออนุมัติ A4]`** และ **`[📊 รายงานสรุปผล PPC]`**
  - หน้าพรีวิวขนาด A4 สัดส่วนจริง แสดงผลครบถ้วนตั้งแต่ Header ถึง Footer
  - รองรับการพิมพ์จริง (Print to PDF / Printer) ด้วยขนาด A4 และ Margin มาตรฐาน

---

## [1.8.0] - 2026-11-09

### Added
- **ระบบจัดการสมาชิกและสิทธิ์ประจำทีม (Team Directory & Identity Profile):**
  - กำหนดให้สมาชิกในแต่ละทีมต้องมีข้อมูลครบ 4 มิติ: **ชื่อ - นามสกุล**, **ส่วนงาน / ทีม** (ทีม A, ทีม B, ผู้บริหาร, ศูนย์ประเมินผล), **ตำแหน่งงาน**, และ **บริษัทฯ** (บจก.ไทยวัฒนาพานิช)
  - เพิ่มเมนูในหน้า Setting (`admin0000`) ให้สามารถ **เพิ่ม (Add)** และ **ลบ (Delete)** สมาชิกในแต่ละทีมได้อย่างอิสระ
  - เพิ่มหน้าต่าง **สลับโปรไฟล์ผู้ปฏิบัติงาน (Switch Profile)** ที่ Header ให้ผู้ใช้เลือกชื่อตนเองจากรายชื่อทีมได้ทันที พร้อมอัปเดต Badge ทีมและตำแหน่งงาน
- **ปุ่มออกจากระบบ (Logout) และ Pop-up แจ้งเตือนการซิงค์:**
  - เพิ่มปุ่ม **"ออกจากระบบ"** บนแถบ Header
  - แสดง Pop-up ยืนยันว่าระบบได้ทำการซิงค์และบันทึกข้อมูลล่าสุดเข้าสู่ Google Sheets เรียบร้อยแล้ว พร้อมถอดรหัสเครื่องออกจากระบบออนไลน์ และพาผู้ใช้กลับสู่หน้า Landing Page
- **ปรับปรุงความเสถียรของการเชื่อมต่อ Google Sheets & สถานะ Online-Offline:**
  - แก้ไขปัญหาอาการหลุดเป็นออฟไลน์เร็วเกินไป โดยติดตั้ง **Connection Resilience Engine**: ป้องกันไม่ให้ออฟไลน์จากความล่าช้าชั่วขณะของเน็ต (ต้องล้มเหลวติดต่อกัน 3 ครั้งจึงจะถือว่าออฟไลน์)
  - ปรับปรุงการตรวจสอบ Ping ให้ตรวจผ่านการซิงค์ข้อมูลจริง เพื่อความแม่นยำสูง
  - แสดงสถานะที่ชัดเจน: `🟢 ออนไลน์: ซิงค์ Google Sheets แล้ว (เวลา)` พร้อมระบุสถานะการเชื่อมต่อ

---

## [1.7.0] - 2026-11-09

### Added
- **Landing Page Executive Fast-Track:**
  - เพิ่มปุ่มลัด **"สำหรับผู้บริหาร: ดู Dashboard ทันที"** บนหน้า Landing Page เข้าสู่ระบบและแสดงหน้า Dashboard วิเคราะห์ผลการดำเนินงานทันทีใน 1 คลิก
- **Active Online Devices & Collaboration Presence Counter:**
  - แสดงตัวเลขนับจำนวนเครื่องที่เข้าใช้งานระบบพร้อมกันแบบเรียลไทม์บน Header (เช่น `🟢 ใช้งานพร้อมกัน: 3 เครื่อง`)
  - กลไก Heartbeat ตรวจสอบสถานะการเชื่อมต่อทุก 8 วินาที พร้อมหน้าต่างแสดงรายละเอียดผู้ใช้งานแต่ละเครื่อง (ชื่อผู้ปฏิบัติงาน, รหัสเครื่อง, หน้าที่เปิดอยู่)
- **Field-Level / Card-Level Concurrency Collision Lock (ระบบป้องกันการคีย์ชนกัน):**
  - กฎ **"ใครเข้าใช้ก่อน ให้ทำงานให้เสร็จก่อน"** (First-come, First-served)
  - ล็อกช่องข้อมูลหรือการ์ดใบงานทันทีเมื่อมีผู้เริ่มพิมพ์หรือโฟกัส
  - แสดง Pop-up เตือนเมื่อมีผู้ใช้อื่นพยายามแก้ไขช่องเดียวกัน: แจ้งชื่อผู้ปฏิบัติงานคนแรก และเวลาที่เริ่มเข้าใช้ เพื่อป้องกันการเขียนทับ
  - รองรับการเปิดดูและค้นหาข้อมูล (Read-only) ได้พร้อมกันทุกเครื่องตามปกติ
  - ปลดล็อกอัตโนมัติเมื่อผู้ใช้ทำรายการเสร็จสิ้น พร้อมระบบ Safety Timeout 2.5 นาทีป้องกันการค้าง
- **Admin Full Edit & Delete on Every Card:**
  - เมื่อปลดล็อกรหัสผู้ดูแลระบบ (`admin0000`) จะแสดงปุ่ม **`[✏️ แก้ไข (Admin)]`** และ **`[🗑️ ลบ (Admin)]`** บนการ์ดทุกใบในทุกหน้าจอ (Dashboard, ทีม A, ทีม B, ผู้บริหาร, ศูนย์ประเมิน)
  - หน้าต่าง Modal ให้ Admin แก้ไขได้ทุกฟิลด์ (หัวข้อ, จังหวัด, โรงเรียน, เซลล์, งบประมาณ, ผู้เข้าอบรม, สถานะ) และปุ่มลบใบงานพร้อมบันทึก Audit Log และกระจายสัญญาณซิงค์ทุกเครื่องทันที

---

## [1.6.0] - 2026-11-09

### Added
- **PPC Sales Representatives Master Data & Admin Settings:**
  - นำเข้ารายชื่อผู้แทนขายทางการจาก PPC ครบทั้ง 13 ท่าน ครอบคลุมทุกภูมิภาค (กทม., ภาคกลาง, ภาคใต้, ภาคเหนือ, ภาคอีสาน, ส่วนกลาง)
  - เพิ่มฟังก์ชันจัดการพนักงานขายในเมนู Settings (`admin0000`) รองรับการเพิ่มพนักงานขายใหม่ และปุ่มดึง/รีเซ็ตข้อมูลจากระบบ PPC / TU
- **Smart Name Normalization & Anti-Duplication Engine:**
  - ตรวจจับและแปลงตัวย่อชื่อโรงเรียน เช่น `ร.ร.` หรือ `รร.` ให้เป็นมาตรฐาน `โรงเรียน` อัตโนมัติ
  - ตัดช่องว่างส่วนเกินหน้า-หลัง (Trim) และยุบช่องว่างซ้ำซ้อน
  - ตรวจสอบชื่อขณะพิมพ์แบบ Prefix-agnostic: หากมีในฐานข้อมูล PPC จะดึงเกรด Tier, จังหวัด และเซลล์ผู้ดูแลมาให้ทันที
  - หากเป็นชื่อใหม่ที่ยังไม่มีในระบบ จะเสนอทางเลือก `[+ เพิ่มเป็นโรงเรียนใหม่]` หรือ `[+ เพิ่มเป็นพนักงานขายใหม่]` พร้อมเปิดหน้าต่าง Quick Add Modal บันทึกเข้าฐานข้อมูลทันที
- **Enhanced Dashboard & Topic Evaluation Analytics:**
  - เพิ่ม KPI Card: **จำนวนผู้เข้าอบรมรวม (Total Trainees / Participants Count)** แสดงตัวเลขสะสมจากทุกหลักสูตร
  - เพิ่ม Section: **การดำเนินงานและจำนวนผู้เข้าอบรมรายหัวข้อ (Topic Evaluation Breakdown)** แสดงสถิติจำนวนครั้งที่จัดและจำนวนผู้เข้าอบรมแต่ละหัวข้อพร้อมแถบสัดส่วน
  - เพิ่ม Section: **คะแนนความพึงพอใจแยกตามหัวข้ออบรม (Topic Satisfaction Rating & Quality Matrix)** คำนวณคะแนนเฉลี่ย 5.00 คะแนน พร้อม Visual Progress Bar และเรตติ้งดาวความพึงพอใจ

---

## [1.5.1] - 2026-10-29

### Added
- **ฝัง Production Google Apps Script Web App Endpoint อัตโนมัติ (`AKfycby...`):**
  - กำหนดค่า Default Web App URL ในระบบเป็น:
    `https://script.google.com/macros/s/AKfycby-D2AvgHXO_y4tVxg8wgkDP9ARBnRpiVp47-vnF7AiA1TA4AqwKGbelJTyI68tKfmx6g/exec`
  - ฝัง Endpoint นี้ลงในระบบ QR Code ประจำทีมทุกประเภท (ทีม A, ทีม B, ผู้บริหาร, Dashboard) ผ่านพารามิเตอร์ `&ep=` อัตโนมัติ
  - เมื่อผู้ร่วมงานสแกน QR Code เพื่อ Onboard ข้ามเครื่อง ระบบจะดึง URL นี้และบันทึกเข้าสู่เครื่องใหม่อัตโนมัติทันที
  - อัปเดต `frontend/survey.html` (แบบประเมินผู้เข้าอบรม) ให้ส่งข้อมูลผลประเมินยิงตรงเข้า Google Apps Script Web App นี้ แม้เปิดผ่านเครือข่ายภายนอกหรือ GitHub Pages
  - ช่องตั้งค่า Apps Script Endpoint ในหน้า Admin Panel (`admin0000`) จะแสดงและใช้งาน Endpoint นี้เป็นค่าเริ่มต้นทันที

---

## [1.5.0] - 2026-10-29

### Added
- **PPC Database Setup & Google Sheets Auto-Connector (`backend/PPC_Setup_And_Reports.js`):**
  - **Custom Menu ใน Google Sheets (`📊 PPC Training Center`):** ติดตั้งเมนูคำสั่งอัตโนมัติบน Google Spreadsheet สำหรับกดสร้างโครงสร้างชีต 7 ตาราง, สร้างรายงานสรุป, และ Export PDF/Word
  - **โครงสร้าง 7 ตารางฐานข้อมูลมาตรฐาน PPC:**
    1. `PPC_Master` (ข้อมูลโรงเรียน, โซน, พนักงานขาย, Tier ลูกค้า, ข้อมูลติดต่อ)
    2. `Event_Requests` (คอลัมน์คำขอครบวงจร รวมที่พัก รถรับส่ง ลิงก์ PDF และ Word)
    3. `QR_Tokens` (Token แบบประเมิน Zero-Trust)
    4. `Evaluation_Responses` (ผลประเมิน 5 มิติจากผู้เข้าอบรม)
    5. `System_Logs` (Audit Trail ตรวจสอบย้อนหลัง)
    6. `System_Settings` (พารามิเตอร์ระบบและรหัสผ่าน Admin)
    7. `PPC_Performance_Summary` (แผ่นสรุปแดชบอร์ด KPI ในชีต พร้อมสูตรคำนวณอัตโนมัติ)
- **รายงานสรุปการปฏิบัติงาน A4 มาตรฐานโปรแกรม PPC (PPC Operations & Performance Report):**
  - จัดหน้าแบบฟอร์ม A4 มาตรฐานราชการ/บริษัทมหาชน (TH Sarabun PSK 16pt / 14pt)
  - แบ่งรายงานเป็น 5 ส่วนสมบูรณ์:
    - ส่วนที่ 1: ข้อมูลโครงการและหน่วยงานเป้าหมาย (PPC Account Profile)
    - ส่วนที่ 2: การดำเนินงานเชิงวิชาการและโลจิสติกส์ (Academic & Logistics Execution)
    - ส่วนที่ 3: สรุปงบประมาณและผลตอบแทนเชิงพาณิชย์ (Financial & Commercial ROI Analysis)
    - ส่วนที่ 4: ผลการประเมินความพึงพอใจปิดลูป 5 มิติ (Closed-Loop Trainee Evaluation)
    - ส่วนที่ 5: การลงนามรับรองผลการปฏิบัติงาน 3 ฝ่าย (Tri-Party Certification Signatures)
- **Dual Export Engine: PDF และ Microsoft Word (.docx):**
  - **Export PDF:** สร้างไฟล์ PDF A4 Sarabun บันทึกลง Google Drive พร้อมลิงก์เปิดอ่าน และฟังก์ชัน Print to PDF
  - **Export Word (.docx):** สร้างไฟล์เอกสาร Word ผ่าน Google Docs Drive Export Feed และสร้างไฟล์ `.doc/.docx` จากเบราว์เซอร์ได้ทันที
  - เพิ่มหน้าต่างพรีวิวรายงาน A4 บน WebApp (`#ppcReportModal`) พร้อมปุ่มกดดูได้จากตาราง Dashboard และการ์ดประเมินผล

---

## [1.4.0] - 2026-10-29

### Added
- **Team QR Code Pairing & Auto-Onboarding (สแกน QR ประจำทีม เชื่อมต่อเครื่องใหม่):**
  - หน้าต่าง Modal สแกน QR Code ประจำทีม (`teamQrModal`) รองรับ 4 โหมดการทำงาน:
    1. **ทีม A: พนักงานขาย (Sales) ขอจัดอบรม** (`role=teamA`)
    2. **ทีม B: ฝ่ายวิชาการ ตรวจสอบคำขอ & จัดสรรวิทยากร** (`role=teamB`)
    3. **ผู้บริหาร: อนุมัติงบ & ออก Token** (`role=exec`)
    4. **ศูนย์กลาง: Dashboard & ปิดลูปประเมินผล** (`role=evaluation`)
  - สร้าง QR Code สีน้ำเงิน TWP `#08539E` แบบ On-The-Fly พร้อมปุ่มคัดลอกลิงก์ตรง และปุ่มทดสอบเปิดในหน้าต่างใหม่
  - เมื่อผู้ใช้ใหม่หรือสมาร์ตโฟนสแกน QR Code:
    - ระบบจะเปิดเข้าสู่หน้าหลักของโหมดทีมนั้นทันที (ข้ามหน้า Landing Page อัตโนมัติ)
    - โหลดการตั้งค่า Endpoint เดียวกันกับทีม และดึงชุดข้อมูลล่าสุดจากฐานข้อมูลกลางทันที
- **Multi-Device Real-Time Data Synchronization (ข้อมูลเท่ากันทุกเครื่องแบบเรียลไทม์):**
  - **BroadcastChannel Engine (`twp_ems_sync_channel`):** เมื่อมีการสร้างคำขอ ตรวจรับ หรืออนุมัติในหน้าต่างใด ระบบจะกระจายสัญญาณ Broadcast ทันที ทำให้ทุกแท็บและทุกหน้าต่างอัปเดตตรงกันในระดับมิลลิวินาที
  - **Storage Event Synchronization Fallback:** สำรองการส่งสัญญาณผ่าน `localStorage` trigger เพื่อรองรับทุกเบราว์เซอร์
  - **Background Cloud Polling (Every 15s):** ตัวตรวจจับข้อมูลเบื้องหลังทำงานทุก 15 วินาทีขณะหน้าจอเปิดใช้งาน ตรวจจับ Data Signature หากพบการแก้ไขจากอุปกรณ์อื่นจะอัปเดตหน้าจอทันที
  - **Live Sync Status Indicator:** ป้ายแสดงสถานะการซิงค์บน Header (`🟢 ซิงค์: เรียลไทม์ / ตรงกันทุกเครื่อง`) พร้อมระบุเวลาซิงค์ล่าสุด และสามารถกดเพื่อ **บังคับซิงค์ทันที (Force Sync)**
  - **Sync Notification Toast:** ป้ายแจ้งเตือนลอย (`syncToastBox`) ปรากฏเมื่อมีข้อมูลอัปเดตจากเพื่อนร่วมทีม
  - **Quick Team QR Action Banners:** แถบแนะนำการสร้าง QR ประจำทีมที่ด้านบนของแท็บ ทีม A, ทีม B, และผู้บริหาร เพื่อให้หัวหน้าทีมสามารถแชร์ให้ลูกทีมสแกนเข้าร่วมได้ทันที

---

## [1.3.0] - 2026-10-29

### Added
- **Corporate Branding & Landing Page (หน้าแรก Training Center TWP):**
  - ออกแบบหน้า Landing Page สีน้ำเงินทางการ `#08539E` ตามสีของโลโก้บริษัท ไทยวัฒนาพานิช (TWP)
  - ติดตั้งโลโก้ทางการของ TWP พร้อมลวดลาย Watermark วงกลม 3 วงสอดประสานกัน
  - หัวข้อใหญ่ **"Training Center TWP"** พร้อมการ์ดสรุปจุดเด่น 4 ด้านของระบบ และปุ่ม CTA 3D กดเข้าสู่ระบบ
  - ปุ่มสลับกลับสู่หน้าแรก (Landing Page) ได้ตลอดเวลาจาก Header ของระบบ
- **Tactile UX/UI & Depth Press States (ความชัดลึกในการกดปุ่ม):**
  - ปรับปุ่มกดทั้งหมดเป็นแบบ 3D Tactile (`btn-tactile`) มีมิติความลึก กดแล้วยุบและมีแสงสะท้อนชัดเจน
  - แถบเมนูแท็บ (Navigation Tabs) แบบ 3D Elevated: แท็บที่เลือกจะนูนและเปลี่ยนเป็นสีน้ำเงิน `#08539E` พร้อมขอบเงาหยั่งลึก
- **Row & Card Focus Elevation (บรรทัดลอยนูนขึ้นมาเมื่อกำลังอ่าน):**
  - เมื่อนำเมาส์ชี้หรือคลิกอ่านแถวในตาราง Dashboard แถวนั้นจะลอยนูนขึ้นมา (`is-active-reading`) พร้อมเส้นสีน้ำเงินและป้าย `📖 กำลังอ่าน`
  - การ์ดในคิวงานของทีม B และผู้บริหารจะลอยนูนพร้อมเงา 3D และขอบสีน้ำเงินเมื่อคลิกโฟกัส

---

## [1.2.0] - 2026-10-29

### Added
- **Editable Combobox & Auto-Learning Dropdowns (พิมพ์ได้อิสระ พร้อมจำตัวเลือกให้อัตโนมัติ):**
  - **Free-Text & Combobox Support:** เปลี่ยนช่องประเภทกิจกรรม (`activityType`), หัวข้อหลักสูตร (`courseTopic`), วิทยากร (`speakerType`), สถานที่ (`venueType`), และวิทยากรทีม B (`teamBSpeaker`) ให้สามารถคลิกเลือกจากรายการ หรือพิมพ์ค่าใหม่ได้ทันที
  - **Dynamic Historical Auto-Options:** ระบบรวบรวมประวัติข้อมูลจากคำขอที่เคยบันทึกไว้ใน Google Sheets และนำมาเป็นตัวเลือก (Datalist Options) ให้อัตโนมัติสำหรับผู้ใช้งานคนอื่นและรอบถัดไป
  - **Instant Real-Time Caching:** เมื่อผู้ใช้พิมพ์ค่าใหม่และกดส่งคำขอ ตัวเลือกนั้นจะถูกเพิ่มเข้าไปใน Datalist ทันทีโดยไม่ต้องรีโหลดหน้าเว็บ
  - **Backend Aggregation API:** ใน `getInitialData`, Backend จะสรุปรายการตัวเลือกที่ไม่ซ้ำ (`autoOptions`) ส่งกลับมาให้หน้าบ้านใช้งานร่วมกันแบบรวมศูนย์

---

## [1.1.0] - 2026-10-29

### Added
- **Logistics & Facility Requirements (ห้องพัก และ รถรับ-ส่ง):**
  - **Hotel Accommodation Support:** Added fields `Need_Accommodation` and `Room_Count` to track hotel room requirements for trainers and staff.
  - **Transportation Support:** Added fields `Need_Transportation` and `Transport_Details` for shuttle van / airport pickup-dropoff coordination.
  - **Frontend Form Controls:** Dynamic toggle checkboxes with real-time badges in Team A request form.
  - **Review & Approval Badges:** Rendered logistics badges in Dashboard, Team B Review Queue, and Executive Approval Queue.
  - **A4 PDF Memo Integration:** Displays hotel room count and transportation details clearly in the official approval memo.
  - **Database Schema Auto-Upgrade:** In `backend/Code.js`, `ensureRequiredSheets` automatically detects and adds missing columns (`Need_Accommodation`, `Room_Count`, `Need_Transportation`, `Transport_Details`) to existing sheets.

---

## [1.0.0] - 2026-10-29

### Initial Production Release

#### Added
- **System Architecture & Controller (`backend/Code.js`):**
  - Unified Google Apps Script Web App router (`doGet`, `doPost`).
  - **Connection Ping & Health Monitor Endpoint:** Return latency, sheet connection status, and server time.
  - **Concurrency & Race Condition Guard:** Powered by `LockService.getScriptLock()` with a 15-second timeout buffer to prevent collision on multi-user writes.
  - **SLA & Pending Duration Engine:** Track timestamps (`Submitted_To_B_At`, `Reviewed_By_B_At`, `Sent_To_Exec_At`, `Approved_At`) and calculate elapsed working days/hours.
  - **Multi-Operator Stamping:** Audit fields tracking `Created_By`, `Reviewed_By`, `Approved_By`, and `Last_Modified_By`.
  - **A4 PDF Engine:** Built-in HTML-to-PDF memo generation with Sarabun font styling, auto-saved to Google Drive with shareable view URL.
  - **Zero-Trust Security Barrier:** `QR_Tokens` data isolation preventing exposure of sensitive PPC, sales target, and internal budget data to trainees.
  - **Admin Backoffice API:** Protected by password `admin0000` with capabilities to auto-initialize sheets, test latency, view system logs, and modify SLA/ROI thresholds.

- **Frontend User Experience (`frontend/index.html`):**
  - Modern Single-Page Application (SPA) built with Tailwind CSS, Phosphor/FontAwesome icons, and Google Fonts Sarabun.
  - **Live Ping & Status Bar:** Visual health badge showing real-time ping (ms) and connection state.
  - **Active Operator Selector:** Allows staff members in Team A, Team B, and Management to select their name (cached in `localStorage`).
  - **Cascading Filter Engine:** Dynamic Province $\rightarrow$ Sales $\rightarrow$ School selection using PPC Master.
  - **Real-Time Cost-to-Sales ROI Indicator:** Visual feedback (Optimal $\le 8\%$, Normal $8-15\%$, High $> 15\%$).
  - **Multi-Role Kanban/List Workflow:** Filter requests by status (`DRAFT`, `WAITING_B`, `WAITING_EXEC`, `APPROVED`, `COMPLETED`).
  - **Pending Duration Badges:** Display days and hours a ticket has been pending with SLA alert color codes.
  - **Admin Control Panel:** Secured with PIN `admin0000` for system diagnostics, sheet table re-initialization, and log inspection.
  - **Live / Demo Toggle:** Allows immediate visual preview in standard browser with mock data, seamlessly switchable to live GAS Web App URL.

- **Public Mobile-First Evaluation (`frontend/survey.html`):**
  - Responsive questionnaire designed specifically for iOS & Android smartphones.
  - Zero-Trust validation via Token URL parameter (`?t=...`).
  - 5-Star rating system across 5 quality dimensions with suggestion text area.
  - Anti-duplicate submission protection via client fingerprint / local cache hash.

- **Documentation & Data Assets:**
  - `data/PPC_Master_Sample.csv`: Sample database of provinces, sales reps, and schools.
  - `data/Database_Schema.md`: Full structural definition of all 6 Google Sheets tables.
  - `README.md`: Complete deployment, configuration, and architecture guide.
  - `MANUAL.md`: Step-by-step user manual for Sales, Academics, Management, and Admin.
