export const DISPLAY = { width: 600, height: 600 } as const;
export const LOOP = { maxFrameMs: 250, stepSeconds: 1 / 30, fps: 30 };
export const RULES = { startRadius: 160, targetRadius: 96, endRadius: 64,
  initialSeconds: 2.2, minSeconds: 0.85, speedMultiplier: 1.04,
  perfectPx: 5, goodPx: 12, readySeconds: 0.8, feedbackSeconds: 0.45,
  boundaryEpsilon: 1e-7 };
export const COLORS = { target: 0xB7A4FF, moving: 0x8EF7F0, miss: 0xFF9AA8 };
