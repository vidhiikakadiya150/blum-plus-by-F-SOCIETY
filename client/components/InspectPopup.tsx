import { GIBS_DATASETS } from "@/lib/gibs";

export type InspectInfo = {
  lat: number;
  lon: number;
  dateISO: string;
  datasetId: string | null;
  colorHex?: string;
};

export function InspectPopup({ info, onClose }: { info: InspectInfo | null; onClose: () => void }) {
  if (!info) return null;
  const ds = info.datasetId ? GIBS_DATASETS.find((d) => d.id === info.datasetId) : null;
  return (
    <div className="max-w-sm rounded-xl border border-white/10 bg-black/70 backdrop-blur p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Location details</div>
        <button onClick={onClose} className="text-white/60 hover:text-white">Close</button>
      </div>
      <div className="mt-2 text-sm text-white/80 space-y-1">
        <div>Date: {info.dateISO}</div>
        <div>Lat/Lon: {info.lat.toFixed(3)}, {info.lon.toFixed(3)}</div>
        <div>Dataset: {ds ? ds.title : "None"}</div>
        {info.colorHex && (
          <div className="flex items-center gap-2">
            <span>Relative intensity:</span>
            <span className="inline-block h-4 w-10 rounded" style={{ backgroundColor: info.colorHex }} />
          </div>
        )}
        {ds && (
          <a href={ds.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-white/70 underline">
            Sensor metadata & layer page
          </a>
        )}
      </div>
    </div>
  );
}
