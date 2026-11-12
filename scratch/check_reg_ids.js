const fs = require('fs');
const html = fs.readFileSync('register.html', 'utf8');

const regex = /id=[\"']([a-zA-Z0-9_\-]+)[\"']/g;
let m;
const ids = [];
while ((m = regex.exec(html)) !== null) {
  ids.push(m[1]);
}
console.log('IDs in register.html:', ids);
