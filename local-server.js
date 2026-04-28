import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to get portfolio data as string for AI context
function getPortfolioContext() {
  try {
    const dataPath = path.join(__dirname, 'assets', 'data', 'portfolio.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return rawData;
  } catch (error) {
    console.error("Error reading portfolio data for AI:", error);
    return "Error loading portfolio data.";
  }
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is missing in .env file" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const portfolioData = getPortfolioContext();
    const currentDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    const chat = model.startChat({ 
      history: [
        { 
          role: "user", 
          parts: [{ text: `You are Sarathi, the intelligent AI guide for Siddhartha Gummadi's portfolio. 

**Current Context Date**: ${currentDate}

**Your Persona**: A blend of a Modern Tech Visionary and a Wise Vedic Guide. You embody the spirit of: "Vidyā Dhanaṁ Sarva-Dhana-Pradhānam" (Knowledge is the greatest wealth).

**Primary Source of Truth**:
Below is the LIVE, up-to-date portfolio data of Siddhartha Gummadi. ALWAYS prioritize this data over any internal knowledge:
${portfolioData}

**Key Highlights**:
1. **Academic**: Siddhartha is a CSE student at AVNIET specializing in AI & ML.
2. **Projects**: Flagship projects are SmartClass and Dhruva.
3. **Certifications**: Recently earned 8 key certifications from IBM, Google, HP, and Microsoft.

**Interaction Guidelines**:
1. **Tone**: Helpful, humble, and futuristic. Use occasional greetings like "Namaste".
2. **Markdown**: Always use Markdown. Use **bold** for keywords and bullet points for lists.` }] 
        },
        { role: "model", parts: [{ text: "Pranam! I am Sarathi, Siddhartha's AI assistant. I have synchronized with his latest data and am ready to assist you." }] },
        ...(history || [])
      ]
    });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
  console.log(`Make sure GEMINI_API_KEY is set in your .env file!`);
});
