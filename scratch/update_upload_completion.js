const fs = require('fs');

['index.html', 'frontend/index.html'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  const target = `            selectedEventPhotosToUpload = [];
            localStorage.setItem('twp_requests_store', JSON.stringify(AppState.requests));`;

  const replacement = `            selectedEventPhotosToUpload = [];
            const photoInp = document.getElementById('eventPhotoFileInput');
            if (photoInp) photoInp.value = '';
            if (typeof renderSelectedEventPhotosChips === 'function') renderSelectedEventPhotosChips();
            localStorage.setItem('twp_requests_store', JSON.stringify(AppState.requests));`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated upload completion in ${filePath}`);
  } else {
    console.error(`Could not find target in ${filePath}`);
  }
});
