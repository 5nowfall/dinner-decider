'use strict';
/*
 * Background service worker: fires cooking-timer notifications even when the
 * popup is closed, and keeps the toolbar badge in sync with running timers.
 */

// Serialise timer work so two timers ending together can't overwrite each other.
let queue = Promise.resolve();
const enqueue = (fn) => { queue = queue.then(fn).catch((e) => console.error(e)); return queue; };

async function getTimers() {
  const { timers = [] } = await chrome.storage.local.get('timers');
  return Array.isArray(timers) ? timers : [];
}

async function finishTimer(id) {
  const timers = await getTimers();
  const t = timers.find((x) => x.id === id);
  if (!t) return;
  await chrome.storage.local.set({ timers: timers.filter((x) => x.id !== id) });
  // Don't announce timers that ended long ago (e.g. browser was closed).
  if (Date.now() - t.endsAt > 10 * 60 * 1000) return;
  chrome.notifications.create('done-' + id, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '⏰ ' + (t.label || 'Timer done'),
    message: t.dish ? t.dish + ': time\'s up!' : 'Time\'s up!',
    priority: 2,
    requireInteraction: true
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('timer:')) enqueue(() => finishTimer(alarm.name.slice(6)));
});

async function updateBadge() {
  const n = (await getTimers()).length;
  await chrome.action.setBadgeText({ text: n ? String(n) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#c2410c' });
  if (chrome.action.setBadgeTextColor) await chrome.action.setBadgeTextColor({ color: '#ffffff' });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.timers) updateBadge();
});

chrome.notifications.onClicked.addListener((id) => chrome.notifications.clear(id));

async function reconcile() {
  for (const t of await getTimers()) {
    if (t.endsAt <= Date.now() + 500) {
      await finishTimer(t.id);
    } else if (!(await chrome.alarms.get('timer:' + t.id))) {
      chrome.alarms.create('timer:' + t.id, { when: t.endsAt });
    }
  }
  await updateBadge();
}

chrome.runtime.onStartup.addListener(() => enqueue(reconcile));
chrome.runtime.onInstalled.addListener(() => enqueue(reconcile));
