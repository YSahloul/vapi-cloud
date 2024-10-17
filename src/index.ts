import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { openAIHandler } from "./api/custom/openai";
import { functionCallRoute } from "./api/functions";
import { webhookRoute } from "./api/webhook";
import { Bindings } from "./types/hono.types";

const app = new Hono<{ Bindings: Bindings}>();

app.use("*", prettyJSON());
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.route("/api/webhook", webhookRoute);
app.route("/api/functions", functionCallRoute);
app.route("/api/custom/openai", openAIHandler);
console.log("OpenAI route registered");

export default app;
