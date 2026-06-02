import { useState, useRef, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDocs, collection } from "firebase/firestore";

const ADMIN_EMAIL = "michaelstoics999@gmail.com";

// Canvas-only color tokens — CSS vars can't be read by the Canvas 2D API.
// Call getCanvasC() inside useEffect (after mount) to read the live system theme.
const CANVAS_DARK = {
  bg:"#09090B", surface:"#111315", up:"#191D22", border:"#232B35",
  card:"#151C28", brutal:"#F5A623",
  accent:"#F5A623", accentDim:"#C47D10",
  red:"#E84545", green:"#3DDC84", blue:"#5B8FF9",
  purple:"#A78BFA", text:"#F0EDE8", muted:"#868C96", faint:"#4A525C",
};
const CANVAS_LIGHT = {
  bg:"#F5F3EF", surface:"#FFFFFF", up:"#EDEAE4", border:"#DDD9D0",
  card:"#EDE5CF", brutal:"#1A1917",
  accent:"#C48A00", accentDim:"#946B00",
  red:"#C43030", green:"#1A9E58", blue:"#3A6AD4",
  purple:"#6B52C8", text:"#1A1917", muted:"#706C64", faint:"#B0ACA4",
};
function getCanvasC() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? CANVAS_DARK : CANVAS_LIGHT;
}
// Reactive theme hook — use inside every component that needs C for inline styles
function useThemeColors() {
  const [C, setC] = useState(getCanvasC);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setC(getCanvasC());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return C;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400&display=swap');

:root{
  --bg:#F5F3EF;--surface:#FFFFFF;--up:#EDEAE4;--border:#DDD9D0;
  --card:#EDE5CF;
  --text:#1A1917;--muted:#706C64;--faint:#B0ACA4;
  --accent:#C48A00;--accent-dim:#946B00;
  --red:#C43030;--green:#1A9E58;--blue:#3A6AD4;--purple:#6B52C8;
  --brutal:#1A1917;
}
@media(prefers-color-scheme:dark){
  :root{
    --bg:#09090B;--surface:#111315;--up:#191D22;--border:#232B35;
    --card:#151C28;
    --text:#F0EDE8;--muted:#868C96;--faint:#4A525C;
    --accent:#F5A623;--accent-dim:#C47D10;
    --red:#E84545;--green:#3DDC84;--blue:#5B8FF9;--purple:#A78BFA;
    --brutal:#F5A623;
  }
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
.app{max-width:430px;min-height:100vh;margin:0 auto;background:var(--bg);position:relative;}

/* ═══ CINEMATIC MATERIAL SYSTEM ════════════════════════════════════════════ */

/* Material tokens — light mode */
:root{
  --depth-shadow:0 8px 20px rgba(0,0,0,.09),0 3px 6px rgba(0,0,0,.05);
  --inner-light:inset 0 1px 0 rgba(255,255,255,.55);
  --glass-tint:rgba(255,255,255,.50);
  --glass-border:rgba(255,255,255,.35);
  --charge-glow:0 0 0 1px var(--accent),0 0 18px color-mix(in srgb,var(--accent) 20%,transparent);
  --ambient-warm:radial-gradient(ellipse 75% 35% at 82% -8%,color-mix(in srgb,var(--accent) 7%,transparent) 0%,transparent 60%);
}

/* Material tokens — dark mode */
@media(prefers-color-scheme:dark){
  :root{
    --depth-shadow:0 10px 24px rgba(0,0,0,.40),0 4px 8px rgba(0,0,0,.22);
    --inner-light:inset 0 1px 0 rgba(255,255,255,.07);
    --glass-tint:rgba(255,255,255,.04);
    --glass-border:rgba(255,255,255,.08);
    --charge-glow:0 0 0 1px var(--accent),0 0 24px rgba(245,166,35,.22);
    --ambient-warm:radial-gradient(ellipse 75% 38% at 82% -8%,rgba(245,166,35,.07) 0%,transparent 60%),
                   radial-gradient(ellipse 40% 22% at 12% 108%,rgba(91,143,249,.04) 0%,transparent 50%);
  }
}

/* Ambient lighting — baked into .app background-image so no pseudo-element
   or stacking-context tricks are needed (isolation:isolate breaks position:fixed
   on iOS Safari by turning .app into a containing block for all fixed children) */
.app{background-image:none;}
@media(prefers-color-scheme:dark){
  .app{background-image:radial-gradient(ellipse 70% 35% at 82% 0%,rgba(245,166,35,.06) 0%,transparent 55%),radial-gradient(ellipse 38% 20% at 12% 100%,rgba(91,143,249,.04) 0%,transparent 50%);}
}

/* ═══ NEOBRUTALIST DESIGN SYSTEM ════════════════════════════════════════════ */
/* Consistent brutalist input + card language across all pages */

/* All text inputs get hard 2px brutal border + sharp corners */
input[type="text"]:not(.no-brutal),
input[type="number"]:not(.no-brutal),
input[type="email"]:not(.no-brutal),
input[type="password"]:not(.no-brutal),
textarea:not(.no-brutal),
select:not(.no-brutal){
  border-radius:6px!important;
}

/* Auth inputs + onboarding inputs keep 4px (already sharp) */
.auth-input,.ob2-input{border-radius:4px!important;}

/* Stat strip: pump shadow offset slightly */
.stat-strip{box-shadow:var(--depth-shadow),var(--inner-light),5px 5px 0 var(--brutal)!important;}

/* Ecard hover: sharper lift + stronger shadow */
.ecard:hover{
  transform:translate(-3px,-4px)!important;
  box-shadow:var(--depth-shadow),var(--inner-light),7px 7px 0 var(--accent)!important;
}

/* Brutalist focus ring for all normal inputs */
input:focus,textarea:focus,select:focus{
  outline:none!important;
  border-color:var(--accent)!important;
  box-shadow:3px 3px 0 var(--accent)!important;
}

/* Surface material helpers */
.surface-glass{background:var(--glass-tint);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid var(--glass-border);}
.surface-charged{box-shadow:var(--charge-glow),var(--inner-light) !important;}

/* Two-voice typography — Fraunces italic for warmth, Bebas for authority */
.sh-greeting{font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:14px;font-weight:300;color:var(--muted);letter-spacing:0;line-height:1;margin-bottom:3px;}

/* Staggered screen entrance — in-flow elements only.
   Fixed children excluded: any transform on a position:fixed element,
   even briefly in the from-state, causes Safari to create a compositor
   layer that permanently breaks safe-area-inset-bottom positioning. */
.screen>*:nth-child(1){animation:screenIn .44s cubic-bezier(.16,1,.3,1) .04s both;}
.screen>*:nth-child(2){animation:screenIn .44s cubic-bezier(.16,1,.3,1) .08s both;}
.screen>*:nth-child(3){animation:screenIn .44s cubic-bezier(.16,1,.3,1) .12s both;}
.screen>*:nth-child(4){animation:screenIn .44s cubic-bezier(.16,1,.3,1) .16s both;}
.screen>*:nth-child(n+5){animation:screenIn .44s cubic-bezier(.16,1,.3,1) .20s both;}
/* Hard override for any fixed element that happens to be a .screen child */
.ci-area,.wt-notif-wrap,.photo-strip,.msv,.cx-card-wrap,.cx-empty-state{animation:none!important;}

/* Cinematic keyframes */
@keyframes chargePulse{
  0%,100%{box-shadow:0 0 0 1px var(--accent),0 0 8px color-mix(in srgb,var(--accent) 15%,transparent);}
  50%{box-shadow:0 0 0 1px var(--accent),0 0 22px color-mix(in srgb,var(--accent) 35%,transparent);}
}
@keyframes greenPulse{
  0%,100%{box-shadow:0 0 0 1px rgba(61,220,132,.3),0 0 8px rgba(61,220,132,.1);}
  50%{box-shadow:0 0 0 1px rgba(61,220,132,.5),0 0 16px rgba(61,220,132,.25);}
}
@keyframes waveflow{from{stroke-dashoffset:0;}to{stroke-dashoffset:-56;}}
@keyframes progressSettle{
  0%{transform:scaleX(0);}
  78%{transform:scaleX(1.026);}
  100%{transform:scaleX(1);}
}
@keyframes shimmer{
  0%{background-position:-200% 0;}
  100%{background-position:200% 0;}
}

/* ─── AUTH ──────────────────────────────────────────────────────────────────── */
.auth-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg);padding:24px;overflow:hidden;}
.auth-wordmark{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:2px;color:var(--text);line-height:1;margin-bottom:8px;position:relative;z-index:1;}
.auth-eyebrow{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:28px;position:relative;z-index:1;}
.auth-card{width:100%;max-width:360px;background:var(--card);border:2px solid var(--brutal);border-radius:6px;box-shadow:6px 6px 0 var(--brutal);padding:28px 24px 24px;display:flex;flex-direction:column;gap:18px;}
.auth-card-title{font-weight:900;font-size:18px;color:var(--text);line-height:1.2;}
.auth-card-title span{display:block;font-weight:500;font-size:14px;color:var(--muted);margin-top:3px;}
.auth-toggle{display:grid;grid-template-columns:1fr 1fr;border:2px solid var(--brutal);border-radius:4px;overflow:hidden;box-shadow:3px 3px 0 var(--brutal);}
.auth-tab{padding:10px;background:var(--bg);border:none;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1.5px;color:var(--muted);transition:all .15s;}
.auth-tab:first-child{border-right:2px solid var(--brutal);}
.auth-tab.active{background:var(--brutal);color:var(--card);}
.auth-input{width:100%;height:46px;border-radius:4px;border:2px solid var(--brutal);background:var(--bg);box-shadow:3px 3px 0 var(--brutal);font-size:14px;font-weight:600;color:var(--text);padding:0 14px;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s,box-shadow .15s;}
.auth-input::placeholder{color:var(--muted);font-weight:400;}
.auth-input:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.auth-field{display:flex;flex-direction:column;gap:6px;}
.auth-label{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--brutal);}
.auth-submit{width:100%;height:46px;border-radius:4px;border:2px solid var(--brutal);background:var(--bg);box-shadow:4px 4px 0 var(--brutal);font-size:15px;font-weight:700;color:var(--text);cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:2px;transition:transform .1s,box-shadow .1s;margin-top:8px;}
.auth-submit:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--brutal);}
.auth-submit:active{transform:translate(3px,3px);box-shadow:0 0 0 var(--brutal);}
.auth-submit:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.auth-error{padding:10px 14px;background:var(--bg);border:2px solid #e53e3e;border-radius:4px;box-shadow:3px 3px 0 #e53e3e;font-size:12px;font-weight:600;color:#e53e3e;line-height:1.5;}
.auth-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
.auth-loading-text{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:var(--muted);animation:pulse 2s infinite;}

/* ── SSJ LOADING ─────────────────────────────────────────────────────────── */
@keyframes apexLoad{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}
@keyframes ssj-overlay-in{from{opacity:0}to{opacity:1}}

.ssj-overlay{position:fixed;inset:0;background:var(--bg);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;animation:ssj-overlay-in .2s ease;}
.apex-loader-word{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,12vw,72px);letter-spacing:8px;color:var(--text);line-height:1;}
.apex-loader-bar{width:160px;height:2px;background:var(--border);border-radius:1px;overflow:hidden;position:relative;}
.apex-loader-fill{position:absolute;top:0;left:0;width:50%;height:100%;background:var(--brutal);border-radius:1px;animation:apexLoad 1.4s cubic-bezier(.4,0,.2,1) infinite;}
.apex-loader-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:600;}

/* ─── ONBOARD v2 — EDITORIAL REDESIGN ─────────────────────────────────────── */
.ob2{min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;}

/* Landing — dark hero band + light body */
.ob2-land{flex:1;display:flex;flex-direction:column;}
.ob2-band{
  background:#1A1917;
  padding:56px 28px 32px;
  position:relative;
  overflow:hidden;
  flex-shrink:0;
}
@media(prefers-color-scheme:dark){
  .ob2-band{background:var(--surface);border-bottom:1px solid var(--border);}
}
.ob2-band-rule{
  width:44px;height:2px;
  background:var(--accent);
  margin-bottom:16px;
  position:relative;z-index:1;
}
.ob2-eyebrow{
  font-size:10px;letter-spacing:3px;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:14px;
  font-weight:600;
  position:relative;z-index:1;
}
.ob2-wordmark{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(80px,23vw,104px);
  letter-spacing:-1px;
  line-height:.88;
  color:#F0EDE8;
  position:relative;z-index:1;
}
@media(prefers-color-scheme:dark){
  .ob2-wordmark{color:var(--text);}
}
.ob2-land-body{
  flex:1;
  padding:28px 28px 44px;
  display:flex;flex-direction:column;
}
.ob2-land-tagline{
  font-size:15px;color:var(--muted);
  line-height:1.65;
  max-width:54ch;
  margin-bottom:28px;
}
.ob2-features{
  flex:1;
  display:flex;flex-direction:column;
  gap:0;
  margin-bottom:32px;
  border-top:1px solid var(--border);
}
.ob2-feat{
  display:flex;align-items:flex-start;gap:14px;
  padding:14px 0;
  border-bottom:1px solid var(--border);
}
.ob2-feat-dot{
  width:6px;height:6px;
  border-radius:50%;
  background:var(--accent);
  flex-shrink:0;
  margin-top:5px;
}
.ob2-feat-name{font-size:13px;font-weight:600;color:var(--text);line-height:1.3;}
.ob2-feat-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.45;}

/* Step screens */
.ob2-step{
  flex:1;
  padding:0 28px 40px;
  display:flex;flex-direction:column;
  animation:ob2StepIn .3s cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes ob2StepIn{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}

.ob2-step-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 0 28px;
}
.ob2-step-counter{
  font-family:'Bebas Neue',sans-serif;
  font-size:14px;letter-spacing:2px;
  color:var(--accent);
  border:2px solid var(--brutal);
  border-radius:4px;
  padding:3px 10px;
  box-shadow:2px 2px 0 var(--brutal);
}
.ob2-back-btn{
  background:var(--card);
  border:2px solid var(--brutal);
  border-radius:4px;
  box-shadow:2px 2px 0 var(--brutal);
  font-size:11px;font-weight:700;letter-spacing:1px;
  text-transform:uppercase;
  color:var(--text);
  cursor:pointer;padding:5px 12px;
  font-family:'Bebas Neue',sans-serif;
  transition:transform .1s,box-shadow .1s;
}
.ob2-back-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--brutal);}
.ob2-back-btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--brutal);}
.ob2-step-h{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(38px,11vw,52px);
  letter-spacing:.5px;
  line-height:.96;
  color:var(--text);
  margin-bottom:28px;
}
.ob2-step-h em{font-style:normal;color:var(--accent);}

/* Shared: selection list */
.ob2-list{flex:1;display:flex;flex-direction:column;gap:10px;margin-bottom:28px;overflow-y:auto;}
.ob2-row{
  display:flex;align-items:center;gap:14px;
  padding:14px 16px;
  border-radius:6px;
  cursor:pointer;
  background:var(--card);
  border:2px solid var(--brutal);
  box-shadow:4px 4px 0 var(--brutal);
  text-align:left;width:100%;
  transition:transform .12s,box-shadow .12s,border-color .12s;
}
.ob2-row:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--brutal);}
.ob2-row.sel{border-color:var(--accent);box-shadow:4px 4px 0 var(--accent);}
.ob2-row.sel:hover{box-shadow:6px 6px 0 var(--accent);}
.ob2-row-num{
  font-family:'Bebas Neue',sans-serif;
  font-size:18px;
  color:var(--accent);
  line-height:1;width:28px;flex-shrink:0;
}
.ob2-row-info{flex:1;}
.ob2-row-name{font-size:14px;font-weight:600;color:var(--text);line-height:1.2;}
.ob2-row-desc{font-size:11px;color:var(--muted);margin-top:2px;}
.ob2-row-check{
  width:18px;height:18px;border-radius:3px;
  border:2px solid var(--brutal);
  flex-shrink:0;display:flex;
  align-items:center;justify-content:center;
  color:var(--accent);
  transition:all .15s;
}
.ob2-row.sel .ob2-row-check{background:var(--accent);border-color:var(--accent);color:#1A1917;}

/* Level rows — brutalist card */
.ob2-level-row{
  padding:18px 20px;
  border-radius:6px;
  cursor:pointer;
  border:2px solid var(--brutal);
  box-shadow:4px 4px 0 var(--brutal);
  background:var(--card);
  transition:transform .12s,box-shadow .12s,border-color .12s;
}
.ob2-level-row:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--brutal);}
.ob2-level-row.sel{border-color:var(--accent);box-shadow:4px 4px 0 var(--accent);}
.ob2-level-row.sel:hover{box-shadow:6px 6px 0 var(--accent);}
.ob2-level-name{
  font-family:'Bebas Neue',sans-serif;
  font-size:22px;letter-spacing:.5px;
  color:var(--text);line-height:1;
}
.ob2-level-row.sel .ob2-level-name{color:var(--accent);}
.ob2-level-desc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4;}

/* Profile form */
.ob2-form{flex:1;display:flex;flex-direction:column;gap:16px;margin-bottom:24px;}
.ob2-field{display:flex;flex-direction:column;gap:6px;}
.ob2-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ob2-label{
  font-size:11px;font-weight:700;
  letter-spacing:1.5px;text-transform:uppercase;
  color:var(--brutal);
}
.ob2-input{
  background:var(--card);
  border:2px solid var(--brutal);
  border-radius:4px;
  box-shadow:3px 3px 0 var(--brutal);
  padding:13px 16px;
  color:var(--text);
  font-size:16px;
  font-family:'DM Sans',sans-serif;
  outline:none;
  transition:border-color .15s,box-shadow .15s;
  width:100%;
}
.ob2-input:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}

/* Shared CTA — Pearl glass */
.ob2-cta{
  width:100%;padding:16px;
  background:var(--accent);color:#FFF;
  border:none;border-radius:100px;
  font-family:'Bebas Neue',sans-serif;
  font-size:18px;letter-spacing:2px;
  cursor:pointer;
  position:relative;overflow:hidden;
  flex-shrink:0;
  transition:all 0.2s ease;
  box-shadow:
    inset 0 0.3rem 0.9rem rgba(255,255,255,0.35),
    inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),
    inset 0 -0.4rem 0.9rem rgba(255,255,255,0.45),
    0 1rem 1.2rem -0.6rem rgba(0,0,0,0.7);
}
.ob2-cta::before{content:"";position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.13);pointer-events:none;transition:all 0.3s ease;}
.ob2-cta::after{content:"";position:absolute;left:6%;right:6%;top:10%;bottom:42%;border-radius:22px 22px 0 0;box-shadow:inset 0 10px 8px -10px rgba(255,255,255,0.85);background:linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;}
.ob2-cta:disabled{opacity:.32;cursor:not-allowed;}
.ob2-cta:not(:disabled):hover::before{transform:translateY(-5%);}
.ob2-cta:not(:disabled):hover::after{opacity:0.4;transform:translateY(5%);}
.ob2-cta:not(:disabled):hover{box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.45),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.65),0 1rem 1.2rem -0.6rem rgba(0,0,0,0.7);}

/* SHARED BUTTONS — Pearl glass */
.btn{
  width:100%;padding:15px;
  border:none;border-radius:100px;
  font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;
  cursor:pointer;
  position:relative;overflow:hidden;
  transition:all 0.2s ease;
  box-shadow:
    inset 0 0.3rem 0.9rem rgba(255,255,255,0.35),
    inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),
    inset 0 -0.4rem 0.9rem rgba(255,255,255,0.45),
    0 1rem 1.2rem -0.6rem rgba(0,0,0,0.7);
}
.btn::before{content:"";position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.13);pointer-events:none;transition:all 0.3s ease;}
.btn::after{content:"";position:absolute;left:6%;right:6%;top:10%;bottom:42%;border-radius:22px 22px 0 0;box-shadow:inset 0 10px 8px -10px rgba(255,255,255,0.85);background:linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.btn-gold{background:var(--accent);color:#FFF;}
.btn-purple{background:var(--purple);color:#FFF;}
.btn-green{background:var(--green);color:#FFF;}
.btn:not(:disabled):hover::before{transform:translateY(-5%);}
.btn:not(:disabled):hover::after{opacity:0.4;transform:translateY(5%);}
.btn:not(:disabled):hover{box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.45),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.65),0 1rem 1.2rem -0.6rem rgba(0,0,0,0.7);}
.btn-outline{background:var(--up);border:2px solid var(--brutal);color:var(--muted);padding:10px 18px;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .15s ease;box-shadow:inset 0 0.2rem 0.5rem rgba(255,255,255,0.15),inset 0 -0.2rem 0.4rem rgba(0,0,0,0.3);}
.btn-outline:hover{border-color:var(--accent);color:var(--accent);}

/* INPUTS */
.igroup{display:flex;flex-direction:column;gap:6px;}
.ilabel{font-size:11px;font-weight:500;letter-spacing:.3px;color:var(--muted);}
.ifield{background:var(--up);border:2px solid var(--brutal);border-radius:10px;padding:13px 16px;color:var(--text);font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;}
.ifield:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.irow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px 14px max(26px,env(safe-area-inset-bottom,26px));z-index:100;background:transparent;}
.nav-pill{position:relative;display:flex;background:var(--card);border-radius:8px;border:2px solid var(--brutal);box-shadow:4px 4px 0 var(--brutal);overflow:hidden;}
.nav-glider{position:absolute;top:0;bottom:0;border-radius:6px;z-index:1;transition:transform .4s cubic-bezier(.22,1,.36,1);background:var(--brutal);}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:10px 4px;border:none;background:transparent;color:var(--muted);position:relative;z-index:2;transition:color .2s ease;}
.ni:active{transform:scale(0.92);}
.ni svg{width:20px;height:20px;}
.ni-label{font-size:9px;font-weight:600;letter-spacing:.3px;color:inherit;transition:color .2s;}
.ni.on{color:var(--card);}

/* SCREENS */
.screen{padding:0 0 96px;min-height:100vh;}
@keyframes screenIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes musclePulse{0%,100%{opacity:.82}50%{opacity:1;filter:drop-shadow(0 0 6px rgba(220,60,60,.75))}}
.sh{padding:54px 24px 20px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:120;}
.sh-label{font-size:12px;color:var(--muted);font-weight:500;}
.sh-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:1.5px;color:var(--text);}
.sh-avatar{width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#FFF;flex-shrink:0;}
.stitle{font-size:12px;font-weight:600;letter-spacing:.5px;color:var(--muted);text-transform:uppercase;padding:0 24px;margin-bottom:12px;margin-top:24px;}
.stitle:first-child{margin-top:0;}

/* DASHBOARD */
/* Weight hero — dominant full-width block */
.wt-hero{margin:0 24px 16px;background:var(--card);border:2px solid var(--brutal);border-radius:14px;padding:22px 22px 18px;box-shadow:var(--depth-shadow),var(--inner-light),4px 4px 0 var(--brutal);transition:border-color .2s,box-shadow .2s;}
.wt-hero.focused{border-color:var(--accent);box-shadow:4px 4px 0 var(--accent);}
.wt-hero.logged{border-color:var(--green);box-shadow:4px 4px 0 var(--green);}
.wt-hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
.wt-label{font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.wt-number{font-family:'Bebas Neue',sans-serif;font-size:64px;letter-spacing:2px;line-height:1;color:var(--text);transition:color .4s ease;}
.wt-number.saved{color:var(--green);}
.wt-unit{font-size:13px;color:var(--muted);margin-left:2px;}
.wt-change{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-size:12px;font-weight:600;padding:3px 9px;border-radius:20px;}
.wt-change.pos{background:rgba(26,158,88,.1);color:var(--green);}
.wt-change.neg{background:rgba(58,106,212,.1);color:var(--blue);}
.wt-change.flat{background:var(--up);color:var(--muted);}
.goal-rate{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);}
.goal-rate-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;font-weight:600;}
.goal-rate-row{display:flex;align-items:baseline;gap:10px;}
.goal-rate-val{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.5px;color:var(--text);}
.goal-rate-status{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;}
.goal-rate-target{font-size:10px;color:var(--faint);margin-top:3px;}
/* Weigh-in streak pill */
.streak-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:9px;font-family:'Bebas Neue',sans-serif;letter-spacing:1.5px;}
.streak-pill.ok{background:rgba(26,158,88,.12);color:var(--green);border:1px solid rgba(26,158,88,.25);}
.streak-pill.nudge{background:rgba(251,191,36,.12);color:#FBBF24;border:1px solid rgba(251,191,36,.25);}
.streak-pill.warn{background:rgba(var(--accent-rgb),.12);color:var(--accent);border:1px solid rgba(var(--accent-rgb),.25);}
.streak-pill.danger{background:rgba(var(--red-rgb),.12);color:var(--red);border:1px solid rgba(var(--red-rgb),.25);}
/* Goal pacing card */
.pace-card{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);}
.pace-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.pace-badge{font-size:9px;font-family:'Bebas Neue',sans-serif;letter-spacing:1.5px;padding:3px 9px;border-radius:4px;font-weight:700;}
.pace-rate-num{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.5px;}
.pace-bar-track{height:4px;background:var(--up);border-radius:2px;overflow:hidden;margin-bottom:6px;}
.pace-bar-fill{height:100%;border-radius:2px;transition:width .9s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .95s cubic-bezier(.16,1,.3,1) both;}
.pace-foot{display:flex;justify-content:space-between;align-items:center;}
.pace-milestone{margin-top:8px;padding:7px 11px;background:var(--up);border-radius:7px;display:flex;align-items:center;justify-content:space-between;}
/* Post-log reaction */
.log-reaction{margin-top:8px;padding:9px 12px;border-radius:8px;font-size:12px;line-height:1.5;animation:slideUp .25s cubic-bezier(.22,1,.36,1);}
/* Weight reminder notification banner */
.wt-notif-wrap{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:200;pointer-events:none;}
.wt-notif{margin:8px 12px 0;padding:11px 14px 11px 13px;border-radius:12px;display:flex;align-items:center;gap:10px;pointer-events:all;animation:notifSlideDown .35s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 16px rgba(0,0,0,.18);}
.wt-notif.daily{background:color-mix(in srgb,var(--accent) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);}
.wt-notif.week{background:color-mix(in srgb,var(--red) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--red) 35%,transparent);}
.wt-notif-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.wt-notif-body{flex:1;min-width:0;}
.wt-notif-title{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1.2px;line-height:1.1;margin-bottom:2px;}
.wt-notif-sub{font-size:10px;color:var(--muted);line-height:1.4;}
.wt-notif-actions{display:flex;gap:6px;align-items:center;flex-shrink:0;}
.wt-notif-cta{padding:5px 11px;border:none;border-radius:6px;font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:1px;cursor:pointer;}
.wt-notif-dismiss{background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;padding:2px 4px;line-height:1;opacity:.7;}
@keyframes notifSlideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
.wt-history{display:flex;gap:6px;align-items:flex-end;height:40px;margin-bottom:14px;}
.wt-bar-wrap{display:flex;flex-direction:column;align-items:center;flex:1;}
.wt-bar{border-radius:3px 3px 0 0;min-height:4px;transition:height .5s ease;width:100%;max-width:18px;}
.wt-input-row{display:flex;gap:8px;}
.wt-input{flex:1;background:var(--up);border:2px solid var(--brutal);border-radius:6px;padding:11px 44px 11px 14px;color:var(--text);font-size:18px;font-family:'Bebas Neue',sans-serif;letter-spacing:2px;outline:none;transition:border-color .2s,box-shadow .2s;}
.wt-input:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.wt-input:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.wt-input-unit{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--muted);}
.wt-log-btn{padding:0 20px;background:var(--accent);color:#FFF;border:none;border-radius:100px;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1.5px;cursor:pointer;flex-shrink:0;position:relative;overflow:hidden;transition:all 0.2s ease;box-shadow:inset 0 0.3rem 0.7rem rgba(255,255,255,0.35),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.4),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
.wt-log-btn::before{content:"";position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.13);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn::after{content:"";position:absolute;left:8%;right:8%;top:10%;bottom:42%;border-radius:16px 16px 0 0;box-shadow:inset 0 8px 6px -8px rgba(255,255,255,0.85);background:linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn:disabled{opacity:.35;cursor:not-allowed;}
.wt-log-btn.saved{background:var(--green);}
.wt-log-btn:not(:disabled):hover{box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.45),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.6),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
/* ── CUBE BUTTON ───────────────────────────────────────────────────────────── */
.cube-btn{display:inline-flex;align-items:center;justify-content:center;padding:0.62em 1.4em;background:var(--card);border:2px solid var(--brutal);border-radius:4px;box-shadow:3px 3px 0 var(--brutal);color:var(--brutal);letter-spacing:0.12em;font-family:'Bebas Neue',sans-serif;font-size:15px;font-weight:bold;cursor:pointer;transition:transform .1s,box-shadow .1s;}
.cube-btn.sm{font-size:11px;padding:0.42em 1em;letter-spacing:0.1em;}
.cube-btn:disabled{opacity:.38;cursor:not-allowed;pointer-events:none;}
.cube-btn:not(:disabled):hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--brutal);}
.cube-btn:not(:disabled):active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--brutal);}
.cube-btn.saved{border-color:var(--green);box-shadow:3px 3px 0 var(--green);color:var(--green);}
.cube-btn.saved:not(:disabled):hover{box-shadow:4px 4px 0 var(--green);}
.cube-btn.saved:not(:disabled):active{box-shadow:1px 1px 0 var(--green);}
/* Secondary stat strip */
.stat-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;margin:0 24px 20px;background:var(--brutal);border-radius:10px;overflow:hidden;border:2px solid var(--brutal);box-shadow:var(--depth-shadow),var(--inner-light),4px 4px 0 var(--brutal);}
.stat-cell{background:var(--card);padding:14px 14px 12px;}
.stat-cell:first-child{border-radius:13px 0 0 13px;}
.stat-cell:last-child{border-radius:0 13px 13px 0;}
.stat-label{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
.stat-val{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1px;line-height:1;color:var(--text);}
.stat-sub{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.3;}
/* Training block */
.dash-banner{margin:0 24px 20px;background:var(--card);border:2px solid var(--brutal);border-radius:12px;padding:20px;box-shadow:var(--depth-shadow),var(--inner-light),4px 4px 0 var(--brutal);}
.db-tag{font-size:11px;font-weight:600;letter-spacing:.3px;color:var(--accent);margin-bottom:5px;}
.db-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:var(--text);}
.db-sub{font-size:13px;color:var(--muted);margin-top:3px;}
.streak{display:flex;align-items:center;gap:6px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);}
.sdot{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
.sdot.on{background:var(--accent);color:#FFF;}
.sdot.off{background:var(--up);color:var(--muted);border:1px solid var(--border);}

/* TRAINING */
.wscroll{display:flex;gap:8px;padding:0 24px;overflow-x:auto;margin-bottom:20px;scrollbar-width:none;}
.wscroll::-webkit-scrollbar{display:none;}
.dchip{flex-shrink:0;padding:8px 14px;border-radius:8px;background:var(--surface);border:2px solid var(--brutal);box-shadow:3px 3px 0 var(--brutal);cursor:pointer;text-align:center;transition:all .15s cubic-bezier(.22,1,.36,1);min-width:56px;}
.dchip.on{background:var(--accent);border-color:var(--brutal);box-shadow:3px 3px 0 var(--brutal);}
.dchip:active{transform:translate(3px,3px);box-shadow:0 0 0 var(--brutal);}
.dchip-l{font-size:10px;color:var(--muted);font-weight:500;}
.dchip.on .dchip-l{color:#FFF;}
.mbadge{display:inline-block;font-size:10px;font-weight:500;padding:3px 10px;border-radius:20px;margin:2px 3px;background:var(--up);color:var(--muted);border:1px solid var(--border);}
.mbadge.pri{color:var(--accent);}
.ecard{background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:16px 18px;margin:0 24px 12px;box-shadow:var(--depth-shadow),var(--inner-light),4px 4px 0 var(--brutal);transition:border-color .15s,box-shadow .15s,transform .15s;}
.ecard:hover{border-color:var(--accent);box-shadow:var(--depth-shadow),var(--inner-light),6px 6px 0 var(--accent);transform:translate(-2px,-3px);}
.ec-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;}
.ec-name{font-size:15px;font-weight:600;color:var(--text);}
.ec-num{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent);line-height:1;}


/* NUTRITION */
.mcard{margin:0 24px 12px;background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:16px 18px;box-shadow:4px 4px 0 var(--brutal);}
.nut-card{margin:0 24px 14px;background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:18px 20px;box-shadow:4px 4px 0 var(--brutal);}
.nut-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 24px 16px;}
.nut-mode-card{padding:14px 16px;background:var(--card);border:2px solid var(--brutal);border-radius:10px;box-shadow:4px 4px 0 var(--brutal);cursor:pointer;transition:box-shadow .15s,transform .15s;}
.nut-mode-card.active{border-color:var(--accent);box-shadow:4px 4px 0 var(--accent);}
.nut-mode-card:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--brutal);}
.nut-mode-card.active:hover{box-shadow:6px 6px 0 var(--accent);}
.nut-mode-tag{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;}
.nut-mode-card.active .nut-mode-tag{color:var(--accent);}
.nut-mode-label{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--text);}
.nut-mode-card.active .nut-mode-label{color:var(--accent);}
.nut-mode-desc{font-size:10px;color:var(--muted);margin-top:2px;}
.mc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mc-time{font-size:11px;font-weight:600;letter-spacing:.3px;color:var(--accent);}
.mc-name{font-size:15px;font-weight:600;margin-top:2px;color:var(--text);}
.mc-kcal{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;}
.mc-items{font-size:13px;color:var(--muted);line-height:1.6;}
.pbar{height:3px;background:var(--up);border-radius:2px;overflow:hidden;margin-top:10px;}
.pfill{height:100%;border-radius:2px;transition:width .6s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .85s cubic-bezier(.16,1,.3,1) both;}
@keyframes typingBounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}

/* COACH */
.ch-header{padding:54px 24px 18px;background:var(--surface);border-bottom:1px solid var(--border);}
.ch-id{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.ch-av{width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;position:relative;}
.ch-av svg{width:22px;height:22px;color:#FFF;}
.ch-dot{position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid var(--surface);}
.ch-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:var(--text);}
.ch-status{font-size:12px;color:var(--green);font-weight:500;}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
.chip{flex-shrink:0;font-size:12px;padding:7px 14px;border-radius:20px;background:var(--up);border:1px solid var(--border);color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;font-weight:500;}
.chip:hover{border-color:var(--accent);color:var(--accent);}
.msgs{padding:20px 20px 0;display:flex;flex-direction:column;gap:14px;overflow-y:auto;height:calc(100vh - 380px);scrollbar-width:none;}
.msgs::-webkit-scrollbar{display:none;}
.msg{display:flex;align-items:flex-end;gap:8px;animation:msgIn .3s ease forwards;}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.msg.user{flex-direction:row-reverse;}
.mav{width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mav svg{width:13px;height:13px;color:#FFF;}
.mbub{max-width:80%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.55;white-space:pre-wrap;}
.msg.coach .mbub{background:var(--up);border:1px solid var(--border);border-bottom-left-radius:4px;color:var(--text);}
.msg.user .mbub{background:var(--accent);color:#FFF;border-bottom-right-radius:4px;font-weight:500;}
.typing{display:flex;gap:4px;padding:12px 16px;background:var(--up);border:1px solid var(--border);border-radius:18px;border-bottom-left-radius:4px;width:fit-content;}
.tdot{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:tb 1.2s ease infinite;}
.tdot:nth-child(2){animation-delay:.2s;}.tdot:nth-child(3){animation-delay:.4s;}
@keyframes tb{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}

/* PHOTO STRIP */
.photo-strip{position:fixed;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-top:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;z-index:49;}
.photo-strip::-webkit-scrollbar{display:none;}
.pthumb{position:relative;flex-shrink:0;}
.pthumb img{width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block;}
.pthumb-rm{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:var(--red);border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;}

/* CHAT INPUT */
.ci-area{position:fixed;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end;z-index:110;transition:bottom .2s;}
.ci{flex:1;background:var(--up);border:2px solid var(--brutal);border-radius:10px;padding:11px 14px;color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;resize:none;max-height:100px;line-height:1.4;transition:border-color .2s,box-shadow .2s;}
.ci:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.ci-send{width:40px;height:40px;border-radius:12px;background:var(--accent);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s;color:#FFF;}
.ci-send svg{width:18px;height:18px;}
.ci-send:hover{opacity:.85;}
.ci-send:disabled{opacity:.35;cursor:not-allowed;}
.ci-photo{width:40px;height:40px;border-radius:12px;background:var(--up);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s;color:var(--muted);}
.ci-photo svg{width:18px;height:18px;}
.ci-photo:hover{border-color:var(--accent);color:var(--accent);}
.photo-input{display:none;}

/* POST-PREP */
.pp-hero{margin:0 24px 20px;background:var(--card);border:2px solid var(--brutal);border-radius:12px;padding:22px;box-shadow:4px 4px 0 var(--brutal);}
.pp-badge{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
.pp-title{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:1.5px;line-height:1.1;color:var(--text);}
.pp-sub{font-size:13px;color:var(--muted);margin-top:8px;line-height:1.6;}
.pp-card{margin:0 24px 16px;background:var(--card);border:2px solid var(--brutal);border-radius:12px;padding:20px;box-shadow:4px 4px 0 var(--brutal);}
.pp-section-label{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;}
.pp-results{animation:slideUp .4s ease-out forwards;}

/* SAVED BANNER */
.saved-banner{margin:0 24px 16px;background:var(--card);border:2px solid var(--brutal);border-left:4px solid var(--green);border-radius:10px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:4px 4px 0 var(--brutal);}
.sb-tag{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--green);margin-bottom:4px;}
.sb-title{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;color:var(--text);}
.sb-sub{font-size:12px;color:var(--muted);margin-top:2px;}
.btn-edit{background:transparent;border:2px solid var(--brutal);color:var(--muted);padding:8px 16px;border-radius:8px;box-shadow:2px 2px 0 var(--brutal);font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .15s cubic-bezier(.22,1,.36,1);}
.btn-edit:hover{border-color:var(--accent);color:var(--accent);box-shadow:2px 2px 0 var(--accent);}
.btn-edit:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--brutal);}

/* PHASE TIMELINE */
.ptl{margin:0 24px 20px;position:relative;}
.ptl-line{position:absolute;left:18px;top:28px;bottom:28px;width:1px;background:var(--border);}
.pi{display:flex;gap:14px;margin-bottom:14px;}
.pidot{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.5px;flex-shrink:0;position:relative;z-index:1;border:1.5px solid;}
.pidot.p1{background:var(--surface);border-color:var(--purple);color:var(--purple);}
.pidot.p2{background:var(--surface);border-color:var(--accent);color:var(--accent);}
.pidot.p3{background:var(--surface);border-color:var(--green);color:var(--green);}
.pidot.p4{background:var(--surface);border-color:var(--blue);color:var(--blue);}
.picnt{flex:1;background:var(--card);border:2px solid var(--brutal);border-radius:8px;padding:14px;box-shadow:3px 3px 0 var(--brutal);}
.pi-wk{font-size:10px;font-weight:600;letter-spacing:.3px;color:var(--muted);margin-bottom:3px;}
.pi-name{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;margin-bottom:8px;color:var(--text);}
.pi-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;}
.pi-tag{font-size:11px;padding:2px 8px;border-radius:4px;font-variant-numeric:tabular-nums;}
.pi-desc{font-size:12px;color:var(--muted);line-height:1.55;}

/* KEY NUMBER CARDS */
.knum-grid{display:grid;gap:12px;margin:0 24px 14px;}
.knum{border-radius:10px;padding:16px 18px;border:2px solid;box-shadow:4px 4px 0 var(--brutal);}
.knum-label{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
.knum-main{font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:1px;line-height:1;}
.knum-sub{font-size:11px;color:var(--muted);margin-top:3px;}
.knum-note{font-size:12px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border);line-height:1.55;}
.knum-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 24px 14px;}
.knum-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:0 24px 14px;}
.knum-mini{background:var(--card);border-radius:8px;padding:12px 10px;text-align:center;border:2px solid;box-shadow:3px 3px 0 var(--brutal);}
/* ── PROTOCOL INTELLIGENCE REDESIGN ─────────────────────────────────────────── */
.pi-wrap{margin:0 24px 20px;display:flex;flex-direction:column;gap:10px;}
.pi-card{background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:16px 18px;box-shadow:var(--depth-shadow),var(--inner-light),4px 4px 0 var(--brutal);}
.pi-group{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.pi-body-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;text-align:center;}
.pi-body-divider{width:1px;background:var(--border);}
.pi-body-cell{padding:4px 8px;}
.pi-body-val{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:1px;color:var(--text);line-height:1;}
.pi-body-label{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;}
.pi-divider{height:1px;background:var(--border);margin:14px 0;}
.pi-trend-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
.pi-trend-val{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:1px;line-height:1;margin-bottom:2px;}
.pi-trend-desc{font-size:10px;color:var(--muted);line-height:1.4;}
.pi-bar-wrap{margin-top:6px;}
.pi-bar-label{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:4px;}
.pi-bar{height:5px;background:var(--up);border-radius:3px;overflow:hidden;border:1px solid var(--border);}
.pi-bar-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .90s cubic-bezier(.16,1,.3,1) both;}
.pi-ready-row{display:grid;grid-template-columns:80px 1fr 48px;gap:10px;align-items:center;padding:10px 0;}
.pi-ready-row+.pi-ready-row{border-top:1px solid var(--border);}
.pi-ready-name{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;line-height:1.3;}
.pi-ready-bar{height:5px;background:var(--up);border-radius:3px;overflow:hidden;border:1px solid var(--border);}
.pi-ready-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.22,1,.36,1);}
.pi-ready-val{font-family:'Bebas Neue',sans-serif;font-size:15px;text-align:right;flex-shrink:0;line-height:1;}
.pi-ready-sub{font-size:9px;color:var(--muted);grid-column:2 / 4;margin-top:2px;line-height:1.4;}
.pi-alert-card{background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:14px 16px;box-shadow:4px 4px 0 var(--brutal);display:flex;gap:12px;align-items:flex-start;}
.pi-alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px;}
.pi-alert-priority{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;}
.pi-alert-msg{font-size:12px;color:var(--text);line-height:1.55;}
.pi-strength-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;}
.pi-strength-row+.pi-strength-row{border-top:1px solid var(--border);}
.pi-strength-name{font-size:12px;font-weight:600;color:var(--text);}
.pi-strength-meta{font-size:10px;color:var(--muted);margin-top:1px;}
.pi-strength-trend{font-size:12px;font-weight:700;margin-left:12px;flex-shrink:0;}

/* VITALS */
.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 24px 20px;}
.vcard{background:var(--card);border:2px solid var(--brutal);border-radius:8px;padding:14px;text-align:center;box-shadow:3px 3px 0 var(--brutal);}
.v-icon{width:8px;height:8px;border-radius:50%;margin:0 auto 7px;}
.v-name{font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500;}
.v-status{font-size:12px;font-weight:600;}
.v-status.dep{color:var(--red);}
.v-status.rec{color:var(--accent);}
.v-status.res{color:var(--green);}
.v-wks{font-size:10px;color:var(--muted);margin-top:2px;}
.vbar{height:3px;background:var(--up);border-radius:2px;overflow:hidden;margin-top:8px;}
.vfill{height:100%;border-radius:2px;}

/* RULES */
.rules-card{margin:0 24px 16px;background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:18px;box-shadow:4px 4px 0 var(--brutal);}
.rule-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
.rule-row:last-child{border-bottom:none;padding-bottom:0;}
.rule-icon{font-size:15px;flex-shrink:0;margin-top:2px;}
.rule-text{font-size:13px;color:var(--muted);line-height:1.6;}
.rule-text strong{color:var(--text);}

/* PHASE TABS */
.ptabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 24px;margin-bottom:16px;}
.ptabs::-webkit-scrollbar{display:none;}
.ptab{flex-shrink:0;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;letter-spacing:.3px;transition:all .2s;border:1px solid;}

/* SLIDER */
.slider-wrap{display:flex;flex-direction:column;gap:6px;}
.slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:var(--up);outline:none;cursor:pointer;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--purple);cursor:pointer;border:2px solid var(--surface);}
.slider-val{font-size:13px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--text);}

/* MODE TOGGLE */
.mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.mode-card{background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:14px 14px 12px;cursor:pointer;transition:all .15s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden;box-shadow:3px 3px 0 var(--brutal);}
.mode-card:active{transform:translate(3px,3px);box-shadow:0 0 0 var(--brutal);}
.mode-check{position:absolute;top:8px;right:10px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:#FFF;font-weight:700;}

/* LOADING */
.loading{display:flex;align-items:center;justify-content:center;min-height:60vh;}

::-webkit-scrollbar{width:0;}

/* CARD HOVER — lift + shadow extend */
.dash-banner:hover,.mcard:hover,.pp-hero:hover,.pp-card:hover,.saved-banner:hover,
.rules-card:hover,.picnt:hover,.vcard:hover,.knum:hover,.knum-mini:hover{
  transform:translate(-2px,-2px);
  box-shadow:6px 6px 0 var(--brutal);
  transition:transform .15s cubic-bezier(.22,1,.36,1),box-shadow .15s cubic-bezier(.22,1,.36,1);
}
.ecard:hover{
  transform:translate(-2px,-2px);
  border-color:var(--accent);
  box-shadow:6px 6px 0 var(--accent);
}
.mode-card:hover{
  transform:translate(-2px,-2px);
  box-shadow:6px 6px 0 var(--brutal);
}
.wt-hero:hover{
  transform:translate(-2px,-2px);
  box-shadow:6px 6px 0 var(--brutal);
}
/* override: active collapses the lifted shadow back */
.dash-banner:active,.mcard:active,.pp-hero:active,.pp-card:active,
.rules-card:active,.picnt:active,.vcard:active,.knum:active,.knum-mini:active{
  transform:translate(4px,4px);
  box-shadow:0 0 0 var(--brutal);
}

/* BUTTON ACTIVE — pearl press */
.btn:not(:disabled):active{transform:translateY(4px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.4),0 0.5rem 0.5rem -0.4rem rgba(0,0,0,0.8);}
.ob2-cta:not(:disabled):active{transform:translateY(4px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.4),0 0.5rem 0.5rem -0.4rem rgba(0,0,0,0.8);}
.wt-log-btn:not(:disabled):active{transform:translateY(3px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.3);}
.ob2-row:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--brutal);}
.ob2-level-row:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--brutal);}
.ecard:active{transform:translate(4px,4px);box-shadow:0 0 0 var(--brutal);}

/* MINI SESSION VIEW */
.msv{
  position:fixed;
  left:50%;transform:translateX(-50%);
  width:calc(100% - 24px);max-width:406px;
  bottom:calc(90px + env(safe-area-inset-bottom,0px));
  z-index:95;
  border-radius:18px;
  overflow:hidden;
  animation:msvIn .35s cubic-bezier(.22,1,.36,1);
  /* Lift above everything with a real elevation shadow */
  filter:drop-shadow(0 4px 20px rgba(0,0,0,0.35)) drop-shadow(0 1px 4px rgba(0,0,0,0.2));
}
@keyframes msvIn{
  from{opacity:0;transform:translateX(-50%) translateY(20px) scale(.97);}
  to{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}
}
.msv-inner{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:18px;
  display:grid;
  grid-template-columns:auto 1fr auto;
  align-items:stretch;
  overflow:hidden;
}
@media(prefers-color-scheme:dark){
  .msv-inner{
    background:#1C2030;
    border-color:rgba(255,255,255,.08);
  }
}
.msv-timer{
  padding:13px 16px;
  border-right:1px solid var(--border);
  font-family:'DM Mono',monospace;
  font-size:16px;font-weight:700;
  color:var(--accent);
  letter-spacing:.5px;
  white-space:nowrap;
  display:flex;align-items:center;gap:7px;
  background:transparent;
}
@media(prefers-color-scheme:dark){
  .msv-timer{border-right-color:rgba(255,255,255,.07);}
}
.msv-timer-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--accent);
  flex-shrink:0;
  animation:msvPulse 1.6s ease-in-out infinite;
}
@keyframes msvPulse{
  0%,100%{opacity:1;transform:scale(1);}
  50%{opacity:.35;transform:scale(.6);}
}
.msv-info{
  padding:11px 14px;
  min-width:0;
  display:flex;flex-direction:column;justify-content:center;
}
.msv-exname{
  font-size:13px;font-weight:600;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  line-height:1.2;
  margin-bottom:3px;
}
.msv-meta{
  font-size:10px;color:var(--muted);letter-spacing:.2px;
  line-height:1;
}
.msv-actions{
  display:flex;align-items:stretch;
  border-left:1px solid var(--border);
}
@media(prefers-color-scheme:dark){
  .msv-actions{border-left-color:rgba(255,255,255,.07);}
}
.msv-btn{
  padding:0 14px;
  background:none;border:none;cursor:pointer;
  color:var(--muted);
  font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;
  transition:color .15s,background .15s;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  min-width:52px;
}
.msv-btn:hover{color:var(--text);background:var(--up);}
.msv-btn:first-child{color:var(--accent);}
.msv-btn:first-child:hover{background:rgba(var(--accent-rgb,196,138,0),.08);}
.msv-btn-end{color:var(--muted);}
.msv-btn-end:hover{color:var(--red);background:rgba(196,48,48,.06);}
.msv-progress{
  height:2px;
  background:var(--up);
}
.msv-progress-fill{
  height:100%;
  background:var(--accent);
  transition:width .5s cubic-bezier(.22,1,.36,1);
  border-radius:0 2px 2px 0;
}

/* MACRORING entrance */
@keyframes macroSegIn{from{opacity:0}to{opacity:.85}}

/* SCREEN ENTRANCE */
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* REDUCED MOTION */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:0.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const GOALS = [
  {id:"bulk",label:"Muscle Gain",desc:"Build mass & strength"},
  {id:"cut",label:"Fat Loss",desc:"Lean out & define"},
  {id:"recomp",label:"Recomp",desc:"Build & burn simultaneously"},
  {id:"contest",label:"Contest Prep",desc:"Peak conditioning"},
  {id:"maintain",label:"Maintain",desc:"Hold current physique"},
  {id:"lifestyle",label:"Lifestyle",desc:"Healthy & balanced"},
];

// WPLAN removed — training is now fully dynamic via the Adaptive Training Engine

// MEALS removed — replaced by AI-driven nutrition logging
const USER_KEY        = "apex_user_v1";
const NOTIF_KEY       = "apex_notif_v1";
const GOAL_CONFIG_KEY = "apex_goal_config_v1";
const SNAPSHOTS_KEY     = "apex_snapshots_v1";
const GOAL_ANALYSIS_KEY = "apex_goal_analysis_v1";
const GOAL_HISTORY_KEY    = "apex_goal_history_v1";
const WEEKLY_DIGEST_KEY   = "apex_weekly_digest_v1";
const NUTRITION_KEY   = "apex_nutrition_v1";
const CHECKIN_KEY     = "apex_checkins_v1";
const PROTOCOL_KEY    = "apex_protocol_v1";
const BF_KEY          = "apex_bf_override_v1";
const PHYSIQUE_KEY    = "apex_physique_v1";
const CUSTOM_EX_KEY   = "apex_custom_exercises_v1";

const FALLBACK = [
  "Solid question. Based on your current phase, your priority should be progressive overload on your compounds. Are you tracking your lifts week to week?",
  "Your body responds best when you're consistent with sleep. Aim for 7–9 hours minimum. Growth hormone spikes during deep sleep — that's when you're actually building.",
  "Plateaued on the bench? Try wave loading: 3×6 @ 85%, then drop to 3×10 @ 75%. Vary the stimulus. Your CNS needs a different signal.",
];

const QPROMPTS = ["How's my progress?","Adjust my macros","Contest prep advice","Break a plateau","Post-show rebound","Recovery protocols","Sleep is wrecked","My hormones feel off"];

// ─── MODE CONFIG ──────────────────────────────────────────────────────────────

const MODES = {
  reverse:{
    label:"REVERSE DIET",color:CANVAS_DARK.purple,
    tagline:"Methodical ramp from prep calories to offseason TDEE over 12+ weeks.",
    heroSub:"APEX maps a precise reverse diet ramp — adding calories weekly to rebuild your metabolism while staying lean, then landing at a controlled offseason surplus.",
    day1Label:"Day 1 Start",day1Note:"Begin here — just above your prep floor. Do not jump higher.",
    best:["Coming off a long or extreme prep (20+ wks)","Prone to rapid fat gain post-show","History of metabolic damage","Want maximum leanness during transition"],
    tradeoff:"Slower to reach full calories. Requires patience and consistent weekly tracking.",
  },
  maintenance:{
    label:"STRAIGHT TO MAINTENANCE",color:CANVAS_DARK.green,
    tagline:"Land at your full TDEE on Day 1 — stabilize, then move into a lean surplus.",
    heroSub:"APEX calculates your exact offseason maintenance TDEE — hit it immediately post-show, stabilize for 3–4 weeks, then step into a controlled anabolic surplus.",
    day1Label:"Day 1 Maintenance",day1Note:"Your full calculated TDEE — land here immediately.",
    best:["Shorter preps (8–14 wks) with less metabolic suppression","Experienced competitors with strong metabolic resilience","Prioritizing fast strength and performance restoration","Not prone to rapid post-show fat spillover"],
    tradeoff:"Requires discipline — no binging, just landing precisely at TDEE. Monitor weight weekly.",
  },
};

// ─── CALCULATOR ───────────────────────────────────────────────────────────────

function calcProtocol({stageWeight, stageCalories, prepWeeks, sex, mode}) {
  const w = parseFloat(stageWeight), cal = parseFloat(stageCalories), wks = parseInt(prepWeeks)||16;
  const male = sex !== "female";
  const ceilF = male ? .10 : .08;
  const ceiling = Math.round(w*(1+ceilF));
  const target = Math.round(w*(1+ceilF*.72));
  const sev = Math.min(wks/20, 1);
  const mainCals = Math.round(target*(male?16.5:14.5));
  const surplusCals = Math.round(mainCals*(male?1.07:1.05));
  const rdBase = Math.round(cal+175);

  const mk = (cals,pLb,fPct,bw) => {
    const p=Math.round(bw*pLb), f=Math.round(cals*fPct/9), c=Math.max(0,Math.round((cals-p*4-f*9)/4));
    return {cals,p,c,f};
  };

  const phases = mode==="maintenance" ? [
    {key:"p1",dot:"p1",icon:"01",label:"DAY 1–7",name:"LAND AT MAINTENANCE",color:C.green,
      ...mk(mainCals,1.1,.24,target),
      desc:`Hit ${mainCals} kcal immediately — this is your full calculated TDEE for your target offseason weight. Insulin sensitivity is elevated post-prep, so even this surplus-free intake drives glycogen restoration faster than expected. Expect 2–4 lbs in 72 hours — that's glycogen, not fat.`},
    {key:"p2",dot:"p2",icon:"02",label:"WEEK 2–4",name:"STABILIZE & CALIBRATE",color:C.accent,
      ...mk(mainCals,1.0,.25,target),
      desc:`Hold maintenance for 3 full weeks to lock in your metabolic set point at the new bodyweight. 7-day weight average should be flat (±0.5 lbs). Gaining faster? Trim 100–150 kcals from carbs only. Losing? Add 100. The goal is a flat trendline at your target offseason weight.`},
    {key:"p3",dot:"p3",icon:"03",label:"WEEK 5–12",name:"ANABOLIC WINDOW SURPLUS",color:C.purple,
      ...mk(surplusCals,1.0,.25,target),
      desc:`Now enter a controlled lean surplus — ${surplusCals} kcal. Hormones are recovering, insulin sensitivity is still elevated, body is primed to partition nutrients toward muscle. Push training intensity hard. Acceptable gain rate: 0.3–0.5 lbs/wk. This is where post-show growth actually happens.`},
    {key:"p4",dot:"p4",icon:"04",label:"WEEK 13+",name:"SUSTAINED OFFSEASON",color:C.blue,
      ...mk(surplusCals,1.0,.25,target),
      desc:`Hold your lean surplus through the offseason. Monitor the ${ceiling} lb ceiling — don't cross it. When you're 12–16 weeks out from your next show, drop to maintenance for 2 weeks, then enter prep. No cleanup phase. You're already stage-ready lean.`},
  ] : [
    {key:"p1",dot:"p1",icon:"01",label:"WEEK 1–2",name:"METABOLIC RESET",color:C.purple,
      ...mk(rdBase,1.2,.22,w),
      desc:"Do NOT jump calories. Your metabolism is suppressed and insulin sensitivity is sky-high. Every single calorie is working harder than it ever did during prep — use that."},
    {key:"p2",dot:"p2",icon:"02",label:"WEEK 3–6",name:"REVERSE DIET RAMP",color:C.accent,
      ...mk(Math.round(rdBase+380),1.0,.23,target),
      desc:"Add +100 kcal every 7 days — primarily carbohydrates. Gaining more than 1 lb/wk? Pull back 100 kcals. The slower you go here, the leaner your offseason will be."},
    {key:"p3",dot:"p3",icon:"03",label:"WEEK 7–12",name:"ANABOLIC WINDOW",color:C.green,
      ...mk(Math.round(rdBase+860),1.0,.25,target),
      desc:"Peak anabolic sensitivity. Push intensity in training. Add 1–2 refeed days per week. This is where the real offseason muscle is built."},
    {key:"p4",dot:"p4",icon:"04",label:"WEEK 13+",name:"SUSTAINED OFFSEASON",color:C.blue,
      ...mk(Math.round(target*(male?17:15)),1.0,.25,target),
      desc:"Settled offseason TDEE. Weight gain should not exceed 0.3–0.5 lbs/wk. Hold here until 12–16 weeks before your next show — and you walk in already ready."},
  ];

  const vitals = [
    {abbr:"NRG",name:"Energy",wks:Math.round(1+sev*3),pct:Math.max(.2,1-sev*.65)},
    {abbr:"SLP",name:"Sleep Quality",wks:Math.round(2+sev*4),pct:Math.max(.25,1-sev*.55)},
    {abbr:"LIB",name:"Libido",wks:Math.round(4+sev*10),pct:Math.max(.05,1-sev*.9)},
    {abbr:"STR",name:"Strength",wks:Math.round(3+sev*5),pct:Math.max(.3,1-sev*.55)},
    {abbr:"MND",name:"Mood / Focus",wks:Math.round(2+sev*4),pct:Math.max(.25,1-sev*.6)},
    {abbr:"HRM",name:"Hormones",wks:Math.round(4+sev*8),pct:Math.max(.08,1-sev*.88)},
  ];

  const baselineCals = mode==="maintenance" ? mainCals : rdBase;
  return {stageWeight:w,stageCalories:cal,ceiling,target,baselineCals,mainCals,surplusCals,phases,vitals,wks,sev,mode};
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── APEX ALGORITHM ENGINE v1.0 ──────────────────────────────────────────────
// Performance systems architecture: User State → Protocol → Feedback → Decision
// ═══════════════════════════════════════════════════════════════════════════════

// ── UTILITY: Least-squares linear regression ─────────────────────────────────
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = (n * sumX2 - sumX * sumX);
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

// ── SECTION 2: USER STATE MODEL ───────────────────────────────────────────────

function computeBodyComp(user) {
  const weightLbs = parseFloat(user.weight) || 180;
  const heightCm  = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175; // stored in inches
  const age       = parseFloat(user.age)    || 25;
  const sex       = user.sex   || "male";
  const level     = user.level || "intermediate";

  const weightKg = weightLbs * 0.453592;
  const heightM  = heightCm / 100;
  const bmi      = weightKg / (heightM * heightM);

  // Deurenberg BMI-derived BF% — adjusted for training age (muscle inflates BMI)
  let bfPct = sex === "male"
    ? (1.20 * bmi) + (0.23 * age) - 16.2
    : (1.20 * bmi) + (0.23 * age) - 5.4;
  const levelAdj = { beginner: 0, intermediate: -2, advanced: -4, competitor: -5.5 };
  bfPct = Math.max(4, Math.min(45, bfPct + (levelAdj[level] || -2)));

  const lbmKg = weightKg * (1 - bfPct / 100);
  const fatKg = weightKg * (bfPct / 100);
  const ffmi  = lbmKg / (heightM * heightM);

  return {
    bfPct:    Math.round(bfPct * 10) / 10,
    lbmKg:    Math.round(lbmKg * 10) / 10,
    lbmLbs:   Math.round(lbmKg * 2.20462 * 10) / 10,
    fatKg:    Math.round(fatKg * 10) / 10,
    ffmi:     Math.round(ffmi  * 10) / 10,
    weightKg: Math.round(weightKg * 10) / 10,
    bmi:      Math.round(bmi   * 10) / 10,
  };
}

function computeBMR(user) {
  const { weightKg } = computeBodyComp(user);
  const heightCm = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175; // stored in inches
  const age      = parseFloat(user.age)    || 25;
  const sex      = user.sex || "male";
  // Mifflin-St Jeor
  return Math.round(sex === "male"
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
    : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
}

function computeTDEE(user, bmr) {
  const level = user.level || "intermediate";
  // Activity-level PAL (conservative — Mifflin-St Jeor already includes BMR)
  const PAL_MAP = {
    sedentary:        1.25,
    lightly_active:   1.40,
    moderately_active:1.55,
    very_active:      1.70,
    extra_active:     1.90,
  };
  // If user has set activity level use it; otherwise infer from training level
  const INFERRED_PAL = { beginner: 1.40, intermediate: 1.55, advanced: 1.55, competitor: 1.70 };
  const pal = PAL_MAP[user.activity] || INFERRED_PAL[level] || 1.45;

  // FFMI metabolic premium — heavily muscled athletes run hotter
  const { ffmi } = computeBodyComp(user);
  const ffmiMult = ffmi > 24 ? 1.08 : ffmi > 22 ? 1.04 : 1.00;
  // PAL multipliers already include TEF — no separate TEF term needed
  const tdee = Math.round(bmr * pal * ffmiMult);
  return { tdee, pal };
}

function computeRCS(user, weightLog, checkIn) {
  // checkIn: { sleep, stress, energy, mood } — all optional, fallback to neutral
  let score = 70;
  const sleep  = checkIn?.sleep  ?? 7.0;
  const stress = checkIn?.stress ?? 5;
  const energy = checkIn?.energy ?? 7;

  // Sleep modifier
  if      (sleep >= 8.0) score += 10;
  else if (sleep >= 7.0) score += 5;
  else if (sleep >= 6.0) score += 0;
  else if (sleep >= 5.0) score -= 10;
  else                   score -= 20;

  // Stress modifier (1-10 scale)
  if      (stress <= 3) score += 10;
  else if (stress <= 6) score += 0;
  else if (stress <= 8) score -= 10;
  else                  score -= 20;

  // Age modifier
  const age = parseFloat(user.age) || 25;
  if      (age < 30)  score += 5;
  else if (age <= 40) score += 0;
  else if (age <= 50) score -= 5;
  else                score -= 10;

  // Energy modifier
  if      (energy >= 8) score += 5;
  else if (energy >= 6) score += 0;
  else if (energy >= 4) score -= 5;
  else                  score -= 10;

  // Weight log variance as instability signal
  if ((weightLog || []).length >= 5) {
    const recent = weightLog.slice(-7).map(e => e.weight);
    const mean   = recent.reduce((s, v) => s + v, 0) / recent.length;
    const stdev  = Math.sqrt(recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length);
    if (stdev > 1.5) score -= 5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

function computeGoalVector(goal) {
  const vecs = {
    bulk:      { fatLoss: 0.10, muscleGain: 0.80, performance: 0.10 },
    cut:       { fatLoss: 0.80, muscleGain: 0.15, performance: 0.05 },
    recomp:    { fatLoss: 0.45, muscleGain: 0.45, performance: 0.10 },
    contest:   { fatLoss: 0.90, muscleGain: 0.05, performance: 0.05 },
    maintain:  { fatLoss: 0.30, muscleGain: 0.30, performance: 0.40 },
    lifestyle: { fatLoss: 0.35, muscleGain: 0.35, performance: 0.30 },
  };
  return vecs[goal] || vecs.bulk;
}

function computeUserState(user, weightLog, checkIn) {
  const bodyComp      = computeBodyComp(user);
  const bmr           = computeBMR(user);
  const { tdee, pal } = computeTDEE(user, bmr);
  const rcs           = computeRCS(user, weightLog, checkIn);
  const goalVec       = computeGoalVector(user.goal || "bulk");
  return { bodyComp, bmr, tdee, pal, rcs, goalVec };
}

// ── SECTION 3: NUTRITION TARGET ENGINE ───────────────────────────────────────
// True macro cycling: algebraically solve rest-day calories from weekly target

function computeNutritionTargets(user, userState, isTrainingDay = true, calAdjustment = 0) {
  const { bodyComp, tdee, pal } = userState;
  const goal     = user.goal  || "bulk";
  const level    = user.level || "intermediate";
  const weightKg = bodyComp.weightKg;
  const lbmKg    = bodyComp.lbmKg;
  const { ffmi }  = bodyComp;

  // ── Training sessions/week by level ──────────────────────────────────────
  const SESS_WK = { beginner: 3, intermediate: 4, advanced: 5, competitor: 6 };
  const T = SESS_WK[level] || 4;     // training days/week
  const R = 7 - T;                    // rest days/week

  // ── Weekly calorie delta by goal × level ─────────────────────────────────
  // FFMI ceiling scalar: beginners have more room to bulk aggressively
  const ceilingFFMI = user.sex === "female" ? 21 : 26;
  const headroom    = Math.max(0, ceilingFFMI - ffmi);
  const ffmiScalar  = Math.min(1.0, Math.max(0.10, headroom / 5));

  const WEEKLY_DELTA = {
    bulk:      { beginner: 1750, intermediate: 1575, advanced: 1225, competitor: 1225 },
    cut:       { beginner:-2450, intermediate:-3150, advanced:-2450, competitor:-4200 },
    recomp:    { beginner:  350, intermediate:  175, advanced:     0, competitor:    0 },
    contest:   { beginner:-4200, intermediate:-4200, advanced:-3500, competitor:-4550 },
    maintain:  { beginner:    0, intermediate:    0, advanced:     0, competitor:    0 },
    lifestyle: { beginner:    0, intermediate:    0, advanced:     0, competitor:    0 },
  };
  let weeklyDelta = ((WEEKLY_DELTA[goal] || WEEKLY_DELTA.bulk)[level] || 0) * ffmiScalar;

  // Adaptive thermogenesis: competitor in long deficit gets upward correction
  if (goal === "contest" && level === "competitor") weeklyDelta = weeklyDelta * 0.90;

  weeklyDelta += calAdjustment * 7;

  // ── Train-day calorie bonus (carb bump covers exercise glycogen demand) ───
  const TRAIN_BONUS = { bulk: 150, cut: 100, recomp: 100, contest: 75, maintain: 0, lifestyle: 0 };
  const trainBonus = TRAIN_BONUS[goal] || 0;

  // ── Solve for rest-day calories ───────────────────────────────────────────
  // weekly: T × trainCal + R × restCal = 7 × (TDEE + weeklyDelta/7)
  // trainCal = TDEE + weeklyDelta/7 + trainBonus
  // restCal  = [7×(TDEE + weeklyDelta/7) - T×trainCal] / R
  const weeklyTarget = 7 * tdee + weeklyDelta;
  const trainCal_raw = tdee + weeklyDelta / 7 + trainBonus;
  const restCal_raw  = R > 0 ? (weeklyTarget - T * trainCal_raw) / R : trainCal_raw;

  // ── Hard calorie floors — never more than 750 kcal/day below TDEE ────────
  // lbmKg * 44 was a maintenance multiplier — wrong as a floor. Use TDEE-anchored floor instead.
  const absFloor   = user.sex === "female" ? 1200 : 1500;
  const trainFloor = Math.max(absFloor, Math.round(tdee - 750));
  const restFloor  = Math.max(absFloor - 100, Math.round(tdee - 850));

  let floorsApplied  = false;
  let cyclingActive  = true;

  let trainCal = Math.round(trainCal_raw);
  let restCal  = Math.round(restCal_raw);

  if (restCal < restFloor) {
    // Cycling not viable — disable and use flat target
    restCal      = restFloor;
    trainCal     = Math.round((weeklyTarget - R * restCal) / T);
    cyclingActive = false;
    floorsApplied = true;
  }
  trainCal = Math.max(trainCal, trainFloor);

  // ── Protein ───────────────────────────────────────────────────────────────
  const P_COEFF = { bulk: 2.0, cut: 2.8, recomp: 2.5, contest: 3.0, maintain: 1.9, lifestyle: 1.8 };
  const ageAdj  = (parseFloat(user.age) || 25) > 40 ? 0.3 : 0;
  const protein = Math.round(lbmKg * ((P_COEFF[goal] || 2.0) + ageAdj));

  // ── Fat (hormonal floor: 0.9 g/kg) ──────────────────────────────────────
  const fatBase = Math.max(45, Math.round(weightKg * 0.9));

  // ── Derive carbs by calorie remainder ────────────────────────────────────
  const trainC = Math.max(50, Math.round((trainCal - protein * 4 - fatBase * 9) / 4));
  const restC  = Math.max(50, Math.round((restCal  - protein * 4 - fatBase * 9) / 4));

  // On rest days shift ~10% of calories from carbs to fat (insulin sensitivity)
  const restFatBonus  = Math.round(restC * 0.10 * 4 / 9);    // kcal moved → fat grams
  const restCAdj      = Math.max(50, restC  - Math.round(restC  * 0.10));
  const restFat       = Math.min(Math.round(fatBase * 1.25), fatBase + restFatBonus);
  const trainFat      = fatBase;

  // Recompute actuals after fat shift
  const trainCalActual = Math.round(protein * 4 + trainC  * 4 + trainFat * 9);
  const restCalActual  = Math.round(protein * 4 + restCAdj * 4 + restFat  * 9);
  const weeklyAvg      = Math.round((T * trainCalActual + R * restCalActual) / 7);

  // ── Return day-type slice + full metadata ─────────────────────────────────
  const dayResult = isTrainingDay
    ? { cal: trainCalActual, p: protein, c: trainC,    f: trainFat }
    : { cal: restCalActual,  p: protein, c: restCAdj,  f: restFat  };

  return {
    ...dayResult,
    trainCal:  trainCalActual,
    trainC,
    trainF:    trainFat,
    restCal:   restCalActual,
    restC:     restCAdj,
    restF:     restFat,
    weeklyAvg,
    weeklyDelta: Math.round(weeklyDelta),
    tdee,
    pal,
    sessPerWeek:   T,
    cyclingActive,
    floorsApplied,
    calAdjustment,
    source: "apex_engine_v2",
  };
}

// ── SECTION 5: FEEDBACK LOOP — WEIGHT TREND ANALYSIS ─────────────────────────

function analyzeWeightTrend(weightLog) {
  if (!weightLog || weightLog.length < 3)
    return { rate: 0, classification: "insufficient_data", confidence: 0, forecast7d: null, currentWeight: null };

  const sorted = [...weightLog].sort((a, b) => a.ts - b.ts);
  // Prefer last 14 days; fall back to last 10 entries
  const cutoff14 = Date.now() - 14 * 86400000;
  const windowed = sorted.filter(e => e.ts >= cutoff14);
  const pts = (windowed.length >= 3 ? windowed : sorted.slice(-10)).map((e, i, arr) => ({
    x: (e.ts - arr[0].ts) / 86400000,
    y: e.weight,
  }));

  const { slope, r2 } = linearRegression(pts);
  const weeklyRate    = slope * 7;  // lbs/week
  const currentWeight = sorted[sorted.length - 1].weight;

  let classification;
  const aw = Math.abs(weeklyRate);
  if      (aw < 0.15)                       classification = "stable";
  else if (weeklyRate > 0 && aw < 0.5)      classification = "gaining_slow";
  else if (weeklyRate > 0 && aw < 1.2)      classification = "gaining_moderate";
  else if (weeklyRate > 0)                   classification = "gaining_fast";
  else if (weeklyRate < 0 && aw < 0.75)     classification = "losing_slow";
  else if (weeklyRate < 0 && aw < 1.5)      classification = "losing_moderate";
  else                                       classification = "losing_fast";

  return {
    rate:          Math.round(weeklyRate * 100) / 100,
    classification,
    confidence:    Math.round(r2 * 100) / 100,
    forecast7d:    Math.round((currentWeight + weeklyRate) * 10) / 10,
    currentWeight,
    slopePerDay:   slope,
    dataPoints:    pts.length,
  };
}

function getGoalRateInfo(goal) {
  const map = {
    cut:         { label:"RATE OF LOSS", min:-1.0,  max:-0.5,  dir:-1 },
    bulk:        { label:"RATE OF GAIN", min: 0.25, max: 0.75, dir: 1 },
    recomp:      { label:"RECOMP RATE",  min:-0.25, max: 0.25, dir: 0 },
    maintenance: { label:"WEIGHT RATE",  min:-0.25, max: 0.25, dir: 0 },
    contest:     { label:"RATE OF LOSS", min:-1.5,  max:-0.75, dir:-1 },
  };
  return map[goal] || null;
}

function classifyRate(rate, info) {
  if (info.dir === -1) {
    if (rate >= info.max) return { label:"Too slow", key:"red" };
    if (rate <= info.min) return { label:"Too fast", key:"accent" };
    return { label:"On track", key:"green" };
  }
  if (info.dir === 1) {
    if (rate <= info.min) return { label:"Too slow", key:"muted" };
    if (rate >= info.max) return { label:"Too fast", key:"red" };
    return { label:"On track", key:"green" };
  }
  if (Math.abs(rate) <= 0.25) return { label:"Stable", key:"green" };
  return rate > 0 ? { label:"Gaining", key:"accent" } : { label:"Losing", key:"muted" };
}

// ── WEIGH-IN STREAK ───────────────────────────────────────────────────────────
function computeWeighInStreak(weightLog) {
  if (!weightLog || !weightLog.length)
    return { current: 0, best: 0, lastDaysAgo: null, loggedToday: false, urgency: "none" };

  const sorted = [...weightLog].sort((a, b) => a.ts - b.ts);
  const toKey  = ts => new Date(ts).toDateString();
  const days   = [...new Set(sorted.map(e => toKey(e.ts)))];

  const todayKey    = new Date().toDateString();
  const loggedToday = days.includes(todayKey);
  const lastDaysAgo = Math.floor((Date.now() - sorted[sorted.length - 1].ts) / 86400000);

  // Walk back from today (or yesterday) counting consecutive days
  let current = 0;
  const cursor = new Date();
  if (!loggedToday) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 366; i++) {
    if (days.includes(cursor.toDateString())) { current++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  // All-time best streak
  let best = current, run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000);
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const urgency = loggedToday ? "none"
    : lastDaysAgo <= 1 ? "nudge"
    : lastDaysAgo <= 2 ? "warn"
    : "danger";

  return { current, best, lastDaysAgo, loggedToday, urgency };
}

// ── GOAL PACING ENGINE ────────────────────────────────────────────────────────
function computeGoalPacing(weightLog, user) {
  const goal = user?.goal || "bulk";
  const info = getGoalRateInfo(goal);
  if (!info || !weightLog || weightLog.length < 3)
    return { status: "insufficient_data" };

  const trend = analyzeWeightTrend(weightLog);
  if (trend.dataPoints < 3) return { status: "insufficient_data" };

  const sorted      = [...weightLog].sort((a, b) => a.ts - b.ts);
  const firstWeight = sorted[0].weight;
  const totalChange = Math.round((trend.currentWeight - firstWeight) * 10) / 10;
  const rate        = trend.rate;
  const targetRate  = (info.min + info.max) / 2;   // ideal midpoint
  const rateStatus  = classifyRate(rate, info);

  // Status → label + color key
  let status, statusLabel, colorKey;
  const wrongDir = (info.dir === -1 && rate > 0.1) || (info.dir === 1 && rate < -0.1);
  if (wrongDir) {
    status = "off_course"; statusLabel = "WRONG DIRECTION"; colorKey = "red";
  } else if (rateStatus.label === "On track" || rateStatus.label === "Stable") {
    status = "on_track"; statusLabel = "ON TRACK"; colorKey = "green";
  } else if (rateStatus.label === "Too fast") {
    status = "ahead";
    statusLabel = info.dir === -1 ? "CUTTING FAST" : "GAINING FAST";
    colorKey = "accent";
  } else {
    const noMovement = Math.abs(rate) < 0.05;
    status = noMovement ? "off_course" : "behind";
    statusLabel = noMovement ? "NOT MOVING" : "BEHIND PACE";
    colorKey = noMovement ? "red" : "red";
  }

  // Milestone targets (cumulative change from first weigh-in)
  const MILESTONES = {
    cut:      [-2.5, -5, -10, -15, -20, -25],
    contest:  [-2.5, -5, -10, -15, -20, -25, -30],
    bulk:     [2.5,  5,  10,  15,  20],
    recomp:   [-5,  -2.5, 0, 2.5, 5],
    maintain: [-2,  -1, 0, 1, 2],
    lifestyle:[-5,  -2.5, 0, 2.5, 5],
  };
  const milestones = MILESTONES[goal] || MILESTONES.bulk;
  const dir        = info.dir;

  let nextMilestone = null, etaWeeks = null;
  if (dir !== 0) {
    const ahead = milestones.filter(m => dir > 0 ? m > totalChange : m < totalChange);
    nextMilestone = ahead.length
      ? ahead.reduce((a, b) => Math.abs(a - totalChange) < Math.abs(b - totalChange) ? a : b)
      : null;
    if (nextMilestone !== null && Math.abs(rate) > 0.05) {
      etaWeeks = Math.ceil(Math.abs(nextMilestone - totalChange) / Math.abs(rate));
    }
  }

  // Momentum 0-100
  const rateDeviation = Math.abs(rate - (dir === 0 ? 0 : targetRate));
  const idealHalf     = Math.abs(info.max - info.min) / 2 || 0.5;
  const rateScore     = Math.max(0, Math.min(50, 50 * (1 - rateDeviation / (idealHalf * 4))));
  const confScore     = trend.confidence * 25;
  const dataScore     = Math.min(25, (trend.dataPoints / 14) * 25);
  const momentum      = Math.round(rateScore + confScore + dataScore);

  // Pace bar 0–100 (capped at target max = 100)
  const paceBarPct = targetRate !== 0 ? Math.min(110, (Math.abs(rate) / Math.abs(targetRate)) * 100) : 0;

  return {
    status, statusLabel, colorKey,
    rate, targetRate, totalChange,
    etaWeeks, nextMilestone, momentum,
    paceBarPct, dir,
    info,
    dataPoints: trend.dataPoints,
    confidence: trend.confidence,
    forecast7d: trend.forecast7d,
  };
}

// ── GOAL CONFIG ENGINE ────────────────────────────────────────────────────────
// Derives a physiologically-grounded goal weight from body composition targets,
// not from user-entered preference. Source of truth for all trajectory logic.

function bfToVisualOutcome(bf, sex) {
  if (sex === "male") {
    if (bf <= 6)  return "stage conditioning — extreme definition, visible striations";
    if (bf <= 8)  return "contest lean — very visible abs, vascularity";
    if (bf <= 10) return "shredded — sharp ab definition in any lighting";
    if (bf <= 13) return "athletic lean — clear abs in good lighting";
    if (bf <= 17) return "fit — muscular appearance, some ab definition";
    if (bf <= 22) return "average lean — healthy, no visible abs";
    return "recomposition zone — meaningful body composition work ahead";
  } else {
    if (bf <= 12) return "stage conditioning — competition ready";
    if (bf <= 15) return "very lean — bikini/figure athlete";
    if (bf <= 18) return "athletic — visible core definition";
    if (bf <= 23) return "fit and toned";
    if (bf <= 28) return "healthy average";
    return "recomposition zone — meaningful body composition work ahead";
  }
}

function computeGoalConfig(user) {
  const goal  = user.goal  || "bulk";
  const level = user.level || "intermediate";
  const sex   = user.sex   || "male";

  // Body comp from current profile (uses height-in-inches conversion internally)
  const bodyComp = computeBodyComp(user);
  const { lbmKg, bfPct, ffmi, weightKg } = bodyComp;
  const heightCm = parseFloat(user.height) ? parseFloat(user.height) * 2.54 : 175;
  const heightM  = heightCm / 100;

  const currentWeightLbs = Math.round(weightKg * 2.20462 * 10) / 10;
  const currentLbmLbs    = Math.round(lbmKg    * 2.20462 * 10) / 10;

  // ── TARGET BF% BY GOAL × SEX × LEVEL ─────────────────────────────────────
  const TARGET_BF = {
    cut: {
      male:   { beginner:15, intermediate:12, advanced:10, competitor:8  },
      female: { beginner:22, intermediate:20, advanced:18, competitor:12 },
    },
    contest: {
      male:   { beginner:10, intermediate:8,  advanced:7,  competitor:6  },
      female: { beginner:16, intermediate:14, advanced:12, competitor:10 },
    },
    lifestyle: {
      male:   { beginner:18, intermediate:16, advanced:14, competitor:12 },
      female: { beginner:25, intermediate:23, advanced:21, competitor:18 },
    },
  };

  // ── COMPUTE GOAL WEIGHT ───────────────────────────────────────────────────
  let goalWeightLbs, goalBfPct, goalLbmLbs, goalLbmKg, goalFFMI;
  let isDualTarget = false;

  if (goal === "recomp" || goal === "maintain") {
    // Weight stays roughly flat; composition shifts
    isDualTarget   = true;
    const bfDrop   = goal === "recomp" ? 3.5 : 1;
    const lbmGainKg = goal === "recomp" ? 2 : 0;
    goalBfPct      = Math.max(bfPct - bfDrop, sex === "male" ? 6 : 12);
    goalLbmKg      = lbmKg + lbmGainKg;
    goalLbmLbs     = Math.round(goalLbmKg * 2.20462 * 10) / 10;
    const goalWtKg = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs  = Math.round(goalWtKg * 2.20462 * 10) / 10;
    goalFFMI       = Math.round((goalLbmKg / (heightM * heightM)) * 10) / 10;

  } else if (goal === "bulk") {
    // FFMI headroom model — project 1 year of natural muscle gain
    const CEILING   = sex === "male" ? 25.5 : 21;
    const YR_GAIN   = { beginner:1.5, intermediate:0.8, advanced:0.4, competitor:0.2 };
    const headroom  = Math.max(0, CEILING - ffmi);
    const potential = Math.min(headroom, YR_GAIN[level] || 0.8);
    goalFFMI        = Math.round(Math.min(ffmi + potential, CEILING) * 10) / 10;
    goalLbmKg       = goalFFMI * (heightM * heightM);
    goalLbmLbs      = Math.round(goalLbmKg * 2.20462 * 10) / 10;
    const bfIncrease = { beginner:3, intermediate:2, advanced:2, competitor:1.5 }[level] || 2;
    goalBfPct       = Math.min(bfPct + bfIncrease, sex === "male" ? 20 : 28);
    const goalWtKg  = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs   = Math.round(goalWtKg * 2.20462 * 10) / 10;

  } else {
    // cut / contest / lifestyle — preserve LBM, reduce fat to target %
    const bfTable  = TARGET_BF[goal]?.[sex] || TARGET_BF.cut[sex];
    goalBfPct      = bfTable[level] ?? (sex === "male" ? 12 : 20);
    // Never target below essential fat
    goalBfPct      = Math.max(goalBfPct, sex === "male" ? 5 : 12);
    goalLbmKg      = lbmKg;  // LBM preserved on cut
    goalLbmLbs     = currentLbmLbs;
    const goalWtKg = goalLbmKg / (1 - goalBfPct / 100);
    goalWeightLbs  = Math.round(goalWtKg * 2.20462 * 10) / 10;
    goalFFMI       = Math.round((goalLbmKg / (heightM * heightM)) * 10) / 10;
  }

  goalBfPct = Math.round(goalBfPct * 10) / 10;

  // Acceptable ±range (used for override validation and UI band)
  const rangeBuffer  = isDualTarget ? 3 : 4;
  const goalWeightRange = [
    Math.round((goalWeightLbs - rangeBuffer) * 10) / 10,
    Math.round((goalWeightLbs + rangeBuffer) * 10) / 10,
  ];

  // ── IDEAL WEEKLY RATE ─────────────────────────────────────────────────────
  const IDEAL_RATE = {
    cut:       { beginner:0.75, intermediate:0.75, advanced:0.75, competitor:1.0  },
    contest:   { beginner:1.0,  intermediate:1.25, advanced:1.0,  competitor:1.5  },
    bulk:      { beginner:0.5,  intermediate:0.4,  advanced:0.3,  competitor:0.25 },
    recomp:    { beginner:0.3,  intermediate:0.2,  advanced:0.15, competitor:0.1  },
    maintain:  { beginner:0,    intermediate:0,    advanced:0,    competitor:0    },
    lifestyle: { beginner:0.5,  intermediate:0.5,  advanced:0.5,  competitor:0.5  },
  };
  const idealRate   = (IDEAL_RATE[goal] || IDEAL_RATE.bulk)[level] || 0.5;
  const totalDelta  = Math.abs(goalWeightLbs - currentWeightLbs);
  const etaWeeks    = idealRate > 0 ? Math.ceil(totalDelta / idealRate) : (isDualTarget ? 16 : 0);
  const etaDate     = new Date(Date.now() + etaWeeks * 7 * 86400000)
    .toLocaleDateString("en-US", { month:"long", year:"numeric" });

  // ── SUSTAINABILITY SCORE (0-100) ──────────────────────────────────────────
  let sustainScore = 100;
  if      (totalDelta > 30) sustainScore -= 25;
  else if (totalDelta > 20) sustainScore -= 12;
  else if (totalDelta > 15) sustainScore -= 5;
  if      (etaWeeks < 6)   sustainScore -= 20;
  else if (etaWeeks < 8)   sustainScore -= 8;
  if (etaWeeks >= 12 && etaWeeks <= 20) sustainScore += 5;
  if (goalBfPct < (sex === "male" ? 7 : 14)) sustainScore -= 15;
  if (goal === "bulk" && goalFFMI > 24 && sex === "male") sustainScore -= 10;
  sustainScore = Math.max(0, Math.min(100, Math.round(sustainScore)));

  // ── REALISTIC RATING ──────────────────────────────────────────────────────
  let realisticRating;
  if      (goal === "recomp" || goal === "maintain") realisticRating = "moderate";
  else if (totalDelta <= 10 && etaWeeks >= 10)       realisticRating = "conservative";
  else if (totalDelta <= 20 && etaWeeks >= 8)        realisticRating = "moderate";
  else if (totalDelta <= 30 && etaWeeks >= 6)        realisticRating = "aggressive";
  else                                               realisticRating = "unrealistic";

  // ── VISUAL OUTCOMES ───────────────────────────────────────────────────────
  const currentVisual = bfToVisualOutcome(bfPct,    sex);
  const goalVisual    = bfToVisualOutcome(goalBfPct, sex);

  // ── RATIONALE (shown to user) ─────────────────────────────────────────────
  let rationale;
  if (goal === "cut" || goal === "contest") {
    rationale = `At ${currentWeightLbs} lbs and ~${bfPct.toFixed(1)}% body fat (${currentVisual}), your lean mass of ${currentLbmLbs} lbs supports a goal of ${goalWeightLbs} lbs at ${goalBfPct}% BF — ${goalVisual}. This preserves your muscle while achieving your visual outcome in ~${etaWeeks} weeks.`;
  } else if (goal === "bulk") {
    rationale = `Your FFMI of ${ffmi.toFixed(1)} gives meaningful room to grow. A ${etaWeeks}-week lean bulk targeting FFMI ${goalFFMI} puts you at ${goalWeightLbs} lbs at ~${goalBfPct}% BF — adding muscle while keeping fat gain controlled.`;
  } else if (goal === "recomp") {
    rationale = `Recomposition keeps your scale weight near ${currentWeightLbs} lbs while body fat drops from ${bfPct.toFixed(1)}% to ~${goalBfPct}% and lean mass increases ~${Math.round((goalLbmLbs - currentLbmLbs) * 10) / 10} lbs. Slower than a dedicated phase, but produces the most balanced outcome.`;
  } else if (goal === "maintain") {
    rationale = `Hold ${currentWeightLbs} lbs while gradually improving composition. Precision nutrition keeps BF near ${goalBfPct.toFixed(1)}% long-term.`;
  } else {
    rationale = `A ${goal} phase targeting ${goalWeightLbs} lbs at ${goalBfPct.toFixed(1)}% BF over ~${etaWeeks} weeks. Balanced pace for adherence.`;
  }

  return {
    id:                   String(Date.now()),
    createdAt:            Date.now(),
    updatedAt:            Date.now(),
    goalType:             goal,

    // System-derived targets
    goalWeight:           goalWeightLbs,
    goalWeightRange,
    goalBfPct,
    goalLbmLbs,
    goalFFMI,
    isDualTarget,

    // Evaluation
    sustainabilityScore:  sustainScore,
    realisticRating,
    etaWeeks,
    etaDate,
    idealWeeklyRate:      idealRate,
    projectedVisualOutcome: goalVisual,
    currentVisualOutcome:   currentVisual,
    rationale,

    // Baselines for delta tracking
    startWeight:          currentWeightLbs,
    startBfPct:           Math.round(bfPct * 10) / 10,
    startLbmLbs:          currentLbmLbs,
    startFFMI:            ffmi,

    // User override
    userOverrideWeight:   null,
    overrideAccepted:     false,
    overrideTs:           null,
    effectiveGoalWeight:  goalWeightLbs,

    // Revision tracking (populated by Phase 3 accept/defer/dismiss)
    acknowledgedTriggers: [],
    snoozedUntil:         null,
    revisionHistory:      [],
  };
}

// ── PHASE 2: SNAPSHOT ENGINE ─────────────────────────────────────────────────

// Returns true when enough new data has accumulated to justify a new snapshot
function shouldTakeSnapshot(weightLog, allSnapshots) {
  if (!weightLog || weightLog.length < 3) return false;
  if (!allSnapshots.length) return true;                         // first snapshot ever

  const last       = allSnapshots[allSnapshots.length - 1];
  const daysSince  = Math.floor((Date.now() - last.ts) / 86400000);
  if (daysSince >= 7) return true;                               // weekly cadence

  const newLogs = weightLog.filter(e => e.ts > last.ts);
  return newLogs.length >= 4;                                    // 4+ new data points
}

// Captures a full physiological + progress state at a point in time
function computeProgressSnapshot(user, sortedLog, goalConfig, nutLogs, trainingHistory) {
  const bodyComp        = computeBodyComp(user);
  const { lbmLbs, bfPct, ffmi, weightKg } = bodyComp;  // lbmLbs available via bodyComp
  const currentWeightLbs = Math.round(weightKg * 2.20462 * 10) / 10;
  const lbmLbsVal        = Math.round(bodyComp.lbmLbs * 10) / 10;

  const trend    = analyzeWeightTrend(sortedLog);
  const info     = getGoalRateInfo(user.goal || "bulk");

  // Plateau: meaningful goal, enough data, near-zero movement
  const goalDir  = info?.dir ?? 0;
  const moving   = Math.abs(trend.rate) > 0.15;
  const plateauDetected = !!(
    info && trend.dataPoints >= 10 && !moving && goalDir !== 0
  );

  // Rate alert
  let rateAlert = null;
  if (info && trend.dataPoints >= 5) {
    const st = classifyRate(trend.rate, info);
    if      (st.label === "Too fast")                        rateAlert = "too_fast";
    else if (st.label === "Too slow")                        rateAlert = "too_slow";
    else if (goalDir ===  1 && trend.rate < -0.1)           rateAlert = "off_course";
    else if (goalDir === -1 && trend.rate >  0.1)           rateAlert = "off_course";
  }

  // Progress toward goal
  const effective    = goalConfig?.effectiveGoalWeight ?? null;
  const weightToGoal = effective !== null
    ? Math.round((currentWeightLbs - effective) * 10) / 10 : null;
  const bfToGoal     = goalConfig?.goalBfPct !== undefined
    ? Math.round((bfPct - goalConfig.goalBfPct) * 10) / 10 : null;
  const deltaFromStart = goalConfig?.startWeight !== undefined
    ? Math.round((currentWeightLbs - goalConfig.startWeight) * 10) / 10 : null;

  // Recalculated ETA from current rate
  const etaWeeks = (effective !== null && Math.abs(trend.rate) > 0.05)
    ? Math.ceil(Math.abs(weightToGoal) / Math.abs(trend.rate))
    : goalConfig?.etaWeeks ?? null;

  // Adherence (training + nutrition)
  const sessWk         = { beginner:3, intermediate:4, advanced:5, competitor:6 }[user.level||"intermediate"] || 4;
  const adherenceScore = computeAdherenceScore(nutLogs, trainingHistory, sessWk);

  return {
    ts:               Date.now(),
    weight:           currentWeightLbs,
    estimatedBfPct:   Math.round(bfPct  * 10) / 10,
    estimatedLbmLbs:  lbmLbsVal,
    ffmi:             Math.round(ffmi   * 10) / 10,
    weeklyRate:       trend.rate,
    rateConfidence:   trend.confidence,
    dataPoints:       trend.dataPoints,
    weightToGoal,
    bfToGoal,
    deltaFromStart,
    etaWeeks,
    adherenceScore,
    plateauDetected,
    rateAlert,
    goalRevisionSuggested: false,   // set by evaluateGoalRevision
    revisionReason:        null,
    revisionTrigger:       null,
  };
}

// Analyses a new snapshot against history and goalConfig;
// returns a structured revision suggestion or null
function evaluateGoalRevision(snap, goalConfig, allSnapshots) {
  if (!snap || !goalConfig) return null;

  // Respect snooze window (set by "Defer 7d")
  if (goalConfig.snoozedUntil && Date.now() < goalConfig.snoozedUntil) return null;

  const acked  = new Set(goalConfig.acknowledgedTriggers || []);
  const goal   = goalConfig.goalType;
  const recent = allSnapshots.slice(-4);   // ~4 weeks lookback

  // ── Trigger 1: LBM erosion on cut ─────────────────────────────────────────
  if (!acked.has("lbm_loss") && (goal === "cut" || goal === "contest") && goalConfig.startLbmLbs) {
    const lbmLoss = goalConfig.startLbmLbs - snap.estimatedLbmLbs;
    if (lbmLoss > 4) {
      const revised = Math.round(snap.estimatedLbmLbs / (1 - goalConfig.goalBfPct / 100) * 10) / 10;
      return {
        suggested: true, trigger: "lbm_loss", confidence: "high",
        revisedGoalWeight: revised,
        reason: `You've lost ~${lbmLoss.toFixed(1)} lbs of lean mass since starting. A revised goal of ${revised} lbs still hits ${goalConfig.goalBfPct}% BF while protecting what you've built.`,
      };
    }
  }

  // ── Trigger 2: Persistent plateau ─────────────────────────────────────────
  if (!acked.has("plateau")) {
    const plateauStreak = recent.filter(s => s.plateauDetected).length;
    if (snap.plateauDetected && plateauStreak >= 2) {
      const lever = (goal === "cut" || goal === "contest") ? "calorie deficit" : "surplus";
      return {
        suggested: true, trigger: "plateau", confidence: "medium",
        revisedGoalWeight: null,
        reason: `Trend stalled (< 0.15 lbs/wk) for ${plateauStreak + 1} consecutive snapshots. Your ${lever} may need recalibration, or this weight is a natural set-point worth reassessing.`,
      };
    }
  }

  // ── Trigger 3: Timeline slippage ≥ 1.6× original ──────────────────────────
  if (!acked.has("timeline_extended") && snap.etaWeeks && goalConfig.etaWeeks && snap.rateConfidence >= 0.5) {
    if (snap.etaWeeks > goalConfig.etaWeeks * 1.6) {
      return {
        suggested: true, trigger: "timeline_extended", confidence: "medium",
        revisedGoalWeight: null,
        reason: `Original ETA was ${goalConfig.etaWeeks} weeks; at your current pace it's now ${snap.etaWeeks}. Tighten your protocol or reset the timeline.`,
      };
    }
  }

  // ── Trigger 4: Running leaner than projected (cut ahead of pace) ───────────
  if (!acked.has("ahead_of_pace") && (goal === "cut" || goal === "contest") && goalConfig.startBfPct && goalConfig.etaWeeks > 0) {
    const weeksElapsed = Math.max(1, Math.round((Date.now() - goalConfig.createdAt) / (7 * 86400000)));
    const expectedDrop = (goalConfig.startBfPct - goalConfig.goalBfPct) * (weeksElapsed / goalConfig.etaWeeks);
    const actualDrop   = goalConfig.startBfPct - snap.estimatedBfPct;
    if (actualDrop > expectedDrop * 1.4 && actualDrop > 3 && weeksElapsed >= 4) {
      const projected = Math.round(snap.estimatedLbmLbs / (1 - goalConfig.goalBfPct / 100) * 10) / 10;
      return {
        suggested: true, trigger: "ahead_of_pace", confidence: "medium",
        revisedGoalWeight: projected,
        reason: `You're leaning out ahead of schedule. At this rate you'll hit ${goalConfig.goalBfPct}% BF at ~${projected} lbs — ${(goalConfig.effectiveGoalWeight - projected).toFixed(1)} lbs above your original target. Stopping here protects performance and hormones.`,
      };
    }
  }

  // ── Trigger 5: Fat-dominant bulk (FFMI ceiling approaching) ───────────────
  if (!acked.has("ffmi_ceiling") && goal === "bulk" && snap.ffmi >= 22.5 && recent.length >= 2) {
    const first      = recent[0];
    const wtGain     = snap.weight - first.weight;
    const lbmGain    = snap.estimatedLbmLbs - first.estimatedLbmLbs;
    const efficiency = wtGain > 0.5 ? lbmGain / wtGain : 1;
    if (efficiency < 0.35 && wtGain > 2) {
      return {
        suggested: true, trigger: "ffmi_ceiling", confidence: "medium",
        revisedGoalWeight: null,
        reason: `At FFMI ${snap.ffmi.toFixed(1)}, recent gains are ~${Math.round(efficiency * 100)}% lean mass. Fat-dominant gains near your ceiling suggest a cut phase would sharpen your physique before your next bulk.`,
      };
    }
  }

  return null;
}

// ── GOAL-NUTRITION BRIDGE ────────────────────────────────────────────────────
// Derives a daily calorie adjustment needed to hit goalConfig.idealWeeklyRate.
// More precise than the classification-based runProtocolDecision because it
// anchors directly to the user's specific goal rate, not generic thresholds.
//
// Formula: deviation (lbs/wk) × 3500 kcal/lb ÷ 7 days = kcal/day to adjust
// Positive result → add calories (rate too slow toward bulk / recovering from fast cut)
// Negative result → remove calories (rate too slow on cut / over-eating on bulk)

function computeNutritionAdjustment(goalConfig, weightTrend) {
  if (!goalConfig || !weightTrend) return 0;
  if (!goalConfig.idealWeeklyRate || goalConfig.idealWeeklyRate === 0) return 0;
  if (goalConfig.isDualTarget) return 0;               // recomp — weight not the signal
  if (weightTrend.dataPoints < 7)                      return 0;  // need enough data
  if (weightTrend.confidence < 0.5)                    return 0;  // low-quality trend

  const ideal    = goalConfig.idealWeeklyRate;          // e.g. -0.75 lbs/wk for cut
  const actual   = weightTrend.rate;                    // e.g. -0.30 lbs/wk
  const deviation = ideal - actual;                     // -0.45 → need bigger deficit

  // Only adjust when deviation is meaningful (> 20% of the target rate)
  if (Math.abs(deviation) < Math.abs(ideal) * 0.20) return 0;

  const rawAdj = Math.round((deviation * 3500) / 7);
  const MAX    = 300;  // never suggest more than 300 kcal/day change at once
  return Math.max(-MAX, Math.min(MAX, rawAdj));
}

// ── SECTION 5: E1RM & STRENGTH TREND ─────────────────────────────────────────

function computeE1RM(weight, reps) {
  const w = parseFloat(weight), r = parseFloat(reps);
  if (!w || !r) return 0;
  return Math.round(w * (1 + r / 30));   // Epley formula
}

function analyzeStrengthTrend(trainingHistory) {
  if (!trainingHistory || trainingHistory.length < 2) return {};
  const exData = {};
  trainingHistory.forEach((sess, si) => {
    (sess.completedExercises || []).forEach(ex => {
      if (!exData[ex.name]) exData[ex.name] = [];
      const best = (ex.loggedSets || [])
        .filter(s => s.reps && s.weight)
        .reduce((b, s) => Math.max(b, computeE1RM(s.weight, s.reps)), 0);
      if (best > 0) exData[ex.name].push({ x: si, y: best, ts: sess.ts });
    });
  });
  const trends = {};
  Object.entries(exData).forEach(([name, pts]) => {
    if (pts.length < 2) return;
    const { slope, r2 } = linearRegression(pts);
    trends[name] = {
      slope:    Math.round(slope * 10) / 10,
      r2:       Math.round(r2    * 100) / 100,
      latest:   pts[pts.length - 1].y,
      sessions: pts.length,
      trend:    slope > 0.5 ? "improving" : slope < -0.5 ? "declining" : "maintaining",
    };
  });
  return trends;
}

// ── SECTION 5: ADHERENCE SCORING ─────────────────────────────────────────────

function computeAdherenceScore(nutLogs, trainingHistory, targetSessionsPerWeek = 4) {
  const cutoff = Date.now() - 7 * 86400000;
  const recentSessions = (trainingHistory || []).filter(s => s.ts >= cutoff).length;
  const trainingAdherence = Math.min(recentSessions / Math.max(targetSessionsPerWeek * 0.6, 2), 1.0);
  const nutDays = new Set(
    (nutLogs || []).filter(l => l.ts >= cutoff).map(l => new Date(l.ts).toDateString())
  ).size;
  const nutAdherence = Math.min(nutDays / 7, 1.0);
  return Math.round((nutAdherence * 0.55 + trainingAdherence * 0.45) * 100);
}

// ── SECTION 6: CONFIDENCE SCORING ────────────────────────────────────────────

function computeConfidenceScore(weightLog, trainingHistory, nutLogs) {
  const c7  = Date.now() - 7  * 86400000;
  const c14 = Date.now() - 14 * 86400000;
  const wt7   = Math.min((weightLog     || []).filter(e => e.ts >= c7).length  / 7, 1) * 0.30;
  const sess  = Math.min((trainingHistory||[]).filter(s => s.ts >= c14).length / 5, 1) * 0.25;
  const nut   = Math.min(new Set((nutLogs||[]).filter(l=>l.ts>=c7).map(l=>new Date(l.ts).toDateString())).size / 7, 1) * 0.25;
  const rich  = Math.min((weightLog||[]).length / 14, 1) * 0.20;
  return Math.round((wt7 + sess + nut + rich) * 100) / 100;
}

// ── SECTION 6: FATIGUE DEBT MODEL ────────────────────────────────────────────

function computeFatigueDebt(trainingHistory, baselineSessions = 4) {
  if (!trainingHistory || !trainingHistory.length) return 0;
  let debt = 0;
  const now = Date.now();
  for (let week = 0; week < 3; week++) {
    const end   = now - week * 7 * 86400000;
    const start = end - 7 * 86400000;
    const sessions = trainingHistory.filter(s => s.ts >= start && s.ts < end);
    debt += Math.max(0, sessions.length - baselineSessions) * 3;
    sessions.forEach(sess => {
      const sets  = (sess.completedExercises || []).flatMap(ex => ex.loggedSets || []);
      const sfrSets = sets.filter(s => s.rpe);
      const avgSfr  = sfrSets.length ? sfrSets.reduce((s, x) => s + parseFloat(x.rpe), 0) / sfrSets.length : 3;
      // Low SFR = high fatigue cost; invert for debt calculation
      if (avgSfr <= 2) debt += 7;
      else if (avgSfr <= 3) debt += 4;
    });
  }
  return Math.round(Math.max(0, debt - 15));
}

// ── SECTION 6 + 7: DECISION ENGINE ───────────────────────────────────────────

function runProtocolDecision({ user, userState, weightTrend, confidenceScore, fatigueDebt, adaptationSignal, nutLogs, trainingHistory }) {
  const goal = user.goal || "bulk";
  const { rcs } = userState;
  const adherence = computeAdherenceScore(nutLogs, trainingHistory);
  const decisions = [];
  let calAdjustment = 0;

  // ── GATE: low adherence invalidates all trend signals ──
  if (adherence < 70) {
    return {
      calAdjustment: 0, volumeSignal: "maintain", deloadRecommended: false,
      adherence, fatigueDebt,
      decisions: [{ type: "adherence", priority: "P0",
        msg: `Adherence at ${adherence}% — fix compliance before adjusting protocol. Log consistently for 7 days to unlock intelligent recommendations.`,
        color: "red" }],
    };
  }
  // ── GATE: insufficient data ──
  if (confidenceScore < 0.45) {
    return {
      calAdjustment: 0, volumeSignal: "maintain", deloadRecommended: false,
      adherence, fatigueDebt,
      decisions: [{ type: "data", priority: "info",
        msg: `Confidence ${Math.round(confidenceScore * 100)}% — log weight daily and complete sessions to unlock protocol adjustments.`,
        color: "muted" }],
    };
  }

  // ── DELOAD CHECK ──
  let deloadRecommended = false, deloadReason = "";
  if      (fatigueDebt > 60)                  { deloadRecommended = true; deloadReason = `Fatigue debt critical (${fatigueDebt}) — immediate deload required.`; }
  else if (fatigueDebt > 40)                  { deloadRecommended = true; deloadReason = `Fatigue accumulating (${fatigueDebt}) — schedule deload this week.`; }
  else if (rcs < 40)                          { deloadRecommended = true; deloadReason = `Recovery score critical (${rcs}/100) — rest week needed.`; }
  else if (adaptationSignal === "fatigue")    { deloadRecommended = true; deloadReason = "Performance degrading across multiple sessions — deload recommended."; }
  if (deloadRecommended) decisions.push({ type: "deload", priority: "P0", msg: deloadReason, color: "red" });

  // ── CALORIE ADJUSTMENT ENGINE ──
  const conf = confidenceScore;
  const adjMag = conf >= 0.80 ? 1.0 : conf >= 0.60 ? 0.6 : 0.35;
  const rate = weightTrend.rate;
  const hasSignal = weightTrend.confidence >= 0.40 && weightTrend.dataPoints >= 5;

  if (goal === "cut" || goal === "contest") {
    if (hasSignal) {
      if (rate < -1.5) {
        calAdjustment = Math.round(175 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Losing ${Math.abs(rate).toFixed(1)} lbs/wk — too aggressive. +${calAdjustment} kcal to protect LBM.`, color: "green" });
      } else if (rate > -0.15) {
        calAdjustment = Math.round(-150 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Weight stalled on deficit. Reducing ${Math.abs(calAdjustment)} kcal to restart fat loss.`, color: "red" });
      } else {
        decisions.push({ type: "calories", priority: "info", msg: `Fat loss rate optimal: ${Math.abs(rate).toFixed(1)} lbs/wk. Hold current calories.`, color: "green" });
      }
    }
  } else if (goal === "bulk") {
    if (hasSignal) {
      if (rate > 0.6) {
        calAdjustment = Math.round(-100 * adjMag);
        decisions.push({ type: "calories", priority: "P1", msg: `Gaining ${rate.toFixed(1)} lbs/wk — surplus too aggressive. Trimming ${Math.abs(calAdjustment)} kcal.`, color: "accent" });
      } else if (rate < 0.08) {
        calAdjustment = Math.round(150 * adjMag);
        decisions.push({ type: "calories", priority: "P2", msg: `Lean bulk rate below target. Adding ${calAdjustment} kcal to support muscle growth.`, color: "green" });
      } else {
        decisions.push({ type: "calories", priority: "info", msg: `Lean bulk on track: +${rate.toFixed(1)} lbs/wk. Optimal range.`, color: "green" });
      }
    }
  } else if (goal === "recomp") {
    if (Math.abs(rate) > 0.5 && hasSignal) {
      decisions.push({ type: "calories", priority: "P2", msg: `Weight shifting ${rate > 0 ? "up" : "down"} ${Math.abs(rate).toFixed(1)} lbs/wk on recomp — verify composition via strength trends.`, color: "accent" });
    } else {
      decisions.push({ type: "calories", priority: "info", msg: "Weight stable on recomp — check strength trends to confirm muscle gain.", color: "muted" });
    }
  }

  // ── VOLUME SIGNAL ──
  let volumeSignal = "maintain";
  if (!deloadRecommended) {
    if      (adaptationSignal === "progress" && rcs >= 65) volumeSignal = "increase";
    else if (adaptationSignal === "fatigue"  || rcs < 55)  volumeSignal = "decrease";
    else if (adaptationSignal === "stall") {
      decisions.push({ type: "volume", priority: "P2", msg: "Volume stalled — increase load by 2.5–5 lbs on compound lifts rather than adding sets.", color: "accent" });
    }
  }

  // ── PLATEAU DETECTION ──
  if (weightTrend.classification === "stable" && weightTrend.confidence >= 0.60
      && (goal === "cut" || goal === "contest") && (trainingHistory || []).length >= 6) {
    decisions.push({ type: "plateau", priority: "P1", msg: "Plateau detected. Recalculate TDEE at current bodyweight and audit total weekly calories including unlogged items.", color: "accent" });
  }

  // ── RECOVERY GUIDANCE ──
  if (rcs < 55 && rcs >= 40 && !deloadRecommended) {
    decisions.push({ type: "recovery", priority: "P2", msg: `Recovery score ${rcs}/100 — reduce session intensity or add a rest day.`, color: "accent" });
  }

  return { calAdjustment, volumeSignal, deloadRecommended, adherence, fatigueDebt, decisions };
}

// ─── END APEX ALGORITHM ENGINE ────────────────────────────────────────────────

// ─── MACRO RING ───────────────────────────────────────────────────────────────

function MacroRing({protein,carbs,fat,calories}) {
  const C = useThemeColors();
  const total = protein*4+carbs*4+fat*9||1;
  const r=42, cx=54, cy=54;
  const segs=[{pct:protein*4/total,color:C.accent},{pct:carbs*4/total,color:C.green},{pct:fat*9/total,color:C.blue}];
  let angle=-90;
  const paths=segs.map(s=>{
    const a=s.pct*360, sr=angle*Math.PI/180, er=(angle+a)*Math.PI/180;
    const x1=cx+r*Math.cos(sr),y1=cy+r*Math.sin(sr),x2=cx+r*Math.cos(er),y2=cy+r*Math.sin(er);
    const d=`M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${a>180?1:0} 1 ${x2} ${y2}Z`;
    angle+=a; return {d,color:s.color};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:18}}>
      <svg width={108} height={108} viewBox="0 0 108 108">
        {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} style={{opacity:.85,animation:`macroSegIn .5s cubic-bezier(.22,1,.36,1) ${i*100}ms both`}}/>)}
        <circle cx={cx} cy={cy} r={30} fill={C.surface}/>
        <text x={cx} y={cy-3} textAnchor="middle" fill={C.text} fontSize="13" fontFamily="Bebas Neue,sans-serif" letterSpacing="1">{calories}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="DM Sans,sans-serif">KCAL</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
        {[{l:"Protein",v:`${protein}g`,cl:C.accent},{l:"Carbs",v:`${carbs}g`,cl:C.green},{l:"Fat",v:`${fat}g`,cl:C.blue}].map(m=>(
          <div key={m.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:m.cl}}/>
              <span style={{fontSize:13,color:C.faint}}>{m.l}</span>
            </div>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:C.text}}>{m.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        await window.storage.init(user.uid);
      } else {
        window.storage.clearUser();
      }
      setAuthUser(user ?? null);
    });
  }, []);

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ authUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() { return useContext(AuthContext); }

function AuthScreen() {
  const [mode, setMode]       = useState("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const ERR = {
    "auth/email-already-in-use":  "An account with this email already exists.",
    "auth/user-not-found":        "No account found with this email.",
    "auth/wrong-password":        "Incorrect password.",
    "auth/invalid-email":         "Invalid email address.",
    "auth/invalid-credential":    "Incorrect email or password.",
    "auth/weak-password":         "Password must be at least 6 characters.",
    "auth/unauthorized-domain":   "This domain isn't authorized in Firebase. Add it under Authentication → Settings → Authorized Domains.",
    "auth/network-request-failed":"Network error — check your connection and try again.",
    "auth/too-many-requests":     "Too many attempts. Wait a minute and try again.",
  };

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (mode === "signup" && password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password);
      else                   await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(ERR[e.code] || `Error: ${e.code || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); setConfirm(""); };

  return (
    <div className="auth-screen">
      {loading && <SSJLoading />}
      <WaveField fixed opacity={0.18} />
      <div className="auth-eyebrow">Performance Coaching System</div>
      <div className="auth-wordmark">APEX</div>
      <div className="auth-card">
        <div className="auth-card-title">
          {mode === "signin" ? "Welcome back," : "Create your account,"}
          <span>{mode === "signin" ? "sign in to continue" : "start your program today"}</span>
        </div>
        <div className="auth-toggle">
          <button className={`auth-tab${mode==="signin"?" active":""}`} onClick={()=>switchMode("signin")}>SIGN IN</button>
          <button className={`auth-tab${mode==="signup"?" active":""}`} onClick={()=>switchMode("signup")}>CREATE ACCOUNT</button>
        </div>
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" placeholder="you@example.com"
            value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete="email" />
        </div>
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" placeholder="••••••••"
            value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete={mode==="signup"?"new-password":"current-password"} />
        </div>
        {mode === "signup" && (
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={confirm} onChange={e=>setConfirm(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete="new-password" />
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" onClick={submit} disabled={loading}>
          {loading ? "LOADING..." : mode==="signin" ? "SIGN IN →" : "LET'S GO →"}
        </button>
      </div>
    </div>
  );
}

// ─── SSJ LOADING ──────────────────────────────────────────────────────────────

function SSJLoading() {
  return (
    <div className="ssj-overlay">
      <div className="apex-loader-word">APEX</div>
      <div className="apex-loader-bar">
        <div className="apex-loader-fill" />
      </div>
      <div className="apex-loader-label">Signing in</div>
    </div>
  );
}

// ─── CUBE BUTTON ──────────────────────────────────────────────────────────────

function CubeButton({ onClick, disabled, children, small, saved, style, className = "" }) {
  return (
    <button
      type="button"
      className={`cube-btn${small ? " sm" : ""}${saved ? " saved" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

// ─── WAVE FIELD ───────────────────────────────────────────────────────────────

function WaveField({ opacity = 0.55, fixed = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    const t0 = performance.now();

    const resize = () => {
      canvas.width  = (fixed ? window.innerWidth  : canvas.offsetWidth)  * (window.devicePixelRatio || 1);
      canvas.height = (fixed ? window.innerHeight : canvas.offsetHeight) * (window.devicePixelRatio || 1);
    };
    resize();
    if (fixed) {
      window.addEventListener("resize", resize);
    } else {
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }

    const SPACING = 26;
    const BASE_R  = 1.4;

    const draw = (ts) => {
      const t   = reduced ? 0 : (ts - t0) / 1000;
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width  / (SPACING * dpr)) + 2;
      const rows = Math.ceil(height / (SPACING * dpr)) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * SPACING * dpr;
          const by = r * SPACING * dpr;

          const dx =
            Math.sin(c * 0.38 + t * 0.72) * 5 * dpr +
            Math.sin(r * 0.27 + t * 0.51 + 1.3) * 3.2 * dpr +
            Math.sin((c + r) * 0.19 + t * 0.93 + 2.5) * 1.8 * dpr;
          const dy =
            Math.cos(r * 0.33 + t * 0.61) * 5 * dpr +
            Math.cos(c * 0.29 + t * 0.44 + 0.9) * 3.2 * dpr +
            Math.cos((c - r) * 0.21 + t * 0.82 + 1.7) * 1.8 * dpr;

          const mag   = Math.hypot(dx, dy) / (10 * dpr);
          const rad   = (BASE_R + mag * 0.9) * dpr;
          const alpha = Math.min(0.12 + mag * 0.42, 0.72);

          ctx.beginPath();
          ctx.arc(bx + dx, by + dy, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      if (fixed) window.removeEventListener("resize", resize);
    };
  }, [fixed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        width: fixed ? "100vw" : "100%",
        height: fixed ? "100vh" : "100%",
        opacity,
        pointerEvents: "none",
        zIndex: fixed ? 0 : undefined,
      }}
    />
  );
}

// ─── ONBOARD ──────────────────────────────────────────────────────────────────

function OnboardScreen({onComplete}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [activity, setActivity] = useState("moderately_active");

  const canProceed = () => {
    if (step === 1) return !!goal;
    if (step === 2) return !!level;
    if (step === 3) return !!(name && weight && height && age);
    return true;
  };

  const LEVELS = [
    { id:"beginner",    label:"Beginner",     desc:"Under 1 year of structured training" },
    { id:"intermediate",label:"Intermediate", desc:"1–3 years, comfortable with compound movements" },
    { id:"advanced",    label:"Advanced",     desc:"3+ years, consistent progressive overload" },
    { id:"competitor",  label:"Competitor",   desc:"Contest experience or current prep" },
  ];

  const FEATURES = [
    { name:"Adaptive Training Engine",  sub:"Volume and intensity auto-adjust based on your logged RPE and performance trends" },
    { name:"AI Nutrition Parsing",      sub:"Describe meals in plain language — macros calculated instantly" },
    { name:"Contest Prep Protocol",     sub:"Reverse diet calculator, peak week timing, and rebound management" },
  ];

  return (
    <div className="ob2">

      {/* ── LANDING ── */}
      {step === 0 && (
        <div className="ob2-land">
          <div className="ob2-band">
            <WaveField />
            <div className="ob2-eyebrow">Performance Coaching System</div>
            <div className="ob2-wordmark">APEX</div>
          </div>
          <div className="ob2-land-body">
            <p className="ob2-land-tagline">
              The training and nutrition system built for athletes who measure progress in pounds, percentages, and stage placings.
            </p>
            <div className="ob2-features">
              {FEATURES.map(f => (
                <div key={f.name} className="ob2-feat">
                  <div className="ob2-feat-dot" />
                  <div>
                    <div className="ob2-feat-name">{f.name}</div>
                    <div className="ob2-feat-sub">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <CubeButton onClick={() => setStep(1)} style={{width:"100%"}}>BEGIN ASSESSMENT ▶</CubeButton>
          </div>
        </div>
      )}

      {/* ── STEP 1: GOAL ── */}
      {step === 1 && (
        <div className="ob2-step" key="s1" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div className="ob2-step-bar" style={{width:"100%"}}>
            <button className="ob2-back-btn" onClick={() => setStep(0)}>← Back</button>
            <span className="ob2-step-counter">01 / 03</span>
          </div>
          <div className="ob2-step-h" style={{textAlign:"center",marginBottom:8}}>What's the<br/><em>mission?</em></div>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:28,textAlign:"center",letterSpacing:.5}}>Select your primary goal</div>

          {/* ── ORBITAL GOAL RING ── */}
          {(() => {
            const R = 108;  // orbit radius px
            const n = GOALS.length;
            return (
              <div style={{position:"relative",width:R*2+90,height:R*2+90,flexShrink:0,margin:"0 auto 28px"}}>
                {/* Orbit track ring */}
                <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1px solid var(--border)",opacity:.35}}/>
                {/* Inner glow dot at center */}
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:6,height:6,borderRadius:"50%",background:"var(--accent)",boxShadow:"0 0 12px var(--accent)",opacity:.6}}/>
                {GOALS.map((g, i) => {
                  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                  const x = R * Math.cos(angle);
                  const y = R * Math.sin(angle);
                  const isActive = goal === g.id;
                  return (
                    <button key={g.id} onClick={() => setGoal(g.id)}
                      style={{
                        position:"absolute",
                        top:"50%", left:"50%",
                        width:80, height:76,
                        transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isActive ? 1.1 : 0.92})`,
                        transition:"transform .32s cubic-bezier(.16,1,.3,1), box-shadow .32s, border-color .2s, background .2s",
                        background: isActive ? `color-mix(in srgb,var(--accent) 14%,var(--card))` : "var(--card)",
                        border:`2px solid ${isActive ? "var(--accent)" : "var(--brutal)"}`,
                        borderRadius:8,
                        boxShadow: isActive ? "var(--charge-glow),var(--depth-shadow)" : "var(--depth-shadow),var(--inner-light),3px 3px 0 var(--brutal)",
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                        gap:4, cursor:"pointer", padding:"8px 4px",
                      }}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:1.2,color:isActive?"var(--accent)":"var(--text)",lineHeight:1.1,textAlign:"center"}}>
                        {g.label}
                      </div>
                      <div style={{fontSize:8,color:isActive?"var(--accent)":"var(--muted)",letterSpacing:.3,textAlign:"center",lineHeight:1.3,opacity:.8}}>
                        {g.desc}
                      </div>
                      {isActive && (
                        <div style={{position:"absolute",inset:-1,borderRadius:8,border:"1px solid var(--accent)",opacity:.4,pointerEvents:"none"}}/>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <CubeButton disabled={!canProceed()} onClick={() => setStep(2)} style={{width:"100%",maxWidth:340}}>CONTINUE ▶</CubeButton>
        </div>
      )}

      {/* ── STEP 2: LEVEL ── */}
      {step === 2 && (
        <div className="ob2-step" key="s2">
          <div className="ob2-step-bar">
            <button className="ob2-back-btn" onClick={() => setStep(1)}>← Back</button>
            <span className="ob2-step-counter">02 / 03</span>
          </div>
          <div className="ob2-step-h">Training<br/><em>Experience</em></div>
          <div className="ob2-list" style={{gap:8}}>
            {LEVELS.map(l => (
              <div key={l.id} className={`ob2-level-row ${level === l.id ? "sel" : ""}`} onClick={() => setLevel(l.id)}>
                <div className="ob2-level-name">{l.label}</div>
                <div className="ob2-level-desc">{l.desc}</div>
              </div>
            ))}
          </div>
          <CubeButton disabled={!canProceed()} onClick={() => setStep(3)} style={{width:"100%"}}>CONTINUE</CubeButton>
        </div>
      )}

      {/* ── STEP 3: PROFILE ── */}
      {step === 3 && (
        <div className="ob2-step" key="s3">
          <div className="ob2-step-bar">
            <button className="ob2-back-btn" onClick={() => setStep(2)}>← Back</button>
            <span className="ob2-step-counter">03 / 03</span>
          </div>
          <div className="ob2-step-h">Calibrate<br/><em>Your Profile</em></div>
          <div className="ob2-form">
            <div className="ob2-field">
              <label className="ob2-label">First Name</label>
              <input className="ob2-input" placeholder="e.g. Marcus" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="ob2-field-row">
              <div className="ob2-field">
                <label className="ob2-label">Weight (lbs)</label>
                <input className="ob2-input" type="number" placeholder="185" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div className="ob2-field">
                <label className="ob2-label">Height (in)</label>
                <input className="ob2-input" type="number" placeholder="71" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
            </div>
            <div className="ob2-field-row">
              <div className="ob2-field">
                <label className="ob2-label">Age</label>
                <input className="ob2-input" type="number" placeholder="26" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="ob2-field">
                <label className="ob2-label">Sex</label>
                <select className="ob2-input" value={sex} onChange={e => setSex(e.target.value)} style={{appearance:"none",cursor:"pointer"}}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="ob2-field">
              <label className="ob2-label">Daily Activity Level</label>
              <select className="ob2-input" value={activity} onChange={e => setActivity(e.target.value)} style={{appearance:"none",cursor:"pointer"}}>
                <option value="sedentary">Sedentary — desk job, little movement</option>
                <option value="lightly_active">Lightly Active — light movement, 1–3 workouts/wk</option>
                <option value="moderately_active">Moderately Active — 3–5 workouts/wk</option>
                <option value="very_active">Very Active — hard training 5–6 days + active job</option>
                <option value="extra_active">Extra Active — physical job + daily training</option>
              </select>
            </div>
          </div>
          <CubeButton disabled={!canProceed()} onClick={() => onComplete({name,weight,height,age,sex,goal,level,activity})} style={{width:"100%"}}>BUILD MY PROGRAM ▶</CubeButton>
        </div>
      )}

    </div>
  );
}

// DashboardScreen defined below near App component

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADAPTIVE TRAINING ENGINE v2 — DUAL PATH + HIMBO STAT CHART ───────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TRAINING_KEY  = "apex_training_v2";
const FEEDBACK_KEY  = "apex_session_feedback_v2";
const SESSION_KEY   = "apex_live_session_v1";

// ── GLOBAL SESSION CONTEXT ────────────────────────────────────────────────────
const SessionContext = createContext(null);

function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Restore any session that has a valid startedAt — no time limit, user ends manually
      if (parsed?.startedAt) return parsed;
    } catch {}
    return null;
  });

  const updateSession = useCallback((updates) => {
    setSession(prev => {
      if (!prev) return prev;
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const startSession = useCallback((type, payload) => {
    const s = { type, startedAt: Date.now(), activeEx: null, ...payload };
    setSession(s);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  return (
    <SessionContext.Provider value={{ session, startSession, updateSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
}

function useSession() { return useContext(SessionContext); }

// ── ENHANCED EXERCISE DATABASE — full tagging: primary, secondary[], movement, stim ──
const EX_DB = {
  // ── CHEST ─────────────────────────────────────────────────────────────────────
  // A-day compound: Incline Barbell Press (matches your push day primary)
  // B-day compound: Machine Incline Press → Machine Chest Press rotation
  "Incline Barbell Press":    {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:9},
  "Machine Incline Press":    {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:8},
  "Machine Chest Press":      {primary:"chest",    secondary:["triceps","front_delt"],  movement:"horizontal_push", stim:8},
  "Incline DB Press":         {primary:"chest",    secondary:["triceps","front_delt"],  movement:"incline_push",    stim:8},
  "DB Bench Press":           {primary:"chest",    secondary:["triceps","front_delt"],  movement:"horizontal_push", stim:7},
  "Dips":                     {primary:"chest",    secondary:["triceps"],               movement:"vertical_push",   stim:8},
  "Pec Deck":                 {primary:"chest",    secondary:[],                        movement:"fly",             stim:8},
  "Cable Fly":                {primary:"chest",    secondary:[],                        movement:"fly",             stim:8},
  "Low-to-High Cable Fly":    {primary:"chest",    secondary:[],                        movement:"fly",             stim:7},
  "Incline DB Fly":           {primary:"chest",    secondary:["front_delt"],            movement:"incline_fly",     stim:7},

  // ── BACK ──────────────────────────────────────────────────────────────────────
  // A-day compound: Deadlift / Barbell Row  |  B-day: T-Bar Row / Machine Row
  "Deadlift":                 {primary:"back",     secondary:["hams","glutes","traps"],  movement:"hinge",           stim:10},
  "Barbell Row":              {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:9},
  "T-Bar Row":                {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:9},
  "Machine Row":              {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Seated Cable Row":         {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Lying Machine Row":        {primary:"back",     secondary:["biceps","rear_delt"],     movement:"horizontal_pull", stim:8},
  "Single-Arm DB Row":        {primary:"back",     secondary:["biceps"],                 movement:"horizontal_pull", stim:8},
  "Machine Lat Pulldown":     {primary:"back",     secondary:["biceps"],                 movement:"vertical_pull",   stim:8},
  "Cable Lat Pulldown":       {primary:"back",     secondary:["biceps"],                 movement:"vertical_pull",   stim:8},
  "Straight-Arm Pulldown":    {primary:"back",     secondary:[],                         movement:"vertical_pull",   stim:7},
  "Face Pull":                {primary:"rear_delt",secondary:["back","traps"],           movement:"horizontal_pull", stim:8},
  "Rear Delt Machine":        {primary:"rear_delt",secondary:["back"],                   movement:"fly",             stim:7},

  // ── SHOULDERS ─────────────────────────────────────────────────────────────────
  // A-day compound: DB Shoulder Press (your push day movement, 60 lbs)
  // Lateral Raise: your push day isolation (20 lbs DB)
  "DB Shoulder Press":        {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:9},
  "Overhead Press":           {primary:"delts",    secondary:["triceps","traps"],         movement:"vertical_push",   stim:9},
  "Machine Shoulder Press":   {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:8},
  "DB Arnold Press":          {primary:"delts",    secondary:["triceps"],                movement:"vertical_push",   stim:8},
  "Lateral Raise":            {primary:"delts",    secondary:[],                         movement:"isolation",       stim:8},
  "Cable Lateral Raise":      {primary:"delts",    secondary:[],                         movement:"isolation",       stim:8},
  "Upright Row":              {primary:"delts",    secondary:["traps","biceps"],          movement:"vertical_pull",   stim:7},

  // ── TRICEPS ───────────────────────────────────────────────────────────────────
  // A-day isolation: Cable Rope Pushdown (your push day finisher)
  // B-day isolation: Skull Crusher
  "Close-Grip Bench":         {primary:"triceps",  secondary:["chest","front_delt"],     movement:"horizontal_push", stim:8},
  "Cable Rope Pushdown":      {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:9},
  "Skull Crusher":            {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:8},
  "Overhead Cable Extension": {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:8},
  "Tricep Machine":           {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:7},
  "DB Overhead Extension":    {primary:"triceps",  secondary:[],                         movement:"isolation",       stim:7},

  // ── BICEPS ────────────────────────────────────────────────────────────────────
  // A-day: Incline DB Curl (peak stretch) | B-day: Barbell Curl
  "Incline DB Curl":          {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:9},
  "Barbell Curl":             {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:8},
  "Preacher Curl":            {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:8},
  "Cable Curl":               {primary:"biceps",   secondary:[],                         movement:"isolation",       stim:8},
  "Dumbbell Curl":            {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:7},
  "Hammer Curl":              {primary:"biceps",   secondary:["forearms"],               movement:"isolation",       stim:7},

  // ── QUADS ─────────────────────────────────────────────────────────────────────
  // A-day compound: Back Squat | B-day: Pendulum Squat / Hack Squat
  "Back Squat":               {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:10},
  "Pendulum Squat":           {primary:"quads",    secondary:["glutes"],                 movement:"squat",           stim:9},
  "Hack Squat":               {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:9},
  "Leg Press":                {primary:"quads",    secondary:["glutes","hams"],          movement:"squat",           stim:8},
  "Bulgarian Split Squat":    {primary:"quads",    secondary:["glutes"],                 movement:"lunge",           stim:9},
  "Leg Extension":            {primary:"quads",    secondary:[],                         movement:"isolation",       stim:7},

  // ── HAMSTRINGS ────────────────────────────────────────────────────────────────
  "Romanian Deadlift":        {primary:"hams",     secondary:["glutes","lower_back"],    movement:"hinge",           stim:9},
  "Stiff-Leg Deadlift":       {primary:"hams",     secondary:["glutes","lower_back"],    movement:"hinge",           stim:8},
  "Leg Curl":                 {primary:"hams",     secondary:[],                         movement:"isolation",       stim:8},
  "Hip Thrust":               {primary:"glutes",   secondary:["hams"],                   movement:"hip_extension",   stim:9},

  // ── CALVES ────────────────────────────────────────────────────────────────────
  "Standing Calf Raise":      {primary:"calves",   secondary:[],                         movement:"isolation",       stim:8},
  "Seated Calf Raise":        {primary:"calves",   secondary:[],                         movement:"isolation",       stim:8},
  "Leg Press Calf Raise":     {primary:"calves",   secondary:[],                         movement:"isolation",       stim:7},

  // ── ABS ───────────────────────────────────────────────────────────────────────
  "Cable Crunch":             {primary:"abs",      secondary:[],                         movement:"isolation",       stim:8},
  "Hanging Leg Raise":        {primary:"abs",      secondary:[],                         movement:"isolation",       stim:8},
  "Ab Wheel":                 {primary:"abs",      secondary:["lower_back"],             movement:"isolation",       stim:8},
  "Decline Crunch":           {primary:"abs",      secondary:[],                         movement:"isolation",       stim:6},
  "Plank":                    {primary:"abs",      secondary:["lower_back"],             movement:"isometric",       stim:5},
};

// ── EXERCISE RESOLVER — fuzzy muscle classification ───────────────────────────
// Priority: EX_DB exact → case-insensitive → partial (input contains DB name)
// → keyword pattern → null (unknown)
function resolveExerciseTag(name) {
  if (!name) return null;
  if (EX_DB[name]) return EX_DB[name];
  const lower = name.toLowerCase().trim();
  // Case-insensitive exact
  const ci = Object.entries(EX_DB).find(([k]) => k.toLowerCase() === lower);
  if (ci) return ci[1];
  // Input contains a known exercise name ("machine bench press" → "Bench Press")
  const partial = Object.entries(EX_DB).find(([k]) => lower.includes(k.toLowerCase()));
  if (partial) return partial[1];
  // All words of a DB name appear in the input
  const reversed = Object.entries(EX_DB).find(([k]) => k.toLowerCase().split(" ").every(w => lower.includes(w)));
  if (reversed) return reversed[1];

  // ── EXPANDED KEYWORD INFERENCE ──────────────────────────────────────────
  // Flags used across patterns
  const isRear    = /\b(rear|reverse|bent.?over)\b/.test(lower);
  const hasPull   = /\b(pull|row|chin|lat)\b/.test(lower);
  const hasLeg    = /\b(leg|hip|glute|hamstring|quad)\b/.test(lower);

  // ── CHEST: pec (any variant), fly/flye (non-rear), bench, push-up, crossover
  if (!isRear && (
    lower.includes("pec") ||
    /\bflyes?\b/.test(lower) ||
    /\b(bench|chest press|incline press|chest fly|cable fly|machine chest|machine incline|push.?up|crossover|dumbbell press|db press)\b/.test(lower)
  )) return {primary:"chest", secondary:["triceps"], movement:"horizontal_push", stim:7};

  // ── BACK: rows, pulldowns, pull-ups, cable pulls, machine back
  if (/\b(row|lat pull|pulldown|pull.?up|chin.?up|pullover|t.?bar|seated cable|low row|machine row|cable row|v.?bar|single arm row|chest supported|wide grip pull)\b/.test(lower))
    return {primary:"back",   secondary:["biceps"],   movement:"horizontal_pull", stim:7};

  // ── QUADS
  if (/\b(squat|leg press|lunge|hack|pendulum|leg ext|step.?up|split squat|wall sit)\b/.test(lower))
    return {primary:"quads",  secondary:["glutes"],   movement:"squat",          stim:7};

  // ── HAMSTRINGS / GLUTES
  if (/\b(rdl|romanian|stiff.?leg|leg curl|hamstring|nordic|hip thrust|glute bridge|glute|sumo|deadlift)\b/.test(lower))
    return {primary:"hams",   secondary:["glutes"],   movement:"hinge",          stim:7};

  // ── REAR DELT (check before general delts)
  if (isRear || /\b(face pull|reverse fly|rear fly|rear delt|cable pull.?apart|band pull.?apart|prone y|prone t)\b/.test(lower))
    return {primary:"rear_delt", secondary:["back"], movement:"fly",            stim:7};

  // ── DELTS: shoulder, press (non-chest context), lateral, upright, overhead
  if (/\b(overhead press|ohp|shoulder press|arnold|lateral raise|side raise|upright|machine shoulder|shoulder|pike|military press|dumbbell shoulder)\b/.test(lower))
    return {primary:"delts",  secondary:["triceps"],  movement:"vertical_push",  stim:7};

  // ── TRICEPS: pushdown, extension, dip, kickback — guard against leg/back
  if (!hasLeg && /\b(tricep|skull.?crusher|push.?down|overhead ext|jm press|rope push|tate press|dip|kickback|close.?grip|cable extension|tricep machine)\b/.test(lower))
    return {primary:"triceps",secondary:[],           movement:"isolation",      stim:7};

  // ── BICEPS: curl, hammer, preacher, zottman, spider
  if (/\b(curl|bicep|preacher|concentration|hammer|zottman|spider|incline curl|cable curl)\b/.test(lower))
    return {primary:"biceps", secondary:[],           movement:"isolation",      stim:7};

  // ── CALVES
  if (/\b(calf|calves|calf raise|standing raise|seated raise)\b/.test(lower))
    return {primary:"calves", secondary:[],           movement:"isolation",      stim:7};

  // ── ABS: crunch, plank, core, sit-up, cable crunch, russian twist
  if (/\b(ab |abs|crunch|plank|core|sit.?up|leg raise|toes.?to.?bar|cable crunch|russian twist|hollow|v.?up|decline crunch)\b/.test(lower))
    return {primary:"abs",    secondary:[],           movement:"isometric",      stim:6};

  return null;
}

// AI fallback — called when keyword matching returns null.
// Uses Haiku for speed/cost; result cached in customExDB for future use.
async function resolveExerciseTagWithAI(name) {
  const VALID = ['chest','back','quads','hams','delts','rear_delt','triceps','biceps','calves','abs'];
  try {
    const res = await fetch("/api/chat", {
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

// ── MUSCLE BALANCE BENCHMARKS (sets/week) ─────────────────────────────────────
const MUSCLE_BENCHMARKS = {
  chest:     {label:"Chest",    color:"#F5A623",mev:8, mav:16,mrv:20},
  back:      {label:"Back",     color:"#3DDC84",mev:10,mav:18,mrv:22},
  quads:     {label:"Quads",    color:"#5B8FF9",mev:8, mav:16,mrv:20},
  hams:      {label:"Hams",     color:"#A78BFA",mev:6, mav:12,mrv:16},
  delts:     {label:"Delts",    color:"#FB7185",mev:8, mav:16,mrv:20},
  rear_delt: {label:"Rear Delt",color:"#F472B6",mev:6, mav:12,mrv:16},
  triceps:   {label:"Triceps",  color:"#34D399",mev:6, mav:12,mrv:16},
  biceps:    {label:"Biceps",   color:"#60A5FA",mev:6, mav:12,mrv:16},
  calves:    {label:"Calves",   color:"#FBBF24",mev:8, mav:16,mrv:20},
  abs:       {label:"Abs",      color:"#E879F9",mev:4, mav:10,mrv:14},
};

// ── MUSCLE VOLUME ANALYTICS ───────────────────────────────────────────────────
function computeMuscleVolume(history, windowDays=7) {
  const cutoff = Date.now() - windowDays * 86400000;
  const recent = history.filter(s => s.ts >= cutoff);
  const vol = {};
  Object.keys(MUSCLE_BENCHMARKS).forEach(m => { vol[m] = {sets:0,freq:0,lastTs:0}; });
  recent.forEach(sess => {
    (sess.completedExercises||[]).forEach(ex => {
      // Use stored tag first (custom sessions), then EX_DB exact, then fuzzy resolver
      // If stored tag has primary:"custom" it was never properly resolved —
      // fall through to EX_DB + keyword inference so sets count correctly.
      const storedTag = ex.tag?.primary && ex.tag.primary !== "custom" ? ex.tag : null;
      const tag = storedTag || EX_DB[ex.name] || resolveExerciseTag(ex.name);
      if (!tag || !tag.primary) return;
      const sets = (ex.loggedSets||[]).filter(s=>s.reps).length;
      if (vol[tag.primary]) { vol[tag.primary].sets+=sets; vol[tag.primary].freq+=1; vol[tag.primary].lastTs=Math.max(vol[tag.primary].lastTs,sess.ts); }
      (tag.secondary||[]).forEach(sec => { if(vol[sec]) vol[sec].sets+=sets*0.5; });
    });
  });
  return vol;
}

// ── MUSCLE ALERTS ─────────────────────────────────────────────────────────────
function generateMuscleAlerts(muscleVol, level, C) {
  const mod = {beginner:.7,intermediate:1,advanced:1.2,competitor:1.4}[level]||1;
  const alerts = [];
  Object.entries(MUSCLE_BENCHMARKS).forEach(([key,bench]) => {
    const v = muscleVol[key]; if(!v) return;
    const mev=bench.mev*mod, mrv=bench.mrv;
    if (v.sets===0) alerts.push({key,muscle:bench.label,severity:"critical",msg:`${bench.label}: 0 sets this week — add ${Math.round(mev)} sets minimum (MEV) to stimulate growth.`,color:C.red});
    else if (v.sets<mev) alerts.push({key,muscle:bench.label,severity:"warning",msg:`${bench.label}: ${Math.round(v.sets)} sets logged, ${Math.round(mev)} needed to reach MEV (minimum effective volume).`,color:"#FBBF24"});
    else if (v.sets>mrv) alerts.push({key,muscle:bench.label,severity:"overreach",msg:`${bench.label}: ${Math.round(v.sets)} sets exceeds MRV (${mrv}) — reduce volume to protect recovery.`,color:C.blue});
  });
  return alerts.sort((a,b)=>a.severity==="critical"?-1:b.severity==="critical"?1:0);
}
// ── SPLIT DEFINITIONS ─────────────────────────────────────────────────────────
const CBUM_PPL = {
  push1: [
    { id:"p1_1", name:"Barbell Press (Incline or Flat)", muscle:"chest",   category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — lead with chest, control descent" },
    { id:"p1_2", name:"Alternated Dumbbell Shoulder Press", muscle:"delts", category:"compound", sets:4, repRange:"8–12",    rpe:8, targetSets:4, notes:"One arm at a time — full ROM and core stability" },
    { id:"p1_3", name:"Chest Flies",       muscle:"chest",   category:"isolation", sets:3, repRange:"10–15",   rpe:7, targetSets:3, notes:"Superset with Tricep Extensions — deep stretch at bottom" },
    { id:"p1_4", name:"Tricep Extensions", muscle:"triceps", category:"isolation", sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Superset with Chest Flies — full lockout at top" },
    { id:"p1_5", name:"Lateral Raises",    muscle:"delts",   category:"isolation", sets:4, repRange:"12–15",   rpe:7, targetSets:4, notes:"Lead with elbow, slight bend — standard working sets" },
    { id:"p1_6", name:"Dips",              muscle:"triceps", category:"compound",  sets:3, repRange:"To Failure", rpe:9, targetSets:3, notes:"To failure — control descent, full lockout at top" },
  ],
  pull1: [
    { id:"pu1_1", name:"Lat Pull Downs",               muscle:"back",    category:"compound",  sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Start light — focus on contraction, feel the lat stretch" },
    { id:"pu1_2", name:"Bent Over Rows",                muscle:"back",    category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — brace core, drive elbows back" },
    { id:"pu1_3", name:"Incline Seated Dumbbell Curls", muscle:"biceps",  category:"isolation", sets:4, repRange:"10–15",   rpe:7, targetSets:4, notes:"Light weight, constant tension — full stretch at bottom" },
    { id:"pu1_4", name:"Pull-ups",                      muscle:"back",    category:"compound",  sets:3, repRange:"To Failure", rpe:9, targetSets:3, notes:"To failure — full hang at bottom, chin over bar" },
    { id:"pu1_5", name:"EZ Bar Curls",                  muscle:"biceps",  category:"isolation", sets:2, repRange:"40 sec", rpe:8, targetSets:2, notes:"2 sets of 40 seconds constant tension — no rest at top or bottom" },
  ],
  legs1: [
    { id:"l1_1", name:"Lunges",                muscle:"quads",  category:"compound",  sets:4, repRange:"15/leg",  rpe:7, targetSets:4, notes:"Bodyweight warm-up then heavy — 15 steps per leg, upright torso" },
    { id:"l1_2", name:"Romanian Deadlift",     muscle:"hams",   category:"compound",  sets:4, repRange:"8–12",    rpe:8, targetSets:4, notes:"Focus on movement — hip hinge, feel the hamstring stretch" },
    { id:"l1_3", name:"Hip Thrusts",           muscle:"hams",   category:"isolation", sets:3, repRange:"12–15",   rpe:7, targetSets:3, notes:"Or kickbacks — squeeze glutes hard at top" },
    { id:"l1_4", name:"Seated Calf Raises",    muscle:"calves", category:"isolation", sets:6, repRange:"10–12",   rpe:7, targetSets:6, notes:"6 sets total — last 4 supersetted with Lying Hamstring Curls" },
    { id:"l1_5", name:"Lying Hamstring Curls", muscle:"hams",   category:"isolation", sets:4, repRange:"8–10 / 40s", rpe:7, targetSets:4, notes:"2 sets 8–10 reps + 2 sets 40 seconds — superset with calf raises" },
  ],
  push2: [
    { id:"p2_1", name:"Close Grip Bench Press",      muscle:"triceps", category:"compound",  sets:3, repRange:"8–12",    rpe:8, targetSets:3, notes:"3 working sets — elbows close, full lockout" },
    { id:"p2_2", name:"Standing Barbell Press",      muscle:"delts",   category:"compound",  sets:4, repRange:"6–10",    rpe:8, targetSets:4, notes:"Heavy working sets — brace core, no lower back lean" },
    { id:"p2_3", name:"Pec Deck Flies",              muscle:"chest",   category:"isolation", sets:2, repRange:"40 sec",  rpe:7, targetSets:2, notes:"2 sets of 40 seconds constant tension — squeeze at peak contraction" },
    { id:"p2_4", name:"Overhead Tricep Extension",   muscle:"triceps", category:"isolation", sets:3, repRange:"10–15",   rpe:7, targetSets:3, notes:"Deep stretch focus — full range, feel the long head load" },
    { id:"p2_5", name:"Lateral Raises",              muscle:"delts",   category:"isolation", sets:4, repRange:"10–12",   rpe:7, targetSets:4, notes:"Superset with Push-ups — lead with elbow" },
    { id:"p2_6", name:"Push-ups",                    muscle:"chest",   category:"compound",  sets:4, repRange:"To Failure", rpe:8, targetSets:4, notes:"Superset with Lateral Raises — to failure each set" },
  ],
  pull2: [
    { id:"pu2_1", name:"Pull-ups",               muscle:"back",   category:"compound",  sets:3, repRange:"8–12",     rpe:8, targetSets:3, notes:"3 sets — full hang at bottom, chest to bar" },
    { id:"pu2_2", name:"Rack Pulls",             muscle:"back",   category:"compound",  sets:2, repRange:"8–10",     rpe:8, targetSets:2, notes:"2 working sets — upper back and trap engagement" },
    { id:"pu2_3", name:"Hammer Curls",           muscle:"biceps", category:"isolation", sets:3, repRange:"10–12",    rpe:7, targetSets:3, notes:"Brachialis emphasis — control the descent" },
    { id:"pu2_4", name:"Reverse Grip Row",       muscle:"back",   category:"compound",  sets:3, repRange:"10–12",    rpe:7, targetSets:3, notes:"Or pull down — focus on elbow positioning, pull to waist" },
    { id:"pu2_5", name:"Cable Curls",            muscle:"biceps", category:"isolation", sets:3, repRange:"10–15",    rpe:7, targetSets:3, notes:"Constant tension — squeeze at top, slow negative" },
    { id:"pu2_6", name:"Dumbbell Curls Drop Set",muscle:"biceps", category:"isolation", sets:1, repRange:"~4 drops", rpe:9, targetSets:1, notes:"1 big drop set ~4 drops — take to failure each drop" },
  ],
  legs2: [
    { id:"l2_1", name:"Squats",               muscle:"quads",  category:"compound",  sets:7, repRange:"8–10",     rpe:8, targetSets:7, notes:"3 warm-up + 3 working sets + 1 final heavy — depth below parallel" },
    { id:"l2_2", name:"Leg Press",            muscle:"quads",  category:"compound",  sets:2, repRange:"40 sec",   rpe:8, targetSets:2, notes:"Superset with Calf Raises — 2 sets 40 seconds constant tension" },
    { id:"l2_3", name:"Calf Raises",          muscle:"calves", category:"isolation", sets:2, repRange:"To Failure",rpe:8, targetSets:2, notes:"Superset with Leg Press — to failure" },
    { id:"l2_4", name:"Hip Adductors",        muscle:"hams",   category:"isolation", sets:1, repRange:"12–15",    rpe:7, targetSets:1, notes:"1 set — inner thigh squeeze, controlled movement" },
    { id:"l2_5", name:"Standing Calf Raises", muscle:"calves", category:"isolation", sets:4, repRange:"10–12",    rpe:7, targetSets:4, notes:"4 sets + bounce reps to failure on last set" },
    { id:"l2_6", name:"Quad Extensions",      muscle:"quads",  category:"isolation", sets:4, repRange:"10–12",    rpe:7, targetSets:4, notes:"2 sets 10–12 reps + 2 triple drop sets — peak contraction focus" },
  ],
};

const DRSWOLE_PPLUL = {
  upper: [
    { id:"u1", name:"Bench Press",            muscle:"chest",   category:"compound",  sets:3, repRange:"1×2–5, 2×3–8",   rpe:3, targetSets:3, notes:"First set heavier — work up to a top set, then back off 10–15% for the remaining two" },
    { id:"u2", name:"Weighted Chin-ups",       muscle:"back",    category:"compound",  sets:3, repRange:"1×5–8, 2×6–10",  rpe:3, targetSets:3, notes:"Add weight via belt — full hang at bottom, chin clears bar at top" },
    { id:"u3", name:"Incline Dumbbell Fly",    muscle:"chest",   category:"isolation", sets:3, repRange:"10–15",            rpe:4, targetSets:3, notes:"Deep stretch at bottom, squeeze at peak — keep elbows slightly soft" },
    { id:"u4", name:"Chest-Supported Row",     muscle:"back",    category:"compound",  sets:4, repRange:"8–12",             rpe:4, targetSets:4, notes:"Chest on pad removes lower back from the equation — focus entirely on elbow drive" },
    { id:"u5", name:"Rope Pressdown",          muscle:"triceps", category:"isolation", sets:3, repRange:"12–20",            rpe:5, targetSets:3, notes:"Spread the rope at the bottom — feel the long head stretch at top" },
    { id:"u6", name:"Dumbbell Lateral Raise",  muscle:"delts",   category:"isolation", sets:3, repRange:"8–12",             rpe:5, targetSets:3, notes:"Lead with elbow, not wrist — slight forward lean amplifies medial delt" },
  ],
  lower1: [
    { id:"l1_1", name:"Squat",                 muscle:"quads",  category:"compound",  sets:3, repRange:"1×2–4, 2×3–6",   rpe:3, targetSets:3, notes:"Top set then back-off — brace hard, depth below parallel, knees track over toes" },
    { id:"l1_2", name:"Romanian Deadlift",     muscle:"hams",   category:"compound",  sets:3, repRange:"6–10",             rpe:3, targetSets:3, notes:"Hip hinge — maintain tension in hamstrings throughout, no lower back rounding" },
    { id:"l1_3", name:"Barbell Back Extension",muscle:"hams",   category:"isolation", sets:3, repRange:"8–12",             rpe:4, targetSets:3, notes:"Hold at top — glute and hamstring initiation, not lower back" },
    { id:"l1_4", name:"Leg Extension",         muscle:"quads",  category:"isolation", sets:3, repRange:"10–15",            rpe:5, targetSets:3, notes:"Peak contraction at top — slow the negative, 2–3 second eccentric" },
    { id:"l1_5", name:"Lying Bicep Curl",      muscle:"biceps", category:"isolation", sets:4, repRange:"6–10",             rpe:4, targetSets:4, notes:"Lie on incline bench — full stretch at bottom provides constant tension" },
    { id:"l1_6", name:"Machine Calf Raise",    muscle:"calves", category:"isolation", sets:4, repRange:"10–15 / 3–5",     rpe:4, targetSets:4, notes:"1 higher-rep set then heavier sets — full range, pause at stretch and peak" },
  ],
  pull: [
    { id:"pu1", name:"Meadows Row",                    muscle:"back",   category:"compound",  sets:3, repRange:"6–10",   rpe:3, targetSets:3, notes:"T-bar style landmine row — elbow flares slightly, drive through the hip" },
    { id:"pu2", name:"Cable Row",                      muscle:"back",   category:"compound",  sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Sit tall — retract scapula at peak contraction, controlled return" },
    { id:"pu3", name:"Reverse Grip Lat Pulldown",      muscle:"back",   category:"compound",  sets:3, repRange:"10–15",  rpe:4, targetSets:3, notes:"Supinated grip engages biceps and lower lats — pull to upper chest" },
    { id:"pu4", name:"Dumbbell Lateral Raise",         muscle:"delts",  category:"isolation", sets:4, repRange:"12–20",  rpe:5, targetSets:4, notes:"Higher reps here — chase the burn, control the eccentric" },
    { id:"pu5", name:"Face Pull",                      muscle:"delts",  category:"isolation", sets:3, repRange:"12–20",  rpe:5, targetSets:3, notes:"Pull to face level, external rotation at peak — shoulder health essential" },
    { id:"pu6", name:"Barbell Shrug",                  muscle:"back",   category:"isolation", sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Straight up — no rolling, hold 1 second at top, full depression at bottom" },
  ],
  push: [
    { id:"ph1", name:"Weighted Dips",           muscle:"chest",   category:"compound",  sets:3, repRange:"5–8",    rpe:3, targetSets:3, notes:"Lean forward for chest emphasis — full lockout at top, deep stretch at bottom" },
    { id:"ph2", name:"Close-Grip Bench Press",  muscle:"triceps", category:"compound",  sets:3, repRange:"6–10",   rpe:3, targetSets:3, notes:"Elbows close to torso — tricep dominant, feel the long head load at bottom" },
    { id:"ph3", name:"Seated Dumbbell Curl",    muscle:"biceps",  category:"isolation", sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Seated removes cheating — supinate at top, slow negative" },
    { id:"ph4", name:"Machine Overhead Press",  muscle:"delts",   category:"compound",  sets:3, repRange:"8–12",   rpe:4, targetSets:3, notes:"Seated machine stabilizes — full lockout overhead, controlled descent" },
    { id:"ph5", name:"EZ Bar Skull Crusher",    muscle:"triceps", category:"isolation", sets:3, repRange:"6–10",   rpe:4, targetSets:3, notes:"Lower to forehead — long head stretch, explode on the concentric" },
    { id:"ph6", name:"Cable Hammer Curl",       muscle:"biceps",  category:"isolation", sets:3, repRange:"10–15",  rpe:5, targetSets:3, notes:"Neutral grip targets brachialis — constant cable tension throughout" },
  ],
  legs: [
    { id:"lg1", name:"Deadlift",                      muscle:"hams",   category:"compound",  sets:2, repRange:"3–5",        rpe:2, targetSets:2, notes:"2 heavy working sets — brace, drive floor away, lock hips and knees together at top" },
    { id:"lg2", name:"Paused Squat",                  muscle:"quads",  category:"compound",  sets:5, repRange:"3–5",        rpe:3, targetSets:5, notes:"2-second pause at the bottom — eliminates stretch reflex, builds raw strength" },
    { id:"lg3", name:"Smith Machine Split Squat",     muscle:"quads",  category:"compound",  sets:3, repRange:"8–12",       rpe:4, targetSets:3, notes:"Front foot elevated — deep range of motion, keep front knee tracking over toe" },
    { id:"lg4", name:"Leg Curl",                      muscle:"hams",   category:"isolation", sets:2, repRange:"10–15",      rpe:4, targetSets:2, notes:"Curl to full contraction — plantar flex foot at peak for extra hamstring peak" },
    { id:"lg5", name:"Leaning Cable Lateral Raise",   muscle:"delts",  category:"isolation", sets:3, repRange:"10–15",      rpe:5, targetSets:3, notes:"Hold cable stack, lean away — stretches medial delt at bottom of each rep" },
    { id:"lg6", name:"Leg Press Calf Raise",          muscle:"calves", category:"isolation", sets:4, repRange:"1×8–12, 3–5", rpe:4, targetSets:4, notes:"Full range — toes on edge of platform, pause at stretch and peak contraction" },
  ],
};

const SPLITS = {
  ppl: {
    id:"ppl", label:"Mr. Olympia's PPL Split", abbr:"PPL",
    desc:"Chris Bumstead's 6-day Push / Pull / Legs program. Built for mass and symmetry — the program that built a 5x Mr. Olympia physique.",
    frequency:6,
    preset: CBUM_PPL,
    schedule: [
      { key:"push1", tag:"Push 1", muscles:["chest","delts","triceps"] },
      { key:"pull1", tag:"Pull 1", muscles:["back","biceps"] },
      { key:"legs1", tag:"Legs 1", muscles:["quads","hams","calves"] },
      { key:"push2", tag:"Push 2", muscles:["chest","delts","triceps"] },
      { key:"pull2", tag:"Pull 2", muscles:["back","biceps"] },
      { key:"legs2", tag:"Legs 2", muscles:["quads","hams","calves"] },
    ],
  },
  ul: {
    id:"ul", label:"Upper / Lower", abbr:"U/L",
    desc:"4-day alternating split. High frequency, manageable volume. Great for all levels.",
    frequency:4,
    schedule: [
      { key:"upper1", tag:"Upper A", muscles:["chest","back","delts","triceps","biceps"] },
      { key:"lower1", tag:"Lower A", muscles:["quads","hams","calves"] },
      { key:"upper2", tag:"Upper B", muscles:["chest","back","delts","triceps","biceps"] },
      { key:"lower2", tag:"Lower B", muscles:["quads","hams","calves"] },
    ],
  },
  pplup: {
    id:"pplup", label:"Dr. Swole's PPL Upper Lower", abbr:"PPLUL",
    desc:"Dr. Swole's 5-day Push Pull Legs Upper Lower — Moderate Volume v2. 19–20 sets per session across all major muscle groups. Balanced frequency with strategic overlap.",
    frequency:5,
    preset: DRSWOLE_PPLUL,
    schedule: [
      { key:"upper",  tag:"Upper",   muscles:["chest","back","delts","biceps","triceps"] },
      { key:"lower1", tag:"Lower 1", muscles:["quads","hams","calves","biceps"] },
      { key:"pull",   tag:"Pull",    muscles:["back","delts","biceps","traps"] },
      { key:"push",   tag:"Push",    muscles:["chest","delts","triceps","biceps"] },
      { key:"legs",   tag:"Legs",    muscles:["quads","hams","calves","delts"] },
    ],
  },
};

// ── VOLUME LANDMARKS (sets/muscle/week by level) ──────────────────────────────
const VOL = {
  beginner:     { mev:6,  mav:12, mrv:16 },
  intermediate: { mev:8,  mav:16, mrv:20 },
  advanced:     { mev:10, mav:18, mrv:22 },
  competitor:   { mev:12, mav:20, mrv:24 },
};

// ── PROGRAM GENERATOR ─────────────────────────────────────────────────────────
// Per-muscle exercise lists derived from EX_DB
function getExForMuscle(muscle, type) {
  return Object.entries(EX_DB)
    .filter(([, tag]) => tag.primary === muscle && (type === "any" || (type === "compound" ? tag.movement !== "isolation" && tag.movement !== "isometric" : tag.movement === "isolation" || tag.movement === "isometric")))
    .sort(([, a], [, b]) => b.stim - a.stim)
    .map(([name]) => name);
}

function generateProgram({ split, level, goal, neglectedMuscles=[] }) {
  const splitDef = SPLITS[split];
  const vol = VOL[level] || VOL.intermediate;
  const sessionsPerMuscle = 2;

  function pickExercises(muscleKeys, isB = false) {
    const exs = [];
    muscleKeys.forEach(mKey => {
      const compounds = getExForMuscle(mKey, "compound");
      const isolations = getExForMuscle(mKey, "isolation");
      const setsPerSession = Math.ceil(vol.mav / sessionsPerMuscle / muscleKeys.length);
      const isNeglected = neglectedMuscles.includes(mKey);
      const setsClamp = Math.max(2, Math.min(5, setsPerSession + (isNeglected ? 1 : 0)));
      const notes = isNeglected ? "⚠ Volume boosted — lagging muscle group" : "Focus on full ROM and controlled eccentric";

      const comp = compounds[isB ? Math.min(1, compounds.length - 1) : 0];
      if (comp) {
        exs.push({
          id: `${mKey}_c_${comp.replace(/\s+/g,"")}`,
          name: comp, muscle: mKey,
          category: "compound",
          sets: setsClamp, repRange: goal === "strength" ? "4–6" : "6–10",
          rpe: 8, targetSets: setsClamp, notes,
        });
      }
      if (["chest","back","quads","hams"].includes(mKey) && isolations.length > 0) {
        const iso = isolations[isB ? Math.min(1, isolations.length - 1) : 0];
        exs.push({
          id: `${mKey}_i_${iso.replace(/\s+/g,"")}`,
          name: iso, muscle: mKey, category: "isolation",
          sets: Math.max(2, setsClamp - 1), repRange: "10–15",
          rpe: 7, targetSets: Math.max(2, setsClamp - 1),
          notes: "Mind-muscle connection priority",
        });
      } else if (["biceps","triceps","calves","abs","delts","rear_delt"].includes(mKey) && isolations.length > 0) {
        const iso = isolations[isB ? Math.min(1, isolations.length - 1) : 0];
        exs.push({
          id: `${mKey}_i_${iso.replace(/\s+/g,"")}`,
          name: iso, muscle: mKey, category: "isolation",
          sets: 3, repRange: ["biceps","triceps"].includes(mKey) ? "8–12" : "15–20",
          rpe: 7, targetSets: 3, notes: "",
        });
      }
    });
    return exs;
  }

  const program = {};
  splitDef.schedule.forEach(day => {
    const isB = day.key.endsWith("2") || day.tag.includes("B");
    const exercises = splitDef.preset?.[day.key] ?? pickExercises(day.muscles, isB);
    program[day.key] = { tag: day.tag, muscles: day.muscles, exercises };
  });
  return program;
}

// ── ADAPTATION ENGINE ─────────────────────────────────────────────────────────
function runAdaptation({ program, history, level }) {
  if (!history || history.length < 2) return { adjustments: {}, signal: "neutral", note: "Keep logging sessions to unlock adaptive programming." };

  const vol = VOL[level] || VOL.intermediate;
  const recent = history.slice(-4); // last 4 sessions of each day type

  // Group history by day key
  const byDay = {};
  history.forEach(h => {
    if (!byDay[h.dayKey]) byDay[h.dayKey] = [];
    byDay[h.dayKey].push(h);
  });

  const adjustments = {};
  let signals = [];

  Object.entries(byDay).forEach(([dayKey, sessions]) => {
    if (sessions.length < 2) return;
    const last = sessions[sessions.length - 1];
    const prev = sessions[sessions.length - 2];

    // Compute total volume load: sum(sets * reps * weight) per session
    const calcVol = (sess) => (sess.completedExercises || []).reduce((sum, ex) => {
      return sum + (ex.loggedSets || []).reduce((s2, set) => s2 + (set.reps || 0) * (set.weight || 0), 0);
    }, 0);
    const lastVol = calcVol(last);
    const prevVol = calcVol(prev);
    const volDelta = prevVol > 0 ? (lastVol - prevVol) / prevVol : 0;

    // Compute avg RPE
    const avgRpe = (sess) => {
      const allSets = (sess.completedExercises || []).flatMap(ex => ex.loggedSets || []);
      const rpeSets = allSets.filter(s => s.rpe);
      return rpeSets.length ? rpeSets.reduce((s, x) => s + x.rpe, 0) / rpeSets.length : 7;
    };
    const lastRpe = avgRpe(last);

    // Determine signal
    let signal, setDelta = 0, note = "";
    if (volDelta > 0.05 && lastRpe < 8.5) {
      signal = "progress";
      setDelta = +1;
      note = "Volume increasing well. Adding 1 set to compounds.";
    } else if (lastRpe > 9 || volDelta < -0.1) {
      signal = "fatigue";
      setDelta = -1;
      note = "High RPE or volume drop detected. Reducing volume slightly.";
    } else if (sessions.length >= 3 && Math.abs(volDelta) < 0.03) {
      signal = "stall";
      setDelta = 0;
      note = "Volume stable. Consider increasing load targets by 2.5–5 lbs.";
    } else {
      signal = "neutral";
      setDelta = 0;
      note = "Progressing normally. Stay the course.";
    }

    adjustments[dayKey] = { signal, setDelta, lastVol, lastRpe: lastRpe.toFixed(1), note };
    signals.push(signal);
  });

  const dominantSignal = signals.includes("fatigue") ? "fatigue"
    : signals.filter(s => s === "progress").length > signals.length / 2 ? "progress"
    : signals.includes("stall") ? "stall" : "neutral";

  return { adjustments, signal: dominantSignal, note: Object.values(adjustments)[0]?.note || "Keep training consistently." };
}

// ── HIMBO STAT CHART ─────────────────────────────────────────────────────────
function HimboStatChart({muscleVol,level}) {
  const canvasRef=useRef(null);
  const stateRef=useRef({rotation:0,hoveredAxis:-1,spinning:false,lastX:0});
  const animRef=useRef(null);
  const axes=Object.entries(MUSCLE_BENCHMARKS);
  const levelMod={beginner:.7,intermediate:1,advanced:1.2,competitor:1.4}[level]||1;
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const cc=getCanvasC(); // theme-aware canvas palette
    const dpr=window.devicePixelRatio||1;
    canvas.width=canvas.offsetWidth*dpr; canvas.height=canvas.offsetHeight*dpr;
    const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr);
    const W=canvas.offsetWidth,H=canvas.offsetHeight,cx=W/2,cy=H/2,R=Math.min(W,H)/2-38,n=axes.length;
    const getAngle=i=>(i/n)*Math.PI*2-Math.PI/2+stateRef.current.rotation;
    // Convert hex to rgba helper
    const hex2rgba=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;};
    function draw(){
      ctx.clearRect(0,0,W,H);
      // Background fill
      ctx.fillStyle=cc.bg; ctx.fillRect(0,0,W,H);
      const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.1);
      grd.addColorStop(0,hex2rgba(cc.accent,0.06)); grd.addColorStop(1,"transparent");
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
      // Grid rings
      [.25,.5,.75,1].forEach((pct,ri)=>{
        ctx.beginPath();
        axes.forEach(([,],i)=>{const a=getAngle(i),r=R*pct,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
        ctx.closePath();
        ctx.strokeStyle=ri===3?hex2rgba(cc.accent,0.25):hex2rgba(cc.border,0.8); ctx.lineWidth=ri===3?1.5:.8; ctx.stroke();
      });
      // Axis spokes
      axes.forEach(([,bench],i)=>{
        const a=getAngle(i);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);
        ctx.strokeStyle=`${bench.color}22`; ctx.lineWidth=1; ctx.stroke();
      });
      const dataPts=axes.map(([key,bench],i)=>{
        const v=muscleVol[key]||{sets:0}; const mav=bench.mav*levelMod;
        const pct=Math.min(v.sets/mav,1.3); const a=getAngle(i);
        return {x:cx+Math.cos(a)*R*pct,y:cy+Math.sin(a)*R*pct,pct,key,bench,v};
      });
      // Data fill
      ctx.beginPath(); dataPts.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y)); ctx.closePath();
      const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      pg.addColorStop(0,hex2rgba(cc.accent,0.18)); pg.addColorStop(.6,hex2rgba(cc.green,0.10)); pg.addColorStop(1,hex2rgba(cc.blue,0.06));
      ctx.fillStyle=pg; ctx.fill();
      // Data outline
      ctx.beginPath(); dataPts.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y)); ctx.closePath();
      ctx.strokeStyle=hex2rgba(cc.accent,0.55); ctx.lineWidth=1.5; ctx.stroke();
      // Data points
      dataPts.forEach((pt,i)=>{
        const ih=stateRef.current.hoveredAxis===i;
        const sc=pt.pct<.5?cc.red:pt.pct<1?cc.accent:cc.green;
        ctx.beginPath(); ctx.arc(pt.x,pt.y,ih?6:4,0,Math.PI*2);
        ctx.fillStyle=sc; ctx.fill(); ctx.strokeStyle=cc.bg; ctx.lineWidth=1.5; ctx.stroke();
      });
      // Axis labels
      axes.forEach(([key,bench],i)=>{
        const a=getAngle(i),lr=R+22,lx=cx+Math.cos(a)*lr,ly=cy+Math.sin(a)*lr;
        const v=muscleVol[key]||{sets:0},mav=bench.mav*levelMod,pct=v.sets/mav;
        const sc=pct<.5?cc.red:pct<1?cc.accent:cc.green,ih=stateRef.current.hoveredAxis===i;
        ctx.textAlign="center";
        ctx.font=`${ih?"bold ":""}9px 'DM Sans',sans-serif`; ctx.fillStyle=ih?bench.color:sc;
        ctx.fillText(bench.label,lx,ly-3);
        ctx.font="8px 'DM Mono',monospace"; ctx.fillStyle=ih?cc.text:cc.muted;
        ctx.fillText(`${Math.round(v.sets)}/${Math.round(mav)}`,lx,ly+7); ctx.textAlign="left";
      });
      // Center hub
      ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fillStyle=cc.surface; ctx.fill();
      ctx.strokeStyle=hex2rgba(cc.accent,0.3); ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=cc.accent; ctx.font="bold 10px 'Bebas Neue',sans-serif"; ctx.textAlign="center";
      ctx.fillText("APEX",cx,cy+4); ctx.textAlign="left";
      // Hover tooltip
      if(stateRef.current.hoveredAxis>=0){
        const i=stateRef.current.hoveredAxis,[key,bench]=axes[i],v=muscleVol[key]||{sets:0};
        const mav=bench.mav*levelMod,mev=bench.mev*levelMod,pct=v.sets/mav;
        const status=pct<.5?"NEGLECTED":pct<1?"BUILDING":pct>1.15?"MRV RISK":"OPTIMAL";
        const sc=pct<.5?cc.red:pct<1?cc.accent:pct>1.15?cc.blue:cc.green;
        const tw=165,th=68,tx=Math.min(Math.max(cx-tw/2,8),W-tw-8),ty=8;
        ctx.fillStyle=cc.surface; ctx.beginPath(); ctx.roundRect(tx,ty,tw,th,8); ctx.fill();
        ctx.strokeStyle=`${bench.color}60`; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=bench.color; ctx.font="bold 11px 'Bebas Neue',sans-serif"; ctx.textAlign="left";
        ctx.fillText(bench.label.toUpperCase(),tx+12,ty+18);
        ctx.fillStyle=sc; ctx.font="bold 9px 'DM Sans',sans-serif";
        ctx.fillText(status,tx+tw-12-ctx.measureText(status).width,ty+18);
        ctx.fillStyle=cc.text; ctx.font="10px 'DM Mono',monospace";
        ctx.fillText(`Sets: ${Math.round(v.sets)} / ${Math.round(mav)} target`,tx+12,ty+34);
        ctx.fillStyle=cc.muted; ctx.font="9px 'DM Sans',sans-serif";
        ctx.fillText(`MEV ${Math.round(mev)} · MAV ${Math.round(mav)} · MRV ${bench.mrv}`,tx+12,ty+50);
        ctx.fillText(`Freq: ${v.freq} sessions this week`,tx+12,ty+62);
      }
    }
    function getHov(mx,my){
      let cl=-1,md=28;
      axes.forEach(([key,bench],i)=>{
        const v=muscleVol[key]||{sets:0},mav=bench.mav*levelMod,pct=Math.min(v.sets/mav,1.3),a=getAngle(i);
        const px=cx+Math.cos(a)*R*pct,py=cy+Math.sin(a)*R*pct,d=Math.sqrt((px-mx)**2+(py-my)**2);
        if(d<md){md=d;cl=i;}
        const lx=cx+Math.cos(a)*(R+22),ly=cy+Math.sin(a)*(R+22),dl=Math.sqrt((lx-mx)**2+(ly-my)**2);
        if(dl<20)cl=i;
      }); return cl;
    }
    const onMM=e=>{const rect=canvas.getBoundingClientRect(),mx=(e.clientX||e.touches?.[0]?.clientX)-rect.left,my=(e.clientY||e.touches?.[0]?.clientY)-rect.top;if(stateRef.current.spinning){stateRef.current.rotation+=(mx-stateRef.current.lastX)*.012;stateRef.current.lastX=mx;}else stateRef.current.hoveredAxis=getHov(mx,my);};
    const onMD=e=>{const rect=canvas.getBoundingClientRect();stateRef.current.spinning=true;stateRef.current.lastX=(e.clientX||e.touches?.[0]?.clientX)-rect.left;stateRef.current.hoveredAxis=-1;};
    const onMU=()=>stateRef.current.spinning=false;
    canvas.addEventListener("mousemove",onMM); canvas.addEventListener("mousedown",onMD); canvas.addEventListener("mouseup",onMU);
    canvas.addEventListener("touchmove",onMM,{passive:true}); canvas.addEventListener("touchstart",onMD,{passive:true}); canvas.addEventListener("touchend",onMU);
    function loop(){draw();animRef.current=requestAnimationFrame(loop);} loop();
    return()=>{cancelAnimationFrame(animRef.current);canvas.removeEventListener("mousemove",onMM);canvas.removeEventListener("mousedown",onMD);canvas.removeEventListener("mouseup",onMU);canvas.removeEventListener("touchmove",onMM);canvas.removeEventListener("touchstart",onMD);canvas.removeEventListener("touchend",onMU);};
  },[muscleVol,level]);
  return <canvas ref={canvasRef} style={{width:"100%",height:300,display:"block",cursor:"grab",touchAction:"none"}}/>;
}

// ── PATH SELECTOR ─────────────────────────────────────────────────────────────
function PathSelector({dayTag,onSelectGenerated,onSelectCustom}) {
  const C = useThemeColors();
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:14}}>● Choose your approach for {dayTag}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div onClick={onSelectGenerated}
          style={{background:C.card||C.surface,border:`2px solid ${C.brutal||C.accent}`,borderRadius:10,padding:18,cursor:"pointer",transition:"all .15s cubic-bezier(.22,1,.36,1)",boxShadow:`4px 4px 0 ${C.brutal||C.accent}`}}
          onMouseOver={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.brutal||C.accent}`;}}
          onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`4px 4px 0 ${C.brutal||C.accent}`;}}
          onMouseDown={e=>{e.currentTarget.style.transform="translate(4px,4px)";e.currentTarget.style.boxShadow="none";}}
          onMouseUp={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.brutal||C.accent}`;}}>
          <div style={{marginBottom:10,color:C.accent}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:C.accent,marginBottom:6}}>GENERATE WORKOUT</div>
          <div style={{fontSize:12,color:C.faint,lineHeight:1.5}}>AI-designed. Evidence-based selection, balanced stimulus, adaptive sets.</div>
          <div style={{marginTop:10,fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.accent}}>Recommended →</div>
        </div>
        <div onClick={onSelectCustom}
          style={{background:C.card||C.surface,border:`2px solid ${C.brutal||C.blue}`,borderRadius:10,padding:18,cursor:"pointer",transition:"all .15s cubic-bezier(.22,1,.36,1)",boxShadow:`4px 4px 0 ${C.brutal||C.blue}`}}
          onMouseOver={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.brutal||C.blue}`;}}
          onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`4px 4px 0 ${C.brutal||C.blue}`;}}
          onMouseDown={e=>{e.currentTarget.style.transform="translate(4px,4px)";e.currentTarget.style.boxShadow="none";}}
          onMouseUp={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.brutal||C.blue}`;}}>
          <div style={{marginBottom:10,color:C.blue}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:C.blue,marginBottom:6}}>LOG CUSTOM</div>
          <div style={{fontSize:12,color:C.faint,lineHeight:1.5}}>Full control. Any exercise. System tracks muscle balance automatically.</div>
          <div style={{marginTop:10,fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.blue}}>Free form →</div>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOM WORKOUT LOGGER ─────────────────────────────────────────────────────
function CustomWorkoutLogger({onComplete,onBack,muscleVol,level}) {
  const C = useThemeColors();
  const { session, updateSession } = useSession();
  // Restore exercises from session context on mount (survives iOS Safari refresh)
  const [exercises,setExercises]=useState(()=>session?.customExercises||[]);
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [tagging,setTagging]=useState(false); // AI muscle identification in progress
  const [timer,setTimer]=useState(0);
  const timerRef=useRef(null);
  const [customExDB,setCustomExDB]=useState({});
  const alerts=generateMuscleAlerts(muscleVol,level,C);

  useEffect(()=>{timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[]);

  // Persist exercise list into session context whenever it changes
  useEffect(()=>{
    if(exercises.length>0) updateSession({ customExercises: exercises });
  },[exercises]);

  // Load saved custom exercises on mount
  useEffect(()=>{
    window.storage.get(CUSTOM_EX_KEY).then(r=>{
      if(r?.value) try{ setCustomExDB(JSON.parse(r.value)||{}); }catch{}
    }).catch(()=>{});
  },[]);

  // All searchable names: built-in DB + saved custom exercises (deduplicated)
  const allNames=[...Object.keys(EX_DB),...Object.keys(customExDB).filter(n=>!EX_DB[n])];
  const filtered=search.length>=1?allNames.filter(n=>n.toLowerCase().includes(search.toLowerCase())).slice(0,10):[];

  const addExercise=async name=>{
    // 1. Fast synchronous resolution (EX_DB, saved custom, keyword patterns)
    let tag=EX_DB[name]||customExDB[name]||resolveExerciseTag(name);

    // 2. AI fallback for truly unrecognised names (e.g. "pec fly machine", "hip abduction")
    if(!tag||tag.primary==="custom"){
      setTagging(true);
      setSearch(""); setShowSearch(false);
      const aiTag=await resolveExerciseTagWithAI(name);
      setTagging(false);
      if(aiTag){
        tag=aiTag;
        // Cache so next use is instant
        const updated={...customExDB,[name]:{...aiTag,savedAt:Date.now(),aiClassified:true}};
        setCustomExDB(updated);
        window.storage.set(CUSTOM_EX_KEY,JSON.stringify(updated)).catch(()=>{});
      } else {
        tag={primary:"custom",secondary:[],movement:"custom",stim:5};
      }
    }

    setExercises(prev=>[...prev,{
      id:`cx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,muscle:tag.primary,
      category:tag.movement==="isolation"?"isolation":"compound",
      loggedSets:[{weight:"",reps:"",rpe:""}],tag,isCustom:!EX_DB[name],
    }]);
    setSearch(""); setShowSearch(false);
  };

  const updateSet=(ei,si,field,val)=>setExercises(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,loggedSets:ex.loggedSets.map((s,j)=>j!==si?s:{...s,[field]:val})}));
  const addSet=ei=>setExercises(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,loggedSets:[...ex.loggedSets,{weight:"",reps:"",rpe:""}]}));
  const removeEx=ei=>setExercises(prev=>prev.filter((_,i)=>i!==ei));
  const totalSets=exercises.reduce((s,ex)=>s+ex.loggedSets.filter(x=>x.reps&&x.weight).length,0);
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const rpeC=r=>{const n=parseFloat(r);return!n?C.muted:n>=9?C.red:n>=8?C.accent:C.green;};
  const handleComplete=()=>{
    const ce=exercises.map(ex=>({
      id:ex.id, name:ex.name, muscle:ex.muscle,
      tag: ex.tag || resolveExerciseTag(ex.name) || {primary:"custom",secondary:[],movement:"custom",stim:5},
      loggedSets:ex.loggedSets.filter(s=>s.reps&&s.weight),
    })).filter(ex=>ex.loggedSets.length>0);

    // Auto-save any new custom exercises (not in built-in DB) for future sessions
    const newCustom=exercises.filter(ex=>ex.isCustom&&!customExDB[ex.name]&&ex.loggedSets.some(s=>s.reps&&s.weight));
    if(newCustom.length>0){
      const updated={...customExDB};
      newCustom.forEach(ex=>{ updated[ex.name]={...(ex.tag||{}),savedAt:Date.now()}; });
      window.storage.set(CUSTOM_EX_KEY,JSON.stringify(updated)).catch(()=>{});
    }

    onComplete({dayKey:`custom_${Date.now()}`,completedExercises:ce,duration:timer,ts:Date.now(),isCustom:true});
  };
  return (
    <div className="screen" style={{paddingBottom:'calc(200px + env(safe-area-inset-bottom,0px))'}}>
    {/* paddingBottom clears the fixed complete-button bar (87px) + nav (96px) + safe-area */}
      <div style={{padding:"52px 24px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",marginBottom:12}}>← Back</button>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div><div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.blue,marginBottom:4}}>Custom Session</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2}}>LOG WORKOUT</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:C.blue}}>{fmt(timer)}</div><div style={{fontSize:10,color:C.muted}}>{totalSets} sets</div></div>
        </div>
      </div>
      {alerts.length>0&&(
        <div style={{margin:"14px 24px 0"}}>
          <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>● Balance Alerts</div>
          {alerts.slice(0,3).map(a=>(
            <div key={a.key} style={{display:"flex",gap:10,padding:"8px 12px",background:`${a.color}0D`,border:`1px solid ${a.color}30`,borderRadius:8,marginBottom:6,alignItems:"center"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:a.severity==="critical"?C.red:a.severity==="overreach"?C.blue:C.accent,display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:12,color:C.faint,lineHeight:1.4}}>{a.msg}</span>
            </div>
          ))}
        </div>
      )}
      {/* ── EXERCISE ENTRY ── */}
      <div style={{margin:"16px 24px 0"}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.blue,marginBottom:10}}>● Add Exercise</div>

        <div style={{position:"relative",zIndex:9999}}>
          <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
            <input
              type="text"
              placeholder="e.g. Bench Press, Farmers Carry, JM Press…"
              value={search}
              autoComplete="off"
              onFocus={()=>setShowSearch(true)}
              onBlur={()=>setTimeout(()=>setShowSearch(false),400)}
              onChange={e=>{setSearch(e.target.value);setShowSearch(true);}}
              onKeyDown={e=>{
                if(e.key==="Enter"&&search.trim()&&!tagging){
                  e.preventDefault();
                  addExercise(search.trim());
                }
              }}
              style={{
                flex:1,background:C.up,
                border:`2px solid ${search.trim()?C.blue:C.border}`,
                borderRadius:12,padding:"14px 16px",
                color:C.text,fontSize:15,
                fontFamily:"'DM Sans',sans-serif",
                outline:"none",transition:"border-color .2s",
              }}
            />
            <button
              onClick={()=>{ if(search.trim()&&!tagging) addExercise(search.trim()); }}
              disabled={!search.trim()||tagging}
              style={{
                flexShrink:0,padding:"0 20px",
                background:search.trim()?C.blue:`${C.blue}18`,
                border:`2px solid ${search.trim()?C.blue:`${C.blue}28`}`,
                borderRadius:12,
                color:search.trim()?"#080A0C":C.muted,
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:14,letterSpacing:1.5,
                cursor:search.trim()?"pointer":"not-allowed",
                transition:"all .2s",
                boxShadow:"none",
              }}>
              ADD ▶
            </button>
          </div>

          {/* hint line */}
          <div style={{fontSize:11,color:C.muted,marginTop:7,paddingLeft:2}}>
            {tagging
              ? <span style={{color:C.accent,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{display:"inline-flex",gap:3}}>
                    {[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:C.accent,display:"inline-block",opacity:.7,animation:`pulse ${.9+i*.15}s infinite`}}/>)}
                  </span>
                  Identifying muscle group...
                </span>
              : <>Write any exercise name and hit <span style={{color:C.blue}}>Enter</span> or <span style={{color:C.blue}}>ADD</span>.
                {search.length>=2&&filtered.length>0&&<span style={{color:C.muted}}> Suggestions below ↓</span>}</>
            }
          </div>

          {/* SUGGESTIONS — secondary assist, only if DB matches exist */}
          {showSearch&&search.length>=2&&filtered.length>0&&(
            <div style={{
              position:"absolute",top:"52px",left:0,right:"88px",
              background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:12,zIndex:300,
              maxHeight:220,overflowY:"auto",
              boxShadow:"0 8px 32px rgba(0,0,0,.6)",
              marginTop:4,
            }}>
              <div style={{padding:"8px 14px 4px",fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,borderBottom:`1px solid ${C.border}`}}>
                Exercises — or press Enter to add your own
              </div>
              {filtered.map(name=>{
                const isBuiltIn=!!EX_DB[name];
                const isSavedCustom=!isBuiltIn&&!!customExDB[name];
                const tag=EX_DB[name]||customExDB[name];
                const bench=MUSCLE_BENCHMARKS[tag?.primary];
                return (
                  <button key={name} type="button"
                    onClick={()=>addExercise(name)}
                    style={{
                      width:"100%",textAlign:"left",background:"transparent",border:"none",
                      padding:"10px 16px",cursor:"pointer",
                      borderBottom:`1px solid ${C.border}`,
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      touchAction:"manipulation",  // kills iOS 300ms tap delay
                      transition:"background .12s",
                    }}
                    onMouseOver={e=>e.currentTarget.style.background=C.up}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{name}</span>
                        {isSavedCustom&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:`${C.accent}20`,color:C.accent,border:`1px solid ${C.accent}40`,borderRadius:3,padding:"1px 5px"}}>saved</span>}
                      </div>
                      <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                        {isBuiltIn ? `${tag?.movement?.replace(/_/g," ")} · Stim ${tag?.stim}/10` : isSavedCustom ? `Custom · ${tag?.primary||"custom"}` : "Custom exercise"}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {bench&&<div style={{width:7,height:7,borderRadius:"50%",background:bench.color}}/>}
                      <span style={{fontSize:10,color:bench?.color||C.muted}}>{bench?.label||tag?.primary||""}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {exercises.length===0?(
        <div className="cx-empty-state" style={{padding:"36px 24px",textAlign:"center"}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.up,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:C.muted}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:C.muted,marginBottom:8}}>YOUR SESSION STARTS HERE</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.65,maxWidth:280,margin:"0 auto"}}>
            Write any exercise above — a classic lift, a machine move, or something completely your own. Hit Enter to add it instantly.
          </div>
        </div>
      ):exercises.map((ex,ei)=>{
        const bench=MUSCLE_BENCHMARKS[ex.tag?.primary],done=ex.loggedSets.filter(s=>s.reps&&s.weight).length;
        // Recognized = resolveExerciseTag found a real muscle (primary !== "custom")
        const recognized = ex.tag?.primary && ex.tag.primary !== "custom";
        const inDB = !!EX_DB[ex.name];
        return (
          <div key={ex.id} className="cx-card-wrap" style={{margin:"14px 24px 0"}}>
            <div style={{background:C.card||C.surface,border:`2px solid ${C.brutal||C.border}`,borderRadius:10,padding:16,boxShadow:`4px 4px 0 ${C.brutal||C.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    {bench&&<div style={{width:8,height:8,borderRadius:"50%",background:bench.color,flexShrink:0}}/>}
                    {recognized
                      ? <span style={{fontSize:10,color:bench?.color||C.accent,letterSpacing:1,textTransform:"uppercase"}}>{bench?.label||ex.tag.primary} · {ex.tag?.movement?.replace(/_/g," ")||"exercise"}</span>
                      : <span style={{fontSize:10,color:C.blue,letterSpacing:1,textTransform:"uppercase",background:`${C.blue}15`,padding:"1px 7px",borderRadius:4}}>Custom Exercise</span>
                    }
                  </div>
                  <div style={{fontSize:15,fontWeight:600,color:C.text}}>{ex.name}</div>
                  <div style={{fontSize:10,color:recognized?C.muted:"var(--muted)",marginTop:2}}>
                    {!recognized
                      ? "Not recognized — sets won't count toward muscle volume"
                      : inDB
                        ? `Stim ${ex.tag?.stim||"?"}/10 · ${done}/${ex.loggedSets.length} sets done`
                        : `Detected: ${bench?.label||ex.tag.primary} · ${done}/${ex.loggedSets.length} sets done`
                    }
                  </div>
                </div>
                <button onClick={()=>removeEx(ei)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:4}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"24px 1fr 1fr 1fr 20px",gap:6,marginBottom:6}}>
                {["#","WT","REPS","RPE",""].map(h=><div key={h} style={{fontSize:8,letterSpacing:1,textTransform:"uppercase",color:C.muted,textAlign:"center"}}>{h}</div>)}
              </div>
              {ex.loggedSets.map((set,si)=>{
                const d=set.reps&&set.weight;
                return (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"24px 1fr 1fr 1fr 20px",gap:5,marginBottom:5,alignItems:"center"}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:d?C.blue:C.muted,textAlign:"center"}}>{si+1}</div>
                    <input type="number" placeholder="lbs" value={set.weight} onChange={e=>updateSet(ei,si,"weight",e.target.value)} style={{background:C.up,border:`2px solid ${d?C.brutal:C.border}`,borderRadius:4,boxShadow:d?`2px 2px 0 ${C.brutal}`:"none",padding:"8px 6px",color:d?C.text:C.muted,fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"center",outline:"none",width:"100%",transition:"border-color .15s,box-shadow .15s"}}/>
                    <input type="number" placeholder="reps" value={set.reps} onChange={e=>updateSet(ei,si,"reps",e.target.value)} style={{background:C.up,border:`2px solid ${d?C.brutal:C.border}`,borderRadius:4,boxShadow:d?`2px 2px 0 ${C.brutal}`:"none",padding:"8px 6px",color:d?C.text:C.muted,fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"center",outline:"none",width:"100%",transition:"border-color .15s,box-shadow .15s"}}/>
                    <input type="number" min="6" max="10" step=".5" placeholder="RPE" value={set.rpe} onChange={e=>updateSet(ei,si,"rpe",e.target.value)} style={{background:C.up,border:`2px solid ${set.rpe?rpeC(set.rpe):C.border}`,borderRadius:4,boxShadow:set.rpe?`2px 2px 0 ${rpeC(set.rpe)}`:"none",padding:"8px 6px",color:set.rpe?rpeC(set.rpe):C.muted,fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"center",outline:"none",width:"100%",transition:"border-color .15s,box-shadow .15s"}}/>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{d&&<div style={{width:14,height:14,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>✓</div>}</div>
                  </div>
                );
              })}
              <button onClick={()=>addSet(ei)} style={{width:"100%",marginTop:8,padding:"7px",background:"transparent",border:`2px solid ${C.brutal}`,borderRadius:4,boxShadow:`2px 2px 0 ${C.brutal}`,color:C.muted,fontSize:11,cursor:"pointer",transition:"all .12s",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>+ ADD SET</button>
            </div>
          </div>
        );
      })}
      <div style={{position:"fixed",bottom:"calc(96px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 24px",background:"rgba(8,10,12,0.97)",borderTop:`1px solid ${C.border}`,zIndex:110,animation:"none"}}>
        <button onClick={handleComplete} disabled={totalSets===0} style={{width:"100%",padding:15,background:C.blue,color:"#080A0C",border:`2px solid ${C.brutal}`,borderRadius:6,boxShadow:totalSets>0?`3px 3px 0 ${C.brutal}`:"none",fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2,cursor:totalSets>0?"pointer":"not-allowed",opacity:totalSets>0?1:.4,transition:"all .2s"}}>
          COMPLETE SESSION ({totalSets} sets)
        </button>
      </div>
    </div>
  );
}

// ── EXERCISE IMAGES — static map to free-exercise-db frames ──────────────────
// ── MUSCLE ANATOMY DIAGRAM ────────────────────────────────────────────────────
// Uses WGER open-source anatomical SVGs (CC-BY-SA).
// Base body illustration + per-muscle red overlays stacked via CSS.
// Primary: main/ overlay with pulse glow animation.
// Secondary: secondary/ overlay at 50% opacity.

const WGER_BASE = "https://raw.githubusercontent.com/wger-project/wger/master/wger/core/static/images/muscles/";

// Maps EX_DB muscle keys → WGER muscle IDs
const MUSCLE_WGER = {
  chest:      [4],
  back:       [12, 9],   // lats + traps
  quads:      [10],
  hams:       [11],
  delts:      [2],
  rear_delt:  [2],
  front_delt: [2],
  triceps:    [5],
  biceps:     [1],
  calves:     [7],
  abs:        [6],
  glutes:     [8],
  traps:      [9],
  lower_back: [9],
  forearms:   [13],
};

const BACK_VIEW_MUSCLES = new Set(["back","rear_delt","hams","glutes","lower_back","traps","triceps"]);

function MuscleDiagram({ name }) {
  const tag = EX_DB[name];
  if (!tag) return null;
  const { primary, secondary = [] } = tag;
  const C = useThemeColors();

  const showBack   = BACK_VIEW_MUSCLES.has(primary);
  const bodyImg    = `${WGER_BASE}muscular_system_${showBack ? "back" : "front"}.svg`;
  const primaryIds = MUSCLE_WGER[primary] || [];
  const secondaryIds = [...new Set(
    (secondary || []).flatMap(m => MUSCLE_WGER[m] || [])
      .filter(id => !primaryIds.includes(id))
  )];

  const label = MUSCLE_BENCHMARKS[primary]?.label || primary;
  const overlay = { position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"contain" };

  return (
    <div style={{ borderRadius:12, marginBottom:14, background:"#f5f0eb", border:`1px solid ${C.border}`, overflow:"hidden" }}>
      {/* label bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px 6px", background:C.surface }}>
        <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:C.muted }}>
          {showBack ? "Posterior" : "Anterior"} View
        </span>
        <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:"#cc2020", fontWeight:700 }}>
          {label}
        </span>
      </div>

      {/* anatomy stack */}
      <div style={{ position:"relative", width:"100%", aspectRatio:"200 / 369", maxHeight:260, margin:"0 auto" }}>
        {/* base anatomical illustration */}
        <img src={bodyImg} alt="anatomy" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }}/>

        {/* secondary muscle overlays — shown dimly */}
        {secondaryIds.map(id => (
          <img key={`s${id}`} alt="" src={`${WGER_BASE}secondary/muscle-${id}.svg`} style={{ ...overlay, opacity:0.6 }}/>
        ))}

        {/* primary muscle overlays — animated pulse */}
        {primaryIds.map(id => (
          <img key={`p${id}`} alt="" src={`${WGER_BASE}main/muscle-${id}.svg`}
               style={{ ...overlay, animation:"musclePulse 2s ease-in-out infinite" }}/>
        ))}
      </div>

      {/* legend */}
      <div style={{ display:"flex", gap:14, justifyContent:"center", padding:"6px 0 8px", background:C.surface }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#cc2020" }}/>
          <span style={{ fontSize:9, color:C.muted, letterSpacing:1 }}>PRIMARY</span>
        </div>
        {secondaryIds.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#e07050" }}/>
            <span style={{ fontSize:9, color:C.muted, letterSpacing:1 }}>SECONDARY</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WORKOUT SESSION VIEW ──────────────────────────────────────────────────────
function WorkoutSession({ dayKey, dayPlan, adaptation, history = [], onComplete, onBack }) {
  const C = useThemeColors();
  const { session, updateSession } = useSession();
  const adj = adaptation?.adjustments?.[dayKey];

  // Build prev-session lookup: ex.id or ex.name → array of logged sets
  const { prevMap, prevDate } = (() => {
    const prev = [...history].reverse().find(h => h.dayKey === dayKey && h.completedExercises?.length);
    if (!prev) return { prevMap: {}, prevDate: null };
    const map = {};
    prev.completedExercises.forEach(ex => {
      const sets = ex.loggedSets || [];
      if (ex.id)   map[ex.id]   = sets;
      if (ex.name) map[ex.name] = sets;
    });
    const d = new Date(prev.ts);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { prevMap: map, prevDate: label };
  })();

  // Load relevant coach note from previous session of the same type
  const [coachNote, setCoachNote] = useState(null);
  const [noteVisible, setNoteVisible] = useState(true);
  useEffect(() => {
    window.storage.get(FEEDBACK_KEY).then(r => {
      try {
        if (!r?.value) return;
        const parsed = JSON.parse(r.value);
        const arr = Array.isArray(parsed) ? parsed : Object.values(parsed).filter(v => v?.text);
        if (!arr.length) return;
        // Most recent exact dayKey match
        const exact = arr.filter(fb => fb.dayKey === dayKey).sort((a, b) => (b.ts||0) - (a.ts||0))[0];
        if (exact?.text) { setCoachNote(exact); return; }
        // Fallback: most overlap with current muscles
        const currentMuscles = new Set(dayPlan?.muscles || []);
        const best = arr
          .filter(fb => fb?.text && Array.isArray(fb.muscles))
          .map(fb => ({ fb, overlap: fb.muscles.filter(m => currentMuscles.has(m)).length }))
          .filter(({ overlap }) => overlap > 0)
          .sort((a, b) => b.overlap - a.overlap || (b.fb.ts||0) - (a.fb.ts||0))[0];
        if (best) setCoachNote(best.fb);
      } catch {}
    }).catch(() => {});
  }, [dayKey]);

  // All persistent state lives in context — local state only for UI
  const loggedSets = session?.loggedSets || {};
  const activeEx   = session?.activeEx || null;
  const [completing, setCompleting] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [toastResult, setToastResult] = useState(null);
  const [toastCountdown, setToastCountdown] = useState(4);
  const toastTimerRef = useRef(null);
  const toastCountRef = useRef(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Derive elapsed time from startedAt so it survives remounts
  useEffect(() => {
    if (!session?.startedAt) return;
    const tick = () => setTimer(Math.floor((Date.now() - session.startedAt) / 1000));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.startedAt]);

  const setActiveEx = (id) => updateSession({ activeEx: id });

  const updateSet = (exId, setIdx, field, val) => {
    updateSession(prev => {
      const prevSets = prev.loggedSets?.[exId] || [];
      const updated = prevSets.map((s, i) => i === setIdx ? { ...s, [field]: val } : s);
      return { ...prev, loggedSets: { ...prev.loggedSets, [exId]: updated } };
    });
  };

  const addSet = (exId) => {
    updateSession(prev => ({
      ...prev,
      loggedSets: { ...prev.loggedSets, [exId]: [...(prev.loggedSets?.[exId] || []), { weight: "", reps: "", rpe: "" }] }
    }));
  };

  const removeSet = (exId) => {
    updateSession(prev => {
      const sets = prev.loggedSets?.[exId] || [];
      if (sets.length <= 1) return prev;
      return { ...prev, loggedSets: { ...prev.loggedSets, [exId]: sets.slice(0, -1) } };
    });
  };

  const totalSets = Object.values(loggedSets).reduce((s, sets) => s + (sets?.filter(x => x.reps && x.weight).length || 0), 0);
  const totalExercises = dayPlan.exercises.length;

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const handleComplete = () => {
    setCompleting(true);
    const completedExercises = dayPlan.exercises.map(ex => ({
      id: ex.id, name: ex.name, muscle: ex.muscle,
      loggedSets: (loggedSets[ex.id] || []).filter(s => s.reps && s.weight),
    }));
    const result = { dayKey, completedExercises, duration: timer, ts: Date.now() };
    setToastResult(result);
    setToastCountdown(4);
    // Countdown display
    toastCountRef.current = setInterval(() => {
      setToastCountdown(n => {
        if (n <= 1) { clearInterval(toastCountRef.current); return 0; }
        return n - 1;
      });
    }, 1000);
    // Commit after 4s
    toastTimerRef.current = setTimeout(() => {
      setToastResult(null);
      onComplete(result);
    }, 4000);
  };

  const handleUndoComplete = () => {
    clearTimeout(toastTimerRef.current);
    clearInterval(toastCountRef.current);
    setToastResult(null);
    setCompleting(false);
    setToastCountdown(4);
  };

  const sfrColor = (r) => {
    const n = parseFloat(r);
    if (!n) return C.muted;
    if (n >= 4) return C.green;   // high stimulus, low fatigue — ideal
    if (n >= 3) return C.accent;  // moderate trade-off
    return C.red;                  // high fatigue, low stimulus — reconsider
  };

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      {/* SESSION HEADER */}
      <div style={{ padding: "52px 24px 0" }}>
        <button onClick={() => totalSets > 0 ? setShowAbandonConfirm(true) : onBack()} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Program
        </button>
        {showAbandonConfirm && (
          <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>Abandon session?</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{totalSets} set{totalSets !== 1 ? "s" : ""} will not be saved</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowAbandonConfirm(false)} style={{ padding: "6px 14px", background: C.up, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Keep Going</button>
              <button onClick={onBack} style={{ padding: "6px 14px", background: C.red, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Abandon</button>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 4 }}>{dayPlan.tag}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: 2, lineHeight: 1 }}>ACTIVE SESSION</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, color: C.accent }}>{formatTime(timer)}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{totalSets} sets logged</div>
          </div>
        </div>

        {/* Adaptation signal banner */}
        {adj && adj.signal !== "neutral" && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: adj.signal === "fatigue" ? "rgba(232,69,69,0.08)" : adj.signal === "progress" ? "rgba(61,220,132,0.08)" : "rgba(245,166,35,0.08)", border: `1px solid ${adj.signal === "fatigue" ? C.red : adj.signal === "progress" ? C.green : C.accent}30`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: adj.signal === "fatigue" ? C.red : adj.signal === "progress" ? C.green : C.accent, lineHeight: 1 }}>{adj.signal === "fatigue" ? "↓" : adj.signal === "progress" ? "↑" : "→"}</span>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: adj.signal === "fatigue" ? C.red : adj.signal === "progress" ? C.green : C.accent, marginBottom: 2 }}>Adaptive Adjustment</div>
              <div style={{ fontSize: 12, color: C.faint }}>{adj.note}</div>
            </div>
          </div>
        )}
      </div>

      {/* COACH NOTE — from last session of same type */}
      {coachNote?.text && noteVisible && (
        <div style={{ margin: "0 24px 16px", background: "var(--card)", border: `2px solid var(--accent)`, borderRadius: 10, boxShadow: `3px 3px 0 var(--accent)`, overflow: "hidden", animation: "slideUp .3s ease" }}>
          <div style={{ padding: "10px 14px", background: `${C.accent}15`, borderBottom: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: C.accent }}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.accent }}>
                Coach Note · Last {coachNote.dayKey ? coachNote.dayKey.replace(/_/g," ").toUpperCase() : "Session"}
              </div>
            </div>
            <button onClick={() => setNoteVisible(false)}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ padding: "10px 14px", fontSize: 12, color: C.faint, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
            {coachNote.text}
          </div>
        </div>
      )}

      {/* EXERCISES */}
      <div style={{ padding: "20px 0 0" }}>
        {dayPlan.exercises.map((ex, exIdx) => {
          const isOpen = activeEx === ex.id;
          const sets = loggedSets[ex.id] || [];
          const completedSetsCount = sets.filter(s => s.reps && s.weight).length;
          const prevSets = prevMap[ex.id] || prevMap[ex.name] || [];
          const prevSummary = prevSets.length
            ? prevSets.map(s => s.weight && s.reps ? `${s.weight}×${s.reps}` : null).filter(Boolean).join(" · ")
            : null;
          const sessionPR = sets.some((s, i) => {
            const p = prevSets[i];
            return s.weight && p?.weight && parseFloat(s.weight) > parseFloat(p.weight);
          });

          return (
            <div key={ex.id} style={{ margin: "0 24px 14px" }}>
              {/* Exercise header — tap to expand */}
              <div
                onClick={() => setActiveEx(isOpen ? null : ex.id)}
                style={{ background: isOpen ? `${C.accent}15` : C.card||C.surface, border: `2px solid ${isOpen ? C.accent : C.brutal||C.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s cubic-bezier(.22,1,.36,1)", boxShadow: isOpen ? `4px 4px 0 ${C.accent}` : `4px 4px 0 ${C.brutal||C.border}` }}
                onMouseOver={e=>{if(!isOpen){e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.brutal||C.border}`;}}}
                onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=isOpen?`4px 4px 0 ${C.accent}`:`4px 4px 0 ${C.brutal||C.border}`;}}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>Ex {String(exIdx + 1).padStart(2, "0")} · {ex.category}</span>
                      {completedSetsCount > 0 && (
                        <span style={{ fontSize: 9, background: `${C.green}20`, color: C.green, padding: "1px 7px", borderRadius: 10, letterSpacing: 1 }}>{completedSetsCount}/{sets.length} sets</span>
                      )}
                      {sessionPR && (
                        <span style={{ fontSize: 9, background: `${C.accent}25`, color: C.accent, padding: "1px 7px", borderRadius: 10, letterSpacing: 1, fontWeight: 700 }}>▲ PR</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, color: C.text }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: C.faint }}>{sets.length} sets</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, color: C.faint }}>{ex.repRange} reps</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, color: C.faint }}>Target SFR {ex.rpe >= 8 ? "3" : ex.rpe >= 7 ? "4" : "5"}</span>
                    </div>
                    {prevSummary && !isOpen && (
                      <div style={{ marginTop: 6, fontSize: 10, color: C.muted, fontFamily: "'DM Mono',monospace" }}>
                        <span style={{ color: C.faint, marginRight: 4 }}>{prevDate}:</span>{prevSummary}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 18, color: isOpen ? C.accent : C.muted, transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none" }}>⌄</div>
                </div>

                {ex.notes && !isOpen && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: "italic" }}>{ex.notes}</div>
                )}
              </div>

              {/* Set Logger — expanded */}
              {isOpen && (
                <div style={{ background: C.up, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "14px 16px 14px", animation: "slideUp .2s ease" }}>

                  {/* Muscle anatomy diagram */}
                  <MuscleDiagram name={ex.name} />

                  {/* Previous session reference bar */}
                  {prevSummary && (
                    <div style={{ background: `${C.accent}0D`, border: `1px solid ${C.accent}25`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, flexShrink: 0 }}>Last {prevDate}</span>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: C.muted, lineHeight: 1.5 }}>{prevSummary}</span>
                    </div>
                  )}
                  {!prevSummary && prevDate === null && (
                    <div style={{ fontSize: 10, color: C.faint, fontStyle: "italic", marginBottom: 10 }}>First time logging this exercise — set your baseline.</div>
                  )}

                  {/* Column headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 28px", gap: 6, padding: "4px 0 6px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                    {["#","WEIGHT","REPS","SFR",""].map(h => (
                      <div key={h} style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.muted, textAlign: "center" }}>{h}</div>
                    ))}
                  </div>
                  {exIdx === 0 && <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>SFR = Stimulus to Fatigue Ratio (1–5). 5 = max stimulus, minimal fatigue. 1 = high fatigue, little growth stimulus.</div>}

                  {sets.map((set, si) => {
                    const done = set.reps && set.weight;
                    const prev = prevSets[si];
                    const isPR = done && prev?.weight && parseFloat(set.weight) > parseFloat(prev.weight);
                    const weightPlaceholder = prev?.weight ? `${prev.weight}` : "lbs";
                    const repsPlaceholder   = prev?.reps   ? `${prev.reps}`   : "reps";
                    return (
                      <div key={si} style={{ marginBottom: 8 }}>
                        {prev && (
                          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 28px", gap: 6, marginBottom: 2 }}>
                            <div/>
                            <div style={{ fontSize: 9, color: C.faint, fontFamily: "'DM Mono',monospace", textAlign: "center", letterSpacing: .5 }}>{prev.weight || "—"}</div>
                            <div style={{ fontSize: 9, color: C.faint, fontFamily: "'DM Mono',monospace", textAlign: "center", letterSpacing: .5 }}>{prev.reps || "—"}</div>
                            <div style={{ fontSize: 9, color: C.faint, fontFamily: "'DM Mono',monospace", textAlign: "center", letterSpacing: .5 }}>{prev.rpe || "—"}</div>
                            {/* rpe field preserved in data as-is for backwards compat */}
                            <div/>
                          </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 28px", gap: 6, alignItems: "center" }}>
                          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: done ? C.accent : C.muted, textAlign: "center" }}>{si + 1}</div>
                          <input type="number" placeholder={weightPlaceholder} value={set.weight}
                            onChange={e => updateSet(ex.id, si, "weight", e.target.value)}
                            style={{ background: C.up, border: `2px solid ${isPR ? C.red : done ? C.brutal : C.border}`, borderRadius: 4, boxShadow: isPR ? `2px 2px 0 ${C.red}` : done ? `2px 2px 0 ${C.brutal}` : "none", padding: "9px 8px", color: isPR ? C.red : done ? C.text : C.muted, fontSize: 13, fontFamily: "'DM Mono',monospace", textAlign: "center", outline: "none", width: "100%", transition: "all .15s", fontWeight: isPR ? 700 : 400 }} />
                          <input type="number" placeholder={repsPlaceholder} value={set.reps}
                            onChange={e => updateSet(ex.id, si, "reps", e.target.value)}
                            style={{ background: C.up, border: `2px solid ${done ? C.brutal : C.border}`, borderRadius: 4, boxShadow: done ? `2px 2px 0 ${C.brutal}` : "none", padding: "9px 8px", color: done ? C.text : C.muted, fontSize: 13, fontFamily: "'DM Mono',monospace", textAlign: "center", outline: "none", width: "100%", transition: "all .15s" }} />
                          <input type="number" min="1" max="5" step="1" placeholder="SFR"
                            value={set.rpe}
                            onChange={e => updateSet(ex.id, si, "rpe", e.target.value)}
                            style={{ background: C.up, border: `2px solid ${set.rpe ? sfrColor(set.rpe) : C.border}`, borderRadius: 4, boxShadow: set.rpe ? `2px 2px 0 ${sfrColor(set.rpe)}` : "none", padding: "9px 8px", color: set.rpe ? sfrColor(set.rpe) : C.muted, fontSize: 13, fontFamily: "'DM Mono',monospace", textAlign: "center", outline: "none", width: "100%", transition: "all .15s" }} />
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isPR ? <div style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>▲</div>
                              : done ? <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</div>
                              : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add / Remove set controls */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => addSet(ex.id)}
                      style={{ flex: 1, padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.faint, fontSize: 12, cursor: "pointer", transition: "all .2s" }}
                      onMouseOver={e => e.target.style.borderColor = C.accent}
                      onMouseOut={e => e.target.style.borderColor = C.border}>
                      + Add Set
                    </button>
                    {sets.length > 1 && (
                      <button onClick={() => removeSet(ex.id)}
                        style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: "pointer" }}>
                        – Remove
                      </button>
                    )}
                  </div>

                  {ex.notes && (
                    <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{color:C.accent,fontSize:9}}>▸</span>{ex.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* COMPLETE BUTTON */}
      <div style={{ margin: "20px 24px 12px" }}>
        <button
          onClick={handleComplete}
          disabled={completing || totalSets === 0}
          style={{ width: "100%", padding: 16, background: completing ? C.green : C.accent, color: "#080A0C", border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, cursor: totalSets > 0 ? "pointer" : "not-allowed", opacity: totalSets > 0 ? 1 : 0.4, transition: "all .3s" }}>
          {completing ? "SAVING..." : `COMPLETE SESSION (${totalSets} sets logged)`}
        </button>
      </div>

      {/* UNDO TOAST */}
      {toastResult && (
        <div style={{
          position: "fixed", bottom: "calc(96px + env(safe-area-inset-bottom,0px))", left: 16, right: 16, animation: "none",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
          animation: "slideUp .22s ease-out",
          zIndex: 200,
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 1, color: C.green }}>SESSION SAVED</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{totalSets} sets logged</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{toastCountdown}</div>
            <button onClick={handleUndoComplete}
              style={{ padding: "6px 16px", background: C.up, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MINI SESSION VIEW ─────────────────────────────────────────────────────────
function MiniSessionView({ onExpand, onEnd, endConfirm }) {
  const { session } = useSession();
  const C = useThemeColors();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session?.startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.startedAt]);

  if (!session) return null;

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // Figure out current exercise and set progress
  const exList = session.type === "generated"
    ? (session.dayPlan?.exercises || [])
    : (session.exercises || []);
  const loggedSets = session.loggedSets || {};
  const totalSets = Object.values(loggedSets).reduce((s, sets) => s + (sets?.filter(x => x.reps && x.weight).length || 0), 0);
  const totalSetSlots = Object.values(loggedSets).reduce((s, sets) => s + (sets?.length || 0), 0);

  // Current = first exercise with incomplete sets, or last
  const currentEx = exList.find(ex => {
    const sets = loggedSets[ex.id] || [];
    return sets.some(s => !s.reps || !s.weight);
  }) || exList[exList.length - 1];
  const currentExName = currentEx?.name || (session.type === "custom" ? "Custom Session" : session.dayPlan?.tag || "Active Session");

  const currentExSets = currentEx ? (loggedSets[currentEx.id] || []) : [];
  const currentDone = currentExSets.filter(s => s.reps && s.weight).length;
  const currentTotal = currentExSets.length;

  const progressPct = totalSetSlots > 0 ? (totalSets / totalSetSlots) * 100 : 0;
  const exIndex = exList.indexOf(currentEx);

  return (
    <div className="msv" onClick={onExpand}>
      <div className="msv-inner">
        <div className="msv-timer">
          <div className="msv-timer-dot"/>
          {fmt(elapsed)}
        </div>
        <div className="msv-info">
          <div className="msv-exname">{currentExName}</div>
          <div className="msv-meta">
            {exList.length > 0
              ? `Ex ${exIndex + 1}/${exList.length} · ${currentDone}/${currentTotal} sets · ${totalSets} total`
              : `${totalSets} sets logged`
            }
          </div>
        </div>
        <div className="msv-actions" onClick={e => e.stopPropagation()}>
          <button className="msv-btn" onClick={onExpand} title="Open session">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            <span>OPEN</span>
          </button>
          <button className="msv-btn msv-btn-end" onClick={onEnd} title="End session"
            style={endConfirm ? {background:"var(--red)",color:"#fff"} : {}}>
            {endConfirm
              ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polyline points="20 6 9 17 4 12"/></svg><span>SURE?</span></>
              : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><rect x="3" y="3" width="18" height="18" rx="2"/></svg><span>END</span></>
            }
          </button>
        </div>
      </div>
      <div className="msv-progress">
        <div className="msv-progress-fill" style={{width:`${progressPct}%`}}/>
      </div>
    </div>
  );
}

// ── TRAINING SCREEN ───────────────────────────────────────────────────────────
function TrainingScreen({ user, onNavigate }) {
  const C = useThemeColors();
  const { session, startSession, endSession: endGlobalSession } = useSession();
  const [tState, setTState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [setupMode, setSetupMode] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState("ppl");
  const [showPath, setShowPath] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState(null); // {text, ts, loading}
  const [splitView, setSplitView] = useState(null); // null=cards, string=split detail

  useEffect(() => {
    window.storage.get(TRAINING_KEY).then(r => {
      if (r?.value) {
        try {
          const d = JSON.parse(r.value);
          setTState(d);
          setActiveDay(0);
        } catch {}
      } else {
        setSetupMode(true);
      }
      setLoaded(true);
    }).catch(() => { setSetupMode(true); setLoaded(true); });
  }, []);

  const saveState = async (state) => {
    await window.storage.set(TRAINING_KEY, JSON.stringify(state)).catch(() => {});
    setTState(state);
  };

  const handleSplitSetup = async () => {
    const program = generateProgram({ split: selectedSplit, level: user.level || "intermediate", goal: user.goal || "bulk" });
    const state = { split: selectedSplit, program, history: [], weekVolume: {}, adaptation: { adjustments: {}, signal: "neutral", note: "" }, createdAt: new Date().toISOString() };
    await saveState(state);
    setSetupMode(false);
  };

  const handleSessionComplete = async (result) => {
    endGlobalSession(); setShowPath(false);
    const newHistory = [...(tState.history || []), result];
    // Muscle compensation: detect neglected muscles and boost volume in next program
    const muscleVol = computeMuscleVolume(newHistory, 14);
    const levelMod = {beginner:.7,intermediate:1,advanced:1.2,competitor:1.4}[user.level||"intermediate"]||1;
    const neglected = Object.entries(MUSCLE_BENCHMARKS).filter(([k,b])=>(muscleVol[k]?.sets||0)<b.mev*levelMod).map(([k])=>k);
    const newProgram = neglected.length > 0
      ? generateProgram({split:tState.split,level:user.level||"intermediate",goal:user.goal||"bulk",neglectedMuscles:neglected})
      : tState.program;
    const adaptation = runAdaptation({program:newProgram,history:newHistory,level:user.level||"intermediate"});
    await saveState({...tState,program:newProgram,history:newHistory,adaptation});

    // ── POST-SESSION AI FEEDBACK ──────────────────────────────────────────────
    setSessionFeedback({ text: null, ts: result.ts, loading: true });
    try {
      const exercises = result.completedExercises || [];
      const sessionSummary = exercises.map(ex => {
        const sets = (ex.loggedSets || []).filter(s => s.reps);
        if (!sets.length) return `${ex.name}: (no sets logged)`;
        return `${ex.name}: ${sets.map(s => `${s.weight||0}lbs×${s.reps}`).join(", ")}`;
      }).join("\n");

      const laggingLines = Object.entries(MUSCLE_BENCHMARKS)
        .filter(([k, b]) => (muscleVol[k]?.sets || 0) < b.mev * levelMod)
        .map(([, b]) => `  • ${b.label}: ${Math.round(muscleVol[Object.keys(MUSCLE_BENCHMARKS).find(k => MUSCLE_BENCHMARKS[k] === b)]?.sets || 0)} sets (needs ${Math.round(b.mev * levelMod)} MEV)`);

      const mins = Math.floor((result.duration || 0) / 60);
      const allSets = exercises.flatMap(ex => ex.loggedSets || []).filter(s => s.rpe);
      const avgRpe = allSets.length ? (allSets.reduce((s, x) => s + parseFloat(x.rpe||3), 0) / allSets.length).toFixed(1) : "N/A";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 320,
          system: `You are APEX, an elite fitness AI coach. Deliver concise post-session feedback — direct, specific, and motivating. Max 3 short paragraphs. No fluff. Use real training terminology.`,
          messages: [{
            role: "user",
            content: `Athlete: ${user.name}, ${user.level||"intermediate"} level, goal: ${user.goal||"bulk"}.

Session: ${result.dayKey.toUpperCase()} — ${mins} min, avg SFR ${avgRpe} (Stimulus to Fatigue Ratio, 1–5 scale)
${sessionSummary}

14-day muscle volume — groups below MEV:
${laggingLines.length > 0 ? laggingLines.join("\n") : "  None — volume looks balanced."}

Adaptation signal: ${adaptation.signal} — ${adaptation.note}

Give post-session feedback: what was solid, anything to flag, and one specific focus for the next session.`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || data.content?.[0]?.text || "Strong session. Check your balance chart and keep the momentum.";
      const muscles = (result.completedExercises||[]).map(ex=>ex.muscle||ex.tag?.primary).filter(Boolean);
      const fb = { text, ts: result.ts, dayKey: result.dayKey, muscles, read: false };
      setSessionFeedback({ ...fb, loading: false });
      // Append to archive array — keeps full history, not just latest per day
      try {
        const r = await window.storage.get(FEEDBACK_KEY).catch(() => ({ value: "[]" }));
        const existing = JSON.parse(r?.value || "[]");
        const arr = Array.isArray(existing) ? existing : Object.values(existing).filter(v => v?.text);
        const entry = { ...fb, id: String(result.ts) };
        const updated = [entry, ...arr];
        window.storage.set(FEEDBACK_KEY, JSON.stringify(updated)).catch(() => {});
      } catch {}
    } catch {
      const fb = { text: "Session logged. Open the Coach tab for your full analysis.", ts: result.ts };
      setSessionFeedback({ ...fb, loading: false });
    }
  };

  const handleChangeSplit = () => { setSplitView(null); setSetupMode(false); };

  // Tap a split card — activate the split if needed, then enter detail view
  const handleSplitCardPress = async (splitId) => {
    if (splitId === "custom") {
      startSession("custom", { exercises: [], loggedSets: {} });
      return;
    }
    // Generate/switch program if needed
    if (!tState || tState.split !== splitId) {
      const program = generateProgram({ split: splitId, level: user.level || "intermediate", goal: user.goal || "bulk" });
      await saveState({
        split: splitId, program,
        history: tState?.history || [],
        weekVolume: {},
        adaptation: { adjustments: {}, signal: "neutral", note: "" },
        createdAt: new Date().toISOString(),
      });
    }
    setActiveDay(0);
    setSplitView(splitId);
  };

  if (!loaded) return (
    <div className="loading"><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: C.muted, animation: "pulse 2s infinite" }}>LOADING PROGRAM...</div></div>
  );

  // ── SETUP SCREEN ──
  if (setupMode) return (
    <div className="screen">
      <div className="sh">
        <div>
          <div className="sh-label">Training Setup</div>
          <div className="sh-title">CHOOSE YOUR SPLIT</div>
        </div>
        {tState && (
          <button onClick={() => setSetupMode(false)}
            style={{ background:"var(--card)", border:"2px solid var(--brutal)", borderRadius:6, boxShadow:"2px 2px 0 var(--brutal)", padding:"6px 14px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:1.5, color:"var(--text)", transition:"all .1s" }}
            onMouseOver={e=>{e.currentTarget.style.transform="translate(-1px,-1px)";e.currentTarget.style.boxShadow="3px 3px 0 var(--brutal)"}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="2px 2px 0 var(--brutal)"}}>
            ← BACK
          </button>
        )}
      </div>

      <div style={{ padding: "0 24px 20px" }}>
        <p style={{ fontSize: 14, color: C.faint, lineHeight: 1.6, marginBottom: 20 }}>
          Select the training structure that fits your schedule and recovery capacity. This becomes the foundation of your personalized program.
        </p>

        {Object.values(SPLITS).map(sp => (
          <div key={sp.id} onClick={() => setSelectedSplit(sp.id)}
            style={{ marginBottom: 12, background: selectedSplit === sp.id ? `${C.accent}18` : C.card||C.surface, border: `2px solid ${selectedSplit === sp.id ? C.accent : C.brutal||C.border}`, borderRadius: 10, padding: "16px 18px", cursor: "pointer", transition: "all .15s cubic-bezier(.22,1,.36,1)", position: "relative", boxShadow: selectedSplit === sp.id ? `4px 4px 0 ${C.accent}` : `4px 4px 0 ${C.brutal||C.border}` }}
            onMouseOver={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow=selectedSplit===sp.id?`6px 6px 0 ${C.accent}`:`6px 6px 0 ${C.brutal||C.border}`;}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=selectedSplit===sp.id?`4px 4px 0 ${C.accent}`:`4px 4px 0 ${C.brutal||C.border}`;}}>
            {selectedSplit === sp.id && <div style={{ position: "absolute", top: 10, right: 14, width: 18, height: 18, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#080A0C", fontWeight: 700 }}>✓</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1.5, color: selectedSplit===sp.id?C.accent:C.muted, background: C.up, borderRadius: 6, padding:"3px 8px" }}>{sp.abbr}</span>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1, color: selectedSplit === sp.id ? C.accent : C.text }}>{sp.label}</div>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>{sp.frequency} days/week</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.faint, lineHeight: 1.5, marginBottom: 10 }}>{sp.desc}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {sp.schedule.map(d => (
                <span key={d.key} style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: C.up, border: `1px solid ${C.border}`, color: C.faint, padding: "3px 10px", borderRadius: 6 }}>{d.tag}</span>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 6 }}>Program inputs</div>
          {[
            { label: "Experience", value: user.level || "Intermediate" },
            { label: "Goal", value: user.goal || "Hypertrophy" },
            { label: "Body Weight", value: `${user.weight} lbs` },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{r.label}</span>
              <span style={{ fontSize: 12, color: C.faint, fontFamily: "'DM Mono',monospace", textTransform: "capitalize" }}>{r.value}</span>
            </div>
          ))}
        </div>

        <CubeButton onClick={handleSplitSetup} style={{width:"100%",textAlign:"center"}}>GENERATE MY PROGRAM ▶</CubeButton>
      </div>
    </div>
  );

  // If tState not yet loaded but a session is active, show loading rather than null
  // This prevents the workout UI from vanishing during the async load on iOS refresh
  if (!tState) {
    if (session?.startedAt) {
      return (
        <div className="loading">
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:C.muted, animation:"pulse 2s infinite" }}>
            RESTORING SESSION...
          </div>
        </div>
      );
    }
    return null;
  }

  // ── ACTIVE SESSIONS — read from global context ──
  if (session?.type === "custom") {
    const muscleVol = computeMuscleVolume(tState.history || [], 7);
    return <CustomWorkoutLogger onComplete={handleSessionComplete} onBack={()=>{endGlobalSession();setShowPath(false);}} muscleVol={muscleVol} level={user.level||"intermediate"}/>;
  }
  if (session?.type === "generated" && session.dayKey && tState.program?.[session.dayKey]) {
    return <WorkoutSession dayKey={session.dayKey} dayPlan={tState.program[session.dayKey]} adaptation={tState.adaptation} history={tState.history||[]} onComplete={handleSessionComplete} onBack={()=>{endGlobalSession();setShowPath(false);}}/>;
  }

  // ── SPLIT CARDS HOME VIEW ──────────────────────────────────────────────────
  if (!splitView && !session) {
    const CARD_CONFIG = [
      { id:"ppl",    name:"PUSH · PULL · LEGS", abbr:"PPL",   freq:"6 DAYS / WEEK", color:C.accent,
        desc:"Max frequency. Each muscle hit twice weekly. Built for intermediate to advanced athletes." },
      { id:"ul",     name:"UPPER / LOWER",      abbr:"U/L",   freq:"4 DAYS / WEEK", color:C.blue,
        desc:"High frequency, manageable volume. Ideal for all experience levels and busy schedules." },
      { id:"pplup",  name:"ARNOLD SPLIT",       abbr:"PPL+U", freq:"5 DAYS / WEEK", color:C.green,
        desc:"5-day hybrid with dedicated upper-body day for enhanced arm and shoulder development." },
      { id:"custom", name:"CUSTOM SESSION",     abbr:"FREE",  freq:"ANYTIME",       color:C.purple,
        desc:"Log any exercise, any combination. Perfect for one-off sessions and deload days." },
    ];
    return (
      <div className="screen">
        <div className="sh">
          <div>
            <div className="sh-greeting">Your training</div>
            <div className="sh-title">TRAINING</div>
          </div>
          {tState && (
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowChart(!showChart)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:"6px 10px",borderRadius:10,background:showChart?`${C.purple}18`:C.surface,border:`1px solid ${showChart?C.purple:C.border}`,color:showChart?C.purple:C.muted,cursor:"pointer",transition:"all .2s",minWidth:48}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{fontSize:8,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>Balance</span>
              </button>
            </div>
          )}
        </div>

        {/* Balance chart toggle — accessible from home */}
        {showChart && tState && (() => {
          const mv = computeMuscleVolume(tState.history || [], 7);
          const al = generateMuscleAlerts(mv, user.level || "intermediate", C);
          return (
            <div style={{margin:"0 24px 20px",background:C.card||C.surface,border:`2px solid ${C.brutal||C.border}`,borderRadius:10,overflow:"hidden",boxShadow:`4px 4px 0 ${C.brutal||C.border}`,animation:"slideUp .3s ease"}}>
              <div style={{padding:"14px 18px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.purple}}>● Muscle Balance</div>
                <div style={{fontSize:9,color:C.faint}}>7-day volume</div>
              </div>
              <HimboStatChart muscleVol={mv} level={user.level||"intermediate"}/>
              {al.length > 0 && (
                <div style={{padding:"0 18px 14px"}}>
                  {al.slice(0,3).map(a=>(
                    <div key={a.key} style={{display:"flex",gap:8,padding:"7px 10px",background:`${a.color}0D`,border:`1px solid ${a.color}30`,borderRadius:7,marginBottom:5,alignItems:"flex-start"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:a.severity==="critical"?C.red:C.accent,display:"inline-block",flexShrink:0,marginTop:3}}/>
                      <span style={{fontSize:11,color:C.faint,lineHeight:1.4}}>{a.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* THE 4 SPLIT CARDS */}
        <div style={{padding:"0 24px 32px"}}>
          {CARD_CONFIG.map((card, idx) => {
            const isActive = tState?.split === card.id;
            const splitSchedule = SPLITS[card.id]?.schedule || [];
            return (
              <div key={card.id}
                onClick={() => handleSplitCardPress(card.id)}
                style={{
                  marginBottom: 14,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `2px solid ${isActive ? card.color : "var(--brutal)"}`,
                  boxShadow: isActive
                    ? `var(--depth-shadow), var(--inner-light), 4px 4px 0 ${card.color}`
                    : "var(--depth-shadow), var(--inner-light), 4px 4px 0 var(--brutal)",
                  cursor: "pointer",
                  transition: "transform .15s cubic-bezier(.16,1,.3,1), box-shadow .15s",
                  animation: `screenIn .44s cubic-bezier(.16,1,.3,1) ${idx * 0.07 + 0.04}s both`,
                }}
                onMouseOver={e=>{e.currentTarget.style.transform="translate(-2px,-3px)";}}
                onMouseOut={e=>{e.currentTarget.style.transform="";}}
              >
                <div style={{display:"flex"}}>
                  {/* Left accent stripe */}
                  <div style={{width:5,background:card.color,flexShrink:0}}/>
                  <div style={{flex:1,padding:"18px 20px",background:"var(--card)"}}>
                    {/* Top row: abbr + freq + active badge */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:2,color:card.color,background:`color-mix(in srgb,${card.color} 14%,transparent)`,padding:"3px 9px",borderRadius:5}}>
                          {card.abbr}
                        </span>
                        <span style={{fontSize:10,color:"var(--muted)",letterSpacing:.5}}>{card.freq}</span>
                      </div>
                      {isActive && (
                        <span style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"var(--green)",fontWeight:700,background:"rgba(61,220,132,.12)",padding:"2px 8px",borderRadius:4,border:"1px solid rgba(61,220,132,.3)"}}>ACTIVE</span>
                      )}
                    </div>
                    {/* Name */}
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:1.5,color:"var(--text)",lineHeight:1,marginBottom:8}}>
                      {card.name}
                    </div>
                    {/* Description */}
                    <div style={{fontSize:12,color:"var(--faint)",lineHeight:1.65,marginBottom:splitSchedule.length?12:0}}>
                      {card.desc}
                    </div>
                    {/* Day pills */}
                    {splitSchedule.length > 0 && (
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                        {splitSchedule.map(d => (
                          <span key={d.key} style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",background:"var(--up)",border:"1px solid var(--border)",color:"var(--muted)",padding:"3px 9px",borderRadius:5}}>
                            {d.tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* CTA */}
                    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1.5,color:card.color}}>
                        {card.id === "custom" ? "START SESSION →" : "VIEW PROGRAM →"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SPLIT DETAIL / DASHBOARD VIEW ──────────────────────────────────────────

  const splitDef = SPLITS[tState?.split || "ppl"];
  const schedule = splitDef.schedule;
  const currentDay = schedule[activeDay % schedule.length];
  const dayPlan = tState.program?.[currentDay.key];
  const adaptation = tState.adaptation || {};
  const adj = adaptation.adjustments?.[currentDay.key];
  const muscleVol = computeMuscleVolume(tState.history || [], 7);
  const alerts = generateMuscleAlerts(muscleVol, user.level || "intermediate", C);

  // Stats: last 7 session history
  const recentSessions = (tState.history || []).slice(-7);
  const totalVolume = recentSessions.reduce((sum, s) => {
    return sum + (s.completedExercises || []).reduce((s2, ex) => {
      return s2 + (ex.loggedSets || []).reduce((s3, set) => s3 + (set.reps || 0) * (set.weight || 0), 0);
    }, 0);
  }, 0);

  return (
    <div className="screen">
      {/* HEADER — detail view with back button */}
      <div className="sh">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSplitView(null)}
            style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:0,display:"flex",alignItems:"center",gap:4}}>
            ← Back
          </button>
          <div>
            <div className="sh-greeting">{splitDef.abbr}</div>
            <div className="sh-title">{splitDef.label.split("/")[0].trim().toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label:"Balance", active:showChart, color:C.purple, onClick:()=>setShowChart(!showChart),
              icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label:"Stats", active:showStats, color:C.accent, onClick:()=>setShowStats(!showStats),
              icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:"6px 10px",borderRadius:10,background:btn.active?`${btn.color}18`:C.surface,border:`1px solid ${btn.active?btn.color:C.border}`,color:btn.active?btn.color:C.muted,cursor:"pointer",transition:"all .2s",minWidth:48 }}>
              {btn.icon}
              <span style={{fontSize:8,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* POST-SESSION AI FEEDBACK CARD */}
      {sessionFeedback && (
        <div style={{ margin:"0 24px 20px", background:C.card||C.surface, border:`2px solid ${C.brutal||C.accent}`, borderRadius:10, overflow:"hidden", boxShadow:`4px 4px 0 ${C.brutal||C.accent}`, animation:"slideUp .3s ease" }}>
          <div style={{ padding:"14px 16px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:`${C.accent}18`, border:`1px solid ${C.accent}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13,color:C.accent}}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:C.accent }}>APEX COACH</div>
                <div style={{ fontSize:11, fontWeight:600, color:C.text }}>Post-Session Analysis</div>
              </div>
            </div>
            <button onClick={() => setSessionFeedback(null)}
              style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:"4px 6px", lineHeight:1 }}>✕</button>
          </div>
          <div style={{ padding:"14px 16px" }}>
            {sessionFeedback.loading ? (
              <div style={{ display:"flex", gap:5, alignItems:"center", padding:"6px 0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.accent, opacity:.6, animation:`pulse ${0.9+i*0.15}s infinite` }}/>
                ))}
                <span style={{ fontSize:12, color:C.muted, marginLeft:6 }}>Analyzing your session...</span>
              </div>
            ) : (
              <>
                <div style={{ fontSize:13, color:C.faint, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{sessionFeedback.text}</div>
                {onNavigate && (
                  <button onClick={() => onNavigate("coach")}
                    style={{ marginTop:14, display:"flex", alignItems:"center", gap:6, background:`${C.accent}15`, border:`1px solid ${C.accent}40`, borderRadius:8, padding:"8px 14px", color:C.accent, fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:.5 }}>
                    Continue in Coach
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* HIMBO STAT CHART */}
      {showChart && (
        <div style={{ margin:"0 24px 20px",background:C.card||C.surface,border:`2px solid ${C.brutal||C.border}`,borderRadius:10,overflow:"hidden",boxShadow:`4px 4px 0 ${C.brutal||C.border}`,animation:"slideUp .3s ease" }}>
          <div style={{ padding:"16px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div><div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.purple}}>● Physique Balance</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:1}}>MUSCLE BALANCE CHART</div></div>
            <div style={{fontSize:9,color:C.faint}}>Drag · Pinch to zoom</div>
          </div>
          <HimboStatChart muscleVol={muscleVol} level={user.level||"intermediate"}/>
          <div style={{padding:"10px 18px 12px",display:"flex",gap:14,justifyContent:"center"}}>
            {[{color:C.red,label:"Neglected"},{color:"#FBBF24",label:"Building"},{color:C.green,label:"Optimal"},{color:C.blue,label:"MRV Risk"}].map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:l.color}}/>
                <span style={{fontSize:10,color:C.muted}}>{l.label}</span>
              </div>
            ))}
          </div>
          {alerts.length>0&&(
            <div style={{padding:"0 18px 16px"}}>
              <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Balance Alerts</div>
              {alerts.slice(0,4).map(a=>(
                <div key={a.key} style={{display:"flex",gap:10,padding:"8px 12px",background:`${a.color}0D`,border:`1px solid ${a.color}30`,borderRadius:8,marginBottom:6,alignItems:"flex-start"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:a.severity==="critical"?C.red:a.severity==="overreach"?C.blue:C.accent,display:"inline-block",flexShrink:0,marginTop:3}}/>
                  <span style={{fontSize:12,color:C.faint,lineHeight:1.4}}>{a.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATS PANEL */}
      {showStats && (
        <div style={{ margin: "0 24px 16px", background: C.card||C.surface, border: `2px solid ${C.brutal||C.border}`, borderRadius: 10, padding: 18, boxShadow:`4px 4px 0 ${C.brutal||C.border}`, animation: "slideUp .3s ease" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>● Performance Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Sessions", val: tState.history?.length || 0, unit: "total" },
              { label: "7D Volume", val: totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume, unit: "lbs" },
              { label: "Signal", val: adaptation.signal === "progress" ? "↑" : adaptation.signal === "fatigue" ? "↓" : "→", unit: adaptation.signal || "neutral" },
            ].map(s => (
              <div key={s.label} style={{ background: C.up, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: C.text }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: C.muted }}>{s.unit}</div>
              </div>
            ))}
          </div>
          {adaptation.note && (
            <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.5, padding: "10px 12px", background: C.up, borderRadius: 8 }}>
              <span style={{ color: C.accent }}>Engine: </span>{adaptation.note}
            </div>
          )}
          {/* Full session history */}
          {(tState.history || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Workout History</div>
              {[...(tState.history || [])].reverse().map((sess, i) => {
                const setsLogged = (sess.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets?.filter(x => x.reps && x.weight)?.length || 0), 0);
                const volLoad    = (sess.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets || []).reduce((s2, set) => s2 + (set.reps||0)*(set.weight||0), 0), 0);
                const mins       = Math.floor((sess.duration || 0) / 60);
                const isOpen     = expandedSession === i;
                const dayLabel   = sess.isCustom ? "Custom" : (sess.dayKey || "Session").replace(/_/g," ").toUpperCase();
                return (
                  <div key={sess.ts} style={{ marginBottom: 8 }}>
                    {/* Session row — tap to expand */}
                    <div onClick={() => setExpandedSession(isOpen ? null : i)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background: isOpen ? `${C.accent}12` : C.up, border:`2px solid ${isOpen ? C.accent : C.brutal||C.border}`, borderRadius: isOpen ? "8px 8px 0 0" : 8, cursor:"pointer", boxShadow: isOpen ? `3px 3px 0 ${C.accent}` : `3px 3px 0 ${C.brutal||C.border}`, transition:"all .15s" }}>
                      <div>
                        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:1, color: isOpen ? C.accent : C.text }}>{dayLabel}</div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>
                          {new Date(sess.ts).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                          {mins > 0 && ` · ${mins} min`}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.accent }}>{volLoad > 0 ? `${(volLoad/1000).toFixed(1)}k lbs` : `${setsLogged} sets`}</div>
                          <div style={{ fontSize:9, color:C.muted }}>{setsLogged} sets logged</div>
                        </div>
                        <div style={{ fontSize:14, color: isOpen ? C.accent : C.muted, transition:"transform .2s", transform: isOpen ? "rotate(180deg)" : "none" }}>⌄</div>
                      </div>
                    </div>
                    {/* Expanded exercise + set detail */}
                    {isOpen && (
                      <div style={{ background:C.surface, border:`2px solid ${C.accent}`, borderTop:"none", borderRadius:"0 0 8px 8px", padding:"12px 14px", animation:"slideUp .2s ease" }}>
                        {(sess.completedExercises || []).filter(ex => (ex.loggedSets||[]).some(s=>s.reps&&s.weight)).map((ex, ei) => {
                          const workSets = (ex.loggedSets||[]).filter(s=>s.reps&&s.weight);
                          const topSet   = workSets.reduce((best, s) => parseFloat(s.weight)>parseFloat(best.weight||0)?s:best, {});
                          return (
                            <div key={ei} style={{ marginBottom: ei < sess.completedExercises.length-1 ? 14 : 0 }}>
                              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
                                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{ex.name}</div>
                                <div style={{ fontSize:10, color:C.accent, fontFamily:"'DM Mono',monospace" }}>
                                  {topSet.weight && `Top: ${topSet.weight} × ${topSet.reps}`}
                                </div>
                              </div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                {workSets.map((set, si) => (
                                  <div key={si} style={{ fontSize:10, fontFamily:"'DM Mono',monospace", background:`${C.accent}12`, border:`1px solid ${C.accent}30`, borderRadius:4, padding:"3px 8px", color:C.faint }}>
                                    {set.weight}×{set.reps}{set.rpe ? ` @${set.rpe}` : ""}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {(sess.completedExercises||[]).every(ex=>(ex.loggedSets||[]).every(s=>!s.reps||!s.weight)) && (
                          <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No sets were logged with weight and reps.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADAPTATION SIGNAL BANNER */}
      {adaptation.signal && adaptation.signal !== "neutral" && (
        <div style={{ margin: "0 24px 16px", padding: "12px 16px", borderRadius: 12, background: adaptation.signal === "fatigue" ? "rgba(232,69,69,0.07)" : adaptation.signal === "progress" ? "rgba(61,220,132,0.07)" : "rgba(245,166,35,0.07)", border: `1px solid ${adaptation.signal === "fatigue" ? C.red : adaptation.signal === "progress" ? C.green : C.accent}30`, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: adaptation.signal === "fatigue" ? C.red : adaptation.signal === "progress" ? C.green : C.accent, lineHeight: 1 }}>{adaptation.signal === "fatigue" ? "↓" : adaptation.signal === "progress" ? "↑" : "→"}</span>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: adaptation.signal === "fatigue" ? C.red : adaptation.signal === "progress" ? C.green : C.accent, marginBottom: 2 }}>
              {adaptation.signal === "fatigue" ? "Volume Reduction Triggered" : adaptation.signal === "progress" ? "Progression Detected" : "Volume Plateau"}
            </div>
            <div style={{ fontSize: 12, color: C.faint }}>{adaptation.note}</div>
          </div>
        </div>
      )}

      {/* DAY SELECTOR */}
      <div className="wscroll">
        {schedule.map((d, i) => {
          const sessionsForDay = (tState.history || []).filter(h => h.dayKey === d.key);
          const dayAdj = adaptation.adjustments?.[d.key];
          return (
            <div key={d.key} className={`dchip ${activeDay === i ? "on" : ""}`}
              onClick={() => { setActiveDay(i); setShowPath(false); }}
              style={{ minWidth: 64, position: "relative" }}>
              <div style={{ fontSize:9,color:activeDay===i?"#080A0C":C.muted,letterSpacing:1,textAlign:"center",marginBottom:2,textTransform:"uppercase" }}>{d.tag.split(" ")[0]}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:1,color:activeDay===i?"#080A0C":C.text,textAlign:"center" }}>{d.tag.split(" ")[1]||""}</div>
              {sessionsForDay.length>0&&<div style={{position:"absolute",top:3,right:5,width:6,height:6,borderRadius:"50%",background:activeDay===i?"#080A0C":C.green}}/>}
              {dayAdj?.signal==="progress"&&<div style={{position:"absolute",bottom:2,right:4,width:4,height:4,borderRadius:"50%",background:C.green}}/>}
              {dayAdj?.signal==="fatigue"&&<div style={{position:"absolute",bottom:2,right:4,width:4,height:4,borderRadius:"50%",background:C.red}}/>}
            </div>
          );
        })}
        {/* Back to split cards */}
        <div className="dchip" onClick={()=>{setShowPath(false);setSplitView(null);}} style={{minWidth:64,background:C.up,borderColor:C.border}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:1,textAlign:"center",marginBottom:2}}>ALL</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:1,color:C.muted,textAlign:"center"}}>↩</div>
        </div>
      </div>

      {/* FIRST-SESSION ORIENTATION */}
      {(tState.history || []).length === 0 && (
        <div style={{ margin: "0 24px 16px", padding: "12px 16px", borderRadius: 12, background: `${C.accent}0C`, border: `1px solid ${C.accent}28` }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, marginBottom: 4 }}>Getting Started</div>
          <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.6 }}>Select a day below and tap <strong style={{color:C.text}}>Start Session</strong> to begin logging. After 2 sessions APEX will start adapting your program automatically.</div>
        </div>
      )}

      {/* CURRENT DAY PLAN */}
      {dayPlan && (
        <>
          <div style={{ padding: "0 24px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.accent }}>{splitDef.label} · Day {activeDay + 1}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 1 }}>{currentDay.tag.toUpperCase()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: C.accent }}>{dayPlan.exercises.length}</div>
                <div style={{ fontSize: 10, color: C.muted }}>exercises</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
              {currentDay.muscles.map((m, i) => (
                <span key={m} className={`mbadge ${i === 0 ? "pri" : ""}`}>{MUSCLE_BENCHMARKS[m]?.label || m}</span>
              ))}
            </div>

            {/* Previous session result for this day */}
            {(() => {
              const prev = (tState.history || []).filter(h => h.dayKey === currentDay.key).slice(-1)[0];
              if (!prev) return null;
              const prevVol = (prev.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets || []).reduce((s2, set) => s2 + (set.reps || 0) * (set.weight || 0), 0), 0);
              const prevSets = (prev.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets?.length || 0), 0);
              return (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 2 }}>Last {currentDay.tag}</div>
                    <div style={{ fontSize: 12, color: C.faint }}>{new Date(prev.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: C.text }}>{prevSets}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>sets</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: C.accent }}>{prevVol > 0 ? `${(prevVol / 1000).toFixed(1)}k` : "—"}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>lbs vol</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* EXERCISE PREVIEW CARDS */}
          {dayPlan.exercises.map((ex, i) => {
            const adjSets = adj?.setDelta ? Math.max(1, ex.sets + adj.setDelta) : ex.sets;
            const isAdj = adj?.setDelta && adj.setDelta !== 0;
            return (
              <div key={ex.id} className="ecard">
                <div className="ec-head">
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                      {String(i + 1).padStart(2, "0")} · {ex.category}
                      {isAdj && (
                        <span style={{ fontSize: 9, color: adj.setDelta > 0 ? C.green : C.red, background: adj.setDelta > 0 ? `${C.green}15` : `${C.red}15`, padding: "1px 6px", borderRadius: 4 }}>
                          {adj.setDelta > 0 ? "▲" : "▼"} adapted
                        </span>
                      )}
                    </div>
                    <div className="ec-name">{ex.name}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: C.faint }}>{ex.repRange} reps</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: C.faint }}>RPE {ex.rpe}</span>
                    </div>
                    {ex.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{ex.notes}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="ec-num" style={{ color: isAdj ? (adj.setDelta > 0 ? C.green : C.red) : C.accent }}>{adjSets}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>sets</div>
                    {isAdj && ex.sets !== adjSets && (
                      <div style={{ fontSize: 9, color: C.muted, textDecoration: "line-through" }}>{ex.sets}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* START SESSION — DUAL PATH */}
          {showPath ? (
            <div style={{padding:"0 24px",animation:"slideUp .25s ease"}}>
              <PathSelector
                dayTag={currentDay.tag}
                onSelectGenerated={()=>{
                  const dp = tState.program[currentDay.key];
                  const adj = tState.adaptation?.adjustments?.[currentDay.key];
                  const initSets = {};
                  dp.exercises.forEach(ex => {
                    const cnt = adj?.setDelta ? Math.max(1, ex.sets + adj.setDelta) : ex.sets;
                    initSets[ex.id] = Array.from({length:cnt}, () => ({weight:"",reps:"",rpe:""}));
                  });
                  startSession("generated", {dayKey:currentDay.key, dayPlan:dp, adaptation:tState.adaptation, loggedSets:initSets});
                  setShowPath(false);
                }}
                onSelectCustom={()=>{startSession("custom",{exercises:[],loggedSets:{}});setShowPath(false);}}
              />
            </div>
          ) : (
            <div style={{margin:"8px 24px 0",display:"grid",gridTemplateColumns:"1fr auto",gap:10}}>
              <CubeButton onClick={()=>setShowPath(true)}>START {currentDay.tag.toUpperCase()} ▶</CubeButton>
              <button onClick={()=>startSession("custom",{exercises:[],loggedSets:{}})}
                style={{padding:"0 16px",background:`${C.blue}15`,border:`1px solid ${C.blue}50`,borderRadius:12,color:C.blue,fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}}>
                + CUSTOM
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NUTRITION INTELLIGENCE SYSTEM ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── DEFAULT MACRO TARGETS (overridden by rebound protocol if set) ─────────────
const DEFAULT_TARGETS = { cal: 2800, p: 200, c: 300, f: 75 };

// ── GET TARGETS: pulls from rebound protocol first, then falls back ───────────
async function getTargets(user, weightLog = [], checkIn = null) {
  // Contest-prep rebound protocol overrides everything
  try {
    const r = await window.storage.get("apex_rebound_v3");
    if (r?.value) {
      const d = JSON.parse(r.value);
      const proto = d.protocol;
      if (proto?.phases?.[0]) {
        const ph = proto.phases[0];
        return { cal: ph.cals, p: ph.p, c: ph.c, f: ph.f, source: "rebound" };
      }
    }
  } catch {}

  // Load persisted calorie adjustment from decision engine
  let calAdjustment = 0;
  try {
    const pr = await window.storage.get(PROTOCOL_KEY);
    if (pr?.value) {
      const pd = JSON.parse(pr.value);
      calAdjustment = pd.calAdjustment || 0;
    }
  } catch {}

  // Apex Algorithm Engine — full TDEE + macro calculation
  if (user?.weight && user?.height && user?.age) {
    const userState  = computeUserState(user, weightLog, checkIn);
    // Compute both day types in one pass — callers can use whichever is relevant
    const trainTargets = computeNutritionTargets(user, userState, true,  calAdjustment);
    const restTargets  = computeNutritionTargets(user, userState, false, calAdjustment);
    // Determine today's likely day type by checking if a session was logged today
    const todayKey = new Date().toDateString();
    const trainedToday = (weightLog.__trainDates || []).includes(todayKey); // hint injected by caller if available
    const isTrainDay   = trainedToday;
    const active       = isTrainDay ? trainTargets : restTargets;
    return {
      ...active,
      trainCal:     trainTargets.cal,
      trainP:       trainTargets.p,
      trainC:       trainTargets.c,
      trainF:       trainTargets.f,
      restCal:      restTargets.cal,
      restP:        restTargets.p,
      restC:        restTargets.c,
      restF:        restTargets.f,
      weeklyAvg:    trainTargets.weeklyAvg,
      tdee:         trainTargets.tdee,
      pal:          trainTargets.pal,
      sessPerWeek:  trainTargets.sessPerWeek,
      cyclingActive:trainTargets.cyclingActive,
      isTrainDay,
      source:       trainTargets.source,
    };
  }

  // Last-resort fallback (onboarding incomplete)
  const w = parseFloat(user?.weight) || 180;
  const isCut = (user?.goal || "") === "cut" || (user?.goal || "") === "contest";
  const fbCal = Math.round(w * (isCut ? 13 : 16));
  return {
    cal: fbCal, p: Math.round(w * 1.0),
    c: Math.round(w * (isCut ? 0.9 : 1.5)), f: Math.round(w * 0.4),
    trainCal: fbCal, restCal: Math.round(fbCal * 0.88), weeklyAvg: fbCal,
    isTrainDay: false, source: "fallback",
  };
}

// ── LOCAL FOOD DATABASE (macros per 100g unless noted) ───────────────────────
const FOOD_DB_LOCAL = {
  // Proteins
  "chicken breast":{p:31,c:0,f:3.6,cal:165}, "chicken thigh":{p:26,c:0,f:10,cal:209},
  "ground beef 90":{p:26,c:0,f:10,cal:196},  "ground beef":{p:22,c:0,f:17,cal:243},
  "ground turkey":{p:27,c:0,f:7,cal:170},    "turkey breast":{p:29,c:0,f:1,cal:135},
  "salmon":{p:25,c:0,f:13,cal:208},           "tilapia":{p:26,c:0,f:2.7,cal:128},
  "tuna":{p:30,c:0,f:1,cal:128},              "shrimp":{p:24,c:0,f:0.3,cal:99},
  "steak":{p:27,c:0,f:15,cal:250},            "beef":{p:26,c:0,f:15,cal:250},
  "pork loin":{p:26,c:0,f:5,cal:155},        "eggs":{p:13,c:1.1,f:11,cal:155},
  "egg whites":{p:11,c:0.7,f:0.2,cal:52},    "egg":{p:6,c:0.6,f:5,cal:78}, // per piece ~50g
  "greek yogurt":{p:10,c:3.6,f:0.4,cal:59},  "cottage cheese":{p:11,c:3.4,f:4.3,cal:98},
  "whey protein":{p:75,c:6,f:5,cal:375},     "casein protein":{p:76,c:5,f:2,cal:360},
  "protein powder":{p:75,c:6,f:5,cal:375},   "protein bar":{p:20,c:22,f:8,cal:235},
  "tofu":{p:8,c:2,f:4.8,cal:76},             "tempeh":{p:19,c:8,f:11,cal:193},
  // Carbs
  "white rice":{p:2.7,c:28,f:0.3,cal:130},   "brown rice":{p:2.6,c:23,f:0.9,cal:112},
  "rice":{p:2.7,c:28,f:0.3,cal:130},         "oats":{p:17,c:66,f:7,cal:389},
  "oatmeal":{p:17,c:66,f:7,cal:389},         "sweet potato":{p:1.6,c:20,f:0.1,cal:86},
  "potato":{p:2,c:17,f:0.1,cal:77},          "pasta":{p:5.8,c:31,f:0.9,cal:157},
  "bread":{p:9,c:49,f:3.2,cal:265},          "whole wheat bread":{p:12,c:41,f:3.4,cal:247},
  "banana":{p:1.1,c:23,f:0.3,cal:89},        "apple":{p:0.3,c:14,f:0.2,cal:52},
  "orange":{p:0.9,c:12,f:0.1,cal:47},        "strawberries":{p:0.7,c:8,f:0.3,cal:32},
  "blueberries":{p:0.7,c:14,f:0.3,cal:57},   "grapes":{p:0.7,c:18,f:0.2,cal:69},
  "cereal":{p:6,c:80,f:2,cal:370},           "granola":{p:9,c:65,f:15,cal:450},
  // Fats
  "olive oil":{p:0,c:0,f:100,cal:884},       "avocado":{p:2,c:9,f:15,cal:160},
  "almonds":{p:21,c:22,f:49,cal:579},        "walnuts":{p:15,c:14,f:65,cal:654},
  "peanut butter":{p:25,c:20,f:50,cal:588},  "almond butter":{p:21,c:19,f:56,cal:614},
  "cheese":{p:25,c:1.3,f:33,cal:403},        "butter":{p:0.9,c:0.1,f:81,cal:717},
  "mixed nuts":{p:20,c:20,f:53,cal:607},
  // Common combos
  "protein shake":{p:25,c:5,f:2,cal:138},    "meal replacement":{p:30,c:20,f:5,cal:245},
};

// Unit → grams conversion
function toGrams(qty, unit) {
  const u = (unit||"g").toLowerCase().replace(/s$/, ""); // strip trailing s
  const map = {g:1,gram:1,kg:1000,oz:28.35,lb:453.6,ml:1,cup:240,tbsp:15,tsp:5,
               piece:1,serving:100,scoop:32,handful:30,slice:30};
  return qty * (map[u] || 100);
}

// Fuzzy food lookup — tries progressively looser matches
function lookupFood(name) {
  const n = name.toLowerCase().trim();
  if (FOOD_DB_LOCAL[n]) return FOOD_DB_LOCAL[n];
  // Partial: DB key contained in input
  const fwd = Object.entries(FOOD_DB_LOCAL).find(([k]) => n.includes(k));
  if (fwd) return fwd[1];
  // Partial: input contained in DB key
  const rev = Object.entries(FOOD_DB_LOCAL).find(([k]) => k.includes(n));
  if (rev) return rev[1];
  // First-word match
  const firstWord = n.split(/\s/)[0];
  const fw = Object.entries(FOOD_DB_LOCAL).find(([k]) => k.startsWith(firstWord));
  if (fw) return fw[1];
  // Generic fallback — balanced macro estimate
  return {p:15,c:15,f:8,cal:192};
}

// Local parser — handles "200g chicken breast, 150g rice, 2 eggs"
function parseLocalFallback(rawInput) {
  const entries = rawInput.split(/,|\band\b|\+/i).map(s => s.trim()).filter(Boolean);
  const items = entries.map(entry => {
    // Patterns: "200g chicken breast" | "chicken breast 200g" | "2 eggs" | "chicken breast"
    const fwdMatch = entry.match(/^([\d.]+)\s*(g|kg|oz|lb|ml|cup|tbsp|tsp|piece|scoop|slice|serving|handful)s?\s+(.+)$/i);
    const revMatch = entry.match(/^(.+?)\s+([\d.]+)\s*(g|kg|oz|lb|ml|cup|tbsp|tsp|piece|scoop|slice|serving)s?$/i);
    const numMatch = entry.match(/^([\d.]+)\s+(.+)$/); // "2 eggs"

    let qty = 100, unit = "g", foodName = entry;
    if (fwdMatch) { qty = parseFloat(fwdMatch[1]); unit = fwdMatch[2]; foodName = fwdMatch[3]; }
    else if (revMatch) { foodName = revMatch[1]; qty = parseFloat(revMatch[2]); unit = revMatch[3]; }
    else if (numMatch) { qty = parseFloat(numMatch[1]); unit = "piece"; foodName = numMatch[2]; }

    const qty_g = Math.round(toGrams(qty, unit));
    const macros = lookupFood(foodName);
    const f = qty_g / 100;
    return {
      food: foodName, qty, unit: unit.toLowerCase(), qty_g,
      protein_g: Math.round(macros.p * f),
      carbs_g:   Math.round(macros.c * f),
      fat_g:     Math.round(macros.f * f),
      calories:  Math.round(macros.cal * f),
    };
  });

  const totals = items.reduce((acc, x) => ({
    protein_g: acc.protein_g + x.protein_g,
    carbs_g:   acc.carbs_g   + x.carbs_g,
    fat_g:     acc.fat_g     + x.fat_g,
    calories:  acc.calories  + x.calories,
  }), {protein_g:0, carbs_g:0, fat_g:0, calories:0});

  return { items, totals, confidence:"medium",
    notes:"Estimated from local database — values are approximate. Add an API key for AI-powered precision." };
}

// ── PHOTO RESIZE — compress before sending to API ────────────────────────────
function resizeImageBase64(file, maxDim = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── PHOTO MACRO ANALYZER — Claude Sonnet vision ───────────────────────────────
const PHOTO_PROMPT = (mealName) =>
`You are a precise sports nutrition analyst. Analyze this food photo and estimate macros for every visible food item.

Meal context: "${mealName}"

Return ONLY valid JSON — no prose, no markdown fences:
{"items":[{"food":"name","qty":number,"unit":"g|oz|piece|cup|tbsp","qty_g":number,"protein_g":number,"carbs_g":number,"fat_g":number,"calories":number}],"totals":{"protein_g":number,"carbs_g":number,"fat_g":number,"calories":number},"confidence":"high|medium|low","notes":"brief portion assumptions or empty string"}

Rules:
- Identify each distinct food item visible in the photo
- Estimate portions from visual cues: plate/bowl diameter, relative sizes, typical restaurant/home portions
- Use USDA nutritional values; round all numbers to integers
- confidence: high = food + portions both clear, medium = food clear but portions estimated, low = unclear items
- If multiple foods are mixed (e.g. stir fry), break them into individual components as best you can`;

async function analyzePhotoWithAI(imageBase64, mealName) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: PHOTO_PROMPT(mealName) },
          ],
        }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const jsonStr = text.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/)?.[0] || "";
    const result = JSON.parse(jsonStr);
    if (!Array.isArray(result.items)) result.items = [];
    if (!result.totals || typeof result.totals !== "object")
      result.totals = { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };
    return result;
  } catch {
    return null;
  }
}

// ── AI MACRO PARSER — Claude API with local fallback ─────────────────────────
const AI_PROMPT = (rawInput, mealName) =>
`You are a precise sports nutrition database. Parse the food log and return ONLY valid JSON.

Food log: "${rawInput}"
Meal context: "${mealName}"

Return this exact structure:
{"items":[{"food":"name","qty":number,"unit":"g|oz|ml|cup|tbsp|tsp|piece|serving","qty_g":number,"protein_g":number,"carbs_g":number,"fat_g":number,"calories":number}],"totals":{"protein_g":number,"carbs_g":number,"fat_g":number,"calories":number},"confidence":"high|medium|low","notes":"assumptions or empty string"}

Rules: convert all quantities to grams in qty_g; USDA values; round to integers; assume standard serving if qty missing.`;

async function parseMacrosWithAI(rawInput, mealName) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: AI_PROMPT(rawInput, mealName) }],
      }),
    });

    if (!res.ok) return parseLocalFallback(rawInput); // non-2xx → local fallback

    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    // Extract JSON object if model wraps it in prose
    const jsonStr = clean.match(/\{[\s\S]*\}/)?.[0] || clean;
    const result = JSON.parse(jsonStr);
    // Sanitize — guard against AI returning null/object for items or totals
    if (!Array.isArray(result.items)) result.items = [];
    if (!result.totals || typeof result.totals !== "object") {
      result.totals = { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };
    }
    return result;
  } catch {
    return parseLocalFallback(rawInput); // network error or parse failure → local
  }
}

// ── FEEDBACK ENGINE ───────────────────────────────────────────────────────────
function generateNutritionFeedback(todayTotals, targets, newLog) {
  const { p: tP, c: tC, f: tF, cal: tCal } = targets;
  const { protein_g: p, carbs_g: c, fat_g: f, calories: cal } = todayTotals;
  const remaining = { p: tP - p, c: tC - c, f: tF - f, cal: tCal - cal };
  const msgs = [];

  if (remaining.cal < -300) msgs.push({ type: "warn", text: `Calories trending ${Math.abs(Math.round(remaining.cal))} above target. Consider a lighter dinner.` });
  else if (remaining.cal > 800 && cal > 0) msgs.push({ type: "info", text: `${Math.round(remaining.cal)} kcal remaining for the day. Stay on track.` });

  if (remaining.p > 60) msgs.push({ type: "alert", text: `Protein ${Math.round(remaining.p)}g below target. Add a lean protein source.` });
  else if (remaining.p < -30) msgs.push({ type: "warn", text: `Protein ${Math.abs(Math.round(remaining.p))}g above target — excess won't build extra muscle.` });

  if (remaining.c < -50) msgs.push({ type: "warn", text: `Carbs ${Math.abs(Math.round(remaining.c))}g over target. Watch starchy foods for the rest of the day.` });
  else if (remaining.c > 100 && remaining.cal > 400) msgs.push({ type: "green", text: `${Math.round(remaining.c)}g carbs remaining — ideal for pre/post workout fueling.` });

  if (remaining.f < -20) msgs.push({ type: "warn", text: `Fats ${Math.abs(Math.round(remaining.f))}g over target. Keep fat in check for remaining meals.` });

  if (msgs.length === 0 && cal > 0) msgs.push({ type: "green", text: "Macros on track. Keep logging throughout the day." });
  return msgs;
}

// ── MEAL LOG MODAL ────────────────────────────────────────────────────────────
// Confidence color map — used by MealLogModal and NutritionScreen
const getConfidenceColor = (C) => ({ high: C.green, medium: C.accent, low: C.red });

function MealLogModal({ onSave, onClose, existingLog }) {
  const C = useThemeColors();
  const [mealName, setMealName] = useState(existingLog?.mealName || "");
  const [rawInput, setRawInput] = useState(existingLog?.rawInput || "");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(existingLog ? {
    items:      existingLog.items      || [],
    totals:     existingLog.totals     || { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 },
    confidence: existingLog.confidence || "medium",
    notes:      existingLog.notes      || "",
  } : null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(existingLog ? "review" : "input"); // input | parsing | review
  const [inputMode, setInputMode] = useState("free"); // free | quick | photo
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
    try {
      const b64 = await resizeImageBase64(file, 1280, 0.85);
      setPhotoBase64(b64);
    } catch {
      setError("Could not read image — try a different photo.");
      setPhotoPreview(null);
    }
  };

  const handlePhotoAnalyze = async () => {
    if (!photoBase64) return;
    if (!mealName.trim()) setMealName("Meal");
    setError("");
    setStep("parsing");
    setParsing(true);
    const result = await analyzePhotoWithAI(photoBase64, mealName || "Meal");
    setParsing(false);
    if (!result) {
      setStep("input");
      setError("Photo analysis failed. Try again or describe your meal with text.");
      return;
    }
    setParsed(result);
    setStep("review");
  };

  const QUICK_REFS = [
    { label: "Palm protein", food: "chicken breast", qty: "150", unit: "g" },
    { label: "Fist carbs", food: "white rice cooked", qty: "150", unit: "g" },
    { label: "Thumb fat", food: "olive oil", qty: "14", unit: "g" },
    { label: "Cup oats", food: "rolled oats dry", qty: "80", unit: "g" },
    { label: "Scoop whey", food: "whey protein powder", qty: "32", unit: "g" },
    { label: "Medium banana", food: "banana", qty: "118", unit: "g" },
    { label: "2 whole eggs", food: "whole eggs", qty: "100", unit: "g" },
    { label: "Cup cottage cheese", food: "cottage cheese", qty: "226", unit: "g" },
  ];

  const addQuickRef = (ref) => {
    const addition = `${ref.food} ${ref.qty}${ref.unit}`;
    setRawInput(prev => prev ? prev + ", " + addition : addition);
  };

  const handleParse = async () => {
    if (!rawInput.trim()) return setError("Enter what you ate first.");
    if (!mealName.trim()) setMealName("Meal");
    setError("");
    setStep("parsing");
    setParsing(true);
    // parseMacrosWithAI never throws — it falls back to local parser on any error
    const result = await parseMacrosWithAI(rawInput, mealName || "Meal");
    setParsed(result);
    setStep("review");
    setParsing(false);
  };

  const handleSave = () => {
    if (!parsed) return;
    onSave({
      id: existingLog?.id || `meal_${Date.now()}`,
      ts: existingLog?.ts || Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      mealName: mealName || "Meal",
      rawInput,
      items: parsed.items,
      totals: parsed.totals,
      confidence: parsed.confidence,
      notes: parsed.notes,
    });
  };

  const confidenceColor = getConfidenceColor(C);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflowY: "auto", padding: "0 0 40px" }}>

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* Header */}
        <div style={{ padding: "16px 24px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.green }}>● Log Meal</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1 }}>
              {step === "parsing" ? "ANALYZING..." : step === "review" ? "REVIEW & SAVE" : "WHAT DID YOU EAT?"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* INPUT STEP */}
        {step === "input" && (
          <div style={{ padding: "20px 24px" }}>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[{ id: "free", label: "Text" }, { id: "quick", label: "Quick" }, { id: "photo", label: "📷 Photo" }].map(m => (
                <button key={m.id} onClick={() => { setInputMode(m.id); setError(""); }}
                  style={{ flex: 1, padding: "10px 6px", background: inputMode === m.id ? (m.id === "photo" ? `${C.accent}18` : `${C.green}15`) : C.up, border: `1px solid ${inputMode === m.id ? (m.id === "photo" ? C.accent : C.green) : C.border}`, borderRadius: 10, color: inputMode === m.id ? (m.id === "photo" ? C.accent : C.green) : C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Meal name */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Meal Type</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Breakfast", "Lunch", "Dinner", "Snack"].map(opt => (
                  <button key={opt} onClick={() => setMealName(mealName === opt ? "" : opt)}
                    style={{ padding: "12px 8px", background: mealName === opt ? "var(--brutal)" : "var(--card)", border: `2px solid var(--brutal)`, borderRadius: 6, boxShadow: mealName === opt ? "none" : `3px 3px 0 var(--brutal)`, cursor: "pointer", fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 1.5, color: mealName === opt ? "var(--card)" : "var(--brutal)", transition: "all .12s", transform: mealName === opt ? "translate(2px,2px)" : "" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick refs */}
            {inputMode === "quick" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Common Portions — tap to add</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {QUICK_REFS.map(ref => (
                    <button key={ref.label} onClick={() => addQuickRef(ref)}
                      style={{ padding: "10px 12px", background: C.up, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "border-color .2s" }}
                      onMouseOver={e => e.currentTarget.style.borderColor = C.green}
                      onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ref.label}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{ref.food} · {ref.qty}{ref.unit}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo mode */}
            {inputMode === "photo" && (
              <div style={{ marginBottom: 16 }}>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoSelect}
                />
                {!photoPreview ? (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={{ width: "100%", background: C.up, border: `2px dashed ${C.border}`, borderRadius: 14, padding: "44px 20px", textAlign: "center", cursor: "pointer", transition: "border-color .2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = C.accent}
                    onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ fontSize: 44, marginBottom: 10, lineHeight: 1 }}>📷</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>Take or upload a photo</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Works with any food — plate, meal prep, restaurant, snack</div>
                  </button>
                ) : (
                  <div>
                    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
                      <img src={photoPreview} alt="Food" style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}/>
                      <button
                        onClick={() => { setPhotoPreview(null); setPhotoBase64(null); }}
                        style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✕
                      </button>
                    </div>
                    {!photoBase64 && (
                      <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 8 }}>Processing image…</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Food input — text modes only */}
            {inputMode !== "photo" && (
              <>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
                    {inputMode === "free" ? "What did you eat? (be as specific as possible)" : "Your meal (edit as needed)"}
                  </div>
                  <textarea value={rawInput} onChange={e => setRawInput(e.target.value)}
                    placeholder={"Examples:\n• 8oz chicken breast, 1.5 cups white rice, 1 tbsp olive oil\n• Chipotle bowl with chicken, rice, black beans, cheese, salsa\n• 2 scoops whey, 1 banana, handful of oats\n• About 6 oz salmon, sweet potato medium"}
                    style={{ width: "100%", background: C.up, border: `1px solid ${rawInput ? C.green : C.border}`, borderRadius: 10, padding: "14px", color: C.text, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "none", height: 130, lineHeight: 1.5, transition: "border-color .2s" }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
                  Include amounts: "8oz", "200g", "1 cup", "2 tablespoons", "1 medium", "handful"
                </div>
              </>
            )}

            {error && <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}30`, borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>{error}</div>}

            {inputMode === "photo" ? (
              <button onClick={handlePhotoAnalyze} disabled={!photoBase64}
                style={{ width: "100%", padding: 15, background: photoBase64 ? C.accent : C.border, color: photoBase64 ? "#080A0C" : C.muted, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: photoBase64 ? "pointer" : "not-allowed", transition: "all .2s" }}>
                {photoBase64 ? "SCAN PHOTO WITH AI ▶" : "SELECT A PHOTO FIRST"}
              </button>
            ) : (
              <button onClick={handleParse} disabled={!rawInput.trim()}
                style={{ width: "100%", padding: 15, background: rawInput.trim() ? C.green : C.border, color: "#080A0C", border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: rawInput.trim() ? "pointer" : "not-allowed", transition: "all .2s" }}>
                ANALYZE WITH AI ▶
              </button>
            )}
          </div>
        )}

        {/* PARSING STEP */}
        {step === "parsing" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse 1.5s infinite" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: C.green, marginBottom: 8 }}>PARSING YOUR MEAL</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>AI is reading your food log and calculating macros...</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: `typingBounce 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}

        {/* REVIEW STEP */}
        {step === "review" && parsed && (
          <div style={{ padding: "20px 24px" }}>
            {/* Confidence badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: `${confidenceColor[parsed.confidence] || C.accent}10`, border: `1px solid ${confidenceColor[parsed.confidence] || C.accent}30`, borderRadius: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: confidenceColor[parsed.confidence] || C.accent, display: "inline-block", flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: confidenceColor[parsed.confidence] || C.accent }}>AI Confidence: {parsed.confidence}</div>
                {parsed.notes && <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{parsed.notes}</div>}
              </div>
            </div>

            {/* Macro totals */}
            <div style={{ background: C.up, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Meal Totals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
                {[
                  { label: "KCAL", val: Math.round(parsed.totals.calories), color: C.text },
                  { label: "PROTEIN", val: `${Math.round(parsed.totals.protein_g)}g`, color: C.accent },
                  { label: "CARBS", val: `${Math.round(parsed.totals.carbs_g)}g`, color: C.green },
                  { label: "FAT", val: `${Math.round(parsed.totals.fat_g)}g`, color: C.blue },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: m.color, lineHeight: 1 }}>{m.val}</div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1, marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item breakdown */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Item Breakdown</div>
              {parsed.items.map((item, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.food}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.qty} {item.unit} · {item.qty_g}g</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.text }}>{Math.round(item.calories)} kcal</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                      <span style={{ color: C.accent }}>P:{Math.round(item.protein_g)}</span>
                      {" · "}
                      <span style={{ color: C.green }}>C:{Math.round(item.carbs_g)}</span>
                      {" · "}
                      <span style={{ color: C.blue }}>F:{Math.round(item.fat_g)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit raw input */}
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setStep("input")} style={{ width: "100%", padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 12, cursor: "pointer" }}>
                ← Edit Meal Input
              </button>
            </div>

            <button onClick={handleSave}
              style={{ width: "100%", padding: 15, background: C.green, color: "#080A0C", border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: "pointer" }}>
              SAVE MEAL ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MACRO PROGRESS BAR ────────────────────────────────────────────────────────
function MacroProgressBar({ label, consumed, target, color }) {
  const C = useThemeColors();
  const pct = target > 0 ? Math.min(consumed / target, 1.2) : 0;
  const over = consumed > target;
  const displayPct = Math.min(pct, 1);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: over ? C.red : C.faint }}>
          {Math.round(consumed)}g / {target}g
          {over && <span style={{ color: C.red, marginLeft: 4 }}>↑</span>}
        </span>
      </div>
      <div style={{ height: 6, background: C.up, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${displayPct * 100}%`, background: over ? C.red : color, borderRadius: 3, transition: "width .8s ease" }} />
      </div>
    </div>
  );
}

// ── NUTRITION SCREEN ──────────────────────────────────────────────────────────
function NutritionScreen({ user }) {
  const C = useThemeColors();
  const [nutState, setNutState] = useState(null);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [loaded, setLoaded] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [mode, setMode] = useState("track"); // "track" | "plan"
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const [tempTargets, setTempTargets] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletedMeal, setDeletedMeal] = useState(null); // {log, timer}
  const deletedTimerRef = useRef(null);
  const [deleteCountdown, setDeleteCountdown] = useState(4);
  const deleteCountRef = useRef(null);
  const [dayTypeOverride, setDayTypeOverride] = useState(null); // null = auto, "train" | "rest"

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  useEffect(() => {
    async function init() {
      const t = await getTargets(user, [], null);
      setTargets(t);
      try {
        const r = await window.storage.get(NUTRITION_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          setNutState(d);
          setMode(d.mode || "track");
        } else {
          setNutState({ logs: [], mode: "track" });
        }
      } catch {
        setNutState({ logs: [], mode: "track" });
      }
      setLoaded(true);
    }
    init();
  }, []);

  const saveState = async (newState) => {
    await window.storage.set(NUTRITION_KEY, JSON.stringify(newState)).catch(() => {});
    setNutState(newState);
  };

  // Today's logs
  const todayLogs = (nutState?.logs || []).filter(l => l.date === today);
  const todayTotals = todayLogs.reduce((acc, l) => ({
    protein_g: acc.protein_g + (l.totals?.protein_g || 0),
    carbs_g: acc.carbs_g + (l.totals?.carbs_g || 0),
    fat_g: acc.fat_g + (l.totals?.fat_g || 0),
    calories: acc.calories + (l.totals?.calories || 0),
  }), { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 });

  // Resolve which day-type targets to display
  const isTrainDay = dayTypeOverride !== null ? dayTypeOverride === "train" : (targets.isTrainDay ?? true);
  const activeTargets = targets.cyclingActive
    ? {
        cal: isTrainDay ? (targets.trainCal ?? targets.cal) : (targets.restCal ?? targets.cal),
        p:   isTrainDay ? (targets.trainP   ?? targets.p)   : (targets.restP   ?? targets.p),
        c:   isTrainDay ? (targets.trainC   ?? targets.c)   : (targets.restC   ?? targets.c),
        f:   isTrainDay ? (targets.trainF   ?? targets.f)   : (targets.restF   ?? targets.f),
      }
    : { cal: targets.cal, p: targets.p, c: targets.c, f: targets.f };

  const calPct = activeTargets.cal > 0 ? Math.min(todayTotals.calories / activeTargets.cal, 1) : 0;

  const handleSaveMeal = async (logEntry) => {
    setShowLog(false);
    setEditingLog(null);
    const allLogs = [...(nutState?.logs || [])];
    const idx = allLogs.findIndex(l => l.id === logEntry.id);
    if (idx >= 0) allLogs[idx] = logEntry; else allLogs.push(logEntry);
    const newState = { ...nutState, logs: allLogs };
    await saveState(newState);

    // Compute new totals after save and generate feedback
    const newTodayLogs = allLogs.filter(l => l.date === today);
    const newTotals = newTodayLogs.reduce((acc, l) => ({
      protein_g: acc.protein_g + (l.totals?.protein_g || 0),
      carbs_g: acc.carbs_g + (l.totals?.carbs_g || 0),
      fat_g: acc.fat_g + (l.totals?.fat_g || 0),
      calories: acc.calories + (l.totals?.calories || 0),
    }), { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 });
    const fb = generateNutritionFeedback(newTotals, activeTargets, logEntry);
    setFeedback(fb);
  };

  const commitDeleteMeal = async (log) => {
    const allLogs = (nutState?.logs || []).filter(l => l.id !== log.id);
    await saveState({ ...nutState, logs: allLogs });
    setFeedback([]);
    setDeletedMeal(null);
  };

  const handleDeleteMeal = (log) => {
    setPendingDelete(null);
    setDeletedMeal(log);
    setDeleteCountdown(4);
    deleteCountRef.current = setInterval(() => {
      setDeleteCountdown(n => { if (n <= 1) { clearInterval(deleteCountRef.current); return 0; } return n - 1; });
    }, 1000);
    deletedTimerRef.current = setTimeout(() => commitDeleteMeal(log), 4000);
  };

  const handleUndoDeleteMeal = () => {
    clearTimeout(deletedTimerRef.current);
    clearInterval(deleteCountRef.current);
    setDeletedMeal(null);
    setDeleteCountdown(4);
  };

  const handleSaveTargets = async () => {
    setTargets(tempTargets);
    setShowTargetEditor(false);
    // Persist custom targets into nutrition state
    await saveState({ ...nutState, customTargets: tempTargets });
  };

  const fbColors = { alert: C.red, warn: "#FBBF24", info: C.blue, green: C.green };
  const fbIcons = { alert: "!", warn: "→", info: "·", green: "✓" };
  const confidenceColor = getConfidenceColor(C);

  // Static meal plan data (secondary mode)
  const PLAN_MEALS = [
    { time: "7:00 AM", name: "Pre-Workout", items: "1 cup oats · 2 eggs + 3 whites · banana", p: 42, c: 68, f: 12, cal: 540 },
    { time: "11:00 AM", name: "Post-Workout", items: "Whey isolate · Gatorade · white rice 1 cup", p: 50, c: 50, f: 3, cal: 390 },
    { time: "1:30 PM", name: "Lunch", items: "8oz chicken · 1.5 cups rice · asparagus · olive oil", p: 65, c: 75, f: 14, cal: 690 },
    { time: "5:30 PM", name: "Dinner", items: "8oz salmon · sweet potato · broccoli", p: 55, c: 60, f: 20, cal: 640 },
    { time: "9:00 PM", name: "Night Meal", items: "Cottage cheese · casein · almond butter", p: 45, c: 20, f: 18, cal: 350 },
  ];

  if (!loaded) return (
    <div className="loading"><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: C.muted, animation: "pulse 2s infinite" }}>LOADING NUTRITION...</div></div>
  );

  return (
    <div className="screen">
      {/* HEADER */}
      <div className="sh">
        <div>
          <div className="sh-label">Today's</div>
          <div className="sh-title">NUTRITION</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setTempTargets({ ...targets }); setShowTargetEditor(!showTargetEditor); }}
            style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:"6px 10px",borderRadius:10,background:showTargetEditor?`${C.accent}18`:C.surface,border:`1px solid ${showTargetEditor?C.accent:C.border}`,color:showTargetEditor?C.accent:C.muted,cursor:"pointer",transition:"all .2s",minWidth:48 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            <span style={{fontSize:8,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>Targets</span>
          </button>
        </div>
      </div>

      {/* TARGET EDITOR */}
      {showTargetEditor && tempTargets && (
        <div className="nut-card" style={{animation:"slideUp .3s ease"}}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.accent, marginBottom: 14 }}>
            ● Daily Macro Targets
            {targets.source && <span style={{ color: C.muted, marginLeft: 8 }}>auto-set from {targets.source}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { key: "cal", label: "Calories", unit: "kcal" },
              { key: "p", label: "Protein", unit: "g" },
              { key: "c", label: "Carbs", unit: "g" },
              { key: "f", label: "Fat", unit: "g" },
            ].map(t => (
              <div key={t.key}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="number" value={tempTargets[t.key]} onChange={e => setTempTargets(prev => ({ ...prev, [t.key]: parseInt(e.target.value) || 0 }))}
                    style={{ flex: 1, background: C.up, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 10px", color: C.text, fontSize: 14, fontFamily: "'DM Mono',monospace", outline: "none" }} />
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{t.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <CubeButton onClick={handleSaveTargets} style={{width:"100%"}}>SAVE TARGETS</CubeButton>
        </div>
      )}

      {/* MODE TOGGLE */}
      <div className="nut-mode-grid">
        {[
          { id: "track", tag: "LOG", label: "Track Mode", desc: "Log your own meals" },
          { id: "plan",  tag: "PLAN", label: "Meal Plan",  desc: "Follow app plan" },
        ].map(m => (
          <div key={m.id} onClick={() => setMode(m.id)} className={`nut-mode-card${mode===m.id?" active":""}`}>
            <div className="nut-mode-tag">{m.tag}</div>
            <div className="nut-mode-label">{m.label}</div>
            <div className="nut-mode-desc">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* DAILY PROGRESS RING + SUMMARY */}
      <div className="nut-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>● Today's Intake vs Target</div>
          {targets.cyclingActive && (
            <div style={{ display: "flex", gap: 4, background: C.up, borderRadius: 8, padding: 3 }}>
              {[{id:"train",label:"TRAIN"},{id:"rest",label:"REST"}].map(opt => {
                const active = opt.id === "train" ? isTrainDay : !isTrainDay;
                return (
                  <button key={opt.id} onClick={() => setDayTypeOverride(dayTypeOverride === opt.id ? null : opt.id)}
                    style={{ padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:9, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5,
                      background: active ? C.accent : "transparent",
                      color: active ? "#080A0C" : C.muted,
                      transition:"all .15s" }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Calorie ring + macro bars */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
          {/* SVG calorie ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={38} fill="none" stroke={C.up} strokeWidth={8} />
              <circle cx={48} cy={48} r={38} fill="none" stroke={calPct >= 1 ? C.red : C.green} strokeWidth={8}
                strokeDasharray={`${calPct * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                strokeLinecap="round" strokeDashoffset={2 * Math.PI * 38 * 0.25}
                style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${calPct >= 1 ? C.red : C.green}80)` }} />
              <text x={48} y={44} textAnchor="middle" fill={C.text} fontSize="13" fontFamily="Bebas Neue,sans-serif" letterSpacing="1">{Math.round(todayTotals.calories)}</text>
              <text x={48} y={57} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="DM Sans,sans-serif">/ {activeTargets.cal}</text>
              <text x={48} y={68} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="DM Sans,sans-serif">KCAL</text>
            </svg>
          </div>
          {/* Macro bars */}
          <div style={{ flex: 1 }}>
            <MacroProgressBar label="Protein" consumed={todayTotals.protein_g} target={activeTargets.p} color={C.accent} />
            <MacroProgressBar label="Carbs" consumed={todayTotals.carbs_g} target={activeTargets.c} color={C.green} />
            <MacroProgressBar label="Fat" consumed={todayTotals.fat_g} target={activeTargets.f} color={C.blue} />
          </div>
        </div>

        {/* Remaining macros */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          {[
            { label: "LEFT", val: Math.max(0, Math.round(activeTargets.cal - todayTotals.calories)), unit: "kcal", color: C.text },
            { label: "PROTEIN", val: Math.max(0, Math.round(activeTargets.p - todayTotals.protein_g)), unit: "g", color: C.accent },
            { label: "CARBS", val: Math.max(0, Math.round(activeTargets.c - todayTotals.carbs_g)), unit: "g", color: C.green },
            { label: "FAT", val: Math.max(0, Math.round(activeTargets.f - todayTotals.fat_g)), unit: "g", color: C.blue },
          ].map(r => (
            <div key={r.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: r.val === 0 ? C.muted : r.color, lineHeight: 1 }}>{r.val}</div>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{r.unit} rem</div>
              <div style={{ fontSize: 8, color: C.muted }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEEDBACK MESSAGES */}
      {feedback.length > 0 && (
        <div style={{ margin: "0 24px 14px" }}>
          {feedback.map((fb, i) => (
            <div key={i} style={{ display:"flex",gap:10,padding:"12px 16px",background:"var(--card)",border:`2px solid ${fbColors[fb.type]||"var(--brutal)"}`,borderRadius:10,boxShadow:`3px 3px 0 ${fbColors[fb.type]||"var(--brutal)"}`,marginBottom:8,alignItems:"flex-start" }}>
              <span style={{ fontSize:13,fontWeight:700,flexShrink:0,color:fbColors[fb.type]||C.accent,lineHeight:1.2 }}>{fbIcons[fb.type]||"·"}</span>
              <span style={{ fontSize:12,color:"var(--muted)",lineHeight:1.5 }}>{fb.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── TRACK MODE ─── */}
      {mode === "track" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 12 }}>
            <div className="stitle" style={{ padding: 0, margin: 0 }}>TODAY'S MEALS</div>
            <CubeButton small onClick={() => { setEditingLog(null); setShowLog(true); }}>+ LOG MEAL</CubeButton>
          </div>

          {/* RECENT MEALS QUICK-ADD */}
          {(() => {
            const allLogs = nutState?.logs || [];
            const seen = new Set();
            const recentMeals = allLogs
              .filter(l => l.date !== today && l.rawInput)
              .sort((a, b) => b.ts - a.ts)
              .filter(l => { if (seen.has(l.mealName)) return false; seen.add(l.mealName); return true; })
              .slice(0, 5);
            if (recentMeals.length === 0) return null;
            return (
              <div style={{ padding: "0 24px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Recent — tap to re-log</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                  {recentMeals.map(m => (
                    <button key={m.id} onClick={async () => {
                      const now = new Date();
                      const entry = {
                        ...m,
                        id: `meal_${Date.now()}`,
                        ts: Date.now(),
                        date: today,
                        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                      };
                      await handleSaveMeal(entry);
                    }} style={{ flexShrink: 0, padding: "6px 14px", background: C.up, border: `1px solid ${C.border}`, borderRadius: 20, cursor: "pointer", textAlign: "left", transition: "border-color .15s" }}
                      onMouseOver={e => e.currentTarget.style.borderColor = C.green}
                      onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{m.mealName}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{Math.round(m.totals?.calories || 0)} kcal</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {todayLogs.length === 0 ? (
            <div className="nut-card" style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{ width:48,height:48,borderRadius:8,background:"var(--up)",border:"2px solid var(--brutal)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"var(--muted)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"var(--text)",marginBottom:8 }}>NO MEALS LOGGED YET</div>
              <div style={{ fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:20 }}>Log your first meal and AI will calculate your macros automatically. Be as specific or as general as you want.</div>
              <CubeButton onClick={() => { setEditingLog(null); setShowLog(true); }}>LOG FIRST MEAL ▶</CubeButton>
            </div>
          ) : (
            todayLogs.map((log, i) => (
              <div key={log.id} className="mcard">
                <div className="mc-head">
                  <div>
                    <div className="mc-time">{log.time}</div>
                    <div className="mc-name">{log.mealName}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mc-kcal">{Math.round(log.totals?.calories || 0)} kcal</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <button onClick={() => { setEditingLog(log); setShowLog(true); }}
                        style={{ fontSize: 10, padding: "2px 8px", background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 4, color: C.accent, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => setPendingDelete(log.id)}
                        style={{ fontSize: 10, padding: "2px 8px", background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 4, color: C.red, cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                </div>
                {/* Item summary */}
                <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.5, marginBottom: 8 }}>
                  {log.items?.map(item => item.food)?.join(" · ") || log.rawInput}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {[
                    { l: "P", v: Math.round(log.totals?.protein_g || 0), cl: C.accent },
                    { l: "C", v: Math.round(log.totals?.carbs_g || 0), cl: C.green },
                    { l: "F", v: Math.round(log.totals?.fat_g || 0), cl: C.blue },
                  ].map(m => (
                    <span key={m.l} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: m.cl, background: `${m.cl}15`, padding: "2px 8px", borderRadius: 4 }}>{m.l}: {m.v}g</span>
                  ))}
                  {log.confidence && (
                    <span style={{ fontSize: 10, color: confidenceColor[log.confidence] || C.muted, background: `${confidenceColor[log.confidence] || C.muted}12`, padding: "2px 8px", borderRadius: 4 }}>
                      {log.confidence} confidence
                    </span>
                  )}
                </div>
                {pendingDelete === log.id && (
                  <div style={{ marginTop: 10, padding: "10px 12px", background: `${C.red}0D`, border: `1px solid ${C.red}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, animation: "slideUp .2s ease-out" }}>
                    <span style={{ fontSize: 12, color: C.faint }}>Remove <strong style={{ color: C.text }}>{log.mealName}</strong>?</span>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setPendingDelete(null)}
                        style={{ fontSize: 11, padding: "4px 10px", background: C.up, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => { handleDeleteMeal(log); setPendingDelete(null); }}
                        style={{ fontSize: 11, padding: "4px 10px", background: C.red, border: "none", borderRadius: 6, color: "#FFF", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Weekly averages */}
          {(nutState?.logs || []).length > 0 && (() => {
            const last7 = (nutState.logs || []).filter(l => {
              const d = new Date(); d.setDate(d.getDate() - 7);
              return new Date(l.ts) >= d;
            });
            if (last7.length < 2) return null;
            const days = [...new Set(last7.map(l => l.date))].length;
            const totW = last7.reduce((a, l) => ({ p: a.p + (l.totals?.protein_g || 0), c: a.c + (l.totals?.carbs_g || 0), f: a.f + (l.totals?.fat_g || 0), cal: a.cal + (l.totals?.calories || 0) }), { p: 0, c: 0, f: 0, cal: 0 });
            return (
              <div className="nut-card" style={{marginTop:4}}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>7-Day Averages ({days} days logged)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, textAlign: "center" }}>
                  {[
                    { label: "KCAL", val: Math.round(totW.cal / days), color: C.text },
                    { label: "PROTEIN", val: `${Math.round(totW.p / days)}g`, color: C.accent },
                    { label: "CARBS", val: `${Math.round(totW.c / days)}g`, color: C.green },
                    { label: "FAT", val: `${Math.round(totW.f / days)}g`, color: C.blue },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: m.color }}>{m.val}</div>
                      <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1 }}>{m.label}</div>
                      <div style={{ fontSize: 8, color: C.muted }}>avg/day</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ─── PLAN MODE ─── */}
      {mode === "plan" && (
        <>
          <div className="stitle">STRUCTURED MEAL PLAN</div>
          <div className="nut-card" style={{fontSize:12,color:"var(--muted)"}}>
            This plan is pre-calculated to your macro targets. Switch to Track Mode to log your actual meals.
          </div>
          {PLAN_MEALS.map((meal, i) => (
            <div key={i} className="mcard">
              <div className="mc-head">
                <div><div className="mc-time">{meal.time}</div><div className="mc-name">{meal.name}</div></div>
                <div className="mc-kcal">{meal.cal} kcal</div>
              </div>
              <div className="mc-items">{meal.items}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {[{ l: "P", v: meal.p, cl: C.accent }, { l: "C", v: meal.c, cl: C.green }, { l: "F", v: meal.f, cl: C.blue }].map(m => (
                  <span key={m.l} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: m.cl, background: `${m.cl}15`, padding: "2px 8px", borderRadius: 4 }}>{m.l}: {m.v}g</span>
                ))}
              </div>
              <div className="pbar"><div className="pfill" style={{ width: `${(meal.cal / targets.cal) * 100}%`, background: i % 2 === 0 ? C.accent : C.green }} /></div>
            </div>
          ))}
        </>
      )}

      {/* LOG MODAL */}
      {showLog && (
        <MealLogModal
          onSave={handleSaveMeal}
          onClose={() => { setShowLog(false); setEditingLog(null); }}
          existingLog={editingLog}
        />
      )}

      {/* MEAL DELETE UNDO TOAST */}
      {deletedMeal && (
        <div style={{
          position:"fixed",bottom:80,left:16,right:16,
          background:C.surface,border:`1px solid ${C.border}`,
          borderRadius:14,padding:"14px 18px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          boxShadow:"0 8px 32px rgba(0,0,0,.22)",
          animation:"slideUp .22s ease-out",zIndex:200,
        }}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1,color:C.text}}>{deletedMeal.mealName} removed</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{Math.round(deletedMeal.totals?.calories||0)} kcal · {Math.round(deletedMeal.totals?.protein_g||0)}g protein</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.muted}}>{deleteCountdown}</div>
            <button onClick={handleUndoDeleteMeal}
              style={{padding:"6px 16px",background:C.up,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POST-PREP ────────────────────────────────────────────────────────────────

const PP_KEY = "apex_rebound_v3";

function PostPrepScreen({user}) {
  const C = useThemeColors();
  const [stageWeight,setStageWeight]=useState("");
  const [stageCalories,setStageCalories]=useState("");
  const [prepWeeks,setPrepWeeks]=useState("16");
  const [mode,setMode]=useState("reverse");
  const [protocol,setProtocol]=useState(null);
  const [activePhase,setActivePhase]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const [editing,setEditing]=useState(false);
  const [savedAt,setSavedAt]=useState(null);

  // Load saved data on mount
  useEffect(()=>{
    async function load() {
      try {
        const r = await window.storage.get(PP_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.inputs) {
            setStageWeight(d.inputs.stageWeight||"");
            setStageCalories(d.inputs.stageCalories||"");
            setPrepWeeks(d.inputs.prepWeeks||"16");
            setMode(d.inputs.mode||"reverse");
          }
          if (d.protocol) { setProtocol(d.protocol); setEditing(false); }
          else setEditing(true);
          setSavedAt(d.savedAt||null);
        } else {
          setEditing(true);
        }
      } catch { setEditing(true); }
      setLoaded(true);
    }
    load();
  },[]);

  const save = useCallback(async (inputs, proto) => {
    try {
      const ts = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      await window.storage.set(PP_KEY, JSON.stringify({inputs, protocol:proto, savedAt:ts}));
      setSavedAt(ts);
    } catch(e){ console.error(e); }
  },[]);

  const calculate = async () => {
    const proto = calcProtocol({stageWeight,stageCalories,prepWeeks,sex:user.sex||"male",mode});
    setProtocol(proto);
    setActivePhase(0);
    setEditing(false);
    await save({stageWeight,stageCalories,prepWeeks,mode}, proto);
  };

  const handleModeSwitch = (m) => { setMode(m); if(editing) setProtocol(null); };
  const handleEdit = () => setEditing(true);

  const canCalc = stageWeight && stageCalories && parseFloat(stageWeight)>0 && parseFloat(stageCalories)>0;
  const cfg = MODES[mode];
  const activeCfg = protocol ? (MODES[protocol.mode]||cfg) : cfg;

  const rulesR = [
    {text:<><strong>Never binge post-show.</strong> The 24–48hr window is not a free pass. One uncontrolled refeed spikes adipocytes and triggers fat gain that takes months to undo.</>},
    {text:<><strong>Add +100 kcal weekly — carbs first.</strong> Every increment comes primarily from carbohydrates. Gaining more than 1 lb/wk? Cut the increment in half.</>},
    {text:<><strong>Weigh daily, judge weekly.</strong> 7-day rolling average only. Early spikes are glycogen — not fat. Judge trends, not single readings.</>},
    {text:<><strong>Carbs drive the rebound.</strong> Restore glycogen, suppress cortisol, fill muscle bellies. Build carbs first — fat increases are secondary.</>},
    {text:<><strong>Sleep is your most anabolic tool.</strong> 8–9 hours minimum. Testosterone and GH rebuild during deep sleep. No sleep = no rebound.</>},
    {text:<><strong>Train heavy, not high volume.</strong> Cut volume 30–40% but keep intensity on compounds. Joints are depleted — protect them.</>},
    {text:<><strong>Stay prep-ready.</strong> {protocol?`Stay under ${protocol.ceiling} lbs`:"Stay under your ceiling"} and you walk into your next prep without a cleanup week.</>},
  ];

  const rulesM = [
    {text:<><strong>Hit maintenance on Day 1 — not above it.</strong> {protocol?`${protocol.mainCals} kcal`:"Your TDEE"} is the Week 1 ceiling. Post-prep insulin sensitivity means even this drives rapid glycogen and muscle restoration.</>},
    {text:<><strong>Expect 2–5 lbs in the first 72 hours.</strong> Glycogen and intramuscular water. Not fat. Your muscles are recharging. It means the protocol is working.</>},
    {text:<><strong>Flat trendline = success in Weeks 2–4.</strong> 7-day average should be flat (±0.5 lbs). Gaining faster? Trim 100–150 kcals from carbs. Dropping? Add 100.</>},
    {text:<><strong>Surplus opens at Week 5.</strong> After stable maintenance, step to {protocol?`${protocol.surplusCals} kcal`:"your lean surplus"}. This is when intentional growth begins.</>},
    {text:<><strong>Sleep is your most anabolic tool.</strong> 8–9 hours. Hormones are still rebuilding from prep — protect the recovery window.</>},
    {text:<><strong>Push intensity from Day 1.</strong> Full fuel from the start. Performance rebounds fast. Progressive overload starts now.</>},
    {text:<><strong>Stay prep-ready.</strong> {protocol?`Stay under ${protocol.ceiling} lbs`:"Stay under your ceiling"} and you walk into your next prep without a cleanup week.</>},
  ];

  const rules = (protocol?.mode||mode)==="maintenance" ? rulesM : rulesR;

  if (!loaded) return (
    <div className="loading"><div style={{textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:C.muted,animation:"pulse 2s infinite"}}>LOADING YOUR PROTOCOL...</div></div>
  );

  return (
    <div className="screen">
      <div className="sh">
        <div><div className="sh-label">Post-Show</div><div className="sh-title" style={{color:activeCfg.color}}>REBOUND PROTOCOL</div></div>
      </div>

      {/* SAVED BANNER — shows when protocol exists and not editing */}
      {protocol && !editing && (
        <div className="saved-banner">
          <div>
            <div className="sb-tag">● Protocol Saved{savedAt?` · ${savedAt}`:""}</div>
            <div className="sb-title">{activeCfg.label}</div>
            <div className="sb-sub">Stage: {protocol.stageWeight} lbs · {protocol.stageCalories} kcal · {protocol.wks}wk prep</div>
          </div>
          <button className="btn-edit" onClick={handleEdit}>↺ EDIT</button>
        </div>
      )}

      {/* INPUT FORM — only shows when editing */}
      {editing && (
        <>
          <div className="pp-hero" style={{borderColor:`${cfg.color}35`}}>
            <div className="pp-badge" style={{color:cfg.color}}>● APEX POST-PREP ENGINE</div>
            <div className="pp-title">The <span style={{color:cfg.color}}>Smart</span> Rebound.<br/>Gain Without the Mess.</div>
            <div className="pp-sub">{cfg.heroSub}</div>
          </div>

          {/* MODE TOGGLE */}
          <div style={{margin:"0 24px 16px"}}>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:10}}>● Select Your Approach</div>
            <div className="mode-grid">
              {Object.entries(MODES).map(([key,mc])=>(
                <div key={key} className="mode-card" onClick={()=>handleModeSwitch(key)}
                  style={{borderColor:mode===key?mc.color:C.border,background:mode===key?`${mc.color}12`:C.surface}}>
                  {mode===key&&<div className="mode-check" style={{background:mc.color}}>✓</div>}
                  <div style={{width:8,height:8,borderRadius:"50%",background:mc.color,marginBottom:8}}/>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:1,color:mode===key?mc.color:C.text,marginBottom:4}}>{mc.label}</div>
                  <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{mc.tagline}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginTop:10}}>
              <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:cfg.color,marginBottom:8}}>Best For</div>
              {cfg.best.map((b,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:cfg.color,fontSize:11,flexShrink:0}}>▸</span><span style={{fontSize:12,color:C.faint,lineHeight:1.4}}>{b}</span></div>)}
              <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${C.border}`,fontSize:11,color:C.muted}}><span style={{color:C.accent}}>Trade-off: </span>{cfg.tradeoff}</div>
            </div>
          </div>

          {/* DATA INPUTS */}
          <div className="pp-card">
            <div className="pp-section-label" style={{color:cfg.color}}>● Stage Day Data</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="irow">
                <div className="igroup"><label className="ilabel">Stage Weight (lbs)</label><input className="ifield" type="number" placeholder="168" value={stageWeight} onChange={e=>setStageWeight(e.target.value)} style={{borderColor:stageWeight?cfg.color:C.border}}/></div>
                <div className="igroup"><label className="ilabel">Final Prep Calories</label><input className="ifield" type="number" placeholder="1750" value={stageCalories} onChange={e=>setStageCalories(e.target.value)} style={{borderColor:stageCalories?cfg.color:C.border}}/></div>
              </div>
              <div className="slider-wrap">
                <div style={{display:"flex",justifyContent:"space-between"}}><label className="ilabel">Prep Duration</label><span className="slider-val" style={{color:cfg.color}}>{prepWeeks} weeks</span></div>
                <input type="range" className="slider" min="8" max="32" step="1" value={prepWeeks} onChange={e=>setPrepWeeks(e.target.value)}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted}}><span>8 wks</span><span>20 wks</span><span>32 wks</span></div>
              </div>
              <button className="btn" disabled={!canCalc} onClick={calculate}
                style={{background:cfg.color,color:"#080A0C",boxShadow:`0 4px 20px ${cfg.color}40`,opacity:canCalc?1:.4,cursor:canCalc?"pointer":"not-allowed"}}>
                CALCULATE {cfg.label} ▶
              </button>
            </div>
          </div>
        </>
      )}

      {/* RESULTS — always shows if protocol exists */}
      {protocol && (
        <div className="pp-results">

          {/* ACTIVE PROTOCOL BADGE */}
          <div style={{margin:"0 24px 14px",padding:"10px 14px",background:`${activeCfg.color}10`,border:`1px solid ${activeCfg.color}30`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{width:10,height:10,borderRadius:"50%",background:activeCfg.color,display:"inline-block",flexShrink:0}}/>
            <div><div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:activeCfg.color}}>Active Protocol</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1}}>{activeCfg.label}</div></div>
            <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:activeCfg.color}}>{protocol.baselineCals}</div><div style={{fontSize:9,color:C.muted}}>DAY 1 KCAL</div></div>
          </div>

          {/* CEILING */}
          <div className="knum" style={{margin:"0 24px 14px",background:"linear-gradient(135deg,rgba(232,69,69,.05),#0F1215)",borderColor:"rgba(232,69,69,.25)"}}>
            <div className="knum-label" style={{color:C.red}}>REBOUND CEILING — DO NOT EXCEED</div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
              <div><div className="knum-main" style={{color:C.red}}>{protocol.ceiling} <span style={{fontSize:18,color:C.muted}}>lbs</span></div><div className="knum-sub">Maximum offseason bodyweight</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.faint}}>+{protocol.ceiling-protocol.stageWeight}</div><div style={{fontSize:10,color:C.muted}}>lbs above stage</div></div>
            </div>
            <div className="knum-note">Stay under this and you walk into your next prep without a cleanup week. <strong style={{color:C.text}}>Prep-ready offseason.</strong></div>
          </div>

          {/* KEY NUMBERS */}
          {(protocol.mode)==="maintenance" ? (
            <div className="knum-3">
              {[{label:"Target Weight",val:protocol.target,unit:"lbs",color:C.green},{label:"Maintenance",val:protocol.mainCals,unit:"kcal",color:C.green},{label:"Lean Surplus",val:protocol.surplusCals,unit:"kcal",color:C.purple}].map(k=>(
                <div key={k.label} className="knum-mini" style={{borderColor:`${k.color}30`}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:4}}>{k.label}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:k.color,lineHeight:1}}>{k.val}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{k.unit}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="knum-pair">
              <div className="knum" style={{background:"linear-gradient(135deg,rgba(61,220,132,.05),#0F1215)",borderColor:"rgba(61,220,132,.2)"}}>
                <div className="knum-label" style={{color:C.green}}>Target Weight</div>
                <div className="knum-main" style={{color:C.green,fontSize:30}}>{protocol.target}</div>
                <div className="knum-sub">lbs offseason carry</div>
                <div style={{fontSize:11,color:C.muted,marginTop:6}}>+{protocol.target-protocol.stageWeight} lbs above stage</div>
              </div>
              <div className="knum" style={{background:"linear-gradient(135deg,rgba(245,166,35,.05),#0F1215)",borderColor:"rgba(245,166,35,.2)"}}>
                <div className="knum-label" style={{color:C.accent}}>{activeCfg.day1Label}</div>
                <div className="knum-main" style={{color:C.accent,fontSize:30}}>{protocol.baselineCals}</div>
                <div className="knum-sub">kcal Day 1</div>
                <div style={{fontSize:11,color:C.muted,marginTop:6}}>{activeCfg.day1Note}</div>
              </div>
            </div>
          )}

          {/* PHASE TABS */}
          <div className="stitle">PHASE BREAKDOWN</div>
          <div className="ptabs">
            {protocol.phases.map((ph,i)=>(
              <div key={ph.key} className="ptab" onClick={()=>setActivePhase(i)}
                style={{background:activePhase===i?ph.color:C.surface,borderColor:activePhase===i?ph.color:C.border,color:activePhase===i?"#080A0C":C.faint}}>
                {ph.label}
              </div>
            ))}
          </div>

          {/* ACTIVE PHASE DETAIL */}
          {(()=>{
            const ph=protocol.phases[activePhase];
            return (
              <div style={{margin:"0 24px 20px",background:C.surface,border:`1px solid ${ph.color}40`,borderRadius:16,padding:20,borderLeft:`3px solid ${ph.color}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:ph.color,opacity:.7}}>{ph.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:10,letterSpacing:2,color:ph.color,textTransform:"uppercase"}}>{ph.label}</div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1}}>{ph.name}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:ph.color}}>{ph.cals}</div><div style={{fontSize:9,color:C.muted}}>KCAL/DAY</div></div>
                </div>
                <MacroRing protein={ph.p} carbs={ph.c} fat={ph.f} calories={ph.cals}/>
                <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`,fontSize:13,color:C.faint,lineHeight:1.6}}>{ph.desc}</div>
              </div>
            );
          })()}

          {/* ROADMAP */}
          <div className="stitle">WEEK-BY-WEEK ROADMAP</div>
          <div className="ptl">
            <div className="ptl-line"/>
            {protocol.phases.map(ph=>(
              <div key={ph.key} className="pi">
                <div className={`pidot ${ph.dot}`}>{ph.icon}</div>
                <div className="picnt">
                  <div className="pi-wk">{ph.label}</div>
                  <div className="pi-name">{ph.name}</div>
                  <div className="pi-tags">
                    <span className="pi-tag" style={{background:`${C.accent}12`,color:C.accent}}>P: {ph.p}g</span>
                    <span className="pi-tag" style={{background:`${C.green}12`,color:C.green}}>C: {ph.c}g</span>
                    <span className="pi-tag" style={{background:`${C.blue}12`,color:C.blue}}>F: {ph.f}g</span>
                    <span className="pi-tag" style={{background:`${ph.color}12`,color:ph.color}}>{ph.cals} kcal</span>
                  </div>
                  <div className="pi-desc">{ph.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* VITALS */}
          <div className="stitle">VITALS RECOVERY CLOCK</div>
          <div style={{padding:"0 24px 8px",fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:8}}>Based on a {protocol.wks}-week prep. Current status on show day — and weeks to full restore.</div>
          <div className="vgrid">
            {protocol.vitals.map((v,i)=>{
              const d=v.pct<.3,r=v.pct>=.65,cl=d?C.red:r?C.green:C.accent,sc=d?"dep":r?"res":"rec",sl=d?"Depleted":r?"Restored":"Recovering";
              return (
                <div key={i} className="vcard">
                  <div className="v-icon" style={{background:cl}}/>
                  <div className="v-name">{v.name}</div>
                  <div className={`v-status ${sc}`}>{sl}</div>
                  <div className="v-wks">~{v.wks} wks to restore</div>
                  <div className="vbar"><div className="vfill" style={{width:`${Math.round(v.pct*100)}%`,background:cl}}/></div>
                </div>
              );
            })}
          </div>

          {/* RULES */}
          <div className="stitle">THE GOLDEN RULES</div>
          <div className="rules-card">
            {rules.map((r,i)=><div key={i} className="rule-row"><span className="rule-icon">▸</span><span className="rule-text">{r.text}</span></div>)}
          </div>
          <div style={{height:20}}/>
        </div>
      )}
    </div>
  );
}

// ─── FEEDBACK ARCHIVE ─────────────────────────────────────────────────────────

function FeedbackArchiveScreen({ embedded = false }) {
  const C = useThemeColors();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [groupBy, setGroupBy] = useState("date");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    window.storage.get(FEEDBACK_KEY).then(r => {
      try {
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          const arr = Array.isArray(parsed) ? parsed : Object.values(parsed).filter(v => v?.text);
          setFeedbacks(arr.filter(f => f?.text).sort((a, b) => (b.ts||0) - (a.ts||0)));
          // Mark all read
          if (arr.some(f => !f.read)) {
            const updated = arr.map(f => ({...f, read: true}));
            window.storage.set(FEEDBACK_KEY, JSON.stringify(updated)).catch(() => {});
          }
        }
      } catch {}
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const DAY_LABEL = key => key ? key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Custom";

  // Build grouped sections
  const grouped = useMemo(() => {
    if (!feedbacks.length) return [];
    if (groupBy === "date") {
      const byDate = {};
      feedbacks.forEach(f => {
        const d = new Date(f.ts);
        const key = d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" });
        if (!byDate[key]) byDate[key] = { label: key, ts: f.ts, items: [] };
        byDate[key].items.push(f);
      });
      return Object.values(byDate).sort((a, b) => b.ts - a.ts);
    }
    if (groupBy === "workout") {
      const byDay = {};
      feedbacks.forEach(f => {
        const key = f.dayKey || "custom";
        if (!byDay[key]) byDay[key] = { label: DAY_LABEL(key), ts: f.ts, items: [] };
        byDay[key].items.push(f);
      });
      return Object.values(byDay).sort((a, b) => b.ts - a.ts);
    }
    if (groupBy === "muscle") {
      const byMuscle = {};
      feedbacks.forEach(f => {
        const muscles = f.muscles?.length ? f.muscles : ["general"];
        muscles.slice(0, 1).forEach(m => {
          const key = m;
          const label = MUSCLE_BENCHMARKS[m]?.label || m.charAt(0).toUpperCase() + m.slice(1);
          if (!byMuscle[key]) byMuscle[key] = { label, ts: f.ts, items: [] };
          byMuscle[key].items.push(f);
        });
      });
      return Object.values(byMuscle).sort((a, b) => b.ts - a.ts);
    }
    return [];
  }, [feedbacks, groupBy]);

  const unreadCount = feedbacks.filter(f => !f.read).length;

  if (!loaded) return (
    <div className="loading">
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:C.muted, animation:"pulse 2s infinite" }}>LOADING ARCHIVE...</div>
    </div>
  );

  const Wrap = embedded ? ({ children }) => <div style={{paddingBottom:32}}>{children}</div> : ({ children }) => <div className="screen">{children}</div>;

  return (
    <Wrap>
      {/* HEADER — only when standalone */}
      {!embedded && (
        <div className="sh">
          <div>
            <div className="sh-label">Coach</div>
            <div className="sh-title">FEEDBACK ARCHIVE</div>
          </div>
          {unreadCount > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:`${C.accent}18`, border:`1px solid ${C.accent}40`, borderRadius:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.accent }}/>
              <span style={{ fontSize:11, fontWeight:700, color:C.accent, letterSpacing:.5 }}>{unreadCount} NEW</span>
            </div>
          )}
        </div>
      )}

      {/* GROUP BY TOGGLE */}
      <div style={{ margin:"0 24px 20px", display:"flex", background:C.up, borderRadius:10, padding:3 }}>
        {[{id:"date",label:"BY DATE"},{id:"workout",label:"BY WORKOUT"},{id:"muscle",label:"BY MUSCLE"}].map(opt => (
          <button key={opt.id} onClick={() => setGroupBy(opt.id)}
            style={{ flex:1, padding:"8px 4px", border:"none", borderRadius:8, cursor:"pointer", fontSize:10, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5,
              background: groupBy === opt.id ? C.accent : "transparent",
              color: groupBy === opt.id ? "#080A0C" : C.muted,
              transition:"all .15s" }}>
            {opt.label}
          </button>
        ))}
      </div>

      {feedbacks.length === 0 ? (
        <div style={{ margin:"60px 24px 0", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:2, color:C.muted, marginBottom:8 }}>NO SESSIONS YET</div>
          <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>Complete a workout to receive<br/>AI coaching feedback here.</div>
        </div>
      ) : (
        <div style={{ paddingBottom:32 }}>
          {grouped.map(group => (
            <div key={group.label}>
              {/* GROUP HEADER */}
              <div style={{ margin:"8px 24px 10px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:C.muted, fontWeight:700 }}>
                  {group.label}
                </div>
                <div style={{ flex:1, height:1, background:C.border }}/>
                <div style={{ fontSize:10, color:C.muted }}>{group.items.length}</div>
              </div>

              {/* FEEDBACK CARDS */}
              {group.items.map(fb => {
                const isOpen = expanded === fb.id || expanded === String(fb.ts);
                const date = new Date(fb.ts);
                const timeStr = date.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
                const dateStr = groupBy !== "date"
                  ? date.toLocaleDateString("en-US", { month:"short", day:"numeric" })
                  : timeStr;

                return (
                  <div key={fb.id || fb.ts} style={{ margin:"0 24px 10px", border:`1px solid ${isOpen ? C.accent : C.border}`, borderRadius:12, overflow:"hidden", transition:"border-color .2s" }}>
                    {/* CARD HEADER */}
                    <button onClick={() => setExpanded(isOpen ? null : (fb.id || String(fb.ts)))}
                      style={{ width:"100%", background: isOpen ? `${C.accent}08` : C.surface, border:"none", padding:"14px 16px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12, transition:"background .15s" }}>
                      {/* Unread dot */}
                      <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background: !fb.read ? C.accent : "transparent", border: !fb.read ? "none" : `1px solid ${C.border}` }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:1.5, color: isOpen ? C.accent : C.text }}>
                            {DAY_LABEL(fb.dayKey)}
                          </span>
                          {(fb.muscles || []).slice(0, 3).map(m => (
                            <span key={m} style={{ fontSize:9, fontWeight:700, letterSpacing:.5, textTransform:"uppercase", padding:"2px 6px", borderRadius:4, background:`${MUSCLE_BENCHMARKS[m]?.color || C.accent}18`, color: MUSCLE_BENCHMARKS[m]?.color || C.accent }}>
                              {MUSCLE_BENCHMARKS[m]?.label || m}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize:11, color:C.muted }}>{dateStr}</div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ width:14, height:14, color:C.muted, flexShrink:0, transform: isOpen ? "rotate(180deg)" : "none", transition:"transform .2s" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>

                    {/* EXPANDED FEEDBACK TEXT */}
                    {isOpen && (
                      <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.border}`, background:C.surface }}>
                        <div style={{ paddingTop:14, fontSize:13, color:C.faint, lineHeight:1.75, whiteSpace:"pre-wrap" }}>
                          {fb.text}
                        </div>
                        <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div style={{ fontSize:10, color:C.muted, letterSpacing:.5 }}>
                            {date.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })} · {timeStr}
                          </div>
                          <div style={{ fontSize:10, color:C.accent, letterSpacing:.5, fontWeight:700 }}>APEX COACH</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </Wrap>
  );
}

// ─── COACH ────────────────────────────────────────────────────────────────────

function CoachScreen({user}) {
  const C = useThemeColors();
  const [coachTab, setCoachTab] = useState("chat"); // "chat" | "history"
  const [messages,setMessages]=useState([{
    role:"coach",
    text:`What's up ${user.name}! I'm APEX — your AI performance coach.\n\nI've built your program around your ${user.goal||"physique"} goal. Whether you're in the offseason, on prep, or navigating post-show — I've got you.\n\nHow can I help you today?`,
    time:"now"
  }]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [pending,setPending]=useState([]); // [{id,dataUrl,base64,mediaType}]
  const msgsRef=useRef(null);
  const fileRef=useRef(null);

  // Inject goal analysis rationale on first open (generated at onboarding time)
  useEffect(()=>{
    window.storage.get(GOAL_ANALYSIS_KEY).then(r=>{
      try {
        if(!r?.value) return;
        const entry = JSON.parse(r.value);
        if(!entry?.text || entry.read) return;
        const goalLabel = entry.goalType ? ` — ${entry.goalType.toUpperCase()} to ${entry.goalWeight} lbs` : "";
        setMessages(prev=>[...prev,{role:"coach",text:`Your goal analysis${goalLabel}:\n\n${entry.text}`,time:"now"}]);
        window.storage.set(GOAL_ANALYSIS_KEY, JSON.stringify({...entry, read:true})).catch(()=>{});
        setTimeout(()=>{ if(msgsRef.current) msgsRef.current.scrollTop=msgsRef.current.scrollHeight; },120);
      } catch {}
    }).catch(()=>{});
  },[]);

  // Inject unread weekly digest
  useEffect(()=>{
    window.storage.get(WEEKLY_DIGEST_KEY).then(r=>{
      try {
        if(!r?.value) return;
        const entry = JSON.parse(r.value);
        if(!entry?.text || entry.read) return;
        setMessages(prev=>[...prev,{role:"coach",text:`Weekly progress update:\n\n${entry.text}`,time:"now"}]);
        window.storage.set(WEEKLY_DIGEST_KEY,JSON.stringify({...entry,read:true})).catch(()=>{});
        setTimeout(()=>{ if(msgsRef.current) msgsRef.current.scrollTop=msgsRef.current.scrollHeight; },150);
      } catch {}
    }).catch(()=>{});
  },[]);

  // Inject unread post-session feedback on first open
  useEffect(()=>{
    window.storage.get(FEEDBACK_KEY).then(r=>{
      try {
        if(!r?.value) return;
        const parsed=JSON.parse(r.value);
        const arr = Array.isArray(parsed) ? parsed : Object.values(parsed).filter(v=>v?.text);
        const unread = arr.filter(fb=>fb?.text&&!fb?.read);
        if(!unread.length) return;
        const latest = unread.sort((a,b)=>(b.ts||0)-(a.ts||0))[0];
        const dayLabel = latest.dayKey ? ` (${latest.dayKey.replace(/_/g," ").toUpperCase()})` : "";
        setMessages(prev=>[...prev,{role:"coach",text:`Post-session recap${dayLabel}:\n\n${latest.text}`,time:"now"}]);
        // Mark all as read
        const updated = arr.map(fb=>({...fb,read:true}));
        window.storage.set(FEEDBACK_KEY,JSON.stringify(updated)).catch(()=>{});
        setTimeout(()=>{ if(msgsRef.current) msgsRef.current.scrollTop=msgsRef.current.scrollHeight; },120);
      } catch {}
    }).catch(()=>{});
  },[]);

  const scrollBottom=()=>setTimeout(()=>{ if(msgsRef.current) msgsRef.current.scrollTop=msgsRef.current.scrollHeight; },60);

  const handleFiles=(e)=>{
    const files=Array.from(e.target.files);
    if(!files.length) return;
    files.slice(0,4-pending.length).forEach(file=>{
      const reader=new FileReader();
      reader.onload=(ev)=>{
        const dataUrl=ev.target.result;
        setPending(prev=>[...prev,{id:Date.now()+Math.random(),dataUrl,base64:dataUrl.split(",")[1],mediaType:file.type||"image/jpeg"}]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value="";
  };

  const removePhoto=(id)=>setPending(prev=>prev.filter(p=>p.id!==id));

  const send=async(textOverride)=>{
    const txt=textOverride??input;
    const hasPhotos=pending.length>0;
    if(!txt.trim()&&!hasPhotos) return;
    if(loading) return;

    const displayText=hasPhotos&&!txt.trim()
      ? `Sent ${pending.length} photo${pending.length>1?"s":""} for physique evaluation`
      : txt.trim();

    const userMsg={role:"user",text:displayText,photos:hasPhotos?pending.map(p=>p.dataUrl):undefined,time:"now"};
    setMessages(prev=>[...prev,userMsg]);
    setInput("");
    const photosToSend=[...pending];
    setPending([]);
    setLoading(true);
    scrollBottom();

    try {
      const histMsgs=[...messages].map(m=>({role:m.role==="coach"?"assistant":"user",content:m.text}));
      let currentContent;
      if(hasPhotos){
        currentContent=[
          ...photosToSend.map(p=>({type:"image",source:{type:"base64",media_type:p.mediaType,data:p.base64}})),
          {type:"text",text:txt.trim()||`Please evaluate my physique in ${photosToSend.length>1?"these photos":"this photo"} based on my goal (${user.goal||"muscle gain"}). Give specific, honest, actionable coaching feedback — assess muscle development, body composition, conditioning, symmetry, lagging body parts, and what I should prioritize in training and nutrition right now.`}
        ];
      } else {
        currentContent=txt.trim();
      }

      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:1200,
          system:`You are APEX, an elite AI fitness and bodybuilding coach with deep expertise in visual physique assessment. Direct, knowledgeable, motivating — like a seasoned coach who's guided athletes from beginner to contest stage.

Athlete profile:
- Name: ${user.name} | Weight: ${user.weight} lbs | Height: ${user.height}in | Age: ${user.age} | Sex: ${user.sex||"male"}
- Goal: ${user.goal||"muscle gain"} | Experience: ${user.level||"intermediate"}

When evaluating physique photos:
- Assess muscle development, body composition, and conditioning honestly and specifically
- Identify lagging muscle groups and strong points by name
- Give prioritized, actionable recommendations for training and nutrition adjustments aligned with the athlete's specific goal
- Be direct — athletes need real feedback, not flattery or vagueness

Keep all responses conversational, specific, and actionable. Max 4 short paragraphs. Use real bodybuilding terminology.`,
          messages:[...histMsgs,{role:"user",content:currentContent}],
        })
      });
      const data=await res.json();
      const reply=data.content?.find(b=>b.type==="text")?.text||data.content?.[0]?.text||"Keep pushing. What else do you need?";
      setMessages(prev=>[...prev,{role:"coach",text:reply,time:"now"}]);
    } catch {
      setMessages(prev=>[...prev,{role:"coach",text:FALLBACK[Math.floor(Math.random()*FALLBACK.length)],time:"now"}]);
    }
    setLoading(false);
    scrollBottom();
  };

  // Dynamic bottom offset — lifts above MiniSessionView (≈62px) when a session is active
  const { session: activeSession } = useSession();
  const msvH = activeSession ? 62 : 0;          // MiniSessionView height when visible
  const stripHeight = pending.length > 0 ? 78 : 0;
  const inputBottom = 90 + msvH;                 // 90 = nav clearance, +62 when MSV showing
  const msgsHeight = `calc(100vh - ${pending.length > 0 ? 452 + msvH : 364 + msvH}px)`;

  if (coachTab === "history") return (
    <div className="screen" style={{overflowY:"auto"}}>
      <div style={{padding:"56px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={() => setCoachTab("chat")} style={{background:"none",border:"none",color:C.accent,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>← Coach</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1,color:C.text}}>SESSION HISTORY</div>
      </div>
      <FeedbackArchiveScreen embedded/>
    </div>
  );

  return (
    <div className="screen" style={{paddingBottom:0}}>
      <div className="ch-header">
        <div className="ch-id">
          <div className="ch-av">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <div className="ch-dot"/>
          </div>
          <div>
            <div className="ch-name">APEX COACH</div>
            <div className="ch-status">Online · Ready to coach</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={() => setCoachTab("history")}
            style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",color:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
            HISTORY
          </button>
        </div>
      </div>
      <div className="chips">
        {QPROMPTS.map(p=><div key={p} className="chip" onClick={()=>send(p)}>{p}</div>)}
      </div>

      <div className="msgs" ref={msgsRef} style={{height:msgsHeight}}>
        {messages.map((msg,i)=>(
          <div key={i} className={`msg ${msg.role}`}>
            {msg.role==="coach"&&<div className="mav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>}
            <div style={{maxWidth:"82%"}}>
              {/* Inline photo thumbnails in the sent message */}
              {msg.photos&&msg.photos.length>0&&(
                <div style={{display:"flex",gap:6,marginBottom:6,flexDirection:"row-reverse",flexWrap:"wrap"}}>
                  {msg.photos.map((src,pi)=>(
                    <img key={pi} src={src} alt="physique" style={{width:76,height:76,objectFit:"cover",borderRadius:10,border:`1px solid ${C.border}`}}/>
                  ))}
                </div>
              )}
              <div className="mbub">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div className="msg coach">
            <div className="mav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
            <div className="typing"><div className="tdot"/><div className="tdot"/><div className="tdot"/></div>
          </div>
        )}
      </div>

      {/* PENDING PHOTO STRIP */}
      {pending.length>0&&(
        <div className="photo-strip" style={{bottom:`calc(${inputBottom+62}px + env(safe-area-inset-bottom,0px))`}}>
          {pending.map(p=>(
            <div key={p.id} className="pthumb">
              <img src={p.dataUrl} alt="pending"/>
              <button className="pthumb-rm" onClick={()=>removePhoto(p.id)}>✕</button>
            </div>
          ))}
          <span style={{flexShrink:0,fontSize:11,color:C.accent,paddingLeft:6,whiteSpace:"nowrap"}}>
            {pending.length} photo{pending.length>1?"s":""} attached · send or type a message
          </span>
        </div>
      )}

      {/* INPUT BAR — calc adds env(safe-area-inset-bottom) for iPhone notch devices */}
      <div className="ci-area" style={{bottom:`calc(${inputBottom+stripHeight}px + env(safe-area-inset-bottom,0px))`}}>
        <input type="file" ref={fileRef} className="photo-input" accept="image/*" multiple onChange={handleFiles}/>
        <button className="ci-photo" onClick={()=>fileRef.current?.click()} title="Upload progress photo"
          style={{borderColor:pending.length>0?C.accent:undefined,color:pending.length>0?C.accent:undefined}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M16 7l-2-3H10L8 7"/></svg>
        </button>
        <textarea className="ci" placeholder={pending.length>0?"Add a message or just hit send...":"Ask your coach anything..."} value={input} rows={1}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}/>
        <button className="ci-send" onClick={()=>send()} disabled={(!input.trim()&&!pending.length)||loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── WEIGHT LOG STORAGE KEY ───────────────────────────────────────────────────
const WT_KEY = "apex_weight_log_v1";

// ─── 3D BODY WEIGHT GRAPH ─────────────────────────────────────────────────────
// Isometric-projection interactive canvas graph
// X=days, Y=weight, Z=7-day avg delta (rate of change tinted surface)

function WeightGraph3D({ logs, ceilingWeight, stageWeight }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ rotX: 28, rotY: -38, scale: 1, dragging: false, lastX: 0, lastY: 0, hovered: -1 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cc = getCanvasC(); // theme-aware canvas palette
    const hex2rgba = (hex, a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const cW = canvas.offsetWidth, cH = canvas.offsetHeight;

    const data = logs.slice(-30); // max 30 points
    if (data.length < 1) return;

    const weights = data.map(d => d.weight);
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const wRange = maxW - minW || 10;
    const n = data.length;

    // Compute 7-day rolling delta for Z (rate of change)
    const deltas = data.map((d, i) => {
      if (i < 1) return 0;
      const prev = data[Math.max(0, i - Math.min(i, 6))];
      return d.weight - prev.weight;
    });
    const maxAbsDelta = Math.max(...deltas.map(Math.abs), 0.1);

    function project(x, y, z) {
      // x: 0–1 along time axis, y: 0–1 height, z: 0–1 depth
      const s = stateRef.current;
      const rx = s.rotX * Math.PI / 180;
      const ry = s.rotY * Math.PI / 180;
      // Scale world coords
      const wx = (x - 0.5) * 220 * s.scale;
      const wy = (y - 0.5) * 120 * s.scale;
      const wz = (z - 0.5) * 80 * s.scale;
      // Rotate around Y then X
      const cx2 = wx * Math.cos(ry) + wz * Math.sin(ry);
      const cz2 = -wx * Math.sin(ry) + wz * Math.cos(ry);
      const cy2 = wy * Math.cos(rx) - cz2 * Math.sin(rx);
      const cz3 = wy * Math.sin(rx) + cz2 * Math.cos(rx);
      return { px: cW / 2 + cx2, py: cH / 2 - cy2 + cz3 * 0.3 };
    }

    function draw() {
      ctx.clearRect(0, 0, cW, cH);
      const s = stateRef.current;

      // Background — match card color
      ctx.fillStyle = cc.card || cc.bg; ctx.fillRect(0, 0, cW, cH);

      const gridY = 0.05;

      // ── AXES — thick, brutal ──
      const origin = project(0, gridY, 0);
      const axX = project(1, gridY, 0);
      const axY = project(0, 1, 0);
      const axZ = project(0, gridY, 1);

      // Base floor line (single clean baseline, not a full grid)
      ctx.beginPath(); ctx.moveTo(project(0,gridY,0).px, project(0,gridY,0).py);
      ctx.lineTo(project(1,gridY,0).px, project(1,gridY,0).py);
      ctx.strokeStyle = hex2rgba(cc.brutal||cc.accent, 0.5); ctx.lineWidth = 2; ctx.stroke();

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axX.px, axX.py);
      ctx.strokeStyle = hex2rgba(cc.brutal||cc.accent, 0.6); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.brutal||cc.accent, 1);
      ctx.font = `700 ${10 / s.scale}px 'DM Sans',sans-serif`;
      ctx.fillText("DAYS", axX.px + 6, axX.py + 4);

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axY.px, axY.py);
      ctx.strokeStyle = hex2rgba(cc.green, 0.7); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.green, 1);
      ctx.fillText("LBS", axY.px - 24, axY.py - 4);

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axZ.px, axZ.py);
      ctx.strokeStyle = hex2rgba(cc.brutal||cc.accent, 0.3); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.brutal||cc.accent, 0.6);
      ctx.fillText("ΔRATE", axZ.px + 4, axZ.py + 4);

      // ── CEILING & STAGE PLANES ──
      if (ceilingWeight && stageWeight) {
        const ceilNorm = (ceilingWeight - minW) / wRange;
        const stageNorm = (stageWeight - minW) / wRange;
        if (ceilNorm >= 0 && ceilNorm <= 1) {
          const c1 = project(0, ceilNorm, 0.5), c2 = project(1, ceilNorm, 0.5);
          ctx.beginPath(); ctx.moveTo(c1.px, c1.py); ctx.lineTo(c2.px, c2.py);
          ctx.setLineDash([4, 4]); ctx.strokeStyle = hex2rgba(cc.red, 0.5); ctx.lineWidth = 1.5; ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = hex2rgba(cc.red, 0.7); ctx.font = `${8 / s.scale}px Inter`;
          ctx.fillText(`! ${ceilingWeight}`, c2.px + 4, c2.py);
        }
        if (stageNorm >= 0 && stageNorm <= 1) {
          const s1 = project(0, stageNorm, 0.5), s2 = project(1, stageNorm, 0.5);
          ctx.beginPath(); ctx.moveTo(s1.px, s1.py); ctx.lineTo(s2.px, s2.py);
          ctx.setLineDash([3, 3]); ctx.strokeStyle = hex2rgba(cc.purple, 0.4); ctx.lineWidth = 1; ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = hex2rgba(cc.purple, 0.6); ctx.font = `${8 / s.scale}px Inter`;
          ctx.fillText(`STAGE ${stageWeight}`, s2.px + 4, s2.py);
        }
      }

      // ── DATA BARS ──
      data.forEach((d, i) => {
        const xf = n > 1 ? i / (n - 1) : 0.5;
        const yf = (d.weight - minW) / wRange;
        const delta = deltas[i];
        const zf = 0.5 + (delta / maxAbsDelta) * 0.3;
        const isHov = s.hovered === i;

        const top = project(xf, yf, zf);
        const bot = project(xf, gridY, zf);

        const nearCeiling = ceilingWeight && d.weight > ceilingWeight * 0.97;
        const baseColor = nearCeiling ? cc.red : delta > 0.3 ? cc.green : delta < -0.3 ? cc.blue : cc.accent;
        const barColor = hex2rgba(baseColor, isHov ? 1 : 0.65);

        // Thick brutalist bar
        ctx.beginPath(); ctx.moveTo(bot.px, bot.py); ctx.lineTo(top.px, top.py);
        ctx.strokeStyle = barColor; ctx.lineWidth = isHov ? 5 : 3; ctx.stroke();

        // Square cap (brutalist — no circles)
        const capSz = isHov ? 5 : 3;
        ctx.fillStyle = barColor;
        ctx.fillRect(top.px - capSz, top.py - capSz, capSz * 2, capSz * 2);

        if (isHov) {
          const label = `${d.weight} lbs`;
          const dateStr = d.date;
          ctx.font = `600 ${10 / s.scale}px 'DM Sans',sans-serif`;
          const lw = Math.max(ctx.measureText(label).width, ctx.measureText(dateStr).width) + 18;
          const lx = top.px - lw / 2, ly = top.py - 48;
          // Brutalist tooltip: hard offset shadow + border
          ctx.fillStyle = cc.brutal || cc.accent;
          ctx.fillRect(lx + 3, ly + 3, lw, 36);
          ctx.fillStyle = cc.card || cc.surface;
          ctx.fillRect(lx, ly, lw, 36);
          ctx.strokeStyle = cc.brutal || cc.accent; ctx.lineWidth = 2;
          ctx.strokeRect(lx, ly, lw, 36);
          ctx.fillStyle = cc.brutal || cc.accent;
          ctx.font = `700 ${10 / s.scale}px 'DM Sans',sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(label, top.px, ly + 15);
          ctx.fillStyle = cc.muted;
          ctx.font = `500 ${9 / s.scale}px 'DM Sans',sans-serif`;
          ctx.fillText(dateStr, top.px, ly + 29);
          ctx.textAlign = "left";
        }
      });

      // ── TREND LINE ──
      if (n > 1) {
        ctx.beginPath();
        data.forEach((d, i) => {
          const xf = i / (n - 1);
          const yf = (d.weight - minW) / wRange;
          const zf = 0.5 + (deltas[i] / maxAbsDelta) * 0.3;
          const pt = project(xf, yf, zf);
          i === 0 ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py);
        });
        ctx.strokeStyle = hex2rgba(cc.accent, 0.7); ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // ── Y AXIS TICK LABELS ──
      for (let t = 0; t <= 4; t++) {
        const tf = t / 4;
        const wVal = Math.round(minW + tf * wRange);
        const pt = project(0, tf, 0);
        ctx.fillStyle = hex2rgba(cc.muted, 0.9);
        ctx.font = `500 ${8 / s.scale}px 'DM Mono',monospace`;
        ctx.fillText(wVal, pt.px - 26, pt.py + 3);
      }
    }

    function getHitIndex(mx, my) {
      const dpr = window.devicePixelRatio;
      const data = logs.slice(-30);
      const n2 = data.length;
      const weights2 = data.map(d => d.weight);
      const minW2 = Math.min(...weights2) - 2;
      const maxW2 = Math.max(...weights2) + 2;
      const wRange2 = maxW2 - minW2 || 10;
      const deltas2 = data.map((d, i) => {
        if (i < 1) return 0;
        const prev = data[Math.max(0, i - Math.min(i, 6))];
        return d.weight - prev.weight;
      });
      const maxAbsDelta2 = Math.max(...deltas2.map(Math.abs), 0.1);
      for (let i = 0; i < n2; i++) {
        const xf = n2 > 1 ? i / (n2 - 1) : 0.5;
        const yf = (data[i].weight - minW2) / wRange2;
        const zf = 0.5 + (deltas2[i] / maxAbsDelta2) * 0.3;
        const pt = project(xf, yf, zf);
        const dx = pt.px - mx, dy = pt.py - my;
        if (Math.sqrt(dx * dx + dy * dy) < 14) return i;
      }
      return -1;
    }

    function loop() { draw(); animRef.current = requestAnimationFrame(loop); }
    loop();

    // Touch / Mouse handlers
    function onMouseDown(e) {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.dragging = true;
      stateRef.current.lastX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      stateRef.current.lastY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    }
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const my = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      if (stateRef.current.dragging) {
        stateRef.current.rotY += (mx - stateRef.current.lastX) * 0.5;
        stateRef.current.rotX -= (my - stateRef.current.lastY) * 0.4;
        stateRef.current.rotX = Math.max(-60, Math.min(80, stateRef.current.rotX));
        stateRef.current.lastX = mx; stateRef.current.lastY = my;
      } else {
        stateRef.current.hovered = getHitIndex(mx, my);
      }
    }
    function onMouseUp() { stateRef.current.dragging = false; }
    function onWheel(e) {
      e.preventDefault();
      stateRef.current.scale = Math.max(0.5, Math.min(2.5, stateRef.current.scale - e.deltaY * 0.002));
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onMouseDown, { passive: true });
    canvas.addEventListener("touchmove", onMouseMove, { passive: true });
    canvas.addEventListener("touchend", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onMouseDown);
      canvas.removeEventListener("touchmove", onMouseMove);
      canvas.removeEventListener("touchend", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [logs, ceilingWeight, stageWeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "220px", display: "block", cursor: "grab", touchAction: "none" }}
    />
  );
}

// ─── TIP — lightweight tap/hover tooltip for terminology ─────────────────────
function Tip({ label, children }) {
  const C = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", gap:3 }}>
      {children}
      <button type="button" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background:"none", border:`1px solid ${C.faint}`, borderRadius:"50%", width:12, height:12, fontSize:7, color:C.faint, cursor:"pointer", padding:0, lineHeight:1, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        ?
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }}/>
          <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", fontSize:11, color:C.muted, lineHeight:1.55, whiteSpace:"nowrap", zIndex:99, boxShadow:"var(--depth-shadow)", maxWidth:220, whiteSpace:"normal", textAlign:"left" }}>
            {label}
          </div>
        </>
      )}
    </span>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function AvatarMenu({ initial, onEditProfile }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [syncState, setSyncState] = useState(null); // null | "syncing" | "ok" | "fail"
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    setTimeout(() => window.addEventListener("click", close), 0);
    return () => window.removeEventListener("click", close);
  }, [open]);

  const handleForceSync = async (e) => {
    e.stopPropagation();
    setSyncState("syncing");
    const result = await window.storage.forceSync?.() ?? { ok: false, reason: "not available" };
    setSyncState(result.ok ? "ok" : "fail");
    setTimeout(() => setSyncState(null), 3000);
  };

  const itemStyle = {
    width:"100%", padding:"12px 16px", background:"none", border:"none",
    cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
    letterSpacing:1.5, color:"var(--text)", textAlign:"left", transition:"background .15s",
  };
  return (
    <div style={{position:"relative"}}>
      <div className="sh-avatar" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}>
        {initial}
      </div>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"var(--card)",border:"2px solid var(--brutal)",borderRadius:6,boxShadow:"4px 4px 0 var(--brutal)",overflow:"hidden",zIndex:500,minWidth:168}}>
          <button onClick={()=>{setOpen(false);onEditProfile?.();}}
            style={itemStyle}
            onMouseOver={e=>e.currentTarget.style.background="var(--up)"}
            onMouseOut={e=>e.currentTarget.style.background="none"}>
            EDIT PROFILE
          </button>
          <div style={{height:1,background:"var(--border)"}}/>
          <button onClick={handleForceSync}
            style={{...itemStyle, color: syncState==="ok" ? "var(--green)" : syncState==="fail" ? "var(--red)" : "var(--muted)", fontSize:13}}
            onMouseOver={e=>e.currentTarget.style.background="var(--up)"}
            onMouseOut={e=>e.currentTarget.style.background="none"}>
            {syncState==="syncing" ? "SYNCING..." : syncState==="ok" ? "✓ SYNCED" : syncState==="fail" ? "✕ SYNC FAILED" : "FORCE SYNC"}
          </button>
          <div style={{height:1,background:"var(--border)"}}/>
          <button onClick={signOut}
            style={{...itemStyle, color:"var(--muted)"}}
            onMouseOver={e=>e.currentTarget.style.background="var(--up)"}
            onMouseOut={e=>e.currentTarget.style.background="none"}>
            SIGN OUT
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardScreen({ user, weightLog, onLogWeight, onDeleteWeight, onEditWeight, onNavigate, onEditProfile, onGoalTransition }) {
  const C = useThemeColors();
  const [inputVal, setInputVal] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
  const [logReaction, setLogReaction] = useState(null); // {text, colorKey}
  const [tState, setTState] = useState(null);
  const [calTarget, setCalTarget] = useState(null);
  const [reboundData, setReboundData] = useState(null);
  const [pendingDeleteTs, setPendingDeleteTs] = useState(null);
  const [editingTs, setEditingTs] = useState(null);
  const [editingVal, setEditingVal] = useState("");
  const [savedTs, setSavedTs] = useState(null);
  // Algorithm engine state
  const [checkIn, setCheckIn] = useState(null);
  const [nutLogs, setNutLogs] = useState([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [ciSleep, setCiSleep] = useState("7");
  const [ciStress, setCiStress] = useState("5");
  const [ciEnergy, setCiEnergy] = useState("7");
  const [protocolData, setProtocolData] = useState(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [storedGoalConfig, setStoredGoalConfig] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [goalRevision, setGoalRevision] = useState(null);
  const [goalHistory, setGoalHistory] = useState([]);
  const [physiqueHistory, setPhysiqueHistory] = useState([]);
  const [showPhysiqueScan, setShowPhysiqueScan] = useState(false);
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideVal, setOverrideVal] = useState("");
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ text: null, ts: null, loading: false });
  const snapshotTriggerRef = useRef(-1);   // tracks sortedLog.length at last trigger
  const [gcExpanded, setGcExpanded] = useState(false);
  const [bfOverride, setBfOverride] = useState(null);
  const [showBfEditor, setShowBfEditor] = useState(false);
  const [bfTab, setBfTab] = useState("manual");
  const [bfInput, setBfInput] = useState("");
  const [bfPhotoStatus, setBfPhotoStatus] = useState("idle"); // idle | loading | done | error
  const fileInputRef = useRef(null);

  useEffect(() => {
    window.storage.get(BF_KEY).then(r => {
      if (r?.value) try { setBfOverride(parseFloat(r.value)); } catch {}
    }).catch(() => {});
    window.storage.get(TRAINING_KEY).then(r => {
      if (r?.value) try { setTState(JSON.parse(r.value)); } catch {}
    }).catch(() => {});
    window.storage.get("apex_rebound_v3").then(r => {
      if (r?.value) try { setReboundData(JSON.parse(r.value)?.protocol || null); } catch {}
    }).catch(() => {});
    window.storage.get(NUTRITION_KEY).then(r => {
      if (r?.value) try {
        const parsed = JSON.parse(r.value);
        // Nutrition state is stored as { logs: [...], mode: "..." } — extract just the logs array
        setNutLogs(Array.isArray(parsed) ? parsed : (parsed?.logs || []));
      } catch {}
    }).catch(() => {});
    // Load latest check-in
    window.storage.get(CHECKIN_KEY).then(r => {
      if (r?.value) {
        try {
          const checkins = JSON.parse(r.value);
          if (checkins?.length) {
            const latest = checkins[checkins.length - 1];
            setCheckIn(latest);
            // Prompt for new check-in if > 6 days old
            const age = (Date.now() - latest.ts) / 86400000;
            if (age > 6) setShowCheckIn(true);
          } else {
            setShowCheckIn(true); // First time
          }
        } catch {}
      } else {
        setShowCheckIn(true); // No check-ins yet
      }
    }).catch(() => {});
    window.storage.get(PROTOCOL_KEY).then(r => {
      if (r?.value) try { setProtocolData(JSON.parse(r.value)); } catch {}
    }).catch(() => {});
    window.storage.get(GOAL_CONFIG_KEY).then(r => {
      if (r?.value) try { setStoredGoalConfig(JSON.parse(r.value)); } catch {}
    }).catch(() => {});
    window.storage.get(SNAPSHOTS_KEY).then(r => {
      if (r?.value) try { setSnapshots(JSON.parse(r.value) || []); } catch {}
    }).catch(() => {});
    window.storage.get(GOAL_HISTORY_KEY).then(r => {
      if (r?.value) try { setGoalHistory(JSON.parse(r.value) || []); } catch {}
    }).catch(() => {});
    window.storage.get(PHYSIQUE_KEY).then(r => {
      if (r?.value) try { setPhysiqueHistory(JSON.parse(r.value) || []); } catch {}
    }).catch(() => {});
  }, []);

  // ── WEEKLY DIGEST TRIGGER ─────────────────────────────────────────────────
  // Checks once per app load: if 7+ days since last digest and enough snapshot
  // data exists, computes a summary and saves to WEEKLY_DIGEST_KEY for Coach injection
  useEffect(() => {
    if (snapshots.length < 2 || !goalConfig) return;
    window.storage.get(WEEKLY_DIGEST_KEY).then(r => {
      try {
        const stored   = r?.value ? JSON.parse(r.value) : null;
        const lastTs   = stored?.ts || 0;
        const daysSince = Math.floor((Date.now() - lastTs) / 86400000);
        if (daysSince < 7) return;  // not time yet
        const text = computeWeeklyDigest(user, goalConfig, snapshots, weightTrend);
        if (!text) return;
        const entry = { text, ts: Date.now(), read: false };
        window.storage.set(WEEKLY_DIGEST_KEY, JSON.stringify(entry)).catch(() => {});
      } catch {}
    }).catch(() => {});
  }, [snapshots.length]);  // goalConfig?.id removed — caused TDZ in esbuild output (see commit)

  // Recompute calTarget whenever dependencies stabilise
  useEffect(() => {
    // Inject today's training date hint so getTargets() can set isTrainDay correctly
    const todayKey = new Date().toDateString();
    const trainDates = (tState?.history || []).map(s => new Date(s.ts).toDateString());
    const annotatedLog = Object.assign([...weightLog], { __trainDates: trainDates });
    const sessionToday = trainDates.includes(todayKey);
    annotatedLog.__trainDates = trainDates;
    getTargets(user, annotatedLog, checkIn).then(t => {
      // Override isTrainDay with live session state
      setCalTarget({ ...t, isTrainDay: sessionToday });
    }).catch(() => {});
  }, [user, weightLog, checkIn, tState]);

  const sortedLog = [...weightLog].sort((a, b) => a.ts - b.ts);
  const currentWeight = sortedLog.length > 0 ? sortedLog[sortedLog.length-1].weight : parseFloat(user.weight) || 0;
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = sortedLog.filter(e => e.ts >= weekAgo);
  const oldEntries = sortedLog.filter(e => e.ts < weekAgo);
  let weeklyChange = null;
  if (recentEntries.length > 0 && oldEntries.length > 0) {
    weeklyChange = (currentWeight - oldEntries[oldEntries.length - 1].weight).toFixed(1);
  } else if (sortedLog.length >= 2) {
    weeklyChange = (sortedLog[sortedLog.length - 1].weight - sortedLog[sortedLog.length - 2].weight).toFixed(1);
  }

  // Streak: consecutive days with logged sessions
  const history = tState?.history || [];
  const streak = (() => {
    if (!history.length) return 0;
    const toKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
    const sessionDays = [...new Set(history.map(s => toKey(s.ts)))].sort((a,b) => b > a ? 1 : -1);
    let count = 0;
    const today = new Date();
    for (let i = 0; i < sessionDays.length; i++) {
      const [y,m,d] = sessionDays[i].split("-").map(Number);
      const diff = Math.round((today - new Date(y,m,d)) / 86400000);
      if (diff <= i + 1) count++; else break;
    }
    return count;
  })();

  const splitDef = tState?.split ? SPLITS[tState.split] : null;

  // Last 7 days for streak dots
  const last7Days = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const done = history.some(s => { const sd = new Date(s.ts); return `${sd.getFullYear()}-${sd.getMonth()}-${sd.getDate()}`===key; });
    const labels = ["M","T","W","T","F","S","S"];
    return { label: labels[d.getDay()===0?6:d.getDay()-1], done };
  });

  const handleLog = () => {
    const w = parseFloat(inputVal);
    if (!w || w < 50 || w > 500) return;
    onLogWeight(w);
    setInputVal("");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);

    // Post-log reaction — brief contextual insight
    const newLog = [...sortedLog, { weight: w, ts: Date.now(), date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}) }];
    const newStreak  = computeWeighInStreak(newLog);
    const newPacing  = computeGoalPacing(newLog, user);
    let text = null, colorKey = "green";

    if      (newStreak.current === 30) { text = "30-day streak. Elite consistency."; colorKey = "green"; }
    else if (newStreak.current === 14) { text = "14-day streak — habit locked in."; colorKey = "green"; }
    else if (newStreak.current === 7)  { text = "7-day streak. This is how progress is built."; colorKey = "green"; }
    else if (newPacing.status === "on_track") {
      text = `Trending ${newPacing.rate > 0 ? "+" : ""}${newPacing.rate.toFixed(1)} lbs/wk — right on pace.`;
      colorKey = "green";
    } else if (newPacing.status === "ahead" && (user.goal === "cut" || user.goal === "contest")) {
      text = `Dropping fast at ${Math.abs(newPacing.rate).toFixed(1)} lbs/wk. Monitor recovery.`;
      colorKey = "accent";
    } else if (newPacing.status === "ahead") {
      text = `Gaining ${newPacing.rate.toFixed(1)} lbs/wk — slightly above target. Watch quality.`;
      colorKey = "accent";
    } else if (newPacing.status === "behind") {
      const lever = user.goal === "bulk" ? "surplus" : "deficit";
      text = `Rate: ${Math.abs(newPacing.rate).toFixed(1)} lbs/wk. Tighten your ${lever} to hit pace.`;
      colorKey = "red";
    } else if (newPacing.status === "off_course") {
      text = "Trend not moving. Check nutrition targets and adherence.";
      colorKey = "red";
    } else if (newPacing.etaWeeks && newPacing.nextMilestone !== null) {
      const sign = newPacing.dir > 0 ? "+" : "";
      text = `Next milestone: ${sign}${newPacing.nextMilestone} lbs — ~${newPacing.etaWeeks} wks at this rate.`;
      colorKey = "accent";
    } else if (newLog.length <= 3) {
      text = "Keep logging — trends unlock after 3 weigh-ins.";
      colorKey = "muted";
    }

    if (text) {
      setLogReaction({ text, colorKey });
      setTimeout(() => setLogReaction(null), 5000);
    }
  };

  // Mini sparkline: last 7 logged weights for the hero bar chart
  const recentWeights = sortedLog.slice(-7);
  const maxW = recentWeights.length ? Math.max(...recentWeights.map(e => e.weight)) : 0;
  const minW = recentWeights.length ? Math.min(...recentWeights.map(e => e.weight)) : 0;
  const wRange = maxW - minW || 1;

  const changeVal = weeklyChange !== null ? parseFloat(weeklyChange) : null;
  const changeClass = changeVal === null ? "" : changeVal > 0 ? "pos" : changeVal < 0 ? "neg" : "flat";
  const changeLabel = changeVal === null ? null : `${changeVal > 0 ? "+" : ""}${weeklyChange} this period`;

  // ── ALGORITHM ENGINE — computed values for Protocol Intelligence panel ──────
  const userState       = computeUserState(user, sortedLog, checkIn);
  const weightTrend     = analyzeWeightTrend(sortedLog);
  const weighInStreak   = computeWeighInStreak(sortedLog);
  const goalPacing      = computeGoalPacing(sortedLog, user);
  // Use stored config if it matches current goal; otherwise recompute live
  const goalConfig = useMemo(() => {
    if (storedGoalConfig && storedGoalConfig.goalType === user.goal) return storedGoalConfig;
    return computeGoalConfig(user);
  }, [storedGoalConfig, user]);
  // Latest snapshot for live ETA and delta display
  const latestSnapshot = snapshots.length ? snapshots[snapshots.length - 1] : null;

  // Hero arc — pre-compute outside goal card IIFE so it's available in the weight hero
  const heroGoalDir = goalConfig && !goalConfig.isDualTarget
    ? Math.sign(goalConfig.effectiveGoalWeight - goalConfig.startWeight) : 0;
  const heroPct = goalConfig && heroGoalDir !== 0 && goalConfig.startWeight !== goalConfig.effectiveGoalWeight
    ? Math.min(100, Math.max(0,
        heroGoalDir * (currentWeight - goalConfig.startWeight) /
        Math.abs(goalConfig.effectiveGoalWeight - goalConfig.startWeight) * 100
      ))
    : 0;

  // Save physique scan result → update bfOverride + append to history
  const handlePhysiqueSave = (result) => {
    if (!result?.estimatedBfPct) return;
    // Update BF% override
    setBfOverride(result.estimatedBfPct);
    window.storage.set(BF_KEY, String(result.estimatedBfPct)).catch(() => {});
    // Append to physique history (photos not stored — analysis only)
    const entry = {
      id: String(Date.now()), ts: Date.now(),
      weight: currentWeight,
      ...result,
    };
    const updated = [entry, ...physiqueHistory].slice(0, 24); // keep 2 years max
    setPhysiqueHistory(updated);
    window.storage.set(PHYSIQUE_KEY, JSON.stringify(updated)).catch(() => {});
    // Recompute goal config with new BF% if user allows
    const updatedUser = { ...user };
    const newGc = computeGoalConfig(updatedUser);
    window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(newGc)).catch(() => {});
    setStoredGoalConfig(newGc);
  };

  const handleGenerateReport = async () => {
    if (!goalConfig) return;
    setReportData({ text: null, ts: null, loading: true });
    setShowReport(true);
    try {
      const text = await generateIntelligenceReport(user, goalConfig, snapshots, weightTrend, goalPacing);
      setReportData({ text, ts: Date.now(), loading: false });
    } catch {
      setReportData({ text: null, ts: Date.now(), loading: false });
    }
  };

  // ── SNAPSHOT TRIGGER ──────────────────────────────────────────────────────
  // Fires whenever a new weight entry is added; checks throttle + saves snapshot
  useEffect(() => {
    if (sortedLog.length < 3 || !goalConfig) return;
    if (sortedLog.length === snapshotTriggerRef.current) return;   // already processed

    window.storage.get(SNAPSHOTS_KEY).then(r => {
      const existing = r?.value ? (JSON.parse(r.value) || []) : [];
      snapshotTriggerRef.current = sortedLog.length;               // mark as processed

      if (!shouldTakeSnapshot(sortedLog, existing)) return;

      const snap     = computeProgressSnapshot(user, sortedLog, goalConfig, nutLogs, history);
      const revision = evaluateGoalRevision(snap, goalConfig, [...existing, snap]);

      if (revision?.suggested) {
        snap.goalRevisionSuggested = true;
        snap.revisionReason  = revision.reason;
        snap.revisionTrigger = revision.trigger;
        setGoalRevision(revision);
      }

      const updated = [...existing, snap].slice(-52);  // keep ~1 year of weekly snaps
      setSnapshots(updated);
      window.storage.set(SNAPSHOTS_KEY, JSON.stringify(updated)).catch(() => {});
    }).catch(() => {});
  }, [sortedLog.length]);   // eslint-disable-line react-hooks/exhaustive-deps
  const confidenceScore = computeConfidenceScore(sortedLog, history, nutLogs);

  // Override body comp display if user has set a manual BF%
  const displayComp = bfOverride != null ? (() => {
    const lbmLbs = Math.round(currentWeight * (1 - bfOverride / 100) * 10) / 10;
    return { ...userState.bodyComp, bfPct: bfOverride, lbmLbs };
  })() : userState.bodyComp;
  const fatigueDebt     = computeFatigueDebt(history);
  const adaptationSig   = tState?.adaptation?.signal || "neutral";
  const protocolDecision = runProtocolDecision({
    user, userState, weightTrend,
    confidenceScore, fatigueDebt,
    adaptationSignal: adaptationSig,
    nutLogs, trainingHistory: history,
  });
  const strengthTrends  = analyzeStrengthTrend(history);
  // Top 3 improving/declining lifts
  const topLifts = Object.entries(strengthTrends)
    .filter(([, t]) => t.sessions >= 2)
    .sort((a, b) => Math.abs(b[1].slope) - Math.abs(a[1].slope))
    .slice(0, 3);

  // Goal-nutrition bridge: goal-anchored adjustment when data quality is sufficient,
  // otherwise fall back to runProtocolDecision's classification-based value.
  const goalCalAdj = computeNutritionAdjustment(goalConfig, weightTrend);
  const activeCalAdj = goalCalAdj !== 0 ? goalCalAdj : protocolDecision.calAdjustment;

  useEffect(() => {
    if (activeCalAdj !== 0) {
      window.storage.set(PROTOCOL_KEY, JSON.stringify({
        calAdjustment: activeCalAdj,
        goalAnchored:  goalCalAdj !== 0,
        ts:            Date.now(),
      })).catch(() => {});
    }
  }, [activeCalAdj]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCheckIn = () => {
    const ci = { ts: Date.now(), sleep: parseFloat(ciSleep) || 7, stress: parseFloat(ciStress) || 5, energy: parseFloat(ciEnergy) || 7 };
    window.storage.get(CHECKIN_KEY).then(r => {
      const existing = r?.value ? JSON.parse(r.value) : [];
      const updated = [...existing, ci].slice(-52); // keep 1 year
      window.storage.set(CHECKIN_KEY, JSON.stringify(updated)).catch(() => {});
    }).catch(() => {});
    setCheckIn(ci);
    setShowCheckIn(false);
  };

  const saveBfManual = () => {
    const val = parseFloat(bfInput);
    if (!val || val < 4 || val > 45) return;
    setBfOverride(val);
    window.storage.set(BF_KEY, String(val)).catch(() => {});
    setShowBfEditor(false);
    setBfInput("");
  };

  const analyzeBfPhoto = async (file) => {
    if (!file) return;
    setBfPhotoStatus("loading");
    try {
      const toBase64 = f => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const b64 = await toBase64(file);
      const mime = file.type || "image/jpeg";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 64,
          system: "You are a body composition analyst. Given a physique photo, estimate body fat percentage. Reply with ONLY a single integer (e.g. 15). No text, no symbols, just the number.",
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mime, data: b64 } },
            { type: "text", text: `Estimate body fat % for this person. Their stats: ${user.sex || "male"}, ${user.age || "?"} years old, ${currentWeight} lbs, ${user.height || "?"} inches. Reply with ONE number only.` },
          ]}],
        }),
      });
      const data = await res.json();
      const raw = data?.content?.[0]?.text?.trim() || "";
      const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
      if (num >= 4 && num <= 45) {
        setBfOverride(num);
        window.storage.set(BF_KEY, String(num)).catch(() => {});
        setBfPhotoStatus("done");
        setTimeout(() => { setShowBfEditor(false); setBfPhotoStatus("idle"); }, 1200);
      } else {
        setBfPhotoStatus("error");
      }
    } catch {
      setBfPhotoStatus("error");
    }
  };

  const clearBfOverride = () => {
    setBfOverride(null);
    window.storage.set(BF_KEY, "").catch(() => {});
    setShowBfEditor(false);
  };

  const DECISION_COLOR = { red: C.red, green: C.green, accent: C.accent, muted: C.muted };
  const PRIORITY_LABEL = { P0: "CRITICAL", P1: "ADJUST", P2: "NOTE", info: "ON TRACK" };

  return (
    <div className="screen">
      {/* HEADER */}
      {showPhysiqueScan && (
        <PhysiqueCheckInModal
          user={user} currentWeight={currentWeight}
          onSave={handlePhysiqueSave}
          onClose={() => setShowPhysiqueScan(false)}
        />
      )}
      {showReport && (
        <IntelligenceReportModal
          text={reportData.text} loading={reportData.loading} ts={reportData.ts}
          onClose={()=>setShowReport(false)}
          onOpenCoach={()=>{ setShowReport(false); onNavigate("coach"); }}
        />
      )}

      <div className="sh">
        <div>
          <div className="sh-greeting">{(()=>{const h=new Date().getHours();return h<11?"Good morning,":h<17?"Good afternoon,":h<21?"Good evening,":"Hey,"})()}</div>
          <div className="sh-title">{user.name.toUpperCase()}</div>
        </div>
        <AvatarMenu initial={user.name[0].toUpperCase()} onEditProfile={onEditProfile}/>
      </div>

      {/* BODY WEIGHT — DOMINANT HERO BLOCK */}
      <div className={`wt-hero${inputFocused?" focused":""}${justLogged?" logged":""}`}>
        <div className="wt-hero-top">
          <div style={{flex:1}}>
            {/* Header row: label + streak pill */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
              <div className="wt-label">Body Weight</div>
              {/* Streak / urgency pill */}
              {(weighInStreak.current > 0 || weighInStreak.urgency !== "none") && (() => {
                const { current, urgency, lastDaysAgo, loggedToday } = weighInStreak;
                if (urgency === "danger") return (
                  <div className="streak-pill danger">! {lastDaysAgo}d since last log</div>
                );
                if (urgency === "warn") return (
                  <div className="streak-pill warn">→ Log today</div>
                );
                if (urgency === "nudge") return (
                  <div className="streak-pill nudge">● Log today</div>
                );
                if (current >= 7) return (
                  <div className="streak-pill ok">▲ {current}-day streak</div>
                );
                if (current > 0) return (
                  <div className="streak-pill ok">✓ {current}-day streak</div>
                );
                return null;
              })()}
            </div>

            {/* Weight number + change */}
            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <div className={`wt-number${justLogged?" saved":""}`}>{currentWeight || "—"}</div>
              {currentWeight ? <span className="wt-unit">lbs</span> : null}
            </div>
            {changeLabel && (
              <div className={`wt-change ${changeClass}`}>
                {changeVal > 0 ? "↑" : changeVal < 0 ? "↓" : "→"} {changeLabel}
              </div>
            )}

            {/* Goal pacing card — replaces old goal-rate block */}
            {goalPacing.status !== "insufficient_data" && (() => {
              const { statusLabel, colorKey, rate, paceBarPct, info, totalChange, etaWeeks, nextMilestone, dir } = goalPacing;
              const color = `var(--${colorKey})`;
              const rateStr = rate === 0 ? "0.0" : (rate > 0 ? `+${rate.toFixed(1)}` : rate.toFixed(1));
              const targetStr = info.dir === 0 ? "±0.25" : `${info.min > 0?"+":""}${info.min} to ${info.max > 0?"+":""}${info.max}`;
              return (
                <div className="pace-card">
                  <div className="pace-top">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="pace-badge" style={{background:`color-mix(in srgb,${color} 14%,transparent)`,color,border:`1px solid color-mix(in srgb,${color} 30%,transparent)`}}>
                        {statusLabel}
                      </div>
                      {totalChange !== 0 && (
                        <div style={{fontSize:10,color:"var(--faint)"}}>
                          {totalChange > 0 ? "+" : ""}{totalChange} lbs total
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="pace-rate-num" style={{color}}>{rateStr}</span>
                      <span style={{fontSize:10,color:"var(--muted)",marginLeft:3}}>lbs/wk</span>
                    </div>
                  </div>
                  <div className="pace-bar-track">
                    <div className="pace-bar-fill" style={{width:`${Math.min(100, paceBarPct)}%`,background:color}}/>
                  </div>
                  <div className="pace-foot">
                    <div style={{fontSize:10,color:"var(--faint)"}}>Target {targetStr} lbs/wk</div>
                    {goalPacing.forecast7d && (
                      <div style={{fontSize:10,color:"var(--faint)"}}>7d forecast: {goalPacing.forecast7d} lbs</div>
                    )}
                  </div>
                  {etaWeeks !== null && nextMilestone !== null && (
                    <div className="pace-milestone">
                      <div style={{fontSize:10,color:"var(--muted)"}}>
                        Next milestone: <span style={{color:"var(--text)",fontWeight:700}}>{dir > 0 ? "+" : ""}{nextMilestone} lbs</span>
                      </div>
                      <div style={{fontSize:11,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,color:"var(--accent)"}}>
                        ~{etaWeeks} WKS
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Goal Arc — instrument panel replacing flat sparkline bars */}
          {goalConfig && !goalConfig.isDualTarget ? (() => {
            // Half-circle arc: M 8 62 A 50 50 0 0 1 108 62  arcLen ≈ π×50 = 157
            const arcLen = 157;
            const fill   = (heroPct / 100) * arcLen;
            const accentCol = goalPacing.colorKey === "green" ? "var(--green)"
                            : goalPacing.colorKey === "red"   ? "var(--red)"
                            : "var(--accent)";
            return (
              <svg viewBox="0 0 116 72" width={108} height={66}
                style={{flexShrink:0, alignSelf:"flex-start", marginTop:8, overflow:"visible"}}>
                {/* Track */}
                <path d="M 8 62 A 50 50 0 0 1 108 62" fill="none" stroke="var(--up)" strokeWidth="7" strokeLinecap="round"/>
                {/* Progress fill — no glow, color carries the status signal */}
                <path d="M 8 62 A 50 50 0 0 1 108 62" fill="none" stroke={accentCol} strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${fill.toFixed(1)} ${arcLen}`}
                  style={{transition:"stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)"}}
                />
                {/* Percent label */}
                <text x="58" y="44" textAnchor="middle" fontSize="15" fontFamily="Bebas Neue,sans-serif" letterSpacing="1" fill={accentCol}>
                  {Math.round(heroPct)}%
                </text>
                <text x="58" y="54" textAnchor="middle" fontSize="8" fontFamily="DM Sans,sans-serif" fill="var(--muted)">to goal</text>
                {/* Start / goal labels — bumped to 9px for readability */}
                <text x="4" y="72" textAnchor="start" fontSize="9" fontFamily="DM Mono,monospace" fill="var(--faint)">{Math.round(goalConfig.startWeight)}</text>
                <text x="112" y="72" textAnchor="end" fontSize="9" fontFamily="DM Mono,monospace" fill="var(--faint)">{Math.round(goalConfig.effectiveGoalWeight)}</text>
              </svg>
            );
          })() : recentWeights.length >= 2 && (
            <div className="wt-history" style={{alignSelf:"flex-start",marginTop:28}}>
              {recentWeights.map((e, i) => {
                const h = Math.max(6, Math.round(((e.weight - minW) / wRange) * 32) + 4);
                const isLatest = i === recentWeights.length - 1;
                return (
                  <div key={e.ts} className="wt-bar-wrap">
                    <div className="wt-bar" style={{height:h, background:isLatest?"var(--accent)":"var(--faint)", opacity:isLatest?1:0.45}}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log input — inline in hero */}
        <div style={{position:"relative",display:"flex",gap:8}}>
          <div style={{flex:1,position:"relative"}}>
            <input
              type="number" step="0.1"
              placeholder={currentWeight ? `${currentWeight}` : "185.0"}
              value={inputVal}
              onChange={e=>setInputVal(e.target.value)}
              onFocus={()=>setInputFocused(true)}
              onBlur={()=>setInputFocused(false)}
              onKeyDown={e=>e.key==="Enter"&&handleLog()}
              className="wt-input"
            />
            <span className="wt-input-unit">lbs</span>
          </div>
          <CubeButton
            onClick={handleLog}
            disabled={!inputVal || parseFloat(inputVal) < 50}
            saved={justLogged}
          >
            {justLogged ? "SAVED" : "LOG"}
          </CubeButton>
        </div>
        {inputVal && parseFloat(inputVal) < 50 && (
          <div style={{fontSize:11,color:"var(--red)",marginTop:6,paddingLeft:2}}>Enter a valid weight (50 – 500 lbs)</div>
        )}

        {/* Post-log reaction */}
        {logReaction && (
          <div className="log-reaction" style={{
            background:`color-mix(in srgb,var(--${logReaction.colorKey}) 10%,transparent)`,
            border:`1px solid color-mix(in srgb,var(--${logReaction.colorKey}) 25%,transparent)`,
            color:`var(--${logReaction.colorKey})`
          }}>
            {logReaction.text}
          </div>
        )}

        {/* Recent entries */}
        {sortedLog.length === 0 && (
          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)",fontSize:11,color:"var(--muted)",lineHeight:1.6}}>
            Log your weight daily — even approximate numbers build trend data. Consistency matters more than precision.
          </div>
        )}
        {sortedLog.length > 0 && (
          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:5}}>
            {sortedLog.slice(-4).reverse().map((e,i,arr)=>{
              const change = i < arr.length-1 ? (e.weight - arr[i+1]?.weight).toFixed(1) : null;
              const isPendingDelete = pendingDeleteTs === e.ts;
              const isEditing = editingTs === e.ts;
              return (
                <div key={e.ts}>
                  {isEditing ? (
                    <div style={{display:"flex",alignItems:"center",gap:8,animation:"slideUp .18s ease-out"}}>
                      <span style={{fontSize:11,color:"var(--muted)",flexShrink:0}}>{e.date}</span>
                      <input
                        type="number"
                        value={editingVal}
                        onChange={ev=>setEditingVal(ev.target.value)}
                        onKeyDown={ev=>{
                          if(ev.key==="Enter"){const w=parseFloat(editingVal);if(w>=50&&w<=500){onEditWeight(e.ts,w);setEditingTs(null);setSavedTs(e.ts);setTimeout(()=>setSavedTs(null),1800);}}
                          if(ev.key==="Escape"){setEditingTs(null);}
                        }}
                        autoFocus
                        style={{flex:1,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,background:"var(--up)",border:"1px solid var(--accent)",borderRadius:6,color:"var(--text)",padding:"3px 8px",textAlign:"right",width:0}}
                      />
                      <span style={{fontSize:11,color:"var(--muted)"}}>lbs</span>
                      <button onClick={()=>{const w=parseFloat(editingVal);if(w>=50&&w<=500){onEditWeight(e.ts,w);setEditingTs(null);setSavedTs(e.ts);setTimeout(()=>setSavedTs(null),1800);}}}
                        style={{fontSize:11,padding:"3px 10px",background:"var(--accent)",border:"none",borderRadius:6,color:"#000",cursor:"pointer",fontWeight:700,flexShrink:0}}>Save</button>
                      <button onClick={()=>setEditingTs(null)}
                        style={{background:"none",border:"none",color:"var(--faint)",fontSize:11,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0}}>✕</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,color:"var(--muted)",fontVariantNumeric:"tabular-nums"}}>{e.date}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {change !== null && (() => {
                          const n = parseFloat(change);
                          const goal = user?.goal;
                          // Toward goal = green, away = red, maintain/neutral = muted
                          const losingIsGood = goal === "cut" || goal === "contest";
                          const gainingIsGood = goal === "bulk";
                          const changeCol = n === 0 ? "var(--muted)"
                            : (losingIsGood && n < 0) || (gainingIsGood && n > 0) ? "var(--green)"
                            : (losingIsGood && n > 0) || (gainingIsGood && n < 0) ? "var(--red)"
                            : "var(--accent)";
                          return (
                            <span style={{fontSize:10,color:changeCol}}>
                              {n>0?"+":""}{change}
                            </span>
                          );
                        })()}
                        <span
                          onClick={()=>{setPendingDeleteTs(null);setEditingTs(e.ts);setEditingVal(String(e.weight));}}
                          style={{display:"flex",alignItems:"center",gap:4,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:savedTs===e.ts?"var(--green)":i===0?"var(--accent)":"var(--text)",cursor:"pointer",transition:"color .35s"}}
                        >
                          {savedTs===e.ts?"✓":e.weight}
                          {savedTs!==e.ts&&<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11,opacity:.45}}><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>}
                        </span>
                        <button onClick={()=>setPendingDeleteTs(isPendingDelete?null:e.ts)}
                          style={{background:"none",border:"none",color:"var(--faint)",fontSize:11,cursor:"pointer",padding:"0 2px",lineHeight:1}}>✕</button>
                      </div>
                    </div>
                  )}
                  {!isEditing && isPendingDelete && (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,padding:"8px 10px",background:"var(--up)",borderRadius:8,animation:"slideUp .2s ease-out"}}>
                      <span style={{fontSize:11,color:"var(--muted)"}}>Remove {e.date} entry?</span>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setPendingDeleteTs(null)}
                          style={{fontSize:11,padding:"3px 10px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,color:"var(--muted)",cursor:"pointer"}}>Cancel</button>
                        <button onClick={()=>{onDeleteWeight(e.ts);setPendingDeleteTs(null);}}
                          style={{fontSize:11,padding:"3px 10px",background:"var(--red)",border:"none",borderRadius:6,color:"#FFF",cursor:"pointer",fontWeight:600}}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GOAL CONFIG CARD — Phase 2: live delta, progress bar, revision banner */}
      {goalConfig && (() => {
        const totalDelta   = Math.abs(goalConfig.effectiveGoalWeight - goalConfig.startWeight);
        const rawDelta     = latestSnapshot?.deltaFromStart ?? (currentWeight ? currentWeight - goalConfig.startWeight : 0);
        const goalDir      = goalConfig.isDualTarget ? 0 : Math.sign(goalConfig.effectiveGoalWeight - goalConfig.startWeight);
        // Progress: how far along toward the goal (0-100)
        const progressPct  = totalDelta > 0
          ? Math.min(100, Math.max(0, (goalDir * rawDelta / totalDelta) * 100))
          : 0;
        const liveEta      = latestSnapshot?.etaWeeks ?? goalConfig.etaWeeks;
        const liveEtaChanged = latestSnapshot?.etaWeeks && latestSnapshot.etaWeeks !== goalConfig.etaWeeks;
        const s            = goalConfig.sustainabilityScore;
        const ratingCol    = s >= 75 ? "var(--green)" : s >= 50 ? "var(--accent)" : "var(--red)";
        const rateAlertCol = { too_fast:"var(--accent)", too_slow:"var(--red)", off_course:"var(--red)" };

        // ── Goal completion state ──────────────────────────────────────────
        const remaining   = goalConfig.isDualTarget ? null
          : Math.abs(currentWeight - goalConfig.effectiveGoalWeight);
        const overshoot   = !goalConfig.isDualTarget && goalDir !== 0
          && goalDir * (currentWeight - goalConfig.effectiveGoalWeight) > 1.5;
        const completionState = goalConfig.isDualTarget || !currentWeight ? "active"
          : overshoot                  ? "exceeded"
          : remaining !== null && remaining <= 1.5 ? "reached"
          : remaining !== null && remaining <= 4   ? "approaching"
          : "active";
        const completionBorderCol = completionState === "reached"  ? "var(--green)"
          : completionState === "approaching" ? "#FBBF24"
          : completionState === "exceeded"    ? "var(--accent)"
          : "var(--border)";

        return (
          <div style={{margin:"0 24px 20px",background:"var(--surface)",border:`1px solid ${completionBorderCol}`,borderRadius:16,overflow:"hidden",transition:"border-color .4s",boxShadow:"var(--depth-shadow), var(--inner-light)",animation: completionState==="reached" ? "greenPulse 3s ease-in-out infinite" : completionState==="approaching" ? "chargePulse 4s ease-in-out infinite" : "none"}}>

            {/* Header: goal weight + sustainability badge */}
            <div style={{padding:"14px 16px 10px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",marginBottom:2,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color: completionState==="reached" ? "var(--green)" : completionState==="approaching" ? "#FBBF24" : "var(--accent)"}}>●</span>
                  <span style={{color:"var(--accent)"}}>Physique Target</span>
                  {completionState === "approaching" && <span style={{color:"#FBBF24",fontSize:8}}>APPROACHING</span>}
                  {completionState === "reached"     && <span style={{color:"var(--green)",fontSize:8}}>GOAL REACHED</span>}
                  {completionState === "exceeded"    && <span style={{color:"var(--accent)",fontSize:8}}>OVERSHOT</span>}
                </div>
                {showOverrideInput ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                    <input type="number" step="0.5" autoFocus
                      value={overrideVal}
                      onChange={e => setOverrideVal(e.target.value)}
                      placeholder={String(goalConfig.effectiveGoalWeight)}
                      style={{width:90,background:"var(--up)",border:"1px solid var(--accent)",borderRadius:6,padding:"6px 10px",color:"var(--text)",fontSize:15,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,outline:"none"}}/>
                    <span style={{fontSize:11,color:"var(--muted)"}}>lbs</span>
                    <button onClick={() => {
                      const w = parseFloat(overrideVal);
                      if (!w || w < 80 || w > 400) return;
                      const updated = { ...goalConfig, userOverrideWeight: w, effectiveGoalWeight: w, updatedAt: Date.now() };
                      window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(updated)).catch(()=>{});
                      setStoredGoalConfig(updated);
                      setShowOverrideInput(false); setOverrideVal("");
                    }} style={{padding:"5px 10px",background:"var(--accent)",color:"#080A0C",border:"none",borderRadius:6,fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:1,cursor:"pointer"}}>
                      SET
                    </button>
                    <button onClick={() => { setShowOverrideInput(false); setOverrideVal(""); }}
                      style={{background:"none",border:"none",color:"var(--muted)",fontSize:14,cursor:"pointer",padding:"0 2px"}}>✕</button>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:1,color:"var(--text)"}}>
                      {goalConfig.isDualTarget ? "COMPOSITION SHIFT" : `${goalConfig.effectiveGoalWeight} LBS`}
                    </div>
                    {!goalConfig.isDualTarget && (
                      <button onClick={() => { setOverrideVal(String(goalConfig.effectiveGoalWeight)); setShowOverrideInput(true); }}
                        style={{background:"none",border:"none",color:"var(--faint)",fontSize:10,cursor:"pointer",padding:0,letterSpacing:.5,textDecoration:"underline",textUnderlineOffset:2,fontFamily:"'DM Sans',sans-serif"}}>
                        {goalConfig.userOverrideWeight ? "custom" : "customize"}
                      </button>
                    )}
                    {goalConfig.userOverrideWeight && (
                      <button onClick={() => {
                        const reset = { ...goalConfig, userOverrideWeight:null, effectiveGoalWeight:goalConfig.goalWeight, updatedAt:Date.now() };
                        window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(reset)).catch(()=>{});
                        setStoredGoalConfig(reset);
                      }} style={{background:"none",border:"none",color:"var(--muted)",fontSize:9,cursor:"pointer",padding:0,letterSpacing:.5,textDecoration:"underline",textUnderlineOffset:2,fontFamily:"'DM Sans',sans-serif"}}>
                        reset
                      </button>
                    )}
                  </div>
                )}
                {/* Live BF preview when override input is open */}
                {showOverrideInput && overrideVal && (() => {
                  const w = parseFloat(overrideVal);
                  if (!w || w < 80) return null;
                  const projBf = Math.round((1 - userState.bodyComp.lbmKg / (w * 0.453592)) * 1000) / 10;
                  const outcome = bfToVisualOutcome(projBf, user.sex);
                  const inRange = w >= goalConfig.goalWeightRange[0] && w <= goalConfig.goalWeightRange[1];
                  const col = inRange ? "var(--green)" : Math.abs(w - goalConfig.goalWeight) < 10 ? "var(--accent)" : "var(--red)";
                  return (
                    <div style={{marginTop:5,fontSize:10,color:col}}>
                      {projBf.toFixed(1)}% BF · {outcome}
                      {!inRange && <span style={{marginLeft:4,opacity:.7}}>(outside recommended range)</span>}
                    </div>
                  );
                })()}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:`color-mix(in srgb,${ratingCol} 12%,transparent)`,border:`1px solid color-mix(in srgb,${ratingCol} 30%,transparent)`}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:ratingCol}}/>
                  <span style={{fontSize:9,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1.5,color:ratingCol}}>{goalConfig.realisticRating.toUpperCase()}</span>
                </div>
                <div style={{fontSize:10,color:"var(--muted)"}}>{goalConfig.goalBfPct}% BF target</div>
              </div>
            </div>

            {/* Compact summary row — always visible */}
            <div style={{padding:"8px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:11,color:"var(--muted)"}}>
                {totalDelta > 0
                  ? <><span style={{color:"var(--text)",fontWeight:600}}>{Math.round(progressPct)}%</span> of the way · ETA <span style={{color:"var(--text)",fontWeight:600}}>{liveEta > 0 ? `${liveEta}w` : "—"}</span></>
                  : <span style={{color:"var(--muted)"}}>Recomposition target — weight stays flat</span>}
              </div>
              <button onClick={() => setGcExpanded(e => !e)} style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--faint)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                {gcExpanded ? "LESS" : "DETAILS"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12,transition:"transform .2s",transform:gcExpanded?"rotate(180deg)":"none"}}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>

            {/* Progress bar + sparkline + delta — hidden when collapsed */}
            {gcExpanded && totalDelta > 0 && (
              <div style={{padding:"10px 16px 8px",borderBottom:"1px solid var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)"}}>Progress</div>
                  <div style={{fontSize:10,color:"var(--faint)"}}>
                    {rawDelta !== 0
                      ? `${rawDelta > 0 ? "+" : ""}${rawDelta.toFixed(1)} lbs from start`
                      : "at baseline"}
                  </div>
                </div>
                <div style={{height:6,background:"var(--up)",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${progressPct}%`,
                    background: completionState==="reached" ? "var(--green)" : completionState==="approaching" ? "#FBBF24" : "var(--accent)",
                    borderRadius:3,transition:"width 1s cubic-bezier(.22,1,.36,1)"}}/>
                </div>
                <div style={{fontSize:9,color:"var(--faint)",marginBottom:8,textAlign:"right"}}>{Math.round(progressPct)}% of the way there</div>

                {/* Snapshot trajectory sparkline */}
                {snapshots.length >= 2 && (() => {
                  const pts    = snapshots.slice(-8);
                  const gw     = goalConfig.effectiveGoalWeight;
                  const wvals  = pts.map(s => s.weight);
                  const allW   = [...wvals, gw];
                  const minW   = Math.min(...allW) - 1;
                  const maxW   = Math.max(...allW) + 1;
                  const range  = maxW - minW || 1;
                  const W = 200, H = 36;
                  const tx = i => (i / Math.max(pts.length - 1, 1)) * (W - 6) + 3;
                  const ty = w => H - 3 - ((w - minW) / range) * (H - 6);
                  const goalY  = ty(gw);
                  const lineD  = pts.map((s,i) => `${i===0?"M":"L"}${tx(i).toFixed(1)} ${ty(s.weight).toFixed(1)}`).join(" ");
                  const lineCol = completionState==="reached" ? "var(--green)" : progressPct > 50 ? "var(--accent)" : "var(--faint)";
                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:36,display:"block",overflow:"visible"}}>
                      <line x1="0" y1={goalY} x2={W} y2={goalY} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
                      <path d={lineD} fill="none" stroke={lineCol} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {pts.map((s,i) => (
                        <circle key={i} cx={tx(i)} cy={ty(s.weight)} r={i===pts.length-1?3:2}
                          fill={i===pts.length-1 ? lineCol : "var(--up)"}
                          stroke={lineCol} strokeWidth="1"/>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            )}

            {/* Key metrics row — shown when expanded */}
            {gcExpanded && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid var(--border)"}}>
              {[
                {
                  label: "ETA",
                  val:   liveEta > 0 ? `${liveEta}w` : "—",
                  sub:   liveEtaChanged ? `updated from ${goalConfig.etaWeeks}w` : goalConfig.etaDate,
                  color: liveEtaChanged && latestSnapshot.etaWeeks > goalConfig.etaWeeks * 1.2 ? "var(--accent)" : "var(--text)",
                },
                {
                  label: "LBM Goal",
                  val:   `${goalConfig.goalLbmLbs}`,
                  sub:   latestSnapshot?.estimatedLbmLbs ? `now ${latestSnapshot.estimatedLbmLbs} lbs` : "lbs lean mass",
                  color: "var(--text)",
                },
                {
                  label: "Sustain",
                  val:   `${goalConfig.sustainabilityScore}`,
                  sub:   "/ 100",
                  color: ratingCol,
                },
              ].map((m, i) => (
                <div key={m.label} style={{padding:"10px 12px",borderRight: i < 2 ? "1px solid var(--border)" : "none"}}>
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:3}}>
                    {m.label === "LBM Goal" ? (
                      <Tip label="Lean Body Mass target — your muscle + organ weight at goal, no fat included">LBM GOAL</Tip>
                    ) : m.label === "Sustain" ? (
                      <Tip label="Sustainability score: how realistic this goal is given your starting point (0 = unrealistic, 100 = conservative)">SUSTAIN</Tip>
                    ) : m.label}
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:.5,color:m.color,lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:9,color:"var(--faint)",marginTop:2}}>{m.sub}</div>
                </div>
              ))}
            </div>}

            {/* Rate alert — always visible (it's an action signal) */}
            {latestSnapshot?.rateAlert && (
              <div style={{padding:"8px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8,background:`color-mix(in srgb,${rateAlertCol[latestSnapshot.rateAlert]} 8%,transparent)`}}>
                <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,background:rateAlertCol[latestSnapshot.rateAlert]}}/>
                <div style={{fontSize:11,color:rateAlertCol[latestSnapshot.rateAlert]}}>
                  {latestSnapshot.rateAlert === "too_fast" && "Rate faster than target — watch muscle retention and recovery"}
                  {latestSnapshot.rateAlert === "too_slow" && "Rate slower than target — review calorie targets and adherence"}
                  {latestSnapshot.rateAlert === "off_course" && "Moving in the wrong direction — check nutrition tracking"}
                </div>
              </div>
            )}

            {/* Visual outcome + Full Analysis CTA — collapsed by default */}
            {gcExpanded && (
            <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:"var(--muted)",letterSpacing:.5,marginBottom:3}}>Projected outcome</div>
                  <div style={{fontSize:12,color:"var(--faint)",lineHeight:1.55,fontStyle:"italic"}}>"{goalConfig.projectedVisualOutcome}"</div>
                  {goalConfig.currentVisualOutcome !== goalConfig.projectedVisualOutcome && (
                    <div style={{fontSize:10,color:"var(--muted)",marginTop:4}}>Currently: {goalConfig.currentVisualOutcome}</div>
                  )}
                </div>
                <button onClick={handleGenerateReport}
                  style={{flexShrink:0,padding:"7px 12px",background:"color-mix(in srgb,var(--accent) 14%,transparent)",
                    border:"1px solid color-mix(in srgb,var(--accent) 35%,transparent)",
                    borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:10,letterSpacing:1.5,
                    color:"var(--accent)",cursor:"pointer",whiteSpace:"nowrap",alignSelf:"flex-start",marginTop:2}}>
                  → FULL ANALYSIS
                </button>
              </div>
            </div>
            )}

            {/* Goal revision suggestion — Accept / Defer 7d / Dismiss */}
            {goalRevision?.suggested && (
              <div style={{padding:"12px 16px",background:"color-mix(in srgb,var(--accent) 8%,transparent)",borderTop:"1px solid var(--border)"}}>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:6}}>● APEX SUGGESTS</div>
                <div style={{fontSize:12,color:"var(--faint)",lineHeight:1.65,marginBottom:10}}>{goalRevision.reason}</div>
                {goalRevision.revisedGoalWeight && (
                  <div style={{fontSize:11,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,color:"var(--accent)",marginBottom:10}}>
                    Revised target: {goalRevision.revisedGoalWeight} lbs
                  </div>
                )}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {/* ACCEPT — updates effectiveGoalWeight + logs to revisionHistory */}
                  {goalRevision.revisedGoalWeight && (
                    <button onClick={() => {
                      const updated = {
                        ...goalConfig,
                        effectiveGoalWeight: goalRevision.revisedGoalWeight,
                        updatedAt: Date.now(),
                        revisionHistory: [...(goalConfig.revisionHistory||[]), {
                          ts: Date.now(), trigger: goalRevision.trigger,
                          previousGoal: goalConfig.effectiveGoalWeight,
                          newGoal: goalRevision.revisedGoalWeight,
                          decision: "accepted",
                        }],
                      };
                      window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(updated)).catch(()=>{});
                      setStoredGoalConfig(updated);
                      setGoalRevision(null);
                    }}
                    style={{padding:"7px 14px",background:"var(--accent)",color:"#080A0C",border:"none",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1.2,cursor:"pointer"}}>
                      ACCEPT
                    </button>
                  )}
                  {/* DEFER 7D — snoozes all revision triggers for 7 days */}
                  <button onClick={() => {
                    const updated = {
                      ...goalConfig,
                      snoozedUntil: Date.now() + 7 * 86400000,
                      updatedAt: Date.now(),
                      revisionHistory: [...(goalConfig.revisionHistory||[]), {
                        ts: Date.now(), trigger: goalRevision.trigger, decision: "deferred_7d",
                      }],
                    };
                    window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(updated)).catch(()=>{});
                    setStoredGoalConfig(updated);
                    setGoalRevision(null);
                  }}
                  style={{padding:"7px 14px",background:"var(--up)",color:"var(--muted)",border:"1px solid var(--border)",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1.2,cursor:"pointer"}}>
                    DEFER 7D
                  </button>
                  {/* DISMISS — acknowledges this trigger, won't fire again */}
                  <button onClick={() => {
                    const updated = {
                      ...goalConfig,
                      acknowledgedTriggers: [...(goalConfig.acknowledgedTriggers||[]), goalRevision.trigger],
                      updatedAt: Date.now(),
                      revisionHistory: [...(goalConfig.revisionHistory||[]), {
                        ts: Date.now(), trigger: goalRevision.trigger, decision: "dismissed",
                      }],
                    };
                    window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(updated)).catch(()=>{});
                    setStoredGoalConfig(updated);
                    setGoalRevision(null);
                  }}
                  style={{padding:"7px 14px",background:"none",color:"var(--faint)",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          {/* Goal completion banner + phase transition */}
          {(completionState === "reached" || completionState === "exceeded") && !completionDismissed && (
            <div style={{padding:"12px 16px",background:`color-mix(in srgb,${completionState==="reached"?"var(--green)":"var(--accent)"} 10%,transparent)`,borderTop:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:completionState==="reached"?"var(--green)":"var(--accent)",marginBottom:3}}>
                    {completionState==="reached" ? "GOAL REACHED" : "GOAL EXCEEDED"}
                  </div>
                  <div style={{fontSize:12,color:"var(--faint)",lineHeight:1.5}}>
                    {completionState==="reached"
                      ? "You've hit your target. Time to decide what's next."
                      : `You've gone ${Math.abs(remaining).toFixed(1)} lbs past your target. Plan your next phase.`}
                  </div>
                </div>
                <button onClick={()=>setCompletionDismissed(true)}
                  style={{background:"none",border:"none",color:"var(--muted)",fontSize:14,cursor:"pointer",padding:"0 2px",flexShrink:0}}>✕</button>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{ onGoalTransition?.("maintain"); setCompletionDismissed(true); }}
                  style={{padding:"7px 14px",background:"var(--green)",color:"#080A0C",border:"none",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1.2,cursor:"pointer"}}>
                  MAINTAIN
                </button>
                <button onClick={()=>{ onEditProfile?.(); setCompletionDismissed(true); }}
                  style={{padding:"7px 14px",background:"var(--up)",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1.2,cursor:"pointer"}}>
                  NEW PHASE
                </button>
                <button onClick={()=>setCompletionDismissed(true)}
                  style={{padding:"7px 14px",background:"none",color:"var(--faint)",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>
                  Keep going
                </button>
              </div>
            </div>
          )}

          {/* Phase history footer */}
          {goalHistory.length > 0 && (() => {
            const completed = goalHistory.filter(p => p.outcome !== "ongoing");
            const current   = goalHistory.find(p => p.outcome === "ongoing");
            const weeksIn   = current
              ? Math.round((Date.now() - current.startTs) / (7 * 86400000))
              : null;
            return (
              <div style={{padding:"8px 16px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:9,color:"var(--muted)",letterSpacing:.5}}>
                  {completed.length > 0
                    ? `Phase ${goalHistory.length} · ${completed.length} completed`
                    : "Phase 1 · Journey start"}
                </div>
                {weeksIn !== null && (
                  <div style={{fontSize:9,color:"var(--faint)"}}>{weeksIn}w in</div>
                )}
                {completed.length > 0 && (
                  <div style={{display:"flex",gap:4}}>
                    {completed.slice(-3).map((p, i) => (
                      <div key={i} style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:"var(--up)",color:"var(--muted)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:.5}}>
                        {p.phase.toUpperCase().slice(0,3)}
                        {p.endWeight && p.startWeight
                          ? ` ${p.endWeight - p.startWeight > 0 ? "+" : ""}${(p.endWeight - p.startWeight).toFixed(0)}`
                          : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          </div>
        );
      })()}

      {/* BODY COMPOSITION TREND CARD — visible once 2+ snapshots exist */}
      {snapshots.length >= 2 && goalConfig && (() => {
        const bfPts  = snapshots.slice(-8).map(s => s.estimatedBfPct).filter(Boolean);
        const lbmPts = snapshots.slice(-8).map(s => s.estimatedLbmLbs).filter(Boolean);
        const latSnap = snapshots[snapshots.length - 1];
        const bfDelta  = goalConfig.startBfPct  != null && latSnap.estimatedBfPct  != null
          ? Math.round((latSnap.estimatedBfPct  - goalConfig.startBfPct)  * 10) / 10 : null;
        const lbmDelta = goalConfig.startLbmLbs != null && latSnap.estimatedLbmLbs != null
          ? Math.round((latSnap.estimatedLbmLbs - goalConfig.startLbmLbs) * 10) / 10 : null;

        const Spark = ({ pts, col, goal: gval, invert }) => {
          if (pts.length < 2) return null;
          const W = 100, H = 28;
          const mn = Math.min(...pts, gval ?? Infinity) - .5;
          const mx = Math.max(...pts, gval ?? -Infinity) + .5;
          const rng = mx - mn || 1;
          const tx = i => (i / (pts.length - 1)) * (W - 4) + 2;
          const ty = v => H - 2 - ((v - mn) / rng) * (H - 4);
          const d  = pts.map((v, i) => `${i===0?"M":"L"}${tx(i).toFixed(1)} ${ty(v).toFixed(1)}`).join(" ");
          const goalY = gval != null ? ty(gval) : null;
          const improving = invert ? pts[pts.length-1] < pts[0] : pts[pts.length-1] > pts[0];
          const lineCol = improving ? "var(--green)" : col;
          return (
            <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:28,display:"block"}}>
              {goalY != null && <line x1="0" y1={goalY} x2={W} y2={goalY} stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>}
              <path d={d} fill="none" stroke={lineCol} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx={tx(pts.length-1)} cy={ty(pts[pts.length-1])} r={2.5} fill={lineCol}/>
            </svg>
          );
        };

        return (
          <div style={{margin:"0 24px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"10px 14px 8px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)"}}>● Body Composition</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {physiqueHistory.length > 0 && (
                  <div style={{fontSize:9,color:"var(--muted)"}}>{physiqueHistory.length} scan{physiqueHistory.length!==1?"s":""}</div>
                )}
                <button onClick={()=>setShowPhysiqueScan(true)}
                  style={{padding:"4px 10px",background:"color-mix(in srgb,var(--accent) 14%,transparent)",border:"1px solid color-mix(in srgb,var(--accent) 35%,transparent)",borderRadius:6,fontFamily:"'Bebas Neue',sans-serif",fontSize:9,letterSpacing:1.5,color:"var(--accent)",cursor:"pointer"}}>
                  PHYSIQUE SCAN
                </button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {/* BF% */}
              <div style={{padding:"10px 14px",borderRight:"1px solid var(--border)"}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:2}}>Body Fat %</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:4}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:.5,color:"var(--text)"}}>{latSnap.estimatedBfPct ?? "—"}</span>
                  {bfDelta !== null && (
                    <span style={{fontSize:10,color: bfDelta < 0 ? "var(--green)" : "var(--accent)"}}>
                      {bfDelta > 0 ? "+" : ""}{bfDelta}%
                    </span>
                  )}
                </div>
                <Spark pts={bfPts} col="var(--accent)" goal={goalConfig.goalBfPct} invert={true}/>
                <div style={{fontSize:9,color:"var(--faint)",marginTop:3}}>Goal: {goalConfig.goalBfPct}%</div>
              </div>
              {/* LBM */}
              <div style={{padding:"10px 14px"}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:2}}>Lean Mass (lbs)</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:4}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:.5,color:"var(--text)"}}>{latSnap.estimatedLbmLbs ?? "—"}</span>
                  {lbmDelta !== null && (
                    <span style={{fontSize:10,color: lbmDelta >= 0 ? "var(--green)" : "var(--red)"}}>
                      {lbmDelta > 0 ? "+" : ""}{lbmDelta}
                    </span>
                  )}
                </div>
                <Spark pts={lbmPts} col="var(--blue)" goal={goalConfig.goalLbmLbs} invert={false}/>
                <div style={{fontSize:9,color:"var(--faint)",marginTop:3}}>Goal: {goalConfig.goalLbmLbs} lbs</div>
              </div>
            </div>
            {/* FFMI progress meter */}
            {latSnap.ffmi && (() => {
              const ceiling = user.sex === "female" ? 21 : 25.5;
              const floor   = 14;
              const pct     = Math.min(100, Math.max(0, ((latSnap.ffmi - floor) / (ceiling - floor)) * 100));
              const ffmiCol = pct < 55 ? "var(--green)" : pct < 78 ? "var(--accent)" : "var(--red)";
              return (
                <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)"}}>FFMI — Muscle Index</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:ffmiCol}}>{latSnap.ffmi.toFixed(1)}</span>
                      <span style={{fontSize:9,color:"var(--muted)"}}>&nbsp;/ {ceiling}</span>
                    </div>
                  </div>
                  <div style={{height:4,background:"var(--up)",borderRadius:2,overflow:"hidden",marginBottom:3}}>
                    <div style={{height:"100%",width:`${pct}%`,background:ffmiCol,borderRadius:2,transition:"width .8s cubic-bezier(.22,1,.36,1)"}}/>
                  </div>
                  <div style={{fontSize:9,color:"var(--faint)"}}>
                    {pct < 40 ? "Significant growth potential — beginner/early development"
                    : pct < 65 ? "Intermediate range — strong growth potential remains"
                    : pct < 82 ? "Advanced — approaching natural ceiling"
                    : "Near natural limit — gains increasingly fat-dominant"}
                  </div>
                </div>
              );
            })()}

            {/* Adherence trend sparkline */}
            {(() => {
              const adhPts = snapshots.slice(-8).map(s => s.adherenceScore).filter(v => v != null);
              if (adhPts.length < 2) return null;
              const latAdh = adhPts[adhPts.length - 1];
              const avgAdh = Math.round(adhPts.reduce((s,v) => s+v, 0) / adhPts.length);
              const W = 200, H = 24;
              const mn = Math.max(0, Math.min(...adhPts) - 5);
              const mx = Math.min(100, Math.max(...adhPts) + 5);
              const rng = mx - mn || 1;
              const tx = i => (i / (adhPts.length-1)) * (W-4) + 2;
              const ty = v => H - 2 - ((v - mn) / rng) * (H-4);
              const d = adhPts.map((v,i) => `${i===0?"M":"L"}${tx(i).toFixed(1)} ${ty(v).toFixed(1)}`).join(" ");
              const col = latAdh >= 70 ? "var(--green)" : latAdh >= 45 ? "var(--accent)" : "var(--red)";
              return (
                <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)"}}>Adherence</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:col}}>{latAdh}</span>
                      <span style={{fontSize:9,color:"var(--muted)"}}>/ 100&nbsp;·&nbsp;avg {avgAdh}</span>
                    </div>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:24,display:"block"}}>
                    <path d={d} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={tx(adhPts.length-1)} cy={ty(adhPts[adhPts.length-1])} r={2.5} fill={col}/>
                  </svg>
                </div>
              );
            })()}

            {/* Bridge status */}
            {goalCalAdj !== 0 && (
              <div style={{padding:"7px 14px",borderTop:"1px solid var(--border)",background:"color-mix(in srgb,var(--accent) 6%,transparent)",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,background:"var(--accent)"}}/>
                <div style={{fontSize:10,color:"var(--accent)"}}>
                  Calorie target adjusted {goalCalAdj > 0 ? "+" : ""}{goalCalAdj} kcal/day to hit pace
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SECONDARY STAT STRIP — Sessions / Train / Rest / Weekly Avg */}
      <div className="stat-strip" style={{gridTemplateColumns: calTarget?.cyclingActive ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr"}}>
        <div className="stat-cell">
          <div className="stat-label">Sessions</div>
          <div className="stat-val" style={{color: history.length ? "var(--text)" : "var(--muted)", fontSize: history.length ? undefined : 18}}>
            {history.length || "—"}
          </div>
          <div className="stat-sub">{history.length ? "total logged" : "none yet"}</div>
        </div>
        {calTarget?.cyclingActive ? (
          <>
            <div className="stat-cell" style={calTarget.isTrainDay ? {animation:"chargePulse 3s ease-in-out infinite"} : {}}>
              <div className="stat-label" style={{color:"var(--accent)"}}>Train Day</div>
              <div className="stat-val" style={{color: calTarget.isTrainDay ? "var(--accent)" : "var(--text)"}}>
                {calTarget.trainCal?.toLocaleString() ?? "—"}
              </div>
              <div className="stat-sub">{calTarget.trainP ?? calTarget.p}g protein</div>
            </div>
            <div className="stat-cell" style={!calTarget.isTrainDay ? {animation:"chargePulse 3s ease-in-out infinite"} : {}}>
              <div className="stat-label">Rest Day</div>
              <div className="stat-val" style={{color: !calTarget.isTrainDay ? "var(--text)" : "var(--muted)"}}>
                {calTarget.restCal?.toLocaleString() ?? "—"}
              </div>
              <div className="stat-sub">{calTarget.restP ?? calTarget.p}g protein</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Wkly Avg</div>
              <div className="stat-val">{calTarget.weeklyAvg?.toLocaleString() ?? "—"}</div>
              <div className="stat-sub">
                {calTarget.tdee ? `TDEE ${calTarget.tdee.toLocaleString()}` : "per day"}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-cell">
              <div className="stat-label">Daily Target</div>
              <div className="stat-val">{calTarget ? calTarget.cal.toLocaleString() : "—"}</div>
              <div className="stat-sub">{calTarget ? `${calTarget.p}g protein` : "Not set"}</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">{reboundData ? "Ceiling" : "TDEE"}</div>
              <div className="stat-val" style={{color: reboundData && currentWeight >= reboundData.ceiling * 0.97 ? "var(--red)" : "var(--text)"}}>
                {reboundData ? reboundData.ceiling : (calTarget?.tdee?.toLocaleString() ?? "—")}
              </div>
              <div className="stat-sub" style={{color: reboundData ? (currentWeight >= reboundData.ceiling ? "var(--red)" : "var(--green)") : "var(--muted)"}}>
                {reboundData
                  ? (reboundData.ceiling - currentWeight > 0 ? `${(reboundData.ceiling - currentWeight).toFixed(1)} remaining` : "At ceiling")
                  : (calTarget?.pal ? `PAL ${calTarget.pal.toFixed(2)}` : "maintenance")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* TRAINING BLOCK */}
      <div className="dash-banner" onClick={() => onNavigate("training")}
        style={{cursor:"pointer",transition:"border-color .15s"}}
        onMouseOver={e=>e.currentTarget.style.borderColor="var(--accent)"}
        onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{flex:1}}>
            {splitDef ? (
              <>
                <div className="db-tag">{splitDef.label}</div>
                <div className="db-title">{history.length} SESSION{history.length !== 1 ? "S" : ""} LOGGED</div>
                <div className="db-sub">{splitDef.frequency} days/week · {history.length > 0 ? `last: ${new Date(history[history.length-1].ts).toLocaleDateString("en-US",{month:"short",day:"numeric"})}` : "no sessions yet"}</div>
              </>
            ) : (
              <>
                <div className="db-tag">Get started</div>
                <div className="db-title">Set Up Training</div>
                <div className="db-sub">Configure your split in the Training tab</div>
              </>
            )}
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,color:"var(--muted)",flexShrink:0,marginTop:2}}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div className="streak">
          {last7Days.map((d,i) => (
            <div key={i} className={`sdot ${d.done?"on":"off"}`}>{d.done ? "✓" : d.label}</div>
          ))}
          <span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>
            {streak > 0 ? `${streak}-day streak` : "No sessions yet"}
          </span>
        </div>
      </div>

      {/* WEIGHT GRAPH */}
      <div style={{margin:"0 24px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 18px 8px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"var(--muted)"}}>30-Day Bodyweight Trend</div>
        </div>
        {sortedLog.length >= 1 ? (
          <WeightGraph3D logs={sortedLog} ceilingWeight={reboundData?.ceiling||null} stageWeight={reboundData?.stageWeight||null}/>
        ) : (
          <div style={{height:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:24}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:"var(--muted)"}}>NO DATA YET</div>
            <div style={{fontSize:12,color:"var(--muted)",textAlign:"center",lineHeight:1.5}}>Log your first weight above to start tracking.</div>
          </div>
        )}
      </div>

      {/* ── PROTOCOL INTELLIGENCE — collapsed by default ─────────────────────── */}
      <div style={{margin:"0 24px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setShowProtocol(p=>!p)}
            style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.text}}>Coach View</div>
            <div style={{width:20,height:20,borderRadius:4,border:`1px solid var(--border)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"transform .2s",transform:showProtocol?"rotate(180deg)":"none"}}>
              <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{width:10,color:"var(--muted)"}}><path d="M1 1.5l5 5 5-5"/></svg>
            </div>
          </button>
          <CubeButton small onClick={()=>setShowCheckIn(true)}>
            {checkIn ? "Update Check-in" : "Check-in"}
          </CubeButton>
        </div>
      </div>

      {showProtocol && <div className="pi-wrap">

        {/* ── CARD 1: BODY COMPOSITION ── */}
        <div className="pi-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div className="pi-group" style={{margin:0}}>Body Composition</div>
            <button onClick={()=>setShowPhysiqueScan(true)}
              style={{padding:"4px 10px",background:"color-mix(in srgb,var(--accent) 12%,transparent)",border:"1px solid color-mix(in srgb,var(--accent) 30%,transparent)",borderRadius:6,fontFamily:"'Bebas Neue',sans-serif",fontSize:9,letterSpacing:1.5,color:"var(--accent)",cursor:"pointer"}}>
              {physiqueHistory.length > 0 ? "RE-SCAN" : "PHYSIQUE SCAN"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,textAlign:"center"}}>
            {/* Body Fat — tappable to edit */}
            <div onClick={()=>{setBfInput(String(displayComp.bfPct));setBfTab("manual");setShowBfEditor(true);}}
              style={{cursor:"pointer",padding:"4px 8px",borderRadius:6,transition:"background .15s"}}
              onMouseOver={e=>e.currentTarget.style.background="var(--up)"}
              onMouseOut={e=>e.currentTarget.style.background=""}>
              <div className="pi-body-val" style={{color:bfOverride!=null?C.accent:"var(--text)"}}>{displayComp.bfPct}%</div>
              <div className="pi-body-label" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                Body Fat
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{width:8,height:8,color:bfOverride!=null?C.accent:"var(--muted)",flexShrink:0}}>
                  <path d="M8 2l2 2-6 6H2V8L8 2z"/>
                </svg>
              </div>
            </div>
            <div style={{padding:"4px 8px",borderLeft:"1px solid var(--border)",borderRight:"1px solid var(--border)"}}>
              <div className="pi-body-val">{displayComp.lbmLbs}</div>
              <div className="pi-body-label">Lean Mass (lbs)</div>
            </div>
            <div style={{padding:"4px 8px"}}>
              <div className="pi-body-val">{userState.tdee.toLocaleString()}</div>
              <div className="pi-body-label">Daily Burn (kcal)</div>
            </div>
          </div>
        </div>

        {/* ── CARD 2: WEIGHT TREND ── */}
        <div className="pi-card">
          <div className="pi-group">Weight Trend · Last 14 Days</div>
          <div className="pi-trend-row">
            <div>
              {weightTrend.dataPoints<3 ? (
                <>
                  <div className="pi-trend-val" style={{fontSize:28,color:C.muted}}>—</div>
                  <div className="pi-trend-desc">Log 3+ weights to see your trend</div>
                </>
              ) : (
                <>
                  <div className="pi-trend-val" style={{color:weightTrend.rate>0?C.green:weightTrend.rate<0?C.blue:C.muted}}>
                    {`${weightTrend.rate>0?"+":""}${weightTrend.rate}`}
                  </div>
                  <div className="pi-trend-desc">{`lbs / week · ${weightTrend.classification.replace(/_/g," ")}`}</div>
                </>
              )}
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:6}}>Tracking Quality</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,
                color:confidenceScore>=0.75?C.green:confidenceScore>=0.5?C.accent:C.muted,
                lineHeight:1,marginBottom:6}}>
                {Math.round(confidenceScore*100)}%
              </div>
              <div className="pi-bar">
                <div className="pi-bar-fill" style={{width:`${Math.round(confidenceScore*100)}%`,
                  background:confidenceScore>=0.75?C.green:confidenceScore>=0.5?C.accent:C.muted}}/>
              </div>
              <div style={{fontSize:9,color:C.faint,marginTop:4}}>
                {confidenceScore>=0.75?"Reliable data":"Log more to improve accuracy"}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: READINESS ── */}
        <div className="pi-card">
          <div className="pi-group">Today's Readiness</div>
          {[
            { name:"Recovery",      val:userState.rcs,               unit:"/100", color:userState.rcs>=75?C.green:userState.rcs>=55?C.accent:C.red,
              sub:userState.rcs>=75?"Ready to train hard":userState.rcs>=55?"Train at moderate intensity":"Rest or deload today" },
            { name:"Nutrition",     val:protocolDecision.adherence,  unit:"%",    color:protocolDecision.adherence>=85?C.green:protocolDecision.adherence>=70?C.accent:C.muted,
              sub:protocolDecision.adherence>=85?"Consistent":"Log meals daily to unlock AI coaching" },
            { name:"Training Load", val:Math.min(protocolDecision.fatigueDebt,100), unit:"", color:protocolDecision.fatigueDebt>60?C.red:protocolDecision.fatigueDebt>30?C.accent:C.green,
              sub:protocolDecision.fatigueDebt>60?"High — reduce volume":protocolDecision.fatigueDebt>30?"Moderate":"Fresh" },
          ].map(r => (
            <div key={r.name} className="pi-ready-row">
              <div className="pi-ready-name">{r.name}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                <div className="pi-ready-bar">
                  <div className="pi-ready-fill" style={{width:`${r.val}%`,background:r.color}}/>
                </div>
                <div style={{fontSize:9,color:C.faint,lineHeight:1.3}}>{r.sub}</div>
              </div>
              <div className="pi-ready-val" style={{color:r.color}}>{r.val}{r.unit}</div>
            </div>
          ))}
        </div>

        {/* ── RECOMMENDATIONS ── */}
        {protocolDecision.decisions.length > 0 && protocolDecision.decisions.map((d, i) => (
          <div key={i} className="pi-alert-card" style={{borderColor:DECISION_COLOR[d.color]||"var(--brutal)",boxShadow:`4px 4px 0 ${DECISION_COLOR[d.color]||"var(--brutal)"}`}}>
            <div className="pi-alert-dot" style={{background:DECISION_COLOR[d.color]||C.muted}}/>
            <div style={{flex:1}}>
              <div className="pi-alert-priority" style={{color:DECISION_COLOR[d.color]||C.muted}}>
                {PRIORITY_LABEL[d.priority]||d.priority} · {d.type.toUpperCase()}
              </div>
              <div className="pi-alert-msg">{d.msg}</div>
              {d.type==="calories" && protocolDecision.calAdjustment!==0 && (
                <div style={{fontSize:10,color:C.muted,marginTop:6}}>
                  Suggested target: <span style={{fontFamily:"'DM Mono',monospace",color:C.accent,fontWeight:700}}>{calTarget?(calTarget.cal+protocolDecision.calAdjustment).toLocaleString():"—"} kcal</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ── VOLUME SIGNAL ── */}
        {protocolDecision.volumeSignal !== "maintain" && (
          <div className="pi-alert-card" style={{borderColor:protocolDecision.volumeSignal==="increase"?C.green:C.red,boxShadow:`4px 4px 0 ${protocolDecision.volumeSignal==="increase"?C.green:C.red}`}}>
            <div className="pi-alert-dot" style={{background:protocolDecision.volumeSignal==="increase"?C.green:C.red}}/>
            <div style={{flex:1}}>
              <div className="pi-alert-priority" style={{color:protocolDecision.volumeSignal==="increase"?C.green:C.red}}>
                VOLUME · {protocolDecision.volumeSignal.toUpperCase()}
              </div>
              <div className="pi-alert-msg">
                {protocolDecision.volumeSignal==="increase"
                  ?"Performance is strong — add 2 sets to priority compounds next session."
                  :"Recovery is stressed — drop 2 sets from isolations this week."}
              </div>
            </div>
          </div>
        )}

        {/* ── STRENGTH TRENDS ── */}
        {topLifts.length > 0 && (
          <div className="pi-card">
            <div className="pi-group">Strength Trends</div>
            {topLifts.map(([name, t]) => (
              <div key={name} className="pi-strength-row">
                <div style={{flex:1,minWidth:0}}>
                  <div className="pi-strength-name" style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                  <div className="pi-strength-meta">{t.sessions} sessions · e1RM {t.latest} lbs</div>
                </div>
                <div className="pi-strength-trend" style={{color:t.trend==="improving"?C.green:t.trend==="declining"?C.red:C.muted}}>
                  {t.trend==="improving"?"↑ Improving":t.trend==="declining"?"↓ Declining":"→ Stable"}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>}

      {/* ── BF% EDITOR ──────────────────────────────────────────────────────────── */}
      {showBfEditor && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.42)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setShowBfEditor(false);}}>
          <div style={{width:"100%",maxWidth:430,background:"color-mix(in srgb,var(--card) 88%,transparent)",backdropFilter:"blur(24px) saturate(1.4)",WebkitBackdropFilter:"blur(24px) saturate(1.4)",borderTop:"1px solid var(--glass-border)",boxShadow:"var(--depth-shadow),var(--inner-light)",borderRadius:"20px 20px 0 0",padding:"24px 24px 40px",animation:"slideUp .3s cubic-bezier(.22,1,.36,1)"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1.5,color:C.text,marginBottom:4}}>SET BODY FAT %</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20,lineHeight:1.5}}>The formula estimated <strong style={{color:C.text}}>{userState.bodyComp.bfPct}%</strong>. Override it with your own estimate or upload a photo for AI analysis.</div>

            {/* Tab toggle */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",border:`2px solid ${C.brutal}`,borderRadius:6,boxShadow:`3px 3px 0 ${C.brutal}`,overflow:"hidden",marginBottom:20}}>
              {[{id:"manual",label:"I'll Estimate"},{id:"photo",label:"Analyze Photo"}].map(t=>(
                <button key={t.id} onClick={()=>setBfTab(t.id)}
                  style={{padding:"10px",background:bfTab===t.id?C.brutal:"var(--card)",border:"none",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:1.5,color:bfTab===t.id?C.card:C.muted,borderRight:t.id==="manual"?`2px solid ${C.brutal}`:"none",transition:"all .15s"}}>
                  {t.label}
                </button>
              ))}
            </div>

            {bfTab === "manual" && (
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.brutal,marginBottom:8}}>Your Estimate (%)</div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
                  <button onClick={()=>setBfInput(v=>String(Math.max(4,parseFloat(v||0)-0.5)))}
                    style={{width:40,height:46,background:"var(--card)",border:`2px solid ${C.brutal}`,borderRadius:4,boxShadow:`3px 3px 0 ${C.brutal}`,fontSize:20,cursor:"pointer",color:C.text,fontWeight:700}}>−</button>
                  <input type="number" min="4" max="45" step="0.5"
                    value={bfInput} onChange={e=>setBfInput(e.target.value)}
                    style={{flex:1,height:46,background:"var(--card)",border:`2px solid ${C.brutal}`,borderRadius:4,boxShadow:`3px 3px 0 ${C.brutal}`,fontSize:22,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,color:C.text,padding:"0 14px",outline:"none",textAlign:"center"}}/>
                  <button onClick={()=>setBfInput(v=>String(Math.min(45,parseFloat(v||0)+0.5)))}
                    style={{width:40,height:46,background:"var(--card)",border:`2px solid ${C.brutal}`,borderRadius:4,boxShadow:`3px 3px 0 ${C.brutal}`,fontSize:20,cursor:"pointer",color:C.text,fontWeight:700}}>+</button>
                </div>
                <div style={{fontSize:11,color:C.muted,marginBottom:16,lineHeight:1.5}}>
                  Roughly: 6–9% contest lean · 10–12% visible abs · 13–17% athletic · 18–24% average · 25%+ higher body fat
                </div>
                <CubeButton onClick={saveBfManual} disabled={!bfInput||parseFloat(bfInput)<4||parseFloat(bfInput)>45} style={{width:"100%"}}>SAVE ESTIMATE</CubeButton>
              </div>
            )}

            {bfTab === "photo" && (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>e.target.files?.[0]&&analyzeBfPhoto(e.target.files[0])}/>
                <div onClick={()=>bfPhotoStatus==="idle"&&fileInputRef.current?.click()}
                  style={{border:`2px dashed ${C.brutal}`,borderRadius:6,padding:"32px 20px",textAlign:"center",cursor:bfPhotoStatus==="idle"?"pointer":"default",marginBottom:16,background:"var(--card)",transition:"background .15s"}}
                  onMouseOver={e=>{if(bfPhotoStatus==="idle")e.currentTarget.style.background="var(--up)"}}
                  onMouseOut={e=>e.currentTarget.style.background="var(--card)"}>
                  {bfPhotoStatus==="idle" && <>
                    <div style={{fontSize:32,marginBottom:8}}>📸</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:C.text}}>TAP TO UPLOAD PHOTO</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>Front or side physique photo works best</div>
                  </>}
                  {bfPhotoStatus==="loading" && <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:C.accent,animation:"pulse 1.5s infinite"}}>ANALYZING...</div>}
                  {bfPhotoStatus==="done" && <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:C.green}}>✓ ESTIMATED: {bfOverride}%</div>}
                  {bfPhotoStatus==="error" && <>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:C.red}}>COULDN'T ANALYZE</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>Try a clearer photo or use manual estimate</div>
                  </>}
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:16}}>Photo is sent to Claude AI for analysis and not stored. Results are an estimate — use manual entry if you know your BF%.</div>
              </div>
            )}

            {bfOverride != null && (
              <button onClick={clearBfOverride}
                style={{width:"100%",marginTop:12,background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",padding:8,fontFamily:"'DM Sans',sans-serif"}}>
                Remove override — revert to formula estimate
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── WEEKLY CHECK-IN MODAL ─────────────────────────────────────────────── */}
      {showCheckIn && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.42)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowCheckIn(false);}}>
          <div style={{width:"100%",maxWidth:430,background:"color-mix(in srgb,var(--card) 88%,transparent)",backdropFilter:"blur(24px) saturate(1.4)",WebkitBackdropFilter:"blur(24px) saturate(1.4)",borderTop:"1px solid var(--glass-border)",boxShadow:"var(--depth-shadow),var(--inner-light)",borderRadius:"20px 20px 0 0",padding:"28px 24px 40px",animation:"slideUp .3s cubic-bezier(.22,1,.36,1)"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1.5,color:C.text,marginBottom:4}}>WEEKLY CHECK-IN</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:24,lineHeight:1.5}}>Takes 10 seconds. Powers your recovery score and protocol adjustments.</div>
            {[
              {label:"Sleep last night",key:"sleep",val:ciSleep,set:setCiSleep,min:3,max:12,step:.5,unit:"hrs",desc:["3h","12h"]},
              {label:"Stress level",    key:"stress",val:ciStress,set:setCiStress,min:1,max:10,step:1,unit:"/10",desc:["Low","High"]},
              {label:"Energy level",   key:"energy",val:ciEnergy,set:setCiEnergy,min:1,max:10,step:1,unit:"/10",desc:["Low","High"]},
            ].map(field => (
              <div key={field.key} style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{field.label}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:C.accent}}>{field.val}{field.unit}</div>
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step} value={field.val}
                  onChange={e=>field.set(e.target.value)} className="slider"
                  style={{width:"100%"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.faint,marginTop:3}}>
                  <span>{field.desc[0]}</span><span>{field.desc[1]}</span>
                </div>
              </div>
            ))}
            <CubeButton onClick={saveCheckIn} style={{marginTop:4,width:"100%"}}>SAVE CHECK-IN</CubeButton>
            {checkIn && <button onClick={()=>setShowCheckIn(false)} style={{width:"100%",marginTop:10,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",padding:6,fontFamily:"'DM Sans',sans-serif"}}>Dismiss</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WEIGHT REMINDER BANNER ───────────────────────────────────────────────────

function WeightReminderBanner({ type, daysAgo, onDismiss, onLogNow }) {
  const C = useThemeColors();
  const isWeek = type === "week";
  const color  = isWeek ? C.red : C.accent;

  const title = isWeek
    ? `${daysAgo} DAYS WITHOUT A WEIGH-IN`
    : "NO WEIGHT LOGGED TODAY";
  const sub = isWeek
    ? "Trend data is going stale — log now to keep your projections accurate."
    : "A quick weigh-in keeps your streak and pace tracking live.";

  return (
    <div className="wt-notif-wrap">
      <div className={`wt-notif ${type}`}>
        {/* Icon */}
        <div className="wt-notif-icon" style={{background:`color-mix(in srgb,${color} 18%,transparent)`}}>
          {isWeek
            ? <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
        </div>
        {/* Text */}
        <div className="wt-notif-body">
          <div className="wt-notif-title" style={{color}}>{title}</div>
          <div className="wt-notif-sub">{sub}</div>
        </div>
        {/* Actions */}
        <div className="wt-notif-actions">
          <button className="wt-notif-cta"
            onClick={onLogNow}
            style={{background:`color-mix(in srgb,${color} 18%,transparent)`,color,border:`1px solid color-mix(in srgb,${color} 35%,transparent)`}}>
            LOG →
          </button>
          {!isWeek && onDismiss && (
            <button className="wt-notif-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

function AdminWeightChart({ logs, goalWeight, C }) {
  if (!logs || logs.length < 2) return (
    <div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"16px 0"}}>No weight data</div>
  );
  const data = [...logs].sort((a, b) => a.ts - b.ts).slice(-30);
  const weights = data.map(d => d.weight);
  const gw = goalWeight && goalWeight > 0 ? goalWeight : null;
  const minW = Math.min(...weights, ...(gw ? [gw] : [])) - 2;
  const maxW = Math.max(...weights, ...(gw ? [gw] : [])) + 2;
  const range = maxW - minW || 10;
  const W = 280, H = 80;
  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: H * 0.9 - ((d.weight - minW) / range) * H * 0.85,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const goalY = gw ? H * 0.9 - ((gw - minW) / range) * H * 0.85 : null;
  const currentW = weights[weights.length - 1];
  const fillPath = `${path} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} style={{display:"block"}}>
      <defs>
        <linearGradient id="adm-wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={C.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#adm-wfill)"/>
      {goalY !== null && goalY >= 0 && goalY <= H && (
        <>
          <line x1="0" y1={goalY} x2={W} y2={goalY} stroke={C.red} strokeDasharray="4 3" strokeWidth="1.5" opacity="0.7"/>
          <text x={W - 2} y={goalY - 3} fontSize="9" fill={C.red} textAnchor="end" opacity="0.9">{gw} lb goal</text>
        </>
      )}
      <path d={path} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="4" fill={C.accent}/>
      <text x="2" y={H + 14} fontSize="9" fill={C.muted}>{data.length} entries</text>
      <text x={W - 2} y={H + 14} fontSize="9" fill={C.text} textAnchor="end" fontWeight="600">{currentW} lbs now</text>
    </svg>
  );
}

function AdminUserDetail({ userData, onBack, C }) {
  const { profile, weightLog, tState, nutState, goalConfig } = userData;
  const sortedLog = [...(weightLog || [])].sort((a, b) => a.ts - b.ts);
  const trend = sortedLog.length >= 3 ? analyzeWeightTrend(sortedLog) : { rate: 0 };
  const currentWeight = sortedLog.length ? sortedLog[sortedLog.length - 1].weight : null;
  const goalWeight = goalConfig?.effectiveGoalWeight || null;

  // ETA from actual trend rate
  let etaDays = null;
  if (trend.rate && Math.abs(trend.rate) > 0.01 && currentWeight && goalWeight) {
    const delta = goalWeight - currentWeight;
    const daysPerLb = 7 / Math.abs(trend.rate);
    if ((trend.rate < 0 && delta < 0) || (trend.rate > 0 && delta > 0)) {
      etaDays = Math.round(Math.abs(delta) * daysPerLb);
    }
  }
  // Fall back to config ETA if no trend data
  const etaWeeks = etaDays ? Math.round(etaDays / 7) : goalConfig?.etaWeeks;

  const sessions = [...(tState?.history || [])].sort((a, b) => b.ts - a.ts).slice(0, 4);

  const today = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric" });
  const todayLogs = (nutState?.logs || []).filter(l => l.date === today);
  const todayMacros = todayLogs.reduce((acc, l) => ({
    cal: acc.cal + (l.totals?.calories || 0),
    p: acc.p + (l.totals?.protein_g || 0),
    c: acc.c + (l.totals?.carbs_g || 0),
    f: acc.f + (l.totals?.fat_g || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });

  const goalLabel = { bulk:"Bulk", cut:"Cut", maintain:"Maintain", recomp:"Recomp", contest:"Contest" }[profile?.goal] || (profile?.goal || "—");
  const trendColor = trend.rate < -0.1 ? C.green : trend.rate > 0.1 ? C.red : C.muted;

  return (
    <div className="screen" style={{background:C.bg,overflowY:"auto",paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"56px 20px 20px",borderBottom:`1px solid ${C.border}`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.accent,fontSize:14,cursor:"pointer",padding:0,marginBottom:12,display:"flex",alignItems:"center",gap:6,fontWeight:600}}>
          ← Back to Roster
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:1,lineHeight:1,color:C.text}}>{profile?.name || "Unknown"}</div>
            <div style={{color:C.muted,fontSize:13,marginTop:4}}>
              <span style={{background:`color-mix(in srgb,${C.accent} 15%,transparent)`,color:C.accent,padding:"2px 7px",borderRadius:4,fontWeight:700,fontSize:10,marginRight:6}}>{goalLabel.toUpperCase()}</span>
              {profile?.level || "—"} · {profile?.sex || "—"}
            </div>
            <div style={{color:C.muted,fontSize:12,marginTop:4}}>
              {currentWeight ? `${currentWeight} lbs` : "—"} → {goalWeight ? `${goalWeight} lbs` : "—"}
            </div>
          </div>
          {etaWeeks ? (
            <div style={{textAlign:"center",background:`color-mix(in srgb,${C.accent} 12%,transparent)`,border:`2px solid ${C.accent}`,borderRadius:8,padding:"8px 12px",minWidth:64}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C.accent,lineHeight:1}}>{etaWeeks}</div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>wks ETA</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Weight chart */}
      <div style={{padding:"16px 20px"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Body Weight Trend</div>
        <div style={{background:C.card,borderRadius:10,padding:12,border:`1px solid ${C.border}`}}>
          <AdminWeightChart logs={sortedLog} goalWeight={goalWeight} C={C}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:11,color:trendColor,fontWeight:600}}>
              {trend.rate !== 0 ? `${trend.rate > 0 ? "▲ +" : "▼ "}${Math.abs(trend.rate).toFixed(2)} lbs/wk` : "Stable"}
            </span>
            <span style={{fontSize:11,color:C.muted}}>{trend.classification?.replace(/_/g," ") || "—"}</span>
          </div>
        </div>
      </div>

      {/* Today's nutrition */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Today's Nutrition</div>
        {todayLogs.length === 0 ? (
          <div style={{color:C.faint,fontSize:13,background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>Nothing logged today</div>
        ) : (
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,textAlign:"center"}}>
              {[
                { label:"CALS", val:Math.round(todayMacros.cal), color:C.text },
                { label:"PRO", val:`${Math.round(todayMacros.p)}g`, color:C.blue },
                { label:"CARBS", val:`${Math.round(todayMacros.c)}g`, color:C.green },
                { label:"FAT", val:`${Math.round(todayMacros.f)}g`, color:C.accent },
              ].map(m => (
                <div key={m.label}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:m.color,lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2,letterSpacing:1}}>{m.label}</div>
                </div>
              ))}
            </div>
            {todayLogs.length > 0 && (
              <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                {todayLogs.map(l => (
                  <div key={l.id} style={{fontSize:12,color:C.muted,marginBottom:3}}>
                    · {l.name || "Meal"} — {Math.round(l.totals?.calories || 0)} kcal / {Math.round(l.totals?.protein_g || 0)}g P
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent workouts */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Recent Workouts</div>
        {sessions.length === 0 ? (
          <div style={{color:C.faint,fontSize:13,background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>No sessions logged</div>
        ) : sessions.map(s => {
          const dayName = (s.dayKey || "Session").replace(/_/g, " ").toUpperCase();
          const mins = Math.floor((s.duration || 0) / 60);
          const date = new Date(s.ts).toLocaleDateString("en-US", { month:"short", day:"numeric" });
          const exes = (s.completedExercises || []);
          const topSets = exes.slice(0, 3).map(e => {
            const best = [...(e.loggedSets || [])].filter(x => x.reps).sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
            return best ? `${e.name} ${best.weight || 0}×${best.reps}` : e.name;
          });
          return (
            <div key={s.ts} style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.border}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontWeight:700,fontSize:13,color:C.text}}>{dayName}</span>
                <span style={{fontSize:11,color:C.muted}}>{date}{mins ? ` · ${mins}m` : ""}</span>
              </div>
              <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>
                {topSets.map((t, i) => <div key={i}>{t}</div>)}
                {exes.length > 3 && <div style={{color:C.faint}}>+{exes.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal config */}
      {goalConfig && (
        <div style={{padding:"0 20px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Goal Config</div>
          <div style={{background:C.card,borderRadius:10,padding:14,border:`1px solid ${C.border}`,fontSize:12,color:C.muted,lineHeight:2}}>
            {[
              ["Target weight", `${goalConfig.effectiveGoalWeight} lbs`],
              ["Goal body fat", `${goalConfig.goalBfPct}%`],
              ["Weekly rate", `${goalConfig.idealWeeklyRate > 0 ? "+" : ""}${goalConfig.idealWeeklyRate} lbs/wk`],
              ["Planned ETA", `${goalConfig.etaWeeks} wks (${goalConfig.etaDate})`],
              ["Sustainability", `${goalConfig.sustainabilityScore}/100`],
            ].map(([k, v]) => (
              <div key={k} style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.text,fontWeight:600}}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminScreen() {
  const C = useThemeColors();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUid, setSelectedUid] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const uidList = snap.docs.map(d => d.id);
        const results = await Promise.all(uidList.map(async uid => {
          try {
            const storageSnap = await getDocs(collection(db, "users", uid, "storage"));
            const store = {};
            storageSnap.forEach(d => { store[d.id] = d.data().value; });
            const parse = (key) => { try { return store[key] ? JSON.parse(store[key]) : null; } catch { return null; } };
            return {
              uid,
              profile:    parse("apex_user_v1"),
              weightLog:  parse("apex_weight_log_v1") || [],
              tState:     parse("apex_training_v2"),
              nutState:   parse("apex_nutrition_v1"),
              goalConfig: parse("apex_goal_config_v1"),
            };
          } catch {
            return { uid, profile: null, weightLog: [], tState: null, nutState: null, goalConfig: null };
          }
        }));
        setUsers(results.filter(u => u.profile));
      } catch (err) {
        setError(err.code === "permission-denied"
          ? "Permission denied — update Firestore rules to allow admin reads."
          : (err.message || "Failed to load users"));
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const selectedUser = selectedUid ? users.find(u => u.uid === selectedUid) : null;
  if (selectedUser) return <AdminUserDetail userData={selectedUser} onBack={() => setSelectedUid(null)} C={C}/>;

  return (
    <div className="screen" style={{background:C.bg,overflowY:"auto",paddingBottom:100}}>
      <div style={{padding:"56px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,letterSpacing:2,lineHeight:1,color:C.text}}>ROSTER</div>
        <div style={{color:C.muted,fontSize:13,marginTop:4}}>
          {loading ? "Loading..." : `${users.length} athlete${users.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {loading && (
        <div style={{padding:"40px 20px",textAlign:"center",color:C.muted,fontSize:13}}>Fetching athletes from Firestore…</div>
      )}

      {error && (
        <div style={{margin:"20px",padding:"14px 16px",background:`color-mix(in srgb,${C.red} 10%,transparent)`,border:`1px solid ${C.red}`,borderRadius:10,color:C.red,fontSize:13,lineHeight:1.6}}>
          <div style={{fontWeight:700,marginBottom:4}}>Admin access error</div>
          {error}
          <div style={{marginTop:8,color:C.muted,fontSize:11}}>Update your Firestore rules to allow reads when request.auth.email == "{ADMIN_EMAIL}"</div>
        </div>
      )}

      {!loading && !error && users.map(u => {
        const sortedLog = [...(u.weightLog || [])].sort((a, b) => a.ts - b.ts);
        const currentW = sortedLog.length ? sortedLog[sortedLog.length - 1].weight : null;
        const trend = sortedLog.length >= 3 ? analyzeWeightTrend(sortedLog) : null;
        const goalWeight = u.goalConfig?.effectiveGoalWeight;
        const goalLabel = { bulk:"BULK", cut:"CUT", maintain:"MAINTAIN", recomp:"RECOMP", contest:"CONTEST" }[u.profile?.goal] || (u.profile?.goal || "").toUpperCase();
        const sessionCount = (u.tState?.history || []).length;
        const lastSession = sessionCount ? [...(u.tState.history)].sort((a, b) => b.ts - a.ts)[0] : null;
        const lastDate = lastSession ? new Date(lastSession.ts).toLocaleDateString("en-US", { month:"short", day:"numeric" }) : null;
        const trendColor = trend?.rate < -0.1 ? C.green : trend?.rate > 0.1 ? C.red : C.muted;

        return (
          <button key={u.uid} onClick={() => setSelectedUid(u.uid)} style={{
            display:"block",width:"calc(100% - 40px)",margin:"12px 20px 0",textAlign:"left",
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
            padding:16,cursor:"pointer",transition:"border-color .15s",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:16,color:C.text,marginBottom:4}}>{u.profile.name}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center",marginBottom:4}}>
                  <span style={{background:`color-mix(in srgb,${C.accent} 15%,transparent)`,color:C.accent,padding:"1px 6px",borderRadius:4,fontWeight:700,fontSize:10}}>{goalLabel}</span>
                  <span style={{fontSize:12,color:C.muted}}>{u.profile.level || "—"}</span>
                  {sessionCount > 0 && <span style={{fontSize:11,color:C.muted}}>· {sessionCount} sessions</span>}
                  {lastDate && <span style={{fontSize:11,color:C.muted}}>· Last: {lastDate}</span>}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,lineHeight:1,color:C.text}}>{currentW ?? "—"}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>→ {goalWeight ?? "—"} lbs</div>
                {trend?.rate !== undefined && Math.abs(trend.rate) > 0.1 && (
                  <div style={{fontSize:10,color:trendColor,fontWeight:700,marginTop:3}}>
                    {trend.rate > 0 ? "▲ +" : "▼ "}{Math.abs(trend.rate).toFixed(1)}/wk
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
      <div style={{height:20}}/>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────



function NavIcon({ id }) {
  const paths = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    training: "M6.5 6.5v11M17.5 6.5v11M4 9h4.5v6H4zM15.5 9h4.5v6h-4.5zM8.5 12h7",
    nutrition: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 0v10m0 0l4.5-4.5",
    postprep: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    archive: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    coach: "M13 10V3L4 14h7v7l9-11h-7z",
    admin: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
      <path d={paths[id]}/>
    </svg>
  );
}

// ── WEEKLY DIGEST ENGINE ─────────────────────────────────────────────────────
// Deterministic weekly summary — no AI call required. Uses snapshot + trend data.

function computeWeeklyDigest(user, goalConfig, snapshots, weightTrend) {
  if (!goalConfig || snapshots.length < 2) return null;

  const latest     = snapshots[snapshots.length - 1];
  const prev       = snapshots[snapshots.length - 2];
  const goal       = user.goal || "bulk";
  const info       = getGoalRateInfo(goal);
  const weekNum    = Math.max(1, Math.round((Date.now() - goalConfig.createdAt) / (7 * 86400000)));
  const wtChange   = Math.round((latest.weight - prev.weight) * 10) / 10;
  const remaining  = goalConfig.effectiveGoalWeight !== undefined
    ? Math.round((goalConfig.effectiveGoalWeight - latest.weight) * 10) / 10 : null;
  const totalDelta = Math.abs(goalConfig.effectiveGoalWeight - goalConfig.startWeight);
  const doneDelta  = Math.abs(latest.deltaFromStart || 0);
  const pct        = totalDelta > 0 ? Math.min(100, Math.round((doneDelta / totalDelta) * 100)) : null;
  const status     = info ? classifyRate(weightTrend.rate, info) : null;

  const lines = [`Week ${weekNum} check-in — ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}:`,""];
  lines.push(`Weight: ${latest.weight} lbs  (${wtChange >= 0 ? "+" : ""}${wtChange} this week)`);
  if (remaining !== null) lines.push(`To goal: ${Math.abs(remaining).toFixed(1)} lbs${pct !== null ? `  ·  ${pct}% complete` : ""}`);
  if (latest.etaWeeks)    lines.push(`ETA: ~${latest.etaWeeks} weeks at current pace`);
  if (latest.adherenceScore !== null) lines.push(`Adherence: ${latest.adherenceScore}/100`);
  if (status?.label)      lines.push(`Pacing: ${status.label}`);
  lines.push("");

  // Actionable line based on snapshot state
  if (latest.plateauDetected) {
    const lever = goal === "bulk" ? "caloric surplus" : "caloric deficit";
    lines.push(`⚠ Progress stalled this week. Audit your ${lever} — unlogged extras are usually the culprit.`);
  } else if (latest.rateAlert === "too_fast" && (goal === "cut" || goal === "contest")) {
    lines.push(`⚠ Losing faster than optimal. Add 100–150 kcal to protect lean mass.`);
  } else if (latest.rateAlert === "too_slow") {
    lines.push(`↓ Rate below target. Tighten tracking — small daily gaps add up.`);
  } else if (latest.rateAlert === "off_course") {
    lines.push(`⚠ Moving against your goal direction. Check nutrition targets and adherence.`);
  } else if (status?.label === "On track" || status?.label === "Stable") {
    lines.push(`✓ On pace. Consistent week — keep the protocol.`);
  } else {
    lines.push(`Log daily weigh-ins to improve trend accuracy.`);
  }

  return lines.join("\n");
}

// ── INTELLIGENCE REPORT ──────────────────────────────────────────────────────
// Flagship AI analysis synthesising all system data into a structured report.
// Uses claude-sonnet-4-6 for richer language and deeper physiological insight.

async function generateIntelligenceReport(user, goalConfig, snapshots, weightTrend, goalPacing) {
  const latest    = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const bodyComp  = computeBodyComp(user);
  const weightLbs = Math.round(bodyComp.weightKg * 2.20462 * 10) / 10;

  const lines = [
    `APEX Intelligence Report — ${user.name}, ${user.sex || "male"}, ${user.age}yo`,
    `Goal: ${user.goal || "bulk"} · ${user.level || "intermediate"} · ${user.activity || "moderately_active"}`,
    ``,
    `CURRENT BODY COMPOSITION`,
    `  Weight: ${weightLbs} lbs | BF: ~${bodyComp.bfPct.toFixed(1)}% | LBM: ${(bodyComp.lbmKg * 2.20462).toFixed(1)} lbs | FFMI: ${bodyComp.ffmi.toFixed(1)}`,
    ``,
    `GOAL CONFIG`,
    `  Target: ${goalConfig.effectiveGoalWeight} lbs at ${goalConfig.goalBfPct}% BF (${goalConfig.projectedVisualOutcome})`,
    `  Sustainability: ${goalConfig.sustainabilityScore}/100 · ${goalConfig.realisticRating}`,
    `  Original ETA: ${goalConfig.etaWeeks}w · Live ETA: ${latest?.etaWeeks ?? goalConfig.etaWeeks}w`,
    goalPacing?.totalChange !== 0 ? `  Progress: ${goalPacing.totalChange > 0 ? "+" : ""}${goalPacing.totalChange} lbs from baseline (${Math.round(goalPacing.paceBarPct)}% of target)` : `  Progress: at baseline`,
    ``,
    `TREND ANALYSIS (${weightTrend.dataPoints} data points, R²=${weightTrend.confidence})`,
    `  Actual rate: ${weightTrend.rate > 0 ? "+" : ""}${weightTrend.rate} lbs/wk | Ideal rate: ${goalConfig.idealWeeklyRate > 0 ? "+" : ""}${goalConfig.idealWeeklyRate} lbs/wk`,
    `  Pacing: ${goalPacing?.statusLabel || "insufficient data"}`,
    latest?.adherenceScore != null ? `  Adherence: ${latest.adherenceScore}/100` : "",
    latest?.plateauDetected ? `  ⚠ PLATEAU DETECTED` : "",
    latest?.rateAlert ? `  ⚠ RATE ALERT: ${latest.rateAlert}` : "",
    ``,
    `Provide a full coaching analysis in exactly these 4 sections. Use the athlete's actual numbers throughout — no generic advice:`,
    ``,
    `CURRENT STATE`,
    `PROGRESS ASSESSMENT`,
    `CRITICAL FACTOR`,
    `THIS WEEK'S PRIORITY`,
    ``,
    `Max 450 words total. Direct. Specific. Real bodybuilding/physiology terminology.`,
  ].filter(Boolean).join("\n");

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 650,
      system: `You are APEX, an elite AI performance coach. Generate a precise, data-driven physique analysis. Reference the athlete's specific numbers in every section. No fluff, no hedging.`,
      messages: [{ role: "user", content: lines }],
    }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || null;
}

// ─── PHYSIQUE CHECK-IN MODAL ─────────────────────────────────────────────────

// SVG pose silhouettes — stroke-only guides for alignment consistency
const POSE_SVG = {
  front: (
    <svg viewBox="0 0 100 248" style={{width:"100%",height:"100%"}}>
      <g fill="none" stroke="rgba(245,166,35,.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="18" rx="13" ry="16"/>
        <path d="M44 33 L44 45 L56 45 L56 33"/>
        <path d="M10 57 Q22 45 44 45 L56 45 Q78 45 90 57"/>
        <path d="M10 57 L2 118 Q4 123 9 121 L18 68"/>
        <path d="M90 57 L98 118 Q96 123 91 121 L82 68"/>
        <path d="M18 68 L22 132 Q36 142 50 142 Q64 142 78 132 L82 68"/>
        <path d="M22 132 Q16 150 26 163 L34 242 L48 242 L50 205 L52 242 L66 242 L74 163 Q84 150 78 132"/>
      </g>
      <line x1="4" y1="57" x2="96" y2="57" stroke="rgba(245,166,35,.2)" strokeWidth=".6" strokeDasharray="3,3"/>
      <line x1="4" y1="132" x2="96" y2="132" stroke="rgba(245,166,35,.2)" strokeWidth=".6" strokeDasharray="3,3"/>
      <line x1="50" y1="2" x2="50" y2="246" stroke="rgba(245,166,35,.15)" strokeWidth=".6" strokeDasharray="3,3"/>
    </svg>
  ),
  side: (
    <svg viewBox="0 0 100 248" style={{width:"100%",height:"100%"}}>
      <g fill="none" stroke="rgba(245,166,35,.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="52" cy="18" rx="12" ry="16"/>
        <path d="M48 33 L48 45 L58 45 L56 33"/>
        <path d="M48 45 Q36 50 34 60 Q30 72 34 84 Q38 98 36 112 Q34 128 38 142 Q42 154 44 166 L42 242 L54 242 L55 206 L60 242 L68 242 L68 166 Q72 152 70 138 Q74 120 72 106 Q70 90 72 78 Q74 64 68 54 Q62 45 56 45"/>
        <path d="M34 60 L24 116 Q26 121 30 119 L36 84"/>
      </g>
      <line x1="4" y1="142" x2="96" y2="142" stroke="rgba(245,166,35,.2)" strokeWidth=".6" strokeDasharray="3,3"/>
    </svg>
  ),
  back: (
    <svg viewBox="0 0 100 248" style={{width:"100%",height:"100%"}}>
      <g fill="none" stroke="rgba(245,166,35,.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="18" rx="13" ry="16"/>
        <path d="M44 33 L44 45 L56 45 L56 33"/>
        <path d="M10 56 Q22 45 44 45 L56 45 Q78 45 90 56"/>
        <path d="M10 56 L2 116 Q4 121 9 119 L18 66"/>
        <path d="M90 56 L98 116 Q96 121 91 119 L82 66"/>
        <path d="M18 66 L24 130 Q38 140 50 140 Q62 140 76 130 L82 66"/>
        <path d="M24 130 Q16 150 24 164 L34 242 L48 242 L50 205 L52 242 L66 242 L76 164 Q84 150 76 130"/>
      </g>
      <line x1="4" y1="56" x2="96" y2="56" stroke="rgba(245,166,35,.2)" strokeWidth=".6" strokeDasharray="3,3"/>
      <line x1="4" y1="130" x2="96" y2="130" stroke="rgba(245,166,35,.2)" strokeWidth=".6" strokeDasharray="3,3"/>
      <line x1="50" y1="2" x2="50" y2="246" stroke="rgba(245,166,35,.15)" strokeWidth=".6" strokeDasharray="3,3"/>
    </svg>
  ),
};

const POSE_CONFIG = [
  { key:"front", label:"FRONT VIEW", tip:"Stand facing camera, arms slightly out, feet shoulder-width apart." },
  { key:"side",  label:"SIDE VIEW",  tip:"Stand in profile, arms at sides, natural posture." },
  { key:"back",  label:"BACK VIEW",  tip:"Stand with back to camera, same stance as front." },
];

const CATEGORY_LABELS = {
  beginner:"Beginner", recreational:"Recreational", intermediate:"Intermediate",
  athletic:"Athletic", advanced:"Advanced", competitor:"Competitor",
};
const ALIGNMENT_COLOR = { well_positioned:"var(--green)", on_track:"var(--accent)", needs_work:"var(--red)" };
const ALIGNMENT_LABEL = { well_positioned:"Well Positioned", on_track:"On Track", needs_work:"Needs Work" };

function PhysiqueCheckInModal({ user, currentWeight, onSave, onClose }) {
  const C = useThemeColors();
  const [step, setStep] = useState(0); // 0=intro 1-3=poses 4=analyzing 5=results
  const [photos, setPhotos] = useState({ front:null, side:null, back:null });
  const [previews, setPreviews] = useState({ front:null, side:null, back:null });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRefs = { front:useRef(), side:useRef(), back:useRef() };

  const poseStep = POSE_CONFIG[step - 1]; // null for steps 0,4,5
  const photosDone = step >= 1 && step <= 3
    ? ['front','side','back'].slice(0, step).every(p => photos[p])
    : false;
  const allDone = photos.front && photos.side && photos.back;

  const handleFile = (pose, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPhotos(p => ({ ...p, [pose]: ev.target.result }));
      setPreviews(p => ({ ...p, [pose]: ev.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAnalyze = async () => {
    setStep(4);
    setError(null);
    try {
      const res = await analyzePhysique(photos, user, currentWeight);
      if (res?.estimatedBfPct) {
        setResult(res);
        setStep(5);
      } else {
        setError("Analysis failed — try again with clearer photos in good lighting.");
        setStep(3);
      }
    } catch {
      setError("Analysis failed — check your connection.");
      setStep(3);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave(result);
    onClose();
  };

  const panelStyle = {
    width:"100%", maxWidth:430,
    background:"color-mix(in srgb,var(--card) 92%,transparent)",
    backdropFilter:"blur(24px) saturate(1.4)",
    WebkitBackdropFilter:"blur(24px) saturate(1.4)",
    borderTop:"1px solid var(--glass-border)",
    boxShadow:"var(--depth-shadow),var(--inner-light)",
    borderRadius:"20px 20px 0 0",
    maxHeight:"90vh", overflowY:"auto",
    animation:"slideUp .3s cubic-bezier(.22,1,.36,1)",
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"none"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={panelStyle}>

        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,padding:"16px 0 0"}}>
          {[1,2,3].map(i => (
            <div key={i} style={{width:6,height:6,borderRadius:"50%",
              background: step > i ? "var(--green)" : step === i ? "var(--accent)" : "var(--border)",
              transition:"background .2s"}}/>
          ))}
        </div>

        {/* ── STEP 0: INTRO ── */}
        {step === 0 && (
          <div style={{padding:"16px 24px 32px"}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:4}}>● Enhanced Analysis</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1.5,marginBottom:6}}>PHYSIQUE SCAN</div>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.65,marginBottom:20}}>
              Upload 3 photos for a precise body composition assessment — front, side, and back. APEX will estimate your BF%, lean mass, and calibrate your goal targets.
            </div>
            <div style={{background:"var(--up)",borderRadius:10,padding:"14px 16px",marginBottom:24}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:"var(--text)",marginBottom:8}}>FOR BEST RESULTS</div>
              {["Good, even lighting — avoid harsh shadows","Minimal clothing for visibility","Natural standing posture, no flexing","Full body in frame, head to toe"].map((t,i) => (
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?6:0}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"var(--accent)",flexShrink:0,marginTop:5}}/>
                  <div style={{fontSize:12,color:"var(--faint)",lineHeight:1.5}}>{t}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)}
              style={{width:"100%",padding:14,background:"var(--accent)",color:"#080A0C",border:"none",borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2,cursor:"pointer"}}>
              START SCAN ▶
            </button>
            <button onClick={onClose}
              style={{width:"100%",marginTop:10,background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8,fontFamily:"'DM Sans',sans-serif"}}>
              Cancel
            </button>
          </div>
        )}

        {/* ── STEPS 1–3: PHOTO CAPTURE ── */}
        {step >= 1 && step <= 3 && poseStep && (
          <div style={{padding:"12px 24px 32px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans'"}}>← Back</button>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)"}}>{step} / 3</div>
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,marginBottom:3}}>{poseStep.label}</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:16,lineHeight:1.5}}>{poseStep.tip}</div>

            {/* Viewfinder with silhouette overlay */}
            <div style={{position:"relative",width:"100%",aspectRatio:"3/4",background:"#0a0a0a",borderRadius:12,overflow:"hidden",marginBottom:16,border:`1px solid ${previews[poseStep.key] ? "var(--accent)" : "var(--border)"}`}}>
              {previews[poseStep.key] ? (
                <img src={previews[poseStep.key]} alt={poseStep.key}
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
              ) : (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"var(--faint)",fontSize:12}}>
                  Align with guide, then upload
                </div>
              )}
              {/* Silhouette overlay — always shown for alignment */}
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <div style={{width:"55%",height:"90%"}}>{POSE_SVG[poseStep.key]}</div>
              </div>
              {previews[poseStep.key] && (
                <div style={{position:"absolute",top:8,right:8,background:"rgba(61,220,132,.9)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,color:"#000"}}>✓ READY</div>
              )}
            </div>

            <input ref={fileRefs[poseStep.key]} type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>handleFile(poseStep.key, e)}/>

            <button onClick={()=>fileRefs[poseStep.key].current?.click()}
              style={{width:"100%",padding:13,background:previews[poseStep.key]?"var(--up)":"var(--accent)",color:previews[poseStep.key]?"var(--text)":"#080A0C",border:`2px solid ${previews[poseStep.key]?"var(--border)":"var(--accent)"}`,borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1.5,cursor:"pointer",marginBottom:10}}>
              {previews[poseStep.key] ? "RETAKE PHOTO" : `UPLOAD ${poseStep.label}`}
            </button>

            {error && <div style={{fontSize:11,color:"var(--red)",marginBottom:10,textAlign:"center"}}>{error}</div>}

            {step < 3 ? (
              <button onClick={()=>setStep(s=>s+1)} disabled={!previews[poseStep.key]}
                style={{width:"100%",padding:13,background:"var(--brutal)",color:"var(--card)",border:"none",borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1.5,cursor:previews[poseStep.key]?"pointer":"not-allowed",opacity:previews[poseStep.key]?1:.4}}>
                NEXT →
              </button>
            ) : (
              <button onClick={handleAnalyze} disabled={!allDone}
                style={{width:"100%",padding:13,background:"var(--accent)",color:"#080A0C",border:"none",borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1.5,cursor:allDone?"pointer":"not-allowed",opacity:allDone?1:.4}}>
                ⚡ ANALYZE PHYSIQUE
              </button>
            )}
          </div>
        )}

        {/* ── STEP 4: ANALYZING ── */}
        {step === 4 && (
          <div style={{padding:"40px 24px 48px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,marginBottom:8}}>ANALYZING</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:32,lineHeight:1.6}}>
              Reading muscle development, body fat distribution,<br/>and comparing to your {user.goal||"bulk"} goal...
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:10,height:10,borderRadius:"50%",background:"var(--accent)",opacity:.7,animation:`pulse ${.9+i*.15}s infinite`}}/>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: RESULTS ── */}
        {step === 5 && result && (
          <div style={{padding:"16px 24px 32px"}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:4}}>● Physique Analysis</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1.5,marginBottom:16}}>YOUR PHYSIQUE</div>

            {/* Key metrics */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:"var(--border)",borderRadius:10,overflow:"hidden",marginBottom:16}}>
              {[
                { label:"Body Fat", val:`${result.estimatedBfPct}%`, sub:"estimated" },
                { label:"Lean Mass", val:result.estimatedLbmLbs ? `${Math.round(result.estimatedLbmLbs)}lbs` : "—", sub:"lean body mass" },
                { label:"Category", val:CATEGORY_LABELS[result.physiqueCategory] || result.physiqueCategory, sub:"level" },
              ].map((m,i) => (
                <div key={i} style={{background:"var(--surface)",padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"var(--muted)",marginBottom:4}}>{m.label}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:m.label==="Category"?13:20,color:"var(--accent)",lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:8,color:"var(--faint)",marginTop:3}}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Goal alignment */}
            {result.goalAlignment && (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--up)",borderRadius:8,marginBottom:14}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:ALIGNMENT_COLOR[result.goalAlignment]||"var(--accent)"}}/>
                <div style={{fontSize:11,color:ALIGNMENT_COLOR[result.goalAlignment]||"var(--accent)",fontWeight:700,letterSpacing:.5}}>
                  {ALIGNMENT_LABEL[result.goalAlignment]||result.goalAlignment} for your {user.goal||"bulk"} goal
                </div>
                {result.recommendedBfTarget && (
                  <div style={{marginLeft:"auto",fontSize:10,color:"var(--muted)"}}>Target: {result.recommendedBfTarget}% BF</div>
                )}
              </div>
            )}

            {/* Strengths & weaknesses */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                { label:"Strengths", items:result.primaryStrengths||[], color:"var(--green)" },
                { label:"Lagging",   items:result.primaryWeaknesses||[], color:"var(--accent)" },
              ].map(col => (
                <div key={col.label} style={{background:"var(--up)",borderRadius:8,padding:"10px 12px"}}>
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:col.color,marginBottom:6,fontWeight:700}}>{col.label}</div>
                  {(col.items||[]).map((item,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:col.color,flexShrink:0}}/>
                      <div style={{fontSize:11,color:"var(--faint)",textTransform:"capitalize"}}>{item}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Projected outcome */}
            {result.projectedOutcome && (
              <div style={{padding:"10px 14px",background:"var(--up)",borderRadius:8,marginBottom:14}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:4}}>Projected outcome at target BF%</div>
                <div style={{fontSize:12,color:"var(--faint)",fontStyle:"italic",lineHeight:1.5}}>"{result.projectedOutcome}"</div>
              </div>
            )}

            {/* Coach assessment */}
            {result.coachAssessment && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:8}}>● COACH ASSESSMENT</div>
                <div style={{fontSize:13,color:"var(--faint)",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{result.coachAssessment}</div>
              </div>
            )}

            <button onClick={handleSave}
              style={{width:"100%",padding:14,background:"var(--accent)",color:"#080A0C",border:"none",borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,cursor:"pointer",marginBottom:10}}>
              UPDATE MY PROFILE →
            </button>
            <button onClick={onClose}
              style={{width:"100%",background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8,fontFamily:"'DM Sans',sans-serif"}}>
              Dismiss (don't save)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PHYSIQUE ANALYSIS ENGINE ─────────────────────────────────────────────────
// Sends front + side + back photos to Sonnet for a comprehensive body
// composition assessment. Returns structured JSON with BF%, category,
// strengths, weaknesses, goal alignment, and coaching feedback.

async function analyzePhysique(photos, user, currentWeight) {
  const content = [];
  const poseLabels = { front: "FRONT VIEW", side: "SIDE VIEW", back: "BACK VIEW" };

  for (const pose of ["front", "side", "back"]) {
    const src = photos[pose];
    if (!src) continue;
    const b64 = src.includes(",") ? src.split(",")[1] : src;
    const mime = src.startsWith("data:") ? src.split(";")[0].split(":")[1] : "image/jpeg";
    content.push({ type: "image", source: { type: "base64", media_type: mime, data: b64 } });
    content.push({ type: "text", text: `[${poseLabels[pose]}]` });
  }

  const heightCm = user.height ? Math.round(parseFloat(user.height) * 2.54) : null;
  content.push({
    type: "text",
    text: `Athlete stats: ${user.sex||"male"}, ${user.age||"?"}yo, ${user.level||"intermediate"} level, ${currentWeight} lbs${heightCm ? `, ${heightCm}cm` : ""}. Goal: ${user.goal||"bulk"}.

Analyze all three physique photos and respond ONLY with valid JSON — no other text:
{
  "estimatedBfPct": <integer 4–45>,
  "estimatedLbmLbs": <number>,
  "physiqueCategory": "<beginner|recreational|intermediate|athletic|advanced|competitor>",
  "primaryStrengths": ["<muscle group>", "<muscle group>"],
  "primaryWeaknesses": ["<muscle group>", "<muscle group>"],
  "goalAlignment": "<well_positioned|on_track|needs_work>",
  "recommendedBfTarget": <integer>,
  "projectedOutcome": "<one sentence — visual result at recommended BF%>",
  "coachAssessment": "<2–3 paragraphs: visible muscle development, body composition observations, specific recommendations for their ${user.goal||"bulk"} goal>"
}`,
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 750,
        system: "You are an elite physique analyst. Provide accurate, honest body composition assessments from photos. Respond with valid JSON only — no markdown, no explanation.",
        messages: [{ role: "user", content }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}

// ─── PROFILE EDIT MODAL ───────────────────────────────────────────────────────

function ProfileEditModal({ user, onSave, onClose }) {
  const C = useThemeColors();
  const [weight,   setWeight]   = useState(String(user.weight  || ""));
  const [height,   setHeight]   = useState(String(user.height  || ""));
  const [age,      setAge]      = useState(String(user.age     || ""));
  const [sex,      setSex]      = useState(user.sex      || "male");
  const [goal,     setGoal]     = useState(user.goal     || "bulk");
  const [level,    setLevel]    = useState(user.level    || "intermediate");
  const [activity, setActivity] = useState(user.activity || "moderately_active");

  const canSave = !!(weight && height && age &&
    parseFloat(weight) >= 50 && parseFloat(height) >= 48 && parseFloat(age) >= 13);

  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...user, weight, height, age, sex, goal, level, activity });
  };

  const inputStyle = {
    flex:1, background:"var(--up)", border:"1px solid var(--border)", borderRadius:8,
    padding:"10px 12px", color:"var(--text)", fontSize:15,
    fontFamily:"'DM Mono',monospace", outline:"none",
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.42)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:430,background:"color-mix(in srgb,var(--card) 88%,transparent)",backdropFilter:"blur(24px) saturate(1.4)",WebkitBackdropFilter:"blur(24px) saturate(1.4)",borderTop:"1px solid var(--glass-border)",boxShadow:"var(--depth-shadow),var(--inner-light)",borderRadius:"20px 20px 0 0",padding:"24px 24px 36px",animation:"slideUp .3s cubic-bezier(.22,1,.36,1)",maxHeight:"88vh",overflowY:"auto"}}>

        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1.5,marginBottom:4}}>EDIT PROFILE</div>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:20}}>Changes recompute your physique target and open a new goal phase.</div>

        {/* Body metrics */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Weight (lbs)",val:weight,set:setWeight,placeholder:"185"},
            {label:"Height (in)", val:height, set:setHeight, placeholder:"71"},
            {label:"Age",         val:age,    set:setAge,    placeholder:"28"},
          ].map(f=>(
            <div key={f.label} style={{gridColumn: f.label==="Age" ? "span 1" : "span 1"}}>
              <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{f.label}</div>
              <input type="number" value={f.val} placeholder={f.placeholder}
                onChange={e=>f.set(e.target.value)} style={inputStyle}/>
            </div>
          ))}
          <div>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Sex</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {["male","female"].map(s=>(
                <button key={s} onClick={()=>setSex(s)}
                  style={{padding:"10px 0",border:`1px solid ${sex===s?"var(--accent)":"var(--border)"}`,borderRadius:8,background:sex===s?`color-mix(in srgb,var(--accent) 14%,transparent)`:"var(--up)",color:sex===s?"var(--accent)":"var(--muted)",fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:1,cursor:"pointer",textTransform:"capitalize"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Goal</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {GOALS.map(g=>(
              <button key={g.id} onClick={()=>setGoal(g.id)}
                style={{padding:"8px 6px",border:`1px solid ${goal===g.id?"var(--accent)":"var(--border)"}`,borderRadius:8,background:goal===g.id?`color-mix(in srgb,var(--accent) 12%,transparent)`:"var(--up)",color:goal===g.id?"var(--accent)":"var(--muted)",fontFamily:"'Bebas Neue',sans-serif",fontSize:10,letterSpacing:.8,cursor:"pointer",textAlign:"center"}}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Training Level</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
            {["beginner","intermediate","advanced","competitor"].map(l=>(
              <button key={l} onClick={()=>setLevel(l)}
                style={{padding:"8px 4px",border:`1px solid ${level===l?"var(--accent)":"var(--border)"}`,borderRadius:8,background:level===l?`color-mix(in srgb,var(--accent) 12%,transparent)`:"var(--up)",color:level===l?"var(--accent)":"var(--muted)",fontFamily:"'Bebas Neue',sans-serif",fontSize:9,letterSpacing:.5,cursor:"pointer",textAlign:"center",textTransform:"capitalize"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Activity Level</div>
          <select value={activity} onChange={e=>setActivity(e.target.value)}
            style={{width:"100%",padding:"10px 12px",background:"var(--up)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:13,outline:"none"}}>
            <option value="sedentary">Sedentary — desk job, little movement</option>
            <option value="lightly_active">Lightly Active — 1–3 workouts/wk</option>
            <option value="moderately_active">Moderately Active — 3–5 workouts/wk</option>
            <option value="very_active">Very Active — hard training 5–6 days</option>
            <option value="extra_active">Extra Active — physical job + daily training</option>
          </select>
        </div>

        <CubeButton onClick={handleSave} disabled={!canSave} style={{width:"100%",marginBottom:10}}>
          SAVE PROFILE
        </CubeButton>
        <button onClick={onClose}
          style={{width:"100%",background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8,fontFamily:"'DM Sans',sans-serif"}}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── INTELLIGENCE REPORT MODAL ───────────────────────────────────────────────

function IntelligenceReportModal({ text, loading, ts, onClose, onOpenCoach }) {
  const C = useThemeColors();
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:430,background:"color-mix(in srgb,var(--card) 90%,transparent)",backdropFilter:"blur(28px) saturate(1.5)",WebkitBackdropFilter:"blur(28px) saturate(1.5)",borderTop:"1px solid var(--glass-border)",boxShadow:"var(--depth-shadow),var(--inner-light)",borderRadius:"20px 20px 0 0",
        animation:"slideUp .3s cubic-bezier(.22,1,.36,1)",maxHeight:"88vh",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"20px 24px 14px",borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:3}}>⚡ APEX INTELLIGENCE</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1.5,lineHeight:1}}>FULL ANALYSIS</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            {ts && <div style={{fontSize:9,color:"var(--muted)"}}>{new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>}
            <button onClick={onClose} style={{background:"none",border:"none",color:"var(--muted)",fontSize:18,cursor:"pointer",padding:0,lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,paddingTop:40}}>
              <div style={{display:"flex",gap:7}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:9,height:9,borderRadius:"50%",background:"var(--accent)",
                    opacity:.7,animation:`pulse ${.9+i*.15}s infinite`}}/>
                ))}
              </div>
              <div style={{fontSize:12,color:"var(--muted)",letterSpacing:1}}>Analyzing your data...</div>
              <div style={{fontSize:10,color:"var(--faint)",marginTop:-8}}>Using all tracked metrics</div>
            </div>
          ) : text ? (
            <div style={{fontSize:13,color:"var(--faint)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{text}</div>
          ) : (
            <div style={{textAlign:"center",paddingTop:40}}>
              <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>
                Analysis unavailable.<br/>Check your API connection or try again.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div style={{padding:"14px 24px 36px",borderTop:"1px solid var(--border)",flexShrink:0,display:"flex",gap:10}}>
            {text && (
              <button onClick={onOpenCoach}
                style={{flex:1,padding:"12px 0",background:"var(--accent)",color:"#080A0C",border:"none",
                  borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2,cursor:"pointer"}}>
                CONTINUE IN COACH →
              </button>
            )}
            <button onClick={onClose}
              style={{padding:"12px 20px",background:"var(--up)",color:"var(--muted)",border:"1px solid var(--border)",
                borderRadius:10,fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1.5,cursor:"pointer"}}>
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ONBOARDING TOUR ─────────────────────────────────────────────────────────
const ONBOARDING_KEY = "apex_onboarding_v1";

const OB_CARDS = [
  {
    id: "home",
    tag: "HOME",
    headline: "YOUR COMMAND\nCENTER",
    body: "Log your weight every day. APEX tracks your trend, your pace toward goal, and your body composition — automatically.",
    sub: "Consistency is the only input.",
  },
  {
    id: "training",
    tag: "TRAINING",
    headline: "YOUR\nPROGRAM",
    body: "Pick a split. APEX generates your full training program, adapts volume as you progress, and delivers AI feedback after every session.",
    sub: "It adjusts. You just lift.",
  },
  {
    id: "nutrition",
    tag: "NUTRITION",
    headline: "YOUR\nFUEL",
    body: "Log meals by describing them, tapping quick references, or photographing your food. APEX sets your daily targets based on goal and training load.",
    sub: "Text it. Tap it. Shoot it.",
  },
  {
    id: "coach",
    tag: "COACH",
    headline: "YOUR\nCOACH",
    body: "APEX Coach knows your stats, your goal, your lifts, and your trend. Ask anything — you get direct answers grounded in your actual data.",
    sub: "Questions? Just ask.",
  },
];

function ObIllustration({ id }) {
  const g = "#F5A623";
  const dim = "rgba(245,166,35,0.22)";
  if (id === "home") return (
    <svg viewBox="0 0 140 96" width={160} height={110} style={{display:"block",margin:"0 auto"}}>
      <path d="M 14 80 A 56 56 0 0 1 126 80" fill="none" stroke={dim} strokeWidth="7" strokeLinecap="round"/>
      <path d="M 14 80 A 56 56 0 0 1 126 80" fill="none" stroke={g} strokeWidth="7" strokeLinecap="round"
        strokeDasharray="117 176" style={{transition:"stroke-dasharray 1s cubic-bezier(.22,1,.36,1)"}}/>
      <circle cx="93" cy="33" r="6" fill={g}/>
      <circle cx="93" cy="33" r="11" fill="none" stroke={g} strokeWidth="1.5" opacity="0.35"/>
      <text x="14" y="92" textAnchor="middle" fontSize="9" fill={dim} fontFamily="DM Mono,monospace">START</text>
      <text x="126" y="92" textAnchor="middle" fontSize="9" fill={dim} fontFamily="DM Mono,monospace">GOAL</text>
      <text x="70" y="60" textAnchor="middle" fontSize="14" fill={g} fontFamily="Bebas Neue,sans-serif" letterSpacing="1">67%</text>
      <text x="70" y="72" textAnchor="middle" fontSize="8" fill={dim} fontFamily="DM Sans,sans-serif">to goal</text>
    </svg>
  );
  if (id === "training") return (
    <svg viewBox="0 0 160 80" width={180} height={90} style={{display:"block",margin:"0 auto"}}>
      <rect x="6" y="24" width="14" height="32" rx="3" fill="none" stroke={g} strokeWidth="2.5" opacity="0.9"/>
      <rect x="22" y="30" width="9" height="20" rx="2" fill="none" stroke={g} strokeWidth="2" opacity="0.55"/>
      <rect x="31" y="35" width="98" height="10" rx="4" fill={g} opacity="0.9"/>
      <rect x="129" y="30" width="9" height="20" rx="2" fill="none" stroke={g} strokeWidth="2" opacity="0.55"/>
      <rect x="140" y="24" width="14" height="32" rx="3" fill="none" stroke={g} strokeWidth="2.5" opacity="0.9"/>
      <line x1="80" y1="35" x2="80" y2="45" stroke="rgba(9,9,11,0.5)" strokeWidth="2"/>
    </svg>
  );
  if (id === "nutrition") return (
    <svg viewBox="0 0 120 120" width={120} height={120} style={{display:"block",margin:"0 auto"}}>
      <circle cx="60" cy="60" r="44" fill="none" stroke={dim} strokeWidth="6"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke={g} strokeWidth="6"
        strokeDasharray="166 276" strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.95"/>
      <circle cx="60" cy="60" r="32" fill="none" stroke={dim} strokeWidth="5"/>
      <circle cx="60" cy="60" r="32" fill="none" stroke={g} strokeWidth="5"
        strokeDasharray="100 201" strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.55"/>
      <circle cx="60" cy="60" r="20" fill="none" stroke={dim} strokeWidth="4"/>
      <circle cx="60" cy="60" r="20" fill="none" stroke={g} strokeWidth="4"
        strokeDasharray="56 126" strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.3"/>
      <text x="60" y="57" textAnchor="middle" fontSize="10" fill={g} fontFamily="Bebas Neue,sans-serif" letterSpacing="1.5">MACRO</text>
      <text x="60" y="68" textAnchor="middle" fontSize="8" fill={dim} fontFamily="DM Mono,monospace">P · C · F</text>
    </svg>
  );
  if (id === "coach") return (
    <svg viewBox="0 0 120 100" width={130} height={110} style={{display:"block",margin:"0 auto"}}>
      <path d="M 64 8 L 48 44 L 59 44 L 54 78 L 76 38 L 64 38 Z" fill="none" stroke={g} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M 36 22 A 30 30 0 0 0 36 78" fill="none" stroke={g} strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
      <path d="M 24 12 A 44 44 0 0 0 24 88" fill="none" stroke={g} strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
      <path d="M 84 22 A 30 30 0 0 1 84 78" fill="none" stroke={g} strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
      <path d="M 96 12 A 44 44 0 0 1 96 88" fill="none" stroke={g} strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
    </svg>
  );
  return null;
}

function OnboardingCarousel({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back
  const touchStartX = useRef(null);

  const advance = () => {
    if (current < OB_CARDS.length - 1) {
      setDir(1); setExiting(true);
      setTimeout(() => { setCurrent(c => c + 1); setExiting(false); }, 320);
    } else {
      onComplete();
    }
  };

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) advance();
    else if (dx > 50 && current > 0) {
      setDir(-1); setExiting(true);
      setTimeout(() => { setCurrent(c => c - 1); setExiting(false); }, 320);
    }
  };

  const card = OB_CARDS[current];
  const isLast = current === OB_CARDS.length - 1;

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:1000,
      background:"#09090B",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",
      padding:"env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)",
      overflow:"hidden",
    }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Warm glow behind illustration */}
      <div style={{
        position:"absolute",top:"15%",left:"50%",transform:"translateX(-50%)",
        width:280,height:280,
        background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,166,35,0.09) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>

      {/* Skip */}
      <div style={{width:"100%",display:"flex",justifyContent:"flex-end",padding:"56px 28px 0",position:"relative",zIndex:1}}>
        <button onClick={onComplete} style={{background:"none",border:"none",color:"rgba(134,140,150,0.6)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:.5,padding:"4px 0"}}>
          SKIP
        </button>
      </div>

      {/* Card content */}
      <div style={{
        flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"0 36px",
        transform: exiting ? `translateX(${dir * -40}px)` : "translateX(0)",
        opacity: exiting ? 0 : 1,
        transition:"transform 0.32s cubic-bezier(.22,1,.36,1), opacity 0.32s ease",
        textAlign:"center",
        position:"relative",zIndex:1,
      }}>
        {/* Illustration */}
        <div style={{marginBottom:32}}>
          <ObIllustration id={card.id}/>
        </div>

        {/* Tag */}
        <div style={{
          fontSize:9,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,
          color:"#F5A623",marginBottom:12,
          display:"flex",alignItems:"center",gap:8,
        }}>
          <div style={{width:20,height:1,background:"rgba(245,166,35,0.4)"}}/>
          {card.tag}
          <div style={{width:20,height:1,background:"rgba(245,166,35,0.4)"}}/>
        </div>

        {/* Headline */}
        <div style={{
          fontFamily:"'Bebas Neue',sans-serif",
          fontSize:46,letterSpacing:2,lineHeight:1.0,
          color:"#F0EDE8",marginBottom:20,
          whiteSpace:"pre-line",
        }}>
          {card.headline}
        </div>

        {/* Body */}
        <div style={{
          fontSize:15,color:"#868C96",lineHeight:1.7,
          maxWidth:300,marginBottom:16,
        }}>
          {card.body}
        </div>

        {/* Sub */}
        <div style={{fontSize:13,color:"rgba(245,166,35,0.7)",fontStyle:"italic",letterSpacing:.3}}>
          {card.sub}
        </div>
      </div>

      {/* Bottom — dots + CTA */}
      <div style={{width:"100%",padding:"0 36px 48px",position:"relative",zIndex:1}}>
        {/* Dot indicators */}
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28}}>
          {OB_CARDS.map((_, i) => (
            <div key={i} style={{
              height:5,
              width: i === current ? 22 : 5,
              borderRadius:3,
              background: i === current ? "#F5A623" : "rgba(245,166,35,0.25)",
              transition:"all 0.3s cubic-bezier(.22,1,.36,1)",
            }}/>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={advance}
          style={{
            width:"100%",padding:"16px 0",
            background: isLast ? "#F5A623" : "transparent",
            color: isLast ? "#09090B" : "#F0EDE8",
            border: isLast ? "none" : "1px solid rgba(240,237,232,0.2)",
            borderRadius:12,
            fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2.5,
            cursor:"pointer",
            transition:"all 0.2s ease",
          }}
        >
          {isLast ? "GET STARTED →" : "NEXT"}
        </button>
      </div>
    </div>
  );
}

// Tab-contextual tooltip — appears once per tab on first visit
const TAB_TIPS = {
  home:     "Log your weight above — even a rough number starts your trend.",
  training: "Tap a split card below to generate your full program.",
  nutrition:"Tap + to log your first meal — describe it, or use a photo.",
  coach:    "Ask APEX anything — it knows your goal, your lifts, your trend.",
};

function TabTooltip({ tabId, onDismiss }) {
  const [vis, setVis] = useState(false);
  const text = TAB_TIPS[tabId];

  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 500);
    const t2 = setTimeout(() => { setVis(false); setTimeout(onDismiss, 350); }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [tabId]);

  const dismiss = () => { setVis(false); setTimeout(onDismiss, 350); };
  if (!text) return null;

  const isTop = tabId === "home";

  return (
    <div style={{
      position:"fixed",
      ...(isTop ? { top: 130 } : { bottom: 160 }),
      left:"50%",
      transform:`translateX(-50%) translateY(${vis ? 0 : isTop ? -16 : 16}px)`,
      opacity: vis ? 1 : 0,
      transition:"transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.3s ease",
      zIndex:600,
      width:"calc(100% - 48px)",
      maxWidth:340,
      pointerEvents: vis ? "auto" : "none",
    }}>
      {/* Arrow for home (points up) */}
      {isTop && (
        <div style={{display:"flex",justifyContent:"center",marginBottom:-1}}>
          <svg width="16" height="9" viewBox="0 0 16 9" style={{display:"block"}}>
            <path d="M8 0 L16 9 L0 9 Z" fill="#1A1917"/>
            <path d="M8 1.5 L14.5 9 L1.5 9" fill="none" stroke="rgba(245,166,35,0.5)" strokeWidth="1"/>
          </svg>
        </div>
      )}
      <div style={{
        background:"#1A1917",
        border:"1px solid rgba(245,166,35,0.5)",
        borderRadius:12,
        padding:"12px 14px 12px 16px",
        display:"flex",alignItems:"center",gap:10,
        boxShadow:"0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.1)",
      }}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#F5A623",flexShrink:0,boxShadow:"0 0 8px rgba(245,166,35,0.6)"}}/>
        <span style={{fontSize:13,color:"#F0EDE8",lineHeight:1.55,flex:1}}>{text}</span>
        <button onClick={dismiss} style={{background:"none",border:"none",color:"rgba(134,140,150,0.7)",fontSize:15,cursor:"pointer",padding:"0 0 0 4px",flexShrink:0,lineHeight:1}}>✕</button>
      </div>
      {/* Arrow for non-home (points down toward nav) */}
      {!isTop && (
        <div style={{display:"flex",justifyContent:"center",marginTop:-1}}>
          <svg width="16" height="9" viewBox="0 0 16 9" style={{display:"block"}}>
            <path d="M8 9 L0 0 L16 0 Z" fill="#1A1917"/>
            <path d="M8 7.5 L1.5 0 L14.5 0" fill="none" stroke="rgba(245,166,35,0.5)" strokeWidth="1"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// Fires once after onboarding; sends GoalConfig data to Claude for a
// personalised opening analysis, saves to GOAL_ANALYSIS_KEY for injection
// into the Coach tab on first open.
async function generateGoalRationale(user, gc) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 420,
        system: `You are APEX, an elite AI performance coach. Deliver a direct, specific post-onboarding goal analysis. 3 short paragraphs. No fluff — real training and physiology terminology only.`,
        messages: [{
          role: "user",
          content: `New athlete:
- ${user.name}, ${user.sex || "male"}, ${user.age}yo, ${user.level || "intermediate"} level
- Current: ${gc.startWeight} lbs at ~${gc.startBfPct}% BF (${gc.currentVisualOutcome})
- Goal: ${gc.goalType} → ${gc.effectiveGoalWeight} lbs at ${gc.goalBfPct}% BF
- Target look: ${gc.projectedVisualOutcome}
- Timeline: ${gc.etaWeeks} weeks · ${gc.realisticRating} · ${gc.sustainabilityScore}/100 sustainability

Deliver their opening goal analysis:
1. Why this target weight makes physiological sense for their specific body composition (reference lean mass and BF%)
2. What the first 2 weeks should focus on to build the right foundation
3. The single most important metric to track that will confirm they're on course

Be specific and direct. Use their actual numbers. Don't hedge.`,
        }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text;
    if (!text) return;
    const entry = { text, ts: Date.now(), goalType: gc.goalType, goalWeight: gc.effectiveGoalWeight, read: false };
    window.storage.set(GOAL_ANALYSIS_KEY, JSON.stringify(entry)).catch(() => {});
  } catch {}
}

function AppInner() {
  const [user,setUser]=useState(null);
  const [userLoaded, setUserLoaded]=useState(false);
  const [tab,setTab]=useState("home");
  const { session, endSession } = useSession();
  const [weightLog, setWeightLog] = useState([]);
  const [wtLoaded, setWtLoaded] = useState(false);
  const { authUser, signOut } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const sessionRestoredRef = useRef(false);
  const [obState, setObState] = useState(null);      // onboarding state
  const [activeTooltip, setActiveTooltip] = useState(null); // tab id or null

  // If an active session exists when the app loads (e.g. after iOS Safari refresh),
  // immediately restore to the Training tab so the workout is not hidden
  useEffect(() => {
    if (sessionRestoredRef.current) return;
    if (userLoaded && session?.startedAt) {
      sessionRestoredRef.current = true;
      setTab("training");
    }
  }, [userLoaded, session?.startedAt]);

  // Load user profile — gate render until resolved so returning users never flash onboarding
  useEffect(() => {
    window.storage.get(USER_KEY).then(r => {
      if (r?.value) {
        try { setUser(JSON.parse(r.value)); } catch {}
      }
      setUserLoaded(true);
    }).catch(() => setUserLoaded(true));
  }, []);

  useEffect(() => {
    window.storage.get(WT_KEY).then(r => {
      if (r?.value) {
        try { setWeightLog(JSON.parse(r.value)); } catch {}
      }
      setWtLoaded(true);
    }).catch(() => setWtLoaded(true));
  }, []);

  // Load onboarding state; auto-complete for existing users that predate this feature
  useEffect(() => {
    window.storage.get(ONBOARDING_KEY).then(async r => {
      if (r?.value) {
        try { setObState(JSON.parse(r.value)); } catch { setObState({ welcomeDone:true, tabsSeen:[] }); }
        return;
      }
      // No key yet — check if this is a returning user (has weight data)
      const wt = await window.storage.get(WT_KEY).catch(() => null);
      const hasData = wt?.value && (() => { try { return JSON.parse(wt.value).length > 0; } catch { return false; } })();
      const init = hasData
        ? { welcomeDone:true, tabsSeen:["home","training","nutrition","coach"] }
        : { welcomeDone:false, tabsSeen:[] };
      window.storage.set(ONBOARDING_KEY, JSON.stringify(init)).catch(() => {});
      setObState(init);
    }).catch(() => setObState({ welcomeDone:true, tabsSeen:[] }));
  }, []);

  // Show tab tooltip on first visit after welcome is done
  useEffect(() => {
    if (!obState?.welcomeDone) return;
    if (obState.tabsSeen?.includes(tab)) return;
    if (!TAB_TIPS[tab]) return;
    setActiveTooltip(tab);
    const updated = { ...obState, tabsSeen: [...(obState.tabsSeen || []), tab] };
    setObState(updated);
    window.storage.set(ONBOARDING_KEY, JSON.stringify(updated)).catch(() => {});
  }, [tab, obState?.welcomeDone]);

  const handleWelcomeDone = () => {
    const updated = { ...obState, welcomeDone:true };
    setObState(updated);
    window.storage.set(ONBOARDING_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleLogWeight = useCallback(async (w) => {
    const today = new Date().toLocaleDateString("en-US", {month:"short", day:"numeric"});
    const ts = Date.now();
    setWeightLog(prev => {
      const filtered = prev.filter(e => e.date !== today);
      const updated = [...filtered, {date: today, weight: w, ts}];
      window.storage.set(WT_KEY, JSON.stringify(updated)).catch(()=>{});
      return updated;
    });
  }, []);

  const handleDeleteWeight = useCallback((ts) => {
    setWeightLog(prev => {
      const updated = prev.filter(e => e.ts !== ts);
      window.storage.set(WT_KEY, JSON.stringify(updated)).catch(()=>{});
      return updated;
    });
  }, []);

  const handleEditWeight = useCallback((ts, newWeight) => {
    setWeightLog(prev => {
      const updated = prev.map(e => e.ts === ts ? { ...e, weight: newWeight } : e);
      window.storage.set(WT_KEY, JSON.stringify(updated)).catch(()=>{});
      return updated;
    });
  }, []);

  const sortedLog = [...weightLog].sort((a,b) => a.ts - b.ts);
  const currentWeight = sortedLog.length > 0 ? sortedLog[sortedLog.length-1].weight : (parseFloat(user?.weight) || 0);
  const enrichedUser = user ? {...user, weight: currentWeight || user.weight} : null;

  // ── WEIGHT REMINDER NOTIFICATION ─────────────────────────────────────────
  // Stable date key for throttling (YYYY-MM-DD, local time, timezone-safe)
  const todayDateKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();
  // Today formatted the same way weight entries store their date
  const todayDisplay = new Date().toLocaleDateString("en-US", {month:"short", day:"numeric"});

  // Lazy-init dismissed state from localStorage — prevents flash-of-notification on reload
  const [notifDismissed, setNotifDismissed] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}");
      return s.dismissedDate === todayDateKey;
    } catch { return false; }
  });

  // Derive notification state reactively — auto-clears when weight is logged
  const notifState = useMemo(() => {
    if (!user || !wtLoaded) return null;
    const loggedToday = sortedLog.some(e => e.date === todayDisplay);
    if (loggedToday) return null; // already logged — no notification

    const lastEntry = sortedLog.length > 0 ? sortedLog[sortedLog.length - 1] : null;
    const daysSince = lastEntry
      ? Math.max(0, Math.floor((Date.now() - lastEntry.ts) / 86400000))
      : null;

    // 7+ days: urgent — no manual dismiss, must log to clear
    if (daysSince !== null && daysSince >= 7) return { type: "week", daysAgo: daysSince };
    // No log today: daily gentle reminder
    return { type: "daily", daysAgo: daysSince };
  }, [user, wtLoaded, sortedLog, todayDisplay]);

  // Show if: week type (always) OR daily type and not yet dismissed today
  const showNotif = !!(notifState && (notifState.type === "week" || !notifDismissed));

  const handleDismissNotif = () => {
    setNotifDismissed(true);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify({ dismissedDate: todayDateKey })); } catch {}
  };

  const isAdmin = authUser?.email === ADMIN_EMAIL;

  const NAV = [
    {id:"home",label:"Home"},
    {id:"training",label:"Training"},
    {id:"nutrition",label:"Nutrition"},
    ...(user?.goal==="contest" ? [{id:"postprep",label:"Rebound"}] : []),
    {id:"coach",label:"Coach"},
    ...(isAdmin ? [{id:"admin",label:"Roster"}] : []),
  ];

  const [endConfirm, setEndConfirm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleProfileSave = async (newUser) => {
    setShowProfileEdit(false);
    // Persist updated user
    window.storage.set(USER_KEY, JSON.stringify(newUser)).catch(() => {});
    // Recompute goal config for new profile
    const newGc = computeGoalConfig(newUser);
    window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(newGc)).catch(() => {});
    // Close the current open phase and open a new one
    try {
      const r = await window.storage.get(GOAL_HISTORY_KEY);
      const hist = r?.value ? (JSON.parse(r.value) || []) : [];
      const now  = Date.now();
      // Close the most recent open phase
      const closed = hist.map((p, i) =>
        i === hist.length - 1 && p.outcome === "ongoing"
          ? { ...p, endTs: now, endWeight: currentWeight, outcome: "revised" }
          : p
      );
      // Open a new phase for the new goal
      closed.push({
        phase:       newUser.goal  || "bulk",
        startTs:     now,
        endTs:       null,
        startWeight: currentWeight,
        endWeight:   null,
        startBfPct:  newGc.startBfPct,
        endBfPct:    null,
        goalWeight:  newGc.effectiveGoalWeight,
        outcome:     "ongoing",
      });
      window.storage.set(GOAL_HISTORY_KEY, JSON.stringify(closed)).catch(() => {});
    } catch {}
    // Re-generate AI rationale for updated goal
    generateGoalRationale(newUser, newGc);
    setUser(newUser);
  };

  const handleGoalTransition = async (newGoalType) => {
    if (!user) return;
    const newUser = { ...user, goal: newGoalType };
    window.storage.set(USER_KEY, JSON.stringify(newUser)).catch(() => {});
    const gc = computeGoalConfig(newUser);
    window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(gc)).catch(() => {});
    // Close current phase as "completed", open new one
    try {
      const r    = await window.storage.get(GOAL_HISTORY_KEY);
      const hist = r?.value ? (JSON.parse(r.value) || []) : [];
      const now  = Date.now();
      const closed = hist.map((p, i) =>
        i === hist.length - 1 && p.outcome === "ongoing"
          ? { ...p, endTs: now, endWeight: currentWeight, outcome: "completed" }
          : p
      );
      closed.push({
        phase: newGoalType, startTs: now, endTs: null,
        startWeight: currentWeight, endWeight: null,
        startBfPct: gc.startBfPct, endBfPct: null,
        goalWeight: gc.effectiveGoalWeight, outcome: "ongoing",
      });
      window.storage.set(GOAL_HISTORY_KEY, JSON.stringify(closed)).catch(() => {});
    } catch {}
    // Phase completion summary — use the `closed` array we already computed above,
    // not a second storage read (avoids the null.slice bug and stale-data race)
    try {
      const completedPhase = closed.slice(-2)[0]; // second-to-last = the one just closed
      if (completedPhase?.outcome === "completed") {
        const fr = await window.storage.get(FEEDBACK_KEY);
        const farr = fr?.value ? (JSON.parse(fr.value) || []) : [];
        const existing2 = Array.isArray(farr) ? farr : Object.values(farr).filter(v => v?.text);
        const weeks = Math.max(1, Math.round((Date.now() - completedPhase.startTs) / (7 * 86400000)));
        const wtChg = completedPhase.endWeight != null && completedPhase.startWeight != null
          ? (completedPhase.endWeight - completedPhase.startWeight).toFixed(1) : null;
        const lines = [
          `Phase complete: ${completedPhase.phase.toUpperCase()} — ${weeks} week${weeks !== 1 ? "s" : ""}`,
          wtChg !== null ? `Weight: ${parseFloat(wtChg) > 0 ? "+" : ""}${wtChg} lbs  (${completedPhase.startWeight} → ${completedPhase.endWeight} lbs)` : "",
          completedPhase.startBfPct ? `Started at ~${completedPhase.startBfPct}% BF` : "",
        ].filter(Boolean).join("\n");
        const entry2 = { id: String(Date.now()), text: lines, ts: Date.now(),
          dayKey: `phase_${completedPhase.phase}_complete`, muscles: [], read: false };
        window.storage.set(FEEDBACK_KEY, JSON.stringify([entry2, ...existing2].slice(-52))).catch(() => {});
      }
    } catch {}
    generateGoalRationale(newUser, gc);
    setUser(newUser);
  };

  const handleMiniEnd = () => {
    if (endConfirm) { endSession(); setEndConfirm(false); }
    else { setEndConfirm(true); setTimeout(() => setEndConfirm(false), 3000); }
  };

  if (!userLoaded) return (
    <div className="auth-loading">
      <div className="auth-loading-text">APEX</div>
    </div>
  );

  // Returning user (account older than 2 min) but no local profile — Firestore sync failed
  const isReturningUser = authUser && (() => {
    const created = new Date(authUser.metadata.creationTime).getTime();
    return Date.now() - created > 2 * 60 * 1000;
  })();

  const handleRetrySync = async () => {
    setRetrying(true);
    setRetryFailed(false);
    const found = await window.storage.retrySync();
    if (found) {
      // Re-read user from localStorage now that sync succeeded
      const r = await window.storage.get(USER_KEY);
      if (r?.value) {
        try { setUser(JSON.parse(r.value)); return; } catch {}
      }
    }
    setRetrying(false);
    setRetryFailed(true);
  };

  if (!user && isReturningUser) return (
    <div className="auth-screen">
      <WaveField fixed opacity={0.18} />
      <div className="auth-eyebrow">Data Sync</div>
      <div className="auth-wordmark">APEX</div>
      <div className="auth-card">
        <div className="auth-card-title">
          Couldn't load your profile
          <span>Your account exists but your data isn't on this device yet.</span>
        </div>
        <button className="auth-submit" onClick={handleRetrySync} disabled={retrying}>
          {retrying ? "SYNCING..." : "RETRY SYNC →"}
        </button>
        {retryFailed && (
          <div style={{fontSize:12,color:"var(--red,#e53e3e)",textAlign:"center",marginTop:4}}>
            No data found in cloud. Sign in on your original device first to upload your data.
          </div>
        )}
        <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.7,borderLeft:"3px solid var(--border)",paddingLeft:12,marginTop:4}}>
          If retry fails: open the app on your original device, sign in there, then come back and tap Retry Sync.
        </div>
        <button className="auth-submit" style={{marginTop:8,background:"none",border:"2px solid var(--brutal)",color:"var(--text)",boxShadow:"3px 3px 0 var(--brutal)"}} onClick={()=>setUser(null)||setUserLoaded(true)}>
          START FRESH ON THIS DEVICE →
        </button>
        <button onClick={signOut} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"var(--muted)",fontSize:12,cursor:"pointer",padding:8,fontFamily:"'DM Sans',sans-serif"}}>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {showProfileEdit && user && (
        <ProfileEditModal user={user} onSave={handleProfileSave} onClose={()=>setShowProfileEdit(false)}/>
      )}
      {!user ? <OnboardScreen onComplete={u=>{
        window.storage.set(USER_KEY, JSON.stringify(u)).catch(()=>{});
        const gc = computeGoalConfig(u);
        window.storage.set(GOAL_CONFIG_KEY, JSON.stringify(gc)).catch(()=>{});
        // Write first phase record
        const firstPhase = [{
          phase: u.goal || "bulk", startTs: Date.now(), endTs: null,
          startWeight: parseFloat(u.weight) || 0, endWeight: null,
          startBfPct: gc.startBfPct, endBfPct: null,
          goalWeight: gc.effectiveGoalWeight, outcome: "ongoing",
        }];
        window.storage.set(GOAL_HISTORY_KEY, JSON.stringify(firstPhase)).catch(()=>{});
        generateGoalRationale(u, gc);
        // Mark onboarding as unseen for fresh users
        const fresh = { welcomeDone:false, tabsSeen:[] };
        setObState(fresh);
        window.storage.set(ONBOARDING_KEY, JSON.stringify(fresh)).catch(() => {});
        setUser(u); setTab("home");
      }}/> : (
          <>
            {/* Onboarding carousel — fires once after first profile setup */}
            {obState && !obState.welcomeDone && (
              <OnboardingCarousel onComplete={handleWelcomeDone}/>
            )}
            {/* Tab tooltip — fires once per tab on first visit */}
            {activeTooltip && (
              <TabTooltip key={activeTooltip} tabId={activeTooltip} onDismiss={() => setActiveTooltip(null)}/>
            )}
            {/* Weight reminder banner — fixed overlay, visible on all tabs */}
            {showNotif && (
              <WeightReminderBanner
                type={notifState.type}
                daysAgo={notifState.daysAgo}
                onDismiss={notifState.type === "daily" ? handleDismissNotif : null}
                onLogNow={() => setTab("home")}
              />
            )}
            {tab==="home"&&<DashboardScreen user={enrichedUser} weightLog={weightLog} onLogWeight={handleLogWeight} onDeleteWeight={handleDeleteWeight} onEditWeight={handleEditWeight} onNavigate={setTab} onEditProfile={()=>setShowProfileEdit(true)} onGoalTransition={handleGoalTransition}/>}
            {tab==="training"&&<TrainingScreen user={enrichedUser} onNavigate={setTab}/>}
            {tab==="nutrition"&&<NutritionScreen user={enrichedUser}/>}
            {tab==="postprep"&&user?.goal==="contest"&&<PostPrepScreen user={enrichedUser}/>}
            {tab==="coach"&&<CoachScreen user={enrichedUser}/>}
            {tab==="admin"&&isAdmin&&<AdminScreen/>}
            {/* Mini session view — shown on all non-training tabs when a session is active */}
            {session && tab !== "training" && (
              <MiniSessionView
                onExpand={() => setTab("training")}
                onEnd={handleMiniEnd}
                endConfirm={endConfirm}
              />
            )}
            <nav className="nav">
              <div className="nav-pill">
                <div className="nav-glider" style={{
                  width:`${100/NAV.length}%`,
                  transform:`translateX(${NAV.findIndex(n=>n.id===tab)*100}%)`,
                }}/>
                {NAV.map(n=>(
                  <button key={n.id} className={`ni ${tab===n.id?"on":""}`} onClick={()=>setTab(n.id)}>
                    <NavIcon id={n.id}/>
                    {n.id === "training" && session && tab !== "training"
                      ? <span className="ni-label" style={{color:"var(--accent)"}}>● Active</span>
                      : <span className="ni-label">{n.label}</span>
                    }
                  </button>
                ))}
              </div>
            </nav>
          </>
        )}
    </div>
  );
}

function AppWithAuth() {
  const { authUser } = useAuth();

  if (authUser === undefined) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-text">APEX</div>
      </div>
    );
  }

  if (!authUser) return <AuthScreen />;

  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  );
}

export default function App() {
  return (
    <>
      <style>{styles}</style>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </>
  );
}
