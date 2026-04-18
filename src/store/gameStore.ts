import { create } from 'zustand';
import { fetchCompounds } from '../api/compounds';
import { type Compound, type Difficulty } from '../data/compounds';

export type GamePhase =
  | 'auth-landing' | 'auth-login' | 'auth-signup'
  | 'menu' | 'dogan'
  | 'mimic-preview' | 'playing' | 'success' | 'fail' | 'gameover';

export interface User {
  name: string;
  token?: string;
  isGuest: boolean;
}

function loadSession(): User | null {
  try {
    const raw = JSON.parse(localStorage.getItem('chem-session') ?? 'null');
    if (!raw || typeof raw.name !== 'string' || typeof raw.isGuest !== 'boolean') {
      return null;
    }

    return {
      name: raw.name,
      token: typeof raw.token === 'string' ? raw.token : undefined,
      isGuest: raw.isGuest,
    };
  } catch {
    return null;
  }
}
function saveSession(user: User | null) {
  localStorage.setItem('chem-session', JSON.stringify(user));
}

// --- unlocked compounds ---
function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem('chem-unlocked');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveUnlocked(ids: Set<string>) {
  localStorage.setItem('chem-unlocked', JSON.stringify([...ids]));
}

interface GameState {
  phase: GamePhase;
  user: User | null;
  authError: string;
  authPending: boolean;
  compounds: Compound[];
  compoundsTotal: number;
  compoundsPending: boolean;
  compoundsError: string;

  difficulty: Difficulty | null;
  currentCompound: Compound | null;
  remainingCompounds: Compound[];
  availableElements: string[];
  trayElements: string[];
  lives: number;
  score: number;
  stage: number;
  mimicCountdown: number;
  unlockedIds: Set<string>;

  // auth
  goToLogin: () => void;
  goToSignup: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  loadCompounds: (difficulty?: Difficulty) => Promise<Compound[]>;

  // game
  startGame: (difficulty: Difficulty) => Promise<void>;
  addToTray: (symbol: string) => void;
  removeFromTray: (index: number) => void;
  resetTray: () => void;
  checkAnswer: () => void;
  nextStage: () => void;
  goToMenu: () => void;
  openDogan: () => void;
  tickMimic: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const savedSession = loadSession();
interface AuthResponse {
  token: string;
  username: string;
}

async function requestAuth(path: 'login' | 'signup', username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = '인증 요청에 실패했어요. 잠시 후 다시 시도해주세요.';

    try {
      const data = await response.json();
      if (data?.detail) {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0 && typeof data.detail[0]?.msg === 'string') {
          message = data.detail[0].msg;
        }
      }
    } catch {
      // keep default message when the response body is not JSON
    }

    throw new Error(message);
  }

  return response.json() as Promise<AuthResponse>;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: savedSession ? 'menu' : 'auth-landing',
  user: savedSession,
  authError: '',
  authPending: false,
  compounds: [],
  compoundsTotal: 0,
  compoundsPending: false,
  compoundsError: '',

  difficulty: null,
  currentCompound: null,
  remainingCompounds: [],
  availableElements: [],
  trayElements: [],
  lives: 3,
  score: 0,
  stage: 1,
  mimicCountdown: 3,
  unlockedIds: loadUnlocked(),

  goToLogin: () => set({ phase: 'auth-login', authError: '' }),
  goToSignup: () => set({ phase: 'auth-signup', authError: '' }),

  login: async (username, password) => {
    set({ authPending: true, authError: '' });

    try {
      const data = await requestAuth('login', username, password);
      const user: User = { name: data.username, token: data.token, isGuest: false };
      saveSession(user);
      set({ user, phase: 'menu', authError: '', authPending: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했어요.';
      set({ authError: message, authPending: false });
    }
  },

  signup: async (username, password) => {
    set({ authPending: true, authError: '' });

    try {
      const data = await requestAuth('signup', username, password);
      const user: User = { name: data.username, token: data.token, isGuest: false };
      saveSession(user);
      set({ user, phase: 'menu', authError: '', authPending: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했어요.';
      set({ authError: message, authPending: false });
    }
  },

  loginAsGuest: () => {
    const user: User = { name: '게스트', isGuest: true };
    set({ user, phase: 'menu', authError: '', authPending: false });
  },

  logout: () => {
    saveSession(null);
    set({ user: null, phase: 'auth-landing', authError: '', authPending: false });
  },

  loadCompounds: async (difficulty) => {
    set({ compoundsPending: true, compoundsError: '' });

    try {
      const data = await fetchCompounds(difficulty);
      set({
        compounds: difficulty ? get().compounds : data.items,
        compoundsTotal: difficulty ? get().compoundsTotal : data.total,
        compoundsPending: false,
        compoundsError: '',
      });
      return data.items;
    } catch (error) {
      const message = error instanceof Error ? error.message : '화합물 목록을 불러오지 못했어요.';
      set({ compoundsPending: false, compoundsError: message });
      return [];
    }
  },

  startGame: async (difficulty) => {
    set({ compoundsPending: true, compoundsError: '' });

    const data = await fetchCompounds(difficulty).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '문제 목록을 불러오지 못했어요.';
      set({ compoundsPending: false, compoundsError: message });
      return null;
    });

    if (!data || data.items.length === 0) {
      if (data && data.items.length === 0) {
        set({ compoundsPending: false, compoundsError: '선택한 난이도에 등록된 화합물이 없어요.' });
      }
      return;
    }

    const compounds = shuffle(data.items);
    const first = compounds[0];
    set({
      compoundsPending: false,
      compoundsError: '',
      phase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
      difficulty,
      currentCompound: first,
      remainingCompounds: compounds.slice(1),
      availableElements: first.available_elements,
      trayElements: [],
      lives: 3,
      score: 0,
      stage: 1,
      mimicCountdown: 3,
    });
  },

  addToTray: (symbol) => set(s => ({ trayElements: [...s.trayElements, symbol] })),

  removeFromTray: (index) => set(s => {
    const next = [...s.trayElements];
    next.splice(index, 1);
    return { trayElements: next };
  }),

  resetTray: () => set({ trayElements: [] }),

  checkAnswer: () => {
    const { currentCompound, trayElements, score, lives, unlockedIds } = get();
    if (!currentCompound) return;

    const answer: Record<string, number> = {};
    trayElements.forEach(e => { answer[e] = (answer[e] ?? 0) + 1; });

    const target = currentCompound.elements;
    const keys = new Set([...Object.keys(answer), ...Object.keys(target)]);
    const correct = [...keys].every(k => (answer[k] ?? 0) === (target[k] ?? 0));

    if (correct) {
      const next = new Set(unlockedIds);
      next.add(currentCompound.id);
      saveUnlocked(next);
      set({ phase: 'success', score: score + 100, unlockedIds: next });
    } else {
      const newLives = lives - 1;
      set(newLives <= 0 ? { lives: 0, phase: 'gameover' } : { lives: newLives, phase: 'fail' });
    }
  },

  nextStage: () => {
    const { remainingCompounds, difficulty, stage } = get();
    if (!difficulty) return;
    if (remainingCompounds.length === 0) { set({ phase: 'gameover' }); return; }

    const next = remainingCompounds[0];
    set({
      phase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
      currentCompound: next,
      remainingCompounds: remainingCompounds.slice(1),
      availableElements: next.available_elements,
      trayElements: [],
      stage: stage + 1,
      mimicCountdown: 3,
    });
  },

  goToMenu: () => set({ phase: 'menu' }),
  openDogan: () => set({ phase: 'dogan' }),

  tickMimic: () => {
    const { mimicCountdown } = get();
    set(mimicCountdown <= 1
      ? { phase: 'playing', mimicCountdown: 0 }
      : { mimicCountdown: mimicCountdown - 1 });
  },
}));
