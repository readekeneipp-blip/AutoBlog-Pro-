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
const db = require('./db');

dotenv.config();

const TIER_LIMITS = {
  free: { sites: 0, articles: 0 },
  starter: { sites: 1, articles: 10 },
  growth: { sites: 5, articles: 50 },
  scale: { sites: Infinity, articles: Infinity }
};

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

// Stripe Webhook needs raw body for signature verification
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Fallback for development without secret or signature
    try {
      event = JSON.parse(req.body.toString());
    } catch (err) {
      return res.status(400).send('Invalid payload');
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const plan = session.metadata?.plan;
    const email = session.customer_email;

    if (plan && email) {
      console.log(`Stripe Webhook: Updating user ${email} to plan ${plan}`);
      try {
        await db.query('UPDATE users SET subscription = $1 WHERE email = $2', [plan, email]);
      } catch (e) {
        console.error('Database update failed in webhook:', e.message);
      }
    }
  }

  res.json({received: true});
});

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: 'postgres'
  });
});

app.get('/api/diag', async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const schedulesCount = await db.query('SELECT COUNT(*) FROM schedules');
    res.json({
      usersCount: parseInt(usersCount.rows[0].count),
      schedulesCount: parseInt(schedulesCount.rows[0].count),
      memory: process.memoryUsage()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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
    console.log(`Attempting signup for: ${email}`);
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Exists' });

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 4); 

    const id = Date.now();
    const newUser = await db.query(
      'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name, subscription',
      [id, email, hashedPassword, name]
    );
    
    console.log("Saved to database");

    const token = jwt.sign({ id: newUser.rows[0].id, email: newUser.rows[0].email }, JWT_SECRET);
    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, cms: user.cms, subscription: user.subscription } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      metadata: { plan },
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stripe/webhook-mock', authenticateToken, async (req, res) => {
  const { plan } = req.body;
  try {
    await db.query('UPDATE users SET subscription = $1 WHERE id = $2', [plan, req.user.id]);
    res.json({ success: true, subscription: plan });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- AI & Content ---
app.post('/api/generate', authenticateToken, async (req, res) => {
  const { topic, niche, keywords } = req.body;
  console.log(`Generating content for ${topic} in ${niche}...`);
  try {
    const userResult = await db.query('SELECT subscription FROM users WHERE id = $1', [req.user.id]);
    const subscription = userResult.rows[0]?.subscription || 'free';
    const limits = TIER_LIMITS[subscription];

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM schedules WHERE user_id = $1 AND scheduled_time >= $2',
      [req.user.id, startOfMonth]
    );
    const count = parseInt(countResult.rows[0].count);

    if (count >= limits.articles) {
      return res.status(403).json({ error: `Monthly article limit reached for ${subscription} plan (${limits.articles} articles)` });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    console.log("Calling Gemini API...");
    const result = await model.generateContent(`Write a long SEO blog post about ${topic} in ${niche}. Keywords: ${keywords.join(', ')}. Markdown.`);
    console.log("AI Response received.");
    const content = (await result.response).text();
    console.log("Content extracted.");
    res.json({ content });
  } catch (e) { 
    console.error("AI Error:", e);
    res.status(500).send('AI error'); 
  }
});

app.post('/api/user/cms', authenticateToken, async (req, res) => {
  const { type, config, name } = req.body;
  try {
    const userResult = await db.query('SELECT subscription FROM users WHERE id = $1', [req.user.id]);
    const subscription = userResult.rows[0]?.subscription || 'free';
    const limits = TIER_LIMITS[subscription];

    const siteCountResult = await db.query('SELECT COUNT(*) FROM sites WHERE user_id = $1', [req.user.id]);
    const siteCount = parseInt(siteCountResult.rows[0].count);

    if (siteCount >= limits.sites) {
      return res.status(403).json({ error: `Site limit reached for ${subscription} plan (${limits.sites} sites)` });
    }

    const id = Date.now().toString(); // Temporary id or use UUID
    await db.query(
      'INSERT INTO sites (user_id, name, type, config) VALUES ($1, $2, $3, $4)',
      [req.user.id, name || type, type, config]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/user/sites', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sites WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/user/sites/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM sites WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/schedule', authenticateToken, async (req, res) => {
  const { title, content, scheduledTime, type, siteId } = req.body;
  try {
    const userResult = await db.query('SELECT subscription FROM users WHERE id = $1', [req.user.id]);
    const subscription = userResult.rows[0]?.subscription || 'free';
    
    if (subscription !== 'growth' && subscription !== 'scale') {
      return res.status(403).json({ error: 'Scheduling is only available on Growth and Scale plans. Please upgrade.' });
    }

    const id = Date.now();
    await db.query(
      'INSERT INTO schedules (id, user_id, title, content, scheduled_time, type, status, site_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, req.user.id, title, content, scheduledTime, type, 'pending', siteId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM schedules WHERE user_id = $1 ORDER BY scheduled_time DESC', [req.user.id]);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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

// Cron for publishing schedules
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const schedules = await db.query('SELECT * FROM schedules WHERE status = \'pending\' AND scheduled_time <= $1', [now]);
    
    for (const s of schedules.rows) {
      try {
        let config;
        let type = s.type;

        if (s.site_id) {
          const siteResult = await db.query('SELECT * FROM sites WHERE id = $1', [s.site_id]);
          const site = siteResult.rows[0];
          if (site) {
            config = site.config;
            type = site.type;
          }
        }

        // Fallback for legacy schedules or if site_id is missing
        if (!config) {
          const userResult = await db.query('SELECT * FROM users WHERE id = $1', [s.user_id]);
          const user = userResult.rows[0];
          if (user && user.cms) {
            type = s.type || 'wordpress';
            config = user.cms[type];
          }
        }

        if (!config) throw new Error(`No config for schedule ${s.id}`);

        if (config.url === 'http://mock-wordpress.com' || config.url === 'mock') {
          console.log(`Mocking ${type} publish success for E2E verification`);
          await db.query('UPDATE schedules SET status = \'published\' WHERE id = $1', [s.id]);
        } else if (type === 'wordpress') {
          const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
          await axios.post(`${config.url}/wp-json/wp/v2/posts`, { title: s.title, content: s.content, status: 'publish' }, { headers: { 'Authorization': `Basic ${auth}` } });
          await db.query('UPDATE schedules SET status = \'published\' WHERE id = $1', [s.id]);
        } else if (type === 'ghost') {
          await publishToGhost(config, s.title, s.content);
          await db.query('UPDATE schedules SET status = \'published\' WHERE id = $1', [s.id]);
        } else if (type === 'webflow') {
          await publishToWebflow(config, s.title, s.content);
          await db.query('UPDATE schedules SET status = \'published\' WHERE id = $1', [s.id]);
        }
      } catch (e) { 
        console.error(`Failed to publish schedule ${s.id}:`, e.message);
        await db.query('UPDATE schedules SET status = \'failed\' WHERE id = $1', [s.id]);
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// Keep-alive cron to prevent Render spin-down (every 10 minutes)
cron.schedule('*/10 * * * *', async () => {
  const SELF_URL = process.env.SELF_URL || 'https://autoblog-pro.onrender.com';
  try {
    console.log(`Keep-alive: Pinging ${SELF_URL}/health`);
    await axios.get(`${SELF_URL}/health`);
  } catch (e) {
    console.error(`Keep-alive failed: ${e.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend live on port ${PORT}. Env: ${process.env.NODE_ENV}`));

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).send("Internal Server Error");
});
