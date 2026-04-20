import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

export function useChat(documentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage(documentId, content, messages);
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: response.answer,
            sources: response.sources,
          },
        ]);
      } catch {
        setError('Failed to get a response. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, messages, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
