const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function filterAttendeeTable()');
console.log(html.substring(idx, idx + 800));
