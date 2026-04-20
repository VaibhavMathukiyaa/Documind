export interface Document {
  id: string;
  filename: string;
  chunk_count: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}
