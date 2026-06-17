# AutoBlog Pro 🚀

The all-in-one AI automation engine for niche site owners.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, Google Gemini 1.5 Flash
- **Database:** JSON-based persistent storage (for easy migration to SQL/NoSQL)
- **Payments:** Stripe-ready infrastructure
- **Automation:** Built-in scheduler using `node-cron`

## Features
1. **User Auth:** Secure signup/login with JWT and bcrypt.
2. **AI Engine:** Generates high-quality Markdown blog posts based on niche and keywords.
3. **CMS Bridge:** One-click publishing to WordPress via REST API.
4. **Scheduler:** Queue posts to be published automatically at any future date/time.
5. **Subscription Plans:** Pre-built tiers (Starter, Growth, Scale).

## 🚀 Deployment Instructions

AutoBlog Pro is now configured for a unified deployment (Backend serving Frontend).

### **Single-Service Deployment (Recommended)**
1.  **Connect GitHub:** Push this code to a GitHub repository.
2.  **Create a New Web Service:** (e.g., on **Render**, **Railway**, or **Fly.io**).
3.  **Build Command:** `npm run build`
4.  **Start Command:** `npm start`
5.  **Environment Variables:**
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `STRIPE_SECRET_KEY`: Your Stripe Secret Key.
    *   `JWT_SECRET`: A random secure string for tokens.
    *   `FRONTEND_URL`: The URL of your deployed app (e.g. `https://autoblog-pro.onrender.com`).
    *   `VITE_API_BASE`: `/api` (since the server is serving the frontend).

### **Data Persistence**
Since this version uses a file-based JSON database (`lowdb` style), data will be lost on service restarts on stateless platforms (like Render Free Tier). 
- **Solution:** Add a persistent disk volume to your service or connect a **MongoDB/PostgreSQL** database and update the `getData/saveData` helpers in `server/index.js`.

## Marketing Launch Strategy
1. **Beta Phase:** Invite 10 niche site owners to use the "Growth" plan for free in exchange for testimonials.
2. **SEO Dominance:** Use AutoBlog Pro to build our own authority blog at `autoblog.pro/blog`.
3. **Outreach:** DM SEO agency owners on Twitter/X with a video of the 1-click WordPress publish.
