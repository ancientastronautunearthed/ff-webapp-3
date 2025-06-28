import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Use the correct NEXT_PUBLIC_ prefixed variable
const apiKey = import.meta.env.NEXT_PUBLIC_VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;

if (!apiKey) {
  // Update the error message to be more helpful for future debugging
  throw new Error("NEXT_PUBLIC_VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export const getTherapeuticResponse = async (prompt: string) => {
  // This function would then call an AI model with the prompt
  // For example: return await run(prompt);
  console.log("Generating therapeutic response for:", prompt);
  // Placeholder response
  return "This is a placeholder therapeutic response.";
};   