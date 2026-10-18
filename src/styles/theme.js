import { useEffect, useState } from "react";

// Canvas-only color tokens — CSS vars can't be read by the Canvas 2D API.
// Call getCanvasC() inside useEffect (after mount) to read the live system theme.
export const CANVAS_DARK = {
  bg:"#09090B", surface:"#111315", up:"#191D22", border:"#232B35",
  card:"#151C28", brutal:"#F0EDE8",
  accent:"#F5A623", accentDim:"#C47D10", accentInk:"#F5A623",
  red:"#E84545", green:"#3DDC84", blue:"#5B8FF9",
  purple:"#A78BFA", text:"#F0EDE8", muted:"#9BA1AA", faint:"#80868D",
};
export const CANVAS_LIGHT = {
  bg:"#F5F3EF", surface:"#FFFFFF", up:"#EDEAE4", border:"#DDD9D0",
  card:"#EDE5CF", brutal:"#1A1917",
  accent:"#C48A00", accentDim:"#946B00", accentInk:"#855E00",
  red:"#C43030", green:"#1A9E58", blue:"#3A6AD4",
  purple:"#6B52C8", text:"#1A1917", muted:"#5E5A53", faint:"#686561",
};
export function getCanvasC() {
  if (typeof window === "undefined" || !window.matchMedia) return CANVAS_DARK;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? CANVAS_DARK : CANVAS_LIGHT;
}
// Reactive theme hook — use inside every component that needs C for inline styles
export function useThemeColors() {
  const [C, setC] = useState(getCanvasC);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setC(getCanvasC());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return C;
}
