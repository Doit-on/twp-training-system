const fs = require('fs');
const survey = fs.readFileSync('survey.html', 'utf8');

const regex = /urlParams\.get\(['"][^'"]+['"]\)/g;
let m;
const params = [];
while ((m = regex.exec(survey)) !== null) {
  params.push(m[0]);
}
console.log('Params read in survey.html:', params);
