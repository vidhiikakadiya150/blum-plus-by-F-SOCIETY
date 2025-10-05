export type BloomType = "cyanobacteria" | "dinoflagellate" | "diatom";
export type WaterBody = "Coastal" | "Estuary" | "Lake" | "River" | "OpenSea";

export type YearlyBloomPoint = {
  year: number;
  intensity: number; // 0-100
  type: BloomType;
  waterBody: WaterBody;
  correlation: number; // 0-1 correlation strength for impact analysis
};

export type BloomDataset = {
  minYear: number;
  maxYear: number;
  points: YearlyBloomPoint[];
};

function lcg(seed: number) {
  let r = seed >>> 0;
  return () => {
    r = (1664525 * r + 1013904223) >>> 0;
    return r / 0xffffffff;
  };
}

export function generateBloomDataset(seed: number, minYear = 2000, maxYear = new Date().getFullYear()): BloomDataset {
  const rnd = lcg(seed);
  const types: BloomType[] = ["cyanobacteria", "dinoflagellate", "diatom"];
  const waters: WaterBody[] = ["Coastal", "Estuary", "Lake", "River", "OpenSea"];
  const points: YearlyBloomPoint[] = [];

  for (let y = minYear; y <= maxYear; y++) {
    const baseline = 40 + 25 * Math.sin((y - minYear) / 3);
    const noise = (rnd() - 0.5) * 18;
    const intensity = Math.max(2, Math.min(98, baseline + noise));
    const type = types[Math.floor(rnd() * types.length)]!;
    const waterBody = waters[Math.floor(rnd() * waters.length)]!;
    const correlation = Math.max(0.05, Math.min(0.98, 0.3 + 0.6 * rnd()));
    points.push({ year: y, intensity: +intensity.toFixed(1), type, waterBody, correlation: +correlation.toFixed(2) });
  }

  return { minYear, maxYear, points };
}

export function filterByYearRange(ds: BloomDataset, start: number, end: number): YearlyBloomPoint[] {
  return ds.points.filter(p => p.year >= start && p.year <= end);
}

export function distributionByType(data: YearlyBloomPoint[]) {
  const total = data.length || 1;
  const map: Record<BloomType, number> = { cyanobacteria: 0, dinoflagellate: 0, diatom: 0 };
  data.forEach(p => { map[p.type] += 1; });
  return Object.entries(map).map(([name, count]) => ({ name, value: count, pct: +(count / total * 100).toFixed(1) }));
}

export function impactByWaterBody(data: YearlyBloomPoint[]) {
  const bucket: Record<WaterBody, { name: WaterBody; avgIntensity: number; avgCorr: number; count: number }> = {
    Coastal: { name: "Coastal", avgIntensity: 0, avgCorr: 0, count: 0 },
    Estuary: { name: "Estuary", avgIntensity: 0, avgCorr: 0, count: 0 },
    Lake: { name: "Lake", avgIntensity: 0, avgCorr: 0, count: 0 },
    River: { name: "River", avgIntensity: 0, avgCorr: 0, count: 0 },
    OpenSea: { name: "OpenSea", avgIntensity: 0, avgCorr: 0, count: 0 },
  };
  data.forEach(p => {
    const b = bucket[p.waterBody];
    b.avgIntensity += p.intensity;
    b.avgCorr += p.correlation;
    b.count += 1;
  });
  return Object.values(bucket).map(b => ({ name: b.name, intensity: b.count ? +(b.avgIntensity / b.count).toFixed(1) : 0, corr: b.count ? +(b.avgCorr / b.count).toFixed(2) : 0, count: b.count }));
}

export function toCsv(data: YearlyBloomPoint[]): string {
  const header = ["year","intensity","type","waterBody","correlation"].join(",");
  const rows = data.map(d => [d.year, d.intensity, d.type, d.waterBody, d.correlation].join(","));
  return [header, ...rows].join("\n");
}
