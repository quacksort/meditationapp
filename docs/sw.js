// A unique name for the cache
const CACHE_NAME = 'meditation-app-cache-v1';

// An array of assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  // Add other assets like your main JS bundle, CSS, and images here
];

self.addEventListener('install', (event) => {
  console.log('SW: install event');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Opened cache');
      return cache.addAll(urlsToCache).catch(err => {
        console.error('SW: Failed to cache on install:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: activate event');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('SW: clients claimed.');
      // NOTE: Re-scheduling on activation would be done here,
      // but we first need to solve the notification display issue.
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

// Listener for test push messages from DevTools
self.addEventListener('push', (event) => {
    console.log('SW: Push event received');
    const title = 'Test Push Notification';
    const options = {
        body: event.data ? event.data.text() : 'You sent a test push message!',
        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
});


self.addEventListener('notificationclick', (event) => {
  console.log('SW: notificationclick event');
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

function getRemindersFromStorage() {
  return new Promise((resolve) => {
     clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        if(clientList.length > 0) {
            console.log('SW: Requesting reminders from client');
            clientList[0].postMessage({ type: 'GET_REMINDERS' });
        } else {
            console.log('SW: No clients found to request reminders from.');
        }
     });
     resolve([]); 
  });
}

function scheduleNotification(alarm, config) {
  const now = new Date();
  const [hours, minutes] = alarm.time.split(':').map(Number);
  
  let nextAlarmTime = new Date();
  nextAlarmTime.setHours(hours, minutes, 0, 0);

  if (nextAlarmTime <= now) {
    nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
  }
  
  const dayOfWeek = nextAlarmTime.getDay();
  if (alarm.days.length > 0 && !alarm.days.includes(dayOfWeek)) {
     console.log(`SW: Alarm "${config.name}" (${alarm.id}) skipped, not scheduled for today.`);
     return;
  }

  const delay = nextAlarmTime.getTime() - now.getTime();

  if (delay > 0) {
    console.log(`SW: Scheduling notification for "${config.name}" (${alarm.id}) with a delay of ${Math.round(delay / 1000)}s.`);
    
    if (scheduledTimeouts[alarm.id]) {
      clearTimeout(scheduledTimeouts[alarm.id]);
    }
    
    scheduledTimeouts[alarm.id] = setTimeout(() => {
      console.log(`SW: FIRING NOTIFICATION for "${config.name}" (${alarm.id})`);
      self.registration.showNotification('ZenInterval Meditation', {
        body: `Time for your "${config.name}" session`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
        vibrate: [200, 100, 200],
        badge: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
        tag: `meditation-reminder-${alarm.id}`,
        renotify: true,
        requireInteraction: true,
      });
      // This simple reschedule might not be robust enough for all cases, but it's a start
      // scheduleNotification(alarm, config);
    }, delay);
  } else {
    console.log(`SW: Alarm "${config.name}" (${alarm.id}) has a non-positive delay (${delay}ms), not scheduling.`);
  }
}

function scheduleAlarms(reminders, configs) {
    console.log('SW: scheduleAlarms called with', { reminders, configs });
    for (const id in scheduledTimeouts) {
        clearTimeout(scheduledTimeouts[id]);
        delete scheduledTimeouts[id];
    }
    console.log('SW: Cleared all previous scheduled timeouts.');
    
    const configsMap = new Map(configs.map(c => [c.id, c]));

    reminders.forEach(alarm => {
        if (alarm.enabled) {
            const config = configsMap.get(alarm.configId);
            if(config) {
                console.log(`SW: Processing enabled alarm: "${config.name}" (${alarm.id})`);
                scheduleNotification(alarm, config);
            } else {
                console.log(`SW: Could not find config with id ${alarm.configId}`);
            }
        } else {
            console.log(`SW: Skipping disabled alarm ${alarm.id}`);
        }
    });
}


self.addEventListener('message', (event) => {
    console.log('SW: Message received:', event.data);
    if (event.data && event.data.type === 'SCHEDULE_ALARMS') {
        const { reminders, configs } = event.data.payload;
        scheduleAlarms(reminders, configs);
    }
});
