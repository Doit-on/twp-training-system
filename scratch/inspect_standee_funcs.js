const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function showFunc(fnName) {
  const idx = html.indexOf('function ' + fnName);
  if (idx !== -1) {
    console.log(`=== ${fnName} ===`);
    console.log(html.substring(idx, idx + 1200));
  } else {
    console.log(`=== ${fnName} NOT FOUND ===`);
  }
}

showFunc('printOnsiteQrStandeeFromLanding');
showFunc('generateOnsiteQrStandee');
showFunc('printOnsiteQrStandee');
