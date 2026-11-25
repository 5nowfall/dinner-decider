'use strict';
// Hidden page that plays the timer sound for the background service worker.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen' || msg.type !== 'beep') return false;
  const audio = new Audio('beep.wav');
  audio.volume = 1;
  audio.play()
    .then(() => sendResponse({ ok: true }))
    .catch((e) => sendResponse({ ok: false, error: String(e) }));
  return true; // async response
});
