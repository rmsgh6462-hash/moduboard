"use client";
import { useCallback, useEffect, useState } from "react";
import type { Phase } from "@/types/activities";
export function usePhasedActivity(phases: Phase[]) {
  const [phaseIndex, setPhaseIndex] = useState(0); const [endsAt, setEndsAt] = useState(() => Date.now() + phases[0].durationMinutes * 60000); const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
  const advance = useCallback(() => setPhaseIndex((current) => { const next = Math.min(phases.length - 1, current + 1); setEndsAt(Date.now() + phases[next].durationMinutes * 60000); return next; }), [phases]);
  useEffect(() => { const timer = window.setInterval(() => { const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)); setSecondsLeft(left); if (left === 0 && phaseIndex < phases.length - 1) advance(); }, 1000); return () => window.clearInterval(timer); }, [endsAt, phaseIndex, phases.length, advance]);
  function setDuration(minutes: number) { setEndsAt(Date.now() + Math.max(1, minutes) * 60000); }
  return { phaseIndex, phase: phases[phaseIndex], secondsLeft, endsAt, advance, setDuration, setPhaseIndex };
}
