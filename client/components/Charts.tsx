import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

function generateSeries(seed: number, days: number): { date: string; chla: number; sst: number }[] {
  const out: { date: string; chla: number; sst: number }[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  let r = seed;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    r = (r * 9301 + 49297) % 233280;
    const noise = r / 233280;
    const chla = Math.max(0.01, (Math.sin(i / 6) + 1) * 3 + noise * 2);
    const sst = 10 + (Math.cos(i / 10) + 1) * 8 + noise * 2;
    out.push({ date: d.toISOString().slice(0, 10), chla: +chla.toFixed(2), sst: +sst.toFixed(2) });
  }
  return out;
}

export function TimeSeries({ lat, lon }: { lat: number; lon: number }) {
  const seed = Math.abs(Math.floor(lat * 1000) + Math.floor(lon * 1000));
  const data = generateSeries(seed, 60);
  return (
    <div className="w-full h-72 rounded-lg border border-white/10 bg-white/5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} hide={false} interval={7} />
          <YAxis yAxisId="left" stroke="#9ca3af" domain={[0, 'dataMax+2']} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" domain={[0, 'dataMax+2']} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
          <Legend wrapperStyle={{ color: "white" }} />
          <Line yAxisId="left" type="monotone" dataKey="chla" name="Chlorophyll-a (mg/m³)" stroke="#22c55e" dot={false} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="sst" name="Sea surface temp (°C)" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
