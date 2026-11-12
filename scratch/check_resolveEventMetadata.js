const fs = require('fs');
const html = fs.readFileSync('register.html', 'utf8');

const idx = html.indexOf('function resolveEventMetadata()');
console.log(html.substring(idx, idx + 1200));
