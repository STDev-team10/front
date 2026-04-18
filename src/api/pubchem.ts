export interface Compound3dInfo {
  nameKo: string;
  nameEn: string | null;
  formula: string | null;
  pubchemCid: number | null;
  has3d: boolean;
}

export async function fetchCompound3d(compoundId: string): Promise<Compound3dInfo> {
  const res = await fetch('/api/compound/3d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: compoundId }),
  });
  if (!res.ok) throw new Error('3d info fetch failed');
  return res.json() as Promise<Compound3dInfo>;
}

export async function fetch3dSdf(cid: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`,
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
