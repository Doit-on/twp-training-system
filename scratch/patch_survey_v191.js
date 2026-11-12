const fs = require('fs');

let survey = fs.readFileSync('survey.html', 'utf8');

// 1. Version Bump: 1.19.0 -> 1.19.1
survey = survey.replace(/v1\.19\.0/g, 'v1.19.1');
survey = survey.replace(/Version: 1\.19\.0/g, 'Version: 1.19.1');
survey = survey.replace(/Version 1\.19\.0/g, 'Version 1.19.1');
survey = survey.replace(/SYSTEM_VERSION = '1\.19\.0'/g, "SYSTEM_VERSION = '1.19.1'");

// 2. Shorten verifyUrl
const oldVerifyUrlRegex = /const verifyUrl = `https:\/\/doit-on\.github\.io\/twp-training-system\/survey\.html\?step=2&view=cert&cert=\${encodeURIComponent\(cId\)}[^`]*`;/g;
const newVerifyUrl = 'const verifyUrl = `https://doit-on.github.io/twp-training-system/survey.html?step=2&view=cert&cert=${encodeURIComponent(cId)}`;';

survey = survey.replace(oldVerifyUrlRegex, newVerifyUrl);

fs.writeFileSync('survey.html', survey, 'utf8');
console.log('survey.html updated successfully!');
