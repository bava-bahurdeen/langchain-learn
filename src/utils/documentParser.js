import fetch from "node-fetch";
import pdf from "pdf-extraction";
import mammoth from "mammoth";


export async function extractResumeTextFromUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (url.toLowerCase().endsWith(".pdf")) {
      const data = await pdf(buffer);
      return data.text.trim();
    } else if (url.toLowerCase().endsWith(".docx")) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value.trim();
    } else {
      return buffer.toString("utf-8").trim();
    }
  } catch (error) {
    console.error("Error extracting resume text:", error);
    throw error;
  }
}
