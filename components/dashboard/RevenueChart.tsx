'use client';

import { useId } from 'react';
import { LAST_ACTUAL_INDEX, MONTHS, REVENUE } from '@/lib/data/dashboard';

type Point = { x: number; y: number };

/**
 * Revenu mensuel : aire pleine pour le réalisé, ligne pointillée pour la prévision,
 * séparées par un repère vertical au dernier mois clos.
 */
export function RevenueChart({ showForecast }: { showForecast: boolean }) {
  const actualGradient = useId();
  const forecastGradient = useId();

  const W = 800;
  const H = 190;
  const PAD = { t: 18, r: 24, b: 30, l: 44 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const MAX = 90;

  const gx = (i: number) => PAD.l + (i / (REVENUE.length - 1)) * cW;
  const gy = (v: number) => PAD.t + cH - (v / MAX) * cH;

  const actuals: Point[] = REVENUE.flatMap((d, i) =>
    d.r !== null ? [{ x: gx(i), y: gy(d.r) }] : [],
  );
  const forecasts: Point[] = REVENUE.slice(LAST_ACTUAL_INDEX).map((d, i) => ({
    x: gx(LAST_ACTUAL_INDEX + i),
    y: gy(d.p),
  }));

  const linePath = (pts: Point[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = (pts: Point[], x0: number, x1: number) =>
    `M ${x0},${gy(0)} ${linePath(pts).slice(1)} L ${x1},${gy(0)} Z`;

  const yTicks = [0, 25, 50, 75];
  const splitX = gx(LAST_ACTUAL_INDEX);
  const lastActualValue = REVENUE[LAST_ACTUAL_INDEX].r ?? 0;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={`Revenu mensuel 2026 en milliers de dollars canadiens. Dernier mois réalisé : ${lastActualValue} k$.`}
    >
      <defs>
        <linearGradient id={actualGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={forecastGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--warm)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--warm)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grille horizontale */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l}
            y1={gy(v)}
            x2={W - PAD.r}
            y2={gy(v)}
            stroke="var(--border-solid)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={PAD.l - 8}
            y={gy(v) + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--fg-4)"
            fontFamily="var(--font-mono)"
          >
            {v}k
          </text>
        </g>
      ))}

      {/* Mois */}
      {MONTHS.map((m, i) => (
        <text
          key={m}
          x={gx(i)}
          y={H - 5}
          textAnchor="middle"
          fontSize="10"
          fill={i > LAST_ACTUAL_INDEX ? 'var(--fg-3)' : 'var(--fg-4)'}
          fontWeight={i > LAST_ACTUAL_INDEX ? 600 : 400}
          fontFamily="var(--font)"
        >
          {m}
        </text>
      ))}

      {/* Réalisé */}
      <path d={areaPath(actuals, gx(0), splitX)} fill={`url(#${actualGradient})`} />
      <path
        d={linePath(actuals)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {showForecast && (
        <>
          <line
            x1={splitX}
            y1={PAD.t}
            x2={splitX}
            y2={PAD.t + cH}
            stroke="var(--border-strong)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <path
            d={areaPath(forecasts, splitX, gx(REVENUE.length - 1))}
            fill={`url(#${forecastGradient})`}
          />
          <path
            d={linePath(forecasts)}
            fill="none"
            stroke="var(--warm)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />
          {forecasts.map((p) => (
            <circle
              key={p.x}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="var(--bg-surface-solid)"
              stroke="var(--warm)"
              strokeWidth="1.8"
            />
          ))}
          <text
            x={gx(REVENUE.length - 2)}
            y={PAD.t - 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="var(--fg-4)"
            fontFamily="var(--font)"
          >
            Prévision
          </text>
        </>
      )}

      {/* Points réalisés — le dernier est mis en avant */}
      {actuals.map((p, i) => {
        const isLast = i === actuals.length - 1;
        return (
          <circle
            key={p.x}
            cx={p.x}
            cy={p.y}
            r={isLast ? 5 : 3.5}
            fill={isLast ? 'var(--accent)' : 'var(--bg-surface-solid)'}
            stroke="var(--accent)"
            strokeWidth="1.8"
          />
        );
      })}

      <text
        x={splitX}
        y={gy(lastActualValue) - 11}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--accent)"
        fontFamily="var(--font-mono)"
      >
        {lastActualValue} k$
      </text>
    </svg>
  );
}
