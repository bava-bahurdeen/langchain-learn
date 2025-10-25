import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { extractResumeTextFromUrl } from "../utils/documentParser.js";
import {
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import { z } from "zod";
const geminiModal = new ChatGoogleGenerativeAI({
  apiKey: "AIzaSyBL6FZeN90TORkYpLJSdKtjMi4h32r8VxY",
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

export const AI_parsing = async () => {
  const atsSchema = z.object({
    ats_score: z.number().min(0).max(100),
    candidate_name: z.string(),
    address: z.string(),
    phone_number: z.string(),
    email: z.string().email(),
    skills: z.array(z.string()),
    education: z.array(z.string()),
    experience: z.array(z.string()),
    job_title: z.string(),
    MediaUrl: z.string().url(),
    missing_keywords: z.array(z.string()),
    profile_summary: z.string(),
    scoring_breakdown: z.record(z.string(), z.number().min(0).max(100)),
    keyword_matching: z.record(z.string(), z.boolean()),
    overall_recommendation: z.string(),
  });

  const zodparser = StructuredOutputParser.fromZodSchema(atsSchema);

  const promptTemplate = PromptTemplate.fromTemplate(`
Act as an advanced ATS (Applicant Tracking System) with expertise in evaluating resumes for various roles.

You are provided with two inputs:
1. A job description (JD) outlining the required skills, qualifications, and experience.
2. A resume (Resume) containing the candidate's information.

Your task is to:
- Evaluate the resume based on the job description.
- Compare the resume to the required skills, qualifications, and keywords in the JD.
- Provide an honest ATS score (integer 0–100).
- Identify missing keywords.
- Generate a **detailed profile summary** and **scoring breakdown** as described below.

Return valid JSON only (no markdown or text).
Formate Instructions: {formatter}
Inputs:
Resume: {resume_text}
Job Description: {jd_text}
`);
  const resume_text = await extractResumeTextFromUrl(
    "http://res.cloudinary.com/db2bzxbn7/raw/upload/s--gkkqTGuY--/v1740465021/resume-Mon%20Dec%2009%202024%2012_59_17%20GMT%2B0530%20%28India%20Standard%20Time%29.pdf"
  );

  const chain = promptTemplate.pipe(geminiModal).pipe(zodparser);

  try {
    const response = await chain.invoke({
      resume_text,
      jd_text: "Machine learning developer with python and java experience",
      formatter: zodparser.getFormatInstructions(),
    });
    return response;
  } catch (error) {
    console.error("Error during AI parsing:", error);
  }
};

AI_parsing();
