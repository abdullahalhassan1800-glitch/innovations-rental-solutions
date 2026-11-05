import { NextResponse } from "next/server";
import { z } from "zod";
import { getAssistantResponse } from "@/lib/ai/assistant";
import { assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const chatSchema = z.object({
  message: z.string().trim().min(1, "Type a message to continue").max(600),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(10)
    .optional(),
  contextProjectIds: z.array(z.string().max(60)).max(5).optional(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const limit = rateLimit(`ai:${ip}`, 25, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "The assistant is receiving a lot of requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const input = chatSchema.parse(await request.json());
    const response = await getAssistantResponse(input);

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return fromError(error);
  }
}
