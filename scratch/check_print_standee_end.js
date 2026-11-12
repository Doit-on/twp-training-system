const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function downloadExcelAttendeeTemplate()');
console.log(html.substring(idx - 400, idx + 100));
