export type LibraryCategory =
  | 'Crimea & Tavrida'
  | 'Yalta'
  | 'Bakhchisarai'
  | 'Architecture'
  | 'Nature & Landscape'
  | 'Characters'
  | 'Romantic Scenes'
  | 'Journey'
  | 'Poetry & Literature'
  | 'Decorative Design'
  | 'Postcard Composition';

export type ProcessingStatus =
  | 'VERIFIED'
  | 'IMPLEMENTED'
  | 'REPORTED'
  | 'PLANNED'
  | 'UNSUPPORTED';

export interface ColorPalette {
  labels: string[];
  hex: string[];
  lighting?: string;
}

export interface TechnicalMetadata {
  dimensions: string;
  format: string;
  variant_note?: string;
}

export interface VisualAnchor {
  anchor_id: string;
  anchor_name: string;
  anchor_category: string;
  library_categories: LibraryCategory[];
  literary_space?: string;
  source_image: string;
  source_type: string;
  visual_description: string;
  composition_features: string[];
  environment_features: string[];
  character_features: string[];
  action_features: string[];
  decorative_features: string[];
  color_palette: ColorPalette;
  atmosphere: string;
  narrative_potential: string[];
  generation_guidance: string;
  related_anchors: string[];
  motif_keywords?: string[];
  confidence: 'high' | 'medium' | 'low';
  historical_status: string;
  processing_status: ProcessingStatus;
  technical_metadata?: TechnicalMetadata;
  is_custom?: boolean;
  is_edited?: boolean;
}

export interface NarrativePattern {
  pattern_id: string;
  title: string;
  formula: string;
  visual_elements: string[];
  literary_themes: string[];
  emotional_register: string;
  sample_angles: string[];
  compatible_anchors: string[];
  historical_note: string;
}

export type LibraryMode =
  | 'GALLERY'
  | 'MODE_1_VISUAL_GENERATION'
  | 'MODE_2_POEM_ILLUSTRATION'
  | 'MODE_3_NARRATIVE_INSPIRATION';

export interface PoemMatchResult {
  anchor: VisualAnchor;
  score: number;
  matchedKeywords: string[];
  matchedThemes: string[];
}

export interface VisualGenerationBrief {
  request: string;
  selectedAnchors: VisualAnchor[];
  compositionSummary: string[];
  environmentSummary: string[];
  characterSummary: string[];
  actionSummary: string[];
  decorativeSummary: string[];
  paletteSummary: string[];
  atmosphereSummary: string[];
  synthesizedPrompt: string;
  historicalDisclaimer: string;
}
