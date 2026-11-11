const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve('scratch', 'test_render.html');
const outPath = path.resolve('scratch', 'render.png');

console.log('Rendering file:', htmlPath);
const cmd = `"${chromePath}" --headless=new --no-sandbox --disable-gpu --window-size=1440,900 --screenshot="${outPath}" "${htmlPath}"`;
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Screenshot success! File size:', fs.statSync(outPath).size);
} catch (e) {
  console.error('Error rendering:', e.message);
}
