const fs = require('fs');
const reg = fs.readFileSync('register.html', 'utf8');

const regex = /checkinSuccessCard/g;
let m;
while ((m = regex.exec(reg)) !== null) {
  console.log(`Match at ${m.index}: ${reg.substring(Math.max(0, m.index - 50), Math.min(reg.length, m.index + 250))}`);
}
