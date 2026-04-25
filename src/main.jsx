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

  const results = await Promise.allSettled(
    writes.map(({ key, value }) =>
      setDoc(doc(db, "users", uid, "storage", key), { value })
    )
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("Firestore write failed for", writes[i].key, "→", r.reason?.code, r.reason?.message);
    } else {
      console.log("Firestore write OK:", writes[i].key);
    }
  });
}

window.storage = {
  async init(uid) {
    const prevUid = localStorage.getItem(UID_KEY);
    _uid = uid;

    if (prevUid === uid) {
      pushLocalToFirestore(uid);
      return;
    }

    if (prevUid) {
      APEX_KEYS.forEach(k => localStorage.removeItem(k));
    }
    localStorage.setItem(UID_KEY, uid);

    try {
      console.log("Firestore: pulling data for uid", uid);
      const snap = await getDocs(collection(db, "users", uid, "storage"));
      console.log("Firestore: got", snap.size, "documents");
      snap.forEach(d => {
        console.log("  →", d.id);
        localStorage.setItem(d.id, d.data().value);
      });
    } catch (e) {
      console.error("Firestore read failed →", e.code, e.message);
      window._firestoreError = `${e.code}: ${e.message}`;
    }
  },

  clearUser() { _uid = null; },

  async get(key) {
    return { value: localStorage.getItem(key) };
  },

  async set(key, value) {
    localStorage.setItem(key, value);
    if (_uid) {
      setDoc(doc(db, "users", _uid, "storage", key), { value })
        .catch(e => console.error("Firestore set failed:", key, e.code));
    }
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
