
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MeditationConfig, MeditationSession } from '../types';
import { audioService } from '../services/audio';

interface MeditationTimerProps {
  config: MeditationConfig;
  onComplete: (session: MeditationSession) => void;
  onStop: () => void;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({ config, onComplete, onStop }) => {
  const [phase, setPhase] = useState<'prep' | 'active' | 'finished'>('prep');
  const [timeLeft, setTimeLeft] = useState(config.prepDuration);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalsCompleted, setIntervalsCompleted] = useState(0);

  const timerRef = useRef<number | null>(null);
  const timeLeftRef = useRef(config.prepDuration);
  const phaseRef = useRef<'prep' | 'active' | 'finished'>('prep');

  // Keep refs in sync with state for immediate access in completion logic
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const triggerCompletion = useCallback((isAuto: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.stopBackground();

    const elapsed = phaseRef.current === 'prep' ? 0 : config.totalDuration - timeLeftRef.current;
    const isFullyCompleted = isAuto || elapsed >= config.totalDuration;

    const session: MeditationSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      configId: config.id,
      configName: config.name,
      date: new Date().toISOString(),
      durationCompleted: Math.max(0, elapsed),
      totalDurationGoal: config.totalDuration,
      completed: isFullyCompleted,
    };
    
    onComplete(session);
  }, [config, onComplete]);

  useEffect(() => {
    if (phase === 'finished') {
      const timeout = window.setTimeout(() => triggerCompletion(true), 2500);
      return () => window.clearTimeout(timeout);
    }
  }, [phase, triggerCompletion]);

  const tick = useCallback(() => {
    if (isPaused || phaseRef.current === 'finished') return;

    setTimeLeft((prev) => {
      const next = prev - 1;
      
      if (next < 0) {
        if (phaseRef.current === 'prep') {
          setPhase('active');
          audioService.playEffect(config.startSound);
          audioService.playBackground(config.backgroundSound);
          return config.totalDuration;
        } else if (phaseRef.current === 'active') {
          setPhase('finished');
          audioService.playEffect(config.finishSound);
          return 0;
        }
        return 0;
      }

      if (phaseRef.current === 'active' && config.intervalDuration > 0) {
        const elapsed = config.totalDuration - next;
        if (elapsed > 0 && elapsed < config.totalDuration && elapsed % config.intervalDuration === 0) {
          audioService.playEffect(config.intervalSound);
          setIntervalsCompleted(prevI => prevI + 1);
        }
      }

      return next;
    });
  }, [isPaused, config]);

  useEffect(() => {
    timerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tick]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = phase === 'prep' 
    ? (1 - timeLeft / (config.prepDuration || 1)) * 100 
    : (1 - timeLeft / config.totalDuration) * 100;

  if (phase === 'finished') {
    return (
      <div className="fixed inset-0 bg-[#F3F4F9] z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="relative mb-8">
          <div className="text-8xl mb-4 animate-bounce">✨</div>
        </div>
        <h2 className="text-4xl font-black text-[#001D36] mb-2">Deep Peace</h2>
        <p className="text-[#44474E] text-lg font-medium">Session recorded to your log.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F3F4F9] z-[100] flex flex-col items-center justify-center py-10 px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-[#001D36] truncate max-w-[250px]">{config.name}</h2>
        <p className="text-[#44474E] font-bold tracking-widest uppercase text-sm mt-1">
          {phase === 'prep' ? 'Get Ready' : isPaused ? 'Paused' : 'Focusing'}
        </p>
      </div>

      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <circle cx="50" cy="50" r="41" fill="none" stroke="#E1E2EC" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="none"
            stroke="#005AC1"
            strokeWidth="5"
            strokeDasharray="257.6"
            strokeDashoffset={257.6 - (257.6 * Math.min(100, Math.max(0, progress))) / 100}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        <div className="text-center z-10 select-none">
          <span className="text-6xl font-light tabular-nums text-[#1A1C1E]">
            {formatTime(timeLeft)}
          </span>
          {phase === 'active' && config.intervalDuration > 0 && (
            <p className="text-[#44474E] font-bold text-xs mt-1">
              Interval {intervalsCompleted + 1}
            </p>
          )}
        </div>
      </div>

      <div className="mt-16 w-full flex justify-center space-x-8 items-center">
        <button
          onClick={() => {
            if (window.confirm("Stop meditation? This session won't be saved.")) {
              audioService.stopBackground();
              onStop();
            }
          }}
          className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 active:scale-90 transition-transform shadow-sm"
          title="Quit session"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            const nextPaused = !isPaused;
            setIsPaused(nextPaused);
            if (nextPaused) audioService.pauseBackground();
            else audioService.resumeBackground();
          }}
          className="w-20 h-20 rounded-full bg-[#D3E4FF] flex items-center justify-center text-[#001C38] shadow-md active:scale-90 transition-transform"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            // Instant finish without confirm to improve reliability
            triggerCompletion(false);
          }}
          className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-500 active:scale-90 transition-transform shadow-sm"
          title="Mark as Done"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MeditationTimer;
