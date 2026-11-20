
import React from 'react';
import { TransformationResult } from '../types';
import { VisualAnchor } from '../types/visualLibrary';

interface Props {
  result: TransformationResult;
  inspiredByAnchors?: VisualAnchor[];
  onIllustratePoem?: (poemText: string) => void;
}

const OutputParchment: React.FC<Props> = ({
  result,
  inspiredByAnchors = [],
  onIllustratePoem,
}) => {
  return (
    <div className="parchment p-8 md:p-12 border border-[#d2b48c] rounded-sm mx-auto max-w-2xl shadow-2xl relative">
      <div className="absolute top-4 right-4 text-[#8b4513]/10 pointer-events-none italic">
        PushkinRhymeEngine v2.0
      </div>
      
      <div className="font-classic text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-[#2c1810] selection:bg-[#8b4513]/20">
        {result.poem}
      </div>
      
      <div className="mt-10 border-t border-[#8b4513]/20 pt-6">
        <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-[#8b4513] mb-2">Мораль:</h4>
        <p className="italic text-lg text-[#5d2e0a]">
          {result.moral}
        </p>
      </div>

      {inspiredByAnchors.length > 0 && (
        <div className="mt-6 border-t border-[#8b4513]/15 pt-4 space-y-2">
          <div className="text-xs uppercase tracking-wider font-sans text-[#8b4513]/80">
            Художественные ориентиры библиотеки
          </div>
          <div className="flex flex-wrap gap-3">
            {inspiredByAnchors.map((anchor) => (
              <div
                key={anchor.anchor_id}
                className="flex items-center gap-2 text-xs text-[#3d1f0e]"
              >
                <img
                  src={anchor.source_image}
                  alt={anchor.anchor_name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-cover border border-[#d2b48c]"
                />
                <span>{anchor.anchor_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onIllustratePoem && (
        <div className="mt-6 pt-4 border-t border-[#8b4513]/15 flex justify-end">
          <button
            type="button"
            onClick={() => onIllustratePoem(result.poem)}
            className="text-xs font-sans uppercase tracking-wider text-[#8b4513] underline hover:text-[#3d1f0e] cursor-pointer"
          >
            Подобрать иллюстрацию из библиотеки (Режим 2)
          </button>
        </div>
      )}
      
      <div className="mt-8 flex justify-center opacity-30">
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#8b4513] to-transparent" />
      </div>
    </div>
  );
};

export default OutputParchment;
