import { apiChat } from "./apiChat.js";

// AI fallback — called when keyword matching returns null.
// Uses Haiku for speed/cost; result cached in customExDB for future use.
export async function resolveExerciseTagWithAI(name) {
  const VALID = ['chest','back','quads','hams','delts','rear_delt','triceps','biceps','calves','abs'];
  try {
    const res = await apiChat({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        system: "Classify gym exercises. Reply with ONLY the primary muscle group in lowercase. Options: chest back quads hams delts rear_delt triceps biceps calves abs",
        messages: [{ role: "user", content: `Exercise: "${name}"` }],
      }),
    });
    const data = await res.json();
    const muscle = (data.content?.[0]?.text || "").trim().toLowerCase().replace(/[^a-z_]/g, "");
    if (VALID.includes(muscle)) {
      const mvt = ["chest","delts","triceps"].includes(muscle) ? "horizontal_push"
        : ["back","biceps"].includes(muscle) ? "horizontal_pull" : "isolation";
      return { primary: muscle, secondary: [], movement: mvt, stim: 7 };
    }
  } catch {}
  return null;
}
