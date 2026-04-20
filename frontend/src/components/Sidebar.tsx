import { useState } from 'react';
import { Brain, Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import type { Document } from '../types';
import { uploadDocument, deleteDocument } from '../services/api';
import clsx from 'clsx';

interface Props {
  documents: Document[];
  selectedDoc: Document | null;
  onSelectDoc: (doc: Document) => void;
  onDocumentUploaded: (doc: Document) => void;
  onDocumentDeleted: (id: string) => void;
  isLoading: boolean;
}

export function Sidebar({
  documents, selectedDoc, onSelectDoc,
  onDocumentUploaded, onDocumentDeleted, isLoading,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const doc = await uploadDocument(file);
      onDocumentUploaded(doc);
    } catch {
      console.error('Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDocumentDeleted(id);
    } catch {
      console.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">DocuMind</h1>
            <p className="text-xs text-gray-500">RAG Document Chat</p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="p-4 border-b border-gray-800">
        <label
          className={clsx(
            'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl',
            'bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer text-sm font-medium text-white',
            isUploading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload PDF</>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {isUploading && (
          <p className="text-xs text-gray-500 text-center mt-2 animate-pulse">
            Embedding chunks... ~30–60s
          </p>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 px-4">
            <FileText className="w-8 h-8 mx-auto mb-3 text-gray-700" />
            <p className="text-sm text-gray-500">No documents yet</p>
            <p className="text-xs text-gray-600 mt-1">Upload a PDF to get started</p>
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc)}
              className={clsx(
                'group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                selectedDoc?.id === doc.id
                  ? 'bg-blue-600/15 border-blue-600/40'
                  : 'hover:bg-gray-800 border-transparent hover:border-gray-700'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                selectedDoc?.id === doc.id ? 'bg-blue-600/30' : 'bg-gray-800'
              )}>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                <p className="text-xs text-gray-500">{doc.chunk_count} chunks</p>
              </div>
              <button
                onClick={e => handleDelete(e, doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">
          Ollama · ChromaDB · MongoDB
        </p>
      </div>
    </aside>
  );
}
