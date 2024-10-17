import { Hono } from "hono";
import { 
  StatusUpdatePayload, 
  ToolCallsPayload,
  VapiPayload, 
  VapiWebhookEnum, 
  AssistantRequestPayload, 
  EndOfCallReportPayload, 
  TranscriptPayload, 
  HangPayload, 
  SpeechUpdatePayload,
  ConversationUpdatePayload
} from "../../types/vapi.types";
import { Bindings } from "../../types/hono.types";
import { assistantRequestHandler } from "./assistantRequest";
import { endOfCallReportHandler } from "./endOfCallReport";
import { toolCallsHandler } from "./toolCalls";
import { HangEventHandler } from "./hang";
import { speechUpdateHandler } from "./speechUpdateHandler";
import { statusUpdateHandler } from "./statusUpdate";
import { transcriptHandler } from "./transcript";
import { conversationUpdateHandler } from "./conversationUpdate";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/", async (c) => {
  try {
    const reqBody: { message: VapiPayload } = await c.req.json();
    const payload = reqBody.message;
    
    if (!payload || typeof payload.type !== 'string') {
      throw new Error("Invalid payload structure");
    }

    switch (payload.type as VapiWebhookEnum) {
      case VapiWebhookEnum.TOOL_CALLS:
        console.log("Handling TOOL_CALLS");
        return c.json(await toolCallsHandler(payload as ToolCallsPayload, c.env), 201);
      case VapiWebhookEnum.ASSISTANT_REQUEST:
        console.log("Handling ASSISTANT_REQUEST");
        return c.json(await assistantRequestHandler(payload as AssistantRequestPayload, c.env), 201);
      case VapiWebhookEnum.CONVERSATION_UPDATE:
        console.log("Handling CONVERSATION_UPDATE");
        return c.json(await conversationUpdateHandler(payload as ConversationUpdatePayload), 201);
      case VapiWebhookEnum.STATUS_UPDATE:
        console.log("Handling STATUS_UPDATE");
        return c.json(await statusUpdateHandler(payload as StatusUpdatePayload), 201);
      case VapiWebhookEnum.END_OF_CALL_REPORT:
        if ('endedReason' in payload && 'transcript' in payload) {
          await endOfCallReportHandler(payload as EndOfCallReportPayload);
          return c.json({}, 201);
        }
        throw new Error("Invalid END_OF_CALL_REPORT payload");
      case VapiWebhookEnum.SPEECH_UPDATE:
        console.log("Handling SPEECH_UPDATE");
        return c.json(await speechUpdateHandler(payload as SpeechUpdatePayload), 201);
      case VapiWebhookEnum.TRANSCRIPT:
        console.log("Handling TRANSCRIPT");
        return c.json(await transcriptHandler(payload as TranscriptPayload), 201);
      case VapiWebhookEnum.HANG:
        console.log("Handling HANG");
        return c.json(await HangEventHandler(payload as HangPayload), 201);
      default:
        throw new Error(`Unhandled message type: ${payload.type}`);
    }
  } catch (error: any) {
    console.error("Error in webhook handler:", error);
    return c.json({ error: error.message || "Unknown error" }, 500);
  }
});

export { app as webhookRoute };
