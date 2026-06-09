const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate', async (req, res) => {
  const { topic } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await axios.post(URL, {
      contents: [{ parts: [{ text: `Write a high-quality blog post about ${topic} for a niche site. Use Markdown.` }] }]
    });

    const content = response.data.candidates[0].content.parts[0].text;
    res.json({ content });
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
    res.status(500).json({ content: "AI Error: Please verify your API key in Render environment variables." });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
