export interface HallOfFameItem {
  id: string;
  title: string;
  subtitle: string;
  image_filename: string;
  discoverers: string[];
}

export interface HallOfFameUnlockResponse {
  unlocked: boolean;
}

export async function fetchHallOfFame(): Promise<HallOfFameItem[]> {
  const response = await fetch('/api/hall-of-fame');
  if (!response.ok) throw new Error('명예의 전당을 불러오지 못했어요.');
  const data = await response.json() as { items: HallOfFameItem[] };
  return data.items;
}

export async function unlockHallOfFameItem(itemId: string, token: string): Promise<HallOfFameUnlockResponse> {
  const response = await fetch(`/api/hall-of-fame/${itemId}/unlock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { unlocked: false };
  return response.json() as Promise<HallOfFameUnlockResponse>;
}
