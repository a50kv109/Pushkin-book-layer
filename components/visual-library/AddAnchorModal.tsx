import React, { useState } from 'react';
import { LibraryCategory, VisualAnchor } from '../../types/visualLibrary';
import { LIBRARY_CATEGORIES } from '../../services/visualLibraryService';

interface Props {
  onAdd: (anchor: VisualAnchor) => void;
  onClose: () => void;
}

const AddAnchorModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [space, setSpace] = useState('Михайловское (или другой регион)');
  const [sourceImage, setSourceImage] = useState('');
  const [description, setDescription] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [environment, setEnvironment] = useState('');
  const [narrative, setNarrative] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<LibraryCategory[]>([
    'Poetry & Literature',
    'Nature & Landscape',
  ]);

  const toggleCat = (cat: LibraryCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const idSuffix = Math.floor(100 + Math.random() * 900);
    const newAnchor: VisualAnchor = {
      anchor_id: `VA-CUSTOM-${idSuffix}`,
      anchor_name: name.trim(),
      anchor_category: 'CUSTOM + EXTENSIBLE',
      library_categories: selectedCategories,
      literary_space: space.trim() || 'Расширяемое пространство',
      source_image: sourceImage.trim() || '/assets/aistudio/______________________________________92dc1232.png',
      source_type: 'Пользовательский ориентир (ручное добавление)',
      visual_description: description.trim(),
      composition_features: ['Пользовательская композиция'],
      environment_features: environment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      character_features: ['Лирический герой или наблюдатель'],
      action_features: ['Художественное созерцание'],
      decorative_features: ['Без фиксированной рамки'],
      color_palette: {
        labels: ['Тёплая бумага', 'Коричневая охра'],
        hex: ['#F4ECE1', '#8B4513'],
        lighting: 'Естественное освещение',
      },
      atmosphere: atmosphere.trim() || 'Созерцательная лирика',
      narrative_potential: narrative
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      generation_guidance:
        'Пользовательский якорь, добавленный для расширения библиотеки за пределы крымского цикла.',
      related_anchors: [],
      motif_keywords: name
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4),
      confidence: 'medium',
      historical_status:
        'Пользовательская запись без претензии на документально-историческую атрибуцию.',
      processing_status: 'IMPLEMENTED',
      is_custom: true,
    };

    onAdd(newAnchor);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1810]/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-anchor-title"
    >
      <div className="bg-[#fdf5e6] border border-[#8b4513]/30 rounded-sm max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-[#2c1810]">
        <div className="flex items-center justify-between border-b border-[#8b4513]/15 pb-4">
          <h2 id="add-anchor-title" className="text-2xl font-classic text-[#3d1f0e]">
            Добавить новый визуальный якорь
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-[#8b4513]/30 hover:bg-[#8b4513]/10 cursor-pointer"
          >
            Закрыть
          </button>
        </div>

        <p className="text-sm text-[#5d2e0a]">
          Архитектура библиотеки позволяет добавлять образы иных литературных пространств и эпох
          (Михайловское, Болдино, Петербург, Кавказ). Новые карточки сохраняются локально в браузере.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                Название якоря *
              </label>
              <input
                type="text"
                required
                placeholder="Осенний парк в Михайловском"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                Литературное пространство
              </label>
              <input
                type="text"
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
              Путь к изображению (опционально)
            </label>
            <input
              type="text"
              placeholder="/assets/aistudio/... или оставьте пустым для образца по умолчанию"
              value={sourceImage}
              onChange={(e) => setSourceImage(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
              Описание сцены *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Опишите композицию, действующих лиц, детали среды..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                Среда (через запятую)
              </label>
              <input
                type="text"
                placeholder="Аллея, золотые клёны, деревянная усадьба"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
              />
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
                Атмосфера
              </label>
              <input
                type="text"
                placeholder="Элегическая осенняя тишина"
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-1">
              Повествовательные мотивы (по строкам)
            </label>
            <textarea
              rows={2}
              placeholder="Прощание с осенью&#10;Уединение за письменным столом"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-[#d2b48c]"
            />
          </div>

          <div>
            <div className="text-xs font-sans uppercase tracking-wider text-[#8b4513] mb-2">
              Категории
            </div>
            <div className="flex flex-wrap gap-2">
              {LIBRARY_CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`px-3 py-1.5 text-xs border cursor-pointer ${
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

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#8b4513]/30 text-sm cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#8b4513] text-[#fdf5e6] text-sm font-semibold hover:bg-[#5d2e0a] cursor-pointer"
            >
              Добавить в библиотеку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnchorModal;
