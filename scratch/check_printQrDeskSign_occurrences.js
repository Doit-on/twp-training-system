const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /printQrDeskSign/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('--- AT ' + m.index + ' ---');
  console.log(html.substring(Math.max(0, m.index - 200), Math.min(html.length, m.index + 300)));
}
