# Local verification

## Automated checks
- Official scaffold initialization: typecheck/test/validate passed.
- Finished game: typecheck, Vitest suite, production build and all seven validators passed.
- Tests cover Perfect/Good boundaries, early/late/missed input, feedback input lock,
  ready input isolation, score, speed cap, persistence, corrupt storage, variable frame delta,
  pause/resume, menu directions and keyboard repeat via the real input adapter.
- Separate game/framework count commands were declined; no split test count is claimed.
- Production JS: 151.84 kB gzip; CSS 1.19 kB; HTML 1.48 kB.

## Active Browser
- 600×600 viewport, real arrow/Enter events and opt-in deterministic ?drive harness.
- Start → ready → play → early failure → Enter restart passed.
- Perfect score increment and Good score increment passed.
- Late selection and no-input failure passed. Late arrival does not immediately restart.
- 40 successes: duration reaches its 0.85 s cap; best 40 restored on reload.
- Held Enter repeat ignored.
- Simulated visibilitychange: radius unchanged after 30 simulated seconds;
  returns paused until explicit resume. Arrow Down/Up selects restart/resume.
- Actual browser backgrounding also displayed the pause screen during inspection.
- Start/play/Perfect/Good/result DOM contents within 24px safe area at 600×600.
- Pause layout at 390×600: no horizontal overflow, visible text >=16px.
- Rendered ready/play/result/pause screenshots inspected. No observed application errors.

## Open / NOT RUN
- Live FPS NOT RUN: Active Browser became hidden; zero frames during sampling is not a
  performance measurement. Render scheduling targets 30fps; real device FPS is unverified.
- Official simulator was not activated. Additive optics, bright-environment readability,
  EMG input latency, device memory, battery and thermal behaviour need later validation.
- Paper MCP was not called again. Paper blur/glow is approximated by bright procedural
  outlines; unfinished annotations are represented by the design specification instead.
- 200% text scaling is not verified. Narrow-screen layouts are an implementation assumption.
- No deployment, public URL or submission was performed.
