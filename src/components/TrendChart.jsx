import { useMemo, useRef, useState } from "react";

const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function niceTicks(min, max, count = 3) {
  const span = Math.max(max - min, 1e-9);
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const out = [];
  for (let v = start; v <= max + step * 0.001; v += step) out.push(Number(v.toFixed(4)));
  if (out[out.length - 1] < max) out.push(Number((out[out.length - 1] + step).toFixed(4)));
  return out;
}

/**
 * Single-series line chart. One hue, 2px line, ringed end marker with a direct
 * label, hairline grid, optional shaded band, crosshair tooltip on pointer and
 * keyboard. `points` are { x: timestamp, y: number }.
 */
export function TrendChart({
  points,
  label,
  unit = "",
  color = "var(--ring-train)",
  height = 160,
  compact = false,
  band = null, // { from: number, to: number, label } drawn behind the line
  formatY = (v) => (Math.round(v * 10) / 10).toLocaleString(),
}) {
  const W = 340;
  const H = height;
  const pad = compact ? { t: 10, r: 44, b: 6, l: 6 } : { t: 14, r: 48, b: 22, l: 38 };
  const data = useMemo(() => [...(points || [])].sort((a, b) => a.x - b.x), [points]);
  const [active, setActive] = useState(null);
  const svgRef = useRef(null);

  const geo = useMemo(() => {
    if (data.length < 2) return null;
    const ys = data.map((p) => p.y).concat(band ? [band.from, band.to] : []);
    const ticks = niceTicks(Math.min(...ys), Math.max(...ys));
    const y0 = ticks[0], y1 = ticks[ticks.length - 1];
    const x0 = data[0].x, x1 = data[data.length - 1].x;
    const x = (v) => pad.l + (x1 === x0 ? (W - pad.l - pad.r) / 2 : ((v - x0) / (x1 - x0)) * (W - pad.l - pad.r));
    const y = (v) => pad.t + (1 - (v - y0) / (y1 - y0 || 1)) * (H - pad.t - pad.b);
    return { ticks, x, y };
  }, [data, band, H, pad.l, pad.r, pad.t, pad.b]);

  if (!geo) return null;
  const { ticks, x, y } = geo;
  const last = data[data.length - 1];
  const first = data[0];
  const shown = active !== null ? data[active] : null;
  const path = data.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");

  const pick = (clientX) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((clientX - r.left) / r.width) * W;
    let best = 0;
    data.forEach((p, i) => { if (Math.abs(x(p.x) - px) < Math.abs(x(data[best].x) - px)) best = i; });
    setActive(best);
  };

  return (
    <figure className="trend-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        tabIndex={0}
        aria-label={`${label}: ${formatY(first.y)}${unit} on ${fmtDate(first.x)} to ${formatY(last.y)}${unit} on ${fmtDate(last.x)}, ${data.length} points. Use arrow keys to read each point.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const d = e.key === "ArrowLeft" ? -1 : 1;
            setActive((a) => Math.min(data.length - 1, Math.max(0, (a ?? data.length - 1) + d)));
          }
          if (e.key === "Escape") setActive(null);
        }}
      >
        {band && (
          <rect x={pad.l} width={W - pad.l - pad.r}
            y={y(Math.max(band.from, band.to))} height={Math.abs(y(band.from) - y(band.to))}
            className="trend-band" />
        )}
        {!compact && (
          <g className="trend-grid">
            {ticks.map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />)}
          </g>
        )}
        {!compact && (
          <g className="trend-axis">
            {ticks.map((t) => <text key={t} x={pad.l - 6} y={y(t) + 4} textAnchor="end">{formatY(t)}</text>)}
            <text x={pad.l} y={H - 4}>{fmtDate(first.x)}</text>
            <text x={W - pad.r} y={H - 4} textAnchor="end">{fmtDate(last.x)}</text>
          </g>
        )}
        <path d={path} className="trend-line" style={{ stroke: color }} />
        {shown ? (
          <>
            <line className="trend-cross" x1={x(shown.x)} x2={x(shown.x)} y1={pad.t} y2={H - pad.b} />
            <circle className="trend-dot" cx={x(shown.x)} cy={y(shown.y)} r={5} style={{ fill: color }} />
          </>
        ) : (
          <>
            <circle className="trend-dot" cx={x(last.x)} cy={y(last.y)} r={5} style={{ fill: color }} />
            <text className="trend-end" x={x(last.x) + 9} y={y(last.y) + 4}>{formatY(last.y)}</text>
          </>
        )}
      </svg>
      {shown && (
        <div className="trend-tip" style={{ left: `${(x(shown.x) / W) * 100}%` }} aria-hidden="true">
          <strong>{formatY(shown.y)}{unit}</strong>
          <span>{fmtDate(shown.x)}</span>
        </div>
      )}
      {band?.label && !compact && <figcaption className="trend-caption"><span className="trend-swatch" aria-hidden="true" /> {band.label}</figcaption>}
    </figure>
  );
}
