export async function fetchPubchemCid(formula: string, compoundId: string): Promise<number | null> {
  const nameQuery = compoundId.replace(/-/g, ' ');

  const attempts = [
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nameQuery)}/cids/JSON`,
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${encodeURIComponent(formula)}/cids/JSON?MaxRecords=1`,
  ];

  for (const url of attempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json() as { IdentifierList?: { CID?: number[] } };
      const cid = data?.IdentifierList?.CID?.[0];
      if (cid) return cid;
    } catch {
      continue;
    }
  }

  return null;
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
