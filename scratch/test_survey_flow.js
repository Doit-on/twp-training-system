const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

    const filePath = path.join(__dirname, '..', 'survey.html');
    const targetUrl = 'file://' + filePath.replace(/\\/g, '/') + '?t=EVT-20261111-7914&topic=' + encodeURIComponent('Active Learning สู่สมรรถนะผู้เรียน') + '&school=' + encodeURIComponent('โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ประสานมิตร') + '&speaker=' + encodeURIComponent('ศ.ดร.ประสาน ปัญญาเลิศ');

    console.log('Navigating to:', targetUrl);
    await page.goto(targetUrl, { waitUntil: 'load' });

    // 1. Verify Step 1 is visible
    const step1Visible = await page.evaluate(() => {
      const s1 = document.getElementById('step1Container');
      const s2 = document.getElementById('step2Container');
      const course = document.getElementById('dispCourseTitle').innerText;
      const school = document.getElementById('dispSchoolName').innerText;
      return {
        s1Hidden: s1.classList.contains('hidden'),
        s2Hidden: s2.classList.contains('hidden'),
        course,
        school
      };
    });
    console.log('Step 1 status:', step1Visible);

    if (step1Visible.s1Hidden || !step1Visible.s2Hidden) {
      throw new Error('Step 1 should be visible, Step 2 should be hidden initially!');
    }

    if (!step1Visible.school.includes('ประสานมิตร')) {
      throw new Error('School parameter failed to load from URL query string!');
    }

    // 2. Click submit evaluation (Step 1 -> Step 2 transition)
    console.log('Clicking submit evaluation...');
    await page.click('#btnSubmitEval');
    await new Promise(r => setTimeout(r, 600));

    // 3. Verify Step 2 is now visible
    const step2Visible = await page.evaluate(() => {
      const s1 = document.getElementById('step1Container');
      const s2 = document.getElementById('step2Container');
      return {
        s1Hidden: s1.classList.contains('hidden'),
        s2Hidden: s2.classList.contains('hidden')
      };
    });
    console.log('Step 2 transition status:', step2Visible);

    if (!step2Visible.s1Hidden || step2Visible.s2Hidden) {
      throw new Error('Step 1 should now be hidden, Step 2 should be visible!');
    }

    // 4. Test typing participant name and check live preview
    console.log('Typing participant name: ครูดวงใจ ใฝ่เรียนรู้...');
    await page.type('#participantNameTh', 'ครูดวงใจ ใฝ่เรียนรู้');
    await page.type('#participantNameEn', 'Mrs. Duangjai Fai-reanroo');

    const certName = await page.evaluate(() => {
      return {
        certTh: document.getElementById('viewCertNameTh').innerText,
        certEn: document.getElementById('viewCertNameEn').innerText,
        certSchool: document.getElementById('viewCertSchool').innerText
      };
    });
    console.log('Live Certificate Preview values:', certName);

    if (certName.certTh !== 'ครูดวงใจ ใฝ่เรียนรู้') {
      throw new Error('Name did not update on certificate! Actual: ' + certName.certTh);
    }
    if (certName.certEn !== 'Mrs. Duangjai Fai-reanroo') {
      throw new Error('English Name did not update on certificate! Actual: ' + certName.certEn);
    }
    if (!certName.certSchool.includes('ประสานมิตร')) {
      throw new Error('School did not display on certificate! Actual: ' + certName.certSchool);
    }

    console.log('SUCCESS: All survey.html 2-step pipeline tests passed flawlessly!');
    await browser.close();
  } catch(e) {
    console.error('TEST FAILED:', e);
    process.exit(1);
  }
})();
