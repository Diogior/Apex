// Shared by the newer Vercel functions (food search). Files starting with "_" are not routes.
// chat.js keeps its own copy of this logic so the live web app's proxy is untouched.
import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FB_PROJECT_ID;
const FIREBASE_KEYS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

/** The signed-in user's uid from a Firebase ID token in `Authorization: Bearer`, or null. */
export async function verifyUser(req) {
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

/**
 * A best-effort limiter: serverless instances don't share memory, so this caps bursts per
 * instance rather than giving an exact global count.
 */
export function makeLimiter(maxPerWindow, windowMs = 10 * 60 * 1000) {
  const usage = new Map();
  return (uid, now = Date.now()) => {
    const entry = usage.get(uid);
    if (!entry || now - entry.start > windowMs) {
      usage.set(uid, { start: now, count: 1 });
      return false;
    }
    entry.count += 1;
    return entry.count > maxPerWindow;
  };
}
