'use strict';
/*
 * Background service worker.
 *  - Fires cooking-timer alerts (system notification + sound) even when the popup is closed.
 *  - Keeps the toolbar badge in sync: orange number = timers running, green DONE = a timer finished.
 *  - Handles the "Test alert" button so users can check their notification/sound setup.
 */

// Serialise timer work so two timers ending together can't overwrite each other.
let queue = Promise.resolve();
const enqueue = (fn) => { queue = queue.then(fn).catch((e) => console.error(e)); return queue; };

const DONE_TTL = 30 * 60 * 1000; // finished timers stay visible for 30 minutes

async function getState() {
  const r = await chrome.storage.local.get(['timers', 'done']);
  return { timers: Array.isArray(r.timers) ? r.timers : [], done: Array.isArray(r.done) ? r.done : [] };
}

// ── sound (played from a hidden offscreen page, since service workers can't play audio) ──
async function ensureOffscreen() {
  if (!chrome.offscreen) throw new Error('offscreen API unavailable');
  const ctxs = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (ctxs.length) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play a short sound when a cooking timer ends.'
  });
}

async function playSound() {
  try {
    await ensureOffscreen();
    const res = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'beep' });
    return res && res.ok ? 'ok' : 'failed: ' + ((res && res.error) || 'no response');
  } catch (e) {
    return 'failed: ' + e.message;
  }
}

// ── system notification ──
async function showNotification(id, title, message) {
  try {
    await chrome.notifications.create(id, {
      type: 'basic', iconUrl: 'icons/icon128.png', title, message, priority: 2, requireInteraction: true
    });
    return 'created';
  } catch (e) {
    return 'failed: ' + e.message;
  }
}

async function fireAlert(id, title, message) {
  const [notification, sound] = await Promise.all([showNotification(id, title, message), playSound()]);
  let permission = 'unknown';
  try { permission = await chrome.notifications.getPermissionLevel(); } catch (e) { /* ignore */ }
  const info = { ts: Date.now(), notification, sound, permission };
  await chrome.storage.local.set({ lastAlert: info });
  return info;
}

// ── timers ──
async function finishTimer(id) {
  const { timers, done } = await getState();
  const t = timers.find((x) => x.id === id);
  if (!t) return;
  const rest = timers.filter((x) => x.id !== id);
  // Don't announce timers that ended long ago (e.g. the browser was closed).
  if (Date.now() - t.endsAt > 10 * 60 * 1000) { await chrome.storage.local.set({ timers: rest }); return; }
  const fresh = done.filter((d) => Date.now() - d.at < DONE_TTL);
  await chrome.storage.local.set({
    timers: rest,
    done: [...fresh, { id: t.id, label: t.label, dish: t.dish, at: Date.now() }].slice(-10)
  });
  chrome.alarms.create('expire-done', { delayInMinutes: DONE_TTL / 60000 });
  await fireAlert('done-' + id, '⏰ ' + (t.label || 'Timer done'), t.dish ? t.dish + ': time\'s up!' : 'Time\'s up!');
}

async function updateBadge() {
  const { timers, done } = await getState();
  const fresh = done.filter((d) => Date.now() - d.at < DONE_TTL);
  let text = '', color = '#c2410c';
  if (fresh.length) { text = 'DONE'; color = '#15803d'; }
  else if (timers.length) { text = String(timers.length); }
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
  if (chrome.action.setBadgeTextColor) await chrome.action.setBadgeTextColor({ color: '#ffffff' });
}

async function pruneDone() {
  const { done } = await getState();
  const fresh = done.filter((d) => Date.now() - d.at < DONE_TTL);
  if (fresh.length !== done.length) await chrome.storage.local.set({ done: fresh });
  await updateBadge();
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('timer:')) enqueue(() => finishTimer(alarm.name.slice(6)));
  else if (alarm.name === 'expire-done') enqueue(pruneDone);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.timers || changes.done)) updateBadge();
});

chrome.notifications.onClicked.addListener((id) => chrome.notifications.clear(id));

// "Test alert" button in the popup.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'test-alert') {
    fireAlert('test-' + Date.now(), '🔔 Test alert', 'If you can see this and hear a beep, timers will work.').then(sendResponse);
    return true; // async response
  }
  return false;
});

async function reconcile() {
  const { timers } = await getState();
  for (const t of timers) {
    if (t.endsAt <= Date.now() + 500) {
      await finishTimer(t.id);
    } else if (!(await chrome.alarms.get('timer:' + t.id))) {
      chrome.alarms.create('timer:' + t.id, { when: t.endsAt });
    }
  }
  await pruneDone();
}

chrome.runtime.onStartup.addListener(() => enqueue(reconcile));
chrome.runtime.onInstalled.addListener(() => enqueue(reconcile));
