import { type Compound, type Difficulty } from '../data/compounds';

interface CompoundListResponse {
  items: Compound[];
  total: number;
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

  return response.json() as Promise<CompoundListResponse>;
}
