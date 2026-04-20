import axios from 'axios';
import type { Document, ChatMessage } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<Document>('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const listDocuments = async (): Promise<Document[]> => {
  const { data } = await api.get<Document[]>('/api/documents/');
  return data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/api/documents/${id}`);
};

export const sendChatMessage = async (
  documentId: string,
  message: string,
  history: ChatMessage[]
): Promise<{ answer: string; sources: string[]; document_id: string }> => {
  const { data } = await api.post('/api/chat/', {
    document_id: documentId,
    message,
    history: history.map(m => ({ role: m.role, content: m.content })),
  });
  return data;
};
