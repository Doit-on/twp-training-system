# Training Center TWP (EMS Enterprise Platform)

[![Version](https://img.shields.io/badge/version-1.9.0-blue.svg)](VERSION)
[![Runtime](https://img.shields.io/badge/runtime-Google%20Apps%20Script%20V8-green.svg)](https://developers.google.com/apps-script)
[![Database](https://img.shields.io/badge/database-Google%20Sheets-success.svg)](data/Database_Schema.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

> ระบบบริหารจัดการคำขอจัดกิจกรรมอบรม และประเมินผลความพึงพอใจแบบปิดลูป (Training Center TWP / EMS Enterprise) ขับเคลื่อนด้วยสถาปัตยกรรม Serverless บน Google Apps Script และ Google Sheets มาพร้อมหน้า Landing Page โลโก้ TWP ทางการ, Modernized Tactile UX/UI Design, ระบบสแกน **QR Code ประจำทีม**, ระบบ **Real-Time Multi-Device Data Sync**, **ระบบบันทึกเสนอขออนุมัติปฏิบัติงาน A4 อักษร TH Sarabun 12pt ตามมาตรฐานงานสารบรรณ**, **หน้าตรวจคำขอทีม B แสดงข้อมูลทีม A ครบถ้วนแบบอ่านอย่างเดียว**, **คิวงานผู้บริหารแสดงข้อมูล 2 ทีมควบคู่ (Dual Dossier)**, และ **รายงานสรุปผลการปฏิบัติงาน PPC (v1.9.0)**

---

## 🌟 จุดเด่นและฟีเจอร์สำคัญ (Key Features)

1. **หน้าตรวจสอบคำขอฝ่ายวิชาการ (ทีม B) แสดงข้อมูลทีม A ครบถ้วนแบบอ่านอย่างเดียว (v1.9.0):**
   - ดึงข้อมูลข้อเสนอทั้งหมดจากทีม A มาแสดงบนหน้าจอของทีม B อย่างครบถ้วนสมบูรณ์ (หัวข้อ, ประเภทกิจกรรม, โรงเรียน, จังหวัด, จำนวนผู้เข้าอบรม, เป้าหมายยอดขาย, งบขอ, ที่พัก, ยานพาหนะ, วัตถุประสงค์, ผู้ขอ)
   - ล็อกข้อมูลส่วนของทีม A ไว้ทั้งหมดเพื่อห้ามแก้ไข (`🔒 ข้อมูลเสนอขอจัดอบรมจากทีม A (อ่านอย่างเดียว - ห้ามแก้ไข)`)
   - ทีม B แก้ไขเฉพาะส่วนวิชาการ: ยืนยันวิทยากร, งบตัดจ่ายจริง, และบันทึกความเห็นทางวิชาการ
   - ปุ่มลัด **`[📄 ดูบันทึกขออนุมัติ A4]`** พรีวิวเอกสารบันทึกข้อความได้ทันที

2. **คิวงานผู้บริหาร (Executive Review) แสดงข้อมูลทีม A และ ทีม B เคียงคู่กัน (v1.9.0):**
   - แสดงข้อมูลข้อเสนอจากทีม A (ฝ่ายขาย) และข้อมูลการกลั่นกรองจากทีม B (ฝ่ายวิชาการ) ควบคู่กันแบบ Side-by-Side
   - แถบสรุปเปรียบเทียบทางการเงิน: งบที่ขอ vs งบตัดจ่ายจริง, ยอดประหยัดงบ, อัตราส่วนงบต่อเป้าขาย (ROI Cost-to-Sales %), และการสนับสนุนโลจิสติกส์
   - ปุ่มลัด **`[📄 ตรวจบันทึกขออนุมัติ A4]`** ให้ผู้บริหารเปิดตรวจทานเอกสารฉบับทางการก่อนลงนามอนุมัติ

3. **บันทึกเสนอขออนุมัติปฏิบัติงาน A4 ตัวอักษร TH Sarabun ขนาด 12pt (v1.9.0):**
   - ออกแบบเอกสารตามระเบียบงานสารบรรณ/บริษัทมาตรฐาน พิมพ์หัวกระดาษตราสัญลักษณ์ TWP และ **"บันทึกข้อความ"**
   - ฟอนต์มาตรฐาน **TH Sarabun New / Sarabun 12pt** สำหรับเนื้อหา (หัวข้อ 14pt-16pt หนา) พร้อมจัดกั้นหน้า-หลัง (ซ้าย 30 มม., ขวา 20 มม., บน 25 มม., ล่าง 25 มม. ย่อหน้า 2.5 ซม. ข้อความ Justified)
   - ครอบคลุม 4 โครงสร้าง: (๑) ความเป็นมาและวัตถุประสงค์, (๒) แผนวิชาการและโลจิสติกส์, (๓) งบประมาณและผลตอบแทน, (๔) ข้อพิจารณาและข้อเสนอ
   - บล็อกลงนาม 3 ฝ่าย (Three-Party Signatures): ทีม A ผู้ขอ, ทีม B ผู้กลั่นกรอง, ผู้บริหารผู้อนุมัติ
   - หน้าพรีวิวขนาด A4 สัดส่วนจริง แสดงผลครบถ้วนตั้งแต่ Header ถึง Footer และสั่งพิมพ์ได้ทันที

4. **ระบบจัดการสมาชิกและสิทธิ์ประจำทีม (Team Directory & Profile) (v1.8.0):**
   - ระบุข้อมูลสมาชิกครบ 4 มิติ: ชื่อ-นามสกุล, ส่วนงาน/ทีม, ตำแหน่งงาน, และบริษัทฯ
   - เมนูตั้งค่าในหน้า Settings หลังบ้าน (`admin0000`) เพิ่ม-ลบรายชื่อสมาชิกแต่ละทีมได้อย่างอิสระ
   - เมนูสลับโปรไฟล์ผู้ใช้งานบน Header เลือกชื่อและทีมเพื่อใช้แสตมป์ในระบบได้ทันที
   - ปุ่ม **ออกจากระบบ (Logout)** พร้อม Pop-up ยืนยันการซิงค์ข้อมูลเข้า Google Sheets สำเร็จ

5. **ปรับปรุงความเสถียรการเชื่อมต่อ Google Sheets & สถานะ Online-Offline (v1.8.0):**
   - ติดตั้ง Connection Resilience ป้องกันการหลุดเป็นออฟไลน์จากความล่าช้าชั่วคราว
   - แสดงผลสถานะชัดเจน: `🟢 ออนไลน์: ซิงค์ Google Sheets แล้ว (เวลา)` พร้อมตรวจวัด Ping แม่นยำ

3. **ระบบป้องกันข้อมูลชนกัน & ตัวนับเครื่องออนไลน์พร้อมกัน (v1.7.0):**
   - **กฎ "ใครเข้าใช้ก่อน ให้ทำงานให้เสร็จก่อน" (First-come, First-served):** ป้องกันข้อมูลทับซ้อนเมื่อมีผู้ใช้งานหลายเครื่องเปิดใบงานเดียวกัน พร้อม Pop-up แจ้งเตือนชื่อผู้ใช้คนแรกและเวลาที่เริ่มเข้าใช้
   - **Active Devices Presence Counter:** แสดงตัวเลขจำนวนเครื่องที่เชื่อมต่อใช้งานพร้อมกันแบบเรียลไทม์บน Header (เช่น `🟢 ใช้งานพร้อมกัน: 3 เครื่อง`)
   - **Executive Dashboard Fast-Track:** ปุ่มสำหรับผู้บริหารบนหน้า Landing Page กดเข้าดู Dashboard ได้ทันทีในคลิกเดียว

2. **ฟังก์ชัน Edit & Delete ทุกการ์ดสำหรับ Admin (v1.7.0):**
   - เมื่อปลดล็อกรหัสผู้ดูแลระบบ (`admin0000`) การ์ดทุกใบจะมีปุ่ม `[✏️ แก้ไข (Admin)]` และ `[🗑️ ลบ (Admin)]` ให้ผู้ดูแลจัดการแก้ไขทุกมิติของคำขอ หรือลบข้อมูลพร้อมบันทึก Audit Log

3. **Dashboard สรุปผลการดำเนินงาน & ประเมินความพึงพอใจรายหัวข้อ (v1.6.0):**
   - แสดง KPI สรุป **จำนวนผู้เข้าอบรมรวม (Total Trainees)** สะสมจากทุกโครงการ
   - ตารางและชาร์ตแจกแจง **การดำเนินงานและจำนวนผู้เข้าอบรมรายหัวข้อ (Topic Evaluation Breakdown)**
   - สรุป **คะแนนความพึงพอใจแยกตามหัวข้ออบรม (Topic Satisfaction Rating)** เทียบเกณฑ์ 5.00 คะแนน พร้อมแถบ Visual Progress Bar และระดับคุณภาพ (ดีเยี่ยม, ดีมาก, ปานกลาง)

2. **ระบบจัดการพนักงานขายจาก PPC และ Normalization อัจฉริยะ (v1.6.0):**
   - ดึงและจัดการรายชื่อผู้แทนขายมาตรฐานจาก PPC ครบทั้ง 13 ท่านในทุกภูมิภาค
   - เพิ่มเมนูจัดการรายชื่อพนักงานขายใน Settings หลังบ้าน (`admin0000`)
   - ระบบตรวจจับและแปลงตัวย่อ `ร.ร.` / `รร.` เป็น `โรงเรียน` อัตโนมัติ พร้อมตรวจการเว้นวรรค
   - พิมพ์ค้นหาและตรวจสอบฐานข้อมูล PPC แบบเรียลไทม์ หากไม่พบระบบจะเสนอให้เพิ่มเป็นโรงเรียนใหม่หรือพนักงานขายใหม่ได้ทันที

3. **Embedded Production Apps Script Endpoint (v1.5.1):**
   - ฝัง URL ของ Google Apps Script Web App ประจำองค์กรลงในระบบโดยตรง:
     `https://script.google.com/macros/s/AKfycby-D2AvgHXO_y4tVxg8wgkDP9ARBnRpiVp47-vnF7AiA1TA4AqwKGbelJTyI68tKfmx6g/exec`
   - เมื่อสร้าง QR Code หรือแชร์ลิงก์ประจำทีม (ทีม A, ทีม B, ผู้บริหาร, แดชบอร์ด) ค่า URL Endpoint นี้จะแนบติดไปในพารามิเตอร์ `&ep=` เสมอ ทำให้ผู้ร่วมงานที่สแกนด้วยโทรศัพท์มือถือเชื่อมต่อและซิงก์ข้อมูลกับ Google Sheet ได้ทันที ไม่ต้องกรอก URL เอง
   - แบบประเมินผู้เข้าอบรม (`survey.html`) ส่งข้อมูลตรงเข้า Google Apps Script นี้โดยอัตโนมัติ

2. **Closed-Loop Workflow เต็มวงจร:**
   - **ต้นน้ำ:** ทีมขาย (ทีม A) สร้างคำขอจัดกิจกรรม โดยผูกกับข้อมูลโรงเรียนและพนักงานขายจากฐาน `PPC_Master` อัตโนมัติ พร้อมคำนวณสัดส่วนงบประมาณเทียบเป้าขาย (Cost-to-Sales ROI %) แบบเรียลไทม์
   - **กลางน้ำ:** ฝ่ายวิชาการ (ทีม B) ตรวจสอบความพร้อมของวิทยากรและยืนยันงบประมาณตัดจ่ายจริง ส่งต่อให้ผู้บริหาร (Management) อนุมัติ
   - **ปลายน้ำ:** เมื่ออนุมัติ ระบบจะสร้างเอกสาร **A4 Memo PDF (ฟอนต์ Sarabun)** ลง Google Drive อัตโนมัติ พร้อมออก **QR Code Token** ให้ผู้เข้าอบรมสแกนประเมินผลความพึงพอใจ 5 มิติ
3. **PPC Standard A4 Operations Summary Report (PDF & Word .docx) (v1.5.0):**
   - ออกรายงานสรุปผลการปฏิบัติงานตามแบบมาตรฐาน **PPC (Performance & Project Control)** ครบ 5 ส่วน (ข้อมูลโรงเรียน, งานวิชาการ/ที่พัก/รถรับส่ง, สรุปงบและ ROI, ผลประเมินปิดลูป 5 ด้าน, ลายมือชื่อ 3 ฝ่าย)
   - สามารถส่งออกเป็น **PDF** (จัดหน้า Sarabun สวยงาม) และ **Microsoft Word (.docx)** นำไปแก้ไขต่อได้ทันที
3. **Google Sheets Database Setup & Custom Menu (v1.5.0):**
   - เมนูอัตโนมัติ `📊 PPC Training Center` บน Google Spreadsheet ช่วยสร้าง/ตรวจสอบ 7 ตารางฐานข้อมูล และสร้างชีตสรุปแดชบอร์ด (`PPC_Performance_Summary`) พร้อมสูตรคำนวณยอดรวมให้อัตโนมัติ
4. **Team QR Code Pairing & Auto-Onboarding:**
   - ผู้ใช้งานใหม่ในแต่ละทีมเพียงใช้สมาร์ตโฟนสแกน QR Code ประจำทีม จะเข้าสู่ระบบพร้อมโหมดการทำงานและข้อมูลชุดเดียวกันทันทีโดยไม่ต้องตั้งค่าใหม่
5. **Multi-Device Real-Time Data Sync (ข้อมูลเท่ากันทุกเครื่อง):**
   - รองรับ **BroadcastChannel Engine** สำหรับส่งต่อข้อมูลระหว่างแท็บ/หน้าต่างในระดับเสี้ยววินาที และ Background Cloud Polling ทุก 15 วินาที
6. **Ping & Latency Health Monitor:**
   - แถบแสดงสถานะการเชื่อมต่อแบบเรียลไทม์ พร้อมตรวจวัด Ping (ms) กับ Google Sheet เพื่อความมั่นใจก่อนบันทึกรายการ
7. **SLA & Pending Lead Time Tracking:**
   - ติดตามระยะเวลาตกค้างของคำขอเป็น **จำนวนวันและชั่วโมง** พร้อมแถบสีแจ้งเตือน (เขียว < 24 ชม., ส้ม 24-48 ชม., แดง > 48 ชม.)
8. **Multi-Operator Stamping & Audit Trail:**
   - แสตมป์ชื่อผู้ปฏิบัติงานในทุกขั้นตอน (`Created_By`, `Reviewed_By`, `Approved_By`, `Last_Modified_By`) พร้อมบันทึก `System_Logs`
9. **Zero-Trust Security & Data Isolation:**
   - หน้าทำแบบประเมินสำหรับบุคคลภายนอก (`SurveyView`) จะไม่มีการส่งข้อมูลยอดขาย งบประมาณ หรือข้อมูลโรงเรียนหลุดออกไปภายนอกเด็ดขาด
10. **Admin Backoffice Control (รหัสผ่าน: `admin0000`):**
    - แผงควบคุมระบบหลังบ้านสำหรับผู้ดูแลระบบ ตรวจสอบและจัดการโครงสร้างฐานข้อมูลทั้งหมด

---

## 📐 ผังการทำงานของระบบ (Architecture & Workflow)

```
┌────────────────────────────────────────────────────────┐
│                   Antigravity Client                   │
│   (HTML5 + Tailwind CSS + Responsive Mobile Layout)    │
└───────────────────────────┬────────────────────────────┘
                            │ Web App API (POST / GET)
┌───────────────────────────▼────────────────────────────┐
│         Google Apps Script (Backend Controller)         │
│  - LockService: ป้องกัน Race Condition หลายคนบันทึกพร้อมกัน │
│  - doGet(e) : View Dispatcher & Token Validation       │
│  - doPost(e): API Gateway (Action Router)              │
│  - PDF Engine: HTML-to-Blob (Sarabun A4 Format)        │
└───────────────────────────┬────────────────────────────┘
                            │ SpreadsheetApp Service
┌───────────────────────────▼────────────────────────────┐
│                 Google Sheets Database                 │
│  [PPC_Master] [Event_Requests] [QR_Tokens]             │
│  [Evaluation_Responses] [System_Logs] [System_Settings]│
└────────────────────────────────────────────────────────┘
```

---

## 📂 โครงสร้างไดเรกทอรีของโปรเจกต์ (Repository Structure)

```text
├── backend/
│   ├── Code.js                   # Backend Controller หลักสำหรับ Web App
│   ├── PPC_Setup_And_Reports.js  # ตัวสร้าง 7 ตารางฐานข้อมูล และออกรายงาน A4 (PDF & Word .docx)
│   └── appsscript.json           # ค่าคอนฟิก Manifest และขอบเขตสิทธิ์ (OAuth Scopes)
├── frontend/
│   ├── index.html                # SPA Portal หลัก (Dashboard, Team A/B, Exec, A4 Preview & Export)
│   ├── survey.html               # หน้าแบบประเมิน Mobile-First ป้องกันข้อมูลรั่วไหล (Zero-Trust)
│   └── mobile_preview.html       # Simulator จำลองการแสดงผลบนสมาร์ตโฟน
├── data/
│   ├── Database_Schema.md        # รายละเอียดฟิลด์และคอลัมน์ของชีตทั้ง 7 แผ่น
│   └── PPC_Master_Sample.csv     # ข้อมูลตัวอย่างสำหรับนำเข้า Sheet PPC_Master
├── CHANGELOG.md                  # บันทึกประวัติการปรับปรุงแต่ละเวอร์ชัน
├── MANUAL.md                     # คู่มือการใช้งานระบบสำหรับผู้ใช้ทุกระดับ
├── README.md                     # ภาพรวมระบบและการติดตั้ง
└── VERSION                       # หมายเลขเวอร์ชันปัจจุบัน (1.8.0)
```

---

## 🚀 ขั้นตอนการติดตั้งและเปิดใช้งาน (Deployment Guide)

### ขั้นตอนที่ 1: เตรียม Google Sheets
1. เข้าไปที่ [Google Sheets](https://sheets.new) และสร้าง Spreadsheet ใหม่ ตั้งชื่อว่า **`EMS_Enterprise_Database`**
2. ไปที่เมนู **ส่วนขยาย (Extensions)** $\rightarrow$ **Apps Script**

### ขั้นตอนที่ 2: ติดตั้งโค้ดลงใน Apps Script
1. คัดลอกโค้ดจากไฟล์ [`backend/Code.js`](backend/Code.js) ไปวางในไฟล์ `Code.gs`
2. สร้างไฟล์สคริปต์ใหม่ใน Apps Script ตั้งชื่อว่า `PPC_Setup_And_Reports.gs` แล้วคัดลอกโค้ดจาก [`backend/PPC_Setup_And_Reports.js`](backend/PPC_Setup_And_Reports.js) ไปวาง
3. คัดลอกเนื้อหาจากไฟล์ [`frontend/index.html`](frontend/index.html) ไปสร้างไฟล์ HTML ใหม่ใน Apps Script ตั้งชื่อว่า `Index.html`
4. คัดลอกเนื้อหาจากไฟล์ [`frontend/survey.html`](frontend/survey.html) ไปสร้างไฟล์ HTML ใหม่ใน Apps Script ตั้งชื่อว่า `SurveyView.html`
5. กดบันทึก (Save) โครงการ Apps Script

### ขั้นตอนที่ 3: สั่งสร้างหัวตารางอัตโนมัติ (Auto-Init Database)
1. ในหน้า Apps Script ให้เลือกฟังก์ชัน `handleAdminInitSheets` หรือรันผ่านเมนู Admin ภายในเว็บ
2. หรือนำเข้าข้อมูลตัวอย่างจากไฟล์ [`data/PPC_Master_Sample.csv`](data/PPC_Master_Sample.csv) เข้าสู่แผ่นงาน `PPC_Master`

### ขั้นตอนที่ 4: เผยแพร่ Web App (Deploy)
1. คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)** ที่มุมขวาบน $\rightarrow$ **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. เลือกประเภท: **เว็บแอป (Web app)**
3. ตั้งค่าการเข้าถึง:
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me)`
   - **ผู้ที่มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(จำเป็นเพื่อให้ผู้เข้าอบรมสแกน QR Code ประเมินได้โดยไม่ต้องล็อกอินบัญชี Google)*
4. คลิก **ทำให้ใช้งานได้ (Deploy)** และคัดลอก **URL เว็บแอป (Web App URL)** ที่ได้มา

### ขั้นตอนที่ 5: ใช้งาน Frontend
- **วิธีที่ 1 (Apps Script Hosted):** เปิดใช้งานผ่าน URL ของ Web App ที่ได้จากขั้นตอนที่ 4 ได้ทันที
- **วิธีที่ 2 (Antigravity / Local / Web Hosting):** เปิดไฟล์ [`frontend/index.html`](frontend/index.html) ในเบราว์เซอร์ $\rightarrow$ คลิกปุ่ม **Admin** มุมขวาบน $\rightarrow$ ใส่รหัสผ่าน `admin0000` $\rightarrow$ วาง Web App URL ที่ได้ลงในช่อง **Google Apps Script WebApp URL** แล้วกดบันทึก

---

## 🔐 ข้อมูลผู้ดูแลระบบ (Admin Credentials)

- **Default Admin PIN / Password:** `admin0000`
- สามารถปรับเปลี่ยนรหัสผ่านได้ผ่านทางชีต `System_Settings` หรือหน้า Admin Control Panel

---

## 📌 มาตรฐานการควบคุมเวอร์ชัน (Versioning Policy)

ระบบใช้มาตรฐาน **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
- **MAJOR:** การเปลี่ยนแปลงโครงสร้างหลักหรือฐานข้อมูลที่ไม่สามารถทำงานร่วมกับรุ่นเดิมได้
- **MINOR:** การเพิ่มฟีเจอร์ใหม่ เช่น รายงานรูปแบบใหม่ หรือการเชื่อมต่อระบบภายนอก
- **PATCH:** การแก้ไขบั๊ก ปรับปรุงประสิทธิภาพ หรือการปรับแต่ง UI/UX
ทุกการเปลี่ยนแปลงจะถูกบันทึกไว้ใน [`CHANGELOG.md`](CHANGELOG.md) อย่างเคร่งครัด
