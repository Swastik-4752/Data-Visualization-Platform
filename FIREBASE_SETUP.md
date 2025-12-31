# Firebase Setup Guide

## Fixing "auth/unauthorized-domain" Error

When you deploy your website and try to use Google authentication, you may see this error:
```
Firebase: Error (auth/unauthorized-domain)
```

This happens because Firebase needs to know which domains are allowed to use authentication.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `omkar-b1a87`

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on the **Settings** tab (gear icon)
   - Scroll down to **Authorized domains**

3. **Add Your Domain**
   - Click **Add domain**
   - Enter your deployed domain (e.g., `your-app.vercel.app` or your custom domain)
   - Click **Add**

4. **Common Domains to Add:**
   - `your-app.vercel.app` (Vercel deployment URL)
   - `your-app.netlify.app` (if using Netlify)
   - `your-custom-domain.com` (your custom domain)
   - `localhost` (usually already added for local development)

### Important Notes:

- **Local development** (`localhost`) is usually authorized by default
- **Each domain** must be added separately
- Changes may take a few minutes to propagate
- You can add multiple domains (development, staging, production)

### Example:

If your Vercel deployment URL is `data-visualization-platform.vercel.app`, add:
- `data-visualization-platform.vercel.app`
- If you have a custom domain like `mydataapp.com`, add that too

## Enable Google Sign-In Provider

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. **Enable** it
4. Add your **Project support email**
5. Click **Save**

## Firestore Security Rules

See `FIRESTORE_RULES.md` for setting up Firestore security rules.

