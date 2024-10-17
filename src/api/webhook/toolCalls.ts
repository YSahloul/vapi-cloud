import { ToolCallsPayload, ToolCallsMessageResponse, ToolCallResult, ToolCall } from "../../types/vapi.types";
import { createOrder } from "../../functions/createOrder";
import { retrieveOrder } from "../../functions/retrieveOrder";
import { Bindings } from "../../types/hono.types";

// Custom JSON serializer to handle BigInt
const jsonSerializer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export const toolCallsHandler = async (
  payload: any,
  bindings: Bindings
): Promise<ToolCallsMessageResponse> => {
  console.log("Handling tool calls:", JSON.stringify(payload, jsonSerializer, 2));

  let toolCall: ToolCall | undefined;

  if (payload.message && payload.message.type === "tool-calls" && payload.message.functionCall) {
    // Handle the structure from the curl command
    toolCall = {
      id: "generated-id", // You might want to generate a unique ID here
      ...payload.message.functionCall
    };
  } else if (Array.isArray(payload.toolCallList) && payload.toolCallList.length > 0) {
    // Handle the structure from ToolCallsPayload
    toolCall = payload.toolCallList[0];
  }

  if (!toolCall) {
    throw new Error('Invalid payload structure: no valid tool call found');
  }

  const result = await handleToolCall(toolCall, bindings);
  return { results: [result] };
};

async function handleToolCall(toolCall: ToolCall, bindings: Bindings): Promise<ToolCallResult> {
  if (toolCall.type === 'function') {
    switch (toolCall.function.name) {
      case 'createOrder':
        try {
          const result = await createOrder(bindings, toolCall.function.arguments);
          return {
            toolCallId: toolCall.id,
            result: JSON.stringify(result, jsonSerializer)
          };
        } catch (error) {
          console.error(`Error in createOrder:`, error);
          return {
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      case 'retrieveOrder':
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await retrieveOrder(bindings, args.orderId);
          return {
            toolCallId: toolCall.id,
            result: JSON.stringify(result, jsonSerializer)
          };
        } catch (error) {
          console.error(`Error in retrieveOrder:`, error);
          return {
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      default:
        return {
          toolCallId: toolCall.id,
          error: `Unsupported function: ${toolCall.function.name}`
        };
    }
  }
  return {
    toolCallId: toolCall.id,
    error: `Unsupported tool call type: ${toolCall.type}`
  };
}
