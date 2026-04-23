import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";

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
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

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
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
.app{max-width:430px;min-height:100vh;margin:0 auto;background:var(--bg);position:relative;}

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
  font-size:10px;letter-spacing:2px;
  text-transform:uppercase;
  color:var(--muted);font-weight:600;
}
.ob2-back-btn{
  background:none;border:none;
  font-size:12px;color:var(--muted);
  cursor:pointer;padding:4px 0;
  font-family:'Inter',sans-serif;
  transition:color .15s;
}
.ob2-back-btn:hover{color:var(--text);}
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
.ob2-list{flex:1;display:flex;flex-direction:column;gap:2px;margin-bottom:28px;overflow-y:auto;}
.ob2-row{
  display:flex;align-items:center;gap:14px;
  padding:14px 16px;
  border-radius:10px;
  cursor:pointer;
  transition:background .12s, color .12s;
  background:transparent;
  border:none;
  text-align:left;width:100%;
}
.ob2-row:hover{background:var(--up);}
.ob2-row.sel{background:var(--text);}
@media(prefers-color-scheme:dark){
  .ob2-row.sel{background:var(--up);outline:1.5px solid var(--accent);}
}
.ob2-row-num{
  font-family:'Bebas Neue',sans-serif;
  font-size:18px;
  color:var(--accent);
  line-height:1;width:28px;flex-shrink:0;
}
.ob2-row-info{flex:1;}
.ob2-row-name{font-size:14px;font-weight:600;color:var(--text);line-height:1.2;}
.ob2-row.sel .ob2-row-name{color:#F0EDE8;}
@media(prefers-color-scheme:dark){
  .ob2-row.sel .ob2-row-name{color:var(--text);}
}
.ob2-row-desc{font-size:11px;color:var(--muted);margin-top:2px;}
.ob2-row.sel .ob2-row-desc{color:#F0EDE8;opacity:.55;}
@media(prefers-color-scheme:dark){
  .ob2-row.sel .ob2-row-desc{color:var(--muted);opacity:1;}
}
.ob2-row-check{
  width:18px;height:18px;border-radius:50%;
  border:1.5px solid var(--border);
  flex-shrink:0;display:flex;
  align-items:center;justify-content:center;
  color:var(--accent);
  transition:all .15s;
}
.ob2-row.sel .ob2-row-check{background:var(--accent);border-color:var(--accent);color:#fff;}

/* Level rows — taller, left bar accent */
.ob2-level-row{
  padding:18px 16px 18px 20px;
  border-radius:10px;
  cursor:pointer;
  border-left:3px solid transparent;
  transition:all .15s;
  background:transparent;
}
.ob2-level-row:hover{background:var(--up);}
.ob2-level-row.sel{border-left-color:var(--accent);background:var(--surface);}
.ob2-level-name{
  font-family:'Bebas Neue',sans-serif;
  font-size:22px;letter-spacing:.5px;
  color:var(--text);line-height:1;
}
.ob2-level-row.sel .ob2-level-name{color:var(--accent);}
.ob2-level-desc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4;}

/* Profile form */
.ob2-form{flex:1;display:flex;flex-direction:column;gap:16px;margin-bottom:24px;}
.ob2-field{display:flex;flex-direction:column;gap:5px;}
.ob2-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ob2-label{
  font-size:10px;font-weight:600;
  letter-spacing:.5px;text-transform:uppercase;
  color:var(--muted);
}
.ob2-input{
  background:var(--up);
  border:2px solid var(--brutal);
  border-radius:10px;
  padding:13px 16px;
  color:var(--text);
  font-size:16px;
  font-family:'Inter',sans-serif;
  outline:none;
  transition:border-color .2s,box-shadow .2s;
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
.btn-outline{background:var(--up);border:2px solid var(--brutal);color:var(--muted);padding:10px 18px;border-radius:100px;font-family:'Inter',sans-serif;font-size:13px;cursor:pointer;transition:all .15s ease;box-shadow:inset 0 0.2rem 0.5rem rgba(255,255,255,0.15),inset 0 -0.2rem 0.4rem rgba(0,0,0,0.3);}
.btn-outline:hover{border-color:var(--accent);color:var(--accent);}

/* INPUTS */
.igroup{display:flex;flex-direction:column;gap:6px;}
.ilabel{font-size:11px;font-weight:500;letter-spacing:.3px;color:var(--muted);}
.ifield{background:var(--up);border:2px solid var(--brutal);border-radius:10px;padding:13px 16px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;}
.ifield:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.irow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-top:1px solid var(--border);padding:8px 0 20px;display:flex;justify-content:space-around;z-index:100;}
.ni{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:4px 12px;border:none;background:transparent;transition:color .2s,transform .12s cubic-bezier(.22,1,.36,1);color:var(--muted);position:relative;}
.ni::after{content:'';position:absolute;top:0;left:25%;right:25%;height:2px;background:var(--accent);border-radius:0 0 2px 2px;transform:scaleX(0);transition:transform .22s cubic-bezier(.22,1,.36,1);transform-origin:center;}
.ni.on::after{transform:scaleX(1);}
.ni:active{transform:scale(0.9);}
.ni svg{width:22px;height:22px;transition:color .2s;}
.ni-label{font-size:10px;color:var(--muted);transition:color .2s;font-weight:500;letter-spacing:.1px;}
.ni.on{color:var(--accent);}
.ni.on .ni-label{color:var(--accent);}

/* SCREENS */
.screen{padding:0 0 96px;min-height:100vh;animation:screenIn .28s cubic-bezier(.22,1,.36,1);}
@keyframes screenIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes musclePulse{0%,100%{opacity:.82}50%{opacity:1;filter:drop-shadow(0 0 6px rgba(220,60,60,.75))}}
.sh{padding:54px 24px 20px;display:flex;align-items:center;justify-content:space-between;}
.sh-label{font-size:12px;color:var(--muted);font-weight:500;}
.sh-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:1.5px;color:var(--text);}
.sh-avatar{width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#FFF;flex-shrink:0;}
.stitle{font-size:12px;font-weight:600;letter-spacing:.5px;color:var(--muted);text-transform:uppercase;padding:0 24px;margin-bottom:12px;margin-top:24px;}
.stitle:first-child{margin-top:0;}

/* DASHBOARD */
/* Weight hero — dominant full-width block */
.wt-hero{margin:0 24px 16px;background:var(--card);border:2px solid var(--brutal);border-radius:14px;padding:22px 22px 18px;box-shadow:4px 4px 0 var(--brutal);transition:border-color .2s,box-shadow .2s;}
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
.wt-history{display:flex;gap:6px;align-items:flex-end;height:40px;margin-bottom:14px;}
.wt-bar-wrap{display:flex;flex-direction:column;align-items:center;flex:1;}
.wt-bar{border-radius:3px 3px 0 0;min-height:4px;transition:height .5s ease;width:100%;max-width:18px;}
.wt-input-row{display:flex;gap:8px;}
.wt-input{flex:1;background:var(--up);border:2px solid var(--brutal);border-radius:10px;padding:11px 44px 11px 14px;color:var(--text);font-size:18px;font-family:'Bebas Neue',sans-serif;letter-spacing:2px;outline:none;transition:border-color .2s,box-shadow .2s;}
.wt-input:focus{border-color:var(--accent);box-shadow:3px 3px 0 var(--accent);}
.wt-input-unit{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--muted);}
.wt-log-btn{padding:0 20px;background:var(--accent);color:#FFF;border:none;border-radius:100px;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1.5px;cursor:pointer;flex-shrink:0;position:relative;overflow:hidden;transition:all 0.2s ease;box-shadow:inset 0 0.3rem 0.7rem rgba(255,255,255,0.35),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.4),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
.wt-log-btn::before{content:"";position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.13);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn::after{content:"";position:absolute;left:8%;right:8%;top:10%;bottom:42%;border-radius:16px 16px 0 0;box-shadow:inset 0 8px 6px -8px rgba(255,255,255,0.85);background:linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn:disabled{opacity:.35;cursor:not-allowed;}
.wt-log-btn.saved{background:var(--green);}
.wt-log-btn:not(:disabled):hover{box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.45),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.6),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
/* ── CUBE BUTTON ───────────────────────────────────────────────────────────── */
.cube-btn{display:inline-block;padding:0.6em 1.4em;background:transparent;border:0;outline:none;color:var(--accent);letter-spacing:0.12em;font-family:'Bebas Neue',monospace;font-size:15px;font-weight:bold;cursor:pointer;position:relative;transition:all .5s;z-index:1;}
.cube-btn.sm{font-size:11px;padding:0.45em 1em;letter-spacing:0.1em;}
.cube-btn:disabled{opacity:.38;cursor:not-allowed;pointer-events:none;}
.cube-top{position:absolute;height:8px;background:var(--accent);bottom:100%;left:5px;right:-5px;transform:skew(-45deg,0);margin:0;transition:all .4s;}
.cube-right{position:absolute;background:var(--accent);top:-5px;z-index:0;bottom:5px;width:8px;left:100%;transform:skew(0,-45deg);transition:all .4s;}
.cube-face{position:absolute;left:0;bottom:0;top:0;right:0;background:var(--accent);transition:all .4s;}
.cube-inner{background:#1A1917;position:absolute;left:2px;right:2px;top:2px;bottom:2px;transition:all .4s;}
.cube-text{position:relative;transition:all .4s;}
.cube-btn:not(:disabled):hover .cube-inner{background:var(--accent);}
.cube-btn:not(:disabled):hover .cube-text{color:#1A1917;}
.cube-btn:not(:disabled):hover .cube-right,.cube-btn:not(:disabled):hover .cube-face,.cube-btn:not(:disabled):hover .cube-top{background:#1A1917;}
.cube-btn.saved .cube-inner{background:var(--green);}
.cube-btn.saved{color:var(--green);}
.cube-btn.saved .cube-top,.cube-btn.saved .cube-right,.cube-btn.saved .cube-face{background:var(--green);}
.cube-btn:active:not(:disabled){animation:cubeBounce .1s linear;}
@keyframes cubeBounce{50%{transform:scale(0.9);}}
/* Secondary stat strip */
.stat-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;margin:0 24px 20px;background:var(--brutal);border-radius:10px;overflow:hidden;border:2px solid var(--brutal);box-shadow:4px 4px 0 var(--brutal);}
.stat-cell{background:var(--card);padding:14px 14px 12px;}
.stat-cell:first-child{border-radius:13px 0 0 13px;}
.stat-cell:last-child{border-radius:0 13px 13px 0;}
.stat-label{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
.stat-val{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1px;line-height:1;color:var(--text);}
.stat-sub{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.3;}
/* Training block */
.dash-banner{margin:0 24px 20px;background:var(--card);border:2px solid var(--brutal);border-radius:12px;padding:20px;box-shadow:4px 4px 0 var(--brutal);}
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
.ecard{background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:16px 18px;margin:0 24px 12px;box-shadow:4px 4px 0 var(--brutal);transition:border-color .15s,box-shadow .15s,transform .15s;}
.ecard:hover{border-color:var(--accent);box-shadow:4px 4px 0 var(--accent);}
.ec-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;}
.ec-name{font-size:15px;font-weight:600;color:var(--text);}
.ec-num{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent);line-height:1;}


/* NUTRITION */
.mcard{margin:0 24px 12px;background:var(--card);border:2px solid var(--brutal);border-radius:10px;padding:16px 18px;box-shadow:4px 4px 0 var(--brutal);}
.mc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mc-time{font-size:11px;font-weight:600;letter-spacing:.3px;color:var(--accent);}
.mc-name{font-size:15px;font-weight:600;margin-top:2px;color:var(--text);}
.mc-kcal{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;}
.mc-items{font-size:13px;color:var(--muted);line-height:1.6;}
.pbar{height:3px;background:var(--up);border-radius:2px;overflow:hidden;margin-top:10px;}
.pfill{height:100%;border-radius:2px;transition:width .6s cubic-bezier(.22,1,.36,1);}
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
.ci-area{position:fixed;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end;z-index:50;transition:bottom .2s;}
.ci{flex:1;background:var(--up);border:2px solid var(--brutal);border-radius:10px;padding:11px 14px;color:var(--text);font-size:14px;font-family:'Inter',sans-serif;outline:none;resize:none;max-height:100px;line-height:1.4;transition:border-color .2s,box-shadow .2s;}
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
.ob2-row:active{transform:translate(2px,2px);}
.ecard:active{transform:translate(4px,4px);box-shadow:0 0 0 var(--brutal);}

/* MINI SESSION VIEW */
.msv{
  position:fixed;
  left:50%;transform:translateX(-50%);
  width:calc(100% - 24px);max-width:406px;
  bottom:90px;
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
  font-family:'JetBrains Mono',monospace;
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
const USER_KEY      = "apex_user_v1";
const NUTRITION_KEY = "apex_nutrition_v1";
const CHECKIN_KEY   = "apex_checkins_v1";
const PROTOCOL_KEY  = "apex_protocol_v1";

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
      const rpeSets = sets.filter(s => s.rpe);
      const avgRpe  = rpeSets.length ? rpeSets.reduce((s, x) => s + parseFloat(x.rpe), 0) / rpeSets.length : 7;
      if (avgRpe > 9.0) debt += 7;
      else if (avgRpe > 8.5) debt += 4;
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
        <text x={cx} y={cy+12} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="Inter,sans-serif">KCAL</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
        {[{l:"Protein",v:`${protein}g`,cl:C.accent},{l:"Carbs",v:`${carbs}g`,cl:C.green},{l:"Fat",v:`${fat}g`,cl:C.blue}].map(m=>(
          <div key={m.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:m.cl}}/>
              <span style={{fontSize:13,color:C.faint}}>{m.l}</span>
            </div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text}}>{m.v}</span>
          </div>
        ))}
      </div>
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
      <div className="cube-top"><div className="cube-inner" /></div>
      <div className="cube-right"><div className="cube-inner" /></div>
      <div className="cube-face"><div className="cube-inner" /></div>
      <div className="cube-text">{children}</div>
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
            <button className="ob2-cta" onClick={() => setStep(1)}>BEGIN ASSESSMENT ▶</button>
          </div>
        </div>
      )}

      {/* ── STEP 1: GOAL ── */}
      {step === 1 && (
        <div className="ob2-step" key="s1">
          <div className="ob2-step-bar">
            <button className="ob2-back-btn" onClick={() => setStep(0)}>← Back</button>
            <span className="ob2-step-counter">01 / 03</span>
          </div>
          <div className="ob2-step-h">What brings<br/>you to <em>APEX?</em></div>
          <div className="ob2-list">
            {GOALS.map((g, i) => (
              <button key={g.id} className={`ob2-row ${goal === g.id ? "sel" : ""}`} onClick={() => setGoal(g.id)}>
                <span className="ob2-row-num">0{i + 1}</span>
                <div className="ob2-row-info">
                  <div className="ob2-row-name">{g.label}</div>
                  <div className="ob2-row-desc">{g.desc}</div>
                </div>
                <div className="ob2-row-check">
                  {goal === g.id && (
                    <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:10,height:10}}>
                      <polyline points="1,5 4,8.5 11,1"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button className="ob2-cta" disabled={!canProceed()} onClick={() => setStep(2)}>CONTINUE</button>
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
          <button className="ob2-cta" disabled={!canProceed()} onClick={() => setStep(3)}>CONTINUE</button>
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
          <button className="ob2-cta" disabled={!canProceed()} onClick={() => onComplete({name,weight,height,age,sex,goal,level,activity})}>
            BUILD MY PROGRAM ▶
          </button>
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
const FEEDBACK_KEY  = "apex_session_feedback_v1";
const SESSION_KEY   = "apex_live_session_v1";

// ── GLOBAL SESSION CONTEXT ────────────────────────────────────────────────────
const SessionContext = createContext(null);

function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Only restore sessions started within the last 6 hours
      if (parsed?.startedAt && Date.now() - parsed.startedAt < 6 * 60 * 60 * 1000) return parsed;
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
  // A known DB name is contained in the input ("reverse barbell curl" contains "barbell curl")
  const reversed = Object.entries(EX_DB).find(([k]) => k.toLowerCase().split(" ").every(w => lower.includes(w)));
  if (reversed) return reversed[1];
  // Keyword inference by movement pattern
  if (/\b(bench|chest press|pec dec?k?|cable fly|incline press|chest fly|machine chest|machine incline)\b/.test(lower))
    return {primary:"chest",  secondary:["triceps"],   movement:"horizontal_push",stim:7};
  if (/\b(row|lat pull|pulldown|pull-?up|chin-?up|pullover|lying machine)\b/.test(lower))
    return {primary:"back",   secondary:["biceps"],    movement:"horizontal_pull",stim:7};
  if (/\b(squat|leg press|lunge|hack|pendulum|leg ext)\b/.test(lower))
    return {primary:"quads",  secondary:["glutes"],    movement:"squat",stim:7};
  if (/\b(rdl|romanian|stiff.?leg|leg curl|hamstring|nordic)\b/.test(lower))
    return {primary:"hams",   secondary:["glutes"],    movement:"hinge",stim:7};
  if (/\b(hip thrust|glute bridge|glute)\b/.test(lower))
    return {primary:"hams",   secondary:["glutes"],    movement:"hip_extension",stim:7};
  if (/\b(overhead press|ohp|shoulder press|arnold|lateral raise|side raise|upright|machine shoulder)\b/.test(lower))
    return {primary:"delts",  secondary:["triceps"],   movement:"vertical_push",stim:7};
  if (/\b(rear delt|face pull|reverse fly|rear fly|rear delt machine)\b/.test(lower))
    return {primary:"rear_delt",secondary:["back"],    movement:"fly",stim:7};
  if (/\b(tricep|skull crusher|pushdown|rope push|overhead ext|jm press|tricep machine)\b/.test(lower))
    return {primary:"triceps",secondary:[],            movement:"isolation",stim:7};
  if (/\b(curl|bicep|preacher|concentration|hammer)\b/.test(lower))
    return {primary:"biceps", secondary:[],            movement:"isolation",stim:7};
  if (/\b(calf|calves)\b/.test(lower))
    return {primary:"calves", secondary:[],            movement:"isolation",stim:7};
  if (/\b(ab |abs|crunch|plank|core|sit.?up|leg raise|toes.?to.?bar)\b/.test(lower))
    return {primary:"abs",    secondary:[],            movement:"isometric",stim:6};
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
      const tag = ex.tag || EX_DB[ex.name] || resolveExerciseTag(ex.name);
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
const SPLITS = {
  ppl: {
    id:"ppl", label:"Push / Pull / Legs", abbr:"PPL",
    desc:"Classic 6-day split. Max frequency per muscle group. Ideal for intermediate–advanced.",
    frequency:6,
    schedule: [
      { key:"push1",  tag:"Push A",  muscles:["chest","delts","triceps"] },
      { key:"pull1",  tag:"Pull A",  muscles:["back","biceps"] },
      { key:"legs1",  tag:"Legs A",  muscles:["quads","hams","calves"] },
      { key:"push2",  tag:"Push B",  muscles:["chest","delts","triceps"] },
      { key:"pull2",  tag:"Pull B",  muscles:["back","biceps"] },
      { key:"legs2",  tag:"Legs B",  muscles:["quads","hams","calves"] },
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
    id:"pplup", label:"PPL + Upper", abbr:"PPL+U",
    desc:"5-day hybrid. Adds a dedicated upper-body day for enhanced arm/shoulder development.",
    frequency:5,
    schedule: [
      { key:"push",   tag:"Push",   muscles:["chest","delts","triceps"] },
      { key:"pull",   tag:"Pull",   muscles:["back","biceps"] },
      { key:"legs",   tag:"Legs",   muscles:["quads","hams","calves"] },
      { key:"upper",  tag:"Upper",  muscles:["chest","back","delts","biceps","triceps"] },
      { key:"arms",   tag:"Arms",   muscles:["biceps","triceps","abs"] },
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
    program[day.key] = { tag: day.tag, muscles: day.muscles, exercises: pickExercises(day.muscles, isB) };
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
        ctx.font=`${ih?"bold ":""}9px 'Inter',sans-serif`; ctx.fillStyle=ih?bench.color:sc;
        ctx.fillText(bench.label,lx,ly-3);
        ctx.font="8px 'Inter',monospace"; ctx.fillStyle=ih?cc.text:cc.muted;
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
        ctx.fillStyle=sc; ctx.font="bold 9px 'Inter',sans-serif";
        ctx.fillText(status,tx+tw-12-ctx.measureText(status).width,ty+18);
        ctx.fillStyle=cc.text; ctx.font="10px 'Inter',monospace";
        ctx.fillText(`Sets: ${Math.round(v.sets)} / ${Math.round(mav)} target`,tx+12,ty+34);
        ctx.fillStyle=cc.muted; ctx.font="9px 'Inter',sans-serif";
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
  const [exercises,setExercises]=useState([]);
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [timer,setTimer]=useState(0);
  const timerRef=useRef(null);
  const alerts=generateMuscleAlerts(muscleVol,level,C);
  useEffect(()=>{timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[]);
  const allNames=Object.keys(EX_DB);
  const filtered=search.length>=1?allNames.filter(n=>n.toLowerCase().includes(search.toLowerCase())).slice(0,8):[];

  const addExercise=name=>{
    const tag=EX_DB[name]||{primary:"custom",secondary:[],movement:"custom",stim:5};
    setExercises(prev=>[...prev,{id:`cx_${Date.now()}_${Math.random().toString(36).slice(2)}`,name,muscle:tag.primary,category:tag.movement==="isolation"?"isolation":"compound",loggedSets:[{weight:"",reps:"",rpe:""}],tag,isCustom:!EX_DB[name]}]);
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
      // Persist tag so computeMuscleVolume can classify without EX_DB lookup
      tag: ex.tag || resolveExerciseTag(ex.name) || {primary:"custom",secondary:[],movement:"custom",stim:5},
      loggedSets:ex.loggedSets.filter(s=>s.reps&&s.weight),
    })).filter(ex=>ex.loggedSets.length>0);
    onComplete({dayKey:`custom_${Date.now()}`,completedExercises:ce,duration:timer,ts:Date.now(),isCustom:true});
  };
  return (
    <div className="screen" style={{paddingBottom:130}}>
      <div style={{padding:"52px 24px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",marginBottom:12}}>← Back</button>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div><div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.blue,marginBottom:4}}>Custom Session</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2}}>LOG WORKOUT</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,color:C.blue}}>{fmt(timer)}</div><div style={{fontSize:10,color:C.muted}}>{totalSets} sets</div></div>
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

        <div style={{position:"relative"}}>
          <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
            <input
              type="text"
              placeholder="e.g. Bench Press, Farmers Carry, JM Press…"
              value={search}
              autoComplete="off"
              onFocus={()=>setShowSearch(true)}
              onBlur={()=>setTimeout(()=>setShowSearch(false),220)}
              onChange={e=>{setSearch(e.target.value);setShowSearch(true);}}
              onKeyDown={e=>{
                if(e.key==="Enter"&&search.trim()){
                  e.preventDefault();
                  addExercise(search.trim());
                }
              }}
              style={{
                flex:1,background:C.up,
                border:`2px solid ${search.trim()?C.blue:C.border}`,
                borderRadius:12,padding:"14px 16px",
                color:C.text,fontSize:15,
                fontFamily:"'Inter',sans-serif",
                outline:"none",transition:"border-color .2s",
              }}
            />
            <button
              onClick={()=>{ if(search.trim()) addExercise(search.trim()); }}
              disabled={!search.trim()}
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
            Write any exercise name and hit <span style={{color:C.blue}}>Enter</span> or <span style={{color:C.blue}}>ADD</span>.
            {search.length>=2&&filtered.length>0&&<span style={{color:C.muted}}> Suggestions below ↓</span>}
          </div>

          {/* SUGGESTIONS — secondary assist, only if DB matches exist */}
          {showSearch&&search.length>=2&&filtered.length>0&&(
            <div style={{
              position:"absolute",top:"52px",left:0,right:"88px",
              background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:12,zIndex:50,
              maxHeight:220,overflowY:"auto",
              boxShadow:"0 8px 32px rgba(0,0,0,.6)",
              marginTop:4,
            }}>
              <div style={{padding:"8px 14px 4px",fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,borderBottom:`1px solid ${C.border}`}}>
                DB Suggestions — or keep typing your own
              </div>
              {filtered.map(name=>{
                const tag=EX_DB[name],bench=MUSCLE_BENCHMARKS[tag?.primary];
                return (
                  <div key={name} onClick={()=>addExercise(name)}
                    style={{padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"background .12s"}}
                    onMouseOver={e=>e.currentTarget.style.background=C.up}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{name}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:1}}>{tag?.movement?.replace(/_/g," ")} · Stim {tag?.stim}/10</div>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {bench&&<div style={{width:7,height:7,borderRadius:"50%",background:bench.color}}/>}
                      <span style={{fontSize:10,color:bench?.color||C.muted}}>{bench?.label||tag?.primary}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {exercises.length===0?(
        <div style={{padding:"36px 24px",textAlign:"center"}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.up,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:C.muted}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:C.muted,marginBottom:8}}>YOUR SESSION STARTS HERE</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.65,maxWidth:280,margin:"0 auto"}}>
            Write any exercise above — a classic lift, a machine move, or something completely your own. Hit Enter to add it instantly.
          </div>
        </div>
      ):exercises.map((ex,ei)=>{
        const bench=MUSCLE_BENCHMARKS[ex.tag?.primary],done=ex.loggedSets.filter(s=>s.reps&&s.weight).length;
        return (
          <div key={ex.id} style={{margin:"14px 24px 0"}}>
            <div style={{background:C.card||C.surface,border:`2px solid ${C.brutal||C.border}`,borderRadius:10,padding:16,boxShadow:`4px 4px 0 ${C.brutal||C.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    {bench&&<div style={{width:8,height:8,borderRadius:"50%",background:bench.color,flexShrink:0}}/>}
                    {ex.isCustom
                      ? <span style={{fontSize:10,color:C.blue,letterSpacing:1,textTransform:"uppercase",background:`${C.blue}15`,padding:"1px 7px",borderRadius:4}}>Custom Exercise</span>
                      : <span style={{fontSize:10,color:bench?.color||C.muted,letterSpacing:1,textTransform:"uppercase"}}>{bench?.label||ex.muscle} · {ex.tag?.movement?.replace(/_/g," ")||"exercise"}</span>
                    }
                  </div>
                  <div style={{fontSize:15,fontWeight:600,color:C.text}}>{ex.name}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{ex.isCustom?"No database match — tracked as custom":(`Stim ${ex.tag?.stim||"?"}/10 · ${done}/${ex.loggedSets.length} sets done`)}</div>
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
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:d?C.blue:C.muted,textAlign:"center"}}>{si+1}</div>
                    <input type="number" placeholder="lbs" value={set.weight} onChange={e=>updateSet(ei,si,"weight",e.target.value)} style={{background:C.up,border:`1px solid ${d?C.blue+"50":C.border}`,borderRadius:7,padding:"8px 6px",color:C.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",outline:"none",width:"100%"}}/>
                    <input type="number" placeholder="reps" value={set.reps} onChange={e=>updateSet(ei,si,"reps",e.target.value)} style={{background:C.up,border:`1px solid ${d?C.blue+"50":C.border}`,borderRadius:7,padding:"8px 6px",color:C.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",outline:"none",width:"100%"}}/>
                    <input type="number" min="6" max="10" step=".5" placeholder="RPE" value={set.rpe} onChange={e=>updateSet(ei,si,"rpe",e.target.value)} style={{background:C.up,border:`1px solid ${set.rpe?rpeC(set.rpe)+"50":C.border}`,borderRadius:7,padding:"8px 6px",color:set.rpe?rpeC(set.rpe):C.muted,fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",outline:"none",width:"100%"}}/>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{d&&<div style={{width:14,height:14,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>✓</div>}</div>
                  </div>
                );
              })}
              <button onClick={()=>addSet(ei)} style={{width:"100%",marginTop:8,padding:"7px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,color:C.faint,fontSize:11,cursor:"pointer"}}>+ Add Set</button>
            </div>
          </div>
        );
      })}
      <div style={{position:"fixed",bottom:68,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 24px",background:"rgba(8,10,12,0.97)",borderTop:`1px solid ${C.border}`,zIndex:50}}>
        <button onClick={handleComplete} disabled={totalSets===0} style={{width:"100%",padding:15,background:C.blue,color:"#080A0C",border:"none",borderRadius:12,fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2,cursor:totalSets>0?"pointer":"not-allowed",opacity:totalSets>0?1:.4,transition:"all .3s"}}>
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
function WorkoutSession({ dayKey, dayPlan, adaptation, onComplete, onBack }) {
  const C = useThemeColors();
  const { session, updateSession } = useSession();
  const adj = adaptation?.adjustments?.[dayKey];

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

  const rpeColor = (r) => {
    const n = parseFloat(r);
    if (!n) return C.muted;
    if (n >= 9) return C.red;
    if (n >= 8) return C.accent;
    return C.green;
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
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: C.accent }}>{formatTime(timer)}</div>
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

      {/* EXERCISES */}
      <div style={{ padding: "20px 0 0" }}>
        {dayPlan.exercises.map((ex, exIdx) => {
          const isOpen = activeEx === ex.id;
          const sets = loggedSets[ex.id] || [];
          const completedSetsCount = sets.filter(s => s.reps && s.weight).length;
          const prevBest = null; // Would pull from history in full implementation

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
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 600, color: C.text }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                      <span style={{ fontSize: 11, color: C.faint }}>{sets.length} sets</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, color: C.faint }}>{ex.repRange} reps</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, color: C.faint }}>RPE {ex.rpe}</span>
                    </div>
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

                  {/* Column headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 28px", gap: 6, padding: "10px 0 6px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                    {["#","WEIGHT","REPS","RPE",""].map(h => (
                      <div key={h} style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.muted, textAlign: "center" }}>{h}</div>
                    ))}
                  </div>
                  {exIdx === 0 && <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>RPE = Rate of Perceived Exertion (6–10). 10 = absolute failure, 8 = 2 reps left in tank.</div>}

                  {sets.map((set, si) => {
                    const done = set.reps && set.weight;
                    return (
                      <div key={si} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 28px", gap: 6, marginBottom: 6, alignItems: "center" }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: done ? C.accent : C.muted, textAlign: "center" }}>{si + 1}</div>
                        <input type="number" placeholder="lbs" value={set.weight}
                          onChange={e => updateSet(ex.id, si, "weight", e.target.value)}
                          style={{ background: C.surface, border: `1px solid ${done ? C.accent + "40" : C.border}`, borderRadius: 8, padding: "9px 8px", color: C.text, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", outline: "none", width: "100%", transition: "border-color .2s" }} />
                        <input type="number" placeholder="reps" value={set.reps}
                          onChange={e => updateSet(ex.id, si, "reps", e.target.value)}
                          style={{ background: C.surface, border: `1px solid ${done ? C.accent + "40" : C.border}`, borderRadius: 8, padding: "9px 8px", color: C.text, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", outline: "none", width: "100%", transition: "border-color .2s" }} />
                        <input type="number" min="6" max="10" step="0.5" placeholder="RPE"
                          value={set.rpe}
                          onChange={e => updateSet(ex.id, si, "rpe", e.target.value)}
                          style={{ background: C.surface, border: `1px solid ${set.rpe ? rpeColor(set.rpe) + "50" : C.border}`, borderRadius: 8, padding: "9px 8px", color: set.rpe ? rpeColor(set.rpe) : C.muted, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", outline: "none", width: "100%" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {done && <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</div>}
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
      <div style={{ margin: "8px 24px 0" }}>
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
          position: "fixed", bottom: 80, left: 16, right: 16,
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
  const [sessionFeedback, setSessionFeedback] = useState(null); // {text, ts, loading}

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
      const avgRpe = allSets.length ? (allSets.reduce((s, x) => s + x.rpe, 0) / allSets.length).toFixed(1) : "N/A";

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

Session: ${result.dayKey.toUpperCase()} — ${mins} min, avg RPE ${avgRpe}
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
      const fb = { text, ts: result.ts };
      setSessionFeedback({ ...fb, loading: false });
      try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ ...fb, read: false })); } catch {}
    } catch {
      const fb = { text: "Session logged. Open the Coach tab for your full analysis.", ts: result.ts };
      setSessionFeedback({ ...fb, loading: false });
    }
  };

  const handleChangeSplit = () => { setSetupMode(true); };

  if (!loaded) return (
    <div className="loading"><div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: C.muted, animation: "pulse 2s infinite" }}>LOADING PROGRAM...</div></div>
  );

  // ── SETUP SCREEN ──
  if (setupMode) return (
    <div className="screen">
      <div className="sh"><div><div className="sh-label">Training Setup</div><div className="sh-title">CHOOSE YOUR SPLIT</div></div></div>

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
              <span style={{ fontSize: 12, color: C.faint, fontFamily: "'JetBrains Mono',monospace", textTransform: "capitalize" }}>{r.value}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-gold" onClick={handleSplitSetup}>GENERATE MY PROGRAM ▶</button>
      </div>
    </div>
  );

  if (!tState) return null;

  // ── ACTIVE SESSIONS — read from global context ──
  if (session?.type === "custom") {
    const muscleVol = computeMuscleVolume(tState.history || [], 7);
    return <CustomWorkoutLogger onComplete={handleSessionComplete} onBack={()=>{endGlobalSession();setShowPath(false);}} muscleVol={muscleVol} level={user.level||"intermediate"}/>;
  }
  if (session?.type === "generated" && session.dayKey && tState.program?.[session.dayKey]) {
    return <WorkoutSession dayKey={session.dayKey} dayPlan={tState.program[session.dayKey]} adaptation={tState.adaptation} onComplete={handleSessionComplete} onBack={()=>{endGlobalSession();setShowPath(false);}}/>;
  }

  const splitDef = SPLITS[tState.split];
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
      {/* HEADER */}
      <div className="sh">
        <div>
          <div className="sh-label">Your {splitDef.label} Program</div>
          <div className="sh-title">TRAINING</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label:"Balance", active:showChart, color:C.purple, onClick:()=>setShowChart(!showChart),
              icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label:"Stats", active:showStats, color:C.accent, onClick:()=>setShowStats(!showStats),
              icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { label:"Split", active:false, color:C.muted, onClick:handleChangeSplit,
              icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
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
            <div style={{fontSize:10,color:C.muted,textAlign:"right",lineHeight:1.5}}>Drag to rotate<br/>Tap point to inspect</div>
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
          {/* Per-day history */}
          {recentSessions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Recent Sessions</div>
              {recentSessions.slice().reverse().slice(0, 4).map((sess, i) => {
                const setsLogged = (sess.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets?.length || 0), 0);
                const volLoad = (sess.completedExercises || []).reduce((s, ex) => s + (ex.loggedSets || []).reduce((s2, set) => s2 + (set.reps || 0) * (set.weight || 0), 0), 0);
                const mins = Math.floor((sess.duration || 0) / 60);
                return (
                  <div key={sess.ts} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{sess.dayKey.toUpperCase()}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{new Date(sess.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.faint }}>{volLoad > 0 ? `${(volLoad/1000).toFixed(1)}k lbs` : `${setsLogged} sets`}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{mins > 0 ? `${mins} min` : "—"}</div>
                    </div>
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
        {/* Custom session indicator */}
        {(tState.history||[]).some(h=>h.isCustom)&&(
          <div className="dchip" onClick={()=>{setShowPath(false);startSession("custom",{exercises:[],loggedSets:{}});}} style={{minWidth:64,background:C.up,borderColor:C.blue}}>
            <div style={{fontSize:9,color:C.blue,letterSpacing:1,textAlign:"center",marginBottom:2}}>FREE</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1,color:C.blue,textAlign:"center"}}>LOG</div>
          </div>
        )}
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
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: C.text }}>{prevSets}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>sets</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: C.accent }}>{prevVol > 0 ? `${(prevVol / 1000).toFixed(1)}k` : "—"}</div>
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
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.faint }}>{ex.repRange} reps</span>
                      <span style={{ fontSize: 11, color: C.muted }}>·</span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.faint }}>RPE {ex.rpe}</span>
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
              <button className="btn btn-gold" onClick={()=>setShowPath(true)}>
                START {currentDay.tag.toUpperCase()} ▶
              </button>
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
    return JSON.parse(jsonStr);
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
  const [parsed, setParsed] = useState(existingLog?.parsed || null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(existingLog ? "review" : "input"); // input | parsing | review
  const [inputMode, setInputMode] = useState("free"); // free | quick

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
    if (!mealName.trim()) setMealName("Meal " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
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
              {[{ id: "free", label: "Free Entry" }, { id: "quick", label: "Quick Refs" }].map(m => (
                <button key={m.id} onClick={() => setInputMode(m.id)}
                  style={{ flex: 1, padding: "10px", background: inputMode === m.id ? `${C.green}15` : C.up, border: `1px solid ${inputMode === m.id ? C.green : C.border}`, borderRadius: 10, color: inputMode === m.id ? C.green : C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Meal name */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Meal Name (optional)</div>
              <input value={mealName} onChange={e => setMealName(e.target.value)} placeholder="e.g. Breakfast, Post-Workout, Dinner"
                style={{ width: "100%", background: C.up, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", color: C.text, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none" }} />
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

            {/* Food input */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
                {inputMode === "free" ? "What did you eat? (be as specific as possible)" : "Your meal (edit as needed)"}
              </div>
              <textarea value={rawInput} onChange={e => setRawInput(e.target.value)}
                placeholder={"Examples:\n• 8oz chicken breast, 1.5 cups white rice, 1 tbsp olive oil\n• Chipotle bowl with chicken, rice, black beans, cheese, salsa\n• 2 scoops whey, 1 banana, handful of oats\n• About 6 oz salmon, sweet potato medium"}
                style={{ width: "100%", background: C.up, border: `1px solid ${rawInput ? C.green : C.border}`, borderRadius: 10, padding: "14px", color: C.text, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", resize: "none", height: 130, lineHeight: 1.5, transition: "border-color .2s" }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
              Include amounts: "8oz", "200g", "1 cup", "2 tablespoons", "1 medium", "handful"
            </div>

            {error && <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}30`, borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>{error}</div>}

            <button onClick={handleParse} disabled={!rawInput.trim()}
              style={{ width: "100%", padding: 15, background: rawInput.trim() ? C.green : C.border, color: "#080A0C", border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: rawInput.trim() ? "pointer" : "not-allowed", transition: "all .2s" }}>
              ANALYZE WITH AI ▶
            </button>
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
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.text }}>{Math.round(item.calories)} kcal</div>
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
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: over ? C.red : C.faint }}>
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
        <div style={{ margin: "0 24px 16px", background: C.surface, border: `1px solid ${C.accent}30`, borderRadius: 14, padding: 18, animation: "slideUp .3s ease" }}>
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
                    style={{ flex: 1, background: C.up, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 10px", color: C.text, fontSize: 14, fontFamily: "'JetBrains Mono',monospace", outline: "none" }} />
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{t.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSaveTargets}
            style={{ width: "100%", padding: 12, background: C.accent, color: "#080A0C", border: "none", borderRadius: 10, fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 2, cursor: "pointer" }}>
            SAVE TARGETS
          </button>
        </div>
      )}

      {/* MODE TOGGLE */}
      <div style={{ margin: "0 24px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { id: "track", icon: "log", label: "Track Mode", desc: "Log your own meals" },
          { id: "plan", icon: "plan", label: "Meal Plan", desc: "Follow app plan" },
        ].map(m => (
          <div key={m.id} onClick={() => setMode(m.id)}
            style={{ padding: "12px 14px", background: mode === m.id ? `${C.green}10` : C.surface, border: `2px solid ${mode === m.id ? C.green : C.border}`, borderRadius: 12, cursor: "pointer", transition: "all .2s" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: mode === m.id ? C.green : C.muted, marginBottom: 4, textTransform: "uppercase" }}>{m.id === "track" ? "LOG" : "PLAN"}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1, color: mode === m.id ? C.green : C.text }}>{m.label}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* DAILY PROGRESS RING + SUMMARY */}
      <div style={{ margin: "0 24px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
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
              <text x={48} y={57} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="Inter,sans-serif">/ {activeTargets.cal}</text>
              <text x={48} y={68} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="Inter,sans-serif">KCAL</text>
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
        <div style={{ margin: "0 24px 16px" }}>
          {feedback.map((fb, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: `${fbColors[fb.type] || C.accent}0E`, border: `1px solid ${fbColors[fb.type] || C.accent}30`, borderRadius: 10, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: fbColors[fb.type] || C.accent, lineHeight: 1.2 }}>{fbIcons[fb.type] || "·"}</span>
              <span style={{ fontSize: 12, color: C.faint, lineHeight: 1.5 }}>{fb.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── TRACK MODE ─── */}
      {mode === "track" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 12 }}>
            <div className="stitle" style={{ padding: 0, margin: 0 }}>TODAY'S MEALS</div>
            <button onClick={() => { setEditingLog(null); setShowLog(true); }}
              style={{ padding: "8px 18px", background: C.green, border: "none", borderRadius: 10, color: "#080A0C", fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 1.5, cursor: "pointer" }}>
              + LOG MEAL
            </button>
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
            <div style={{ margin: "0 24px", padding: "40px 20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, textAlign: "center" }}>
              <div style={{ width:48,height:48,borderRadius:12,background:C.up,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:C.muted }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>NO MEALS LOGGED YET</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>Log your first meal and AI will calculate your macros automatically. Be as specific or as general as you want.</div>
              <button onClick={() => { setEditingLog(null); setShowLog(true); }}
                style={{ padding: "14px 32px", background: C.green, border: "none", borderRadius: 12, color: "#080A0C", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 2, cursor: "pointer" }}>
                LOG FIRST MEAL ▶
              </button>
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
                  {log.items?.map(item => item.food).join(" · ") || log.rawInput}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {[
                    { l: "P", v: Math.round(log.totals?.protein_g || 0), cl: C.accent },
                    { l: "C", v: Math.round(log.totals?.carbs_g || 0), cl: C.green },
                    { l: "F", v: Math.round(log.totals?.fat_g || 0), cl: C.blue },
                  ].map(m => (
                    <span key={m.l} style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: m.cl, background: `${m.cl}15`, padding: "2px 8px", borderRadius: 4 }}>{m.l}: {m.v}g</span>
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
              <div style={{ margin: "16px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
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
          <div style={{ margin: "0 24px 12px", padding: "10px 14px", background: `${C.blue}0E`, border: `1px solid ${C.blue}30`, borderRadius: 10, fontSize: 12, color: C.faint }}>
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
                  <span key={m.l} style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: m.cl, background: `${m.cl}15`, padding: "2px 8px", borderRadius: 4 }}>{m.l}: {m.v}g</span>
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

// ─── COACH ────────────────────────────────────────────────────────────────────

function CoachScreen({user}) {
  const C = useThemeColors();
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

  // Inject unread post-session feedback on first open
  useEffect(()=>{
    try {
      const stored=localStorage.getItem(FEEDBACK_KEY);
      if(!stored) return;
      const fb=JSON.parse(stored);
      if(!fb.read&&fb.text){
        setMessages(prev=>[...prev,{role:"coach",text:`📊 Post-session recap:\n\n${fb.text}`,time:"now"}]);
        localStorage.setItem(FEEDBACK_KEY,JSON.stringify({...fb,read:true}));
        setTimeout(()=>{ if(msgsRef.current) msgsRef.current.scrollTop=msgsRef.current.scrollHeight; },120);
      }
    } catch {}
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

  // Dynamic bottom offset: nav(68) + input(62) + strip(76) if photos
  const stripHeight=pending.length>0?78:0;
  const inputBottom=68;
  const msgsHeight=`calc(100vh - ${pending.length>0?420:340}px)`;

  return (
    <div className="screen" style={{paddingBottom:0}}>
      <div className="ch-header">
        <div className="ch-id">
          <div className="ch-av">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <div className="ch-dot"/>
          </div>
          <div><div className="ch-name">APEX COACH</div><div className="ch-status">Online · Ready to coach</div></div>
        </div>
        <div className="chips">
          {QPROMPTS.map(p=><div key={p} className="chip" onClick={()=>send(p)}>{p}</div>)}
        </div>
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
        <div className="photo-strip" style={{bottom:inputBottom+62}}>
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

      {/* INPUT BAR */}
      <div className="ci-area" style={{bottom:inputBottom+stripHeight}}>
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

      // Background
      ctx.fillStyle = cc.bg; ctx.fillRect(0, 0, cW, cH);

      // ── GRID FLOOR ──
      const gridY = 0.05;
      for (let xi = 0; xi <= 4; xi++) {
        const xf = xi / 4;
        const p1 = project(xf, gridY, 0), p2 = project(xf, gridY, 1);
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = hex2rgba(cc.border, 0.7); ctx.lineWidth = 1; ctx.stroke();
      }
      for (let zi = 0; zi <= 4; zi++) {
        const zf = zi / 4;
        const p1 = project(0, gridY, zf), p2 = project(1, gridY, zf);
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = hex2rgba(cc.border, 0.7); ctx.lineWidth = 1; ctx.stroke();
      }

      // ── AXES ──
      const origin = project(0, gridY, 0);
      const axX = project(1, gridY, 0);
      const axY = project(0, 1, 0);
      const axZ = project(0, gridY, 1);

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axX.px, axX.py);
      ctx.strokeStyle = hex2rgba(cc.accent, 0.4); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.accent, 0.7); ctx.font = `bold ${9 / s.scale}px Inter`;
      ctx.fillText("DAYS", axX.px + 4, axX.py + 3);

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axY.px, axY.py);
      ctx.strokeStyle = hex2rgba(cc.green, 0.4); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.green, 0.7);
      ctx.fillText("LBS", axY.px - 18, axY.py - 4);

      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(axZ.px, axZ.py);
      ctx.strokeStyle = hex2rgba(cc.blue, 0.3); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = hex2rgba(cc.blue, 0.6);
      ctx.fillText("ΔRATE", axZ.px + 3, axZ.py + 3);

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

        ctx.beginPath(); ctx.moveTo(bot.px, bot.py); ctx.lineTo(top.px, top.py);
        ctx.strokeStyle = barColor; ctx.lineWidth = isHov ? 3 : 2; ctx.stroke();

        ctx.beginPath();
        ctx.arc(top.px, top.py, isHov ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = barColor; ctx.fill();
        ctx.strokeStyle = hex2rgba(cc.bg, 0.8); ctx.lineWidth = 1; ctx.stroke();

        if (isHov) {
          const label = `${d.weight} lbs`;
          const dateStr = d.date;
          const lw = Math.max(ctx.measureText(label).width, ctx.measureText(dateStr).width) + 12;
          const lx = top.px - lw / 2, ly = top.py - 42;
          ctx.fillStyle = cc.surface;
          ctx.beginPath(); ctx.roundRect(lx, ly, lw, 34, 5); ctx.fill();
          ctx.strokeStyle = hex2rgba(cc.accent, 0.5); ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = cc.accent; ctx.font = `bold ${10 / s.scale}px 'Inter',sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(label, top.px, ly + 13);
          ctx.fillStyle = cc.muted; ctx.font = `${9 / s.scale}px 'Inter',sans-serif`;
          ctx.fillText(dateStr, top.px, ly + 27);
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
        ctx.strokeStyle = hex2rgba(cc.accent, 0.35); ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      }

      // ── Y AXIS TICK LABELS ──
      for (let t = 0; t <= 4; t++) {
        const tf = t / 4;
        const wVal = Math.round(minW + tf * wRange);
        const pt = project(0, tf, 0);
        ctx.fillStyle = hex2rgba(cc.muted, 0.8); ctx.font = `${8 / s.scale}px 'Inter',monospace`;
        ctx.fillText(wVal, pt.px - 22, pt.py + 3);
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

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen({ user, weightLog, onLogWeight, onDeleteWeight, onEditWeight, onNavigate }) {
  const C = useThemeColors();
  const [inputVal, setInputVal] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
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

  useEffect(() => {
    window.storage.get(TRAINING_KEY).then(r => {
      if (r?.value) try { setTState(JSON.parse(r.value)); } catch {}
    }).catch(() => {});
    window.storage.get("apex_rebound_v3").then(r => {
      if (r?.value) try { setReboundData(JSON.parse(r.value)?.protocol || null); } catch {}
    }).catch(() => {});
    window.storage.get(NUTRITION_KEY).then(r => {
      if (r?.value) try { setNutLogs(JSON.parse(r.value) || []); } catch {}
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
  }, []);

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
  const confidenceScore = computeConfidenceScore(sortedLog, history, nutLogs);
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

  // Save protocol decision to storage so getTargets() can read calAdjustment
  useEffect(() => {
    if (protocolDecision.calAdjustment !== 0) {
      window.storage.set(PROTOCOL_KEY, JSON.stringify({ calAdjustment: protocolDecision.calAdjustment, ts: Date.now() })).catch(() => {});
    }
  }, [protocolDecision.calAdjustment]);

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

  const DECISION_COLOR = { red: C.red, green: C.green, accent: C.accent, muted: C.muted };
  const PRIORITY_LABEL = { P0: "CRITICAL", P1: "ADJUST", P2: "NOTE", info: "ON TRACK" };

  return (
    <div className="screen">
      {/* HEADER */}
      <div className="sh">
        <div>
          <div className="sh-label">{(()=>{const h=new Date().getHours();return h<11?"Good morning,":h<17?"Good afternoon,":h<21?"Good evening,":"Hey,"})()}</div>
          <div className="sh-title">{user.name.toUpperCase()}</div>
        </div>
        <div className="sh-avatar">{user.name[0].toUpperCase()}</div>
      </div>

      {/* BODY WEIGHT — DOMINANT HERO BLOCK */}
      <div className={`wt-hero${inputFocused?" focused":""}${justLogged?" logged":""}`}>
        <div className="wt-hero-top">
          <div>
            <div className="wt-label">Body Weight</div>
            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <div className={`wt-number${justLogged?" saved":""}`}>{currentWeight || "—"}</div>
              {currentWeight ? <span className="wt-unit">lbs</span> : null}
            </div>
            {changeLabel && (
              <div className={`wt-change ${changeClass}`}>
                {changeVal > 0 ? "↑" : changeVal < 0 ? "↓" : "→"} {changeLabel}
              </div>
            )}
            {weightTrend.dataPoints >= 3 && user.goal && (() => {
              const info = getGoalRateInfo(user.goal);
              if (!info) return null;
              const rate = weightTrend.rate;
              const status = classifyRate(rate, info);
              const rateStr = rate > 0 ? `+${Math.abs(rate).toFixed(1)}` : `-${Math.abs(rate).toFixed(1)}`;
              const targetStr = info.dir === 0
                ? "±0.25 lbs / wk"
                : `${info.min} to ${info.max > 0 ? "+" : ""}${info.max} lbs / wk`;
              return (
                <div className="goal-rate">
                  <div className="goal-rate-label">{info.label}</div>
                  <div className="goal-rate-row">
                    <span className="goal-rate-val">{rateStr} lbs/wk</span>
                    <span className="goal-rate-status" style={{color:`var(--${status.key})`}}>● {status.label}</span>
                  </div>
                  <div className="goal-rate-target">Target {targetStr}</div>
                </div>
              );
            })()}
          </div>
          {/* Sparkline bars */}
          {recentWeights.length >= 2 && (
            <div className="wt-history">
              {recentWeights.map((e, i) => {
                const h = Math.max(6, Math.round(((e.weight - minW) / wRange) * 32) + 4);
                const isLatest = i === recentWeights.length - 1;
                return (
                  <div key={e.ts} className="wt-bar-wrap">
                    <div className="wt-bar" style={{height: h, background: isLatest ? "var(--accent)" : "var(--faint)", opacity: isLatest ? 1 : 0.5}}/>
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
                        {change !== null && (
                          <span style={{fontSize:10,color:parseFloat(change)>0?"var(--green)":parseFloat(change)<0?"var(--blue)":"var(--muted)"}}>
                            {parseFloat(change)>0?"+":""}{change}
                          </span>
                        )}
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

      {/* SECONDARY STAT STRIP — Sessions / Train / Rest / Weekly Avg */}
      <div className="stat-strip" style={{gridTemplateColumns: calTarget?.cyclingActive ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr"}}>
        <div className="stat-cell">
          <div className="stat-label">Sessions</div>
          <div className="stat-val">{history.length || "—"}</div>
          <div className="stat-sub">total logged</div>
        </div>
        {calTarget?.cyclingActive ? (
          <>
            <div className="stat-cell">
              <div className="stat-label" style={{color:"var(--accent)"}}>Train Day</div>
              <div className="stat-val" style={{color: calTarget.isTrainDay ? "var(--accent)" : "var(--text)"}}>
                {calTarget.trainCal?.toLocaleString() ?? "—"}
              </div>
              <div className="stat-sub">{calTarget.trainP ?? calTarget.p}g protein</div>
            </div>
            <div className="stat-cell">
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
        <div style={{padding:"16px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:"var(--muted)"}}>30-Day Trend</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:"var(--text)"}}>BODYWEIGHT CHART</div>
          </div>
          <div style={{fontSize:10,color:"var(--muted)",textAlign:"right"}}>Drag to rotate<br/>Scroll to zoom</div>
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

      {/* ── PROTOCOL INTELLIGENCE ───────────────────────────────────────────── */}
      <div style={{margin:"0 24px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted}}>Protocol Intelligence</div>
        <CubeButton small onClick={()=>setShowCheckIn(true)}>
          {checkIn ? "Update Check-in" : "Weekly Check-in"}
        </CubeButton>
      </div>

      {/* Body Comp + TDEE row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,margin:"0 24px 12px",background:C.border,borderRadius:14,overflow:"hidden"}}>
        {[
          {label:"Est. Body Fat",  val:`${userState.bodyComp.bfPct}%`,  sub:"Deurenberg est."},
          {label:"Lean Mass",      val:`${userState.bodyComp.lbmLbs}`,   sub:"lbs LBM"},
          {label:"TDEE Estimate",  val:userState.tdee.toLocaleString(),  sub:"kcal / day"},
        ].map(cell => (
          <div key={cell.label} style={{background:C.surface,padding:"12px 10px"}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:C.muted,marginBottom:4}}>{cell.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:C.text,lineHeight:1}}>{cell.val}</div>
            <div style={{fontSize:9,color:C.faint,marginTop:2}}>{cell.sub}</div>
          </div>
        ))}
      </div>

      {/* Weight trend + confidence row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"0 24px 12px"}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:C.muted,marginBottom:5}}>Weekly Rate</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1,color:weightTrend.rate>0?C.green:weightTrend.rate<0?C.blue:C.text,lineHeight:1}}>
            {weightTrend.rate===0?"—":`${weightTrend.rate>0?"+":""}${weightTrend.rate} lbs`}
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:3,lineHeight:1.4}}>
            {weightTrend.classification==="insufficient_data"?"Need 3+ weigh-ins":
             weightTrend.classification.replace(/_/g," ")}
          </div>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:C.muted,marginBottom:5}}>Data Confidence</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1,color:confidenceScore>=0.75?C.green:confidenceScore>=0.5?C.accent:C.red,lineHeight:1}}>
            {Math.round(confidenceScore*100)}%
          </div>
          <div style={{height:3,background:C.up,borderRadius:2,marginTop:7,overflow:"hidden"}}>
            <div className="pfill" style={{width:`${Math.round(confidenceScore*100)}%`,background:confidenceScore>=0.75?C.green:confidenceScore>=0.5?C.accent:C.red}}/>
          </div>
        </div>
      </div>

      {/* Recovery + Adherence + Fatigue row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,margin:"0 24px 12px",background:C.border,borderRadius:14,overflow:"hidden"}}>
        {[
          {label:"Recovery",  val:`${userState.rcs}`,   color:userState.rcs>=75?C.green:userState.rcs>=55?C.accent:C.red, sub:"/100"},
          {label:"Adherence", val:`${protocolDecision.adherence}%`, color:protocolDecision.adherence>=85?C.green:protocolDecision.adherence>=70?C.accent:C.red, sub:"7-day"},
          {label:"Fatigue Debt",val:`${protocolDecision.fatigueDebt}`, color:protocolDecision.fatigueDebt>60?C.red:protocolDecision.fatigueDebt>30?C.accent:C.green, sub:"load score"},
        ].map(cell => (
          <div key={cell.label} style={{background:C.surface,padding:"12px 10px"}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:C.muted,marginBottom:4}}>{cell.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:cell.color,lineHeight:1}}>{cell.val}<span style={{fontSize:12,color:C.muted}}>{cell.sub}</span></div>
          </div>
        ))}
      </div>

      {/* Protocol Decisions */}
      {protocolDecision.decisions.length > 0 && (
        <div style={{margin:"0 24px 12px",display:"flex",flexDirection:"column",gap:6}}>
          {protocolDecision.decisions.map((d, i) => (
            <div key={i} style={{background:C.surface,border:`1px solid ${(DECISION_COLOR[d.color]||C.border)}30`,borderLeft:`3px solid ${DECISION_COLOR[d.color]||C.border}`,borderRadius:"0 10px 10px 0",padding:"10px 14px",animation:`slideUp .25s cubic-bezier(.22,1,.36,1) ${i*60}ms both`}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:DECISION_COLOR[d.color]||C.muted,marginBottom:3}}>{PRIORITY_LABEL[d.priority]||d.priority} · {d.type.toUpperCase()}</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.55}}>{d.msg}</div>
              {d.type==="calories" && protocolDecision.calAdjustment!==0 && (
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>
                  New target: <span style={{fontFamily:"'JetBrains Mono',monospace",color:C.accent}}>{calTarget ? (calTarget.cal + protocolDecision.calAdjustment).toLocaleString() : "—"} kcal</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Volume signal badge */}
      {protocolDecision.volumeSignal !== "maintain" && (
        <div style={{margin:"0 24px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 14px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:protocolDecision.volumeSignal==="increase"?C.green:C.red,flexShrink:0}}/>
          <div style={{fontSize:12,color:C.text}}>
            <span style={{fontWeight:600}}>{protocolDecision.volumeSignal==="increase"?"Volume up":"Volume down"}:</span>
            {" "}{protocolDecision.volumeSignal==="increase"?"Performance strong — add 2 sets to priority compounds next session.":"Recovery stressed — remove 2 sets from isolations this week."}
          </div>
        </div>
      )}

      {/* Strength trend — top movers */}
      {topLifts.length > 0 && (
        <div style={{margin:"0 24px 20px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Strength Trends</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topLifts.map(([name, t]) => (
              <div key={name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                  <div style={{fontSize:10,color:C.muted}}>{t.sessions} sessions tracked · e1RM {t.latest} lbs</div>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:t.trend==="improving"?C.green:t.trend==="declining"?C.red:C.muted,marginLeft:12,flexShrink:0}}>
                  {t.trend==="improving"?"↑":t.trend==="declining"?"↓":"→"} {t.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WEEKLY CHECK-IN MODAL ─────────────────────────────────────────────── */}
      {showCheckIn && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowCheckIn(false);}}>
          <div style={{width:"100%",maxWidth:430,background:C.surface,borderRadius:"20px 20px 0 0",padding:"28px 24px 40px",animation:"slideUp .3s cubic-bezier(.22,1,.36,1)"}}>
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
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:C.accent}}>{field.val}{field.unit}</div>
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
            {checkIn && <button onClick={()=>setShowCheckIn(false)} style={{width:"100%",marginTop:10,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",padding:6,fontFamily:"'Inter',sans-serif"}}>Dismiss</button>}
          </div>
        </div>
      )}
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
    coach: "M13 10V3L4 14h7v7l9-11h-7z",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
      <path d={paths[id]}/>
    </svg>
  );
}

function AppInner() {
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("home");
  const { session, endSession } = useSession();
  const [weightLog, setWeightLog] = useState([]);
  const [wtLoaded, setWtLoaded] = useState(false);

  // Load user profile on startup — prevents re-onboarding on every page reload
  useEffect(() => {
    window.storage.get(USER_KEY).then(r => {
      if (r?.value) {
        try { setUser(JSON.parse(r.value)); } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    window.storage.get(WT_KEY).then(r => {
      if (r?.value) {
        try { setWeightLog(JSON.parse(r.value)); } catch {}
      }
      setWtLoaded(true);
    }).catch(() => setWtLoaded(true));
  }, []);

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

  // Rebound tab only for contest goal
  const NAV = [
    {id:"home",label:"Home"},
    {id:"training",label:"Training"},
    {id:"nutrition",label:"Nutrition"},
    ...(user?.goal==="contest" ? [{id:"postprep",label:"Rebound"}] : []),
    {id:"coach",label:"Coach"},
  ];

  const [endConfirm, setEndConfirm] = useState(false);

  const handleMiniEnd = () => {
    if (endConfirm) { endSession(); setEndConfirm(false); }
    else { setEndConfirm(true); setTimeout(() => setEndConfirm(false), 3000); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <WaveField fixed opacity={0.22} />
        {!user ? <OnboardScreen onComplete={u=>{ window.storage.set(USER_KEY, JSON.stringify(u)).catch(()=>{}); setUser(u); setTab("home"); }}/> : (
          <>
            {tab==="home"&&<DashboardScreen user={enrichedUser} weightLog={weightLog} onLogWeight={handleLogWeight} onDeleteWeight={handleDeleteWeight} onEditWeight={handleEditWeight} onNavigate={setTab}/>}
            {tab==="training"&&<TrainingScreen user={enrichedUser} onNavigate={setTab}/>}
            {tab==="nutrition"&&<NutritionScreen user={enrichedUser}/>}
            {tab==="postprep"&&user?.goal==="contest"&&<PostPrepScreen user={enrichedUser}/>}
            {tab==="coach"&&<CoachScreen user={enrichedUser}/>}
            {/* Mini session view — shown on all non-training tabs when a session is active */}
            {session && tab !== "training" && (
              <MiniSessionView
                onExpand={() => setTab("training")}
                onEnd={handleMiniEnd}
                endConfirm={endConfirm}
              />
            )}
            <nav className="nav">
              {NAV.map(n=>(
                <button key={n.id} className={`ni ${tab===n.id?"on":""}`} onClick={()=>setTab(n.id)}>
                  <NavIcon id={n.id}/>
                  {n.id === "training" && session && tab !== "training"
                    ? <span className="ni-label" style={{color:"var(--accent)"}}>● Active</span>
                    : <span className="ni-label">{n.label}</span>
                  }
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  );
}
