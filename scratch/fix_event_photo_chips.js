const fs = require('fs');

['index.html', 'frontend/index.html'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  const target = `                <button type="button" onclick="uploadSelectedEventPhotos()" id="btnUploadPhotos" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 btn-tactile">
                  <i class="fa-solid fa-upload"></i>
                  <span>อัปโหลด</span>
                </button>
              </div>`;

  const replacement = `                <button type="button" onclick="uploadSelectedEventPhotos()" id="btnUploadPhotos" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 btn-tactile">
                  <i class="fa-solid fa-upload"></i>
                  <span>อัปโหลด</span>
                </button>
              </div>

              <!-- Active Selected Event Photos List & Cancellation -->
              <div id="eventPhotosSelectedListContainer" class="hidden w-full bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 space-y-1.5 text-xs text-left">
                <div class="flex items-center justify-between border-b border-blue-200/60 pb-1 text-[11px] font-bold text-blue-900">
                  <span id="eventPhotosSelectedCount">เลือกรูปภาพ 0 ไฟล์</span>
                  <button type="button" onclick="cancelAllSelectedEventPhotos()" class="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-xmark"></i>
                    <span>ยกเลิกทั้งหมด</span>
                  </button>
                </div>
                <div id="eventPhotosSelectedChips" class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar"></div>
              </div>`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully added eventPhotosSelectedListContainer to ${filePath}`);
  } else {
    console.error(`Could not find target in ${filePath}`);
  }
});
