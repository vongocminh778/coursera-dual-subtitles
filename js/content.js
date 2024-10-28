async function openBilingual() {
  let tracks = document.getElementsByTagName('track');
  let en;
  let vi;
  
  if (tracks.length) {
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].srclang === 'en') {
        en = tracks[i];
      } else if (tracks[i].srclang === 'vi') {
        vi = tracks[i];
      }
    }

    if (en) {
      en.track.mode = 'showing';
      if (vi) {
        vi.track.mode = 'showing';
      } else {
        await sleep(500);
        let cues = en.track.cues;
        const cuesTextList = getCuesTextList(cues);
        
        for (let i = 0; i < cuesTextList.length; i++) {
          getTranslation(cuesTextList[i][1], translatedText => {
            const translatedTextList = translatedText.split('\n\n');
            for (let j = 0; j < translatedTextList.length; j++) {
              cues[cuesTextList[i][0] + j].text = cues[cuesTextList[i][0] + j].text.replace(/\n/g, ' ');
              cues[cuesTextList[i][0] + j].text += '\n' + translatedTextList[j].replace(/\n/g, ' ');
            }
          });
        }
      }
    }
  }
  
  // Áp dụng style cho phụ đề sau khi hiển thị
  styleSubtitles();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCuesTextList(cues) {
  let cuesTextList = [];
  for (let i = 0; i < cues.length; i++) {
    if (cuesTextList.length &&
        cuesTextList[cuesTextList.length - 1][1].length +
        cues[i].text.length < 5000) {
      cuesTextList[cuesTextList.length - 1][1] += '\n\n' + cues[i].text;
    } else {
      cuesTextList.push([i, cues[i].text]);
    }
  }
  return cuesTextList;
}

function getTranslation(words, callback) {
  const xhr = new XMLHttpRequest();
  let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURI(words)}`;
  xhr.open('GET', url, true);
  xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 304) {
        const translatedList = JSON.parse(xhr.responseText)[0];
        let translatedText = '';
        for (let i = 0; i < translatedList.length; i++) {
          translatedText += translatedList[i][0];
        }
        callback(translatedText);
      }
    }
  };
  xhr.send();
}

function styleSubtitles() {
  let style = document.createElement('style');
  style.innerHTML = `
    ::cue {
      padding: 4px;
      display: block;
      color: white;
      text-shadow: 0px 0px 3px rgb(0, 0, 0); /* Đổ bóng cho chữ */
      background: rgba(0, 0, 0, 0.5); /* Nền màu đen với độ trong suốt */
      font-size: 20px; /* Kích thước chữ */
      font-weight: bold;
      text-align: center;
    }
  `;
  document.head.appendChild(style);
}

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    openBilingual();
  }
);
