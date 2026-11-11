const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const regex = /<button[\s\S]*?<\/button>/gi;
let match;
const results = [];
while ((match = regex.exec(content)) !== null) {
  const btn = match[0];
  if (btn.includes('อนุมัติ') || btn.includes('บันทึก') || btn.includes('ยืนยัน') || btn.includes('ค่าใช้จ่าย')) {
    const text = btn.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const onclick = (btn.match(/onclick="([^"]+)"/) || [])[1] || 'no-onclick';
    results.push({ text, onclick });
  }
}
console.log(JSON.stringify(results, null, 2));
