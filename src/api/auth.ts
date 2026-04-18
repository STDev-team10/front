export interface PointsRankingEntry {
  rank: number;
  user_id: number;
  username: string;
  points: number;
}

export interface PointsRankingResponse {
  items: PointsRankingEntry[];
  total: number;
  my_item: PointsRankingEntry | null;
}

interface UpdatePointsResponse {
  points: number;
}

export async function fetchPointsRanking(token?: string, limit = 5): Promise<PointsRankingResponse> {
  const response = await fetch(`/api/auth/points-rankings?limit=${limit}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error('포인트 랭킹을 불러오지 못했어요.');
  }

  return response.json() as Promise<PointsRankingResponse>;
}

export async function saveEarnedPoints(token: string, earnedPoints: number): Promise<number> {
  const response = await fetch('/api/auth/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      earned_points: earnedPoints,
    }),
  });

  if (!response.ok) {
    throw new Error('포인트 저장에 실패했어요.');
  }

  const data = await response.json() as UpdatePointsResponse;
  return data.points;
}
