import { Hono } from "hono";
import { Bindings } from "../../types/hono.types";
import { VapiPayload, VapiWebhookEnum, AssistantRequestPayload } from "../../types/vapi.types";
import { toolCallsHandler } from "../webhook/toolCalls";
import { assistantRequestHandler } from "../webhook/assistantRequest";

const basicHandler = new Hono<{ Bindings: Bindings }>();

basicHandler.post("/", async (c) => {
  try {
    const reqBody: any = await c.req.json();
    console.log("Received request body:", JSON.stringify(reqBody, null, 2));
    
    const payload: VapiPayload = reqBody.message || reqBody;
    
    switch (payload.type) {
      case VapiWebhookEnum.ASSISTANT_REQUEST:
        console.log("Processing assistant request");
        try {
          const result = await assistantRequestHandler(payload as AssistantRequestPayload, c.env);
          console.log("Assistant request result:", JSON.stringify(result, null, 2));
          return c.json(result, 201);
        } catch (error) {
          console.error("Error handling assistant request:", error);
          return c.json({ error: "Error processing assistant request" }, 500);
        }
      
      case VapiWebhookEnum.TOOL_CALLS:
        console.log("Processing tool calls");
        try {
          const result = await toolCallsHandler(payload as any, c.env);
          console.log("Tool calls result:", JSON.stringify(result, null, 2));
          return c.json(result, 201);
        } catch (error) {
          console.error("Error handling tool calls:", error);
          return c.json({ error: "Error executing function" }, 500);
        }
      
      default:
        console.log("Unsupported payload type:", payload.type);
        return c.json({ error: "Unsupported payload type" }, 400);
    }
  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { basicHandler };
