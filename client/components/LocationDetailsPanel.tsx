import { HAB_HOTSPOTS, Hotspot } from "@/lib/habHotspots";

export function LocationDetailsPanel({ hotspotId, onClose }: { hotspotId: string | null; onClose: () => void }) {
  if (!hotspotId) return null;
  const hs = HAB_HOTSPOTS.find((h) => h.id === hotspotId);
  if (!hs) return null;
  return (
    <aside className="w-80 max-w-[85vw] rounded-xl border border-white/10 bg-black/60 backdrop-blur p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{hs.name}</div>
        <button className="text-white/60 hover:text-white" onClick={onClose}>Close</button>
      </div>
      <div className="mt-2 text-sm text-white/80 space-y-1">
        <div>Type: {hs.type}</div>
        <div>Intensity: {hs.intensity}</div>
        {hs.note && <div>{hs.note}</div>}
        {hs.links && hs.links.length > 0 && (
          <div className="pt-2 space-y-1">
            {hs.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline text-white/80 hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
