
import React, { useState } from 'react';
import { MeditationConfig, SoundType } from '../types';

interface ConfigFormProps {
  initialConfig?: MeditationConfig;
  onSave: (config: MeditationConfig) => void;
  onCancel: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ initialConfig, onSave, onCancel }) => {
  const [name, setName] = useState(initialConfig?.name || '');
  
  // Use strings for input state to allow clearing the field while typing
  const [totalMin, setTotalMin] = useState<string>(initialConfig ? Math.floor(initialConfig.totalDuration / 60).toString() : '10');
  const [intervalMin, setIntervalMin] = useState<string>(initialConfig ? Math.floor(initialConfig.intervalDuration / 60).toString() : '0');
  
  const [prepSec, setPrepSec] = useState(initialConfig?.prepDuration || 10);
  const [startSound, setStartSound] = useState(initialConfig?.startSound || SoundType.BELL);
  const [intervalSound, setIntervalSound] = useState(initialConfig?.intervalSound || SoundType.CHIME);
  const [finishSound, setFinishSound] = useState(initialConfig?.finishSound || SoundType.GONG);
  const [backgroundSound, setBackgroundSound] = useState(initialConfig?.backgroundSound || SoundType.NATURE);
  const [error, setError] = useState<string | null>(null);

  const handleBlur = (value: string, setter: (v: string) => void) => {
    if (value.trim() === '') {
      setter('0');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tMin = parseInt(totalMin) || 0;
    const iMin = parseInt(intervalMin) || 0;

    // Validation
    if (tMin <= 0) {
      setError("Total duration must be at least 1 minute.");
      return;
    }

    if (iMin > tMin) {
      setError("Interval cannot be longer than total duration.");
      return;
    }

    const newId = initialConfig?.id || `zen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    onSave({
      id: newId,
      name: name.trim() || 'My Meditation',
      totalDuration: tMin * 60,
      intervalDuration: iMin * 60,
      prepDuration: prepSec,
      startSound,
      intervalSound,
      finishSound,
      backgroundSound,
      reminders: initialConfig?.reminders || []
    });
  };

  const sounds = Object.values(SoundType);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <header className="px-6 py-6 flex items-center justify-between border-b sticky top-0 bg-white z-30">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-[#1A1C1E]">{initialConfig ? 'Edit Practice' : 'New Practice'}</h2>
        <button
          onClick={handleSubmit}
          className="text-[#005AC1] font-bold text-lg px-2"
        >
          Save
        </button>
      </header>

      <div className="px-6 py-8 space-y-8 overflow-y-auto max-w-2xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Routine Name</label>
          <div className="bg-[#F3F4F9] p-4 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-[#005AC1]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Zen"
              className="w-full text-xl font-bold outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total (min)</label>
            <input
              type="number"
              inputMode="numeric"
              value={totalMin}
              onChange={(e) => setTotalMin(e.target.value)}
              onBlur={() => handleBlur(totalMin, setTotalMin)}
              className="w-full bg-[#F3F4F9] rounded-2xl p-4 text-xl font-bold outline-none focus:ring-2 focus:ring-[#005AC1]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Interval (min)</label>
            <input
              type="number"
              inputMode="numeric"
              value={intervalMin}
              onChange={(e) => setIntervalMin(e.target.value)}
              onBlur={() => handleBlur(intervalMin, setIntervalMin)}
              className="w-full bg-[#F3F4F9] rounded-2xl p-4 text-xl font-bold outline-none focus:ring-2 focus:ring-[#005AC1]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prep Countdown (sec)</label>
          <div className="flex space-x-2">
            {[5, 10, 20, 30].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setPrepSec(s)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  prepSec === s ? 'bg-[#005AC1] text-white' : 'bg-[#F3F4F9] text-gray-600'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#1A1C1E]">Audio Settings</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Background Atmosphere</label>
            <select
              value={backgroundSound}
              onChange={(e) => setBackgroundSound(e.target.value as SoundType)}
              className="w-full bg-[#F3F4F9] rounded-2xl p-4 font-semibold outline-none"
            >
              {sounds.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Starting Sound</label>
            <select
              value={startSound}
              onChange={(e) => setStartSound(e.target.value as SoundType)}
              className="w-full bg-[#F3F4F9] rounded-2xl p-4 font-semibold outline-none"
            >
              {sounds.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Interval Sound</label>
            <select
              value={intervalSound}
              disabled={parseInt(intervalMin) === 0}
              onChange={(e) => setIntervalSound(e.target.value as SoundType)}
              className={`w-full rounded-2xl p-4 font-semibold outline-none ${
                parseInt(intervalMin) === 0 ? 'bg-gray-100 text-gray-300' : 'bg-[#F3F4F9]'
              }`}
            >
              {sounds.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;
