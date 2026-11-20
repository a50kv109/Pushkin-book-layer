
import React from 'react';
import { EngineStage, EngineStep } from './types';

export const ENGINE_STEPS: EngineStep[] = [
  {
    id: EngineStage.ANALYZING,
    label: "Анализ смыслов",
    description: "Исследование сюжета, тона и персонажей исходного текста."
  },
  {
    id: EngineStage.ARCHAIZING,
    label: "Лексическая замена",
    description: "Трансформация современной лексики в изящные архаизмы XIX века."
  },
  {
    id: EngineStage.RHYTHM_MAPPING,
    label: "Ритмическая сетка",
    description: "Настройка строгого 4-стопного ямба (01 01 01 01)."
  },
  {
    id: EngineStage.RHYMING,
    label: "Подбор рифм",
    description: "Выстраивание перекрестной рифмы по схеме ABAB."
  },
  {
    id: EngineStage.STYLIZING,
    label: "Инъекция стиля",
    description: "Добавление классических оборотов ('О други', 'Внемли')."
  },
  {
    id: EngineStage.COMPLETED,
    label: "Формирование морали",
    description: "Создание обязательного философского вывода."
  }
];

export const QuillIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14.1 6a2 2 0 0 1 2.82 2.82l-10.15 10.15L2 22l3.03-4.77L15.18 7.08q.27-.26.54-.54a2 2 0 0 1 .55-.54" />
    <path d="m9 11 3 3" />
    <path d="m5 18 2 1" />
  </svg>
);

export const InkwellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2h2v4h-2z" />
    <path d="M8 6h8a2 2 0 0 1 2 2v10a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8a2 2 0 0 1 2-2z" />
    <path d="M12 10v6" />
    <path d="M9 13h6" />
  </svg>
);
