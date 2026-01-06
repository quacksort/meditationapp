// A unique name for the cache
const CACHE_NAME = 'meditation-app-cache-v1';

// An array of assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  // Add other assets like your main JS bundle, CSS, and images here
  // Note: Vite generates hashed assets, so you might need a more dynamic approach
  // or just cache the essential shell and let the network fetch the rest.
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache).catch(err => {
        console.error('Failed to cache:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      // After activating, re-schedule alarms from storage
      // This ensures alarms persist even if the browser was closed
      return scheduleAlarmsFromStorage();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// --- ALARM & NOTIFICATION LOGIC ---

let scheduledTimeouts = {};

// We need a way to get reminders. Since SW can't access localStorage,
// we'll use IndexedDB. For simplicity, we'll mimic an async storage getter.
// This part will need to be properly implemented with IndexedDB later.
function getRemindersFromStorage() {
  // This is a placeholder. In a real app, you would use IndexedDB
  // to allow the service worker to access data saved by the app.
  // For now, we rely on the app to message us the alarms.
  // When the SW activates, it will ask the app for the alarms.
  return new Promise((resolve) => {
    // Let's ask the client for the data
     clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        if(clientList.length > 0) {
            clientList[0].postMessage({ type: 'GET_REMINDERS' });
        }
     });
     // We will get the reminders via a 'SET_REMINDERS' message
     resolve([]); 
  });
}

function scheduleNotification(alarm, config) {
  const now = new Date();
  const [hours, minutes] = alarm.time.split(':').map(Number);
  
  // Calculate the next occurrence of the alarm
  let nextAlarmTime = new Date();
  nextAlarmTime.setHours(hours, minutes, 0, 0);

  // If the time is in the past for today, schedule it for tomorrow
  if (nextAlarmTime <= now) {
    nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
  }
  
  // Basic weekday check - this simplified logic assumes we check daily
  const dayOfWeek = nextAlarmTime.getDay();
  if (alarm.days.length > 0 && !alarm.days.includes(dayOfWeek)) {
     // If today is not a valid day, let's reschedule for the next valid day
     // This logic can be complex, for now we will just check tomorrow
     return;
  }

  const delay = nextAlarmTime.getTime() - now.getTime();

  if (delay > 0) {
    console.log(`Scheduling notification for "${config.name}" in ${Math.round(delay / 1000)}s`);
    // Clear any existing timeout for this alarm to avoid duplicates
    if (scheduledTimeouts[alarm.id]) {
      clearTimeout(scheduledTimeouts[alarm.id]);
    }
    
    scheduledTimeouts[alarm.id] = setTimeout(() => {
      self.registration.showNotification('ZenInterval Meditation', {
        body: `Time for your "${config.name}" session`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
        vibrate: [200, 100, 200],
        badge: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
        tag: `meditation-reminder-${alarm.id}`,
        renotify: true,
        requireInteraction: true,
      });
      // Re-schedule for the next day/week
      scheduleNotification(alarm, config);
    }, delay);
  }
}

function scheduleAlarms(reminders, configs) {
    // Clear all existing timeouts before rescheduling
    for (const id in scheduledTimeouts) {
        clearTimeout(scheduledTimeouts[id]);
        delete scheduledTimeouts[id];
    }
    
    const remindersMap = new Map(reminders.map(r => [r.id, r]));
    const configsMap = new Map(configs.map(c => [c.id, c]));

    reminders.forEach(alarm => {
        if (alarm.enabled) {
            const config = configsMap.get(alarm.configId);
            if(config) {
                scheduleNotification(alarm, config);
            }
        }
    });
}


self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_ALARMS') {
        const { reminders, configs } = event.data.payload;
        scheduleAlarms(reminders, configs);
    }
});
