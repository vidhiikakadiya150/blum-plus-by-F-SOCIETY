import * as React from "react";
import * as Slider from "@radix-ui/react-slider";

export type YearRange = [number, number];

export function YearRangeSelector({
  minYear,
  maxYear,
  value,
  onChange,
  onCommit,
}: {
  minYear: number;
  maxYear: number;
  value: YearRange;
  onChange: (r: YearRange) => void;
  onCommit?: (r: YearRange) => void;
}) {
  const [local, setLocal] = React.useState<YearRange>(value);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!dragging) setLocal(value);
  }, [value, dragging]);

  const clamp = (n: number) => Math.min(maxYear, Math.max(minYear, Math.round(n)));

  const handleValueChange = (vals: number[]) => {
    const v: YearRange = [clamp(vals[0] ?? minYear), clamp(vals[1] ?? maxYear)];
    setLocal(v);
    onChange(v);
  };

  const commit = () => { setDragging(false); onCommit?.(local); };

  const preset = (years: number) => {
    const end = maxYear;
    const start = Math.max(minYear, end - years + 1);
    onChange([start, end]);
    onCommit?.([start, end]);
  };

  const span = maxYear - minYear || 1;
  const pStart = ((local[0] - minYear) / span) * 100;
  const pEnd = ((local[1] - minYear) / span) * 100;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="mb-3 flex items-center justify-between text-xs text-white/70">
        <span>Year range</span>
        <span className="tabular-nums">{local[0]} – {local[1]}</span>
      </div>
      <div className="relative">
        {dragging && (
          <>
            <div className="absolute -top-5 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] tabular-nums" style={{ left: `${pStart}%` }}>{local[0]}</div>
            <div className="absolute -top-5 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] tabular-nums" style={{ left: `${pEnd}%` }}>{local[1]}</div>
          </>
        )}
        <Slider.Root
          className="relative flex h-8 w-full touch-none select-none items-center"
          min={minYear}
          max={maxYear}
          step={1}
          value={local}
          onValueChange={handleValueChange}
          onPointerDown={() => setDragging(true)}
          onPointerUp={commit}
        >
          <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-yellow-500 to-emerald-300">
            <Slider.Range className="absolute h-full bg-white/70 shadow-[0_0_16px_rgba(255,255,255,0.55)]" />
          </Slider.Track>
          <Slider.Thumb aria-label="Start year" className="block h-5 w-5 rounded-full border-2 border-yellow-300 bg-black shadow focus:outline-none" />
          <Slider.Thumb aria-label="End year" className="block h-5 w-5 rounded-full border-2 border-emerald-300 bg-black shadow focus:outline-none" />
        </Slider.Root>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => preset(5)}>Last 5 Years</button>
        <button className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => preset(10)}>Last Decade</button>
        <button className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => onCommit?.([minYear, maxYear])}>All Time</button>
      </div>
    </div>
  );
}
