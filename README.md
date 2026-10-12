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
| `GEMINI_API_KEY` | Optional* | Your Google Gemini API key ([Google AI Studio](https://aistudio.google.com/)). Primary default engine. |
| `GEMINI_MODEL` | No | Target Gemini model name (defaults to `gemini-3.5-flash-lite`). |
| `GROQ_API_KEY` | Optional* | Your Groq Cloud API key ([console.groq.com](https://console.groq.com/keys)). Free 14,400 req/day fallback. |
| `GROQ_MODEL` | No | Target Groq model name (defaults to `llama-3.3-70b-versatile`). |
| `PRIMARY_AI_PROVIDER` | No | Default provider (`gemini` or `groq`, defaults to `gemini`). |

*\*At least one API key (`GEMINI_API_KEY` or `GROQ_API_KEY`) is required. When both are provided, SkillPilot automatically falls back to Groq if Gemini hits rate limits or quota exhaustion.*

---

## Deploying to Render

SkillPilot includes native configuration for zero-friction deployment to [Render](https://render.com).

### Method 1: 1-Click Blueprint (Recommended)
1. Fork or push this repository to your GitHub account (`https://github.com/<your-username>/SkillPilot`).
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation bar and select **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect [`render.yaml`](./render.yaml).
5. When prompted, enter your `GEMINI_API_KEY`.
6. Click **Apply**. Render will install dependencies, build the Next.js bundle, and launch your web service.

### Method 2: Manual Web Service Setup
If you prefer configuring via the Render Dashboard directly:
1. In Render, click **New +** → **Web Service**.
2. Select your GitHub repository (`SkillPilot`).
3. Fill in the following settings:
   - **Name**: `skillpilot` (or any custom name)
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Region**: Closest to your users (e.g., Singapore or Frankfurt)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** → **Environment Variables** and add:
   - `NODE_VERSION`: `20.18.0`
   - `GEMINI_API_KEY`: `<your_gemini_api_key>`
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
5. Click **Create Web Service**.

> [!NOTE]
> On Render's Free tier, services spin down after 15 minutes of inactivity. When a new visitor accesses the URL, Render automatically wakes the instance within ~30–50 seconds. Route and lesson generation will run smoothly once active.

---

## Future Scope (Roadmap)

The following capabilities are deliberately planned for subsequent iterations beyond the v1 local-only foundation:
- **Multi-Channel Reminders:** Daily study reminders and streak alerts delivered via WhatsApp and Email.
- **Daily News-to-Lesson Agent:** Autonomous web agent that scans AI breakthroughs and generates timely topical micro-lessons.
- **User Accounts & Cloud Sync:** Multi-device synchronization with PostgreSQL/Supabase database backends.
- **Mentor Marketplace:** Direct peer reviews and 1-on-1 human mentorship sessions with industry AI practitioners.
- **Dark Mode:** High-contrast night theme respecting user operating system preferences.
