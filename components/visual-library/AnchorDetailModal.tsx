import React, { useEffect, useState } from 'react';
import { LibraryCategory, VisualAnchor } from '../../types/visualLibrary';
import { AnchorEditFields, LIBRARY_CATEGORIES } from '../../services/visualLibraryService';

interface Props {
  anchor: VisualAnchor;
  relatedAnchors: VisualAnchor[];
  isSelected: boolean;
  onToggleSelect: (anchorId: string) => void;
  onSelectAnchor: (anchor: VisualAnchor) => void;
  onSaveEdit: (anchorId: string, patch: AnchorEditFields) => void;
  onResetEdit: (anchorId: string) => void;
  onRemoveCustom?: (anchorId: string) => void;
  onClose: () => void;
}

const AnchorDetailModal: React.FC<Props> = ({
  anchor,
  relatedAnchors,
  isSelected,
  onToggleSelect,
  onSelectAnchor,
  onSaveEdit,
  onResetEdit,
  onRemoveCustom,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [editName, setEditName] = useState(anchor.anchor_name);
  const [editSpace, setEditSpace] = useState(anchor.literary_space || '');
  const [editDesc, setEditDesc] = useState(anchor.visual_description);
  const [editAtmosphere, setEditAtmosphere] = useState(anchor.atmosphere);
  const [editGuidance, setEditGuidance] = useState(anchor.generation_guidance);
  const [editNarrativeText, setEditNarrativeText] = useState(
    anchor.narrative_potential.join('\n')
  );
  const [editCategories, setEditCategories] = useState<LibraryCategory[]>(
    anchor.library_categories
  );

  useEffect(() => {
    setIsEditing(false);
    setIsZoomed(false);
    setImageError(false);
    setEditName(anchor.anchor_name);
    setEditSpace(anchor.literary_space || '');
    setEditDesc(anchor.visual_description);
    setEditAtmosphere(anchor.atmosphere);
    setEditGuidance(anchor.generation_guidance);
    setEditNarrativeText(anchor.narrative_potential.join('\n'));
    setEditCategories(anchor.library_categories);
  }, [anchor]);

  const handleToggleCategory = (cat: LibraryCategory) => {
    setEditCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const narrativeList = editNarrativeText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveEdit(anchor.anchor_id, {
      anchor_name: editName.trim() || anchor.anchor_name,
      literary_space: editSpace.trim() || anchor.literary_space,
      visual_description: editDesc.trim() || anchor.visual_description,
      atmosphere: editAtmosphere.trim() || anchor.atmosphere,
      generation_guidance: editGuidance.trim() || anchor.generation_guidance,
      narrative_potential:
        narrativeList.length > 0 ? narrativeList : anchor.narrative_potential,
      library_categories: editCategories,
    });
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1810]/70 backdrop-blur-xs p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anchor-detail-title"
    >
      <div className="bg-[#fdf5e6] border border-[#8b4513]/30 rounded-sm max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-[#2c1810]">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#fdf5e6]/95 backdrop-blur-xs border-b border-[#8b4513]/15 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs tracking-widest uppercase text-[#8b4513]/75 font-sans">
              <span>{anchor.anchor_id}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>{anchor.anchor_category}</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Статус обработки: {anchor.processing_status}</span>
            </div>
            <h2
              id="anchor-detail-title"
              className="text-xl md:text-2xl font-classic text-[#3d1f0e]"
            >
              {anchor.anchor_name}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSelect(anchor.anchor_id)}
              className={`px-4 py-2 text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                  : 'bg-transparent text-[#8b4513] border-[#8b4513]/40 hover:border-[#8b4513]'
              }`}
            >
              {isSelected ? 'Выбран для генерации' : 'Выбрать якорь'}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-4 py-2 text-sm border border-[#8b4513]/30 text-[#3d1f0e] hover:bg-[#8b4513]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isEditing ? 'Отменить правку' : 'Редактировать'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-[#8b4513]/30 text-[#3d1f0e] hover:bg-[#8b4513]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Image Viewer */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#f4ece1] border border-[#d2b48c] p-3 rounded-sm">
              {!imageError ? (
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  className="w-full block text-left cursor-zoom-in focus-visible:outline-2 focus-visible:outline-[#8b4513]"
                  title="Нажмите для увеличения/сброса масштаба"
                >
                  <img
                    src={anchor.source_image}
                    alt={anchor.anchor_name}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className={`w-full rounded-xs transition-transform duration-200 ${
                      isZoomed ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </button>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-6 text-center bg-[#f4ece1] border border-dashed border-[#8b4513]/30">
                  <p className="font-classic text-lg text-[#3d1f0e]">
                    Изображение недоступно по локальному пути
                  </p>
                  <p className="text-xs text-[#8b4513]/70 mt-2 break-all">
                    {anchor.source_image}
                  </p>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-[#8b4513]/80 font-sans">
                <span>
                  {anchor.technical_metadata
                    ? `${anchor.technical_metadata.dimensions} · ${anchor.technical_metadata.format}`
                    : 'Пользовательский ресурс'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  className="underline hover:text-[#3d1f0e] cursor-pointer"
                >
                  {isZoomed ? 'Обычный вид' : 'Приблизить'}
                </button>
              </div>
            </div>

            {/* Historical Notice */}
            <div className="p-4 bg-[#f4ece1]/70 border border-[#8b4513]/20 text-sm space-y-1">
              <div className="font-sans text-xs uppercase tracking-wider font-semibold text-[#8b4513]">
                Исторический статус
              </div>
              <p className="text-[#3d1f0e]/90 leading-relaxed">
                {anchor.historical_status}
              </p>
              {anchor.technical_metadata?.variant_note && (
                <p className="text-xs text-[#8b4513]/80 pt-1">
                  Примечание: {anchor.technical_metadata.variant_note}
                </p>
              )}
            </div>

            {/* Color Palette */}
            <div className="p-4 border border-[#8b4513]/20 space-y-3">
              <div className="font-sans text-xs uppercase tracking-wider font-semibold text-[#8b4513]">
                Цветовая палитра и свет
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {anchor.color_palette.hex.map((hex, i) => (
                  <div key={`${hex}-${i}`} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-5 h-5 border border-[#2c1810]/20 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="truncate text-[#3d1f0e]">
                      {anchor.color_palette.labels[i] || hex}
                    </span>
                  </div>
                ))}
              </div>
              {anchor.color_palette.lighting && (
                <p className="text-xs text-[#5d2e0a] italic">
                  Освещение: {anchor.color_palette.lighting}
                </p>
              )}
            </div>
          </div>

          {/* Right: Metadata or Editor */}
          <div className="lg:col-span-7 space-y-6">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Название якоря
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Литературное пространство / регион
                  </label>
                  <input
                    type="text"
                    value={editSpace}
                    onChange={(e) => setEditSpace(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Визуальное описание
                  </label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Атмосфера
                  </label>
                  <input
                    type="text"
                    value={editAtmosphere}
                    onChange={(e) => setEditAtmosphere(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Повествовательный потенциал (по одной строке на мотив)
                  </label>
                  <textarea
                    rows={3}
                    value={editNarrativeText}
                    onChange={(e) => setEditNarrativeText(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                    Руководство по генерации
                  </label>
                  <textarea
                    rows={2}
                    value={editGuidance}
                    onChange={(e) => setEditGuidance(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-[#d2b48c] text-[#2c1810] focus:outline-2 focus:outline-[#8b4513]"
                  />
                </div>

                <div>
                  <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-2">
                    Категории библиотеки
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LIBRARY_CATEGORIES.map((cat) => {
                      const active = editCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className={`px-3 py-1.5 text-xs border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#8b4513] text-[#fdf5e6] border-[#8b4513]'
                              : 'bg-white/60 text-[#3d1f0e] border-[#d2b48c]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#8b4513] text-[#fdf5e6] font-semibold text-sm hover:bg-[#5d2e0a] transition-colors cursor-pointer"
                  >
                    Сохранить изменения
                  </button>
                  {anchor.is_edited && (
                    <button
                      type="button"
                      onClick={() => onResetEdit(anchor.anchor_id)}
                      className="px-4 py-2.5 border border-[#8b4513]/40 text-sm text-[#8b4513] hover:bg-[#8b4513]/10 transition-colors cursor-pointer"
                    >
                      Сбросить к исходным данным каталога
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513]/80">
                    <span>{anchor.source_type}</span>
                    {anchor.literary_space && (
                      <>
                        <span aria-hidden="true" className="mx-2">·</span>
                        <span>Пространство: {anchor.literary_space}</span>
                      </>
                    )}
                    <span aria-hidden="true" className="mx-2">·</span>
                    <span>Уверенность: {anchor.confidence}</span>
                    {anchor.is_edited && (
                      <>
                        <span aria-hidden="true" className="mx-2">·</span>
                        <span>Отредактировано локально</span>
                      </>
                    )}
                  </div>
                  <p className="text-lg leading-relaxed text-[#2c1810]">
                    {anchor.visual_description}
                  </p>
                </div>

                <dl className="divide-y divide-[#8b4513]/15 border-t border-b border-[#8b4513]/15 text-sm">
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Категории
                    </dt>
                    <dd className="sm:col-span-2 text-[#2c1810]">
                      {anchor.library_categories.join(' · ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Композиция
                    </dt>
                    <dd className="sm:col-span-2">
                      {anchor.composition_features.join('; ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Среда и фон
                    </dt>
                    <dd className="sm:col-span-2">
                      {anchor.environment_features.join('; ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Персонажи
                    </dt>
                    <dd className="sm:col-span-2">
                      {anchor.character_features.join('; ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Действия
                    </dt>
                    <dd className="sm:col-span-2">
                      {anchor.action_features.join('; ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Декор и рамка
                    </dt>
                    <dd className="sm:col-span-2">
                      {anchor.decorative_features.join('; ')}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Атмосфера
                    </dt>
                    <dd className="sm:col-span-2 italic text-[#5d2e0a]">
                      {anchor.atmosphere}
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Нарративный потенциал
                    </dt>
                    <dd className="sm:col-span-2">
                      <ul className="list-disc pl-4 space-y-1">
                        {anchor.narrative_potential.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-sans text-xs uppercase tracking-wider text-[#8b4513]">
                      Ориентир генерации
                    </dt>
                    <dd className="sm:col-span-2">{anchor.generation_guidance}</dd>
                  </div>
                </dl>

                {/* Related Anchors */}
                {relatedAnchors.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-sans text-xs uppercase tracking-wider font-semibold text-[#8b4513]">
                      Связанные визуальные якоря
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {relatedAnchors.map((rel) => (
                        <button
                          key={rel.anchor_id}
                          type="button"
                          onClick={() => onSelectAnchor(rel)}
                          className="text-left border border-[#8b4513]/20 bg-[#f4ece1]/60 hover:border-[#8b4513] transition-colors p-2 flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={rel.source_image}
                            alt={rel.anchor_name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover shrink-0 border border-[#d2b48c]"
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] font-sans text-[#8b4513]/80 truncate">
                              {rel.anchor_id}
                            </div>
                            <div className="text-xs font-semibold text-[#3d1f0e] line-clamp-2">
                              {rel.anchor_name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {anchor.is_custom && onRemoveCustom && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveCustom(anchor.anchor_id);
                        onClose();
                      }}
                      className="text-xs text-red-800 underline hover:text-red-950 cursor-pointer"
                    >
                      Удалить пользовательский якорь
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnchorDetailModal;
