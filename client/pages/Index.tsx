import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "@/components/globe/Globe";
import { LayerPanel } from "@/components/LayerPanel";
import { Legend } from "@/components/Legend";
import { InspectPopup, InspectInfo } from "@/components/InspectPopup";
import { LocationDetailsPanel } from "@/components/LocationDetailsPanel";
import BulletinGrid from "@/components/BulletinGrid";

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Index() {
  const navigate = useNavigate();
  const todayISO = useMemo(() => formatISO(new Date()), []);
  const [activeDatasetIds, setActiveDatasetIds] = useState<string[]>(["viirs_snpp_chla"]);
  const [showCoastlines, setShowCoastlines] = useState(true);
  const [showLakes, setShowLakes] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [inspect, setInspect] = useState<InspectInfo | null>(null);
  const [flyToHotspotId, setFlyToHotspotId] = useState<string | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [intensityPreset, setIntensityPreset] = useState<"default" | "low" | "medium" | "high">("default");

  const brand = useMemo(() => ({
    title: "BLOOM PLUS",
    subtitle: "Harmful Algal Bloom visualizer using NASA GIBS",
  }), []);

  useEffect(() => {
    document.title = `${brand.title} • NASA GIBS Visualizer`;
  }, [brand.title]);

  const primaryDatasetId = activeDatasetIds[0] ?? null;

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black text-white">
      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-500" />
          <div>
            <div className="font-semibold tracking-wide">{brand.title}</div>
            <div className="text-xs text-white/60">{brand.subtitle}</div>
          </div>
        </div>
        <nav className="pointer-events-auto hidden md:flex items-center gap-6 text-sm text-white/70">
          <a className="hover:text-white" href="#sources">Data sources</a>
          <a className="hover:text-white" href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer">Worldview</a>
        </nav>
      </header>

      {/* Globe */}
      <main className="relative z-0 min-h-[85vh] w-full">
        <Globe
          dateISO={todayISO}
          activeDatasetIds={activeDatasetIds}
          showCoastlines={showCoastlines}
          showLakes={showLakes}
          showBoundaries={showBoundaries}
          showLabels={showLabels}
          intensityPreset={intensityPreset}
          flyToHotspotId={flyToHotspotId}
          onHotspotClick={(id) => navigate(`/location/${id}`)}
          onClickInspect={(info) => setInspect(info)}
        />

        {/* Left panel */}
        <div className="pointer-events-none absolute left-4 top-24 z-20 md:left-6">
          <div className="pointer-events-auto max-h-[calc(100vh-12rem)] overflow-auto pr-1">
            <LayerPanel
              activeDatasetIds={activeDatasetIds}
              onToggleDataset={(id, v) =>
                setActiveDatasetIds((prev) => (v ? [...new Set([id, ...prev])] : prev.filter((x) => x !== id)))
              }
              showCoastlines={showCoastlines}
              showLakes={showLakes}
              showBoundaries={showBoundaries}
              showLabels={showLabels}
              onToggleCoastlines={(v) => setShowCoastlines(!!v)}
              onToggleLakes={(v) => setShowLakes(!!v)}
              onToggleBoundaries={(v) => setShowBoundaries(!!v)}
              onToggleLabels={(v) => setShowLabels(!!v)}
              intensityPreset={intensityPreset}
              onIntensityPreset={setIntensityPreset}
              onFlyToHotspot={(id) => { setFlyToHotspotId(id); setSelectedHotspotId(id); }}
            />
          </div>
        </div>

        {/* Right panel: legend + details */}
        <div className="pointer-events-none absolute right-4 top-24 z-20 md:right-6 space-y-3 hidden sm:block">
          <div className="pointer-events-auto max-h-[calc(100vh-12rem)] overflow-auto pr-1">
            <Legend datasetId={primaryDatasetId} />
          </div>
          <div className="pointer-events-auto">
            <LocationDetailsPanel hotspotId={selectedHotspotId} onClose={() => setSelectedHotspotId(null)} />
          </div>
        </div>


        {/* Inspect popup */}
        <div className="pointer-events-none absolute left-4 bottom-28 z-20 md:left-6">
          <div className="pointer-events-auto">
            <InspectPopup info={inspect} onClose={() => setInspect(null)} />
          </div>
        </div>
      </main>

      {/* Bulletins grid */}
      <div className="mt-8">
        <BulletinGrid />
      </div>

      {/* Footer */}
      <footer id="sources" className="relative z-10 p-4 md:p-6 text-xs text-white/70">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            Data from NASA GIBS/Worldview WMTS (EPSG:3857, GoogleMapsCompatible), MODIS/VIIRS (Ocean Color, Chlorophyll‑a, FLH). Includes CyAN resources and TROPOMI fluorescence references. PACE datasets may be integrated when available.
          </div>
          <div className="flex items-center gap-4">
            <a className="underline" href="https://gibs.earthdata.nasa.gov/" target="_blank" rel="noreferrer">GIBS</a>
            <a className="underline" href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer">Worldview</a>
            <a className="underline" href="https://oceancolor.gsfc.nasa.gov/" target="_blank" rel="noreferrer">Ocean Color</a>
            <a className="underline" href="https://science.nasa.gov/earth-science/earth-science-data/data-system-programs/global-imagery-browse-services-gibs/" target="_blank" rel="noreferrer">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
