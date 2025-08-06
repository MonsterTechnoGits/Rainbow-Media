#!/bin/bash

echo "🎵 RainbowMedia Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  Environment file not found!"
    echo "📄 Copying .env.example to .env.local"
    cp .env.example .env.local
    echo ""
    echo "🔧 Please edit .env.local with your Firebase and Razorpay credentials:"
    echo "   - Firebase: https://console.firebase.google.com"
    echo "   - Razorpay: https://dashboard.razorpay.com"
    echo ""
    echo "📝 Required environment variables:"
    echo "   NEXT_PUBLIC_FIREBASE_API_KEY"
    echo "   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    echo "   NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    echo "   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    echo "   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    echo "   NEXT_PUBLIC_FIREBASE_APP_ID"
    echo "   NEXT_PUBLIC_RAZORPAY_KEY_ID"
    echo "   RAZORPAY_KEY_SECRET"
else
    echo "✅ Environment file (.env.local) already exists"
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo "   1. Edit .env.local with your credentials (if not done already)"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "📚 For deployment to GitHub Pages, see README.md"
echo ""