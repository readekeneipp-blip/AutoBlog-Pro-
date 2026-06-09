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
  
  // These are the specific models available to your account
  const models = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
  let lastError = "";

         for (let modelName of models) {
    try {
      const URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Write a professional SEO blog post about " + topic + ". Use Markdown." }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        return res.json({ content: data.candidates[0].content.parts[0].text });
      }
      lastError = data.error ? data.error.message : "Model " + modelName + " not ready";
    } catch (e) {
      lastError = e.message;
    }
         }

         res.status(500).json({ content: "AI Error: " + lastError });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server live"));
