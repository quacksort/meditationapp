
import React from 'react';
import { MeditationConfig } from '../types';

interface ConfigCardProps {
  config: MeditationConfig;
  onSelect: (config: MeditationConfig) => void;
  onEdit: (config: MeditationConfig) => void;
  onDelete: (id: string) => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ config, onSelect, onEdit, onDelete }) => {
  const minutes = Math.floor(config.totalDuration / 60);
  const intervalMins = config.intervalDuration ? Math.floor(config.intervalDuration / 60) : 0;

  return (
    <div className="material-card flex flex-col space-y-4 border border-transparent hover:border-[#D3E4FF] transition-all relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-xl font-bold text-[#1A1C1E] truncate">{config.name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
             <span className="bg-[#D3E4FF] text-[#001D36] text-xs px-2.5 py-1 rounded-lg font-bold">
              {minutes} min
            </span>
            {config.intervalDuration > 0 && (
              <span className="bg-[#E2E2E6] text-[#44474E] text-xs px-2.5 py-1 rounded-lg font-bold">
                Interval: {intervalMins} min
              </span>
            )}
          </div>
        </div>
        
        {/* Actions Container */}
        <div className="flex items-center shrink-0 z-20">
          <button
            type="button"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              onEdit(config); 
            }}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-[#44474E] active:scale-90"
            aria-label="Edit routine"
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              onDelete(config.id); 
            }}
            className="p-2.5 hover:bg-red-50 rounded-full transition-colors text-red-400 hover:text-red-600 active:scale-90"
            aria-label="Delete routine"
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 text-sm text-gray-500 overflow-hidden whitespace-nowrap">
        <div className="flex -space-x-1.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs">🔔</div>
          <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs">🍃</div>
        </div>
        <span className="truncate font-medium capitalize opacity-80">{config.startSound.replace('-', ' ')} • {config.backgroundSound.replace('-', ' ')}</span>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onSelect(config)}
          className="w-full bg-[#005AC1] text-white py-3.5 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98] transition-all hover:bg-[#004A9E] z-10"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span>Start Practice</span>
        </button>
      </div>
    </div>
  );
};

export default ConfigCard;
