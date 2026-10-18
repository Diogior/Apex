// Global stylesheet. Phase 1 (design reset) moved it onto system type, soft surfaces and the token set below.
export const styles = `

:root{
  --font-text:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --font-num:ui-rounded,"SF Pro Rounded",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;

  --bg:#F2F2F7;--surface:#FFFFFF;--up:#E9E9EE;--border:#D8D8DD;
  --card:#FFFFFF;
  --text:#111114;--muted:#5F5F66;--faint:#6E6E75;
  --accent:#A86F00;--accent-dim:#8A5B00;--accent-ink:#8A5B00;
  --red:#D1291F;--green:#1E7F3E;--blue:#1F64C8;--purple:#7442A8;
  --brutal:#111114;
  --ring-train:#C4431A;--ring-fuel:#009180;--ring-track:#4B4FD8;
  --radius-sm:10px;--radius-md:12px;--radius-lg:16px;--radius-xl:22px;
  --shadow-1:0 1px 2px rgba(0,0,0,.05),0 6px 18px rgba(0,0,0,.06);
}
@media(prefers-color-scheme:dark){
  :root{
    --bg:#0B0B0D;--surface:#1C1C1E;--up:#2C2C2E;--border:#38383A;
    --card:#1C1C1E;
    --text:#F5F5F7;--muted:#A1A1A6;--faint:#8E8E93;
    --accent:#F5A623;--accent-dim:#C9860F;--accent-ink:#F5A623;
    --red:#FF5A4F;--green:#34C76A;--blue:#4C9BFF;--purple:#B58CF5;
    --brutal:#F5F5F7;
    --ring-train:#DE5A2A;--ring-fuel:#12A3A0;--ring-track:#6A6AF2;
    --shadow-1:none;
  }
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:var(--font-text);font-size:17px;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
.app{max-width:430px;min-height:100vh;margin:0 auto;background:var(--bg);position:relative;}

/* ═══ CINEMATIC MATERIAL SYSTEM ════════════════════════════════════════════ */

/* Material tokens — light mode */
:root{
  --depth-shadow:var(--shadow-1);
  --inner-light:0 0 0 transparent;
  --glass-tint:rgba(255,255,255,.50);
  --glass-border:rgba(255,255,255,.35);
  --charge-glow:0 0 0 1px var(--accent);
  --ambient-warm:none;
}

/* Material tokens — dark mode */
@media(prefers-color-scheme:dark){
  :root{
    --depth-shadow:var(--shadow-1);
    --inner-light:0 0 0 transparent;
    --glass-tint:rgba(255,255,255,.04);
    --glass-border:rgba(255,255,255,.08);
    --charge-glow:0 0 0 1px var(--accent);
    --ambient-warm:none;
  }
}

/* Ambient lighting — baked into .app background-image so no pseudo-element
   or stacking-context tricks are needed (isolation:isolate breaks position:fixed
   on iOS Safari by turning .app into a containing block for all fixed children) */
.app{background-image:none;}
@media(prefers-color-scheme:dark){
  .app{background-image:none;}
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
  border-radius:10px!important;
}

/* Auth inputs + onboarding inputs keep 4px (already sharp) */
.auth-input,.ob2-input{border-radius:10px!important;}

/* Stat strip: pump shadow offset slightly */
.stat-strip{box-shadow:var(--shadow-1)!important;}

/* Ecard hover: sharper lift + stronger shadow */
.ecard:hover{
  transform:translateY(-1px)!important;
  box-shadow:var(--shadow-1)!important;
}

/* Brutalist focus ring for all normal inputs */
input:focus,textarea:focus,select:focus{
  outline:none!important;
  border-color:var(--accent)!important;
  box-shadow:var(--shadow-1)!important;
}

/* Surface material helpers */
.surface-glass{background:var(--glass-tint);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid var(--glass-border);}
.surface-charged{box-shadow:var(--charge-glow),var(--inner-light) !important;}

/* Greeting line above the screen title */
.sh-greeting{font-family:var(--font-text);font-size:14px;font-weight:300;color:var(--muted);letter-spacing:0;line-height:1;margin-bottom:3px;}

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
.ci-area,.wt-notif-wrap,.photo-strip,.msv,.cx-card-wrap,.cx-empty-state,.sheet-backdrop{animation:none!important;}
/* The rest timer animates itself; it must not inherit the staggered screen entrance either. */
.screen>.rest-timer{animation:restIn .4s cubic-bezier(.16,1,.3,1)!important;}

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
.auth-wordmark{font-family:var(--font-display);font-weight:700;font-size:52px;letter-spacing:0;color:var(--text);line-height:1;margin-bottom:8px;position:relative;z-index:1;}
.auth-eyebrow{font-size:12px;letter-spacing:0;text-transform:none;color:var(--accent-ink);font-weight:600;margin-bottom:28px;position:relative;z-index:1;}
.auth-card{width:100%;max-width:360px;background:var(--card);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow-1);padding:28px 24px 24px;display:flex;flex-direction:column;gap:18px;}
.auth-card-title{font-weight:900;font-size:18px;color:var(--text);line-height:1.2;}
.auth-card-title span{display:block;font-weight:500;font-size:14px;color:var(--muted);margin-top:3px;}
.auth-toggle{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--shadow-1);}
.auth-tab{padding:10px;background:var(--bg);border:none;cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:13px;letter-spacing:0;color:var(--muted);transition:all .15s;}
.auth-tab:first-child{border-right:1px solid var(--border);}
.auth-tab.active{background:var(--brutal);color:var(--card);}
.auth-input{width:100%;height:46px;border-radius:10px;border:1px solid var(--border);background:var(--bg);box-shadow:var(--shadow-1);font-size:14px;font-weight:600;color:var(--text);padding:0 14px;outline:none;font-family:var(--font-text);transition:border-color .15s,box-shadow .15s;}
.auth-input::placeholder{color:var(--muted);font-weight:400;}
.auth-input:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}
.auth-field{display:flex;flex-direction:column;gap:6px;}
.auth-label{font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;color:var(--brutal);}
.auth-submit{width:100%;height:46px;border-radius:10px;border:1px solid var(--border);background:var(--bg);box-shadow:var(--shadow-1);font-size:15px;font-weight:700;color:var(--text);cursor:pointer;font-family:var(--font-display);font-weight:700;letter-spacing:0;transition:transform .1s,box-shadow .1s;margin-top:8px;}
.auth-submit:hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.auth-submit:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.auth-submit:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.auth-error{padding:10px 14px;background:var(--bg);border:2px solid #e53e3e;border-radius:10px;box-shadow:var(--shadow-1);font-size:12px;font-weight:600;color:#e53e3e;line-height:1.5;}
.auth-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
.auth-loading-text{font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:0;color:var(--muted);animation:pulse 2s infinite;}

/* ── SSJ LOADING ─────────────────────────────────────────────────────────── */
@keyframes apexLoad{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}
@keyframes ssj-overlay-in{from{opacity:0}to{opacity:1}}

.ssj-overlay{position:fixed;inset:0;background:var(--bg);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;animation:ssj-overlay-in .2s ease;}
.apex-loader-word{font-family:var(--font-display);font-weight:700;font-size:clamp(48px,12vw,72px);letter-spacing:0;color:var(--text);line-height:1;}
.apex-loader-bar{width:160px;height:2px;background:var(--border);border-radius:1px;overflow:hidden;position:relative;}
.apex-loader-fill{position:absolute;top:0;left:0;width:50%;height:100%;background:var(--brutal);border-radius:1px;animation:apexLoad 1.4s cubic-bezier(.4,0,.2,1) infinite;}
.apex-loader-label{font-size:12px;letter-spacing:0;text-transform:none;color:var(--muted);font-weight:600;}

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
  font-size:12px;letter-spacing:0;
  text-transform:none;
  color:var(--accent-ink);
  margin-bottom:14px;
  font-weight:600;
  position:relative;z-index:1;
}
.ob2-wordmark{
  font-family:var(--font-display);font-weight:700;
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
.ob2-feat-sub{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.45;}

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
  font-family:var(--font-display);font-weight:700;
  font-size:14px;letter-spacing:0;
  color:var(--accent-ink);
  border:1px solid var(--border);
  border-radius:10px;
  padding:3px 10px;
  box-shadow:var(--shadow-1);
}
.ob2-back-btn{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:10px;
  box-shadow:var(--shadow-1);
  font-size:12px;font-weight:700;letter-spacing:0;
  text-transform:none;
  color:var(--text);
  cursor:pointer;padding:5px 12px;
  font-family:var(--font-display);font-weight:700;
  transition:transform .1s,box-shadow .1s;
}
.ob2-back-btn:hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ob2-back-btn:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ob2-step-h{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(38px,11vw,52px);
  letter-spacing:0;
  line-height:.96;
  color:var(--text);
  margin-bottom:28px;
}
.ob2-step-h em{font-style:normal;color:var(--accent-ink);}

/* Shared: selection list */
.ob2-list{flex:1;display:flex;flex-direction:column;gap:10px;margin-bottom:28px;overflow-y:auto;}
.ob2-row{
  display:flex;align-items:center;gap:14px;
  padding:14px 16px;
  border-radius:10px;
  cursor:pointer;
  background:var(--card);
  border:1px solid var(--border);
  box-shadow:var(--shadow-1);
  text-align:left;width:100%;
  transition:transform .12s,box-shadow .12s,border-color .12s;
}
.ob2-row:hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ob2-row.sel{border-color:var(--accent);box-shadow:var(--shadow-1);}
.ob2-row.sel:hover{box-shadow:var(--shadow-1);}
.ob2-row-num{
  font-family:var(--font-display);font-weight:700;
  font-size:18px;
  color:var(--accent-ink);
  line-height:1;width:28px;flex-shrink:0;
}
.ob2-row-info{flex:1;}
.ob2-row-name{font-size:14px;font-weight:600;color:var(--text);line-height:1.2;}
.ob2-row-desc{font-size:12px;color:var(--muted);margin-top:2px;}
.ob2-row-check{
  width:18px;height:18px;border-radius:10px;
  border:1px solid var(--border);
  flex-shrink:0;display:flex;
  align-items:center;justify-content:center;
  color:var(--accent-ink);
  transition:all .15s;
}
.ob2-row.sel .ob2-row-check{background:var(--accent);border-color:var(--accent);color:#1A1917;}

/* Level rows — brutalist card */
.ob2-level-row{
  padding:18px 20px;
  border-radius:10px;
  cursor:pointer;
  border:1px solid var(--border);
  box-shadow:var(--shadow-1);
  background:var(--card);
  transition:transform .12s,box-shadow .12s,border-color .12s;
}
.ob2-level-row:hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ob2-level-row.sel{border-color:var(--accent);box-shadow:var(--shadow-1);}
.ob2-level-row.sel:hover{box-shadow:var(--shadow-1);}
.ob2-level-name{
  font-family:var(--font-display);font-weight:700;
  font-size:22px;letter-spacing:0;
  color:var(--text);line-height:1;
}
.ob2-level-row.sel .ob2-level-name{color:var(--accent-ink);}
.ob2-level-desc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4;}

/* Profile form */
.ob2-form{flex:1;display:flex;flex-direction:column;gap:16px;margin-bottom:24px;}
.ob2-field{display:flex;flex-direction:column;gap:6px;}
.ob2-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ob2-label{
  font-size:12px;font-weight:700;
  letter-spacing:0;text-transform:none;
  color:var(--brutal);
}
.ob2-input{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:10px;
  box-shadow:var(--shadow-1);
  padding:13px 16px;
  color:var(--text);
  font-size:16px;
  font-family:var(--font-text);
  outline:none;
  transition:border-color .15s,box-shadow .15s;
  width:100%;
}
.ob2-input:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}

/* Shared CTA — Pearl glass */
.ob2-cta{
  width:100%;padding:16px;
  background:var(--accent);color:#FFF;
  border:none;border-radius:100px;
  font-family:var(--font-display);font-weight:700;
  font-size:18px;letter-spacing:0;
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
  font-family:var(--font-display);font-weight:700;font-size:17px;letter-spacing:0;
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
.btn-outline{background:var(--up);border:1px solid var(--border);color:var(--muted);padding:10px 18px;border-radius:100px;font-family:var(--font-text);font-size:13px;cursor:pointer;transition:all .15s ease;box-shadow:inset 0 0.2rem 0.5rem rgba(255,255,255,0.15),inset 0 -0.2rem 0.4rem rgba(0,0,0,0.3);}
.btn-outline:hover{border-color:var(--accent);color:var(--accent-ink);}

/* INPUTS */
.igroup{display:flex;flex-direction:column;gap:6px;}
.ilabel{font-size:12px;font-weight:500;letter-spacing:0;color:var(--muted);}
.ifield{background:var(--up);border:1px solid var(--border);border-radius:12px;padding:13px 16px;color:var(--text);font-size:15px;font-family:var(--font-text);outline:none;transition:border-color .2s,box-shadow .2s;width:100%;}
.ifield:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}
.irow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:0 0 env(safe-area-inset-bottom,0);z-index:100;
  background:color-mix(in srgb,var(--bg) 82%,transparent);
  backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);
  border-top:.5px solid var(--border);}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.nav{background:var(--bg);}}
.nav-pill{position:relative;display:flex;background:transparent;border:0;box-shadow:none;height:56px;}
.nav-glider{display:none;}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;padding:6px 2px 4px;min-height:44px;border:none;background:transparent;color:var(--faint);transition:color .2s ease;}
.ni:active{transform:scale(0.94);}
.ni svg{width:26px;height:26px;}
.ni-label{font-size:12px;font-weight:500;letter-spacing:0;color:inherit;}
.ni.on{color:var(--accent-ink);}

/* SCREENS */
.screen{padding:0 0 96px;min-height:100vh;}
@keyframes screenIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes musclePulse{from{opacity:.3}to{opacity:1}}
.sh{padding:54px 24px 20px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:120;}
.sh-label{font-size:12px;color:var(--muted);font-weight:500;}
.sh-title{font-family:var(--font-display);font-weight:700;font-size:28px;letter-spacing:0;color:var(--text);}
.sh-avatar{width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#FFF;flex-shrink:0;}
.stitle{font-size:12px;font-weight:600;letter-spacing:0;color:var(--muted);text-transform:none;padding:0 24px;margin-bottom:12px;margin-top:24px;}
.stitle:first-child{margin-top:0;}

/* DASHBOARD */
/* Weight hero — dominant full-width block */
.wt-hero{margin:0 24px 16px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 22px 18px;box-shadow:var(--shadow-1);transition:border-color .2s,box-shadow .2s;}
.wt-hero.focused{border-color:var(--accent);box-shadow:var(--shadow-1);}
.wt-hero.logged{border-color:var(--green);box-shadow:var(--shadow-1);}
.wt-hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
.wt-label{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:6px;}
.wt-number{font-family:var(--font-display);font-weight:700;font-size:64px;letter-spacing:0;line-height:1;color:var(--text);transition:color .4s ease;}
.wt-number.saved{color:var(--green);}
.wt-unit{font-size:13px;color:var(--muted);margin-left:2px;}
.wt-change{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-size:12px;font-weight:600;padding:3px 9px;border-radius:20px;}
.wt-change.pos{background:rgba(26,158,88,.1);color:var(--green);}
.wt-change.neg{background:rgba(58,106,212,.1);color:var(--blue);}
.wt-change.flat{background:var(--up);color:var(--muted);}
.goal-rate{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);}
.goal-rate-label{font-size:12px;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:4px;font-weight:600;}
.goal-rate-row{display:flex;align-items:baseline;gap:10px;}
.goal-rate-val{font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:0;color:var(--text);}
.goal-rate-status{font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;}
.goal-rate-target{font-size:12px;color:var(--faint);margin-top:3px;}
/* Weigh-in streak pill */
.streak-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-family:var(--font-display);font-weight:700;letter-spacing:0;}
.streak-pill.ok{background:rgba(26,158,88,.12);color:var(--green);border:1px solid rgba(26,158,88,.25);}
.streak-pill.nudge{background:rgba(251,191,36,.12);color:#FBBF24;border:1px solid rgba(251,191,36,.25);}
.streak-pill.warn{background:rgba(var(--accent-rgb),.12);color:var(--accent-ink);border:1px solid rgba(var(--accent-rgb),.25);}
.streak-pill.danger{background:rgba(var(--red-rgb),.12);color:var(--red);border:1px solid rgba(var(--red-rgb),.25);}
/* Goal pacing card */
.pace-card{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);}
.pace-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.pace-badge{font-size:12px;font-family:var(--font-display);font-weight:700;letter-spacing:0;padding:3px 9px;border-radius:10px;font-weight:700;}
.pace-rate-num{font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:0;}
.pace-bar-track{height:4px;background:var(--up);border-radius:10px;overflow:hidden;margin-bottom:6px;}
.pace-bar-fill{height:100%;border-radius:10px;transition:width .9s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .95s cubic-bezier(.16,1,.3,1) both;}
.pace-foot{display:flex;justify-content:space-between;align-items:center;}
.pace-milestone{margin-top:8px;padding:7px 11px;background:var(--up);border-radius:12px;display:flex;align-items:center;justify-content:space-between;}
/* Post-log reaction */
.log-reaction{margin-top:8px;padding:9px 12px;border-radius:12px;font-size:12px;line-height:1.5;animation:slideUp .25s cubic-bezier(.22,1,.36,1);}
/* Weight reminder notification banner */
.wt-notif-wrap{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:200;pointer-events:none;}
.wt-notif{margin:8px 12px 0;padding:11px 14px 11px 13px;border-radius:12px;display:flex;align-items:center;gap:10px;pointer-events:all;animation:notifSlideDown .35s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 16px rgba(0,0,0,.18);}
.wt-notif.daily{background:color-mix(in srgb,var(--accent) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);}
.wt-notif.week{background:color-mix(in srgb,var(--red) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--red) 35%,transparent);}
.wt-notif-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.wt-notif-body{flex:1;min-width:0;}
.wt-notif-title{font-family:var(--font-display);font-weight:700;font-size:13px;letter-spacing:0;line-height:1.1;margin-bottom:2px;}
.wt-notif-sub{font-size:12px;color:var(--muted);line-height:1.4;}
.wt-notif-actions{display:flex;gap:6px;align-items:center;flex-shrink:0;}
.wt-notif-cta{padding:5px 11px;border:none;border-radius:10px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0;cursor:pointer;}
.wt-notif-dismiss{background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;padding:2px 4px;line-height:1;opacity:.7;}
@keyframes notifSlideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
.wt-history{display:flex;gap:6px;align-items:flex-end;height:40px;margin-bottom:14px;}
.wt-bar-wrap{display:flex;flex-direction:column;align-items:center;flex:1;}
.wt-bar{border-radius:10px 3px 0 0;min-height:4px;transition:height .5s ease;width:100%;max-width:18px;}
.wt-input-row{display:flex;gap:8px;align-items:stretch;}
.wt-input{flex:1;width:100%;min-width:0;background:var(--up);border:1px solid var(--border);border-radius:10px;padding:11px 44px 11px 14px;color:var(--text);font-size:18px;font-family:var(--font-display);font-weight:700;letter-spacing:0;outline:none;transition:border-color .2s,box-shadow .2s;}
.wt-input:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}
.wt-input:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}
.wt-input-unit{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--muted);}
.wt-log-btn{padding:0 20px;background:var(--accent);color:#FFF;border:none;border-radius:100px;font-family:var(--font-display);font-weight:700;font-size:14px;letter-spacing:0;cursor:pointer;flex-shrink:0;position:relative;overflow:hidden;transition:all 0.2s ease;box-shadow:inset 0 0.3rem 0.7rem rgba(255,255,255,0.35),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.4),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
.wt-log-btn::before{content:"";position:absolute;left:-15%;right:-15%;bottom:25%;top:-100%;border-radius:50%;background-color:rgba(255,255,255,0.13);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn::after{content:"";position:absolute;left:8%;right:8%;top:10%;bottom:42%;border-radius:16px 16px 0 0;box-shadow:inset 0 8px 6px -8px rgba(255,255,255,0.85);background:linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(0,0,0,0) 100%);pointer-events:none;transition:all 0.3s ease;}
.wt-log-btn:disabled{opacity:.35;cursor:not-allowed;}
.wt-log-btn.saved{background:var(--green);}
.wt-log-btn:not(:disabled):hover{box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.45),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.5),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.6),0 0.6rem 0.8rem -0.4rem rgba(0,0,0,0.7);}
/* ── CUBE BUTTON ───────────────────────────────────────────────────────────── */
.cube-btn{display:inline-flex;align-items:center;justify-content:center;padding:0.62em 1.4em;background:var(--card);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow-1);color:var(--brutal);letter-spacing:0;font-family:var(--font-display);font-weight:700;font-size:15px;font-weight:bold;cursor:pointer;transition:transform .1s,box-shadow .1s;}
.cube-btn.sm{font-size:12px;padding:0.42em 1em;letter-spacing:0;}
.cube-btn:disabled{opacity:.38;cursor:not-allowed;pointer-events:none;}
.cube-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.cube-btn:not(:disabled):active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.cube-btn.saved{border-color:var(--green);box-shadow:var(--shadow-1);color:var(--green);}
.cube-btn.saved:not(:disabled):hover{box-shadow:var(--shadow-1);}
.cube-btn.saved:not(:disabled):active{box-shadow:var(--shadow-1);}
/* Secondary stat strip */
.stat-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;margin:0 24px 20px;background:var(--border);border-radius:12px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow-1);}
.stat-cell{background:var(--card);padding:14px 14px 12px;}
.stat-cell:first-child{border-radius:13px 0 0 13px;}
.stat-cell:last-child{border-radius:0 13px 13px 0;}
.stat-label{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:5px;}
.stat-val{font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:0;line-height:1;color:var(--text);}
.stat-today{color:var(--text);font-weight:600;}
.stat-sub{font-size:12px;color:var(--muted);margin-top:3px;line-height:1.3;}
/* Training block */
.dash-banner{margin:0 24px 20px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:var(--shadow-1);}
.db-tag{font-size:12px;font-weight:600;letter-spacing:0;color:var(--accent-ink);margin-bottom:5px;}
.db-title{font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:0;color:var(--text);}
.db-sub{font-size:13px;color:var(--muted);margin-top:3px;}
.streak{display:flex;align-items:center;gap:6px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);}
.sdot{width:26px;height:26px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.sdot.on{background:var(--ring-train);color:#FFF;}
.sdot.off{background:var(--up);color:var(--muted);border:1px solid var(--border);}

/* TRAINING */
.wscroll{display:flex;gap:8px;padding:0 24px;overflow-x:auto;margin-bottom:20px;scrollbar-width:none;}
.wscroll::-webkit-scrollbar{display:none;}
.dchip{flex-shrink:0;padding:8px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-1);cursor:pointer;text-align:center;transition:all .15s cubic-bezier(.22,1,.36,1);min-width:56px;}
.dchip.on{background:var(--accent);border-color:var(--border);box-shadow:var(--shadow-1);}
.dchip:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.dchip-l{font-size:12px;color:var(--muted);font-weight:500;}
.dchip.on .dchip-l{color:#FFF;}
.mbadge{display:inline-block;font-size:12px;font-weight:500;padding:3px 10px;border-radius:20px;margin:2px 3px;background:var(--up);color:var(--muted);border:1px solid var(--border);}
.mbadge.pri{color:var(--accent-ink);}
.ecard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin:0 24px 12px;box-shadow:var(--shadow-1);transition:border-color .15s,box-shadow .15s,transform .15s;}
.ecard:hover{border-color:var(--accent);box-shadow:var(--shadow-1);transform:translateY(-1px);}
.ec-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;}
.ec-name{font-size:15px;font-weight:600;color:var(--text);}
.ec-num{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--accent-ink);line-height:1;}


/* NUTRITION */
.mcard{margin:0 24px 12px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow-1);}
.nut-card{margin:0 24px 14px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow-1);}
.nut-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 24px 16px;}
.nut-mode-card{padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-1);cursor:pointer;transition:box-shadow .15s,transform .15s;}
.nut-mode-card.active{border-color:var(--accent);box-shadow:var(--shadow-1);}
.nut-mode-card:hover{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.nut-mode-card.active:hover{box-shadow:var(--shadow-1);}
.nut-mode-tag{font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:4px;}
.nut-mode-card.active .nut-mode-tag{color:var(--accent-ink);}
.nut-mode-label{font-family:var(--font-display);font-weight:700;font-size:14px;letter-spacing:0;color:var(--text);}
.nut-mode-card.active .nut-mode-label{color:var(--accent-ink);}
.nut-mode-desc{font-size:12px;color:var(--muted);margin-top:2px;}
.mc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mc-time{font-size:12px;font-weight:600;letter-spacing:0;color:var(--accent-ink);}
.mc-name{font-size:15px;font-weight:600;margin-top:2px;color:var(--text);}
.mc-kcal{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;}
.mc-items{font-size:13px;color:var(--muted);line-height:1.6;}
.pbar{height:3px;background:var(--up);border-radius:10px;overflow:hidden;margin-top:10px;}
.pfill{height:100%;border-radius:10px;transition:width .6s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .85s cubic-bezier(.16,1,.3,1) both;}
@keyframes typingBounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}

/* COACH */
.ch-header{padding:54px 24px 18px;background:var(--surface);border-bottom:1px solid var(--border);}
.ch-id{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.ch-av{width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;position:relative;}
.ch-av svg{width:22px;height:22px;color:#FFF;}
.ch-dot{position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid var(--surface);}
.ch-name{font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:0;color:var(--text);}
.ch-status{font-size:12px;color:var(--green);font-weight:500;}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
.chip{flex-shrink:0;font-size:12px;padding:7px 14px;border-radius:20px;background:var(--up);border:1px solid var(--border);color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;font-weight:500;}
.chip:hover{border-color:var(--accent);color:var(--accent-ink);}
.msgs{padding:20px 20px 0;display:flex;flex-direction:column;gap:14px;overflow-y:auto;height:calc(100vh - 380px);scrollbar-width:none;}
.msgs::-webkit-scrollbar{display:none;}
.msg{display:flex;align-items:flex-end;gap:8px;animation:msgIn .3s ease forwards;}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.msg.user{flex-direction:row-reverse;}
.mav{width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mav svg{width:13px;height:13px;color:#FFF;}
.mbub{max-width:80%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.55;white-space:pre-wrap;}
.msg.coach .mbub{background:var(--up);border:1px solid var(--border);border-bottom-left-radius:4px;color:var(--text);}
.msg.user .mbub{background:var(--accent);color:#FFF;border-bottom-right-radius:4px;font-weight:500;}
.typing{display:flex;gap:4px;padding:12px 16px;background:var(--up);border:1px solid var(--border);border-radius:16px;border-bottom-left-radius:4px;width:fit-content;}
.tdot{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:tb 1.2s ease infinite;}
.tdot:nth-child(2){animation-delay:.2s;}.tdot:nth-child(3){animation-delay:.4s;}
@keyframes tb{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}

/* PHOTO STRIP */
.photo-strip{position:fixed;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-top:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;z-index:49;}
.photo-strip::-webkit-scrollbar{display:none;}
.pthumb{position:relative;flex-shrink:0;}
.pthumb img{width:56px;height:56px;object-fit:cover;border-radius:12px;border:1px solid var(--border);display:block;}
.pthumb-rm{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:var(--red);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;}

/* CHAT INPUT */
.ci-area{position:fixed;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end;z-index:110;transition:bottom .2s;}
.ci{flex:1;background:var(--up);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:14px;font-family:var(--font-text);outline:none;resize:none;max-height:100px;line-height:1.4;transition:border-color .2s,box-shadow .2s;}
.ci:focus{border-color:var(--accent);box-shadow:var(--shadow-1);}
.ci-send{width:40px;height:40px;border-radius:12px;background:var(--accent);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s;color:#FFF;}
.ci-send svg{width:18px;height:18px;}
.ci-send:hover{opacity:.85;}
.ci-send:disabled{opacity:.35;cursor:not-allowed;}
.ci-photo{width:40px;height:40px;border-radius:12px;background:var(--up);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s;color:var(--muted);}
.ci-photo svg{width:18px;height:18px;}
.ci-photo:hover{border-color:var(--accent);color:var(--accent-ink);}
.photo-input{display:none;}

/* POST-PREP */
.pp-hero{margin:0 24px 20px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;box-shadow:var(--shadow-1);}
.pp-badge{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;margin-bottom:6px;}
.pp-title{font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:0;line-height:1.1;color:var(--text);}
.pp-sub{font-size:13px;color:var(--muted);margin-top:8px;line-height:1.6;}
.pp-card{margin:0 24px 16px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:var(--shadow-1);}
.pp-section-label{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;margin-bottom:14px;}
.pp-results{animation:slideUp .4s ease-out forwards;}

/* SAVED BANNER */
.saved-banner{margin:0 24px 16px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--green);border-radius:12px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:var(--shadow-1);}
.sb-tag{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--green);margin-bottom:4px;}
.sb-title{font-family:var(--font-display);font-weight:700;font-size:17px;letter-spacing:0;color:var(--text);}
.sb-sub{font-size:12px;color:var(--muted);margin-top:2px;}
.btn-edit{background:transparent;border:1px solid var(--border);color:var(--muted);padding:8px 16px;border-radius:12px;box-shadow:var(--shadow-1);font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .15s cubic-bezier(.22,1,.36,1);}
.btn-edit:hover{border-color:var(--accent);color:var(--accent-ink);box-shadow:var(--shadow-1);}
.btn-edit:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}

/* PHASE TIMELINE */
.ptl{margin:0 24px 20px;position:relative;}
.ptl-line{position:absolute;left:18px;top:28px;bottom:28px;width:1px;background:var(--border);}
.pi{display:flex;gap:14px;margin-bottom:14px;}
.pidot{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:0;flex-shrink:0;position:relative;z-index:1;border:1.5px solid;}
.pidot.p1{background:var(--surface);border-color:var(--purple);color:var(--purple);}
.pidot.p2{background:var(--surface);border-color:var(--accent);color:var(--accent-ink);}
.pidot.p3{background:var(--surface);border-color:var(--green);color:var(--green);}
.pidot.p4{background:var(--surface);border-color:var(--blue);color:var(--blue);}
.picnt{flex:1;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;box-shadow:var(--shadow-1);}
.pi-wk{font-size:12px;font-weight:600;letter-spacing:0;color:var(--muted);margin-bottom:3px;}
.pi-name{font-family:var(--font-display);font-weight:700;font-size:16px;letter-spacing:0;margin-bottom:8px;color:var(--text);}
.pi-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;}
.pi-tag{font-size:12px;padding:2px 8px;border-radius:10px;font-variant-numeric:tabular-nums;}
.pi-desc{font-size:12px;color:var(--muted);line-height:1.55;}

/* KEY NUMBER CARDS */
.knum-grid{display:grid;gap:12px;margin:0 24px 14px;}
.knum{border-radius:12px;padding:16px 18px;border:2px solid;box-shadow:var(--shadow-1);}
.knum-label{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;margin-bottom:8px;}
.knum-main{font-family:var(--font-display);font-weight:700;font-size:34px;letter-spacing:0;line-height:1;}
.knum-sub{font-size:12px;color:var(--muted);margin-top:3px;}
.knum-note{font-size:12px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border);line-height:1.55;}
.knum-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 24px 14px;}
.knum-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:0 24px 14px;}
.knum-mini{background:var(--card);border-radius:12px;padding:12px 10px;text-align:center;border:2px solid;box-shadow:var(--shadow-1);}
/* ── PROTOCOL INTELLIGENCE REDESIGN ─────────────────────────────────────────── */
.pi-wrap{margin:0 24px 20px;display:flex;flex-direction:column;gap:10px;}
.pi-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow-1);}
.pi-group{font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:12px;}
.pi-body-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;text-align:center;}
.pi-body-divider{width:1px;background:var(--border);}
.pi-body-cell{padding:4px 8px;}
.pi-body-val{font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:0;color:var(--text);line-height:1;}
.pi-body-label{font-size:12px;color:var(--muted);text-transform:none;letter-spacing:0;margin-top:3px;}
.pi-divider{height:1px;background:var(--border);margin:14px 0;}
.pi-trend-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
.pi-trend-val{font-family:var(--font-display);font-weight:700;font-size:36px;letter-spacing:0;line-height:1;margin-bottom:2px;}
.pi-trend-desc{font-size:12px;color:var(--muted);line-height:1.4;}
.pi-bar-wrap{margin-top:6px;}
.pi-bar-label{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px;}
.pi-bar{height:5px;background:var(--up);border-radius:10px;overflow:hidden;border:1px solid var(--border);}
.pi-bar-fill{height:100%;border-radius:10px;transition:width .8s cubic-bezier(.16,1,.3,1);transform-origin:left center;animation:progressSettle .90s cubic-bezier(.16,1,.3,1) both;}
.pi-ready-row{display:grid;grid-template-columns:80px 1fr 48px;gap:10px;align-items:center;padding:10px 0;}
.pi-ready-row+.pi-ready-row{border-top:1px solid var(--border);}
.pi-ready-name{font-size:12px;font-weight:700;color:var(--muted);text-transform:none;letter-spacing:0;line-height:1.3;}
.pi-ready-bar{height:5px;background:var(--up);border-radius:10px;overflow:hidden;border:1px solid var(--border);}
.pi-ready-fill{height:100%;border-radius:10px;transition:width .8s cubic-bezier(.22,1,.36,1);}
.pi-ready-val{font-family:var(--font-display);font-weight:700;font-size:15px;text-align:right;flex-shrink:0;line-height:1;}
.pi-ready-sub{font-size:12px;color:var(--muted);grid-column:2 / 4;margin-top:2px;line-height:1.4;}
.pi-alert-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow-1);display:flex;gap:12px;align-items:flex-start;}
.pi-alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px;}
.pi-alert-priority{font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;margin-bottom:4px;}
.pi-alert-msg{font-size:12px;color:var(--text);line-height:1.55;}
.pi-strength-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;}
.pi-strength-row+.pi-strength-row{border-top:1px solid var(--border);}
.pi-strength-name{font-size:12px;font-weight:600;color:var(--text);}
.pi-strength-meta{font-size:12px;color:var(--muted);margin-top:1px;}
.pi-strength-trend{font-size:12px;font-weight:700;margin-left:12px;flex-shrink:0;}

/* VITALS */
.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 24px 20px;}
.vcard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;box-shadow:var(--shadow-1);}
.v-icon{width:8px;height:8px;border-radius:50%;margin:0 auto 7px;}
.v-name{font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:500;}
.v-status{font-size:12px;font-weight:600;}
.v-status.dep{color:var(--red);}
.v-status.rec{color:var(--accent-ink);}
.v-status.res{color:var(--green);}
.v-wks{font-size:12px;color:var(--muted);margin-top:2px;}
.vbar{height:3px;background:var(--up);border-radius:10px;overflow:hidden;margin-top:8px;}
.vfill{height:100%;border-radius:10px;}

/* RULES */
.rules-card{margin:0 24px 16px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;box-shadow:var(--shadow-1);}
.rule-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
.rule-row:last-child{border-bottom:none;padding-bottom:0;}
.rule-icon{font-size:15px;flex-shrink:0;margin-top:2px;}
.rule-text{font-size:13px;color:var(--muted);line-height:1.6;}
.rule-text strong{color:var(--text);}

/* PHASE TABS */
.ptabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 24px;margin-bottom:16px;}
.ptabs::-webkit-scrollbar{display:none;}
.ptab{flex-shrink:0;padding:7px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:600;letter-spacing:0;transition:all .2s;border:1px solid;}

/* SLIDER */
.slider-wrap{display:flex;flex-direction:column;gap:6px;}
.slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:10px;background:var(--up);outline:none;cursor:pointer;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--purple);cursor:pointer;border:2px solid var(--surface);}
.slider-val{font-size:13px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--text);}

/* MODE TOGGLE */
.mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.mode-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 14px 12px;cursor:pointer;transition:all .15s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden;box-shadow:var(--shadow-1);}
.mode-card:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.mode-check{position:absolute;top:8px;right:10px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#FFF;font-weight:700;}

/* LOADING */
.loading{display:flex;align-items:center;justify-content:center;min-height:60vh;}

::-webkit-scrollbar{width:0;}

/* CARD HOVER — lift + shadow extend */
.dash-banner:hover,.mcard:hover,.pp-hero:hover,.pp-card:hover,.saved-banner:hover,
.rules-card:hover,.picnt:hover,.vcard:hover,.knum:hover,.knum-mini:hover{
  transform:translateY(-1px);
  box-shadow:var(--shadow-1);
  transition:transform .15s cubic-bezier(.22,1,.36,1),box-shadow .15s cubic-bezier(.22,1,.36,1);
}
.ecard:hover{
  transform:translateY(-1px);
  border-color:var(--accent);
  box-shadow:var(--shadow-1);
}
.mode-card:hover{
  transform:translateY(-1px);
  box-shadow:var(--shadow-1);
}
.wt-hero:hover{
  transform:translateY(-1px);
  box-shadow:var(--shadow-1);
}
/* override: active collapses the lifted shadow back */
.dash-banner:active,.mcard:active,.pp-hero:active,.pp-card:active,
.rules-card:active,.picnt:active,.vcard:active,.knum:active,.knum-mini:active{
  transform:translateY(-1px);
  box-shadow:var(--shadow-1);
}

/* BUTTON ACTIVE — pearl press */
.btn:not(:disabled):active{transform:translateY(4px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.4),0 0.5rem 0.5rem -0.4rem rgba(0,0,0,0.8);}
.ob2-cta:not(:disabled):active{transform:translateY(4px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.4rem 0.9rem rgba(255,255,255,0.4),0 0.5rem 0.5rem -0.4rem rgba(0,0,0,0.8);}
.wt-log-btn:not(:disabled):active{transform:translateY(3px);box-shadow:inset 0 0.3rem 0.5rem rgba(255,255,255,0.5),inset 0 -0.1rem 0.3rem rgba(0,0,0,0.8),inset 0 -0.35rem 0.7rem rgba(255,255,255,0.3);}
.ob2-row:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ob2-level-row:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}
.ecard:active{transform:translateY(-1px);box-shadow:var(--shadow-1);}

/* MINI SESSION VIEW */
.msv{
  position:fixed;
  left:50%;transform:translateX(-50%);
  width:calc(100% - 24px);max-width:406px;
  bottom:calc(64px + env(safe-area-inset-bottom,0px));
  z-index:95;
  border-radius:16px;
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
  border-radius:16px;
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
  font-family:var(--font-num);font-variant-numeric:tabular-nums;
  font-size:16px;font-weight:700;
  color:var(--accent-ink);
  letter-spacing:0;
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
  font-size:12px;color:var(--muted);letter-spacing:0;
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
  font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;
  transition:color .15s,background .15s;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  min-width:52px;
}
.msv-btn:hover{color:var(--text);background:var(--up);}
.msv-btn:first-child{color:var(--accent-ink);}
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

/* TOUCH TARGETS (Apple HIG: 44x44pt default) */
input[type="number"]{min-height:44px;}


/* ═══ SUMMARY: RINGS + NEXT (Phase 2) ══════════════════════════════════════ */
.rings-card{margin:0 24px 16px;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-1);}
.rings-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.rings-title{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--text);}
.rings-badge{font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--up);color:var(--text);}
.rings-body{display:flex;align-items:center;gap:18px;}
.rings-legend{list-style:none;display:flex;flex-direction:column;gap:10px;flex:1;min-width:0;}
.rings-row{display:flex;gap:10px;align-items:flex-start;width:100%;padding:0;border:0;background:none;text-align:left;cursor:pointer;color:inherit;font:inherit;min-height:44px;}
.rings-row:disabled{cursor:default;}
.rings-key{width:4px;align-self:stretch;border-radius:2px;flex-shrink:0;margin:2px 0;}
.rings-text{display:flex;flex-direction:column;min-width:0;}
.rings-label{font-size:13px;font-weight:600;color:var(--muted);}
.rings-check{color:var(--text);}
.rings-value{font-family:var(--font-num);font-variant-numeric:tabular-nums;font-size:17px;font-weight:600;color:var(--text);line-height:1.25;}
.rings-detail{font-size:12px;color:var(--muted);line-height:1.35;}
.rings-week{list-style:none;display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:18px;padding-top:14px;border-top:1px solid var(--border);}
.rings-week li{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;color:var(--muted);}
.rings-week li.is-today{color:var(--text);font-weight:700;}
.ring-track{stroke:color-mix(in srgb,var(--ring-color) 22%,transparent);}
@media(prefers-color-scheme:dark){.ring-track{stroke:color-mix(in srgb,var(--ring-color) 32%,transparent);}}
.ring-arc{transition:stroke-dashoffset .9s cubic-bezier(.16,1,.3,1);}
@media(prefers-reduced-motion:no-preference){
  .ring-arc{animation:ringFill 1.1s cubic-bezier(.16,1,.3,1) both;}
}
@keyframes ringFill{from{stroke-dashoffset:var(--ring-full);}}

.next-card{margin:0 24px 16px;padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-1);display:flex;flex-direction:column;gap:4px;}
.next-eyebrow{font-size:13px;font-weight:600;color:var(--accent-ink);}
.next-title{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-.015em;color:var(--text);line-height:1.2;}
.next-detail{font-size:15px;color:var(--muted);line-height:1.4;}
.next-cta{margin-top:10px;align-self:flex-start;min-height:44px;padding:0 20px;border-radius:999px;border:0;background:var(--accent);color:#111114;font-family:var(--font-text);font-size:16px;font-weight:600;cursor:pointer;}
.next-cta:active{transform:scale(.97);}
.next-done .next-eyebrow{color:var(--muted);}


/* ═══ WORKOUT: REST TIMER, EFFORT SHEET, SUMMARY (Phase 3) ═══════════════════ */
.rest-timer{position:fixed;z-index:150;left:50%;transform:translateX(-50%);bottom:calc(72px + env(safe-area-inset-bottom,0px));
  width:calc(100% - 32px);max-width:398px;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 10px;border-radius:999px;
  background:var(--text);color:var(--bg);box-shadow:0 12px 32px rgba(0,0,0,.28);animation:restIn .4s cubic-bezier(.16,1,.3,1);}
@keyframes restIn{from{opacity:0;transform:translate(-50%,16px);}}
.rest-ring-track{fill:none;stroke:color-mix(in srgb,var(--bg) 25%,transparent);stroke-width:5;}
.rest-ring{fill:none;stroke:var(--ring-train);stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .25s linear;}
.rest-text{display:flex;flex-direction:column;flex:1;min-width:0;}
.rest-label{font-size:12px;opacity:.7;}
.rest-time{font-family:var(--font-num);font-variant-numeric:tabular-nums;font-size:22px;font-weight:600;line-height:1.1;}
.rest-btn{min-height:44px;padding:0 14px;border:0;border-radius:999px;background:transparent;color:inherit;font-size:15px;font-weight:600;cursor:pointer;}
.rest-btn-solid{background:var(--bg);color:var(--text);}

.sheet-backdrop{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;}}
.sheet{width:100%;max-width:430px;background:var(--surface);border-radius:22px 22px 0 0;padding:10px 20px calc(24px + env(safe-area-inset-bottom,0px));
  display:flex;flex-direction:column;gap:8px;animation:sheetUp .4s cubic-bezier(.16,1,.3,1);}
@keyframes sheetUp{from{transform:translateY(40px);opacity:0;}}
.sheet-handle{width:40px;height:5px;border-radius:999px;background:var(--border);margin:0 auto 8px;}
.sheet-title{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--text);}
.sheet-sub{font-size:15px;color:var(--muted);line-height:1.4;}
.effort-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px;}
.effort-btn{min-height:52px;border-radius:12px;border:1px solid var(--border);background:var(--up);color:var(--text);
  font-family:var(--font-num);font-variant-numeric:tabular-nums;font-size:20px;font-weight:600;cursor:pointer;}
.effort-btn.on{background:var(--ring-train);border-color:var(--ring-train);color:#fff;}
.effort-word{min-height:22px;text-align:center;font-size:17px;font-weight:600;color:var(--text);}
.sheet-actions{display:flex;gap:10px;margin-top:6px;}
.sheet-btn{flex:1;min-height:50px;border-radius:999px;border:1px solid var(--border);background:transparent;color:var(--text);font-size:16px;font-weight:600;cursor:pointer;}
.sheet-btn-primary{background:var(--accent);border-color:var(--accent);color:#111114;}
.sheet-btn:disabled{opacity:.4;cursor:default;}

.wsum{padding:56px 24px 120px;display:flex;flex-direction:column;gap:18px;}
.wsum-eyebrow{font-size:13px;font-weight:600;color:var(--accent-ink);}
.wsum-title{font-family:var(--font-display);font-size:34px;font-weight:700;letter-spacing:-.025em;color:var(--text);}
.wsum-hero{padding:20px;border-radius:var(--radius-lg);background:color-mix(in srgb,var(--ring-train) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--ring-train) 30%,transparent);}
.wsum-hero-label{font-size:15px;font-weight:600;color:var(--text);}
.wsum-hero-value{font-family:var(--font-num);font-variant-numeric:tabular-nums;font-size:56px;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--text);margin:6px 0;}
.wsum-hero-note{font-size:15px;color:var(--muted);}
@media(prefers-reduced-motion:no-preference){.wsum-hero{animation:pop .7s cubic-bezier(.16,1,.3,1) .15s both;}}
@keyframes pop{from{opacity:0;transform:translateY(12px) scale(.97);}}
.wsum-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;}
.wsum-stats div{background:var(--surface);padding:12px 14px;}
.wsum-stats dt{font-size:12px;color:var(--muted);}
.wsum-stats dd{margin:0;white-space:nowrap;font-family:var(--font-num);font-variant-numeric:tabular-nums;font-size:20px;font-weight:600;color:var(--text);}
.wsum-stats small{font-size:12px;color:var(--muted);font-weight:500;}
.wsum-section{display:flex;flex-direction:column;gap:8px;}
.wsum-h2{font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--text);}
.wsum-list{list-style:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2px 16px;}
.wsum-list li>span:first-child{min-width:0;}
.wsum-list li{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:48px;padding:10px 0;border-bottom:1px solid var(--border);font-size:16px;color:var(--text);}
.wsum-list li:last-child{border-bottom:0;}
.wsum-num{font-family:var(--font-num);font-variant-numeric:tabular-nums;color:var(--muted);}
.wsum-tag{white-space:nowrap;flex-shrink:0;font-size:13px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--up);color:var(--muted);text-align:right;}
.wsum-tag.up{background:color-mix(in srgb,var(--ring-train) 14%,transparent);color:var(--text);}
.wsum-coach{font-size:16px;line-height:1.5;color:var(--text);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;white-space:pre-wrap;}
.wsum-done{align-self:stretch;min-height:52px;}

.path-option{display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;transition:transform .2s cubic-bezier(.16,1,.3,1),border-color .2s;}
.path-option:active{transform:scale(.97);}
.path-option:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}


/* ═══ TREND CHART (shared: exercise history, weight trend) ═════════════════ */
.trend-chart{position:relative;margin:0;touch-action:pan-y;}
.trend-chart svg{display:block;width:100%;height:auto;overflow:visible;outline:none;}
.trend-chart svg:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:8px;}
.trend-grid line{stroke:var(--border);stroke-width:1;}
.trend-axis text{fill:var(--muted);font-size:12px;font-family:var(--font-text);font-variant-numeric:tabular-nums;}
.trend-line{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;}
.trend-dot{stroke:var(--surface);stroke-width:2;}
.trend-end{fill:var(--text);font-size:13px;font-weight:600;font-family:var(--font-num);font-variant-numeric:tabular-nums;}
.trend-cross{stroke:var(--faint);stroke-width:1;}
.trend-band{fill:color-mix(in srgb,var(--ring-fuel) 14%,transparent);}
.trend-tip{position:absolute;top:-6px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;background:var(--up);border:1px solid var(--border);pointer-events:none;white-space:nowrap;font-size:12px;color:var(--muted);box-shadow:var(--shadow-1);}
.trend-tip strong{display:block;font-size:15px;color:var(--text);font-family:var(--font-num);font-variant-numeric:tabular-nums;}
.trend-caption{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;color:var(--muted);}
.trend-swatch{width:14px;height:8px;border-radius:2px;background:color-mix(in srgb,var(--ring-fuel) 30%,transparent);}
.ex-trend{margin:0 0 12px;padding:10px 12px 6px;border-radius:12px;background:var(--up);}
.ex-trend-head{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;color:var(--muted);margin-bottom:2px;}
.ex-trend-head strong{color:var(--text);font-weight:600;}
.next-ex-btn{margin-top:12px;width:100%;min-height:48px;border-radius:999px;border:0;background:var(--text);color:var(--bg);font-size:16px;font-weight:600;cursor:pointer;}
.next-ex-btn:active{transform:scale(.98);}

/* REDUCED MOTION */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:0.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
}
`;
