const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log(html.substring(1035500, 1037500));
