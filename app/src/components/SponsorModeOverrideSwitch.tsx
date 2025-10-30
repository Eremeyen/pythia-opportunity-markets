import { useMemo } from "react";
import { useSponsorMode } from "../hooks/useSponsorMode";

export default function SponsorModeOverrideSwitch() {
  const { isSponsor, whitelisted, overrideSource, setSponsorOverride } = useSponsorMode();

  const badge = useMemo(() => {
    const base = "px-2.5 py-1 text-xs rounded-full border-2";
    if (whitelisted) return <span className={`${base} border-green-700 text-green-800 bg-green-50`}>Whitelisted</span>;
    return <span className={`${base} border-amber-700 text-amber-800 bg-amber-50`}>Not whitelisted</span>;
  }, [whitelisted]);

  return (
    <div className="flex items-center gap-3">
      {badge}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#0b1f3a] opacity-70">Mode:</span>
        <button
          type="button"
          onClick={() => setSponsorOverride(false)}
          className={`px-3 py-1 text-sm rounded-lg border-2 ${!isSponsor ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
          aria-pressed={!isSponsor}
        >
          Viewer
        </button>
        <button
          type="button"
          onClick={() => setSponsorOverride(true)}
          className={`px-3 py-1 text-sm rounded-lg border-2 ${isSponsor ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
          aria-pressed={isSponsor}
        >
          Sponsor
        </button>
      </div>
      {overrideSource && (
        <span className="text-[10px] italic text-[#0b1f3a] opacity-60">override: {overrideSource}</span>
      )}
    </div>
  );
}


