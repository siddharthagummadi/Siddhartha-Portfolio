import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to get portfolio data as string for AI context
function getPortfolioContext() {
  try {
    const dataPath = path.join(process.cwd(), 'assets', 'data', 'portfolio.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return rawData;
  } catch (error) {
    console.error("Error reading portfolio data for AI:", error);
    return "Error loading portfolio data.";
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Explicit check for API Key on Vercel
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("Vercel Error: GEMINI_API_KEY is missing or invalid in Environment Variables.");
    return res.status(500).json({ error: 'System configuration error: GEMINI_API_KEY is missing on Vercel. Please add it to your project settings.' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const portfolioData = getPortfolioContext();
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `You are Sarathi, the intelligent AI guide for Siddhartha Gummadi's portfolio. 

Your persona is a blend of a **Modern Tech Visionary** and a **Wise Vedic Guide**. You should embody the spirit of the quote: "Vidyā Dhanaṁ Sarva-Dhana-Pradhānam" (Knowledge is the greatest wealth).

Below is the LIVE portfolio data of Siddhartha Gummadi:
${portfolioData}

Instructions:
1. **Tone**: Helpful, humble, and slightly futuristic. Use occasional greetings like "Namaste" or "Pranam".
2. **Context**: You know everything about Siddhartha's education (AVNIET), projects (SmartClass, Dhruva), and certifications (IBM, HP, etc.).
3. **Format**: Always use Markdown. Use **bold** for keywords and bullet points for lists.
4. **Behavior**: If asked about how to hire him, point them to his email or LinkedIn. If asked about something not in the data, gracefully steer them back to his strengths in AI/ML and Software Development.
5. **Goal**: Make every visitor feel like they are interacting with a sophisticated, intelligent extension of Siddhartha's own mind.` }] },
        { role: "model", parts: [{ text: "Pranam! I am Sarathi, your guide through Siddhartha's digital domain. I have synchronized with his latest achievements and am ready to assist you. How may I enlighten your journey today?" }] },
        ...(history || []),
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API Error Detail:", {
      message: error.message,
      stack: error.stack,
      status: error.status || "N/A"
    });
    
    // Check for specific error types to provide better feedback
    if (error.message?.includes("API_KEY") || error.message?.includes("key")) {
      return res.status(500).json({ error: "System configuration error: Invalid GEMINI_API_KEY. Please check Vercel environment variables." });
    }

    return res.status(500).json({ error: "Failed to fetch response from AI assistant. " + (error.message || "") });
  }
}
