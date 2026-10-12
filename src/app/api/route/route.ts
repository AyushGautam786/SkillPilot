import { NextRequest } from "next/server";
import { ProfileSchema, RouteSchema } from "@/lib/schemas";
import { generateJson } from "@/lib/gemini";
import { routePrompt } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/rate-limit";
import { AppError, Errors } from "@/lib/errors";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    checkRateLimit(request);

    const body = await request.json().catch(() => null);
    if (!body) throw Errors.badInput("Request body is missing or not valid JSON.");

    const profileResult = ProfileSchema.safeParse(body);
    if (!profileResult.success) {
      throw Errors.badInput();
    }
    const profile = profileResult.data;

    const prompt = routePrompt(profile);
    const route = await generateJson(prompt, RouteSchema);

    // Post-check: ensure topic ids are unique and well-formed
    const seen = new Set<string>();
    for (const week of route.weeks) {
      for (let ti = 0; ti < week.topics.length; ti++) {
        const topic = week.topics[ti];
        const expectedId = `w${week.week}-t${ti + 1}`;
        if (seen.has(topic.id) || !/^w\d+-t\d+$/.test(topic.id)) {
          topic.id = expectedId;
        }
        seen.add(topic.id);
      }
    }

    return Response.json(route);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    console.error("[api/route]", err instanceof Error ? err.message : "Unknown error");
    return Errors.server().toResponse();
  }
}
