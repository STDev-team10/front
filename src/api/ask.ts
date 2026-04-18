export async function fetchCompoundExplanation(compoundId: string): Promise<string> {
  const res = await fetch('/api/compound/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: compoundId }),
  });
  if (!res.ok) throw new Error('설명을 불러오지 못했어요.');
  const data = await res.json() as { answer: string };
  return data.answer;
}
