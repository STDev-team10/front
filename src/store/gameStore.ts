import { create } from 'zustand';
import { saveEarnedPoints } from '../api/auth';
import {
  fetchCompounds,
  fetchMyTimeAttackBest,
  fetchTimeAttackRanking,
  fetchUnlockedCompoundIds,
  normalizeCompound,
  saveTimeAttackRecord,
  type TimeAttackRankingEntry,
  type TimeAttackRecordResponse,
  unlockCompound,
} from '../api/compounds';
import { unlockHallOfFameItem } from '../api/hallOfFame';
import { type Compound, type Difficulty } from '../data/compounds';

export type GamePhase =
  | 'auth-landing' | 'auth-login' | 'auth-signup'
  | 'mode-menu' | 'hall-of-fame' | 'menu' | 'dogan'
  | 'mimic-preview' | 'playing' | 'success' | 'fail' | 'gameover';

export interface User {
  name: string;
  token?: string;
  isGuest: boolean;
  points: number;
}

export type PlayMode = 'normal' | 'hardcore' | 'sandbox';

const DEFAULT_LIVES = 3;
const HARDCORE_LIVES = 1;
const DEFAULT_STAGE_SCORE = 100;
const HARDCORE_STAGE_SCORE = 150;
const STAGE_LIMITS: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
  mimic: 20,
};

type DoganReturnPhase = Exclude<GamePhase, 'dogan'>;

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
      points: typeof raw.points === 'number' ? raw.points : 0,
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
    const raw = localStorage.getItem('chem-unlocked-guest');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveUnlocked(ids: Set<string>) {
  localStorage.setItem('chem-unlocked-guest', JSON.stringify([...ids]));
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
  playMode: PlayMode;
  doganReturnPhase: DoganReturnPhase;

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
  timeAttackStartedAt: number | null;
  latestClearTimeMs: number | null;
  latestTimeAttackRecord: TimeAttackRecordResponse | null;
  timeAttackRanking: TimeAttackRankingEntry[];
  myTimeAttackBest: TimeAttackRankingEntry | null;
  timeAttackPending: boolean;
  timeAttackError: string;
  newHallOfFameDiscovery: boolean;

  clearHallOfFameDiscovery: () => void;

  // auth
  goToLogin: () => void;
  goToSignup: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  loadCompounds: (difficulty?: Difficulty) => Promise<Compound[]>;
  goToModeMenu: () => void;
  goToHallOfFame: () => void;
  goToLevelMenu: () => void;
  selectPlayMode: (mode: PlayMode) => void;
  startSandbox: () => Promise<void>;

  // game
  startGame: (difficulty: Difficulty) => Promise<void>;
  addToTray: (symbol: string) => void;
  removeFromTray: (index: number) => void;
  resetTray: () => void;
  checkAnswer: () => void;
  dismissResult: () => void;
  nextStage: () => void;
  goToMenu: () => void;
  openDogan: () => void;
  closeDogan: () => void;
  tickMimic: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getSandboxElements(compounds: Compound[]) {
  const seen = new Set<string>();
  const elements: string[] = [];

  compounds.forEach(compound => {
    normalizeCompound(compound).available_elements.forEach(symbol => {
      if (seen.has(symbol)) return;
      seen.add(symbol);
      elements.push(symbol);
    });
  });

  return elements;
}

function matchesCompound(compound: Compound, answer: Record<string, number>) {
  const target = compound.elements;
  const keys = new Set([...Object.keys(answer), ...Object.keys(target)]);
  return [...keys].every(key => (answer[key] ?? 0) === (target[key] ?? 0));
}

const savedSession = loadSession();
interface AuthResponse {
  token: string;
  username: string;
  points?: number;
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

async function syncUnlockedIds(token?: string): Promise<Set<string>> {
  if (!token) {
    return loadUnlocked();
  }

  return new Set(await fetchUnlockedCompoundIds(token));
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: savedSession ? 'mode-menu' : 'auth-landing',
  user: savedSession,
  authError: '',
  authPending: false,
  compounds: [],
  compoundsTotal: 0,
  compoundsPending: false,
  compoundsError: '',
  playMode: 'normal',
  doganReturnPhase: 'menu',

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
  timeAttackStartedAt: null,
  latestClearTimeMs: null,
  latestTimeAttackRecord: null,
  timeAttackRanking: [],
  myTimeAttackBest: null,
  timeAttackPending: false,
  timeAttackError: '',
  newHallOfFameDiscovery: false,

  clearHallOfFameDiscovery: () => set({ newHallOfFameDiscovery: false }),

  goToLogin: () => set({ phase: 'auth-login', authError: '' }),
  goToSignup: () => set({ phase: 'auth-signup', authError: '' }),

  login: async (username, password) => {
    set({ authPending: true, authError: '' });

    try {
      const data = await requestAuth('login', username, password);
      const user: User = { name: data.username, token: data.token, isGuest: false, points: data.points ?? 0 };
      const unlockedIds = await syncUnlockedIds(data.token);
      saveSession(user);
      set({ user, unlockedIds, phase: 'mode-menu', authError: '', authPending: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했어요.';
      set({ authError: message, authPending: false });
    }
  },

  signup: async (username, password) => {
    set({ authPending: true, authError: '' });

    try {
      const data = await requestAuth('signup', username, password);
      const user: User = { name: data.username, token: data.token, isGuest: false, points: data.points ?? 0 };
      const unlockedIds = await syncUnlockedIds(data.token);
      saveSession(user);
      set({ user, unlockedIds, phase: 'mode-menu', authError: '', authPending: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했어요.';
      set({ authError: message, authPending: false });
    }
  },

  loginAsGuest: () => {
    const user: User = { name: '게스트', isGuest: true, points: 0 };
    saveSession(user);
    set({
      user,
      phase: 'mode-menu',
      authError: '',
      authPending: false,
      latestClearTimeMs: null,
      latestTimeAttackRecord: null,
      timeAttackRanking: [],
      myTimeAttackBest: null,
      timeAttackPending: false,
      timeAttackError: '',
    });
  },

  logout: () => {
    saveSession(null);
    set({
      user: null,
      unlockedIds: loadUnlocked(),
      phase: 'auth-landing',
      authError: '',
      authPending: false,
      doganReturnPhase: 'menu',
      timeAttackStartedAt: null,
      latestClearTimeMs: null,
      latestTimeAttackRecord: null,
      timeAttackRanking: [],
      myTimeAttackBest: null,
      timeAttackPending: false,
      timeAttackError: '',
    });
  },

  loadCompounds: async (difficulty) => {
    set({ compoundsPending: true, compoundsError: '' });

    try {
      const unlockedIds = await syncUnlockedIds(get().user?.token);
      const data = await fetchCompounds(difficulty);
      set({
        unlockedIds,
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

  goToModeMenu: () => set({ phase: 'mode-menu', doganReturnPhase: 'mode-menu' }),
  goToHallOfFame: () => set({ phase: 'hall-of-fame', doganReturnPhase: 'hall-of-fame' }),
  goToLevelMenu: () => set({ phase: 'menu', doganReturnPhase: 'menu' }),
  selectPlayMode: (playMode) => set({ playMode, phase: 'menu', doganReturnPhase: 'menu' }),

  startSandbox: async () => {
    set({ compoundsPending: true, compoundsError: '' });

    const unlockedIds = await syncUnlockedIds(get().user?.token).catch(() => get().unlockedIds);
    const existingCompounds = get().compounds;
    const items = existingCompounds.length > 0 ? existingCompounds : await fetchCompounds().then(data => data.items).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '샌드박스 데이터를 불러오지 못했어요.';
      set({ compoundsPending: false, compoundsError: message });
      return [];
    });

    if (items.length === 0) {
      return;
    }

    set({
      compounds: existingCompounds.length > 0 ? existingCompounds : items,
      compoundsTotal: existingCompounds.length > 0 ? get().compoundsTotal : items.length,
      compoundsPending: false,
      compoundsError: '',
      phase: 'playing',
      playMode: 'sandbox',
      difficulty: null,
      currentCompound: null,
      remainingCompounds: [],
      availableElements: getSandboxElements(items),
      trayElements: [],
      lives: 0,
      score: 0,
      stage: 0,
      mimicCountdown: 0,
      unlockedIds,
      timeAttackStartedAt: null,
      latestClearTimeMs: null,
      latestTimeAttackRecord: null,
      timeAttackRanking: [],
      myTimeAttackBest: null,
      timeAttackPending: false,
      timeAttackError: '',
      doganReturnPhase: 'playing',
    });
  },

  startGame: async (difficulty) => {
    set({ compoundsPending: true, compoundsError: '' });

    const unlockedIds = await syncUnlockedIds(get().user?.token).catch(() => get().unlockedIds);
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

    const compounds = shuffle(data.items).slice(0, STAGE_LIMITS[difficulty]).map(normalizeCompound);
    const first = compounds[0];
    const playMode = get().playMode;
    set({
      compoundsPending: false,
      compoundsError: '',
      phase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
      difficulty,
      currentCompound: first,
      remainingCompounds: compounds.slice(1),
      availableElements: normalizeCompound(first).available_elements,
      trayElements: [],
      lives: playMode === 'hardcore' ? HARDCORE_LIVES : DEFAULT_LIVES,
      score: 0,
      stage: 1,
      mimicCountdown: 3,
      unlockedIds,
      timeAttackStartedAt: Date.now(),
      latestClearTimeMs: null,
      latestTimeAttackRecord: null,
      timeAttackRanking: [],
      myTimeAttackBest: null,
      timeAttackPending: false,
      timeAttackError: '',
      doganReturnPhase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
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
    const {
      currentCompound,
      trayElements,
      score,
      lives,
      unlockedIds,
      playMode,
      compounds,
      user,
      difficulty,
    } = get();

    const answer: Record<string, number> = {};
    trayElements.forEach(e => { answer[e] = (answer[e] ?? 0) + 1; });

    if (playMode === 'sandbox') {
      const matchedCompound = compounds.find(compound => matchesCompound(compound, answer));
      if (!matchedCompound) return;

      const next = new Set(unlockedIds);
      next.add(matchedCompound.id);
      if (user?.token) {
        void unlockCompound(matchedCompound.id, user.token).catch(() => undefined);
      } else {
        saveUnlocked(next);
      }
      set({
        currentCompound: matchedCompound,
        phase: 'success',
        unlockedIds: next,
      });
      return;
    }

    if (!currentCompound) return;
    const correct = matchesCompound(currentCompound, answer);

    if (correct) {
      const next = new Set(unlockedIds);
      next.add(currentCompound.id);
      const isLastStage = get().remainingCompounds.length === 0;
      const stageScore = playMode === 'hardcore' ? HARDCORE_STAGE_SCORE : DEFAULT_STAGE_SCORE;
      const nextScore = score + stageScore;

      if (isLastStage && user) {
        if (user.token) {
          void saveEarnedPoints(user.token, nextScore)
            .then(points => {
              set(state => {
                if (!state.user) return state;
                const nextUser = { ...state.user, points };
                saveSession(nextUser);
                return { user: nextUser };
              });
            })
            .catch(() => undefined);
        } else {
          const nextUser = { ...user, points: user.points + nextScore };
          saveSession(nextUser);
          set({ user: nextUser });
        }
      }

      if (user?.token) {
        void unlockCompound(currentCompound.id, user.token).catch(() => undefined);
        if (currentCompound.hall_of_fame_item_id) {
          const hofId = currentCompound.hall_of_fame_item_id;
          void unlockHallOfFameItem(hofId, user.token)
            .then(result => { if (result.unlocked) set({ newHallOfFameDiscovery: true }); })
            .catch(() => undefined);
        }
      } else {
        saveUnlocked(next);
      }
      set({
        phase: 'success',
        score: nextScore,
        unlockedIds: next,
      });

      if (isLastStage) {
        const { timeAttackStartedAt } = get();
        if (user?.token && difficulty && timeAttackStartedAt) {
          const token = user.token;
          const clearTimeMs = Date.now() - timeAttackStartedAt;

          set({
            latestClearTimeMs: clearTimeMs,
            latestTimeAttackRecord: null,
            timeAttackRanking: [],
            myTimeAttackBest: null,
            timeAttackPending: true,
            timeAttackError: '',
          });

          void saveTimeAttackRecord(token, playMode, difficulty, clearTimeMs)
            .then(async record => {
              const [ranking, best] = await Promise.all([
                fetchTimeAttackRanking(token, playMode, difficulty, 10),
                fetchMyTimeAttackBest(token, playMode, difficulty),
              ]);

              set({
                latestTimeAttackRecord: record,
                latestClearTimeMs: clearTimeMs,
                timeAttackRanking: ranking.items,
                myTimeAttackBest: best,
                timeAttackPending: false,
                timeAttackError: '',
              });
            })
            .catch(() => {
              set({
                latestClearTimeMs: clearTimeMs,
                timeAttackPending: false,
                timeAttackError: '타임어택 기록을 불러오지 못했어요.',
              });
            });
        }
      }
    } else {
      const newLives = lives - 1;
      set(newLives <= 0 ? { lives: 0, phase: 'gameover' } : { lives: newLives, phase: 'fail' });
    }
  },

  dismissResult: () => {
    if (get().playMode !== 'sandbox') return;
    set({
      phase: 'playing',
      currentCompound: null,
      trayElements: [],
    });
  },

  nextStage: () => {
    const { remainingCompounds, difficulty, stage } = get();
    if (!difficulty) return;
    if (remainingCompounds.length === 0) { set({ phase: 'gameover' }); return; }

    const next = normalizeCompound(remainingCompounds[0]);
    set({
      phase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
      currentCompound: next,
      remainingCompounds: remainingCompounds.slice(1),
      availableElements: next.available_elements,
      trayElements: [],
      stage: stage + 1,
      mimicCountdown: 3,
      doganReturnPhase: difficulty === 'mimic' ? 'mimic-preview' : 'playing',
    });
  },

  goToMenu: () => set({ phase: 'menu', doganReturnPhase: 'menu' }),
  openDogan: () => set(state => ({
    phase: 'dogan',
    doganReturnPhase: state.phase === 'dogan' ? state.doganReturnPhase : state.phase as DoganReturnPhase,
  })),
  closeDogan: () => set(state => ({ phase: state.doganReturnPhase })),

  tickMimic: () => {
    const { mimicCountdown } = get();
    set(mimicCountdown <= 1
      ? { phase: 'playing', mimicCountdown: 0, doganReturnPhase: 'playing' }
      : { mimicCountdown: mimicCountdown - 1 });
  },
}));
