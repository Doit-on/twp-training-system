# Changelog

All notable changes to the **EMS Enterprise (Enterprise Training Workflow & Closed-Loop Evaluation System)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
