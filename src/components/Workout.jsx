import { useEffect, useRef, useState } from "react";
import { effortLabel } from "../domain/workout.js";

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Keeps the screen on during a workout (Screen Wake Lock API), re-acquiring it when the app returns. */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // Denied (battery saver, unsupported context): the workout still works, the screen may dim.
      }
    };
    const onVisible = () => { if (document.visibilityState === "visible" && !cancelled) acquire(); };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release?.().catch(() => {});
    };
  }, [active]);
}

/** Floating rest timer: a ring that closes as the rest runs out. */
export function RestTimer({ endsAt, total, onAdd, onSkip }) {
  const [now, setNow] = useState(() => Date.now());
  const buzzed = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const fraction = total > 0 ? 1 - remaining / (total * 1000) : 1;

  useEffect(() => {
    if (remaining === 0 && !buzzed.current) {
      buzzed.current = true;
      navigator.vibrate?.([180, 80, 180]);
    }
    if (remaining > 0) buzzed.current = false;
  }, [remaining]);

  // Clear itself a few seconds after the rest is over.
  useEffect(() => {
    if (remaining > 0) return;
    const t = setTimeout(onSkip, 5000);
    return () => clearTimeout(t);
  }, [remaining, onSkip]);

  const R = 18, C = 2 * Math.PI * R;
  return (
    <div className="rest-timer" role="timer" aria-label={remaining > 0 ? `Rest, ${clock(remaining)} left` : "Rest done"}>
      <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle cx="22" cy="22" r={R} className="rest-ring-track" />
        <circle cx="22" cy="22" r={R} className="rest-ring" strokeDasharray={C} strokeDashoffset={C * (1 - fraction)} transform="rotate(-90 22 22)" />
      </svg>
      <div className="rest-text">
        <span className="rest-label">{remaining > 0 ? "Rest" : "Rest done"}</span>
        <span className="rest-time">{remaining > 0 ? clock(remaining) : "Next set"}</span>
      </div>
      {remaining > 0 && (
        <button type="button" className="rest-btn" onClick={onAdd}>+30 s</button>
      )}
      <button type="button" className="rest-btn rest-btn-solid" onClick={onSkip}>{remaining > 0 ? "Skip" : "Close"}</button>
    </div>
  );
}

/** Rate the whole session 1-10 when finishing, like Apple Watch's effort rating. */
export function EffortSheet({ onSave, onCancel }) {
  const [value, setValue] = useState(null);
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="effort-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="effort-title" className="sheet-title">How hard was that?</h2>
        <p className="sheet-sub">Rate the whole session. It's saved with the workout and shared with your coach.</p>
        <div className="effort-grid" role="radiogroup" aria-label="Effort from 1 to 10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" role="radio" aria-checked={value === n}
              className={`effort-btn${value === n ? " on" : ""}`} onClick={() => setValue(n)}>
              {n}
            </button>
          ))}
        </div>
        <p className="effort-word" aria-live="polite">{value ? effortLabel(value) : " "}</p>
        <div className="sheet-actions">
          <button type="button" className="sheet-btn" onClick={() => onSave(null)}>Skip</button>
          <button type="button" className="sheet-btn sheet-btn-primary" disabled={!value} onClick={() => onSave(value)}>Finish workout</button>
        </div>
      </div>
    </div>
  );
}

/** Shown once after a workout is saved. */
export function WorkoutSummary({ summary, title, feedback, onDone }) {
  const lead = summary.prs[0]
    ? { label: summary.prs[0].name, value: `${summary.prs[0].e1rm} lb`, note: `New best estimated 1-rep max (was ${summary.prs[0].previous} lb)` }
    : summary.next.find((n) => n.kind === "up")
      ? (() => { const n = summary.next.find((x) => x.kind === "up"); return { label: n.name, value: `+${n.increment} lb`, note: `Top of the range on every set. ${n.weight} lb next time.` }; })()
      : null;

  return (
    <div className="screen wsum">
      <header className="wsum-head">
        <p className="wsum-eyebrow">{title} complete</p>
        <h1 className="wsum-title">Workout done</h1>
      </header>

      {lead && (
        <section className="wsum-hero" aria-label="Highlight">
          <p className="wsum-hero-label">{lead.label}</p>
          <p className="wsum-hero-value">{lead.value}</p>
          <p className="wsum-hero-note">{lead.note}</p>
        </section>
      )}

      <dl className="wsum-stats">
        <div><dt>Time</dt><dd>{summary.minutes} min</dd></div>
        <div><dt>Sets</dt><dd>{summary.sets}</dd></div>
        <div><dt>Volume</dt><dd>{summary.volume.toLocaleString()}<small> lb</small></dd></div>
        {summary.effort && <div><dt>Effort</dt><dd>{summary.effort}<small> · {effortLabel(summary.effort)}</small></dd></div>}
      </dl>

      {summary.prs.length > 0 && (
        <section className="wsum-section" aria-labelledby="wsum-prs">
          <h2 id="wsum-prs" className="wsum-h2">Personal records</h2>
          <ul className="wsum-list">
            {summary.prs.map((p) => (
              <li key={p.name}><span>{p.name}</span><span className="wsum-num">{p.weight} × {p.reps}</span></li>
            ))}
          </ul>
        </section>
      )}

      {summary.next.length > 0 && (
        <section className="wsum-section" aria-labelledby="wsum-next">
          <h2 id="wsum-next" className="wsum-h2">Next time</h2>
          <ul className="wsum-list">
            {summary.next.map((n) => (
              <li key={n.name}>
                <span>{n.name}</span>
                <span className={`wsum-tag ${n.kind}`}>{n.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="wsum-section" aria-labelledby="wsum-coach">
        <h2 id="wsum-coach" className="wsum-h2">Coach</h2>
        <p className="wsum-coach" aria-live="polite">
          {feedback?.loading ? "Reviewing your session…" : feedback?.text || "Feedback appears here after your session is reviewed."}
        </p>
      </section>

      <button type="button" className="next-cta wsum-done" onClick={onDone}>Done</button>
    </div>
  );
}
