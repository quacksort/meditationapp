
import React, { useState } from 'react';
import { Reminder, MeditationConfig } from '../types';

interface AlarmManagerProps {
  reminders: Reminder[];
  configs: MeditationConfig[];
  onSave: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const AlarmManager: React.FC<AlarmManagerProps> = ({ reminders, configs, onSave, onDelete, onToggle }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Reminder | null>(null);

  const handleOpenForm = (alarm?: Reminder) => {
    setEditingAlarm(alarm || null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-3xl font-black text-[#1A1C1E]">Mindfulness Alarms</h2>
          <p className="text-gray-500 font-medium">Keep your practice consistent</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="w-12 h-12 bg-[#005AC1] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      {reminders.length === 0 && !showForm && (
        <div className="material-card bg-white p-10 text-center space-y-4 border border-dashed border-gray-200">
          <div className="text-5xl opacity-30">🔔</div>
          <p className="text-gray-400 font-medium">No alarms set yet.<br/>Create one to stay on track.</p>
        </div>
      )}

      <div className="space-y-4">
        {reminders.map(alarm => (
          <div key={alarm.id} className="material-card flex items-center justify-between group">
            <div className="space-y-2 flex-1" onClick={() => handleOpenForm(alarm)}>
               <div className="flex items-baseline space-x-2">
                 <span className="text-4xl font-black text-[#1A1C1E]">{alarm.time}</span>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate max-w-[120px]">
                   {configs.find(c => c.id === alarm.configId)?.name || 'Default'}
                 </span>
               </div>
               <div className="flex space-x-1">
                 {['S','M','T','W','T','F','S'].map((day, idx) => (
                   <span key={idx} className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${alarm.days.includes(idx) ? 'bg-[#D3E4FF] text-[#005AC1]' : 'bg-gray-100 text-gray-400'}`}>
                     {day}
                   </span>
                 ))}
               </div>
            </div>
            
            <div className="flex items-center space-x-4">
               <button
                 onClick={() => onDelete(alarm.id)}
                 className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </button>
               <div 
                 onClick={() => onToggle(alarm.id)}
                 className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${alarm.enabled ? 'bg-[#005AC1]' : 'bg-gray-200'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${alarm.enabled ? 'left-7' : 'left-1'}`} />
               </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <AlarmForm 
          initialAlarm={editingAlarm} 
          configs={configs} 
          onSave={(data) => { onSave(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

interface AlarmFormProps {
  initialAlarm: Reminder | null;
  configs: MeditationConfig[];
  onSave: (reminder: Reminder) => void;
  onCancel: () => void;
}

const AlarmForm: React.FC<AlarmFormProps> = ({ initialAlarm, configs, onSave, onCancel }) => {
  const [time, setTime] = useState(initialAlarm?.time || '08:00');
  const [days, setDays] = useState<number[]>(initialAlarm?.days || [1,2,3,4,5]);
  const [configId, setConfigId] = useState(initialAlarm?.configId || configs[0]?.id || '');

  const toggleDay = (day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = () => {
    onSave({
      id: initialAlarm?.id || crypto.randomUUID(),
      time,
      days,
      configId,
      enabled: initialAlarm ? initialAlarm.enabled : true
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 relative z-10 shadow-2xl">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
        <h3 className="text-2xl font-black mb-6">{initialAlarm ? 'Edit Alarm' : 'New Alarm'}</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#F3F4F9] p-4 rounded-2xl text-4xl font-black text-[#005AC1] outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Routine to Trigger</label>
            <select
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              className="w-full bg-[#F3F4F9] p-4 rounded-2xl font-bold outline-none appearance-none"
            >
              {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Repeat On</label>
            <div className="flex justify-between">
              {['S','M','T','W','T','F','S'].map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${
                    days.includes(idx) ? 'bg-[#005AC1] text-white' : 'bg-[#F3F4F9] text-gray-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 font-bold text-gray-500 rounded-2xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-[#005AC1] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Save Alarm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmManager;
