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

window.storage = {
  async init(uid) {
    const prevUid = localStorage.getItem(UID_KEY);

    if (prevUid === uid) {
      // Same user returning — localStorage already has their data, skip Firestore sync
      _uid = uid;
      return;
    }

    // Different user or first sign-in on this device — clear stale data, sync from Firestore
    if (prevUid) {
      APEX_KEYS.forEach(k => localStorage.removeItem(k));
    }

    _uid = uid;
    localStorage.setItem(UID_KEY, uid);

    try {
      const snap = await getDocs(collection(db, "users", uid, "storage"));
      snap.forEach(d => localStorage.setItem(d.id, d.data().value));
    } catch {}
  },

  clearUser() {
    // Don't wipe localStorage — same user may sign back in immediately.
    // Data is cleared by init() if a different user signs in next.
    _uid = null;
  },

  async get(key) {
    return { value: localStorage.getItem(key) };
  },

  async set(key, value) {
    localStorage.setItem(key, value);
    if (_uid) {
      setDoc(doc(db, "users", _uid, "storage", key), { value }).catch(() => {});
    }
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
