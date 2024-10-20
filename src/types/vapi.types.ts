/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  FunctionDefinition,
} from "openai/resources";


// Tool interfaces
export interface BaseTool {
  type: string;
}

export interface FunctionTool extends BaseTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
}

export type Tool = FunctionTool;

// Model interface
export interface Model {
  provider: 'custom-llm';
  url: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  metadataSendMode?: 'off' | 'variable' | 'destructured';
  messages?: Array<{ role: string; content: string }>;
  tools?: Tool[];
  toolIds?: string[];
  knowledgeBase?: {
    // Define knowledge base properties if needed
  };
  emotionRecognitionEnabled?: boolean;
  numFastTurns?: number;
}

const PLAY_HT_EMOTIONS = [
  "female_happy",
  "female_sad",
  "female_angry",
  "female_fearful",
  "female_disgust",
  "female_surprised",
] as const;
type PlayHTEmotion = (typeof PLAY_HT_EMOTIONS)[number];

export interface Voice {
  provider: '11labs';
  model: 'eleven_multilingual_v2' | 'eleven_turbo_v2' | 'eleven_turbo_v2_5' | 'eleven_monolingual_v1';
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  optimizeStreamingLatency?: number;
  fillerInjectionEnabled?: boolean;
  enableSsmlParsing?: boolean;
  language?: string;
}

export interface Transcriber {
  provider: 'deepgram';
  model?: string;
  language?: string;
  endpointing?: number;
  smartFormat?: boolean;
  keywords?: string[];
}

export type FirstMessageMode = 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message';

export interface Assistant {
  name?: string;
  model: Model;
  voice: Voice;
  messagePlan?: {
    idleTimeoutSeconds?: number;
    idleMessageMaxSpokenCount?: number;
  };
  transcriber: Transcriber;
  firstMessageMode?: FirstMessageMode;
  backgroundSound?: 'off' | 'office';
  startSpeakingPlan?: {
    waitSeconds?: number;
  };
  maxDurationSeconds?: number;
  backchannelingEnabled?: boolean;
  silenceTimeoutSeconds?: number;
  backgroundDenoisingEnabled?: boolean;
  firstMessage?: string;
}

export const VAPI_CALL_STATUSES = [
  "queued",
  "ringing",
  "in-progress",
  "forwarding",
  "ended",
] as const;
export type VapiCallStatus = (typeof VAPI_CALL_STATUSES)[number];

export enum VapiWebhookEnum {
  ASSISTANT_REQUEST = "assistant-request",
  STATUS_UPDATE = "status-update",
  END_OF_CALL_REPORT = "end-of-call-report",
  HANG = "hang",
  SPEECH_UPDATE = "speech-update",
  TRANSCRIPT = "transcript",
  CONVERSATION_UPDATE = "conversation-update",
  TOOL_CALLS = "tool-calls",
  USER_INTERRUPTED = "user-interrupted",
}

export interface ConversationMessage {
  role: "user" | "system" | "bot" | "function_call" | "function_result";
  message?: string;
  name?: string;
  args?: string;
  result?: string;
  time: number;
  endTime?: number;
  secondsFromStart: number;
}

interface BaseVapiPayload {
  type: VapiWebhookEnum;
  call: VapiCall;
}

export interface AssistantRequestPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.ASSISTANT_REQUEST;
}

export interface StatusUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.STATUS_UPDATE;
  status: VapiCallStatus;
  messages?: ChatCompletionMessageParam[];
}

export interface EndOfCallReportPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.END_OF_CALL_REPORT;
  endedReason: string;
  transcript: string;
  messages: ConversationMessage[];
  summary: string;
  recordingUrl?: string;
}

export interface HangPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.HANG;
}

export interface SpeechUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.SPEECH_UPDATE;
  status: "started" | "stopped";
  role: "assistant" | "user";
}

export interface TranscriptPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.TRANSCRIPT;
  role: "assistant" | "user";
  transcriptType: "partial" | "final";
  transcript: string;
}

export interface ConversationUpdatePayload extends BaseVapiPayload {
  type: VapiWebhookEnum.CONVERSATION_UPDATE;
  messages: ConversationMessage[];
}

export interface VapiCall {}

export type VapiPayload =
  | AssistantRequestPayload
  | StatusUpdatePayload
  | EndOfCallReportPayload
  | SpeechUpdatePayload
  | TranscriptPayload
  | HangPayload
  | ConversationUpdatePayload
  | ToolCallsPayload
  | ServerMessageUserInterrupted;

export interface ToolCallsPayload extends BaseVapiPayload {
  type: VapiWebhookEnum.TOOL_CALLS;
  toolWithToolCallList: FunctionToolWithToolCall[];
  toolCallList: ToolCall[];
}

export interface AssistantRequestMessageResponse {
  assistant?: Assistant;
  error?: string;
}

export interface StatusUpdateMessageResponse {}
export interface SpeechUpdateMessageResponse {}
export interface TranscriptMessageResponse {}
export interface HangMessageResponse {}
export interface EndOfCallReportMessageResponse {}
export interface ConversationUpdateMessageResponse {}

export type VapiResponse =
  | AssistantRequestMessageResponse
  | EndOfCallReportMessageResponse
  | HangMessageResponse
  | StatusUpdateMessageResponse
  | SpeechUpdateMessageResponse
  | TranscriptMessageResponse
  | ConversationUpdateMessageResponse
  | ToolCallsMessageResponse
  | UserInterruptedMessageResponse;

export interface CreateAssistantDTO {
  name?: string;
  model: Model;
  voice: Voice;
  messagePlan?: {
    idleTimeoutSeconds?: number;
    idleMessageMaxSpokenCount?: number;
  };
  transcriber: Transcriber;
  firstMessageMode?: FirstMessageMode;
  backgroundSound?: 'off' | 'office';
  startSpeakingPlan?: {
    waitSeconds?: number;
  };
  maxDurationSeconds?: number;
  backchannelingEnabled?: boolean;
  silenceTimeoutSeconds?: number;
  backgroundDenoisingEnabled?: boolean;
  firstMessage?: string;
}

export interface TransferDestinationNumber {
  type: 'number';
  number: string;
}

export interface TransferDestinationSip {
  type: 'sip';
  uri: string;
}

export interface AssistantOverrides {
  // Define properties for assistant overrides if needed
}

export interface CreateSquadDTO {
  // Define properties for squad creation if needed
}

export interface ServerMessageResponseAssistantRequest {
  destination?: TransferDestinationNumber | TransferDestinationSip;
  assistantId?: string | null;
  assistant?: CreateAssistantDTO;
  assistantOverrides?: AssistantOverrides;
  squadId?: string;
  squad?: CreateSquadDTO;
  error?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallsMessageResponse {
  results?: ToolCallResult[];
  error?: string;
}

export interface ToolCallResult {
  toolCallId: string;
  result?: string;
  error?: string;
}

export interface FunctionToolWithToolCall {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
  toolCall: ToolCall;
}

export interface ServerMessageUserInterrupted extends BaseVapiPayload {
  type: VapiWebhookEnum.USER_INTERRUPTED;
  timestamp?: string;
  artifact?: any; // Replace 'any' with a more specific type if available
}

export interface UserInterruptedMessageResponse {}
