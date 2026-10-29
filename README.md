# EMS Enterprise: Training Workflow & Closed-Loop Evaluation System

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](VERSION)
[![Runtime](https://img.shields.io/badge/runtime-Google%20Apps%20Script%20V8-green.svg)](https://developers.google.com/apps-script)
[![Database](https://img.shields.io/badge/database-Google%20Sheets-success.svg)](data/Database_Schema.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

> ระบบบริหารจัดการคำขอจัดกิจกรรมอบรม และประเมินผลความพึงพอใจแบบปิดลูป (Closed-Loop Evaluation) ขับเคลื่อนด้วยสถาปัตยกรรม Serverless บน Google Apps Script และ Google Sheets ผสานหน้าบ้าน Single-Page Application (SPA) พร้อมระบบป้องกันความปลอดภัย Zero-Trust Data Isolation

---

## 🌟 จุดเด่นและฟีเจอร์สำคัญ (Key Features)

1. **Closed-Loop Workflow เต็มวงจร:**
   - **ต้นน้ำ:** ทีมขาย (ทีม A) สร้างคำขอจัดกิจกรรม โดยผูกกับข้อมูลโรงเรียนและพนักงานขายจากฐาน `PPC_Master` อัตโนมัติ พร้อมคำนวณสัดส่วนงบประมาณเทียบเป้าขาย (Cost-to-Sales ROI %) แบบเรียลไทม์
   - **กลางน้ำ:** ฝ่ายวิชาการ (ทีม B) ตรวจสอบความพร้อมของวิทยากรและยืนยันงบประมาณตัดจ่ายจริง ส่งต่อให้ผู้บริหาร (Management) อนุมัติ
   - **ปลายน้ำ:** เมื่ออนุมัติ ระบบจะสร้างเอกสาร **A4 Memo PDF (ฟอนต์ Sarabun)** ลง Google Drive อัตโนมัติ พร้อมออก **QR Code Token** ให้ผู้เข้าอบรมสแกนประเมินผลความพึงพอใจ 5 มิติ
2. **Ping & Latency Health Monitor:**
   - แถบแสดงสถานะการเชื่อมต่อแบบเรียลไทม์ พร้อมตรวจวัด Ping (ms) กับ Google Sheet เพื่อความมั่นใจก่อนบันทึกรายการ
3. **SLA & Pending Lead Time Tracking:**
   - ติดตามระยะเวลาตกค้างของคำขอเป็น **จำนวนวันและชั่วโมง** พร้อมแถบสีแจ้งเตือน (เขียว < 24 ชม., ส้ม 24-48 ชม., แดง > 48 ชม.) เพื่อการวัด KPI อย่างโปร่งใส
4. **Multi-Operator Stamping & Audit Trail:**
   - แสตมป์ชื่อผู้ปฏิบัติงานในทุกขั้นตอน (`Created_By`, `Reviewed_By`, `Approved_By`, `Last_Modified_By`) รองรับทีมที่มีสมาชิกมากกว่า 1 คน
   - บันทึกประวัติกิจกรรมแบบละเอียดลงในชีต `System_Logs`
5. **Zero-Trust Security & Data Isolation:**
   - หน้าทำแบบประเมินสำหรับบุคคลภายนอก (`SurveyView`) จะเข้าถึงได้เฉพาะหัวข้ออบรม, ชื่อวิทยากร และวันที่จัดงาน โดย**ไม่มีการส่งข้อมูลยอดขาย งบประมาณ หรือข้อมูลโรงเรียนหลุดออกไปภายนอกเด็ดขาด**
   - มีระบบตรวจจับและป้องกันการส่งผลประเมินซ้ำด้วย Client Fingerprint Hash
6. **Admin Backoffice Control (รหัสผ่าน: `admin0000`):**
   - แผงควบคุมระบบหลังบ้านสำหรับผู้ดูแลระบบ: ตรวจสอบและสร้างโครงสร้าง Sheet 6 ตารางอัตโนมัติ (Auto-Schema Initializer), ตรวจสอบ Latency, และเรียกดู Audit Trail

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
│   ├── Code.js              # Backend Controller หลักสำหรับวางใน Google Apps Script
│   └── appsscript.json      # ค่าคอนฟิก Manifest และขอบเขตสิทธิ์ (OAuth Scopes)
├── frontend/
│   ├── index.html           # SPA Portal หลัก (Dashboard, Team A, Team B, Exec, Evaluation, Admin)
│   └── survey.html          # หน้าแบบประเมิน Mobile-First ป้องกันข้อมูลรั่วไหล (Zero-Trust)
├── data/
│   ├── Database_Schema.md   # รายละเอียดฟิลด์และคอลัมน์ของชีตทั้ง 6 แผ่น
│   └── PPC_Master_Sample.csv # ข้อมูลตัวอย่างสำหรับนำเข้า Sheet PPC_Master
├── CHANGELOG.md             # บันทึกประวัติการปรับปรุงแต่ละเวอร์ชัน
├── MANUAL.md                # คู่มือการใช้งานระบบสำหรับผู้ใช้ทุกระดับ
├── README.md                # ภาพรวมระบบและการติดตั้ง
└── VERSION                  # หมายเลขเวอร์ชันปัจจุบัน (1.0.0)
```

---

## 🚀 ขั้นตอนการติดตั้งและเปิดใช้งาน (Deployment Guide)

### ขั้นตอนที่ 1: เตรียม Google Sheets
1. เข้าไปที่ [Google Sheets](https://sheets.new) และสร้าง Spreadsheet ใหม่ ตั้งชื่อว่า **`EMS_Enterprise_Database`**
2. ไปที่เมนู **ส่วนขยาย (Extensions)** $\rightarrow$ **Apps Script**

### ขั้นตอนที่ 2: ติดตั้งโค้ดลงใน Apps Script
1. คัดลอกโค้ดจากไฟล์ [`backend/Code.js`](backend/Code.js) ไปวางแทนที่ในไฟล์ `Code.gs` บน Apps Script
2. คัดลอกเนื้อหาจากไฟล์ [`frontend/index.html`](frontend/index.html) ไปสร้างไฟล์ HTML ใหม่ใน Apps Script ตั้งชื่อว่า `Index.html`
3. คัดลอกเนื้อหาจากไฟล์ [`frontend/survey.html`](frontend/survey.html) ไปสร้างไฟล์ HTML ใหม่ใน Apps Script ตั้งชื่อว่า `SurveyView.html`
4. กดบันทึก (Save)

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
