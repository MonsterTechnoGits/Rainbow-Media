# 🚀 RainbowMedia - Deployment Guide

## Quick Setup for Vercel

### 1. Repository Setup

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/Rainbow-Media.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click **"New Project"**
   - Import your Rainbow-Media repository

### 2. Environment Variables Setup

Add these environment variables in **Vercel Dashboard → Project → Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

### 3. Firebase Configuration

1. **Create Firebase Project**: [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Authentication**:
   - Go to **Authentication → Sign-in method**
   - Enable **Google** provider
   - Add your Vercel domain to authorized domains (e.g., `your-app.vercel.app`)
3. **Create Firestore Database**:
   - Go to **Firestore Database**
   - Create in production mode
   - Set up security rules

### 4. Razorpay Configuration

1. **Create Razorpay Account**: [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Get API Keys**:
   - Go to **Settings → API Keys**
   - Use **test keys** for development
   - Use **live keys** for production
3. **Configure Webhooks** (optional):
   - Add your Vercel domain for payment confirmations

### 5. Deploy

1. **Automatic Deployment**: 
   - Vercel automatically deploys on every push to main branch
   - No additional configuration needed!

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

Your site will be available at: `https://your-project-name.vercel.app/`

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `.next`

### Railway

1. Connect to Railway using GitHub
2. Add environment variables
3. Railway will auto-deploy on push

### Self-hosted

```bash
# Build the application
npm run build

# Start production server
npm start
```

Deploy to any VPS or cloud provider that supports Node.js.

## Local Development

1. **Clone & Setup**:
   ```bash
   git clone https://github.com/yourusername/Rainbow-Media.git
   cd Rainbow-Media
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Payment Issues
- Use **test keys** in development
- Check browser console for errors
- Ensure Razorpay domain is whitelisted for your Vercel domain

### Authentication Issues
- Verify Firebase configuration
- Check authorized domains in Firebase console (add your Vercel domain)
- Ensure CORS settings allow your domain

### Deployment Issues
- Verify all environment variables are set in Vercel
- Check deployment logs in Vercel dashboard
- Ensure Firebase and Razorpay are configured for your domain

### Domain Configuration
- Add your custom domain in Vercel project settings
- Update Firebase authorized domains
- Update Razorpay webhook URLs if using custom domain

## Production Checklist

- [ ] Firebase project configured
- [ ] Razorpay account set up
- [ ] All environment variables added to Vercel
- [ ] Vercel project connected to GitHub
- [ ] Firebase authorized domains updated
- [ ] Payment testing completed
- [ ] Custom domain configured (if applicable)
- [ ] Security rules updated

## Environment Variables Reference

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Razorpay Dashboard → Settings → API Keys |

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check Firebase and Razorpay configurations
4. Review browser console for errors

---

🎵 **Happy Music Streaming on Vercel!** 🎵