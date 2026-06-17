# Deployment Instructions for AutoBlog Pro

This repository is configured for deployment on **Render** (Backend) and **Vercel** (Frontend).

## 1. Backend Deployment (Render)

1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd server && npm install`
   - **Start Command**: `node server/index.js`
4. Add the following **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `STRIPE_SECRET_KEY`: Your Stripe Secret Key (sk_test_...).
   - `JWT_SECRET`: A long random string for JWT signing.
   - `PORT`: `5001`
   - `FRONTEND_URL`: The URL of your Vercel deployment (e.g., `https://autoblog-pro.vercel.app`).
   - `DATA_DIR`: `/opt/render/project/src/server/data` (Optional: Use a Render Blueprints with a Disk for persistence).

## 2. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Vercel should automatically detect the Vite project.
3. Add the following **Environment Variable**:
   - `VITE_API_BASE`: `https://your-backend-url.onrender.com/api`
4. Deploy!

## Persistence Note

The current backend uses JSON files for storage. On Render's free tier, these files are transient. For production use, it is recommended to:
1. Attach a **Render Disk** to the backend service.
2. Set `DATA_DIR` to the mount path of the disk.
3. Or, migrate to a database like MongoDB or PostgreSQL.

## Security Note

The CORS policy has been updated to only allow the `FRONTEND_URL`. Ensure this variable is set correctly in the Render dashboard.
