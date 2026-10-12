import { NextRequest } from "next/server";
import { LessonRequestSchema } from "@/lib/schemas";
import { generateJson, sanitizeDiagram, type AIProvider } from "@/lib/ai";
import { lessonPrompt } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/rate-limit";
import { AppError, Errors } from "@/lib/errors";
import { z } from "zod";

export const maxDuration = 30;

// Lesson shape returned by the model (without topicId — we set it server-side)
const LessonResponseSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  diagram: z.string(),
  diagramCaption: z.string(),
  lab: z.object({
    goal: z.string(),
    steps: z.array(z.string()).min(4).max(7),
    code: z.string(),
    language: z.string(),
    expectedOutput: z.string(),
  }),
  quiz: z.array(
    z.object({
      q: z.string(),
      options: z.array(z.string()).length(4),
      answer: z.number().int().min(0).max(3),
      why: z.string(),
    })
  ).length(5),
});

export async function POST(request: NextRequest) {
  try {
    checkRateLimit(request);

    const body = await request.json().catch(() => null);
    if (!body) throw Errors.badInput("Request body is missing or not valid JSON.");

    const parsed = LessonRequestSchema.safeParse(body);
    if (!parsed.success) throw Errors.badInput();

    const { profile, topic } = parsed.data;

    // Optional client-provided API keys or provider preference
    const geminiApiKey = request.headers.get("x-gemini-api-key") ?? undefined;
    const groqApiKey = request.headers.get("x-groq-api-key") ?? undefined;
    const preferredProvider =
      (request.headers.get("x-ai-provider") as AIProvider | null) ?? undefined;

    const prompt = lessonPrompt(profile, topic);
    const lesson = await generateJson(prompt, LessonResponseSchema, {
      geminiApiKey,
      groqApiKey,
      preferredProvider,
    });

    // Sanitize diagram server-side
    const sanitizedDiagram = sanitizeDiagram(lesson.diagram);

    return Response.json({
      ...lesson,
      topicId: topic.id,
      diagram: sanitizedDiagram,
    });
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    console.error("[api/lesson]", err instanceof Error ? err.message : "Unknown error");
    return Errors.server().toResponse();
  }
}
