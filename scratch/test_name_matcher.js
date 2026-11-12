// Test Name Matcher
const prefixesRegex = /^(นาย|นางสาว|นาง|คุณ|น\.ส\.|น\.ส|นส\.|นส|ดร\.|ดร|ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|ผศ\.|รศ\.|ศ\.|อาจารย์|อ\.|ว่าที่ร้อยตรี|ว่าที่ ร\.ต\.|ว่าที่ ร\.ต|mr\.|mr|mrs\.|mrs|ms\.|ms|miss|dr\.|dr|prof\.|prof|khun)\s*/i;

function cleanSearchTerm(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(prefixesRegex, '') // remove prefix
    .trim();
}

function matchAttendeeSearch(att, query) {
  if (!query) return true;
  const rawQ = String(query).trim().toLowerCase();
  const cleanQ = cleanSearchTerm(rawQ);
  const rawQNoSpace = rawQ.replace(/\s+/g, '');
  const cleanQNoSpace = cleanQ.replace(/\s+/g, '');

  const fields = [
    att.nameTh || '',
    att.nameEn || '',
    att.school || att.schoolName || '',
    att.email || ''
  ];

  for (const f of fields) {
    if (!f) continue;
    const rawF = String(f).trim().toLowerCase();
    const cleanF = cleanSearchTerm(rawF);
    const rawFNoSpace = rawF.replace(/\s+/g, '');
    const cleanFNoSpace = cleanF.replace(/\s+/g, '');

    // 1. Direct includes
    if (rawF.includes(rawQ)) return true;
    // 2. Direct includes without spaces
    if (rawQNoSpace && rawFNoSpace.includes(rawQNoSpace)) return true;
    // 3. Clean includes (prefix stripped)
    if (cleanQ && cleanF.includes(cleanQ)) return true;
    if (cleanQNoSpace && cleanFNoSpace.includes(cleanQNoSpace)) return true;
    // 4. Reverse clean (in case DB has prefix but search didn't, or vice-versa)
    if (cleanQ && rawF.includes(cleanQ)) return true;
    if (cleanQNoSpace && rawFNoSpace.includes(cleanQNoSpace)) return true;
  }

  // Phone match
  const phone = (att.phone || '').replace(/[^0-9]/g, '');
  const qDigits = rawQ.replace(/[^0-9]/g, '');
  if (qDigits && phone && (phone.includes(qDigits) || phone.endsWith(qDigits))) {
    return true;
  }

  return false;
}

// Test cases
const testAttendees = [
  { nameTh: 'นายสมชาย ใจดี', nameEn: 'Mr. Somchai Jaidee', school: 'โรงเรียนเบญจมราชรังสฤษฎิ์', phone: '0812345678' },
  { nameTh: 'สมหญิง รักเรียน', nameEn: 'Somying Rakrian', school: 'โรงเรียนเบญจมราชรังสฤษฎิ์', phone: '0898765432' },
  { nameTh: 'นางสาวกานดา สุขใจ', nameEn: 'Miss Kanda Sukjai', school: 'โรงเรียนเบญจมราชรังสฤษฎิ์', phone: '0855555555' },
  { nameTh: 'ดร.ประสาน ปัญญาเลิศ', nameEn: 'Dr. Prasan Panyalert', school: 'สพม.', phone: '0822222222' }
];

const queries = [
  // Searching attendee 1 (นายสมชาย):
  { q: 'สมชาย', expect: 'นายสมชาย ใจดี' },
  { q: 'นายสมชาย', expect: 'นายสมชาย ใจดี' },
  { q: 'นาย สมชาย', expect: 'นายสมชาย ใจดี' },
  { q: 'คุณสมชาย', expect: 'นายสมชาย ใจดี' },
  { q: 'mr. somchai', expect: 'นายสมชาย ใจดี' },
  { q: 'Somchai', expect: 'นายสมชาย ใจดี' },

  // Searching attendee 2 (สมหญิง - without prefix in DB):
  { q: 'สมหญิง', expect: 'สมหญิง รักเรียน' },
  { q: 'นางสมหญิง', expect: 'สมหญิง รักเรียน' },
  { q: 'นางสาวสมหญิง', expect: 'สมหญิง รักเรียน' },
  { q: 'คุณสมหญิง', expect: 'สมหญิง รักเรียน' },
  { q: 'Miss Somying', expect: 'สมหญิง รักเรียน' },

  // Searching attendee 3 (นางสาวกานดา):
  { q: 'กานดา', expect: 'นางสาวกานดา สุขใจ' },
  { q: 'น.ส. กานดา', expect: 'นางสาวกานดา สุขใจ' },
  { q: 'น.ส.กานดา', expect: 'นางสาวกานดา สุขใจ' },
  { q: 'นางกานดา', expect: 'นางสาวกานดา สุขใจ' },
  { q: 'คุณกานดา', expect: 'นางสาวกานดา สุขใจ' },
  { q: 'Ms. Kanda', expect: 'นางสาวกานดา สุขใจ' },

  // Searching attendee 4 (ดร.ประสาน):
  { q: 'ประสาน', expect: 'ดร.ประสาน ปัญญาเลิศ' },
  { q: 'ดร.ประสาน', expect: 'ดร.ประสาน ปัญญาเลิศ' },
  { q: 'อาจารย์ประสาน', expect: 'ดร.ประสาน ปัญญาเลิศ' },
  { q: 'คุณประสาน', expect: 'ดร.ประสาน ปัญญาเลิศ' }
];

console.log('Running search test cases:');
let passed = 0;
queries.forEach(({ q, expect }) => {
  const matched = testAttendees.filter(att => matchAttendeeSearch(att, q));
  const hasExpected = matched.some(m => m.nameTh === expect);
  if (hasExpected) {
    console.log(`[PASS] query: "${q}" -> matched "${expect}"`);
    passed++;
  } else {
    console.error(`[FAIL] query: "${q}" -> expected "${expect}", got:`, matched.map(m => m.nameTh));
  }
});

console.log(`\nResult: ${passed}/${queries.length} passed.`);
if (passed === queries.length) console.log('ALL SEARCH PREFIX TESTS PASSED PERFECTLY!');
