import { useEffect, useState } from "react";
import { RingStack } from "./ActivityRings.jsx";

const ARROW = { up: "↑", down: "↓", flat: "→" };
const fmt = (v) => (v === null || v === undefined ? "—" : Number.isInteger(v) ? v.toLocaleString() : v.toFixed(Math.abs(v) < 10 ? 2 : 1).replace(/\.?0+$/, ""));

/** This week against the 90-day average, like Apple Fitness Trends. */
export function TrendsCard({ trends }) {
  if (!trends?.length) {
    return (
      <section className="pcard" aria-labelledby="trends-title">
        <h2 id="trends-title" className="pcard-title">Trends</h2>
        <p className="pcard-empty">Log weigh-ins, meals and workouts for two weeks and your trends appear here.</p>
      </section>
    );
  }
  return (
    <section className="pcard" aria-labelledby="trends-title">
      <div className="pcard-head">
        <h2 id="trends-title" className="pcard-title">Trends</h2>
        <span className="pcard-sub">Last 7 days vs 90-day average</span>
      </div>
      <ul className="trend-list">
        {trends.map((t) => {
          const tone = t.good === true ? "good" : t.good === false ? "bad" : "neutral";
          const status = t.good === true ? "on track" : t.good === false ? "off track" : t.direction === "flat" ? "steady" : "";
          return (
            <li key={t.id} className="trend-row">
              <span className={`trend-arrow ${tone}`} aria-hidden="true">{ARROW[t.direction]}</span>
              <div className="trend-text">
                <span className="trend-label">{t.label}</span>
                <span className="trend-detail">
                  {t.baseline !== null && t.baseline !== undefined ? `90-day avg ${fmt(t.baseline)}` : t.detail}
                  {status && <span className={`trend-status ${tone}`}> · {status}</span>}
                </span>
              </div>
              <span className="trend-value">
                {t.id === "weight" && t.value > 0 ? "+" : ""}{fmt(t.value)}
                <small> {t.unit}</small>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Earned badges, the next milestones and this month's challenge. */
export function AwardsCard({ awards }) {
  const { earned, next, challenge } = awards;
  return (
    <section className="pcard" aria-labelledby="awards-title">
      <div className="pcard-head">
        <h2 id="awards-title" className="pcard-title">Awards</h2>
        <span className="pcard-sub">{earned.length} earned</span>
      </div>

      <div className="challenge">
        <RingStack values={{ train: challenge.progress }} only="train" size={56} stroke={7} />
        <div className="challenge-text">
          <span className="challenge-title">{challenge.title}{challenge.earned && " ✓"}</span>
          <span className="challenge-detail">{challenge.current} of {challenge.target} workouts · {challenge.detail.replace(/^Complete \d+ workouts /, "")}</span>
        </div>
      </div>

      {earned.length > 0 && (
        <ul className="badge-row" aria-label="Earned awards">
          {earned.slice(-6).reverse().map((b) => (
            <li key={b.id} className="badge">
              <span className="badge-medal" aria-hidden="true">{b.value}</span>
              <span className="badge-title">{b.title}</span>
            </li>
          ))}
        </ul>
      )}

      {next.length > 0 && (
        <ul className="next-awards" aria-label="Next awards">
          {next.map((n) => (
            <li key={n.id}>
              <span className="next-award-title">{n.title}</span>
              <span className="next-award-progress">{n.current} of {n.value}</span>
              <span className="next-award-meter" aria-hidden="true"><span style={{ width: `${Math.round(Math.min(1, n.progress) * 100)}%` }} /></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const RING_NAMES = { train: "Train", fuel: "Fuel", track: "Track" };

/**
 * A short celebration when a ring closes, once per ring per day.
 * Remembers what it has celebrated in localStorage so reloads don't repeat it.
 */
export function useRingCelebration(rings) {
  const [message, setMessage] = useState(null);
  const today = new Date().toDateString();
  const closedKey = ["train", "fuel", "track"].filter((k) => rings?.[k]?.closed).join(",");

  useEffect(() => {
    if (!closedKey) return;
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem("apex_ring_celebrated_v1") || "{}"); } catch {}
    if (seen.day !== today) seen = { day: today, rings: [] };
    const fresh = closedKey.split(",").filter((k) => !seen.rings.includes(k));
    if (!fresh.length) return;
    seen.rings = [...seen.rings, ...fresh];
    try { localStorage.setItem("apex_ring_celebrated_v1", JSON.stringify(seen)); } catch {}
    const all = seen.rings.length === 3;
    setMessage(all ? "All three rings closed" : `${fresh.map((k) => RING_NAMES[k]).join(" and ")} ring closed`);
    navigator.vibrate?.(all ? [60, 60, 60, 60, 120] : [40, 40, 80]);
    const t = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(t);
  }, [closedKey, today]);

  return message;
}

export function RingCelebration({ message, rings }) {
  if (!message) return null;
  return (
    <div className="ring-celebration" role="status">
      <RingStack values={{ train: rings.train.fraction, fuel: rings.fuel.fraction, track: rings.track.fraction }} size={44} stroke={6} gap={1} />
      <span>{message}</span>
    </div>
  );
}
