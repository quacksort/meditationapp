
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, MeditationConfig, MeditationSession, Reminder } from './types';
import { storage } from './services/storage';
import { audioService } from './services/audio';
import Navigation from './components/Navigation';
import ConfigCard from './components/ConfigCard';
import ConfigForm from './components/ConfigForm';
import MeditationTimer from './components/MeditationTimer';
import SessionLogs from './components/SessionLogs';
import AlarmManager from './components/AlarmManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [configs, setConfigs] = useState<MeditationConfig[]>([]);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<MeditationConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [triggeredAlarm, setTriggeredAlarm] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  
  const lastCheckedMinute = useRef<string>('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  // Function to send data to the service worker
  const sendAlarmsToServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_ALARMS',
        payload: {
          reminders: storage.getReminders(), // Send fresh data
          configs: storage.getConfigs(),
        }
      });
    }
  }, []);

  useEffect(() => {
    audioService.init();
    setConfigs(storage.getConfigs());
    setSessions(storage.getSessions());
    setReminders(storage.getReminders());

    // Initial scheduling attempt when app loads
    navigator.serviceWorker.ready.then(registration => {
      // Small delay to ensure the SW is ready to receive messages
      setTimeout(sendAlarmsToServiceWorker, 1000); 
    });

    // Listen for requests from the SW
    const handleSWMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'GET_REMINDERS') {
            sendAlarmsToServiceWorker();
        }
    };
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    };
  }, [sendAlarmsToServiceWorker]);


  const handleRequestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showToast('Notifications enabled! 🔔', 'success');
      // After permission is granted, immediately schedule alarms
      sendAlarmsToServiceWorker();
    }
  }, [sendAlarmsToServiceWorker]);

  // This effect checks for alarms to show an IN-APP notification if the app is open.
  useEffect(() => {
    const checkAlarmsInApp = () => {
      const now = new Date();
      const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      if (currentMinute === lastCheckedMinute.current) return;
      lastCheckedMinute.current = currentMinute;

      const activeAlarms = reminders.filter(r => 
        r.enabled && 
        r.time === currentMinute && 
        (r.days.length === 0 || r.days.includes(currentDay))
      );
      
      // If there's an active alarm, show the in-app modal.
      // The service worker will handle the actual push notification.
      if (activeAlarms.length > 0 && !triggeredAlarm) {
         setTriggeredAlarm(activeAlarms[0]);
      }
    };

    const interval = setInterval(checkAlarmsInApp, 10000);
    return () => clearInterval(interval);
  }, [reminders, configs, triggeredAlarm]);


  const showToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSaveConfig = (config: MeditationConfig) => {
    setConfigs(prev => {
      const exists = prev.some(c => c.id === config.id);
      const next = exists ? prev.map(c => c.id === config.id ? config : c) : [config, ...prev];
      storage.saveConfigs(next);
      sendAlarmsToServiceWorker(); // Reschedule with updated configs
      return next;
    });
    showToast(config.id.startsWith('default') ? 'Routine updated' : 'New routine saved', 'success');
    setIsEditing(false);
    setSelectedConfig(null);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(prev => {
      const next = prev.filter(c => c.id !== id);
      storage.saveConfigs(next);
      sendAlarmsToServiceWorker(); // Reschedule
      return next;
    });
  };

  const handleDeleteSession = (id: string) => {
    storage.deleteSession(id);
    setSessions(storage.getSessions());
    showToast('Log entry removed');
  };

  const handleSessionComplete = (session: MeditationSession) => {
    audioService.stopBackground();
    storage.saveSession(session);
    setSessions(storage.getSessions());
    setSelectedConfig(null);
    setCurrentView('history');
    showToast(session.completed ? 'Session completed! ✨' : 'Session saved (partial)');
  };

  const handleStartPractice = (config: MeditationConfig) => {
    setSelectedConfig(config);
    setCurrentView('timer');
  };

  const handleSaveReminder = (reminder: Reminder) => {
    setReminders(prev => {
      const exists = prev.some(r => r.id === reminder.id);
      const next = exists ? prev.map(r => r.id === reminder.id ? reminder : r) : [...prev, reminder];
      storage.saveReminders(next);
      sendAlarmsToServiceWorker(); // Reschedule
      return next;
    });
    showToast('Alarm saved', 'success');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      storage.saveReminders(next);
      sendAlarmsToServiceWorker(); // Reschedule
      return next;
    });
    showToast('Alarm removed');
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
      storage.saveReminders(next);
      sendAlarmsToServiceWorker(); // Reschedule
      return next;
    });
  };

  const renderView = () => {
    if (currentView === 'timer' && selectedConfig) {
      return (
        <MeditationTimer
          config={selectedConfig}
          onComplete={handleSessionComplete}
          onStop={() => {
            setCurrentView('dashboard');
          }}
        />
      );
    }

    if (isEditing) {
      return (
        <ConfigForm
          initialConfig={selectedConfig || undefined}
          onSave={handleSaveConfig}
          onCancel={() => { setIsEditing(false); setSelectedConfig(null); }}
        />
      );
    }

    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {currentView === 'dashboard' && (
          <div className="space-y-8 pb-24">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-[#1A1C1E]">ZenInterval</h1>
                <p className="text-gray-500 font-medium">Find your center today</p>
              </div>
              <button
                onClick={() => { setSelectedConfig(null); setIsEditing(true); }}
                className="w-14 h-14 bg-[#005AC1] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map(config => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  onSelect={handleStartPractice}
                  onEdit={(c) => { setSelectedConfig(c); setIsEditing(true); }}
                  onDelete={handleDeleteConfig}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <SessionLogs sessions={sessions} onDeleteSession={handleDeleteSession} />
        )}

        {currentView === 'reminders' && (
          <AlarmManager 
            reminders={reminders}
            configs={configs}
            onSave={handleSaveReminder}
            onDelete={handleDeleteReminder}
            onToggle={handleToggleReminder}
            permissionStatus={notificationPermission}
            onRequestPermission={handleRequestPermission}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] relative">
      {renderView()}
      
      {triggeredAlarm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTriggeredAlarm(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 text-center relative z-10 animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-[#D3E4FF] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🧘‍♂️</div>
             <h2 className="text-2xl font-black text-[#1A1C1E] mb-2">Time to Practice</h2>
             <p className="text-gray-500 mb-8">
               Your routine <b>"{configs.find(c => c.id === triggeredAlarm.configId)?.name}"</b> is scheduled.
             </p>
             <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const config = configs.find(c => c.id === triggeredAlarm.configId);
                    if (config) {
                      handleStartPractice(config);
                      setTriggeredAlarm(null);
                    }
                  }}
                  className="w-full bg-[#005AC1] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
                >
                  Start Now
                </button>
                <button
                  onClick={() => setTriggeredAlarm(null)}
                  className="w-full py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
             </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top duration-300 pointer-events-none">
           <div className={`px-6 py-3 rounded-2xl shadow-2xl font-bold text-white flex items-center space-x-2 ${
             toast.type === 'success' ? 'bg-[#005AC1]' : 'bg-gray-800'
           }`}>
             <span>{toast.message}</span>
           </div>
        </div>
      )}

      {!isEditing && currentView !== 'timer' && (
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      )}
    </div>
  );
};

export default App;