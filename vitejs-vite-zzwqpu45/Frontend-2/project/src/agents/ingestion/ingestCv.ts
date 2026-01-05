import { supabase } from "../../lib/supabase";
import { parseCv } from "../agents/parsing/parsing";
import { standardizeCandidate } from "../../agents/standardize";
import { enrichCandidate } from "../agents/enrichment/enrichment";
import { checkCompliance } from "../agents/compliance/index";

export async function ingestCv(file: File) {
  // 1. Upload original CV file to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `cv-${crypto.randomUUID()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("cvs")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const cvFilePath = uploadData.path;

  // 2. Extract text from the CV (PDF/DOCX)
  const rawText = await file.text();

  // 3. Run parsing pipeline
  const parsed = await parseCv(rawText);
  const standardized = await standardizeCandidate(parsed);
  const enriched = await enrichCandidate(standardized);
  const finalCandidate = await checkCompliance(enriched);

  // 4. Insert into Supabase
  const { error: insertError } = await supabase.from("candidates").insert({
    ...finalCandidate,
    raw_text: rawText,
    cv_file_path: cvFilePath,
  });

  if (insertError) throw insertError;

  return { success: true };
}
