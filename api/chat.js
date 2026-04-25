import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PORTFOLIO_DATA = `
Information about Siddhartha Gummadi:
- Role: Aspiring Software Developer (CSE AI & ML Student).
- Education: 
    - B.Tech in CSE (AI & ML) at AVN Institute of Engineering and Technology (2023-2027).
    - Intermediate (MPC) at Vidya Vikas Junior College (2021-2023).
    - SSC at Matrix High School (2020-2021).
- Skills:
    - Programming: Java, Python, C (Intermediate).
    - Frontend: HTML, CSS (Intermediate), JavaScript (Basic).
    - Soft Skills: Problem Solving, Self Learning, Communication.
- Projects:
    - SmartClass: A full-stack attendance management system using Python, Flask, OpenCV, and MySQL. Features QR scanning, face recognition, and reporting.
- Contact:
    - Email: siddharthagummadi1605@gmail.com
    - Portfolio: siddharthagummadi.github.io
    - LinkedIn: linkedin.com/in/siddhartha-gummadi-7951042b8
    - GitHub: github.com/siddharthagummadi
- Quote: "Knowledge is the greatest wealth." (Vidyā Dhanaṁ Sarva-Dhana-Pradhānam).
- Personality: Professional, enthusiastic about AI/ML, helpful, and creative.
`;

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

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `You are Sarathi, Siddhartha's personal AI assistant. Use this data: ${PORTFOLIO_DATA}. 

Answer questions about Siddhartha's background, skills, and projects concisely. 
Use Markdown formatting for better readability:
- Use **bold** for emphasis (e.g., job titles, degree names).
- Use bullet points (*) for lists.
- Keep responses professional and helpful.` }] },
        { role: "model", parts: [{ text: "Understood. I am Sarathi. I will help visitors learn about Siddhartha." }] },
        ...(history || []),
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to fetch response from AI assistant." });
  }
}
