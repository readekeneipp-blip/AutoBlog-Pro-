const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const Stripe = require('stripe');

dotenv.config();

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://autoblog-pro-three.vercel.app';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'OK', dataDir: DATA_DIR, usersFile: USERS_FILE, env: process.env.NODE_ENV }));

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// --- DB Helpers ---
const getData = (file) => {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([]));
      return [];
    }
    const content = fs.readFileSync(file, 'utf8');
    if (!content || content.trim() === '') {
      console.warn(`File ${file} is empty, resetting to []`);
      fs.writeFileSync(file, JSON.stringify([]));
      return [];
    }
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    if (err instanceof SyntaxError) {
      console.warn(`JSON syntax error in ${file}, resetting to []`);
      fs.writeFileSync(file, JSON.stringify([]));
      return [];
    }
    throw err;
  }
};
const saveData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    console.log("Signup attempt for:", email);
    const users = getData(USERS_FILE);
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Exists' });

    console.log("Hashing password...");
    // Using 4 rounds as a safe middle ground for Render free tier
    const hashedPassword = bcrypt.hashSync(password, 4); 
    console.log("Password hashed");

    const newUser = { id: Date.now(), email, password: hashedPassword, name, cms: { wordpress: null }, subscription: 'free' };
    users.push(newUser);
    
    console.log("Saving to:", USERS_FILE);
    saveData(USERS_FILE, users);
    console.log("Saved successfully");

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email, name, subscription: 'free' } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = getData(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email, name: user.name, cms: user.cms, subscription: user.subscription } });
});

// --- Stripe Routes ---
app.post('/api/stripe/create-checkout', authenticateToken, async (req, res) => {
  const { plan } = req.body;
  const prices = { starter: 4900, growth: 14900, scale: 29900 };
  const origin = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `AutoBlog Pro - ${plan.toUpperCase()} Plan` },
          unit_amount: prices[plan],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/dashboard?plan=${plan}`,
      cancel_url: `${origin}/dashboard?billing_cancel=true`,
      customer_email: req.user.email,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stripe/webhook-mock', authenticateToken, (req, res) => {
  const { plan } = req.body;
  const users = getData(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex !== -1) {
    users[userIndex].subscription = plan;
    console.log("Saving users to", USERS_FILE); try { saveData(USERS_FILE, users); console.log("Users saved"); } catch (e) { console.error("Save failed", e.message); throw e; }
  }
  res.json({ success: true, subscription: plan });
});

// --- AI & Content ---
app.post('/api/generate', authenticateToken, async (req, res) => {
  const { topic, niche, keywords } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Write a long SEO blog post about ${topic} in ${niche}. Keywords: ${keywords.join(', ')}. Markdown.`);
    res.json({ content: (await result.response).text() });
  } catch (e) { res.status(500).send('AI error'); }
});

app.post('/api/user/cms', authenticateToken, async (req, res) => {
  const { type, config } = req.body;
  const users = getData(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex !== -1) {
    users[userIndex].cms[type] = config;
    console.log("Saving users to", USERS_FILE); try { saveData(USERS_FILE, users); console.log("Users saved"); } catch (e) { console.error("Save failed", e.message); throw e; }
  }
  res.json({ success: true });
});

app.post('/api/schedule', authenticateToken, (req, res) => {
  const { title, content, scheduledTime, type } = req.body;
  const schedules = getData(SCHEDULES_FILE);
  schedules.push({ id: Date.now(), userId: req.user.id, title, content, scheduledTime, type, status: 'pending' });
  saveData(SCHEDULES_FILE, schedules);
  res.json({ success: true });
});

app.get('/api/schedules', authenticateToken, (req, res) => {
  const schedules = getData(SCHEDULES_FILE);
  res.json(schedules.filter(s => s.userId === req.user.id));
});

// --- Static Frontend (Production) ---
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// --- CMS Publishing Helpers ---
const publishToGhost = async (config, title, content) => {
  const [id, secret] = config.adminKey.split(':');
  const token = jwt.sign(
    {},
    Buffer.from(secret, 'hex'),
    {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '5m',
      audience: `/admin/`
    }
  );

  const url = `${config.url.replace(/\/$/, '')}/ghost/api/admin/posts/?source=html`;
  await axios.post(url, {
    posts: [{
      title,
      html: content,
      status: 'published'
    }]
  }, {
    headers: {
      Authorization: `Ghost ${token}`
    }
  });
};

const publishToWebflow = async (config, title, content) => {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const url = `https://api.webflow.com/v2/collections/${config.collectionId}/items`;
  await axios.post(url, {
    fieldData: {
      name: title,
      slug: slug,
      [config.contentField || 'post-body']: content
    }
  }, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'accept-version': '2.0.0'
    }
  });
};

// Cron
cron.schedule('* * * * *', async () => {
  const schedules = getData(SCHEDULES_FILE);
  const users = getData(USERS_FILE);
  const now = new Date();
  for (const s of schedules) {
    if (s.status === 'pending' && new Date(s.scheduledTime) <= now) {
      const user = users.find(u => u.id === s.userId);
      if (user && user.cms) {
        try {
          const type = s.type || 'wordpress';
          const config = user.cms[type];
          if (!config) throw new Error(`No config for ${type}`);

          if (type === 'wordpress') {
            const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
            await axios.post(`${config.url}/wp-json/wp/v2/posts`, { title: s.title, content: s.content, status: 'publish' }, { headers: { 'Authorization': `Basic ${auth}` } });
          } else if (type === 'ghost') {
            await publishToGhost(config, s.title, s.content);
          } else if (type === 'webflow') {
            await publishToWebflow(config, s.title, s.content);
          }
          s.status = 'published';
        } catch (e) { 
          console.error(`Failed to publish to ${s.type}:`, e.message);
          s.status = 'failed'; 
        }
      } else { s.status = 'failed'; }
    }
  }
  saveData(SCHEDULES_FILE, schedules);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend live on port ${PORT}. Env: ${process.env.NODE_ENV}`));

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).send("Internal Server Error");
});
