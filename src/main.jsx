import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { db } from "./firebase.js";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import App from "./App.jsx";

const APEX_KEYS = [
  // Core profile + weight
  "apex_user_v1", "apex_weight_log_v1",
  // Training + nutrition
  "apex_training_v2", "apex_nutrition_v1", "apex_rebound_v3",
  "apex_checkins_v1", "apex_protocol_v1",
  "apex_bf_override_v1", "apex_custom_exercises_v1",
  // Feedback + coaching
  "apex_session_feedback_v2",   // v2 — was v1 in legacy installs
  // Adaptive physique system (Phases 1-7)
  "apex_goal_config_v1", "apex_snapshots_v1",
  "apex_goal_analysis_v1", "apex_goal_history_v1",
  "apex_weekly_digest_v1", "apex_notif_v1",
  // Physique scan history (analysis results only — photos not stored)
  "apex_physique_v1",
];
// Session key is intentionally excluded — it is device-local only.
// An active workout on your phone must never sync to or be wiped by another device.
const SESSION_KEY_LOCAL = "apex_live_session_v1";

const UID_KEY = "apex_session_uid";
let _uid = null;

async function pushLocalToFirestore(uid) {
  const writes = APEX_KEYS
    .map(key => ({ key, value: localStorage.getItem(key) }))
    .filter(({ value }) => value != null);
  if (!writes.length) return 0;

  // Ensure the /users/{uid} parent document exists so the admin roster
  // query (getDocs(collection(db,"users"))) can enumerate all user UIDs.
  // Without this, the subcollection data exists but the parent is invisible to list queries.
  setDoc(doc(db, "users", uid), { uid, lastSeen: Date.now() }, { merge: true }).catch(() => {});

  const results = await Promise.allSettled(
    writes.map(({ key, value }) =>
      setDoc(doc(db, "users", uid, "storage", key), { value })
    )
  );
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length) console.error(`[Apex sync] ${failed.length}/${writes.length} Firestore writes failed:`, failed[0].reason?.code);
  return writes.length - failed.length;
}

async function pullFirestoreToLocal(uid) {
  const snap = await getDocs(collection(db, "users", uid, "storage"));
  snap.forEach(d => localStorage.setItem(d.id, d.data().value));
  return snap.size;
}

window.storage = {
  async init(uid) {
    const prevUid = localStorage.getItem(UID_KEY);
    _uid = uid;

    if (prevUid === uid) {
      // Same device — await push so failures surface in console
      const n = await pushLocalToFirestore(uid);
      console.log(`[Apex sync] pushed ${n} keys to Firestore`);
      return;
    }

    // New device — clear stale user data, pull from Firestore
    // Preserve SESSION_KEY_LOCAL — do not wipe an in-progress workout on sign-in
    if (prevUid) APEX_KEYS.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(UID_KEY, uid);

    try {
      await pullFirestoreToLocal(uid);
    } catch (e) {
      console.error("Firestore pull failed:", e.code, e.message);
    }
  },

  // Callable from the recovery screen to retry syncing
  async retrySync() {
    if (!_uid) return false;
    try {
      const count = await pullFirestoreToLocal(_uid);
      return count > 0;
    } catch {
      return false;
    }
  },

  // Force push all local data to Firestore (callable from UI)
  async forceSync() {
    if (!_uid) return { ok: false, reason: "not signed in" };
    try {
      const pushed = await pushLocalToFirestore(_uid);
      return { ok: true, pushed };
    } catch (e) {
      return { ok: false, reason: e?.message || "unknown error" };
    }
  },

  clearUser() { _uid = null; },

  async get(key) {
    return { value: localStorage.getItem(key) };
  },

  async set(key, value) {
    localStorage.setItem(key, value);
    if (_uid) {
      // Retry once on failure
      setDoc(doc(db, "users", _uid, "storage", key), { value }).catch(() =>
        setDoc(doc(db, "users", _uid, "storage", key), { value }).catch(() => {})
      );
    }
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
