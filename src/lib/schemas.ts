import { z } from "zod";

// Profile — entered at onboarding
export const ProfileSchema = z.object({
  goal: z.string().min(2).max(60),
  level: z.enum(["starting", "basics", "building"]),
  hoursPerWeek: z.union([
    z.literal(3),
    z.literal(5),
    z.literal(8),
    z.literal(12),
  ]),
});
export type Profile = z.infer<typeof ProfileSchema>;

// Topic
export const TopicSchema = z.object({
  id: z.string().regex(/^w\d+-t\d+$/),
  title: z.string().max(60),
  why: z.string().max(110),
});
export type Topic = z.infer<typeof TopicSchema>;

// Week
export const WeekSchema = z.object({
  week: z.number().int().positive(),
  theme: z.string().max(50),
  topics: z.array(TopicSchema).min(2).max(4),
});
export type Week = z.infer<typeof WeekSchema>;

// Route — returned by /api/route
export const RouteSchema = z.object({
  goal: z.string(),
  weeks: z.array(WeekSchema).min(4).max(6),
});
export type Route = z.infer<typeof RouteSchema>;

// Lab
export const LabSchema = z.object({
  goal: z.string(),
  steps: z.array(z.string().max(140)).min(4).max(7),
  code: z.string(),
  language: z.string(),
  expectedOutput: z.string(),
});
export type Lab = z.infer<typeof LabSchema>;

// Quiz question
export const QuizQuestionSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().int().min(0).max(3),
  why: z.string().max(200),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Lesson — returned by /api/lesson
export const LessonSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  explanation: z.string(),
  diagram: z.string(),
  diagramCaption: z.string().max(120),
  lab: LabSchema,
  quiz: z.array(QuizQuestionSchema).length(5),
});
export type Lesson = z.infer<typeof LessonSchema>;

// API request schemas
export const RouteRequestSchema = ProfileSchema;

export const LessonRequestSchema = z.object({
  profile: ProfileSchema,
  topic: z.object({
    id: z.string(),
    title: z.string(),
    why: z.string(),
  }),
});
export type LessonRequest = z.infer<typeof LessonRequestSchema>;

// Completion record
export const CompletionSchema = z.object({
  score: z.number().int().min(0).max(5),
  total: z.literal(5),
  finishedOn: z.string(),
});
export type Completion = z.infer<typeof CompletionSchema>;

// Usage record
export const UsageSchema = z.object({
  date: z.string(),
  lessonCalls: z.number().int().min(0),
});
export type Usage = z.infer<typeof UsageSchema>;
