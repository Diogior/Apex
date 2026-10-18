// Vercel serverless function — proxies requests to the Anthropic API.
// The API key stays server-side (ANTHROPIC_KEY env var, no VITE_ prefix).
//
// Only signed-in Apex users can call it, and only in the shapes the app uses:
// - a valid Firebase ID token is required (Authorization: Bearer <token>)
// - models are limited to the ones the app calls; max_tokens is capped
// - each user gets a small request budget per window (per server instance)
import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FB_PROJECT_ID;
const FIREBASE_KEYS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export const ALLOWED_MODELS = new Set(["claude-haiku-4-5-20251001", "claude-sonnet-4-6"]);
export const MAX_TOKENS = 1500;
const MAX_BODY_BYTES = 4_000_000; // physique photos are sent as base64
const ALLOWED_FIELDS = ["model", "max_tokens", "system", "messages", "temperature"];

// Best-effort rate limit. Serverless instances don't share memory, so this caps
// bursts per instance rather than giving an exact global count.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
const usage = new Map();

export function rateLimited(uid, now = Date.now()) {
  const entry = usage.get(uid);
  if (!entry || now - entry.start > WINDOW_MS) {
    usage.set(uid, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

/** Returns an error message, or null when the request body is acceptable. */
export function validateBody(body) {
  if (!body || typeof body !== "object") return "Missing request body";
  if (!ALLOWED_MODELS.has(body.model)) return "Model not allowed";
  if (!Number.isInteger(body.max_tokens) || body.max_tokens < 1 || body.max_tokens > MAX_TOKENS) return `max_tokens must be 1-${MAX_TOKENS}`;
  if (!Array.isArray(body.messages) || body.messages.length === 0) return "messages must be a non-empty array";
  return null;
}

async function verifyUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !PROJECT_ID) return null;
  try {
    const { payload } = await jwtVerify(token, FIREBASE_KEYS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_KEY not configured" });
  }

  const uid = await verifyUser(req);
  if (!uid) return res.status(401).json({ error: "Sign in required" });
  if (rateLimited(uid)) return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });

  const size = Number(req.headers["content-length"] || 0);
  if (size > MAX_BODY_BYTES) return res.status(413).json({ error: "Request too large" });

  const invalid = validateBody(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  // Forward only the fields the app uses; nothing else reaches Anthropic.
  const body = Object.fromEntries(ALLOWED_FIELDS.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]]));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Upstream request failed", detail: err.message });
  }
}
