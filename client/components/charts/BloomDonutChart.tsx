import * as React from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import type { YearlyBloomPoint } from "@/lib/bloomData";
import { distributionByType } from "@/lib/bloomData";

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

const COLORS: Record<string, string> = { cyanobacteria: "#22c55e", dinoflagellate: "#f59e0b", diatom: "#3b82f6" };

export function BloomDonutChart({ data, stepIndex, selectedTypes, onToggleType }: { data: YearlyBloomPoint[]; stepIndex: number; selectedTypes: string[]; onToggleType: (t: string) => void; }) {
  const partial = React.useMemo(() => data.slice(0, Math.min(stepIndex + 1, data.length)), [data, stepIndex]);
  const dist = React.useMemo(() => distributionByType(partial), [partial]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const hasFilter = selectedTypes.length > 0;
  return (
    <div ref={containerRef} className="relative w-full h-72 rounded-lg border border-white/10 bg-white/5">
      <button
        aria-label="Download donut chart as SVG"
        className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
        onClick={() => {
          const svg = containerRef.current?.querySelector("svg");
          if (svg) downloadSvg(svg, "bloom-distribution.svg");
        }}
      >Download SVG</button>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} isAnimationActive onClick={(d:any)=> d?.name && onToggleType(d.name)}>
            {dist.map((e) => (<Cell key={e.name} fill={COLORS[e.name] || "#9ca3af"} fillOpacity={hasFilter ? (selectedTypes.includes(e.name) ? 1 : 0.35) : 1} />))}
          </Pie>
          <Tooltip
            formatter={(v: any, _n, d: any) => [`${v} (${d?.payload?.pct ?? 0}%)`, d?.payload?.name]}
            wrapperStyle={{ outline: "none" }}
            contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "white" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
