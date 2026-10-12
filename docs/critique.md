# SkillPilot: Design Critique & Review Pass

---

## 1. Overall Impression
SkillPilot delivers a remarkably calm, purposeful learning environment tailored specifically to technical learners. The Route Line serves as an intuitive visual compass that immediately clarifies progress without overwhelming the reader with gamified noise.

---

## 2. Usability Review

| Screen | Finding | Severity | Resolution / Fix |
|---|---|---|---|
| **Onboarding** | Form input could accept overly verbose or malformed goal inputs beyond character bounds | Moderate | Added input limit check (max 60 chars), clear error validation, and character guidance |
| **Route** | Transition from empty route to rendered route caused layout flash | Moderate | Implemented SSR-safe hydration guard with matching skeleton structure |
| **Lesson** | Reading prose previously competed with dense technical lab steps on mobile devices | Moderate | Collapsed lab steps below lesson explanation on smaller screens; maintained desktop sticky sidebar |
| **Quiz** | Retake flow lacked explicit clarity between previous attempts and new answer selections | Minor | Added distinct score recap badge and unambiguous "Retake quiz" action |
| **Progress** | Reset data action was potentially too easy to trigger accidentally | Critical | Added explicit confirmation dialog with warning that local progress will be erased |

---

## 3. Visual Hierarchy

- **Onboarding Screen:**
  - *Primary Eye-Draw:* The bold display prompt statement ("I want to become a...") immediately focuses user attention on formulating their career goal.
  - *Evaluation:* Correct. Everything else (level selection, hours slider) is structured sequentially underneath.
- **Route Screen:**
  - *Primary Eye-Draw:* The "Today" callout panel and the vertical Route Line.
  - *Evaluation:* Excellent balance. The user first grasps what to do *today*, then glances right/down to understand where that fits into the broader 4-6 week journey.
- **Lesson Screen:**
  - *Primary Eye-Draw:* Clean, high-legibility lesson title and Source Serif prose, followed by the system architecture diagram.
  - *Evaluation:* Ideal editorial layout. The hands-on lab is positioned as a complementary workspace rather than a distraction.
- **Progress Screen:**
  - *Primary Eye-Draw:* The headline metrics (Current Streak flame counter and Topics Completed ratio) followed by the hand-written SVG score bar chart.
  - *Evaluation:* Rewarding and clear. Reinforces accomplishment without clutter.

---

## 4. Design Token & System Consistency

- **Color Tokens:** Every screen adheres strictly to `--paper` (canvas), `--surface` (containers), `--ink` (text), and `--cobalt` (actions). Marigold (`#F2A900`) is exclusively reserved for the current active waypoint and streak flame icon.
- **Radii:** Inputs and buttons consistently employ `--radius-field` (3px), while content sheets and panels use `--radius-panel` (10px).
- **Typography:** Clear separation between `Schibsted Grotesk` for UI elements/headings and `Source Serif 4` for lesson explanation paragraphs. No random font sizes or browser default serif/sans fallbacks.

---

## 5. Accessibility & Responsive Verification

- **Color Contrast:** Deep navy `--ink` (`#14284B`) on cool-grey `--paper` (`#F2F4F7`) and white `--surface` (`#FFFFFF`) exceeds WCAG AAA requirements (> 11:1 contrast ratio). Secondary `--ink-soft` (`#4A5B78`) provides comfortable 5.8:1 contrast for supporting text.
- **Touch Targets:** All interactive buttons, radio options, and quiz selection rows maintain a minimum height of 44px with generous hitboxes.
- **Keyboard & Screen Reader Support:**
  - All interactive elements are focusable with visible high-contrast focus rings (`outline: 2px solid var(--cobalt)`).
  - Proper ARIA landmarks (`role="banner"`, `role="radiogroup"`, `role="img"` on diagrams with descriptive captions).
  - Screen reader announcements for loading states (`aria-live="polite"`).
  - ScoreBars includes an accessible visually hidden `<table>` alternative for screen readers.
- **Responsive Viewports:** Tested and confirmed at 360px (mobile), 768px (tablet), and 1280px (desktop) without any horizontal layout blowout.

---

## 6. What Works Well

1. **The Route Line:** Clean, custom SVG waypoint renderer that accurately visualizes finished, active, and upcoming milestones.
2. **Deterministic Layouts:** Pure CSS token system prevents UI drift and keeps the page feeling fast and lightweight.
3. **No Fluff:** Immediate transition from conceptual explanation to hands-on command-line exercise and comprehension check.

---

## 7. Top Three Changes Applied

1. **Prerender & Hydration Protection:** Re-architected client components (`LessonPage`, `ProgressPage`, `TopBar`) to eliminate SSR date hydration discrepancies and enforce smooth Suspense streaming.
2. **Resilient Diagram Fallback:** Added graceful inline code block fallbacks when Mermaid diagrams contain edge-case syntax, ensuring lessons never crash.
3. **Strict Token Enforcement:** Replaced all ad-hoc RGBA background styles in quiz cards and route lines with pure semantic CSS variable tokens.

---

## 8. Self-Check Against Spec Section 3.2

- [x] **No cream backgrounds or neon gradients:** Canvas uses cool grey `#F2F4F7`.
- [x] **No multiple competing "hero" elements:** The Route Line is the single memorable centerpiece.
- [x] **No identical cards:** Lesson sheet, lab panel, and quiz cards vary distinctly in structure and density.
- [x] **No emojis in the UI:** Fire streak uses an inline SVG flame glyph; no Unicode emojis.
- [x] **No ALL-CAPS eyebrow labels:** Standard sentence-case headings and clean hierarchy.
- [x] **No arrow decorators on buttons:** Actions are labeled with precise verbs ("Start topic", "Check answer", "See progress").
- [x] **No generic marketing hype copy:** Direct, concise instructions tailored to engineering learners.
