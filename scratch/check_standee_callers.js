const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

[1031901, 1032997].forEach(pos => {
  console.log('=== AT ' + pos + ' ===');
  console.log(html.substring(Math.max(0, pos - 200), Math.min(html.length, pos + 400)));
});
