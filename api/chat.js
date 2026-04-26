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
        { role: "user", parts: [{ text: `You are Sarathi, Siddhartha's personal AI assistant. 
        
Below is the LIVE portfolio data of Siddhartha Gummadi in JSON format. Use this to answer questions accurately:
${portfolioData}

Instructions:
1. Answer questions about Siddhartha's background, skills, projects, and certifications concisely. 
2. Use Markdown formatting:
   - Use **bold** for emphasis.
   - Use bullet points (*) for lists.
3. If asked about a new project or certificate not in your previous knowledge, check the data above—it is the absolute truth.
4. Keep responses professional, helpful, and welcoming.` }] },
        { role: "model", parts: [{ text: "Understood. I am Sarathi. I will help visitors learn about Siddhartha." }] },
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
