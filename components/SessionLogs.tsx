
import React from 'react';
import { MeditationSession } from '../types';

interface SessionLogsProps {
  sessions: MeditationSession[];
  onDeleteSession: (id: string) => void;
}

const SessionLogs: React.FC<SessionLogsProps> = ({ sessions, onDeleteSession }) => {
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationCompleted, 0) / 60);

  return (
    <div className="space-y-6 pb-24">
      <div className="material-card bg-[#D3E4FF] border-none">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-[#001D36]">Stats Overview</h3>
          <div className="p-2 bg-white/50 rounded-xl">
             <svg className="w-6 h-6 text-[#001D36]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-[#001D36]/60 uppercase">Total Time</p>
            <p className="text-3xl font-black text-[#001D36]">{totalMinutes}m</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#001D36]/60 uppercase">Sessions</p>
            <p className="text-3xl font-black text-[#001D36]">{sessions.length}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-[#1A1C1E] px-2">History</h2>
      
      {sessions.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-4xl">🧘‍♂️</div>
          <p className="text-gray-500 font-medium">Your meditation logs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="material-card flex items-center justify-between py-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  session.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {session.completed ? '✨' : '⏱️'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[#1A1C1E] truncate">{session.configName}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <div className="text-right">
                  <p className="font-bold text-[#1A1C1E]">{Math.round(session.durationCompleted / 60)} min</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {session.completed ? 'Goal reached' : 'Partial'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this session log?')) {
                      onDeleteSession(session.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Delete session"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionLogs;
