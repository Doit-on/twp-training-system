const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve('scratch', 'test_render.html');

// We can run chrome with --dump-dom or evaluate with a script
const testEvalScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      enterPortal();
      switchTab('teamB');
      setTimeout(() => {
        const sidebar = document.getElementById('appSidebar')?.getBoundingClientRect();
        const mainWrapper = document.getElementById('appMainWrapper')?.getBoundingClientRect();
        const header = document.querySelector('header')?.getBoundingClientRect();
        const teamB = document.getElementById('view-teamB')?.getBoundingClientRect();
        console.log('LAYOUT_METRICS:' + JSON.stringify({
          windowWidth: window.innerWidth,
          sidebar: sidebar,
          mainWrapper: mainWrapper,
          header: header,
          teamB: teamB
        }));
      }, 500);
    }, 300);
  });
`;

const originalHtml = fs.readFileSync('index.html', 'utf8');
const injectedHtml = originalHtml.replace('</body>', `<script>${testEvalScript}</script></body>`);
fs.writeFileSync(htmlPath, injectedHtml, 'utf8');

const cmd = `"${chromePath}" --headless=new --no-sandbox --disable-gpu --window-size=1440,900 "${htmlPath}" --enable-logging=stderr --v=1`;
try {
  const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('Output:', output);
} catch (e) {
  const allOutput = (e.stdout || '') + '\n' + (e.stderr || '');
  const metricsMatch = allOutput.match(/LAYOUT_METRICS:(\{.*\})/);
  if (metricsMatch) {
    console.log('Found metrics:', metricsMatch[1]);
  } else {
    console.log('No metrics found. Stderr snippet:', allOutput.substring(0, 500));
  }
}
