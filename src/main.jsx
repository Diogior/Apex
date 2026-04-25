import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { db } from "./firebase.js";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import App from "./App.jsx";

const APEX_KEYS = [
  "apex_user_v1", "apex_weight_log_v1", "apex_training_v2",
  "apex_nutrition_v1", "apex_rebound_v3", "apex_live_session_v1",
  "apex_session_feedback_v1", "apex_checkins_v1", "apex_protocol_v1",
  "apex_bf_override_v1",
];

const UID_KEY = "apex_session_uid";
let _uid = null;

async function pushLocalToFirestore(uid) {
  const writes = APEX_KEYS
    .map(key => ({ key, value: localStorage.getItem(key) }))
    .filter(({ value }) => value != null);
  if (!writes.length) return;
  await Promise.allSettled(
    writes.map(({ key, value }) =>
      setDoc(doc(db, "users", uid, "storage", key), { value })
    )
  );
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
      // Same device — push any local data to keep cloud in sync
      pushLocalToFirestore(uid);
      return;
    }

    // New device — clear stale data, pull from Firestore
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
