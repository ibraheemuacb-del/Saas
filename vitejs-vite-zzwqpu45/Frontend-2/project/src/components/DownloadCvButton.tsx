import { supabase } from "../lib/supabase";

export function DownloadCvButton({ path }: { path: string }) {
  const { data } = supabase.storage.from("cvs").getPublicUrl(path);
  const url = data.publicUrl;

  return (
    <a href={url} download target="_blank" rel="noopener noreferrer">
      <button>Download CV</button>
    </a>
  );
}
