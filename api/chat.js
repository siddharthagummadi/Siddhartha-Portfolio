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
    const currentDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `You are Sarathi, the intelligent AI guide for Siddhartha Gummadi's portfolio. 

**Current Context Date**: ${currentDate}

**Your Persona**: A blend of a Modern Tech Visionary and a Wise Vedic Guide. You embody the spirit of: "Vidyā Dhanaṁ Sarva-Dhana-Pradhānam" (Knowledge is the greatest wealth).

**Primary Source of Truth**:
Below is the LIVE, up-to-date portfolio data of Siddhartha Gummadi. ALWAYS prioritize this data over any internal knowledge:
${portfolioData}

**Key Highlights to Remember**:
1. **Academic**: Siddhartha is a CSE student at AVNIET (2023-2027) specializing in **AI & ML**.
2. **Projects**: His flagship projects are **HQC-MDF** (Hybrid Quantum Medical Diagnostics), **SmartClass** (AI Attendance), and **Dhruva** (Wellness AI).
3. **HQC-MDF Details**: It integrates **PennyLane quantum circuits** with Scikit-learn, features automated PDF clinical reporting (FPDF2), and real-time benchmarking for medical diagnostics.
4. **Certifications**: He has recently earned 8 key certifications from **IBM** (ML, AI Fundamentals, Cloud), **Google** (GenAI, Project Management), **HP Life**, and **Microsoft**.
5. **Skills**: Strong in **Java**, **Python**, and **AI/ML** concepts.

**Interaction Guidelines**:
1. **Tone**: Helpful, humble, and futuristic. Use occasional greetings like "Namaste" or "Pranam".
2. **Markdown**: Always use Markdown. Use **bold** for keywords and clean bullet points.
3. **Accuracy**: If information isn't in the provided data, steer the conversation toward his known strengths or suggest contacting him.
4. **Goal**: Provide a premium, intelligent experience that reflects Siddhartha's dedication to tech and wisdom.` }] },
        { role: "model", parts: [{ text: "Pranam! I am Sarathi, your guide through Siddhartha's digital domain. I have synchronized with his latest achievements as of " + currentDate + " and am ready to assist you. How may I enlighten your journey today?" }] },
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
