import { type Compound, type Difficulty } from '../data/compounds';

interface CompoundListResponse {
  items: Compound[];
  total: number;
}

interface CompoundUnlockListResponse {
  items: string[];
  total: number;
}

function normalizeCompound(compound: Compound): Compound {
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
