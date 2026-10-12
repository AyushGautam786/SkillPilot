# SkillPilot

**SkillPilot** is a personal AI learning companion that transforms ambitious career goals into structured, actionable study routes for college and engineering students. Given a learner's target role, experience level, and weekly study commitment, SkillPilot generates a week-by-week curriculum, delivers concise 15-minute conceptual lessons with system architecture diagrams, guides students through hands-on coding labs, and reinforces mastery with 5-question comprehension quizzes—tracking streaks, quiz scores, and overall progress entirely within the browser.

---

## UN Sustainable Development Goal Alignment (SDG 4: Quality Education)

SkillPilot is directly aligned with **UN SDG 4: Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all**. By democratizing personalized technical mentorship—traditionally accessible only through expensive bootcamps or private tutors—SkillPilot empowers learners from tier-2 and tier-3 colleges, vocational institutes, and self-taught backgrounds in India and beyond to acquire industry-grade AI engineering capabilities through free, open, and hands-on micro-learning.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript | React Server Components, Partial Prerendering, Turbopack |
| **Styling** | Tailwind CSS + Custom CSS Variables | Strict design tokens, zero arbitrary hex codes in components |
| **Typography** | `next/font/google` | **Schibsted Grotesk** (UI & Headings) and **Source Serif 4** (Lesson prose) |
| **AI / LLM** | Google Gemini 2.5 Flash via `@google/genai` | Called strictly server-side, validated with Zod |
| **State Management**| Zustand + `persist` middleware | Local-first persistence in browser `localStorage` |
| **Diagrams** | Mermaid.js | Dynamic client-side rendering with SVG fallbacks |
| **Data Visualizations**| Hand-crafted inline SVG | Zero external heavy charting libraries |
| **Testing** | Vitest | Pure function unit testing for streaks and dates |

---

## Getting Started

### Prerequisites

- Node.js 18.18+ or Node.js 20+
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone or open the repository:
   ```bash
   cd skillpilot
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Run test suite:
   ```bash
   npm test
   ```

6. Run lint check:
   ```bash
   npm run lint
   ```

7. Build for production:
   ```bash
   npm run build
   ```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (Server) | Your Google Gemini API key. Never exposed to client bundles. |
| `GEMINI_MODEL` | No | Target model name (defaults to `gemini-2.5-flash`). |

---

## Live Deployment

- **Deployment Platform:** Vercel
- **Live URL:** `https://skillpilot.vercel.app` *(or your imported Vercel project deployment URL)*

---

## Future Scope (Roadmap)

The following capabilities are deliberately planned for subsequent iterations beyond the v1 local-only foundation:
- **Multi-Channel Reminders:** Daily study reminders and streak alerts delivered via WhatsApp and Email.
- **Daily News-to-Lesson Agent:** Autonomous web agent that scans AI breakthroughs and generates timely topical micro-lessons.
- **User Accounts & Cloud Sync:** Multi-device synchronization with PostgreSQL/Supabase database backends.
- **Mentor Marketplace:** Direct peer reviews and 1-on-1 human mentorship sessions with industry AI practitioners.
- **Dark Mode:** High-contrast night theme respecting user operating system preferences.
