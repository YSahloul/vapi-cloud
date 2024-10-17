import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import OpenAI from "openai";
import { Bindings } from "../../types/hono.types";

const openAIHandler = new Hono<{ Bindings: Bindings }>();

openAIHandler.post("/chat/completions", async (c) => {
  console.log("OpenAI handler /chat/completions endpoint hit");
  const openai = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });
  const { model, messages, max_tokens, temperature, stream, ...restParams } =
    await c.req.json();

  console.log("OpenAI handler called");
  try {
    if (stream) {
      const completionStream = await openai.chat.completions.create({
        model: model || "gpt-4o-mini",
        ...restParams,
        messages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

      return streamSSE(c, async (stream) => {
        for await (const data of completionStream) {
          await stream.writeSSE({
            data: JSON.stringify(data),
          });
        }
      });
    } else {
      const completion = await openai.chat.completions.create({
        model: model || "gpt-3.5-turbo",
        ...restParams,
        messages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      });
      return c.json(completion, 200);
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Add a catch-all route for debugging
openAIHandler.all("*", async (c) => {
  console.log(`Received request to OpenAI handler: ${c.req.method} ${c.req.url}`);
  return c.text("OpenAI handler catch-all route", 404);
});

export { openAIHandler };
