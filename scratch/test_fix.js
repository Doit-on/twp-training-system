const fs = require('fs');

let surveyHtml = fs.readFileSync('survey.html', 'utf8');

// Replace the problematic btoa line
surveyHtml = surveyHtml.replace(
  /const EXECUTIVE_SIGNATURE_SVG = 'data:image\/svg\+xml;base64,' \+ btoa\(([\s\S]*?)\);/,
  "const EXECUTIVE_SIGNATURE_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent($1);"
);

// Extract main script
const scripts = [];
const regex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let m;
while ((m = regex.exec(surveyHtml)) !== null) {
  if (m[1].trim()) scripts.push(m[1]);
}

const mockElements = {};
const getMockEl = (id) => {
  if (!mockElements[id]) {
    mockElements[id] = {
      id,
      innerText: '',
      innerHTML: '',
      value: '',
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    };
  }
  return mockElements[id];
};

const document = {
  getElementById: (id) => getMockEl(id),
  querySelector: () => null,
  querySelectorAll: () => []
};

const window = {
  location: { search: '?t=EVT-20261111-7914' },
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') cb();
  }
};

const localStorage = {
  getItem: () => null,
  setItem: () => {}
};

const QRCode = function() {};
QRCode.CorrectLevel = { M: 0 };
const fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });

const mainScript = scripts[scripts.length - 1];
try {
  const fn = new Function('document', 'window', 'localStorage', 'QRCode', 'fetch', mainScript);
  fn(document, window, localStorage, QRCode, fetch);
  console.log('Main script executed SUCCESS!');
  const qHtml = mockElements['questionsContainer']?.innerHTML || '';
  const count = (qHtml.match(/data-rating-group="q\d+"/g) || []).length;
  console.log('Rendered questions count:', count);
} catch(e) {
  console.error('Error executing main script:', e);
}
