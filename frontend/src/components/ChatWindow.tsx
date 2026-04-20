import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import type { Document } from '../types';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../hooks/useChat';
import clsx from 'clsx';

interface Props {
  document: Document;
}

const SUGGESTED_QUESTIONS = [
  'What is this document about?',
  'Summarize the main points',
  'What are the key findings?',
];

export function ChatWindow({ document }: Props) {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearChat } = useChat(document.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 128) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="font-semibold text-white text-sm truncate max-w-xs">
              {document.filename}
            </h2>
            <p className="text-xs text-gray-500">{document.chunk_count} chunks indexed</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                Ask anything about this document
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Answers are grounded in the document with page citations
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    textareaRef.current?.focus();
                  }}
                  className="text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-full text-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div className="flex gap-1 items-center">
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-1 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask a question about this document..."
            rows={1}
            disabled={isLoading}
            className={clsx(
              'flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3',
              'text-white placeholder-gray-500 text-sm resize-none',
              'focus:outline-none focus:border-blue-500 transition-colors',
              'max-h-32 overflow-y-auto disabled:opacity-50'
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={clsx(
              'p-3 rounded-xl transition-all flex-shrink-0',
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
