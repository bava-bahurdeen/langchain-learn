import fetch from "node-fetch";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeTextFromUrl(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

try {
  
  if (url.endsWith(".pdf")) {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (url.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return value;
  } else {
    return Buffer.from(buffer).toString("utf-8");
  }
} catch (error) {
   console.log( `error:${error}`);
   
}
}
