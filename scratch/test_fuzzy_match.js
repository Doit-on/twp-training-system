// Node script to test extractAttendeeFromRow
function extractAttendeeFromRow(row) {
  let nameTh = '';
  let nameEn = '';
  let school = '';
  let email = '';
  let phone = '';

  const entries = Object.entries(row).map(([k, v]) => ({
    key: String(k || '').trim().replace(/[\r\n\t]+/g, ' '),
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

  // Fallback direct key checking
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

// Test with exact keys from the user's Excel file
const testRow = {
  'ลำดับ': 1,
  'ชื่อ - นามสกุล': 'นางสาวศศิวิมล เกิดหมื่นไวย',
  'Name—Surename \n(กรุณาระบุคำนำหน้าเพื่อจัดทำใบ Certificate)': 'Miss Sasiwimon Kerdmuenwai',
  'โรงเรียนที่ปฏิบัติงาน': 'โคราชพิทยาคม',
  'จังหวัด': 'นครราชสีมา',
  'Email address ที่สามารถติดต่อท่านได้': 'sasiwimon@korat.ac.th',
  'เบอร์โทรศัพท์ที่ติดต่อท่านได้ หรือ Line ID': '0812345678',
  'วิทยฐานะปัจจุบันของคุณครู': 'ครูชำนาญการพิเศษ'
};

const result = extractAttendeeFromRow(testRow);
console.log('Result:', JSON.stringify(result, null, 2));

if (result.nameTh === 'นางสาวศศิวิมล เกิดหมื่นไวย' &&
    result.nameEn === 'Miss Sasiwimon Kerdmuenwai' &&
    result.school === 'โคราชพิทยาคม' &&
    result.email === 'sasiwimon@korat.ac.th' &&
    result.phone === '0812345678') {
  console.log('TEST PASSED! 100% Match!');
} else {
  console.error('TEST FAILED!');
  process.exit(1);
}
