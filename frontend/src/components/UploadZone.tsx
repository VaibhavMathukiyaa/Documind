import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Brain } from 'lucide-react';
import type { Document } from '../types';
import { uploadDocument } from '../services/api';
import clsx from 'clsx';

interface Props {
  onDocumentUploaded: (doc: Document) => void;
}

export function UploadZone({ onDocumentUploaded }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      onDocumentUploaded(doc);
    } catch {
      setError('Upload failed. Make sure the backend is running and try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950">
      <div className="w-full max-w-lg space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Chat with your PDF</h2>
          <p className="text-gray-500">
            Upload any PDF and ask questions about it in natural language
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-900/50',
            isUploading && 'cursor-not-allowed opacity-70'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
              <p className="text-white font-semibold">Processing your PDF...</p>
              <p className="text-sm text-gray-500">
                Generating embeddings with Ollama · This takes 30–60 seconds
              </p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
              <p className="text-blue-400 font-semibold text-lg">Drop it here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <FileText className="w-12 h-12 text-gray-600 mx-auto" />
              <div>
                <p className="text-white font-semibold text-lg">
                  Drop a PDF here
                </p>
                <p className="text-gray-500 text-sm mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-gray-600">PDF files only · No size limit</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
            {error}
          </p>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🔍', title: 'Semantic Search', sub: 'ChromaDB vectors' },
            { icon: '🤖', title: 'Local LLM', sub: 'Ollama llama3.2' },
            { icon: '📄', title: 'Page Citations', sub: 'Grounded answers' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs font-semibold text-white">{f.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
