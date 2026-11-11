const fs = require('fs');

const EVALUATION_QUESTIONS = [
  { id: 'q1', no: 1, title: 'ความรู้ความเชี่ยวชาญในเนื้อหาของวิทยากร', desc: 'วิทยากรมีความรอบรู้ ลึกซึ้ง และตอบข้อซักถามได้อย่างชัดเจน' },
  { id: 'q2', no: 2, title: 'เทคนิคการถ่ายทอดและการสื่อสารที่ชัดเจน เข้าใจง่าย', desc: 'มีลีลาการบรรยายที่น่าสนใจ ใช้ภาษาชัดเจน กระตุ้นการมีส่วนร่วม' },
  { id: 'q3', no: 3, title: 'เนื้อหาหลักสูตรมีความทันสมัย ตรงตามมาตรฐานวิชาการ', desc: 'เนื้อหาถูกต้อง ทันต่อการเปลี่ยนแปลง และสอดคล้องกับหลักสูตรแกนกลาง' },
  { id: 'q4', no: 4, title: 'ประโยชน์ในการนำความรู้ไปประยุกต์ใช้ในการสอนจริง', desc: 'สามารถนำแนวคิด เทคนิค และกิจกรรมไปปรับใช้ในชั้นเรียนได้ทันที' },
  { id: 'q5', no: 5, title: 'คุณภาพและความเหมาะสมของเอกสาร สื่อ และชุดกิจกรรม', desc: 'เอกสารคู่มือ สไลด์ และสื่อตัวอย่างมีคุณภาพ สวยงาม ชัดเจน' },
  { id: 'q6', no: 6, title: 'ความเหมาะสมของระยะเวลาและกำหนดการจัดกิจกรรม', desc: 'การจัดสรรเวลาในแต่ละหัวข้อมีความเหมาะสม ไม่กระชั้นชิดหรือยืดเยื้อ' },
  { id: 'q7', no: 7, title: 'ความพร้อมของสถานที่ โสตทัศนูปกรณ์ และสิ่งอำนวยความสะดวก', desc: 'ระบบเสียง ภาพ แสงสว่าง และสัญญาณอินเทอร์เน็ตมีความพร้อมและเสถียร' },
  { id: 'q8', no: 8, title: 'การให้บริการ การต้อนรับ และการประสานงานของทีมงาน TWP', desc: 'ทีมงานให้การต้อนรับ ประสานงาน ดูแลอำนวยความสะดวกอย่างอบอุ่น' },
  { id: 'q9', no: 9, title: 'ความพึงพอใจต่อภาพรวมและผลสัมฤทธิ์ของการจัดอบรม', desc: 'การจัดกิจกรรมบรรลุวัตถุประสงค์และเกิดประโยชน์คุ้มค่าต่อผู้เรียน' },
  { id: 'q10', no: 10, title: 'ความประสงค์เข้าร่วมกิจกรรมหรือแนะนำหลักสูตรของ TWP ต่อไป', desc: 'ยินดีที่จะเข้าร่วมกิจกรรมอบรมหรือแนะนำสื่อการสอนของ TWP ให้เพื่อนครู' }
];

const htmlList = EVALUATION_QUESTIONS.map(q => `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition hover:border-blue-300">
          <label class="block text-xs sm:text-sm font-bold text-slate-800 mb-0.5">
            ${q.no}. ${q.title}
          </label>
          <p class="text-[11px] text-slate-400 mb-3">${q.desc}</p>
          <div class="flex justify-between items-center px-1" data-rating-group="${q.id}">
            <button type="button" onclick="setRating('${q.id}', 1)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold transition hover:bg-blue-50 rating-btn cursor-pointer" data-val="1">1<span class="text-[8px] font-normal text-slate-400 block -mt-1">น้อยสุด</span></button>
            <button type="button" onclick="setRating('${q.id}', 2)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold transition hover:bg-blue-50 rating-btn cursor-pointer" data-val="2">2<span class="text-[8px] font-normal text-slate-400 block -mt-1">น้อย</span></button>
            <button type="button" onclick="setRating('${q.id}', 3)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold transition hover:bg-blue-50 rating-btn cursor-pointer" data-val="3">3<span class="text-[8px] font-normal text-slate-400 block -mt-1">ปานกลาง</span></button>
            <button type="button" onclick="setRating('${q.id}', 4)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold transition hover:bg-blue-50 rating-btn cursor-pointer" data-val="4">4<span class="text-[8px] font-normal text-slate-400 block -mt-1">ดี</span></button>
            <button type="button" onclick="setRating('${q.id}', 5)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold transition rating-btn active cursor-pointer" data-val="5">5<span class="text-[8px] font-bold text-blue-600 block -mt-1">ดีเยี่ยม</span></button>
          </div>
          <input type="hidden" name="${q.id}" id="${q.id}" value="5">
        </div>`).join('\n');

let surveyHtml = fs.readFileSync('survey.html', 'utf8');

// Replace empty questionsContainer with static 10 questions
surveyHtml = surveyHtml.replace(
  /<div id="questionsContainer" class="space-y-3">[\s\S]*?<\/div>/,
  `<div id="questionsContainer" class="space-y-3">\n${htmlList}\n      </div>`
);

// Fix btoa
surveyHtml = surveyHtml.replace(
  /const EXECUTIVE_SIGNATURE_SVG = 'data:image\/svg\+xml;base64,' \+ btoa\(([\s\S]*?)\);/,
  "const EXECUTIVE_SIGNATURE_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent($1);"
);

// Make transition to Step 2 instant (0 delay)
surveyHtml = surveyHtml.replace(
  /setTimeout\(\(\) => \{\s*switchToStep2\(certNumber, respId\);\s*\}, 400\);/,
  `// Instant transition (Zero-lag responsive UI)
      switchToStep2(certNumber, respId);`
);

fs.writeFileSync('survey.html', surveyHtml, 'utf8');
console.log('survey.html successfully updated with static 10 questions and zero-lag transition!');
