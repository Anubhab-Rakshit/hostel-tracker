# 🚀 Deployment Guide (Beginner Friendly)

Since your app uses special features like the **ID Card Scanner** (which needs Python & OCR tools), you cannot use standard hosting like Vercel or Netlify directly. You must use **Docker**.

Don't worry! I have already created a `Dockerfile` that packages everything your app needs. You just need to choose a hosting provider that understands Docker.

## Option 1: Railway (Recommended - Easiest) 🚂

Railway is fantastic because it automatically detects the `Dockerfile` and builds it without you needing to run any commands.

1.  **Sign Up**: Go to [railway.app](https://railway.app/) and sign up with GitHub.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repo**: Choose your `hostel_issue_tracker` repository.
4.  **Variables**: Add your environment variables (copy them from your `.env.local`):
    *   `MONGODB_URI`
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL` (Set this to the domain Railway gives you, e.g., `https://hostel-app.up.railway.app`)
5.  **Deploy**: Railway will see the `Dockerfile` and start building. It might take 3-5 minutes.
6.  **Done!**: Your app is live with OCR working perfectly.

## Option 2: Render (Free Tier Available) ☁️

1.  **Sign Up**: Go to [render.com](https://render.com/).
2.  **New Web Service**: Click "New +" -> "Web Service".
3.  **Connect GitHub**: Select your repository.
4.  **Settings**:
    *   **Runtime**: Select **Docker** (This is crucial!).
    *   **Region**: Singapore (or nearest to you).
    *   **Instance Type**: Free (might be slow) or Starter ($7/mo).
5.  **Environment Variables**: Add your `MONGODB_URI`, `NEXTAUTH_SECRET`, etc.
6.  **Create Web Service**: Click Create.

## 📱 Mobile "App" Experience (PWA)

Your app is now a **Progressive Web App (PWA)**! This means users can install it on their phones without an app store.

**Instructions for Users:**
1.  Open your deployed website on their phone (Chrome/Safari).
2.  **iOS (iPhone)**: Tap the "Share" button -> Scroll down -> Tap "**Add to Home Screen**".
3.  **Android**: Tap the "Three Dots" menu -> Tap "**Install App**" or "Add to Home Screen".

The app will appear on their home screen like a native app, launch in full screen, and hide the browser bar! 📲
