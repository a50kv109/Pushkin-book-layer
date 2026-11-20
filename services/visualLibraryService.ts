import rawAnchors from '../data/visual-library/visual-anchors.json';
import rawNarrativePatterns from '../data/visual-library/narrative-patterns.json';
import {
  LibraryCategory,
  NarrativePattern,
  PoemMatchResult,
  VisualAnchor,
  VisualGenerationBrief,
} from '../types/visualLibrary';
import { TransformationResult } from '../types';
import { transformText } from './geminiService';

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  'Crimea & Tavrida',
  'Yalta',
  'Bakhchisarai',
  'Architecture',
  'Nature & Landscape',
  'Characters',
  'Romantic Scenes',
  'Journey',
  'Poetry & Literature',
  'Decorative Design',
  'Postcard Composition',
];

const EDITS_STORAGE_KEY = 'pushkin_vl_edits_v1';
const CUSTOM_STORAGE_KEY = 'pushkin_vl_custom_v1';

export type AnchorEditFields = Partial<
  Pick<
    VisualAnchor,
    | 'anchor_name'
    | 'visual_description'
    | 'atmosphere'
    | 'generation_guidance'
    | 'narrative_potential'
    | 'library_categories'
    | 'literary_space'
  >
>;

function safeReadStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors
  }
}

export function getBaseAnchors(): VisualAnchor[] {
  return rawAnchors as VisualAnchor[];
}

export function getNarrativePatterns(): NarrativePattern[] {
  return rawNarrativePatterns as NarrativePattern[];
}

export function loadAllAnchors(): VisualAnchor[] {
  const base = getBaseAnchors();
  const edits = safeReadStorage<Record<string, AnchorEditFields>>(EDITS_STORAGE_KEY, {});
  const custom = safeReadStorage<VisualAnchor[]>(CUSTOM_STORAGE_KEY, []);

  const mergedBase = base.map((anchor) => {
    const patch = edits[anchor.anchor_id];
    if (!patch) return anchor;
    return {
      ...anchor,
      ...patch,
      is_edited: true,
    };
  });

  const mergedCustom = custom.map((anchor) => {
    const patch = edits[anchor.anchor_id];
    return patch ? { ...anchor, ...patch, is_edited: true } : anchor;
  });

  return [...mergedBase, ...mergedCustom];
}

export function saveAnchorEdit(anchorId: string, patch: AnchorEditFields): VisualAnchor[] {
  const edits = safeReadStorage<Record<string, AnchorEditFields>>(EDITS_STORAGE_KEY, {});
  edits[anchorId] = { ...(edits[anchorId] || {}), ...patch };
  safeWriteStorage(EDITS_STORAGE_KEY, edits);
  return loadAllAnchors();
}

export function resetAnchorEdit(anchorId: string): VisualAnchor[] {
  const edits = safeReadStorage<Record<string, AnchorEditFields>>(EDITS_STORAGE_KEY, {});
  delete edits[anchorId];
  safeWriteStorage(EDITS_STORAGE_KEY, edits);
  return loadAllAnchors();
}

export function addCustomAnchor(anchor: VisualAnchor): VisualAnchor[] {
  const custom = safeReadStorage<VisualAnchor[]>(CUSTOM_STORAGE_KEY, []);
  const next = [...custom, { ...anchor, is_custom: true }];
  safeWriteStorage(CUSTOM_STORAGE_KEY, next);
  return loadAllAnchors();
}

export function removeCustomAnchor(anchorId: string): VisualAnchor[] {
  const custom = safeReadStorage<VisualAnchor[]>(CUSTOM_STORAGE_KEY, []);
  const next = custom.filter((item) => item.anchor_id !== anchorId);
  safeWriteStorage(CUSTOM_STORAGE_KEY, next);
  return loadAllAnchors();
}

export function filterAnchors(
  anchors: VisualAnchor[],
  category: LibraryCategory | 'ALL',
  searchQuery: string
): VisualAnchor[] {
  const q = searchQuery.trim().toLowerCase();
  return anchors.filter((anchor) => {
    const categoryMatch =
      category === 'ALL' || anchor.library_categories.includes(category);
    if (!categoryMatch) return false;
    if (!q) return true;

    const haystack = [
      anchor.anchor_id,
      anchor.anchor_name,
      anchor.literary_space || '',
      anchor.visual_description,
      anchor.atmosphere,
      ...anchor.environment_features,
      ...anchor.character_features,
      ...anchor.action_features,
      ...anchor.decorative_features,
      ...anchor.narrative_potential,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function getRelatedAnchors(
  anchor: VisualAnchor,
  allAnchors: VisualAnchor[]
): VisualAnchor[] {
  const map = new Map(allAnchors.map((item) => [item.anchor_id, item]));
  return anchor.related_anchors
    .map((id) => map.get(id))
    .filter((item): item is VisualAnchor => Boolean(item));
}

export function getCompatibleNarrativePatterns(
  anchorIds: string[]
): NarrativePattern[] {
  const all = getNarrativePatterns();
  if (anchorIds.length === 0) return all;
  const idSet = new Set(anchorIds);
  const matching = all.filter((p) =>
    p.compatible_anchors.some((id) => idSet.has(id))
  );
  return matching.length > 0 ? matching : all;
}

function uniqueItems(items: string[], limit = 10): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const clean = item.trim();
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      result.push(clean);
    }
    if (result.length >= limit) break;
  }
  return result;
}

/**
 * MODE 1 — VISUAL GENERATION
 * Synthesizes a structured visual/postcard composition brief from selected anchors.
 */
export function buildVisualGenerationBrief(
  userRequest: string,
  selectedAnchors: VisualAnchor[]
): VisualGenerationBrief {
  const request =
    userRequest.trim() || 'Поэтическая открытка или иллюстрация в классическом стиле XIX века';

  const compositionSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.composition_features),
    6
  );
  const environmentSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.environment_features),
    6
  );
  const characterSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.character_features),
    5
  );
  const actionSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.action_features),
    5
  );
  const decorativeSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.decorative_features),
    6
  );
  const paletteSummary = uniqueItems(
    selectedAnchors.flatMap((a) => a.color_palette.labels),
    6
  );
  const atmosphereSummary = uniqueItems(
    selectedAnchors.map((a) => a.atmosphere),
    4
  );

  const promptParts = [
    `Художественное задание: ${request}.`,
    compositionSummary.length > 0
      ? `Композиция: ${compositionSummary.join('; ')}.`
      : '',
    environmentSummary.length > 0
      ? `Пространство и фон: ${environmentSummary.join('; ')}.`
      : '',
    characterSummary.length > 0
      ? `Персонажи (художественные архетипы): ${characterSummary.join('; ')}.`
      : '',
    actionSummary.length > 0
      ? `Действие и настроение сцены: ${actionSummary.join('; ')}.`
      : '',
    decorativeSummary.length > 0
      ? `Декор и обрамление: ${decorativeSummary.join('; ')}.`
      : '',
    paletteSummary.length > 0
      ? `Цветовая палитра: ${paletteSummary.join(', ')}.`
      : '',
    atmosphereSummary.length > 0
      ? `Атмосфера: ${atmosphereSummary.join('; ')}.`
      : '',
    'Примечание: художественная стилизация эпохи романтизма (не документальная реконструкция).',
  ].filter(Boolean);

  return {
    request,
    selectedAnchors,
    compositionSummary,
    environmentSummary,
    characterSummary,
    actionSummary,
    decorativeSummary,
    paletteSummary,
    atmosphereSummary,
    synthesizedPrompt: promptParts.join('\n'),
    historicalDisclaimer:
      'Сгенерированный бриф основан на стилизованных художественных паттернах из библиотеки и не является историческим документом.',
  };
}

/**
 * MODE 2 — POEM ILLUSTRATION
 * Deterministic lexical motif matching between a poem and Visual Anchors.
 * Does not fabricate AI confidence; transparently reports matched tokens.
 */
export function matchPoemToAnchors(
  poemText: string,
  allAnchors: VisualAnchor[],
  limit = 6
): PoemMatchResult[] {
  const normalized = poemText.toLowerCase();
  if (!normalized.trim()) return [];

  const results: PoemMatchResult[] = allAnchors.map((anchor) => {
    const keywords = anchor.motif_keywords || [];
    const matchedKeywords: string[] = [];

    for (const kw of keywords) {
      if (kw && normalized.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      }
    }

    const matchedThemes: string[] = [];
    for (const theme of anchor.narrative_potential) {
      const themeWords = theme
        .toLowerCase()
        .split(/[\s,.;:()]+/)
        .filter((w) => w.length >= 5);
      if (themeWords.some((w) => normalized.includes(w.slice(0, 5)))) {
        matchedThemes.push(theme);
      }
    }

    // Also lightly check literary space tokens
    let spaceBonus = 0;
    if (anchor.literary_space) {
      const spaceTokens = anchor.literary_space
        .toLowerCase()
        .split(/[\s—,-]+/)
        .filter((w) => w.length >= 4);
      for (const st of spaceTokens) {
        if (normalized.includes(st.slice(0, 4))) {
          spaceBonus += 1;
        }
      }
    }

    const score = matchedKeywords.length * 2 + matchedThemes.length * 2 + spaceBonus;

    return {
      anchor,
      score,
      matchedKeywords,
      matchedThemes,
    };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * MODE 3 — NARRATIVE INSPIRATION
 * Builds an enriched input context from selected anchors & narrative patterns
 * and passes it to the untouched transformText() function.
 */
export function buildNarrativeInspirationContext(
  userTopic: string,
  selectedAnchors: VisualAnchor[],
  selectedPatterns: NarrativePattern[]
): string {
  const baseTopic = userTopic.trim();
  if (selectedAnchors.length === 0 && selectedPatterns.length === 0) {
    return baseTopic;
  }

  const anchorLines = selectedAnchors.map(
    (a) =>
      `- ${a.anchor_name}: ${a.environment_features.slice(0, 2).join(', ')}; настроение: ${a.atmosphere}; возможные мотивы: ${a.narrative_potential.slice(0, 2).join(', ')}`
  );

  const patternLines = selectedPatterns.map(
    (p) => `- ${p.title} (${p.formula}): ${p.literary_themes.slice(0, 3).join(', ')}`
  );

  const blocks = [
    baseTopic,
    '',
    'Художественные ориентиры для вдохновения (не ограничивают сюжет жестко, служат образным фоном):',
    ...anchorLines,
    ...(patternLines.length > 0 ? ['Повествовательные связи:', ...patternLines] : []),
  ];

  return blocks.join('\n').trim();
}

export async function transformTextWithVisualContext(
  userText: string,
  selectedAnchors: VisualAnchor[],
  selectedPatterns: NarrativePattern[] = []
): Promise<TransformationResult> {
  const composedPromptText = buildNarrativeInspirationContext(
    userText,
    selectedAnchors,
    selectedPatterns
  );
  const result = await transformText(composedPromptText);
  return {
    ...result,
    originalText: userText,
  };
}
