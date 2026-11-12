const fs = require('fs');
const reg = fs.readFileSync('register.html', 'utf8');

const regex = /btnGoToSurvey\.href\s*=[^;]+;/g;
let m;
while ((m = regex.exec(reg)) !== null) {
  console.log(m[0]);
}
