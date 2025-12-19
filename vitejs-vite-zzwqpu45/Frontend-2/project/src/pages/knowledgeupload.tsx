import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const KnowledgeUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("offer");
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const extractVariables = async (text: string): Promise<string[]> => {
    const regex = /{{\s*([^}]+)\s*}}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.add(match[1]);
    }
    return Array.from(found);
  };

  const handleUpload = async () => {
    if (!title || files.length === 0) {
      setStatus("Please provide a title and at least one file.");
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const file = files[0]; // Only 1 template per upload for now
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("knowledge_base")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setStatus("Upload failed.");
        setUploading(false);
        return;
      }

      // Read file text for variable detection
      const text = await file.text();
      const variables = await extractVariables(text);

      // Insert metadata into DB
      const { error: insertError } = await supabase
        .from("knowledge_base")
        .insert({
          title,
          type,
          file_path: filePath,
          variables,
        });

      if (insertError) {
        console.error(insertError);
        setStatus("Failed to save metadata.");
        setUploading(false);
        return;
      }

      setStatus("Template uploaded successfully!");
      setFiles([]);
      setTitle("");
      setType("offer");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Upload failed.");
    }

    setUploading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Knowledge Base Upload</h1>

      {/* Title */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Offer Letter Template"
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Type */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        >
          <option value="offer">Offer Letter</option>
          <option value="onboarding">Onboarding Email</option>
          <option value="sop">SOP / Policy</option>
          <option value="reference">Reference Template</option>
          <option value="general">General Document</option>
        </select>
      </div>

      {/* Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white shadow rounded-lg p-10 border-2 border-dashed border-gray-300 text-center hover:border-blue-500 transition"
      >
        <p className="text-gray-600 font-medium">Drag & Drop your documents here</p>
        <p className="text-sm text-gray-400">Supported formats: PDF, DOCX, TXT</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Files ready to upload:
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Template"}
          </button>
        </div>
      )}

      {/* Status */}
      {status && (
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200 text-green-700">
          {status}
        </div>
      )}
    </div>
  );
};

export default KnowledgeUpload;
