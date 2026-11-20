
export enum EngineStage {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ARCHAIZING = 'ARCHAIZING',
  RHYTHM_MAPPING = 'RHYTHM_MAPPING',
  RHYMING = 'RHYMING',
  STYLIZING = 'STYLIZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface Stanza {
  lines: string[];
}

export interface TransformationResult {
  poem: string;
  moral: string;
  originalText: string;
}

export interface EngineStep {
  id: EngineStage;
  label: string;
  description: string;
}
