import { ServerMessageUserInterrupted, UserInterruptedMessageResponse } from "../../types/vapi.types";

export async function userInterruptedHandler(payload: ServerMessageUserInterrupted): Promise<UserInterruptedMessageResponse> {
  console.log("User interrupted event received:", payload);
  // We're just logging the event here. No additional action is needed.
  return {};
}

