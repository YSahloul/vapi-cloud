import {
  StatusUpdateMessageResponse,
  StatusUpdatePayload,
  VapiCallStatus
} from "../../types/vapi.types";

export const statusUpdateHandler = async (
  payload: StatusUpdatePayload
): Promise<StatusUpdateMessageResponse> => {
  console.log(`Call status updated to: ${payload.status}`);

  /**
   * Handle Business logic here.
   * Sent during a call whenever the status of the call has changed.
   * Possible statuses are: "queued","ringing","in-progress","forwarding","ended".
   * You can have certain logic or handlers based on the call status.
   * You can also store the information in your database. For example whenever the call gets forwarded.
   */

  switch (payload.status) {
    case "queued":
      console.log("Call is queued");
      break;
    case "ringing":
      console.log("Call is ringing");
      break;
    case "in-progress":
      console.log("Call is in progress");
      break;
    case "forwarding":
      console.log("Call is being forwarded");
      break;
    case "ended":
      console.log("Call has ended");
      break;
    default:
      console.log(`Unexpected call status: ${payload.status}`);
  }

  // You can add more specific logic for each status here

  return {};
};
