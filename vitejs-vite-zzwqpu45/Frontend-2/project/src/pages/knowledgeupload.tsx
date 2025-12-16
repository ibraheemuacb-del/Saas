import React, { useState } from 'react';

const KnowledgeUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleUpload = async () => {
    try {
      // Convert files to base64 or names for placeholder
      const fileData = files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      const response = await fetch('/api/upload-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, files: fileData }),
      });

      const result = await response.json();
      setStatus(result.message);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('Upload failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Upload to Knowledge Base</h1>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Description (for AI context)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Onboarding checklist, GDPR policy, Interview prep guide..."
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white shadow rounded-lg p-10 border-2 border-dashed border-gray-300 text-center hover:border-blue-500 transition"
      >
        <p className="text-gray-600 font-medium">Drag & Drop your documents here</p>
        <p className="text-sm text-gray-400">Supported formats: PDF, DOCX, TXT</p>
      </div>

      {files.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Files ready to upload:</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Upload Files
          </button>
        </div>
      )}

      {status && (
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200 text-green-700">
          {status}
        </div>
      )}
    </div>
  );
};

export default KnowledgeUpload;
