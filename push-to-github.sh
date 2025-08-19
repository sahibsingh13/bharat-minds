#!/bin/bash

echo "🚀 Bharat Minds - Push to GitHub"
echo "================================"
echo ""

echo "📋 Current Status:"
git status --short
echo ""

echo "🔧 Setting up remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/sahibsingh13/bharat-minds.git

echo "📤 Attempting to push..."
echo ""

# Try to push
if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Bharat Minds has been pushed to GitHub!"
    echo "🌐 Repository: https://github.com/sahibsingh13/bharat-minds"
    echo ""
    echo "🎨 What's included:"
    echo "   • Indian-inspired saffron and deep blue color scheme"
    echo "   • Multi-model AI chat interface"
    echo "   • Beautiful, culturally-inspired design"
    echo "   • Complete transformation from Open-Fiesta"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Visit your repository on GitHub"
    echo "   2. Add topics: ai, chat, nextjs, typescript, indian-design"
    echo "   3. Share with others!"
else
    echo ""
    echo "❌ Push failed. This usually means you need to authenticate."
    echo ""
    echo "🔐 To authenticate, you have a few options:"
    echo ""
    echo "Option 1: Use GitHub CLI (Recommended)"
    echo "   gh auth login"
    echo "   Then run this script again"
    echo ""
    echo "Option 2: Use Personal Access Token"
    echo "   git remote set-url origin https://YOUR_TOKEN@github.com/sahibsingh13/bharat-minds.git"
    echo "   Then run this script again"
    echo ""
    echo "Option 3: Manual push"
    echo "   git push -u origin main"
    echo "   (GitHub will prompt for credentials)"
    echo ""
    echo "💡 Need help? Check the SETUP_INSTRUCTIONS.md file for detailed steps."
fi