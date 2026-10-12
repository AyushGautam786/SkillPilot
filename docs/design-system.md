# SkillPilot Design System

SkillPilot is designed around a single core metaphor: **a learning route, not a course catalog**. The primary visual anchor is the **Route Line**—a vertical progression trail with waypoints indicating past, present, and future topics. The interface is engineered to feel like an intentional study tool for engineering students: calm, typography-first, free of generic AI tropes or gratuitous decoration.

---

## 1. Design Tokens

All tokens are defined in `src/app/globals.css` under `:root` and mirrored to Tailwind CSS. Components never use arbitrary hex colors or arbitrary pixel values.

### 1.1 Color Palette

| Token | Value | Semantic Role |
|---|---|---|
| `--paper` | `#F2F4F7` | Neutral cool-grey canvas background (never cream or dark) |
| `--surface` | `#FFFFFF` | Cards, input fields, slide-over sheets, panels |
| `--sunken` | `#E7EBF1` | Code blocks, skeleton base, interactive hover state |
| `--line` | `#CBD3DF` | Subtle structural borders, dividers, upcoming dashed route line |
| `--ink` | `#14284B` | Primary text, titles, solid completed route line |
| `--ink-soft` | `#4A5B78` | Secondary labels, captions, metadata, breadcrumbs |
| `--cobalt` | `#2748C9` | Primary interactive elements, links, completed waypoints, focus ring |
| `--cobalt-press` | `#1E3AA3` | Hover and active state for primary actions |
| `--cobalt-wash` | `#E3E9FB` | Selected quiz row background, diagram node fill |
| `--marigold` | `#F2A900` | Current active waypoint and streak flame icon (always fill, never text) |
| `--teal` | `#18795F` | Correct quiz options, success toast notification |
| `--brick` | `#B4382E` | Incorrect quiz feedback, error toasts, destructive confirmation |

### 1.2 Typography

Typography is powered by `next/font/google` with `display: swap`:
- **UI & Headings:** `Schibsted Grotesk` (clean, geometric, humanist sans-serif)
- **Lesson Body & Prose:** `Source Serif 4` (editorial serif optimized for extended technical reading)
- **Code:** System monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`)

| Token | Font Family | Size / Line Height | Weight | Application |
|---|---|---|---|---|
| `--text-display` | Schibsted Grotesk | 40px / 44px | 700 | Primary page titles, onboarding statement |
| `--text-title` | Schibsted Grotesk | 28px / 34px | 600 | Lesson heading, major section title |
| `--text-heading` | Schibsted Grotesk | 20px / 28px | 600 | Panel headings, week milestones |
| `--text-ui` | Schibsted Grotesk | 15px / 22px | 500 | Buttons, tabs, inputs, navigation |
| `--text-small` | Schibsted Grotesk | 13px / 18px | 400 | Helper copy, captions, microcopy |
| `--text-prose` | Source Serif 4 | 18px / 30px | 400 | Lesson reading prose, quiz explanations |
| `--text-code` | System Monospace | 14px / 22px | 400 | Code blocks, CLI commands |

### 1.3 Spacing (4px Modular Scale)

| Token | Size | Purpose |
|---|---|---|
| `--space-1` | 4px | Micro gaps, icon offsets |
| `--space-2` | 8px | Tight component padding, tag gaps |
| `--space-3` | 12px | Input inner padding, small component margins |
| `--space-4` | 16px | Standard button padding, stack gaps |
| `--space-6` | 24px | Card padding, section gaps |
| `--space-8` | 32px | Major component separation |
| `--space-12` | 48px | Page section vertical spacing |
| `--space-16` | 64px | Page margins and onboarding gutters |

### 1.4 Radii & Elevation

- `--radius-field`: `3px` (subtle, crisp rounding on inputs, buttons, and segmented items)
- `--radius-panel`: `10px` (gentle rounding on major content panels and cards)
- `--radius-pill`: `999px` (status badges, pill segments)
- **Elevation:** Flat border-driven aesthetic (`border: 1px solid var(--line)`). No soft fuzzy drop shadows or blurry glow effects.

### 1.5 Motion & Transitions

- `--duration-fast`: `120ms` (hover states, segmented switch)
- `--duration-base`: `200ms` (toasts, accordions)
- `--ease-out`: `cubic-bezier(0.2, 0, 0, 1)`
- **Route Line Draw:** Single 1200ms top-to-bottom stroke animation on initial route creation.
- **Accessibility:** Motion is completely disabled or reduced when `prefers-reduced-motion: reduce` is detected.

---

## 2. Component Primitives

1. **Button (`src/components/ui/Button.tsx`):**
   - Variants: `primary` (solid cobalt), `secondary` (outlined line), `quiet` (subtle borderless).
   - Supports `loading` spinner state and `asChild` composition for Next.js `Link`.
2. **SegmentedControl (`src/components/ui/SegmentedControl.tsx`):**
   - Accessible keyboard-driven radio group with roving tabindex and Arrow key navigation.
3. **TextField (`src/components/ui/TextField.tsx`):**
   - High-contrast input with integrated floating/fixed label, helper text, and clear error states.
4. **Toast (`src/components/ui/Toast.tsx`):**
   - Non-blocking notification banner fixed at screen bottom with auto-dismissal and manual close.
5. **Skeleton (`src/components/ui/Skeleton.tsx`):**
   - Pulse placeholder matching the geometric layout of upcoming components to prevent layout shifts.

---

## 3. Deliberately Avoided Anti-Patterns

Per Section 3.2 of the specification:
- No dark-mode neon gradients, glowing orbs, or glassmorphic backdrops.
- No emojis anywhere in the user interface.
- No filler marketing hype copy ("Unlock your superpower", "Supercharge your brain").
- No track-padded uppercase eyebrow labels (`ALL CAPS EYEBROWS`).
- No generic AI sparkle icons or magic wands.
- No arrow decorators on standard links or buttons.
