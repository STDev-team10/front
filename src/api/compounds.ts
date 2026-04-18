import { type Compound, type Difficulty } from '../data/compounds';

export type TimeAttackPlayMode = 'normal' | 'hardcore';

interface CompoundListResponse {
  items: Compound[];
  total: number;
}

interface CompoundUnlockListResponse {
  items: string[];
  total: number;
}

export interface TimeAttackRecordResponse {
  record_id: number;
  play_mode: TimeAttackPlayMode;
  difficulty: Difficulty;
  clear_time_ms: number;
  rank: number;
  is_personal_best: boolean;
}

export interface TimeAttackRankingEntry {
  rank: number;
  user_id: number;
  username: string;
  play_mode: TimeAttackPlayMode;
  difficulty: Difficulty;
  clear_time_ms: number;
  cleared_at: string;
}

interface TimeAttackRankingListResponse {
  items: TimeAttackRankingEntry[];
  total: number;
  my_item: TimeAttackRankingEntry | null;
}

export interface TimeAttackRankingResponse {
  items: TimeAttackRankingEntry[];
  total: number;
  my_item: TimeAttackRankingEntry | null;
}

export function normalizeCompound(compound: Compound): Compound {
  const available = new Set(compound.available_elements);

  Object.keys(compound.elements).forEach(symbol => {
    available.add(symbol);
  });

  return {
    ...compound,
    available_elements: [...available],
  };
}

function normalizeCompoundListResponse(response: CompoundListResponse): CompoundListResponse {
  return {
    ...response,
    items: response.items.map(normalizeCompound),
  };
}

function getAuthHeaders(token?: string): HeadersInit | undefined {
  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCompounds(difficulty?: Difficulty): Promise<CompoundListResponse> {
  const url = new URL('/api/compounds', window.location.origin);
  if (difficulty) {
    url.searchParams.set('difficulty', difficulty);
  }

  const response = await fetch(`${url.pathname}${url.search}`);
  if (!response.ok) {
    throw new Error('화합물 목록을 불러오지 못했어요.');
  }

  const body = await response.json() as CompoundListResponse;
  return normalizeCompoundListResponse(body);
}

export async function fetchUnlockedCompoundIds(token: string): Promise<string[]> {
  const response = await fetch('/api/compounds/unlocks/me', {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('해제한 화합물 목록을 불러오지 못했어요.');
  }

  const body = await response.json() as CompoundUnlockListResponse;
  return body.items;
}

export async function unlockCompound(compoundId: string, token: string): Promise<void> {
  const response = await fetch(`/api/compounds/${compoundId}/unlock`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('화합물 해제 상태를 저장하지 못했어요.');
  }
}

export async function saveTimeAttackRecord(
  token: string,
  playMode: TimeAttackPlayMode,
  difficulty: Difficulty,
  clearTimeMs: number,
): Promise<TimeAttackRecordResponse> {
  const response = await fetch('/api/compounds/time-attack-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({
      play_mode: playMode,
      difficulty,
      clear_time_ms: clearTimeMs,
    }),
  });

  if (!response.ok) {
    throw new Error('타임어택 기록 저장에 실패했어요.');
  }

  return response.json() as Promise<TimeAttackRecordResponse>;
}

export async function fetchTimeAttackRanking(
  token: string | undefined,
  playMode: TimeAttackPlayMode,
  difficulty: Difficulty,
  limit = 5,
): Promise<TimeAttackRankingResponse> {
  const response = await fetch(
    `/api/compounds/time-attack-rankings?play_mode=${playMode}&difficulty=${difficulty}&limit=${limit}`,
    {
      headers: getAuthHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error('랭킹을 불러오지 못했어요.');
  }

  const data = await response.json() as TimeAttackRankingListResponse;
  return {
    items: data.items,
    total: data.total,
    my_item: data.my_item,
  };
}

export async function fetchMyTimeAttackBest(
  token: string,
  playMode: TimeAttackPlayMode,
  difficulty: Difficulty,
): Promise<TimeAttackRankingEntry | null> {
  const data = await fetchTimeAttackRanking(token, playMode, difficulty, 5);
  return data.my_item;
}
