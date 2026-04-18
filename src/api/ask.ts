export async function fetchCompoundExplanation(compoundName: string): Promise<string> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: `${compoundName}에 대해 2~3문장으로 흥미롭게 설명해줘.` }),
  });

  if (!response.ok) throw new Error('설명을 불러오지 못했어요.');
  const data = await response.json() as { answer: string };
  return data.answer;
}
