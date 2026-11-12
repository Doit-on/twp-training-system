const fs = require('fs');
const reg = fs.readFileSync('register.html', 'utf8');

const idx = reg.indexOf('function showCheckinSuccessPass(att)');
console.log(reg.substring(idx, idx + 800));
