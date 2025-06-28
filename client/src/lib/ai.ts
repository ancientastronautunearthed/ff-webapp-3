import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// This now correctly uses the standard Vite method for accessing environment variables.
const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;

if (!apiKey) {
  // Updated the error message for clarity.
  throw new Error("Configuration error: VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY is not set in the build environment.");
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

export async function run(prompt: string) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  const response = result.response;
  console.log(response.text());
  return response.text();
}