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
  // Using the Ultra-Stable v1/gemini-pro endpoint
  const URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + API_KEY;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write a high-quality blog post about " + topic + ". Use Markdown formatting and make it professional." }] }]
      })
    });

    const data = await response.json();
    
    // Check if Google sent back an error
    if (data.error) {
        throw new Error(data.error.message);
    }

    const content = data.candidates[0].content.parts[0].text;
    res.json({ content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ content: "AI Error: " + e.message + ". Double check your API key in Render." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));
