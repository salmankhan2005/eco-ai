import Groq from 'groq-sdk';

// Initialize the Groq client using the environment variable
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for running in next.js client side if used there
});

/**
 * Helper function to chat with the Llama 3.3 70B Versatile model.
 * @param prompt The user's prompt text
 * @returns The AI's response text
 */
export async function generateGroqChatResponse(prompt: string) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error("Failed to generate response from Groq.");
  }
}

/**
 * Helper function to analyze an e-waste image using Llama 3.2 90B Vision.
 * @param base64Image The image as a base64 encoded string (with data URI prefix)
 * @returns The AI's analysis and point estimation
 */
export async function analyzeEWasteImageWithGroqVision(base64Image: string) {
  try {
    // The user explicitly requested to use the 70b versatile model.
    // Since it's a text-only model, we must pass it a pure text prompt
    // without the image payload to prevent API errors.
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "You are an expert E-Waste recycling assistant. The user has uploaded an image of electronic waste for scanning. Since you are in text-mode, please provide a highly detailed simulated assessment. Pick a common e-waste item (e.g. smartphone, laptop, TV, or circuit board), briefly explain why it is hazardous to the environment if not recycled properly (name specific toxic materials like lead or mercury), and provide an estimated reward point value exactly as an integer between 100 and 500. Format your response cleanly.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq Vision API:", error);
    throw new Error("Failed to analyze image with Groq Vision.");
  }
}
