import * as React from "react";

export type Speed = 0.5 | 1 | 2 | 5;

export function PlaybackControls({
  playing,
  speed,
  loop,
  positionLabel,
  currentStep,
  totalSteps,
  onPlayPause,
  onStepBack,
  onStepForward,
  onSpeed,
  onLoop,
  onScrub,
}: {
  playing: boolean;
  speed: Speed;
  loop: boolean;
  positionLabel?: string;
  currentStep?: number;
  totalSteps?: number;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSpeed: (s: Speed) => void;
  onLoop: (v: boolean) => void;
  onScrub?: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-white">
      <button className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={onStepBack}>⟲</button>
      <button className="rounded bg-white/10 px-3 py-1 font-semibold hover:bg-white/20" onClick={onPlayPause}>{playing ? "Pause" : "Play"}</button>
      <button className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onClick={onStepForward}>⟳</button>
      <div className="mx-2 h-5 w-px bg-white/20" />
      <span className="text-white/70">Speed</span>
      {[0.5,1,2,5].map(s => (
        <button key={s} className={`rounded px-2 py-1 ${speed===s?"bg-white/30":"bg-white/10 hover:bg-white/20"}`} onClick={()=>onSpeed(s as Speed)}>{s}x</button>
      ))}
      <div className="mx-2 h-5 w-px bg-white/20" />
      <label className="flex items-center gap-2 text-white/70">
        <input type="checkbox" checked={loop} onChange={e=>onLoop(e.target.checked)} /> Loop
      </label>
      {typeof currentStep === "number" && typeof totalSteps === "number" && totalSteps > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            step={1}
            value={Math.min(currentStep, Math.max(0, totalSteps - 1))}
            onChange={(e) => onScrub?.(Number(e.target.value))}
            className="w-40 accent-emerald-400"
            aria-label="Timeline scrubber"
          />
          {positionLabel && <div className="text-xs text-white/70 tabular-nums">{positionLabel}</div>}
        </div>
      )}
      {!totalSteps && positionLabel && <div className="ml-auto text-xs text-white/70 tabular-nums">{positionLabel}</div>}
    </div>
  );
}
