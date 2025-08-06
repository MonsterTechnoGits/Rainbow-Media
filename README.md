# RainbowMedia 🎵

A modern music streaming platform built with Next.js, Firebase, and Razorpay payment integration.

## Features

- 🎵 **Music Streaming**: Play your favorite tracks with a modern audio player
- 🔐 **Authentication**: Google Sign-in with Firebase Auth
- 💳 **Payments**: Secure payment processing with Razorpay
- 🎨 **Modern UI**: Beautiful Material-UI design with responsive layout
- 📱 **Mobile Friendly**: Works seamlessly on all devices

## Live Demo

🚀 **[View Live Demo](https://yourusername.github.io/Rainbow-Media/)**

## Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/Rainbow-Media.git
cd Rainbow-Media
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration (Get from Razorpay Dashboard)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### GitHub Pages (Automatic)

1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Add secrets** in GitHub repository settings (Settings → Secrets and variables → Actions):

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

4. **Push to main branch** - GitHub Actions will automatically deploy!

### Manual Deployment

```bash
npm run build
npm run export
```

Deploy the `out` folder to any static hosting service.

## Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication → Google provider
3. Create Firestore database
4. Get your config from Project Settings

### Razorpay Setup

1. Create account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get API keys from Settings → API Keys
3. Use test keys for development, live keys for production

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: Material-UI (MUI)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Payments**: Razorpay
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Emotion

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── contexts/           # React contexts (Auth, Music Player)
├── lib/                # Firebase configuration
├── pages/              # Pages and API routes
├── types/              # TypeScript type definitions
└── theme/              # MUI theme configuration
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run export       # Export static files
npm run lint         # Run ESLint
npm run prettier     # Format code
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help setting up the project, feel free to open an issue!

---

Made with ❤️ by [Your Name](https://github.com/yourusername)