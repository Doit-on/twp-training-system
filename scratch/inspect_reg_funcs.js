const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

['renderRegistrationView', 'populateRegEventDropdown', 'onRegEventSelected', 'loadRegEventData'].forEach(fn => {
  const idx = html.indexOf('function ' + fn);
  console.log(`=== ${fn} (at ${idx}) ===`);
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 1000));
  }
});
