import React, { useMemo, useState } from 'react';
import {
  LibraryMode,
  NarrativePattern,
  VisualAnchor,
} from '../../types/visualLibrary';
import {
  buildNarrativeInspirationContext,
  buildVisualGenerationBrief,
  getCompatibleNarrativePatterns,
  matchPoemToAnchors,
} from '../../services/visualLibraryService';

interface Props {
  mode: Exclude<LibraryMode, 'GALLERY'>;
  allAnchors: VisualAnchor[];
  selectedAnchors: VisualAnchor[];
  latestPoem?: string;
  onToggleAnchor: (anchorId: string) => void;
  onInspectAnchor: (anchor: VisualAnchor) => void;
  onLaunchRhymeEngine: (
    userTopic: string,
    selectedPatterns: NarrativePattern[]
  ) => void;
}

const ModeStudioPanel: React.FC<Props> = ({
  mode,
  allAnchors,
  selectedAnchors,
  latestPoem,
  onToggleAnchor,
  onInspectAnchor,
  onLaunchRhymeEngine,
}) => {
  // Mode 1 state
  const [visualRequest, setVisualRequest] = useState(
    'Создай открытку о путешествии поэта по Крыму'
  );
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Mode 2 state
  const [poemInput, setPoemInput] = useState(
    latestPoem ||
      'У фонтана в тихом саду\nВнемлет роза шёпоту вод,\nПуть к таврическому укладу\nПарус в море вдаль зовёт.'
  );

  // Mode 3 state
  const [narrativeTopic, setNarrativeTopic] = useState(
    'Напиши стихотворение о Бахчисарайском фонтане и воспоминании'
  );
  const compatiblePatterns = useMemo(
    () => getCompatibleNarrativePatterns(selectedAnchors.map((a) => a.anchor_id)),
    [selectedAnchors]
  );
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);

  const selectedPatterns = useMemo(
    () => compatiblePatterns.filter((p) => selectedPatternIds.includes(p.pattern_id)),
    [compatiblePatterns, selectedPatternIds]
  );

  const visualBrief = useMemo(
    () => buildVisualGenerationBrief(visualRequest, selectedAnchors),
    [visualRequest, selectedAnchors]
  );

  const poemMatches = useMemo(
    () => matchPoemToAnchors(poemInput, allAnchors, 6),
    [poemInput, allAnchors]
  );

  const narrativeContextPreview = useMemo(
    () =>
      buildNarrativeInspirationContext(
        narrativeTopic,
        selectedAnchors,
        selectedPatterns
      ),
    [narrativeTopic, selectedAnchors, selectedPatterns]
  );

  const togglePattern = (patternId: string) => {
    setSelectedPatternIds((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(visualBrief.synthesizedPrompt);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  if (mode === 'MODE_1_VISUAL_GENERATION') {
    return (
      <section className="bg-[#fdf5e6] border border-[#d2b48c] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[#8b4513]/15 pb-4">
          <div className="text-xs font-sans uppercase tracking-widest text-[#8b4513]/80">
            Режим 1 · Визуальная генерация и открытка
          </div>
          <h3 className="text-2xl font-classic text-[#3d1f0e]">
            Конструктор композиционного брифа
          </h3>
          <p className="text-sm text-[#5d2e0a]">
            Объединяет выбранные визуальные якоря (композицию, палитру, декор и среду) в
            структурированное задание для художника или генератора изображений.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513]">
            Запрос на визуальную композицию
          </label>
          <input
            type="text"
            value={visualRequest}
            onChange={(e) => setVisualRequest(e.target.value)}
            placeholder="Например: Открытка о путешествии по Крыму с виноградной лозой"
            className="w-full p-3 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                setVisualRequest('Открытка о путешествии Пушкина по Крыму и Ялте')
              }
              className="px-3 py-1.5 border border-[#8b4513]/30 hover:bg-[#8b4513]/10 cursor-pointer"
            >
              Пример: Открытка о Крыме
            </button>
            <button
              type="button"
              onClick={() =>
                setVisualRequest('Лирическая сцена у Бахчисарайского фонтана с розами и гитарой')
              }
              className="px-3 py-1.5 border border-[#8b4513]/30 hover:bg-[#8b4513]/10 cursor-pointer"
            >
              Пример: Бахчисарайский фонтан
            </button>
          </div>
        </div>

        {selectedAnchors.length === 0 ? (
          <div className="p-6 bg-[#f4ece1]/80 border border-[#8b4513]/20 text-sm text-[#5d2e0a]">
            Выберите один или несколько визуальных якорей в галерее, чтобы собрать их
            композиционные и декоративные особенности в бриф.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
                Извлечённые ориентиры из выбранных якорей ({selectedAnchors.length})
              </div>
              <dl className="divide-y divide-[#8b4513]/15 border-t border-b border-[#8b4513]/15 text-sm">
                <div className="py-2.5">
                  <dt className="font-semibold text-[#3d1f0e]">Композиция</dt>
                  <dd className="text-[#5d2e0a]">
                    {visualBrief.compositionSummary.join('; ') || 'Не задана'}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="font-semibold text-[#3d1f0e]">Среда</dt>
                  <dd className="text-[#5d2e0a]">
                    {visualBrief.environmentSummary.join('; ') || 'Не задана'}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="font-semibold text-[#3d1f0e]">Персонажи и действия</dt>
                  <dd className="text-[#5d2e0a]">
                    {[...visualBrief.characterSummary, ...visualBrief.actionSummary].join('; ')}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="font-semibold text-[#3d1f0e]">Декор и палитра</dt>
                  <dd className="text-[#5d2e0a]">
                    {[...visualBrief.decorativeSummary, ...visualBrief.paletteSummary].join(' · ')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
                  Синтезированный промпт-бриф
                </span>
                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="px-4 py-1.5 bg-[#8b4513] text-[#fdf5e6] text-xs font-semibold hover:bg-[#5d2e0a] cursor-pointer"
                >
                  {copiedBrief ? 'Скопировано' : 'Скопировать бриф'}
                </button>
              </div>
              <textarea
                readOnly
                rows={9}
                value={visualBrief.synthesizedPrompt}
                className="w-full p-3 bg-[#f4ece1] border border-[#d2b48c] text-sm leading-relaxed text-[#2c1810]"
              />
              <p className="text-xs text-[#8b4513]/80 italic">
                {visualBrief.historicalDisclaimer}
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (mode === 'MODE_2_POEM_ILLUSTRATION') {
    return (
      <section className="bg-[#fdf5e6] border border-[#d2b48c] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[#8b4513]/15 pb-4">
          <div className="text-xs font-sans uppercase tracking-widest text-[#8b4513]/80">
            Режим 2 · Иллюстрация к стихотворению
          </div>
          <h3 className="text-2xl font-classic text-[#3d1f0e]">
            Подбор визуальных мотивов по тексту стихотворения
          </h3>
          <p className="text-sm text-[#5d2e0a]">
            Прозрачный лексический поиск по ключевым мотивам (вода, море, фонтан, конь, сад,
            виноград, перо, друзья) сопоставляет строки стиха с карточками библиотеки.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
              Текст стихотворения для подбора иллюстраций
            </label>
            {latestPoem && (
              <button
                type="button"
                onClick={() => setPoemInput(latestPoem)}
                className="px-3 py-1 text-xs border border-[#8b4513]/40 hover:bg-[#8b4513]/10 cursor-pointer"
              >
                Загрузить последнее сгенерированное стихотворение
              </button>
            )}
          </div>
          <textarea
            rows={5}
            value={poemInput}
            onChange={(e) => setPoemInput(e.target.value)}
            placeholder="Вставьте строфы стихотворения..."
            className="w-full p-3 bg-white/80 border border-[#d2b48c] font-classic text-base text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
          />
        </div>

        <div className="space-y-4">
          <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
            Найденные визуальные соответствия ({poemMatches.length})
          </div>

          {poemMatches.length === 0 ? (
            <div className="p-6 bg-[#f4ece1]/80 border border-[#8b4513]/20 text-sm text-[#5d2e0a]">
              По буквальным мотивам текущего текста прямых совпадений не найдено. Попробуйте
              упомянуть образы моря, сада, дороги, фонтана, друзей, розы или пера — либо выберите
              якоря вручную в галерее.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {poemMatches.map((match) => {
                const isSelected = selectedAnchors.some(
                  (a) => a.anchor_id === match.anchor.anchor_id
                );
                return (
                  <article
                    key={match.anchor.anchor_id}
                    className="border border-[#d2b48c] bg-[#f4ece1]/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-[#e9decb] overflow-hidden border-b border-[#d2b48c]">
                        <img
                          src={match.anchor.source_image}
                          alt={match.anchor.anchor_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="text-xs font-sans text-[#8b4513]/80">
                          <span>{match.anchor.anchor_id}</span>
                          <span aria-hidden="true" className="mx-1.5">·</span>
                          <span>Совпадений: {match.matchedKeywords.length}</span>
                        </div>
                        <h4 className="font-classic text-lg text-[#3d1f0e]">
                          {match.anchor.anchor_name}
                        </h4>
                        <p className="text-xs text-[#5d2e0a]">
                          Совпавшие основы: {match.matchedKeywords.join(', ') || 'тематический контекст'}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleAnchor(match.anchor.anchor_id)}
                        className={`flex-1 py-2 text-xs font-semibold border cursor-pointer ${
                          isSelected
                            ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                            : 'bg-white/70 text-[#8b4513] border-[#8b4513]/40'
                        }`}
                      >
                        {isSelected ? 'Выбран' : 'Выбрать якорь'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspectAnchor(match.anchor)}
                        className="px-3 py-2 text-xs border border-[#8b4513]/30 text-[#3d1f0e] hover:bg-[#8b4513]/10 cursor-pointer"
                      >
                        Детали
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  // MODE 3 — NARRATIVE INSPIRATION
  return (
    <section className="bg-[#fdf5e6] border border-[#d2b48c] p-6 md:p-8 space-y-6">
      <div className="space-y-2 border-b border-[#8b4513]/15 pb-4">
        <div className="text-xs font-sans uppercase tracking-widest text-[#8b4513]/80">
          Режим 3 · Поэтический нарратив и передача в движок
        </div>
        <h3 className="text-2xl font-classic text-[#3d1f0e]">
          Сборка художественного контекста для Рифменной машины
        </h3>
        <p className="text-sm text-[#5d2e0a]">
          Объединяет выбранные визуальные якоря и повествовательные паттерны в источник
          вдохновения для существующего поэтического движка <code>transformText()</code>.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513]">
          Исходная тема, заметка или сюжет пользователя
        </label>
        <textarea
          rows={3}
          value={narrativeTopic}
          onChange={(e) => setNarrativeTopic(e.target.value)}
          placeholder="Опишите тему или мысль для стихотворения..."
          className="w-full p-3 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
        />
      </div>

      <div className="space-y-3">
        <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
          Повествовательные паттерны (отношения между объектами)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {compatiblePatterns.map((pattern) => {
            const active = selectedPatternIds.includes(pattern.pattern_id);
            return (
              <button
                key={pattern.pattern_id}
                type="button"
                onClick={() => togglePattern(pattern.pattern_id)}
                className={`text-left p-4 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#8b4513]/10 border-[#8b4513]'
                    : 'bg-[#f4ece1]/50 border-[#d2b48c] hover:border-[#8b4513]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-classic text-base font-semibold text-[#3d1f0e]">
                    {pattern.title}
                  </span>
                  <span className="text-xs font-sans text-[#8b4513]">
                    {active ? 'Подключён' : 'Подключить'}
                  </span>
                </div>
                <div className="text-xs text-[#5d2e0a] mt-1">{pattern.formula}</div>
                <div className="text-xs text-[#8b4513]/80 mt-2">
                  Мотивы: {pattern.literary_themes.join(' · ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]">
          Предпросмотр контекста генерации (Generation Context)
        </div>
        <textarea
          readOnly
          rows={6}
          value={narrativeContextPreview}
          className="w-full p-3 bg-[#f4ece1] border border-[#d2b48c] text-xs leading-relaxed text-[#2c1810]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-[#5d2e0a]">
          Активно якорей: <strong>{selectedAnchors.length}</strong> · Повествовательных паттернов:{' '}
          <strong>{selectedPatterns.length}</strong>
        </div>
        <button
          type="button"
          disabled={!narrativeTopic.trim()}
          onClick={() => onLaunchRhymeEngine(narrativeTopic, selectedPatterns)}
          className="px-8 py-3 bg-[#8b4513] text-[#fdf5e6] font-bold text-sm uppercase tracking-wider hover:bg-[#5d2e0a] transition-colors disabled:opacity-50 cursor-pointer"
        >
          Передать контекст в Рифменную машину
        </button>
      </div>
    </section>
  );
};

export default ModeStudioPanel;
