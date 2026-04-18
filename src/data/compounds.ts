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
  easy: '유치원~초등 (순한맛)',
  medium: '중학교 (보통맛)',
  hard: '고등학교 (매운맛)',
  mimic: '미믹 (기억력 테스트)',
};

export const DIFFICULTY_EMOJIS: Record<Difficulty, string> = {
  easy: '🌱',
  medium: '🌶️',
  hard: '🔥',
  mimic: '🎭',
};
