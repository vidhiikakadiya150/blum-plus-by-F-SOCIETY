import { GIBS_DATASETS } from "@/lib/gibs";
import { HAB_HOTSPOTS } from "@/lib/habHotspots";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

export type LayerPanelProps = {
  activeDatasetIds: string[];
  onToggleDataset: (id: string, value: boolean) => void;
  showCoastlines: boolean;
  showLakes: boolean;
  showBoundaries: boolean;
  showLabels: boolean;
  onToggleCoastlines: (v: boolean) => void;
  onToggleLakes: (v: boolean) => void;
  onToggleBoundaries: (v: boolean) => void;
  onToggleLabels: (v: boolean) => void;
  onFlyToHotspot: (id: string | null) => void;
  intensityPreset: "default" | "low" | "medium" | "high";
  onIntensityPreset: (preset: "default" | "low" | "medium" | "high") => void;
};

export function LayerPanel(props: LayerPanelProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HAB_HOTSPOTS;
    return HAB_HOTSPOTS.filter((h) => h.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="w-80 max-w-[85vw] rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 text-sm text-white space-y-4">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/60">Datasets</h3>
        <div className="mt-2 space-y-2 max-h-64 overflow-auto pr-1">
          {GIBS_DATASETS.map((ds) => {
            const checked = props.activeDatasetIds.includes(ds.id);
            return (
              <label key={ds.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{ds.title}</div>
                  <a className="text-white/60 hover:text-white/80 text-xs" href={ds.sourceUrl} target="_blank" rel="noreferrer">
                    View on NASA Earthdata
                  </a>
                </div>
                <Switch checked={checked} onCheckedChange={(v) => props.onToggleDataset(ds.id, !!v)} />
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <h3 className="text-xs uppercase tracking-widest text-white/60">Intensity filter</h3>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {(["default", "low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              className={`rounded px-2 py-1 text-xs ${props.intensityPreset === p ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => props.onIntensityPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <h3 className="text-xs uppercase tracking-widest text-white/60">Overlays</h3>
        <div className="mt-2 space-y-2">
          <label className="flex items-center justify-between gap-3">
            <span>Coastlines</span>
            <Switch checked={props.showCoastlines} onCheckedChange={props.onToggleCoastlines} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Lakes</span>
            <Switch checked={props.showLakes} onCheckedChange={props.onToggleLakes} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Admin boundaries</span>
            <Switch checked={props.showBoundaries} onCheckedChange={props.onToggleBoundaries} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Labels</span>
            <Switch checked={props.showLabels} onCheckedChange={props.onToggleLabels} />
          </label>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-white/60">Hotspots</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          placeholder="Search by name or region"
        />
        <div className="max-h-48 overflow-auto space-y-1 pr-1">
          {filtered.map((h) => (
            <button
              key={h.id}
              className="w-full text-left rounded px-2 py-1 hover:bg-white/10"
              onClick={() => props.onFlyToHotspot(h.id)}
            >
              <div className="font-medium">{h.name}</div>
              <div className="text-xs text-white/60">{h.type} • {h.intensity}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
