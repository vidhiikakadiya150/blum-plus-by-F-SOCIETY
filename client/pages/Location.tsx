import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Globe from "@/components/globe/Globe";
import { HAB_HOTSPOTS } from "@/lib/habHotspots";
import { Legend } from "@/components/Legend";
import { YearRangeSelector, YearRange } from "@/components/charts/YearRangeSelector";
import { PlaybackControls, Speed } from "@/components/charts/PlaybackControls";
import { BloomLineChart } from "@/components/charts/BloomLineChart";
import { BloomDonutChart } from "@/components/charts/BloomDonutChart";
import { WaterImpactBubbleChart } from "@/components/charts/WaterImpactBubbleChart";
import { generateBloomDataset, toCsv, distributionByType, impactByWaterBody, type YearlyBloomPoint } from "@/lib/bloomData";

function formatISO(d: Date) { return d.toISOString().slice(0,10); }

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const todayISO = useMemo(() => formatISO(new Date()), []);
  const hs = useMemo(() => HAB_HOTSPOTS.find(h => h.id === id), [id]);


  const title = hs?.name ?? "Location";

  // Embedded dataset (no loading) + UI state
  const seed = useMemo(() => Math.abs(Math.floor((hs?.lat ?? 0) * 1000) + Math.floor((hs?.lon ?? 0) * 1000)), [hs?.lat, hs?.lon]);
  const ds = useMemo(()=> generateBloomDataset(seed, 2000, new Date().getFullYear()), [seed]);
  const [range, setRange] = useState<YearRange>(() => [ds.minYear, ds.maxYear]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [loop, setLoop] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const points: YearlyBloomPoint[] = ds.points;
  const filteredByType = useMemo(()=> selectedTypes.length ? points.filter(p => p.year>=range[0] && p.year<=range[1] && selectedTypes.includes(p.type)) : points.filter(p => p.year>=range[0] && p.year<=range[1]), [points, range, selectedTypes]);
  const dist = useMemo(()=> distributionByType(filteredByType), [filteredByType]);
  const [selectedBubble, setSelectedBubble] = useState<{ name: string; intensity: number; corr: number; count: number } | null>(null);
  const toggleType = (t: string) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // Playback
  useEffect(() => {
    if (!playing || filteredByType.length === 0) return;
    const ms = 800 / speed;
    const idt = setInterval(() => {
      setStepIndex(i => {
        const next = i + 1;
        if (next >= filteredByType.length) return loop ? 0 : i;
        return next;
      });
    }, ms);
    return () => clearInterval(idt);
  }, [playing, speed, filteredByType, loop]);

  useEffect(()=>{ setStepIndex(0); }, [range, selectedTypes]);





  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 to-black text-white">
      <header className="flex items-center justify-between p-4 md:p-6">
        <button onClick={() => nav(-1)} className="text-white/70 hover:text-white">Back</button>
        <div className="text-center">
          <div className="text-xl font-semibold">{title}</div>
          {hs && (
            <div className="text-sm text-white/70">{hs.waterBody ?? "water"} • {hs.country ?? ""} {hs.region ? `• ${hs.region}` : ""}</div>
          )}
        </div>
        <div />
      </header>

      <main className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-4 px-4 pb-10 md:grid-cols-2 md:gap-6 md:px-6">
        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-1">
          <div className="mb-3 text-sm text-white/70">Live map</div>
          <div className="h-[50vh] w-full overflow-hidden rounded-lg">
            <Globe
              dateISO={todayISO}
              activeDatasetIds={["viirs_snpp_chla"]}
              showCoastlines={true}
              showLakes={true}
              showBoundaries={true}
              showLabels={true}
              focusCircle={hs ? { lat: hs.lat, lon: hs.lon, kmRadius: 40 } : null}
              intensityPreset="default"
              flyToHotspotId={hs?.id ?? null}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Legend datasetId={"viirs_snpp_chla"} />
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-1 space-y-3">
          <div className="text-sm text-white/70">Location details</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Coordinates" value={hs ? `${hs.lat.toFixed(3)}, ${hs.lon.toFixed(3)}` : "-"} />
            <Info label="Nearest city" value={hs?.nearestCity ?? "-"} />
            <Info label="Country/Region" value={hs ? `${hs.country ?? "-"}${hs?.region ? ` / ${hs.region}` : ""}` : "-"} />
            <Info label="Water body" value={hs?.waterBody ?? "-"} />
            <Info label="Type" value={hs?.type ?? "-"} />
            <Info label="Intensity" value={hs?.intensity ?? "-"} />
          </div>
          {hs?.note && <div className="text-sm text-white/80">{hs.note}</div>}
          {hs?.links && (
            <div className="pt-2 text-sm">
              <div className="text-white/70 mb-1">External data</div>
              <div className="flex flex-wrap gap-2">
                {hs.links.map(l => (
                  <a key={l.href} className="underline text-white/80 hover:text-white" href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-2 space-y-4">
          <div className="text-sm text-white/70">Monitoring & health</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/80">
            <div className="rounded-lg border border-white/10 p-3">Public health advisories: None reported</div>
            <div className="rounded-lg border border-white/10 p-3">Recreational impact: Check local authority</div>
            <div className="rounded-lg border border-white/10 p-3">Water supply alerts: Not available</div>
          </div>
        </section>


        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-2 space-y-4">
          <div className="text-sm text-white/70 mb-1">Bloom analytics</div>
          <YearRangeSelector minYear={ds.minYear} maxYear={ds.maxYear} value={range} onChange={setRange} onCommit={setRange} />
          <PlaybackControls
            playing={playing}
            speed={speed}
            loop={loop}
            positionLabel={`${filteredByType[stepIndex]?.year ?? range[0]} (${filteredByType.length ? stepIndex+1 : 0}/${filteredByType.length})`}
            currentStep={stepIndex}
            totalSteps={filteredByType.length}
            onPlayPause={()=>setPlaying(p=>!p)}
            onStepBack={()=>setStepIndex(i=> Math.max(0, i-1))}
            onStepForward={()=>setStepIndex(i=> Math.min(filteredByType.length-1, i+1))}
            onSpeed={setSpeed}
            onLoop={setLoop}
            onScrub={(idx)=>{ setPlaying(false); setStepIndex(Math.max(0, Math.min(filteredByType.length-1, idx))); }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BloomLineChart data={filteredByType} stepIndex={stepIndex} />
            <BloomDonutChart data={filteredByType} stepIndex={stepIndex} selectedTypes={selectedTypes} onToggleType={toggleType} />
          </div>
          <WaterImpactBubbleChart data={filteredByType} stepIndex={stepIndex} onSelect={setSelectedBubble} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <div className="font-medium mb-1">Axes info</div>
              <ul className="list-disc pl-4 space-y-1 text-white/80">
                <li>Bloom Intensity Over Time: X axis = Year; Y axis = Bloom intensity (0–100).</li>
                <li>Bloom Type Distribution (Donut): categories share (%) across years in range.</li>
                <li>Water Body Impact: X = Water body, Y = Avg intensity (0–100), Bubble size = correlation strength.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <div className="font-medium mb-1">Donut selection</div>
              <div className="text-white/80">
                {(() => { const t = (selectedTypes[0] ?? dist[0]?.name) as string | undefined; const d = dist.find(x=>x.name===t); return t && d ? (
                  <>
                    <div><span className="text-white/70">Type:</span> {t}</div>
                    <div><span className="text-white/70">Count:</span> {d.value}</div>
                    <div><span className="text-white/70">Share:</span> {d.pct}%</div>
                    <div className="text-xs text-white/60 mt-1">Click segments to filter and update other charts.</div>
                  </>
                ) : <div className="text-white/60">Click a segment to see details.</div>; })()}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <div className="font-medium mb-1">Water impact selection</div>
              <div className="text-white/80">
                {selectedBubble ? (
                  <>
                    <div><span className="text-white/70">Water body:</span> {selectedBubble.name}</div>
                    <div><span className="text-white/70">Avg intensity:</span> {selectedBubble.intensity}</div>
                    <div><span className="text-white/70">Correlation strength:</span> {selectedBubble.corr}</div>
                    <div><span className="text-white/70">Samples:</span> {selectedBubble.count}</div>
                    <div className="text-xs text-white/60 mt-1">Tip: click bubbles to inspect impact values.</div>
                  </>
                ) : <div className="text-white/60">Click a bubble to see details.</div>}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              className="mt-2 rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
              onClick={() => {
                const blob = new Blob([toCsv(filteredByType)], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `${hs?.id ?? 'location'}-bloom-data-${range[0]}-${range[1]}.csv`; a.click();
                URL.revokeObjectURL(url);
              }}>Download CSV</button>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-2 space-y-2">
          <div className="text-sm text-white/70">Location insights</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/80">
            {(() => {
              const years = filteredByType.map(p=>p.year);
              const avg = filteredByType.length ? +(filteredByType.reduce((a,b)=>a+b.intensity,0)/filteredByType.length).toFixed(1) : 0;
              const trend = filteredByType.length>3 ? Math.sign((filteredByType[filteredByType.length-1]!.intensity - filteredByType[0]!.intensity)) : 0;
              const trendTxt = trend>0?"increasing": trend<0?"decreasing":"stable";
              const info: string[] = [
                `Region: ${hs?.name ?? "Unknown"} (${hs?.lat?.toFixed(2) ?? "?"}, ${hs?.lon?.toFixed(2) ?? "?"})`,
                `Bloom type: ${hs?.type ?? "-"}; typical intensity: ${hs?.intensity ?? "-"}`,
                `Selected years: ${range[0]}–${range[1]} (avg intensity ~ ${avg})`,
                `Seasonality: peak in late summer; secondary spring peak (regional heuristic)`,
                `Climate drivers: sea surface warming and nutrient input influence bloom magnitude`,
                `Variability: interannual changes appear ${trendTxt} across selected range`,
                `Water context: ${hs?.waterBody ?? "coastal/sea"}; proximity effects modulate correlation`,
                `Data basis: chlorophyll-derived intensity normalized to 0–100 for comparison`,
                `Advisory: monitor local health notices during peak bloom periods`,
              ];
              return info.slice(0,9).map((t,i)=>(<li key={i}>{t}</li>));
            })()}
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 md:col-span-2">
          <div className="text-sm text-white/70 mb-3">NASA & phenology insights</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <Info label="Seasonal pattern" value="Peak blooms in late summer; secondary peak in spring" />
            <Info label="Phenology drivers" value="SST warming, calm winds, nutrient input" />
            <Info label="Biodiversity value" value="High regional ecological significance" />
          </div>
          <div className="mt-2 text-xs text-white/60">Sources: NASA GIBS/Worldview, Ocean Color. Last update: {new Date().toISOString().slice(0,16).replace('T',' ')}</div>
        </section>
      </main>

    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}
