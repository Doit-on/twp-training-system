const fs = require('fs');

let reg = fs.readFileSync('register.html', 'utf8');

// 1. Version Bump: 1.19.0 -> 1.19.1
reg = reg.replace(/v1\.19\.0/g, 'v1.19.1');
reg = reg.replace(/Version: 1\.19\.0/g, 'Version: 1.19.1');
reg = reg.replace(/Version 1\.19\.0/g, 'Version 1.19.1');

// 2. Enhance loadAttendees response handling for eventInfo
const oldThenBlock = `      .then(res => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          attendees = res.data;
          localStorage.setItem(localStoreKey, JSON.stringify(attendees));
          handleAttendeeSearch(document.getElementById('attendeeSearchInput')?.value || '');
        }
      })`;

const newThenBlock = `      .then(res => {
        if (res && res.status === 'SUCCESS') {
          if (Array.isArray(res.data)) {
            attendees = res.data;
          } else if (res.data && Array.isArray(res.data.registrations)) {
            attendees = res.data.registrations;
          }
          if (res.data && res.data.eventInfo) {
            const ev = res.data.eventInfo;
            if (ev.courseTopic) currentEvent.courseTopic = ev.courseTopic;
            if (ev.schoolName) currentEvent.schoolName = ev.schoolName;
            if (ev.speakerName) currentEvent.speakerName = ev.speakerName;
            if (ev.eventDate) currentEvent.eventDate = ev.eventDate;
            document.getElementById('dispEventTopic').innerText = currentEvent.courseTopic;
            document.getElementById('dispEventSchool').innerText = currentEvent.schoolName;
            document.getElementById('dispEventSpeaker').innerText = currentEvent.speakerName;
            document.getElementById('dispEventDate').innerText = currentEvent.eventDate;
          }
          localStorage.setItem(localStoreKey, JSON.stringify(attendees));
          handleAttendeeSearch(document.getElementById('attendeeSearchInput')?.value || '');
        }
      })`;

if (reg.includes(oldThenBlock)) {
  reg = reg.replace(oldThenBlock, newThenBlock);
} else {
  console.log('Replacing via regex');
  reg = reg.replace(/\.then\(res => \{\s*if \(res && res\.status === 'SUCCESS' && Array\.isArray\(res\.data\)\) \{[\s\S]*?\}\s*\}\)/, newThenBlock);
}

fs.writeFileSync('register.html', reg, 'utf8');
console.log('register.html updated successfully!');
