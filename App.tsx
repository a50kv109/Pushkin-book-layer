import React, { useMemo, useState } from 'react';
import { EngineStage, TransformationResult } from './types';
import { transformText } from './services/geminiService';
import EngineVisualizer from './components/EngineVisualizer';
import OutputParchment from './components/OutputParchment';
import { QuillIcon, InkwellIcon, ENGINE_STEPS } from './constants';
import {
  LibraryMode,
  NarrativePattern,
  VisualAnchor,
} from './types/visualLibrary';
import {
  addCustomAnchor,
  AnchorEditFields,
  loadAllAnchors,
  removeCustomAnchor,
  resetAnchorEdit,
  saveAnchorEdit,
  transformTextWithVisualContext,
} from './services/visualLibraryService';
import VisualLibraryView from './components/visual-library/VisualLibraryView';

type ActiveSection = 'ENGINE' | 'VISUAL_LIBRARY';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('ENGINE');
  const [libraryInitialMode, setLibraryInitialMode] =
    useState<LibraryMode>('GALLERY');

  // Existing Rhyme Engine state
  const [inputText, setInputText] = useState('');
  const [stage, setStage] = useState<EngineStage>(EngineStage.IDLE);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Visual & Narrative Reference Library state
  const [anchors, setAnchors] = useState<VisualAnchor[]>(() => loadAllAnchors());
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);
  const [useVisualContext, setUseVisualContext] = useState(true);
  const [lastUsedAnchors, setLastUsedAnchors] = useState<VisualAnchor[]>([]);

  const selectedAnchors = useMemo(
    () => anchors.filter((a) => selectedAnchorIds.includes(a.anchor_id)),
    [anchors, selectedAnchorIds]
  );

  const runTransform = async (
    textToTransform: string,
    overrideAnchors?: VisualAnchor[],
    overridePatterns: NarrativePattern[] = []
  ) => {
    if (!textToTransform.trim()) return;

    const activeAnchors =
      overrideAnchors !== undefined
        ? overrideAnchors
        : useVisualContext
        ? selectedAnchors
        : [];

    setStage(EngineStage.ANALYZING);
    setError(null);
    setResult(null);
    setLastUsedAnchors(activeAnchors);

    // Simulated visualization delay for each stage
    const runSimulation = async () => {
      for (const step of ENGINE_STEPS) {
        setStage(step.id);
        await new Promise((r) => setTimeout(r, 800));
      }
    };

    try {
      const apiPromise =
        activeAnchors.length > 0 || overridePatterns.length > 0
          ? transformTextWithVisualContext(
              textToTransform,
              activeAnchors,
              overridePatterns
            )
          : transformText(textToTransform);

      const [apiResponse] = await Promise.all([apiPromise, runSimulation()]);

      setResult(apiResponse);
      setStage(EngineStage.COMPLETED);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при трансформации');
      setStage(EngineStage.ERROR);
    }
  };

  const handleTransform = async () => {
    await runTransform(inputText);
  };

  const handleReset = () => {
    setStage(EngineStage.IDLE);
    setResult(null);
    setError(null);
    setInputText('');
  };

  // Visual Library handlers
  const handleToggleSelectAnchor = (anchorId: string) => {
    setSelectedAnchorIds((prev) =>
      prev.includes(anchorId)
        ? prev.filter((id) => id !== anchorId)
        : [...prev, anchorId]
    );
  };

  const handleSaveEdit = (anchorId: string, patch: AnchorEditFields) => {
    setAnchors(saveAnchorEdit(anchorId, patch));
  };

  const handleResetEdit = (anchorId: string) => {
    setAnchors(resetAnchorEdit(anchorId));
  };

  const handleAddAnchor = (newAnchor: VisualAnchor) => {
    setAnchors(addCustomAnchor(newAnchor));
  };

  const handleRemoveCustomAnchor = (anchorId: string) => {
    setAnchors(removeCustomAnchor(anchorId));
    setSelectedAnchorIds((prev) => prev.filter((id) => id !== anchorId));
  };

  const handleLaunchFromLibrary = (
    userTopic: string,
    selectedPatterns: NarrativePattern[]
  ) => {
    setInputText(userTopic);
    setUseVisualContext(true);
    setActiveSection('ENGINE');
    void runTransform(userTopic, selectedAnchors, selectedPatterns);
  };

  const handleIllustratePoem = () => {
    setLibraryInitialMode('MODE_2_POEM_ILLUSTRATION');
    setActiveSection('VISUAL_LIBRARY');
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8">
      {/* Header */}
      <header className="py-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <InkwellIcon className="w-10 h-10 text-[#8b4513]" />
          <h1 className="text-4xl md:text-6xl font-classic italic tracking-tight text-[#3d1f0e]">
            Pushkin Rhyme Engine
          </h1>
          <QuillIcon className="w-10 h-10 text-[#8b4513] rotate-12" />
        </div>
        <p className="text-[#8b4513]/70 uppercase tracking-widest text-sm font-bold">
          Версия 2.0 • Архитектура А.А. Арцыбашева
        </p>

        {/* Section Switcher */}
        <nav
          aria-label="Основные разделы приложения"
          className="pt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => setActiveSection('ENGINE')}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'ENGINE'
                ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                : 'bg-[#fdf5e6] text-[#3d1f0e] border-[#d2b48c] hover:border-[#8b4513]'
            }`}
          >
            Рифменная машина
          </button>

          <button
            type="button"
            onClick={() => {
              setLibraryInitialMode('GALLERY');
              setActiveSection('VISUAL_LIBRARY');
            }}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'VISUAL_LIBRARY'
                ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                : 'bg-[#fdf5e6] text-[#3d1f0e] border-[#d2b48c] hover:border-[#8b4513]'
            }`}
          >
            Художественная библиотека ({anchors.length})
            {selectedAnchors.length > 0
              ? ` · Выбрано: ${selectedAnchors.length}`
              : ''}
          </button>
        </nav>
      </header>

      {activeSection === 'VISUAL_LIBRARY' ? (
        <main>
          <VisualLibraryView
            key={libraryInitialMode}
            anchors={anchors}
            selectedAnchorIds={selectedAnchorIds}
            latestPoem={result?.poem}
            initialMode={libraryInitialMode}
            onToggleSelect={handleToggleSelectAnchor}
            onClearSelection={() => setSelectedAnchorIds([])}
            onSaveEdit={handleSaveEdit}
            onResetEdit={handleResetEdit}
            onAddAnchor={handleAddAnchor}
            onRemoveCustomAnchor={handleRemoveCustomAnchor}
            onLaunchRhymeEngine={handleLaunchFromLibrary}
          />
        </main>
      ) : (
        <main className="max-w-4xl mx-auto space-y-12">
          {/* Input Section */}
          {stage === EngineStage.IDLE && (
            <div className="space-y-6 animate-fade-in">
              {selectedAnchors.length > 0 && (
                <div className="p-4 bg-[#fdf5e6] border border-[#d2b48c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
                      Подключённые визуальные якоря ({selectedAnchors.length})
                    </div>
                    <div className="text-sm text-[#3d1f0e]">
                      {selectedAnchors.map((a) => a.anchor_name).join(' · ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 text-xs text-[#3d1f0e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useVisualContext}
                        onChange={(e) => setUseVisualContext(e.target.checked)}
                        className="accent-[#8b4513]"
                      />
                      Учитывать как вдохновение
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLibraryInitialMode('MODE_3_NARRATIVE_INSPIRATION');
                        setActiveSection('VISUAL_LIBRARY');
                      }}
                      className="text-xs underline text-[#8b4513] hover:text-[#3d1f0e] cursor-pointer"
                    >
                      Настроить в библиотеке
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  className="w-full h-48 p-6 bg-[#fdf5e6] border-2 border-[#d2b48c] rounded-md shadow-inner text-lg focus:ring-2 focus:ring-[#8b4513] focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-serif"
                  placeholder="Введите текст для трансформации (техническое описание, новость или просто мысли)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 opacity-10">
                  <QuillIcon className="w-16 h-16" />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleTransform}
                  disabled={!inputText.trim()}
                  className="group relative px-10 py-4 bg-[#8b4513] text-[#fdf5e6] rounded-sm font-bold text-xl uppercase tracking-widest shadow-xl hover:bg-[#5d2e0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Активировать Модуль
                  <div className="absolute inset-0 border border-white/20 scale-95 group-hover:scale-100 transition-transform m-1 pointer-events-none" />
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {stage !== EngineStage.IDLE &&
            stage !== EngineStage.COMPLETED &&
            stage !== EngineStage.ERROR && (
              <div className="py-10 animate-fade-in">
                <EngineVisualizer currentStage={stage} />
              </div>
            )}

          {/* Result Section */}
          {result && stage === EngineStage.COMPLETED && (
            <div className="space-y-10 animate-scale-in">
              <OutputParchment
                result={result}
                inspiredByAnchors={lastUsedAnchors}
                onIllustratePoem={handleIllustratePoem}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 border-2 border-[#8b4513] text-[#8b4513] font-bold uppercase tracking-widest hover:bg-[#8b4513] hover:text-[#fdf5e6] transition-all cursor-pointer"
                >
                  Новое вдохновение
                </button>
              </div>
            </div>
          )}

          {/* Error Handling */}
          {stage === EngineStage.ERROR && (
            <div className="text-center space-y-6 py-10">
              <div className="text-6xl">🥀</div>
              <p className="text-red-800 text-xl font-serif italic">{error}</p>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-[#8b4513] text-white font-bold uppercase tracking-widest cursor-pointer"
              >
                Вернуться назад
              </button>
            </div>
          )}
        </main>
      )}

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#f4ece1]/90 backdrop-blur-sm border-t border-[#8b4513]/10 py-4 px-8 flex flex-col md:flex-row justify-between items-center gap-2 z-30">
        <div className="text-xs uppercase tracking-tighter text-[#8b4513]/60">
          PushkinRhymeEngine_v2.0 • Visual Anchors V1
        </div>
        <div className="text-xs text-[#8b4513]/60 font-serif italic">
          MIT (Code) · CC BY 4.0 (Docs) • Андрей Арцыбашев
        </div>
      </footer>
    </div>
  );
};

export default App;
