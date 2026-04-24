import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { db } from "./firebase.js";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import App from "./App.jsx";

const APEX_KEYS = [
  "apex_user_v1", "apex_weight_log_v1", "apex_training_v2",
  "apex_nutrition_v1", "apex_rebound_v3", "apex_live_session_v1",
  "apex_session_feedback_v1", "apex_checkins_v1", "apex_protocol_v1",
];

let _uid = null;

window.storage = {
  // Called on sign-in — pulls all Firestore data into localStorage
  async init(uid) {
    _uid = uid;
    try {
      const snap = await getDocs(collection(db, "users", uid, "storage"));
      snap.forEach(d => localStorage.setItem(d.id, d.data().value));
    } catch {}
  },

  // Called on sign-out — clears user data from localStorage
  clearUser() {
    _uid = null;
    APEX_KEYS.forEach(k => localStorage.removeItem(k));
  },

  // Read from localStorage (fast); Firestore was already synced on init
  async get(key) {
    return { value: localStorage.getItem(key) };
  },

  // Write to localStorage immediately + Firestore async
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
