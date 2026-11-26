"use client";

import { useEffect, useState } from "react";

// Small SVG compatibility gauge -- animates its stroke in on mount via a CSS
// transition, going from 0 to `score` so the reveal always plays once.
export function CompatibilityRing({
  score,
  size = 88,
  stroke = 8,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-sm font-extrabold"
      >
        {score}%
      </text>
    </svg>
  );
}
