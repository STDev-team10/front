export type Difficulty = 'easy' | 'medium' | 'hard' | 'mimic';

export interface Compound {
  id: string;
  name: string;
  formula: string;
  emoji: string;
  description: string;
  elements: Record<string, number>;
  available_elements: string[];
  difficulty: Difficulty;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '초보 (순한맛)',
  medium: '중수 (보통맛)',
  hard: '고수 (매운맛)',
  mimic: '전문가 (기억력 테스트)',
};

export const DIFFICULTY_EMOJIS: Record<Difficulty, string> = {
  easy: '🌱',
  medium: '🌶️',
  hard: '🔥',
  mimic: '🎭',
};
