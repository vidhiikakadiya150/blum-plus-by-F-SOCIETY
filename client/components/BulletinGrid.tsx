import { HAB_HOTSPOTS } from "@/lib/habHotspots";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function getColor(intensity: string) {
  return intensity === "high" ? "#22c55e" : intensity === "medium" ? "#fbbf24" : "#ef4444";
}

export default function BulletinGrid() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return HAB_HOTSPOTS.filter(h => !s || h.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <section className="mx-auto max-w-screen-xl px-4 md:px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Flower bulletins</h2>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search locations" className="w-64 max-w-[60vw] rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20" />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(h => (
          <button key={h.id} onClick={()=>navigate(`/location/${h.id}`)} className="group rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:bg-white/5 transition">
            <div className="flex items-center gap-3">
              <span className="inline-block h-9 w-9 rounded-full" style={{ background: getColor(h.intensity) }} />
              <div>
                <div className="font-medium group-hover:underline">{h.name}</div>
                <div className="text-xs text-white/60">{h.type} • {h.intensity}</div>
              </div>
            </div>
            {h.note && <div className="mt-2 text-sm text-white/70 line-clamp-2">{h.note}</div>}
          </button>
        ))}
      </div>
    </section>
  );
}
