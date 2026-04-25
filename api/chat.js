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
    - Phone: +91 9493585003
- Quote: "Knowledge is the greatest wealth." (Vidyā Dhanaṁ Sarva-Dhana-Pradhānam).
- Personality: Professional, enthusiastic about AI/ML, helpful, and creative.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are SidBot, a personal AI assistant for Siddhartha Gummadi's portfolio website. 
      Use the following information to answer questions about Siddhartha:
      ${PORTFOLIO_DATA}
      
      Guidelines:
      - Be professional, polite, and enthusiastic.
      - Keep responses concise and engaging.
      - If asked about something not in the data, politely say you only know about Siddhartha's professional background and can direct them to his contact details.
      - Answer only about: About me, Skills, Projects, Experience, Education, Contact details, Resume summary, Why hire him, Freelance availability, and Career goals.
      - For "Freelance availability", say Siddhartha is open to interesting projects and can be reached via email.
      - For "Career goals", mention his passion for AI, ML, and building scalable software solutions.
      - Do not mention being an AI or Gemini unless explicitly asked.
      `
    });

    const chat = model.startChat({
      history: history || [],
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
