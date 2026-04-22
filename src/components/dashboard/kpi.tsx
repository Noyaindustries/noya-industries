"use client";

import { useEffect, useState } from "react";

export function KpiCount({
  active,
  target,
  suffix,
}: {
  active: boolean;
  target: number;
  suffix: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    setV(0);
    let start: number | null = null;
    const dur = 1600;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - (1 - p) ** 4;
      setV(Math.round(e * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target]);
  return (
    <>
      {v}
      {suffix}
    </>
  );
}

export function KpiMillions({ active }: { active: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    setV(0);
    let start: number | null = null;
    const dur = 1800;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - (1 - p) ** 4;
      setV(e * 12.4);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active]);
  return <>{v.toFixed(1)} M</>;
}
