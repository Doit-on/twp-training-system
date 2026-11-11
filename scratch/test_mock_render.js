const fs = require('fs');

const surveyHtml = fs.readFileSync('survey.html', 'utf8');

// Let's inspect the entire script block in survey.html
const scriptMatch = surveyHtml.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if (scriptMatch) {
  const scriptContent = scriptMatch[1];
  console.log('Script length:', scriptContent.length);

  // Let's run this script in a mock DOM environment
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
      console.log('Registered event:', event);
      if (event === 'DOMContentLoaded') {
        cb();
      }
    }
  };

  const localStorage = {
    getItem: () => null,
    setItem: () => {}
  };

  const QRCode = function() {};
  QRCode.CorrectLevel = { M: 0 };
  const fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });

  try {
    const fn = new Function('document', 'window', 'localStorage', 'QRCode', 'fetch', scriptContent);
    fn(document, window, localStorage, QRCode, fetch);
    console.log('Script executed with NO syntax or runtime errors!');
    console.log('questionsContainer HTML length:', mockElements['questionsContainer']?.innerHTML.length);
    const count = (mockElements['questionsContainer']?.innerHTML.match(/data-rating-group="q\d+"/g) || []).length;
    console.log('Total questions rendered into questionsContainer:', count);
  } catch(e) {
    console.error('Error executing survey script:', e);
  }
}
