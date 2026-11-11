const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const surveyHtmlPath = path.resolve('survey.html');
const screenshotPath = path.join(__dirname, 'survey_rendered.png');
const dumpDomPath = path.join(__dirname, 'survey_dom.html');

console.log('Rendering survey from:', surveyHtmlPath);
const targetUrl = 'file://' + surveyHtmlPath.replace(/\\/g, '/') + '?t=EVT-20261111-7914';

try {
  const domOutput = execFileSync(chromePath, [
    '--headless',
    '--disable-gpu',
    '--virtual-time-budget=2000',
    '--dump-dom',
    targetUrl
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

  fs.writeFileSync(dumpDomPath, domOutput, 'utf8');
  console.log('DOM dumped, size:', domOutput.length);

  const qMatches = domOutput.match(/data-rating-group="q\d+"/g);
  console.log('Found question rating groups in rendered DOM:', qMatches ? qMatches.length : 0);
  if (qMatches) {
    console.log('Matches:', qMatches);
  }

  execFileSync(chromePath, [
    '--headless',
    '--disable-gpu',
    '--window-size=420,2500',
    '--virtual-time-budget=2000',
    `--screenshot=${screenshotPath}`,
    targetUrl
  ]);
  console.log('Screenshot saved, size:', fs.statSync(screenshotPath).size);
} catch (e) {
  console.error('Error:', e.message);
}
