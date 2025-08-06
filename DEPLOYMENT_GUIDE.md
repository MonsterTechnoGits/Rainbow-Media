# 🚀 RainbowMedia - Deployment Guide

## Quick Setup for GitHub Pages

### 1. Repository Setup

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/Rainbow-Media.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository **Settings**
   - Scroll to **Pages** section
   - Source: **GitHub Actions**

### 2. Environment Variables Setup

Add these secrets in **GitHub Settings → Secrets and variables → Actions**:

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
   - Add your domain to authorized domains
3. **Create Firestore Database**:
   - Go to **Firestore Database**
   - Create in production mode
   - Upload `firestore.rules` for security

### 4. Razorpay Configuration

1. **Create Razorpay Account**: [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Get API Keys**:
   - Go to **Settings → API Keys**
   - Use **test keys** for development
   - Use **live keys** for production
3. **Configure Webhooks** (optional):
   - Add your domain for payment confirmations

### 5. Update Repository Name

In `next.config.js`, update the basePath:

```javascript
basePath: process.env.NODE_ENV === 'production' ? '/YourRepoName' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '/YourRepoName/' : '',
```

### 6. Deploy

Push any changes to main branch - GitHub Actions will automatically deploy!

```bash
git push origin main
```

Your site will be available at: `https://yourusername.github.io/Rainbow-Media/`

## Local Development

1. **Clone & Setup**:
   ```bash
   git clone https://github.com/yourusername/Rainbow-Media.git
   cd Rainbow-Media
   ./setup.sh
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
- Try the test page: `/test-payment`
- Ensure Razorpay domain is whitelisted

### Authentication Issues
- Verify Firebase configuration
- Check authorized domains in Firebase console
- Ensure CORS settings allow your domain

### Deployment Issues
- Verify all GitHub secrets are set
- Check Actions tab for build logs
- Ensure repository name matches basePath in config

## Production Checklist

- [ ] Firebase project configured
- [ ] Razorpay account set up
- [ ] All environment variables added to GitHub
- [ ] Repository name updated in next.config.js
- [ ] GitHub Pages enabled
- [ ] Domain configured (if custom domain)
- [ ] Security rules updated
- [ ] Payment testing completed

## Support

For issues or questions:
1. Check the [Issues](https://github.com/yourusername/Rainbow-Media/issues) tab
2. Review the README.md
3. Check GitHub Actions logs
4. Verify all environment variables

---

🎵 **Happy Music Streaming!** 🎵