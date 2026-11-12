const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

// 1. Version Bump in index.html: 1.19.0 -> 1.19.1
console.log('Bumping versions in index.html...');
index = index.replace(/v1\.19\.0/g, 'v1.19.1');
index = index.replace(/Version: 1\.19\.0/g, 'Version: 1.19.1');
index = index.replace(/Version 1\.19\.0/g, 'Version 1.19.1');
index = index.replace(/SYSTEM_VERSION = '1\.19\.0'/g, "SYSTEM_VERSION = '1.19.1'");
index = index.replace(/'1\.19\.0'/g, "'1.19.1'");

// 2. Shorten QR URL in generateOnsiteQrStandee and printOnsiteQrStandee
console.log('Shortening QR Code URLs in index.html...');
index = index.replace(/const registerUrl = `\${hostOrigin}register\.html\?event=\${encodeURIComponent\(eventId\)}[^`]*`;/g,
  'const registerUrl = `${hostOrigin}register.html?event=${encodeURIComponent(eventId)}`;');

// Adjust QR correct level in printOnsiteQrStandee from H to M for cleaner, larger blocks
index = index.replace(/correctLevel: QRCode\.CorrectLevel\.H/g, 'correctLevel: QRCode.CorrectLevel.M');

// 3. Update handleAttendeeExcelImport with Smart/Fuzzy Column Matching
console.log('Updating handleAttendeeExcelImport with Fuzzy Column Matching...');

const lines = index.split(/\r?\n/);
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function handleAttendeeExcelImport(event) {')) {
    startLine = i;
  }
  if (startLine !== -1 && i > startLine && lines[i].includes('function updateRegKpis() {')) {
    endLine = i - 1;
    break;
  }
}

console.log('startLine:', startLine + 1, 'endLine:', endLine + 1);

if (startLine === -1 || endLine === -1) {
  console.error('Could not find line bounds for handleAttendeeExcelImport');
  process.exit(1);
}

const newImportCode = `    function extractAttendeeFromRow(row) {
      let nameTh = '';
      let nameEn = '';
      let school = '';
      let email = '';
      let phone = '';

      const entries = Object.entries(row).map(([k, v]) => ({
        key: String(k || '').trim().replace(/[\\r\\n\\t]+/g, ' '),
        val: v !== null && v !== undefined ? String(v).trim() : ''
      })).filter(e => e.val !== '');

      for (const { key, val } of entries) {
        const kLow = key.toLowerCase();

        // 1. Thai Name
        if (!nameTh) {
          if (
            (kLow.includes('ชื่อ') && (kLow.includes('สกุล') || kLow.includes('-') || kLow.includes('—'))) ||
            kLow === 'name_th' || kLow === 'nameth' || kLow === 'ชื่อ' || kLow === 'ชื่อผู้เข้าอบรม' || kLow === 'ชื่อผู้รับการอบรม'
          ) {
            if (!kLow.includes('en') && !kLow.includes('surename') && !kLow.includes('surname') && !kLow.includes('อังกฤษ') && !kLow.includes('certificate')) {
              nameTh = val;
              continue;
            }
          }
        }

        // 2. English Name
        if (!nameEn) {
          if (
            kLow.includes('surename') || kLow.includes('surname') || kLow.includes('certificate') ||
            kLow.includes('name_en') || kLow.includes('nameen') || kLow.includes('english') ||
            kLow.includes('full name') || kLow.includes('name-surename') || kLow.includes('name—surename')
          ) {
            nameEn = val;
            continue;
          }
        }

        // 3. School / Organization
        if (!school) {
          if (
            kLow.includes('โรงเรียน') || kLow.includes('สถานศึกษา') || kLow.includes('หน่วยงาน') ||
            kLow.includes('school') || kLow.includes('organization') || kLow.includes('institution') || kLow.includes('สังกัด')
          ) {
            school = val;
            continue;
          }
        }

        // 4. Email
        if (!email) {
          if (
            kLow.includes('email') || kLow.includes('อีเมล') || kLow.includes('เมล') || kLow.includes('e-mail') ||
            val.includes('@')
          ) {
            email = val;
            continue;
          }
        }

        // 5. Phone / Contact
        if (!phone) {
          if (
            kLow.includes('เบอร์โทร') || kLow.includes('โทรศัพท์') || kLow.includes('เบอร์ติดต่อ') ||
            kLow.includes('phone') || kLow.includes('tel') || kLow.includes('mobile') || kLow.includes('line')
          ) {
            phone = val;
            continue;
          }
        }
      }

      // Fallback direct check
      if (!nameTh) {
        nameTh = row['Name_TH'] || row['ชื่อ - นามสกุล'] || row['ชื่อ-นามสกุล'] || row['ชื่อ-สกุล'] || row['ชื่อ'] || '';
      }
      if (!nameEn) {
        nameEn = row['Name_EN'] || row['Full Name'] || row['English Name'] || '';
      }
      if (!school) {
        school = row['School_Name'] || row['โรงเรียน'] || row['โรงเรียนที่ปฏิบัติงาน'] || row['สถานศึกษา'] || row['School'] || '';
      }
      if (!email) {
        email = row['Email'] || row['อีเมล'] || row['Email address'] || '';
      }
      if (!phone) {
        phone = row['Phone'] || row['เบอร์โทร'] || row['เบอร์โทรศัพท์'] || '';
      }

      return {
        nameTh: String(nameTh).trim(),
        nameEn: String(nameEn).trim(),
        school: String(school).trim(),
        email: String(email).trim(),
        phone: String(phone).trim()
      };
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
            const extracted = extractAttendeeFromRow(r);

            return {
              regId: 'REG-' + Date.now().toString().slice(-6) + '-' + (idx + 1),
              eventId: eventId,
              nameTh: extracted.nameTh,
              nameEn: extracted.nameEn,
              school: extracted.school,
              email: extracted.email,
              phone: extracted.phone,
              checkinStatus: 'PENDING',
              checkinTime: '',
              regType: 'PRE'
            };
          }).filter(a => a.nameTh);

          if (parsedAttendees.length === 0) {
            showAlert('ไม่พบแถวที่มีชื่อ-นามสกุลในไฟล์ กรุณาตรวจสอบว่ามีคอลัมน์ชื่อ-นามสกุล', 'warning');
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
        } finally {
          event.target.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    }`;

lines.splice(startLine, (endLine - startLine + 1), newImportCode);

fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
console.log('index.html successfully updated to v1.19.1 with fuzzy match import and shortened QR!');
