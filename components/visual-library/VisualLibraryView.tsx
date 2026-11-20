import React, { useMemo, useState } from 'react';
import {
  LibraryCategory,
  LibraryMode,
  NarrativePattern,
  VisualAnchor,
} from '../../types/visualLibrary';
import {
  AnchorEditFields,
  filterAnchors,
  getRelatedAnchors,
  LIBRARY_CATEGORIES,
} from '../../services/visualLibraryService';
import AnchorDetailModal from './AnchorDetailModal';
import AddAnchorModal from './AddAnchorModal';
import ModeStudioPanel from './ModeStudioPanel';

interface Props {
  anchors: VisualAnchor[];
  selectedAnchorIds: string[];
  latestPoem?: string;
  initialMode?: LibraryMode;
  onToggleSelect: (anchorId: string) => void;
  onClearSelection: () => void;
  onSaveEdit: (anchorId: string, patch: AnchorEditFields) => void;
  onResetEdit: (anchorId: string) => void;
  onAddAnchor: (anchor: VisualAnchor) => void;
  onRemoveCustomAnchor: (anchorId: string) => void;
  onLaunchRhymeEngine: (
    userTopic: string,
    selectedPatterns: NarrativePattern[]
  ) => void;
}

const MODE_TABS: { id: LibraryMode; label: string }[] = [
  { id: 'GALLERY', label: 'Каталог якорей' },
  { id: 'MODE_1_VISUAL_GENERATION', label: 'Режим 1: Открытка' },
  { id: 'MODE_2_POEM_ILLUSTRATION', label: 'Режим 2: Иллюстрация к стиху' },
  { id: 'MODE_3_NARRATIVE_INSPIRATION', label: 'Режим 3: Нарратив для стиха' },
];

const VisualLibraryView: React.FC<Props> = ({
  anchors,
  selectedAnchorIds,
  latestPoem,
  initialMode = 'GALLERY',
  onToggleSelect,
  onClearSelection,
  onSaveEdit,
  onResetEdit,
  onAddAnchor,
  onRemoveCustomAnchor,
  onLaunchRhymeEngine,
}) => {
  const [mode, setMode] = useState<LibraryMode>(initialMode);
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedAnchorId, setInspectedAnchorId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const selectedAnchors = useMemo(
    () => anchors.filter((a) => selectedAnchorIds.includes(a.anchor_id)),
    [anchors, selectedAnchorIds]
  );

  const filteredAnchors = useMemo(
    () => filterAnchors(anchors, activeCategory, searchQuery),
    [anchors, activeCategory, searchQuery]
  );

  const inspectedAnchor = useMemo(
    () => anchors.find((a) => a.anchor_id === inspectedAnchorId) || null,
    [anchors, inspectedAnchorId]
  );

  const relatedForInspected = useMemo(
    () => (inspectedAnchor ? getRelatedAnchors(inspectedAnchor, anchors) : []),
    [inspectedAnchor, anchors]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Intro & Historical Notice */}
      <section className="border-b border-[#8b4513]/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-sans uppercase tracking-widest text-[#8b4513]/80">
            Visual &amp; Narrative Reference Library V1 · {anchors.length} ориентиров
          </div>
          <h2 className="text-3xl md:text-4xl font-classic text-[#3d1f0e]">
            Художественная библиотека визуальных и повествовательных якорей
          </h2>
          <p className="text-base text-[#5d2e0a] leading-relaxed">
            Собрание художественных закономерностей — композиции, среды, декора, атмосферы и
            сюжетных связей. Материалы являются современными стилизациями для вдохновения и не
            выдаются за документальные исторические источники.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-[#fdf5e6] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Добавить новый якорь
        </button>
      </section>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#8b4513]/15 pb-4">
        {MODE_TABS.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                  : 'bg-[#fdf5e6] text-[#3d1f0e] border-[#d2b48c] hover:border-[#8b4513]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Selected Anchors Context Tray */}
      {selectedAnchors.length > 0 && (
        <section className="bg-[#fdf5e6] border border-[#8b4513]/30 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-sans uppercase tracking-wider font-semibold text-[#8b4513]">
              Выбрано для контекста ({selectedAnchors.length}):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {selectedAnchors.map((a) => (
                <button
                  key={a.anchor_id}
                  type="button"
                  onClick={() => onToggleSelect(a.anchor_id)}
                  title="Нажмите, чтобы снять выбор"
                  className="flex items-center gap-2 bg-[#f4ece1] border border-[#d2b48c] px-2 py-1 text-xs text-[#3d1f0e] hover:border-[#8b4513] cursor-pointer"
                >
                  <img
                    src={a.source_image}
                    alt={a.anchor_name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 object-cover"
                  />
                  <span className="max-w-[160px] truncate">{a.anchor_name}</span>
                  <span aria-hidden="true" className="text-[#8b4513]">×</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {mode === 'GALLERY' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('MODE_1_VISUAL_GENERATION')}
                  className="px-4 py-2 text-xs font-semibold border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513]/10 whitespace-nowrap cursor-pointer"
                >
                  Собрать открытку (Режим 1)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('MODE_3_NARRATIVE_INSPIRATION')}
                  className="px-4 py-2 text-xs font-semibold bg-[#8b4513] text-[#fdf5e6] hover:bg-[#5d2e0a] whitespace-nowrap cursor-pointer"
                >
                  Создать стих с якорями (Режим 3)
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClearSelection}
              className="px-3 py-2 text-xs text-[#8b4513] underline hover:text-[#3d1f0e] whitespace-nowrap cursor-pointer"
            >
              Сбросить выбор
            </button>
          </div>
        </section>
      )}

      {/* Mode Studio View */}
      {mode !== 'GALLERY' && (
        <ModeStudioPanel
          mode={mode}
          allAnchors={anchors}
          selectedAnchors={selectedAnchors}
          latestPoem={latestPoem}
          onToggleAnchor={onToggleSelect}
          onInspectAnchor={(a) => setInspectedAnchorId(a.anchor_id)}
          onLaunchRhymeEngine={onLaunchRhymeEngine}
        />
      )}

      {/* Search & Category Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="vl-search" className="sr-only">
              Поиск по описанию, среде, мотивам или атмосфере
            </label>
            <input
              id="vl-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по мотивам, среде, декору или ID якоря..."
              className="w-full px-4 py-2.5 bg-[#fdf5e6] border border-[#d2b48c] text-sm text-[#2c1810] placeholder:text-[#8b4513]/50 focus:outline-2 focus:outline-[#8b4513]"
            />
          </div>

          <div className="text-xs font-sans text-[#8b4513]/80 tabular-nums">
            Показано {filteredAnchors.length} из {anchors.length} якорей
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#3d1f0e] text-[#fdf5e6] border-[#3d1f0e]'
                : 'bg-[#fdf5e6] text-[#3d1f0e] border-[#d2b48c] hover:border-[#8b4513]'
            }`}
          >
            Все категории ({anchors.length})
          </button>
          {LIBRARY_CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#3d1f0e] text-[#fdf5e6] border-[#3d1f0e]'
                    : 'bg-[#fdf5e6] text-[#3d1f0e] border-[#d2b48c] hover:border-[#8b4513]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Gallery Grid */}
      {filteredAnchors.length === 0 ? (
        <div className="p-12 text-center bg-[#fdf5e6] border border-[#d2b48c] space-y-3">
          <p className="font-classic text-xl text-[#3d1f0e]">
            По выбранным фильтрам якоря не найдены
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-sm border border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-[#fdf5e6] cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnchors.map((anchor) => {
            const isSelected = selectedAnchorIds.includes(anchor.anchor_id);
            const hasBrokenImg = brokenImages[anchor.anchor_id];
            return (
              <article
                key={anchor.anchor_id}
                className={`bg-[#fdf5e6] border transition-colors flex flex-col justify-between ${
                  isSelected ? 'border-[#8b4513] shadow-md' : 'border-[#d2b48c]'
                }`}
              >
                <div>
                  {/* Image container */}
                  <button
                    type="button"
                    onClick={() => setInspectedAnchorId(anchor.anchor_id)}
                    className="w-full aspect-square bg-[#e9decb] overflow-hidden border-b border-[#d2b48c] block text-left cursor-pointer group"
                    aria-label={`Открыть карточку ${anchor.anchor_name}`}
                  >
                    {!hasBrokenImg ? (
                      <img
                        src={anchor.source_image}
                        alt={anchor.anchor_name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [anchor.anchor_id]: true,
                          }))
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <span className="font-classic text-base text-[#3d1f0e]">
                          {anchor.anchor_name}
                        </span>
                        <span className="text-xs text-[#8b4513]/70 mt-1">
                          Изображение не загружено
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Card body (zero-pill metadata) */}
                  <div className="p-5 space-y-2.5">
                    <div className="text-xs font-sans text-[#8b4513]/80 truncate">
                      <span>{anchor.anchor_id}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>{anchor.literary_space || 'Таврида'}</span>
                      {anchor.is_edited && (
                        <>
                          <span aria-hidden="true" className="mx-1.5">·</span>
                          <span>Изм.</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-classic text-xl leading-snug text-[#3d1f0e]">
                      {anchor.anchor_name}
                    </h3>

                    <p className="text-sm text-[#5d2e0a] line-clamp-3 leading-relaxed">
                      {anchor.visual_description}
                    </p>

                    <div className="text-xs text-[#8b4513]/85 pt-1">
                      {anchor.library_categories.slice(0, 3).join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-[#8b4513]/10">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(anchor.anchor_id)}
                    className={`flex-1 py-2 text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                        : 'bg-transparent text-[#8b4513] border-[#8b4513]/40 hover:border-[#8b4513]'
                    }`}
                  >
                    {isSelected ? 'Выбран' : 'Выбрать якорь'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectedAnchorId(anchor.anchor_id)}
                    className="px-4 py-2 text-xs font-semibold border border-[#8b4513]/30 text-[#3d1f0e] hover:bg-[#8b4513]/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Карточка
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {inspectedAnchor && (
        <AnchorDetailModal
          anchor={inspectedAnchor}
          relatedAnchors={relatedForInspected}
          isSelected={selectedAnchorIds.includes(inspectedAnchor.anchor_id)}
          onToggleSelect={onToggleSelect}
          onSelectAnchor={(next) => setInspectedAnchorId(next.anchor_id)}
          onSaveEdit={onSaveEdit}
          onResetEdit={onResetEdit}
          onRemoveCustom={onRemoveCustomAnchor}
          onClose={() => setInspectedAnchorId(null)}
        />
      )}

      {/* Add Anchor Modal */}
      {isAddModalOpen && (
        <AddAnchorModal
          onAdd={onAddAnchor}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VisualLibraryView;
