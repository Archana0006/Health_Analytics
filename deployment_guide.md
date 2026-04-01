# Health Analytics - Production Deployment Guide

This guide provides the exact steps required to deploy the **Digital Health Analytics** platform (Frontend to Vercel and Backend to Render).

## 1. Environment Variables Configuration

You must define environment variables for both the **Frontend** and **Backend** to ensure they communicate properly in production.

### ✅ Backend (Node.js on Render)
Render requires these environment variables. You will input these directly into the Render Dashboard during setup.
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/health-analytics?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://health-analytics-frontend.vercel.app  # Replace with actual Vercel URL
```

### ✅ Frontend (Vite/React on Vercel)
Vercel requires the API URL to be injected during the build phase. Create a `.env` file locally or add this to your Vercel project settings:
```env
VITE_API_URL=https://health-analytics-backend.onrender.com  # Replace with actual Render URL
```
*(Note: Ensure your frontend codebase actively uses `import.meta.env.VITE_API_URL` instead of hardcoded `http://localhost:5000` strings before deploying).*

---

## 2. Infrastructure Checks

- **Vercel Config (`frontend/vercel.json`)**: Verified. The SPA routing config correctly redirects `/(.*)` to `/index.html`.
- **Render Config (`backend/render.yaml`)**: Verified. Build commands (`npm install`) and start commands (`node server.js`) are configured to listen to `PORT=5000`.
- **MongoDB Atlas**: Ensure your Atlas cluster's Network Access (IP Whitelist) is set to `0.0.0.0/0` (Allow access from anywhere) so that Render can connect to your database dynamically.

---

## 3. Step-by-Step Deployment

### Deploying the Backend (Render)
1. Push your entire project code to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Name your service (e.g., `health-analytics-backend`).
6. Set the **Environment** to `Node`.
7. Expand the **Advanced** section and add the Environment Variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`) explicitly.
8. Click **Create Web Service**. Wait 3-5 minutes for the build to finish.
9. *Copy the final output URL (e.g., `https://health-analytics-backend.onrender.com`).*

### Deploying the Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the Configuration screen, set the **Root Directory** to `frontend`.
4. The Framework Preset should automatically detect **Vite**.
5. Open the **Environment Variables** tab and add:
   - Name: `VITE_API_URL`
   - Value: *The URL you just copied from Render* (e.g., `https://health-analytics-backend.onrender.com`)
6. Click **Deploy**. Wait 1-2 minutes for the build process.
7. *Copy the final output URL (e.g., `https://health-analytics-frontend.vercel.app`).*

---

## 4. Final Verification
- Return to your **Render Backend Dashboard** and update the `FRONTEND_URL` environment variable to exactly match the Vercel URL you just obtained. This ensures CORS policies will accept the traffic.
- Open your Vercel URL in a browser. Attempt to log in to verify Database connectivity.
- Try creating an Appointment. Toast notifications should successfully confirm the API transaction.

**Congratulations! Your Health Analytics application is now LIVE.**
