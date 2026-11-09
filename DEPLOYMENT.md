# 🌐 SpendIQ Production Deployment Guide

This guide walks you through deploying **SpendIQ** to production across:
- **Database**: MongoDB Atlas
- **Backend API**: Render (or Railway / Fly.io)
- **Frontend App**: Vercel (or Netlify)

---

## 1. 🗄️ Database: MongoDB Atlas Setup

1. **Create an Account / Log In**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. **Create a Free Shared Cluster**:
   - Select **M0 Free Tier**, choose the cloud provider (AWS/GCP), and choose a region close to your users (e.g. `ap-south-1` Mumbai).
3. **Database User Authentication**:
   - Navigate to **Security $\to$ Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `spendiq_admin`
   - Password: `<Generate a strong password>`
   - Database User Privileges: `Read and write to any database`.
4. **Network Access / Whitelist**:
   - Navigate to **Security $\to$ Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) so that hosting providers like Render can connect.
5. **Get Connection String**:
   - Go to **Databases $\to$ Clusters $\to$ Connect**.
   - Select **Drivers** (Node.js).
   - Copy connection string:
     ```text
     mongodb+srv://spendiq_admin:<password>@cluster0.xxxxx.mongodb.net/spendiq?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify the database name `/spendiq`.

---

## 2. 🖥️ Backend: Deploying on Render

1. Sign up / log in to [Render](https://render.com).
2. Click **New +** $\to$ **Web Service**.
3. Connect your GitHub repository containing `SpendIQ`.
4. Configure the Web Service:
   - **Name**: `spendiq-api`
   - **Region**: Closest to your MongoDB Atlas cluster (e.g., Singapore or Frankfurt).
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. **Add Environment Variables**:
   Under **Environment Variables**, add the following keys:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | `mongodb+srv://spendiq_admin:<password>@cluster0.xxxxx.mongodb.net/spendiq?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `<Generate a 32+ character random string>` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://spendiq-client.vercel.app` *(update once frontend is deployed)* |
6. Click **Create Web Service**.
7. Once deployed, note down your Render public API URL:
   ```text
   https://spendiq-api.onrender.com
   ```
8. Verify it by visiting:
   ```text
   https://spendiq-api.onrender.com/api/health
   ```
   You should see `{ "status": "healthy", "service": "SpendIQ API" }`.

---

## 3. ⚡ Frontend: Deploying on Vercel

1. Sign up / log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\to$ **Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://spendiq-api.onrender.com/api` |
6. **Vercel SPA Rewrites Configuration**:
   Create a `vercel.json` in `/client` (or root) to handle client-side routing on hard refreshes:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
7. Click **Deploy**.
8. Once complete, copy your Vercel deployment URL (e.g., `https://spendiq-client.vercel.app`).
9. **Final CORS step**: Go back to your Render backend service, update `CLIENT_URL` to your Vercel URL, and trigger a redeploy so requests are fully authorized.

---

## 4. 🔀 Alternative: Deploying Frontend on Netlify

1. In Netlify, click **Add new site** $\to$ **Import an existing project**.
2. Select your repository.
3. Configure settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Set Environment Variable:
   - `VITE_API_URL` = `https://spendiq-api.onrender.com/api`
5. Add `_redirects` file in `client/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
6. Deploy site.
