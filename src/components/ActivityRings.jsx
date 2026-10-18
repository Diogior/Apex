// Summary rings: Train (outer), Fuel (middle), Track (inner).
// Each ring has a labelled row beside it, so identity never relies on colour alone.

const RINGS = [
  { id: "train", label: "Train", color: "var(--ring-train)" },
  { id: "fuel", label: "Fuel", color: "var(--ring-fuel)" },
  { id: "track", label: "Track", color: "var(--ring-track)" },
];

/** Concentric rings in an SVG of `size`. `values` is { train, fuel, track } fractions 0..1. */
export function RingStack({ values, size = 132, stroke = 12, gap = 3, animate = true, only = null }) {
  const c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      {RINGS.filter((ring) => !only || ring.id === only).map((ring, i) => {
        const r = c - stroke / 2 - i * (stroke + gap);
        if (r <= stroke / 2) return null;
        const circ = 2 * Math.PI * r;
        const f = Math.max(0, Math.min(1, values[ring.id] || 0));
        return (
          <g key={ring.id} transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke}
              className="ring-track"
              style={{ "--ring-color": ring.color }} />
            {f > 0 && (
              <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circ}
                className={animate ? "ring-arc" : undefined}
                style={{ stroke: ring.color, strokeDashoffset: circ * (1 - f), "--ring-full": circ }} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const WEEKDAY = (ms) => new Date(ms).toLocaleDateString("en-US", { weekday: "narrow" });

export function ActivityRingsCard({ rings, history, onOpen }) {
  const values = { train: rings.train.fraction, fuel: rings.fuel.fraction, track: rings.track.fraction };
  const rows = [
    { ...RINGS[0], value: rings.train.label, detail: rings.train.detail, closed: rings.train.closed, target: "training" },
    { ...RINGS[1], value: rings.fuel.label, detail: `Protein · ${rings.fuel.calories.toLocaleString()} of ${rings.fuel.calTarget.toLocaleString()} kcal`, closed: rings.fuel.closed, target: "nutrition" },
    { ...RINGS[2], value: rings.track.label, detail: trackDetail(rings.track.parts), closed: rings.track.closed, target: "home" },
  ];
  const summary = rows.map((r) => `${r.label}: ${r.value}${r.closed ? ", closed" : ""}`).join(". ");

  return (
    <section className="rings-card" aria-labelledby="rings-title">
      <div className="rings-head">
        <h2 id="rings-title" className="rings-title">Today</h2>
        {rings.allClosed && <span className="rings-badge">All closed</span>}
      </div>
      <div className="rings-body">
        <div role="img" aria-label={summary}>
          <RingStack values={values} />
        </div>
        <ul className="rings-legend">
          {rows.map((r) => (
            <li key={r.id}>
              <button type="button" className="rings-row" onClick={() => onOpen?.(r.target)} disabled={r.target === "home"}>
                <span className="rings-key" style={{ background: r.color }} aria-hidden="true" />
                <span className="rings-text">
                  <span className="rings-label">{r.label}{r.closed && <span className="rings-check" aria-label="closed"> ✓</span>}</span>
                  <span className="rings-value">{r.value}</span>
                  <span className="rings-detail">{r.detail}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {history?.length > 0 && (
        <ol className="rings-week" aria-label="Last 7 days">
          {history.map((d, i) => {
            const isToday = i === history.length - 1;
            return (
              <li key={d.day} className={isToday ? "is-today" : undefined}
                aria-label={`${new Date(d.day).toLocaleDateString("en-US", { weekday: "long" })}: Train ${Math.round(d.train.fraction * 100)}%, Fuel ${Math.round(d.fuel.fraction * 100)}%, Track ${Math.round(d.track.fraction * 100)}%`}>
                <RingStack values={{ train: d.train.fraction, fuel: d.fuel.fraction, track: d.track.fraction }} size={34} stroke={4} gap={1} animate={false} />
                <span aria-hidden="true">{WEEKDAY(d.day)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function trackDetail(parts) {
  const missing = [!parts.weighIn && "weigh-in", !parts.meals && "meals", !parts.checkIn && "check-in"].filter(Boolean);
  return missing.length ? `Still to do: ${missing.join(", ")}` : "Weigh-in, meals and check-in done";
}

export function NextCard({ action, onAction }) {
  if (!action) return null;
  return (
    <section className={`next-card next-${action.kind}`} aria-labelledby="next-title">
      <p className="next-eyebrow">{action.kind === "done" ? "Today" : "Next"}</p>
      <h2 id="next-title" className="next-title">{action.title}</h2>
      <p className="next-detail">{action.detail}</p>
      {action.cta && (
        <button type="button" className="next-cta" onClick={() => onAction(action.kind)}>
          {action.cta}
        </button>
      )}
    </section>
  );
}
