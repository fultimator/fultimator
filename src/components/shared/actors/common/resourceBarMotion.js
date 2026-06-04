import { useEffect, useRef, useState } from "react";
import { alpha } from "@mui/material/styles";

const DEFAULT_MOVE_MS = 980;
const DEFAULT_DELTA_MS = 2200;
const MIN_DELTA_WIDTH_PCT = 1.25;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
const now = () =>
  typeof globalThis.performance?.now === "function"
    ? globalThis.performance.now()
    : Date.now();
const raf = (cb) =>
  typeof globalThis.requestAnimationFrame === "function"
    ? globalThis.requestAnimationFrame(cb)
    : globalThis.setTimeout(() => cb(now()), 16);
const caf = (handle) =>
  typeof globalThis.cancelAnimationFrame === "function"
    ? globalThis.cancelAnimationFrame(handle)
    : globalThis.clearTimeout(handle);

const WHITE_34 = alpha("#ffffff", 0.34);
const WHITE_30 = alpha("#ffffff", 0.3);
const WHITE_25 = alpha("#ffffff", 0.25);
const WHITE_18 = alpha("#ffffff", 0.18);
const WHITE_82 = alpha("#ffffff", 0.82);
const BLACK_35 = alpha("#000000", 0.35);
const PIP_STRIPE_24 =
  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.24) 0px, rgba(255,255,255,0.24) 3px, transparent 3px, transparent 7px)";
const PIP_STRIPE_28 =
  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.28) 3px, transparent 3px, transparent 7px)";

export function useAnimatedDeltaPercent(targetPct, opts = {}) {
  const { moveMs = DEFAULT_MOVE_MS, deltaMs = DEFAULT_DELTA_MS } = opts;

  const [animatedPct, setAnimatedPct] = useState(targetPct);
  const previousTargetRef = useRef(targetPct);
  const displayedPctRef = useRef(targetPct);
  const [delta, setDelta] = useState(null);
  const deltaSeqRef = useRef(0);

  useEffect(() => {
    const from = previousTargetRef.current;
    const to = targetPct;
    previousTargetRef.current = to;
    if (from === to) return;

    let frame = 0;
    const start = now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / moveMs);
      setAnimatedPct(from + (to - from) * easeInOutCubic(p));
      if (p < 1) frame = raf(tick);
    };

    frame = raf(tick);
    return () => caf(frame);
  }, [targetPct, moveMs]);

  useEffect(() => {
    displayedPctRef.current = animatedPct;
  }, [animatedPct]);

  useEffect(() => {
    const prevPct = displayedPctRef.current;
    if (prevPct === targetPct) return;
    deltaSeqRef.current += 1;
    setDelta({ from: prevPct, to: targetPct, seq: deltaSeqRef.current });
    const timer = setTimeout(() => setDelta(null), deltaMs);
    return () => clearTimeout(timer);
  }, [targetPct, deltaMs]);

  return { animatedPct, delta };
}

export function useAnimatedNumber(targetValue, opts = {}) {
  const { moveMs = DEFAULT_MOVE_MS } = opts;
  const [animatedValue, setAnimatedValue] = useState(targetValue);
  const previousTargetRef = useRef(targetValue);

  useEffect(() => {
    const from = previousTargetRef.current;
    const to = targetValue;
    previousTargetRef.current = to;
    if (from === to) return;

    let frame = 0;
    const start = now();

    const tick = (timeNow) => {
      const p = Math.min(1, (timeNow - start) / moveMs);
      setAnimatedValue(from + (to - from) * easeInOutCubic(p));
      if (p < 1) frame = raf(tick);
    };

    frame = raf(tick);
    return () => caf(frame);
  }, [targetValue, moveMs]);

  return animatedValue;
}

export function useAnimatedDeltaNumber(targetValue, opts = {}) {
  const { moveMs = DEFAULT_MOVE_MS, deltaMs = DEFAULT_DELTA_MS } = opts;
  const animatedValue = useAnimatedNumber(targetValue, { moveMs });
  const displayedValueRef = useRef(animatedValue);
  const [delta, setDelta] = useState(null);
  const deltaSeqRef = useRef(0);

  useEffect(() => {
    displayedValueRef.current = animatedValue;
  }, [animatedValue]);

  useEffect(() => {
    const prev = displayedValueRef.current;
    if (prev === targetValue) return;
    deltaSeqRef.current += 1;
    setDelta({ from: prev, to: targetValue, seq: deltaSeqRef.current });
    const timer = setTimeout(() => setDelta(null), deltaMs);
    return () => clearTimeout(timer);
  }, [targetValue, deltaMs]);

  return { animatedValue, delta };
}

export function getDeltaOverlaySx(delta, keyframeName) {
  const from = Math.min(delta.from, delta.to);
  const width = Math.max(MIN_DELTA_WIDTH_PCT, Math.abs(delta.to - delta.from));
  return {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${from}%`,
    width: `${width}%`,
    background: `
      linear-gradient(
        to right,
        ${WHITE_34},
        ${WHITE_18}
      ),
      repeating-linear-gradient(
        -45deg,
        ${WHITE_30} 0px,
        ${WHITE_30} 4px,
        transparent 4px,
        transparent 8px
      )
    `,
    borderLeft: `1px solid ${WHITE_82}`,
    borderRight: `1px solid ${BLACK_35}`,
    boxShadow: `inset 0 0 0 1px ${WHITE_25}`,
    opacity: 1,
    animation: `${keyframeName} ${DEFAULT_DELTA_MS}ms linear forwards`,
    pointerEvents: "none",
    [`@keyframes ${keyframeName}`]: {
      "0%": { opacity: 0.95 },
      "45%": { opacity: 0.95 },
      "100%": { opacity: 0 },
    },
  };
}

export function getPipFlashSx({
  changed,
  keyframeName,
  durationMs = 180,
  fromOpacity = 0.9,
  stripe = PIP_STRIPE_24,
  easing = "cubic-bezier(0.16, 1, 0.3, 1)",
}) {
  if (!changed) return {};
  return {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: stripe,
      animation: `${keyframeName} ${durationMs}ms ${easing} forwards`,
      pointerEvents: "none",
    },
    [`@keyframes ${keyframeName}`]: {
      from: { opacity: fromOpacity },
      to: { opacity: 0 },
    },
  };
}

export const PIP_STRIPES = {
  subtle: PIP_STRIPE_24,
  strong: PIP_STRIPE_28,
};

