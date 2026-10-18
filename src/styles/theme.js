import { useEffect, useState } from "react";

// Canvas-only color tokens — CSS vars can't be read by the Canvas 2D API.
// Call getCanvasC() inside useEffect (after mount) to read the live system theme.
export const CANVAS_DARK = {
  bg:"#0B0B0D", surface:"#1C1C1E", up:"#2C2C2E", border:"#38383A", card:"#1C1C1E", brutal:"#F5F5F7",
  accent:"#F5A623", accentDim:"#C9860F", accentInk:"#F5A623", red:"#FF5A4F", green:"#34C76A", blue:"#4C9BFF",
  purple:"#B58CF5", text:"#F5F5F7", muted:"#A1A1A6", faint:"#8E8E93",
  ringTrain:"#DE5A2A", ringFuel:"#12A3A0", ringTrack:"#6A6AF2",
};
export const CANVAS_LIGHT = {
  bg:"#F2F2F7", surface:"#FFFFFF", up:"#E9E9EE", border:"#D8D8DD", card:"#FFFFFF", brutal:"#111114",
  accent:"#A86F00", accentDim:"#8A5B00", accentInk:"#8A5B00", red:"#D1291F", green:"#1E7F3E", blue:"#1F64C8",
  purple:"#7442A8", text:"#111114", muted:"#5F5F66", faint:"#6E6E75",
  ringTrain:"#C4431A", ringFuel:"#009180", ringTrack:"#4B4FD8",
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
