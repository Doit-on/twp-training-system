const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a small test HTML that enters the portal and switches to teamB
const originalHtml = fs.readFileSync('index.html', 'utf8');

// Inject an auto-enter script right before </body>
const injectedHtml = originalHtml.replace(
  '</body>',
  `<script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        enterPortal();
        switchTab('teamB');
      }, 500);
    });
  </script>
  </body>`
);

const testHtmlPath = path.join(__dirname, 'test_render.html');
fs.writeFileSync(testHtmlPath, injectedHtml, 'utf8');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotPath = path.join(__dirname, 'portal_teamB_rendered.png');

try {
  execSync(`"${chromePath}" --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=3000 --screenshot="${screenshotPath}" "file://${testHtmlPath.replace(/\\/g, '/')}"`);
  console.log('Screenshot saved to:', screenshotPath);
  const stats = fs.statSync(screenshotPath);
  console.log('Screenshot size:', stats.size, 'bytes');
} catch (e) {
  console.error('Error rendering:', e.message);
}
