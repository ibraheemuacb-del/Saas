import { supabase } from "../lib/supabase";

export async function fetchOfferTemplate(templateName: string) {
  const { data, error } = await supabase
    .from("offer_templates")
    .select("content")
    .eq("name", templateName)
    .single();

  if (error) {
    console.error("Error loading template:", error);
    return null;
  }

  return data.content as string;
}

export function fillPlaceholders(template: string, data: Record<string, string>) {
  let output = template;

  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{${key}}`, "g");
    output = output.replace(placeholder, value || "");
  });

  return output;
}
