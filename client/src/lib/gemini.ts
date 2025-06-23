// Google AI/Gemini integration for image generation
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate companion image');
  }
}