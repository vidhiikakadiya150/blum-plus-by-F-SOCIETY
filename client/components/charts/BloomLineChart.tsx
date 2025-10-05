import * as React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import type { YearlyBloomPoint } from "@/lib/bloomData";

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

export function BloomLineChart({ data, stepIndex }: { data: YearlyBloomPoint[]; stepIndex: number }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const sliced = React.useMemo(() => data.slice(0, Math.min(stepIndex + 1, data.length)), [data, stepIndex]);
  const chartData = React.useMemo(() => sliced.map(p => ({ year: p.year, intensity: p.intensity })), [sliced]);
  return (
    <div ref={containerRef} className="relative w-full h-72 rounded-lg border border-white/10 bg-white/5">
      <button
        aria-label="Download line chart as SVG"
        className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
        onClick={() => {
          const svg = containerRef.current?.querySelector("svg");
          if (svg) downloadSvg(svg, "bloom-intensity.svg");
        }}
      >Download SVG</button>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="intensityGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 12 }} label={{ value: "Year", position: "insideBottomRight", offset: -5, fill: "#9ca3af", fontSize: 12 }} />
          <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: "Bloom intensity (0–100)", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Area type="monotone" dataKey="intensity" stroke="url(#intensityGrad)" fill="url(#intensityGrad)" fillOpacity={0.2} isAnimationActive dot={{ r: 2 }} strokeWidth={2} />
          <Line type="monotone" dataKey="intensity" stroke="#22c55e" dot={{ r: 2 }} strokeWidth={2} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
