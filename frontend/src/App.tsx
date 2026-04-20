import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { UploadZone } from './components/UploadZone';
import type { Document } from './types';
import { listDocuments } from './services/api';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    listDocuments()
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setIsLoadingDocs(false));
  }, []);

  const handleUploaded = (doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
    setSelectedDoc(doc);
  };

  const handleDeleted = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        onDocumentUploaded={handleUploaded}
        onDocumentDeleted={handleDeleted}
        isLoading={isLoadingDocs}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <ChatWindow document={selectedDoc} />
        ) : (
          <UploadZone onDocumentUploaded={handleUploaded} />
        )}
      </main>
    </div>
  );
}

export default App;
