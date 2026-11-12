const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /function\s+([a-zA-Z0-9_]*Reg[a-zA-Z0-9_]*)/gi;
let m;
const list = [];
while ((m = regex.exec(html)) !== null) {
  list.push(m[0]);
}
console.log(list);
