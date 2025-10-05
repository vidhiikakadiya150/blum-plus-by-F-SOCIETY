import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { YearlyBloomPoint } from "@/lib/bloomData";
import { impactByWaterBody } from "@/lib/bloomData";

function downloadSvg(svg: SVGElement, filename: string) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  if (!source.match(/^<svg[^>]+xmlns=/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function WaterImpactBubbleChart({ data, stepIndex, onSelect }: { data: YearlyBloomPoint[]; stepIndex: number; onSelect?: (item: { name: string; intensity: number; corr: number; count: number }) => void; }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const partial = React.useMemo(() => data.slice(0, Math.min(stepIndex + 1, data.length)), [data, stepIndex]);
  const agg = React.useMemo(() => impactByWaterBody(partial), [partial]);
  // Fixed ranges for consistent visibility
  const zRange: [number, number] = [90, 210];
  const yDomain: [number, number] = [0, 100];

  return (
    <div ref={containerRef} className="relative w-full h-72 rounded-lg border border-white/10 bg-white/5">
      <div className="absolute right-2 top-2 flex items-center gap-2">
        <button
          aria-label="Download bubble chart as SVG"
          className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          onClick={() => {
            const svg = containerRef.current?.querySelector("svg");
            if (svg) downloadSvg(svg, "water-impact.svg");
          }}
        >Download SVG</button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis type="number" dataKey="intensity" name="Intensity" domain={yDomain} stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <ZAxis type="number" dataKey="corr" range={zRange} name="Correlation" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            wrapperStyle={{ outline: "none" }}
            contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Scatter name="Impact" data={agg} fill="#22c55e" onClick={(v:any)=>{ if (v && onSelect) onSelect(v); }} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
