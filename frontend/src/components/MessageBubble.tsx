import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain, User } from 'lucide-react';
import type { ChatMessage } from '../types';
import clsx from 'clsx';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Brain className="w-4 h-4 text-blue-400" />
        </div>
      )}

      <div className={clsx('max-w-[80%] space-y-2', isUser ? 'flex flex-col items-end' : '')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
          )}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-200">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-gray-900 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                h3: ({ children }) => <h3 className="font-bold text-white mb-1">{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Source Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.sources.map((source, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-gray-400"
              >
                📄 {source}
              </span>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-300" />
        </div>
      )}
    </div>
  );
}
