# DINO RUN — Page 2 implementation

The reference is the React/CSS and SVG export supplied directly in the conversation on
2026-10-12. `paper-design/` was absent; no PNG reference was available. No Paper MCP calls,
new packages, paid services, deployment or new project were used.

## Preservation and reference adaptation

The existing Still Point game, tests, models, styling and framework remain. The default
entry now boots RunnerGame; `?game=still-point` runs the original game. Both use the existing
GameLoop, InputManager, ThreeRenderer, localization, storage and build setup.

Visible Paper shapes are copied from the supplied SVG polygon coordinates. The world uses
parallel projection and a 0.5 scale in a 600×600 stage. Screen margins are 24px. Original
1440×900 layouts are reflowed, not uniformly scaled, to retain a 16px text floor. Outlined
menus, cyan actions, yellow scores and the brand are retained. Hidden legacy perspective
lanes, lives and panels are omitted. Body, HUD, menus and canvas are transparent; the browser
default dark surface is not an environment asset. No shadows, gradients, full-screen flashes.

No running/duck animation frames were provided. Running currently uses a two-position
vertical stride of the supplied silhouette; duck compresses it to a 42-unit collision height.
These functional poses need designer review; they are not exported Paper animation frames.
The start helper copy mentions score/best instead of lives because the specified rule is
one collision per run. The unsupported gaze-selection instruction is replaced by select.

## State and rules

Start → playing → paused → playing → over → playing. Idle states do not advance simulation.
Visibility loss pauses and detaches input; return requires explicit confirmation. Restart
clears elapsed time, distance, score, obstacles, pose, spawn clock and physics accumulator.
Best is separate from Still Point, under `dino-run:best`, with existing storage fallback.

Physics uses 1/120-second substeps, real delta time, and a 250ms catch-up cap. Score is 10
per second, distance is accumulated travel /25. Speed rises from 230 to 390 units/sec.
Spawn intervals decrease from 2.1 to 1.65 seconds; ground/ground/air repeats predictably.
Jump gravity 1450, launch velocity 650; duck lasts 0.9 seconds without repeat extension.
Collision uses inset player AABB against obstacle AABB; one collision ends and freezes the run.
Rendering targets 30fps, independent of physics.

## Input and verification limits

Installed official plugin docs `core-contract.md` and `game-architecture.md` specify index
pinch → Enter → pinchTap; directional side-swipe → arrows → dpadSwipe. This is the supported
tap-only route, no extra SDK and no drag opt-in. No gaze-coordinate API is assumed.

- Enter / index pinch: start, jump while playing, resume, retry.
- ArrowDown / D-pad down: timed duck.
- ArrowRight/Left/Up: toggle focus on the existing Pause action; Enter then pauses.
- Space: desktop jump. P/Escape: desktop pause. Repeat key events are ignored.

RunnerInput translates events and subclasses the existing input implementation; no HUD input
listeners are introduced. HMR teardown removes listeners, observer, scene objects and loop.

First typecheck passed. First unit run: 365 passed, one failed (of 366), because the spacing
test checked before the second spawn. Its duration was corrected to 3.2 seconds. The requested
repeat test/build/validate command was rejected by the user; final checks remain unrun.
There are 15 new runner tests in addition to the preserved suite.

Browser deterministic checks passed using dispatched KeyboardEvents and the drive harness:
start, score, jump, duck expiration, pause/resume with unchanged simulation, collision once,
restart clearing state, pause focus selection, simulated visibility loss and explicit resume.
The integrated browser reported hidden even after bringToFront; visibility was overridden
for these deterministic checks. Native Playwright keyboard presses did not reach the game in
that environment. They are not claimed as physical keyboard or device gesture verification.
No captured runtime errors during the check. Live frame rate, official simulator, actual
Glass gesture delivery/latency, optical readability and hardware performance are unverified.
