// src/engine/offerPdfEngine.ts
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import { fetchOfferForCandidate } from "./candidateOfferEngine";
import { fetchTimelineForCandidate } from "../lib/api/timeline";
import { syncCandidate } from "./sync/syncCandidate";
import { useCandidateStore } from "../stores/candidateStore";

interface CompanySettings {
  company_name: string;
  company_address?: string | null;
  company_website?: string | null;
  company_email?: string | null;
}

async function fetchCompanySettings(): Promise<CompanySettings | null> {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.warn("Failed to load company settings:", error.message);
    return null;
  }

  return data as CompanySettings;
}

export async function exportOfferToPdf(candidateId: string) {
  const store = useCandidateStore.getState();

  // 1) Fetch company settings
  const settings = await fetchCompanySettings();

  // 2) Fetch latest candidate + offer
  const candidate = await syncCandidate(candidateId);
  if (!candidate) {
    console.warn("No candidate found for PDF export:", candidateId);
    return;
  }

  const offer = await fetchOfferForCandidate(candidateId);
  if (!offer) {
    console.warn("No offer found for candidate:", candidateId);
    return;
  }

  // 3) Build PDF
  const doc = new jsPDF();
  let y = 20;

  const companyName = settings?.company_name || "Your Company Name";
  const companyAddress = settings?.company_address || "";
  const companyWebsite = settings?.company_website || "";
  const companyEmail = settings?.company_email || "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(companyName, 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (companyAddress) {
    doc.text(companyAddress, 20, y);
    y += 5;
  }
  if (companyWebsite) {
    doc.text(companyWebsite, 20, y);
    y += 5;
  }
  if (companyEmail) {
    doc.text(companyEmail, 20, y);
    y += 8;
  } else {
    y += 5;
  }

  y += 5;
  doc.setFontSize(12);
  doc.text(`Offer Letter`, 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(`Candidate: ${candidate.name || ""}`, 20, y);
  y += 6;
  if (candidate.email) {
    doc.text(`Email: ${candidate.email}`, 20, y);
    y += 6;
  }
  if (candidate.role_title) {
    doc.text(`Role: ${candidate.role_title}`, 20, y);
    y += 6;
  }

  if (offer.salary) {
    doc.text(`Salary: £${offer.salary.toLocaleString()}`, 20, y);
    y += 6;
  }
  if (offer.start_date) {
    doc.text(`Start Date: ${offer.start_date}`, 20, y);
    y += 8;
  } else {
    y += 4;
  }

  // Offer content
  if (offer.content) {
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(offer.content, 170);
    doc.text(contentLines, 20, y);
    y += contentLines.length * 5 + 8;
  }

  // Internal notes (optional)
  if (offer.notes) {
    doc.setFontSize(10);
    doc.text("Internal Notes:", 20, y);
    y += 5;
    const notesLines = doc.splitTextToSize(offer.notes, 170);
    doc.text(notesLines, 20, y);
    y += notesLines.length * 5 + 8;
  }

  // Signature block
  y += 10;
  doc.setFontSize(11);
  doc.text("Signed by (Employer):", 20, y);
  y += 15;
  doc.line(20, y, 100, y);
  y += 6;
  doc.setFontSize(9);
  doc.text("Name / Title", 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("Signed by (Candidate):", 20, y);
  y += 15;
  doc.line(20, y, 100, y);
  y += 6;
  doc.setFontSize(9);
  doc.text("Name", 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, y);

  // 4) Export to Blob
  const pdfBlob = doc.output("blob");

  // 5) Upload to Supabase Storage
  const fileName = `offer_${candidateId}_${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("offers")
    .upload(fileName, pdfBlob, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload offer PDF:", uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("offers")
    .getPublicUrl(uploadData.path);

  const pdfUrl = publicUrlData.publicUrl;

  // 6) Optionally: add to candidate record (e.g. offer_pdf_url)
  await supabase
    .from("candidates")
    .update({ offer_pdf_url: pdfUrl })
    .eq("id", candidateId);

  // 7) Optionally: add timeline event
  await supabase.from("candidate_events").insert({
    candidate_id: candidateId,
    event_type: "offer_pdf_exported",
    metadata: { url: pdfUrl },
  });

  // 8) Sync store
  const updated = await syncCandidate(candidateId);
  if (updated) {
    store.replaceOrInsertCandidate(updated);
  }

  console.log("Offer PDF generated and uploaded:", pdfUrl);
}
