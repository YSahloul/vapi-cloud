import {
  AssistantRequestPayload,
  ServerMessageResponseAssistantRequest,
  CreateAssistantDTO,
  Model,
  Voice,
  Transcriber,
  FirstMessageMode,
  FunctionTool
} from "../../types/vapi.types";
import { Bindings } from "../../types/hono.types";
import { getSystemPrompt } from '../../assistants/systemPrompt';

export const assistantRequestHandler = async (
  payload: AssistantRequestPayload,
  bindings: Bindings
): Promise<ServerMessageResponseAssistantRequest> => {
  try {
    const baseUrl = bindings.CF_PAGES_URL || bindings.CF_WORKER_DOMAIN || bindings.BASE_URL || 'http://localhost:8787';
    const customLLMUrl = `${baseUrl}/api/custom/openai`;

    const assistant: CreateAssistantDTO = {
      name: "Mariana",
      model: {
        provider: "custom-llm",
        url: customLLMUrl,
        model: "gpt-4o-mini",
        temperature: 0.5,
        maxTokens: 150,
        metadataSendMode: "off",
        messages: [
          {
            role: "system",
            content: await getSystemPrompt(bindings)
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'createOrder',
              description: 'Create a new order with specified items',
              parameters: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        catalogObjectId: { type: 'string' },
                        quantity: { type: 'string' }
                      },
                      required: ['catalogObjectId', 'quantity']
                    }
                  }
                },
                required: ['items']
              }
            }
          } as FunctionTool
        ]
      } as Model,
      voice: {
        provider: "11labs",
        model: "eleven_multilingual_v2",
        voiceId: "OYTbf65OHHFELVut7v2H",
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.5,
        useSpeakerBoost: true,
        optimizeStreamingLatency: 2
      } as Voice,
      messagePlan: {
        idleTimeoutSeconds: 5,
        idleMessageMaxSpokenCount: 2
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2-phonecall",
        language: "en-US",
        endpointing: 300,
        keywords: [
          "TicTaco:1",
          "Fajita:1",
          "Nachos:1",
          "Jalapeno:1",
          "Pizzadilla:1",
          "Barbacoa:1",
          "AlPastor:1",
          "Birria:1",
          "Asada:1",
          "Campechano:1",
          "Quesabirria:1",
          "Flautas:1",
          "Suadero:1",
          "Chorizo:1",
          "Carnitas:1",
          "Horchata:1",
          "Jamaica:2",
          "Tamarind:2"
        ]
      } as Transcriber,
      firstMessageMode: "assistant-speaks-first" as FirstMessageMode,
      backgroundSound: "off",
      startSpeakingPlan: {
        waitSeconds: 0.4
      },
      maxDurationSeconds: 300,
      backchannelingEnabled: false,
      silenceTimeoutSeconds: 26,
      backgroundDenoisingEnabled: true,
      firstMessage: "Tic Taco. This is Mariana. Can I take your order?"
    };

    // Only log the tools configuration
    console.log('Assistant tools:', JSON.stringify(assistant.model.tools, null, 2));
    
    return { assistant };
  } catch (error) {
    console.error('Error in assistantRequestHandler:', error);
    return { 
      error: `Failed to create assistant: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
