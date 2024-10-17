import { ConversationUpdatePayload, ConversationUpdateMessageResponse } from "../../types/vapi.types";

export const conversationUpdateHandler = async (
  payload: ConversationUpdatePayload
): Promise<ConversationUpdateMessageResponse> => {
  // Log the conversation update
  console.log("Conversation update received:", JSON.stringify(payload.messages, null, 2));

  // You can add any processing logic here if needed

  // Return an empty object as the response
  return {};
};