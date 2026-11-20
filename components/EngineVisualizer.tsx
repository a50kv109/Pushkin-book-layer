
import React from 'react';
import { EngineStage, EngineStep } from '../types';
import { ENGINE_STEPS, QuillIcon } from '../constants';

interface Props {
  currentStage: EngineStage;
}

const EngineVisualizer: React.FC<Props> = ({ currentStage }) => {
  const currentIndex = ENGINE_STEPS.findIndex(step => step.id === currentStage);
  
  return (
    <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#8b4513]/20 -z-10" />
        {ENGINE_STEPS.map((step, idx) => {
          const isActive = idx <= currentIndex && currentStage !== EngineStage.IDLE;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 
                  ${isActive 
                    ? 'bg-[#8b4513] border-[#8b4513] text-white shadow-lg' 
                    : 'bg-[#fdf5e6] border-[#8b4513]/30 text-[#8b4513]/40'
                  }
                  ${isCurrent ? 'scale-125 ring-4 ring-[#8b4513]/20' : ''}
                `}
              >
                {isCurrent ? <QuillIcon className="w-5 h-5 animate-pulse" /> : (idx + 1)}
              </div>
              
              <div className="absolute top-12 w-32 text-center">
                 <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-[#8b4513]' : 'text-gray-400'}`}>
                    {step.label}
                 </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {currentStage !== EngineStage.IDLE && currentIndex >= 0 && (
        <div className="pt-12 text-center animate-fade-in">
          <p className="italic text-[#5d2e0a]">
            &laquo;{ENGINE_STEPS[currentIndex].description}&raquo;
          </p>
        </div>
      )}
    </div>
  );
};

export default EngineVisualizer;
