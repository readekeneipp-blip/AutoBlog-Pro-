const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate', async (req, res) => {
  const { topic } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  
  // This is the most stable free model for all accounts
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write a short, engaging blog post about " + topic + ". Use Markdown." }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // If this fails, it's definitely the API key type
      throw new Error(data.error.message);
    }

    const content = data.candidates[0].content.parts[0].text;
    res.json({ content });
  } catch (e) {
    res.status(500).json({ content: "AI Quota Error: Your Google account is currently limiting this key. Try getting a new key from a personal @gmail.com account at aistudio.google.com" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server live"));
