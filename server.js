const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Stripe = require('stripe');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  const { topic } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(`Write a high-quality blog post about ${topic} for a niche site. Use Markdown formatting.`);
    res.json({ content: (await result.response).text() });
  } catch (e) { 
    console.error(e);
    res.status(500).json({ content: "Error: " + e.message }); 
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
