import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Access the API key from the new environment variable
const apiKey = import.meta.env.NEXT_PUBLIC_VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY is not set");
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

export const analyzeSymptom = async (symptom: string) => {
  const prompt = `Analyze the following symptom: ${symptom}`;
  try {
    const result = await run(prompt);
    return result;
  } catch (error) {
    console.error("Error analyzing symptom:", error);
    throw error;
  }
};