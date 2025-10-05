import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export type TimelineProps = {
  dateISO: string;
  onChange: (iso: string) => void;
};

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function Timeline(props: TimelineProps) {
  const [playing, setPlaying] = useState(false);

  const today = useMemo(() => new Date(), []);
  const start = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6); // last 6 months
    return d;
  }, []);

  const daysTotal = Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const currentIndex = Math.max(0, Math.min(daysTotal, Math.floor((new Date(props.dateISO).getTime() - start.getTime()) / (1000 * 3600 * 24))));

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const cur = new Date(props.dateISO);
      cur.setDate(cur.getDate() + 1);
      if (cur > today) {
        props.onChange(formatISO(start));
      } else {
        props.onChange(formatISO(cur));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [playing, props.dateISO]);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4 text-white">
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="bg-white/10 hover:bg-white/20" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </Button>
        <div className="flex-1">
          <Slider
            min={0}
            max={daysTotal}
            step={1}
            value={[currentIndex]}
            onValueChange={(v) => {
              const idx = v[0] ?? 0;
              const d = new Date(start);
              d.setDate(d.getDate() + idx);
              props.onChange(formatISO(d));
            }}
          />
        </div>
        <div className="w-36 text-right text-sm text-white/70 tabular-nums">{props.dateISO}</div>
      </div>
    </div>
  );
}
