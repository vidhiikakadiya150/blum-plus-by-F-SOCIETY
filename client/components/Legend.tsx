import { GIBS_DATASETS } from "@/lib/gibs";

export function Legend({ datasetId }: { datasetId: string | null }) {
  const dataset = GIBS_DATASETS.find((d) => d.id === datasetId);
  if (!dataset) return (
    <div className="rounded-lg border border-white/10 bg-black/50 backdrop-blur p-3 text-white/80 text-xs">Enable a dataset to view legend</div>
  );
  return (
    <div className="rounded-lg border border-white/10 bg-black/50 backdrop-blur p-3 text-white">
      <div className="text-xs uppercase tracking-widest text-white/60">Bloom intensity</div>
      <div className="mt-2 h-3 w-64 rounded-full overflow-hidden">
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(90deg, ${dataset.legend.gradient.join(", ")})`,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-white/70">
        <span>
          {dataset.legend.min} {dataset.legend.unit}
        </span>
        <span>
          {dataset.legend.max} {dataset.legend.unit}
        </span>
      </div>
    </div>
  );
}
