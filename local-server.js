import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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
    - LinkedIn: linkedin.com/in/siddhartha-gummadi-7951042b8
    - GitHub: github.com/siddharthagummadi
- Quote: "Knowledge is the greatest wealth."
`;

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is missing in .env file" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const chat = model.startChat({ 
      history: [
        { role: "user", parts: [{ text: `You are Sarathi, Siddhartha's personal AI assistant. Use this data: ${PORTFOLIO_DATA}. Answer questions about Siddhartha's background, skills, and projects concisely.` }] },
        { role: "model", parts: [{ text: "Understood. I am Sarathi. I will help visitors learn about Siddhartha." }] },
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
