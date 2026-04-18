import { create } from 'zustand';
import { type Compound, type Difficulty, getCompoundsByDifficulty, getAvailableElements } from '../data/compounds';

type GamePhase = 'menu' | 'mimic-preview' | 'playing' | 'success' | 'fail' | 'gameover';

interface GameState {
  phase: GamePhase;
  difficulty: Difficulty | null;
  currentCompound: Compound | null;
  remainingCompounds: Compound[];
  availableElements: string[];
  trayElements: string[];
  lives: number;
  score: number;
  stage: number;
  mimicCountdown: number;

  startGame: (difficulty: Difficulty) => void;
  addToTray: (symbol: string) => void;
  removeFromTray: (index: number) => void;
  resetTray: () => void;
  checkAnswer: () => void;
  nextStage: () => void;
  goToMenu: () => void;
  tickMimic: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  difficulty: null,
  currentCompound: null,
  remainingCompounds: [],
  availableElements: [],
  trayElements: [],
  lives: 3,
  score: 0,
  stage: 1,
  mimicCountdown: 3,

  startGame: (difficulty) => {
    const compounds = shuffle(getCompoundsByDifficulty(difficulty));
    const first = compounds[0];
    const available = getAvailableElements(first, difficulty);
    const ismimic = difficulty === 'mimic';

    set({
      phase: ismimic ? 'mimic-preview' : 'playing',
      difficulty,
      currentCompound: first,
      remainingCompounds: compounds.slice(1),
      availableElements: available,
      trayElements: [],
      lives: 3,
      score: 0,
      stage: 1,
      mimicCountdown: 3,
    });
  },

  addToTray: (symbol) => {
    set(s => ({ trayElements: [...s.trayElements, symbol] }));
  },

  removeFromTray: (index) => {
    set(s => {
      const next = [...s.trayElements];
      next.splice(index, 1);
      return { trayElements: next };
    });
  },

  resetTray: () => set({ trayElements: [] }),

  checkAnswer: () => {
    const { currentCompound, trayElements, score, lives } = get();
    if (!currentCompound) return;

    const answer: Record<string, number> = {};
    trayElements.forEach(e => { answer[e] = (answer[e] ?? 0) + 1; });

    const target = currentCompound.elements;
    const keys = new Set([...Object.keys(answer), ...Object.keys(target)]);
    const correct = [...keys].every(k => (answer[k] ?? 0) === (target[k] ?? 0));

    if (correct) {
      set({ phase: 'success', score: score + 100 });
    } else {
      const newLives = lives - 1;
      if (newLives <= 0) {
        set({ lives: 0, phase: 'gameover' });
      } else {
        set({ lives: newLives, phase: 'fail' });
      }
    }
  },

  nextStage: () => {
    const { remainingCompounds, difficulty, stage } = get();
    if (!difficulty) return;

    if (remainingCompounds.length === 0) {
      set({ phase: 'gameover' });
      return;
    }

    const next = remainingCompounds[0];
    const available = getAvailableElements(next, difficulty);
    const ismimic = difficulty === 'mimic';

    set({
      phase: ismimic ? 'mimic-preview' : 'playing',
      currentCompound: next,
      remainingCompounds: remainingCompounds.slice(1),
      availableElements: available,
      trayElements: [],
      stage: stage + 1,
      mimicCountdown: 3,
    });
  },

  goToMenu: () => set({ phase: 'menu' }),

  tickMimic: () => {
    const { mimicCountdown } = get();
    if (mimicCountdown <= 1) {
      set({ phase: 'playing', mimicCountdown: 0 });
    } else {
      set({ mimicCountdown: mimicCountdown - 1 });
    }
  },
}));
