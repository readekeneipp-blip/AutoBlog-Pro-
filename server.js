const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Stripe = require('stripe');

const app = express();
app.use(cors());
app.use(express.json());

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('AutoBlog Pro API is Running!'));

app.post('/api/generate', async (req, res) => {
  const { topic } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Write a blog post about ${topic}`);
    res.json({ content: (await result.response).text() });
  } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
