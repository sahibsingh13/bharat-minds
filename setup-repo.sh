#!/bin/bash

# Bharat Minds Repository Setup Script
echo "🚀 Bharat Minds Repository Setup"
echo "=================================="

# Check if username is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username as an argument"
    echo "Usage: ./setup-repo.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./setup-repo.sh john-doe"
    exit 1
fi

USERNAME=$1
REPO_NAME="bharat-minds"
REPO_URL="https://github.com/$USERNAME/$REPO_NAME.git"

echo "📋 Repository Details:"
echo "   Username: $USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: $REPO_URL"
echo ""

echo "🔧 Setting up remote origin..."
git remote add origin $REPO_URL

echo "📤 Pushing to main branch..."
git push -u origin main

echo ""
echo "✅ Setup complete!"
echo "🌐 Your repository is now available at: $REPO_URL"
echo ""
echo "🎨 Bharat Minds features:"
echo "   • Indian-inspired saffron and deep blue color scheme"
echo "   • Multi-model AI chat interface"
echo "   • Beautiful, culturally-inspired design"
echo ""
echo "🚀 Next steps:"
echo "   1. Visit your repository on GitHub"
echo "   2. Add a description and topics"
echo "   3. Share with others!"