import type { Profile, Topic } from "./schemas";

export function routePrompt(profile: Profile): string {
  const levelLabel: Record<string, string> = {
    starting: "just starting",
    basics: "know the basics",
    building: "can build things",
  };

  return `Learner goal: <goal>${profile.goal}</goal>
Level: ${levelLabel[profile.level]}. Study time: ${profile.hoursPerWeek} hours per week.

Build a learning route.
- Number of weeks: 4 if hours are 12, 5 if hours are 8, 6 if hours are 5 or 3. Use 4 when level is "building".
- Each week has a theme (max 50 chars) and 2 to 4 topics. One topic should take about 15 minutes of reading and a hands-on lab.
- Order topics so each builds on the last. Start from the learner's level, not from zero if they are past it.
- Every topic has: id in the form "w{week}-t{n}", a title (max 60 chars), and a "why" sentence (max 110 chars) saying what the learner can do after it.
- The last week ends with a small project the learner can show on GitHub.

JSON shape:
{ "goal": string, "weeks": [ { "week": number, "theme": string, "topics": [ { "id": string, "title": string, "why": string } ] } ] }`;
}

export function lessonPrompt(profile: Profile, topic: Topic): string {
  const levelLabel: Record<string, string> = {
    starting: "just starting",
    basics: "know the basics",
    building: "can build things",
  };

  return `Learner goal: <goal>${profile.goal}</goal>. Level: ${levelLabel[profile.level]}.
Topic: "${topic.title}". Reason it matters: "${topic.why}".

Write one lesson.
- explanation: max 170 words, plain language, one idea at a time, no markdown, no bullet points.
- diagram: Mermaid code, "flowchart TD" only. Max 8 nodes. Use short node ids (A, B, C). Write labels as plain words in square brackets, for example A[User question] --> B[Embed the question]. Do not put parentheses, quotes, colons, semicolons, or the characters < > { } | inside labels. Do not use subgraphs, styles, or click events.
- diagramCaption: one sentence saying what the diagram shows.
- lab: a hands-on exercise doable on a laptop with free tools in 15 minutes. goal (one sentence), steps (4 to 7, each an action the learner performs), code (a complete runnable snippet, max 30 lines, with the language named), expectedOutput (what they should see). Do not require paid accounts. Do not invent library functions; use well-known libraries only.
- quiz: exactly 5 multiple-choice questions with 4 options each, "answer" as the index 0 to 3, and a "why" of max 200 chars. Test understanding, not wording from the explanation. Spread correct answers across positions.

JSON shape:
{ "title": string, "explanation": string, "diagram": string, "diagramCaption": string,
  "lab": { "goal": string, "steps": string[], "code": string, "language": string, "expectedOutput": string },
  "quiz": [ { "q": string, "options": string[], "answer": number, "why": string } ] }`;
}
