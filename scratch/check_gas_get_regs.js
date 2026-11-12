const fs = require('fs');
const code = fs.readFileSync('backend_code.gs', 'utf8');

const idx = code.indexOf('function handleGetEventRegistrations');
console.log(code.substring(idx, idx + 1400));
