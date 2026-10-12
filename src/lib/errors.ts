export type ErrorCode = "BAD_INPUT" | "RATE_LIMITED" | "MODEL_FAILED" | "SERVER";

interface AppErrorOptions {
  code: ErrorCode;
  status: number;
  message: string;
  retryAfterSeconds?: number;
}

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  retryAfterSeconds?: number;

  constructor({ code, status, message, retryAfterSeconds }: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  toResponse() {
    const body: Record<string, unknown> = {
      error: { code: this.code, message: this.message },
    };
    if (this.retryAfterSeconds !== undefined) {
      body.error = { ...(body.error as object), retryAfterSeconds: this.retryAfterSeconds };
    }
    return Response.json(body, { status: this.status });
  }
}

export const Errors = {
  badInput(detail?: string): AppError {
    return new AppError({
      code: "BAD_INPUT",
      status: 400,
      message: detail ?? "Check the goal field. It needs 2 to 60 characters.",
    });
  },

  rateLimited(retryAfterSeconds: number): AppError {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return new AppError({
      code: "RATE_LIMITED",
      status: 429,
      message: `You have made many requests in a short time. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      retryAfterSeconds,
    });
  },

  modelFailed(): AppError {
    return new AppError({
      code: "MODEL_FAILED",
      status: 502,
      message: "The lesson could not be written this time. Try again.",
    });
  },

  server(detail?: string): AppError {
    return new AppError({
      code: "SERVER",
      status: 500,
      message: detail ?? "Something went wrong on our side. Try again in a minute.",
    });
  },
};
