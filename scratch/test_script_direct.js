const fs = require('fs');

const surveyHtml = fs.readFileSync('survey.html', 'utf8');

// The main script is the last script in survey.html
const lastScriptMatch = surveyHtml.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
// Or find all script tags
const scripts = [];
const regex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let m;
while ((m = regex.exec(surveyHtml)) !== null) {
  if (m[1].trim()) scripts.push(m[1]);
}

console.log('Found inline scripts:', scripts.length);

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

// Execute the main script (index 1)
const mainScript = scripts[scripts.length - 1];
try {
  const fn = new Function('document', 'window', 'localStorage', 'QRCode', 'fetch', mainScript);
  fn(document, window, localStorage, QRCode, fetch);
  console.log('Main script executed successfully!');
  const qHtml = mockElements['questionsContainer']?.innerHTML || '';
  const count = (qHtml.match(/data-rating-group="q\d+"/g) || []).length;
  console.log('Rendered questions count:', count);
} catch(e) {
  console.error('Error executing main script:', e);
}
