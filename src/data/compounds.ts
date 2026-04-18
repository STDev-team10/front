export type Difficulty = 'easy' | 'normal' | 'hard' | 'mimic';

export interface Compound {
  id: string;
  name: string;
  formula: string;
  emoji: string;
  description: string;
  elements: Record<string, number>;
  difficulty: Difficulty;
}

export const COMPOUNDS: Compound[] = [
  // Easy
  {
    id: 'water',
    name: '물',
    formula: 'H₂O',
    emoji: '💧',
    description: '생명의 근원! 수소 두 개와 산소 하나의 완벽한 만남!',
    elements: { H: 2, O: 1 },
    difficulty: 'easy',
  },
  {
    id: 'salt',
    name: '소금',
    formula: 'NaCl',
    emoji: '🧂',
    description: '짠맛의 주인공! 나트륨과 염소의 환상 조합!',
    elements: { Na: 1, Cl: 1 },
    difficulty: 'easy',
  },
  {
    id: 'co2',
    name: '이산화탄소',
    formula: 'CO₂',
    emoji: '🫧',
    description: '탄산음료의 비밀! 탄소 하나에 산소 두 개!',
    elements: { C: 1, O: 2 },
    difficulty: 'easy',
  },
  {
    id: 'o2',
    name: '산소',
    formula: 'O₂',
    emoji: '🌬️',
    description: '숨쉬기의 필수템! 산소 두 개가 손을 잡았어요!',
    elements: { O: 2 },
    difficulty: 'easy',
  },
  {
    id: 'h2',
    name: '수소 기체',
    formula: 'H₂',
    emoji: '⚡',
    description: '가장 가벼운 기체! 수소 둘이 꼭 붙어 있어요!',
    elements: { H: 2 },
    difficulty: 'easy',
  },
  // Normal
  {
    id: 'ammonia',
    name: '암모니아',
    formula: 'NH₃',
    emoji: '🧪',
    description: '코를 찌르는 냄새! 질소 하나와 수소 세 개의 만남!',
    elements: { N: 1, H: 3 },
    difficulty: 'normal',
  },
  {
    id: 'hcl',
    name: '염화수소',
    formula: 'HCl',
    emoji: '⚗️',
    description: '강한 산! 수소와 염소가 하나씩 만났어요!',
    elements: { H: 1, Cl: 1 },
    difficulty: 'normal',
  },
  {
    id: 'h2s',
    name: '황화수소',
    formula: 'H₂S',
    emoji: '🥚',
    description: '계란 썩는 냄새! 수소 둘과 황 하나!',
    elements: { H: 2, S: 1 },
    difficulty: 'normal',
  },
  {
    id: 'so2',
    name: '이산화황',
    formula: 'SO₂',
    emoji: '🌋',
    description: '화산에서 나와요! 황 하나와 산소 두 개!',
    elements: { S: 1, O: 2 },
    difficulty: 'normal',
  },
  {
    id: 'no2',
    name: '이산화질소',
    formula: 'NO₂',
    emoji: '🏭',
    description: '갈색 스모그의 원인! 질소 하나, 산소 두 개!',
    elements: { N: 1, O: 2 },
    difficulty: 'normal',
  },
  // Hard
  {
    id: 'naoh',
    name: '수산화나트륨',
    formula: 'NaOH',
    emoji: '🧼',
    description: '강한 염기! 비누 만들 때 필요한 나트륨+산소+수소!',
    elements: { Na: 1, O: 1, H: 1 },
    difficulty: 'hard',
  },
  {
    id: 'h2so4',
    name: '황산',
    formula: 'H₂SO₄',
    emoji: '🔋',
    description: '배터리의 핵심! 수소 둘, 황 하나, 산소 넷!',
    elements: { H: 2, S: 1, O: 4 },
    difficulty: 'hard',
  },
  {
    id: 'hno3',
    name: '질산',
    formula: 'HNO₃',
    emoji: '💥',
    description: '폭발물의 재료! 수소, 질소, 산소 세 개!',
    elements: { H: 1, N: 1, O: 3 },
    difficulty: 'hard',
  },
  {
    id: 'cacl2',
    name: '염화칼슘',
    formula: 'CaCl₂',
    emoji: '🧊',
    description: '제설제! 칼슘 하나에 염소 두 개!',
    elements: { Ca: 1, Cl: 2 },
    difficulty: 'hard',
  },
  {
    id: 'mgso4',
    name: '황산마그네슘',
    formula: 'MgSO₄',
    emoji: '🛁',
    description: '입욕제 엡솜 솔트! 마그네슘, 황, 산소 넷!',
    elements: { Mg: 1, S: 1, O: 4 },
    difficulty: 'hard',
  },
  // Mimic (same compounds but player sees formula briefly)
  {
    id: 'mimic_water',
    name: '물',
    formula: 'H₂O',
    emoji: '💧',
    description: '기억력 테스트! 방금 본 식을 떠올려봐요!',
    elements: { H: 2, O: 1 },
    difficulty: 'mimic',
  },
  {
    id: 'mimic_salt',
    name: '소금',
    formula: 'NaCl',
    emoji: '🧂',
    description: '기억력 테스트! 방금 본 식을 떠올려봐요!',
    elements: { Na: 1, Cl: 1 },
    difficulty: 'mimic',
  },
  {
    id: 'mimic_ammonia',
    name: '암모니아',
    formula: 'NH₃',
    emoji: '🧪',
    description: '기억력 테스트! 방금 본 식을 떠올려봐요!',
    elements: { N: 1, H: 3 },
    difficulty: 'mimic',
  },
  {
    id: 'mimic_so2',
    name: '이산화황',
    formula: 'SO₂',
    emoji: '🌋',
    description: '기억력 테스트! 방금 본 식을 떠올려봐요!',
    elements: { S: 1, O: 2 },
    difficulty: 'mimic',
  },
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '유치원~초등 (순한맛)',
  normal: '중학교 (보통맛)',
  hard: '고등학교 (매운맛)',
  mimic: '미믹 (기억력 테스트)',
};

export const DIFFICULTY_EMOJIS: Record<Difficulty, string> = {
  easy: '🌱',
  normal: '🌶️',
  hard: '🔥',
  mimic: '🎭',
};

export function getCompoundsByDifficulty(difficulty: Difficulty): Compound[] {
  return COMPOUNDS.filter(c => c.difficulty === difficulty);
}

export function getAvailableElements(compound: Compound, difficulty: Difficulty): string[] {
  const needed = Object.keys(compound.elements);
  const allElements = ['H', 'O', 'C', 'Na', 'Cl', 'N', 'S', 'P', 'Fe', 'Ca', 'K', 'Mg'];

  const pool = new Set(needed);

  const distractorCount = difficulty === 'easy' ? 4 : difficulty === 'normal' ? 5 : 6;
  const distractors = allElements.filter(e => !pool.has(e));

  const shuffled = distractors.sort(() => Math.random() - 0.5).slice(0, distractorCount);
  shuffled.forEach(e => pool.add(e));

  return Array.from(pool).sort(() => Math.random() - 0.5);
}
