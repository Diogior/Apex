import { auth } from "../firebase.js";

/**
 * Calls the /api/chat proxy with the signed-in user's Firebase ID token.
 * Same arguments and return value as fetch("/api/chat", init), so call sites
 * keep their existing response handling.
 */
export async function apiChat(init = {}) {
  let token = null;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch {
    // Offline or token refresh failed: the request goes out unauthenticated and
    // the proxy answers 401, which callers already treat as a failed AI call.
  }
  return fetch("/api/chat", {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
