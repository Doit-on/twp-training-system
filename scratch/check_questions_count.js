const fs = require('fs');

const surveyHtml = fs.readFileSync('survey.html', 'utf8');

// Let's check EVALUATION_QUESTIONS array in survey.html
const match = surveyHtml.match(/const EVALUATION_QUESTIONS = (\[[\s\S]*?\]);/);
if (match) {
  try {
    const list = eval(match[1]);
    console.log('Total questions in EVALUATION_QUESTIONS array:', list.length);
    list.forEach(q => console.log(`  Question ${q.no}: ${q.title}`));
  } catch(e) {
    console.error('Syntax error evaluating questions:', e);
  }
} else {
  console.error('Could not find EVALUATION_QUESTIONS array!');
}
