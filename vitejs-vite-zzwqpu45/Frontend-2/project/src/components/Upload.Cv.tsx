import { useState } from "react";
import { ingestCv } from "../agents/ingestion/ingestCv";

export default function UploadCv() {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await ingestCv(file);
      alert("CV uploaded and processed successfully");
    } catch (err) {
      console.error(err);
      alert("Error processing CV");
    }
    setLoading(false);
  }

  return (
    <div>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} />
      {loading && <p>Processing...</p>}
    </div>
  );
}
