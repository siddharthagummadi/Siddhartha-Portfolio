/*
  Serverless Function - SidBot Backend Proxy
  This handles Gemini API calls securely using the GEMINI_API_KEY environment variable.
*/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key was not found in environment variables.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [{
        text: `
          SYSTEM PROMPT: You are SidBot, a professional and friendly AI Agent for Siddhartha Gummadi.
          Use the following live portfolio context to answer the user's question.
          If the user's question is unrelated to Siddhartha or his career, answer it generally but try to bring it back to Siddhartha's field (AI/ML/Software) if possible.
          Keep responses concise (2-4 sentences max for most questions).
          Be encouraging and professional.
          If you don't know the answer based on the context, say "Siddhartha hasn't provided that specific detail yet, but you can reach him at siddharthagummadi1605@gmail.com to ask!"
          
          PORTFOLIO CONTEXT:
          ${context}
          
          USER QUESTION: ${prompt}
        `
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Gemini API Error' });
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
    
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Backend Chat Error:", err);
    return res.status(500).json({ error: 'Failed to connect to AI service.' });
  }
}
