# โครงสร้างฐานข้อมูล Google Sheets (Database Schema Specification)

ระบบ **EMS Enterprise** ขับเคลื่อนด้วย Google Sheets ทั้งหมด 6 ชีต (Sheets) ดังนี้:

---

### Sheet 1: `PPC_Master`
ข้อมูลตั้งต้น (Master Data) สำหรับทำ Dynamic Cascading Dropdown (จังหวัด $\rightarrow$ พนักงานขาย $\rightarrow$ โรงเรียน)

| Index | Column Name | Data Type | Sample Value | Description |
| :---: | :--- | :--- | :--- | :--- |
| A | `Zone_ID` | String | `BKK` | รหัสโซนพื้นที่ |
| B | `Province` | String | `กรุงเทพมหานคร` | จังหวัด |
| C | `Sale_ID` | String | `SL-101` | รหัสพนักงานขายจากระบบ PPC |
| D | `Sale_Name` | String | `สมชาย มุ่งมั่น` | ชื่อ-นามสกุลพนักงานขาย |
| E | `School_ID` | String | `SCH-1001` | รหัสโรงเรียน |
| F | `School_Name` | String | `โรงเรียนสวนกุหลาบวิทยาลัย` | ชื่อโรงเรียน |
| G | `Account_Tier` | String | `Tier A` | ลำดับความสำคัญของลูกค้า (Tier A/B/C) |

---

### Sheet 2: `Event_Requests`
ตารางธุรกรรมหลัก (Primary Transaction Table) บันทึกทุกคำขอ สถานะ และผู้ดำเนินการทุกขั้นตอน

| Index | Column Name | Data Type | Description |
| :---: | :--- | :--- | :--- |
| A | `Event_ID` | String (PK) | รหัสคำขอ เช่น `EVT-2026-0001` |
| B | `Created_At` | ISO 8601 | วันที่และเวลาสร้างคำขอ |
| C | `Status` | Enum | `DRAFT`, `WAITING_B`, `RETURNED_TO_A`, `WAITING_EXEC`, `APPROVED`, `REJECTED`, `COMPLETED` |
| D | `Activity_Type` | String | อบรมทั่วไป, Workshop, ติวนักเรียน, ฯลฯ |
| E | `Course_Topic` | String | หัวข้อหลักสูตร |
| F | `Custom_Topic` | String | หัวข้อเพิ่มเติมกรณีระบุอื่นๆ |
| G | `Event_Date` | Date (YYYY-MM-DD) | วันที่จัดกิจกรรม |
| H | `Province` | String | จังหวัดที่จัดกิจกรรม |
| I | `Sale_Name` | String | ชื่อพนักงานขายผู้รับผิดชอบงาน |
| J | `School_ID` | String | รหัสโรงเรียน |
| K | `School_Name` | String | ชื่อโรงเรียนลูกค้า |
| L | `Speaker_Type` | String | ประเภทวิทยากร (ที่ปรึกษา, ภายนอก, วิชาการ) |
| M | `Venue_Type` | String | โรงเรียน, โรงแรม, ออนไลน์, อื่นๆ |
| N | `Objective` | Text | วัตถุประสงค์เชิงกลยุทธ์ |
| O | `Target_Sales` | Number | เป้าหมายยอดขายคาดหวัง (บาท) |
| P | `Est_Budget` | Number | งบประมาณที่ขอโดยทีม A (บาท) |
| Q | `TeamB_Speaker` | String | ชื่อวิทยากรที่ทีม B ตรวจสอบ/ยืนยัน |
| R | `TeamB_Notes` | Text | ข้อเสนอแนะเชิงวิชาการจากทีม B |
| S | `Actual_Budget` | Number | งบประมาณจริงที่ทีม B สรุปตัดจ่าย (บาท) |
| T | `Created_By` | String | ชื่อพนักงานทีม A ผู้เปิดคำขอ |
| U | `Reviewed_By` | String | ชื่อพนักงานทีม B ผู้ตรวจสอบคำขอ |
| V | `Approved_By` | String | ชื่อผู้บริหารผู้อนุมัติ/ไม่อนุมัติ |
| W | `Last_Modified_By` | String | ชื่อผู้ดำเนินการล่าสุด |
| X | `Submitted_To_B_At` | ISO 8601 | เวลาที่ทีม A ส่งเรื่องให้ทีม B ตรวจ |
| Y | `Reviewed_By_B_At` | ISO 8601 | เวลาที่ทีม B ตรวจสอบเสร็จและส่งต่อ |
| Z | `Approved_At` | ISO 8601 | เวลาที่ผู้บริหารอนุมัติ |
| AA | `A4_PDF_Url` | URL String | ลิงก์ไฟล์ PDF สรุปคำขอใน Google Drive |

---

### Sheet 3: `QR_Tokens`
ตารางกักกันความปลอดภัย (Zero-Trust Token Quarantine) สำหรับแจกให้ผู้เข้าอบรมสแกนประเมิน โดยไม่เปิดเผยข้อมูลงบประมาณหรือยอดขาย

| Index | Column Name | Data Type | Description |
| :---: | :--- | :--- | :--- |
| A | `Token_ID` | String (PK) | รหัสโทเค็นสุ่มความยาว 16 หลัก |
| B | `Event_ID` | String (FK) | รหัส Event ที่ผูกไว้ (ซ่อนจากผู้ใช้ภายนอก) |
| C | `Course_Title` | String | ชื่อหัวข้ออบรม (ข้อมูลปลอดภัยที่แสดงได้) |
| D | `Speaker_Name` | String | ชื่อวิทยากร (ข้อมูลปลอดภัยที่แสดงได้) |
| E | `Event_Date` | Date (YYYY-MM-DD) | วันที่จัดกิจกรรม |
| F | `Expires_At` | ISO 8601 | เวลาหมดอายุ (ค่าเริ่มต้น +7 วันจากวันที่อนุมัติ) |
| G | `Status` | Enum | `ACTIVE`, `EXPIRED`, `CLOSED` |

---

### Sheet 4: `Evaluation_Responses`
ตารางบันทึกผลการประเมินความพึงพอใจ 5 มิติ

| Index | Column Name | Data Type | Description |
| :---: | :--- | :--- | :--- |
| A | `Response_ID` | String (PK) | รหัสคำตอบ เช่น `RES-1730000000000` |
| B | `Event_ID` | String (FK) | รหัส Event ที่แมปจาก Token ลับ |
| C | `Timestamp` | ISO 8601 | วันและเวลาที่กดส่งผลการประเมิน |
| D | `Score_Q1` | Integer (1-5) | ด้านเนื้อหาหลักสูตรและความเหมาะสม |
| E | `Score_Q2` | Integer (1-5) | ด้านความเชี่ยวชาญและเทคนิคการบรรยาย |
| F | `Score_Q3` | Integer (1-5) | ด้านการนำความรู้ไปประยุกต์ใช้จริง |
| G | `Score_Q4` | Integer (1-5) | ด้านเอกสาร สื่อ และอุปกรณ์การเรียนรู้ |
| H | `Score_Q5` | Integer (1-5) | ด้านสถานที่ การต้อนรับ และการประสานงาน |
| I | `Suggestions` | Text | ข้อเสนอแนะเพิ่มเติม |
| J | `Client_Hash` | String | Fingerprint / Client ID เพื่อป้องกันการส่งผลประเมินซ้ำ |

---

### Sheet 5: `System_Logs`
ตารางบันทึกประวัติการกระทำ (Audit Trail) ทุกขั้นตอน

| Index | Column Name | Data Type | Description |
| :---: | :--- | :--- | :--- |
| A | `Log_ID` | String (PK) | รหัสบันทึก เช่น `LOG-1730000000000` |
| B | `Event_ID` | String | รหัส Event ที่เกี่ยวข้อง |
| C | `Action` | String | เช่น `CREATE_REQUEST`, `TEAM_B_REVIEW`, `EXEC_APPROVE` |
| D | `Action_By` | String | ชื่อผู้ปฏิบัติงานที่แสตมป์ไว้ |
| E | `Timestamp` | ISO 8601 | วันเวลาที่เกิดการกระทำ |
| F | `Details` | Text | ข้อมูลการเปลี่ยนแปลงในรูปแบบ JSON String |

---

### Sheet 6: `System_Settings`
ตารางการตั้งค่าระบบที่ควบคุมโดยผู้ดูแลระบบ (Admin)

| Index | Column Name | Data Type | Default Value | Description |
| :---: | :--- | :--- | :--- | :--- |
| A | `Setting_Key` | String (PK) | `ADMIN_PASS` | คีย์ของการตั้งค่า |
| B | `Setting_Value` | String | `admin0000` | ค่าของการตั้งค่า |
| C | `Description` | String | รหัสผ่านผู้ดูแลระบบ | คำอธิบาย |
| D | `Updated_At` | ISO 8601 | วันเวลาอัปเดตล่าสุด | วันเวลา |
