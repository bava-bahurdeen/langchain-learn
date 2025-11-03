import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { extractResumeTextFromUrl } from "../utils/documentParser.js";

const geminiModal = new ChatGoogleGenerativeAI({
  apiKey: "AIzaSyBL6FZeN90TORkYpLJSdKtjMi4h32r8VxY",
  model: "gemini-2.0-flash",
  temperature: 0.4,
  maxOutputTokens: 2048,
});
const resume_text = await extractResumeTextFromUrl(
  "http://res.cloudinary.com/db2bzxbn7/raw/upload/s--gkkqTGuY--/v1740465021/resume-Mon%20Dec%2009%202024%2012_59_17%20GMT%2B0530%20%28India%20Standard%20Time%29.pdf"
);
export const AI_parsing = async () => {
  const atsSchema = z.object({
    ats_score: z.number().min(0).max(100),
    candidate_name: z.string().nullable().default("Unknown"),
    address: z.string().nullable().default(""),
    phone_number: z.string().nullable().default(""),
    email: z.string().nullable().default(""),
    skills: z.array(z.string()).default([]),
    education: z.array(z.string()).default([]),
    experience: z
      .array(z.object({ role: z.string(), description: z.string() }))
      .default([]),
    job_title: z.string().nullable().default(""),
    MediaUrl: z.string().url().nullable().default(""),
    missing_keywords: z.array(z.string()).default([]),
    profile_summary: z.string().nullable().default(""),
    years_of_experience: z.number().min(0).default(0),
    scoring_breakdown: z.record(z.string(), z.number()).default({}),
    keyword_matching: z.record(z.string(), z.boolean()).default({}),
    overall_recommendation: z.string().nullable().default(""),
    status: z.enum(["shortlisted", "not shortlisted"]),
  });

  const parser = StructuredOutputParser.fromZodSchema(atsSchema);

  const promptTemplate = PromptTemplate.fromTemplate(`
You are an AI ATS (Applicant Tracking System) evaluating a candidate's resume.

Your task:
1. Analyze the resume text carefully.
2. Compare it to the job description.
3. Return ONLY a valid JSON object that fits this structure:
{format_instructions}

Do NOT include markdown, commentary, or extra text.

Resume Text:
{resume_text}

Job Description:
{jd_text}
`);

  const chain = promptTemplate.pipe(geminiModal).pipe(parser);

  try {
    const response = await chain.invoke({
      resume_text,
      jd_text: "Machine learning developer with Python and Java experience",
      format_instructions: parser.getFormatInstructions(),
    });

    return response;
  } catch (error) {
    console.error("Error  AI parsing:", error);
    if (error.llmOutput) {
      console.log("LLM Raw Output:", error.llmOutput);
    }
  }
};

AI_parsing();
