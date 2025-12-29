
export enum AppMode {
  TEXT = 'TEXT',
  LIVE = 'LIVE'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

export interface LiveState {
  isConnected: boolean;
  isListening: boolean;
  transcriptionHistory: string[];
  currentInputTranscription: string;
  currentOutputTranscription: string;
}
