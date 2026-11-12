const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /register\.html[^\`\"\'\<\>\s]*/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const start = Math.max(0, m.index - 80);
  const end = Math.min(html.length, m.index + 120);
  console.log('--- FOUND AT ' + m.index + ' ---');
  console.log(html.substring(start, end));
}
