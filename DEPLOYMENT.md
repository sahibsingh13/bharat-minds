# 🚀 Deployment Guide - Bharat Minds

## Netlify Deployment

### Automatic Deployment (Recommended)

1. **Connect to GitHub**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your `bharat-minds` repository

2. **Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (or leave empty for automatic detection)
   - **Node version**: 18 (or higher)

3. **Environment Variables** (Optional)
   - Add any API keys you want to use:
     - `NEXT_PUBLIC_HUGGINGFACE_API_KEY`
     - `OPENROUTER_API_KEY`
     - `GOOGLE_GENERATIVE_AI_API_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Manual Deployment

If you prefer manual deployment:

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## Vercel Deployment (Alternative)

1. **Connect to GitHub**
   - Go to [Vercel](https://vercel.com)
   - Import your `bharat-minds` repository

2. **Automatic Detection**
   - Vercel will automatically detect it's a Next.js project
   - No additional configuration needed

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Environment Variables

For full functionality, add these environment variables:

```bash
# Optional: For OpenRouter models
OPENROUTER_API_KEY=your_openrouter_key

# Optional: For Gemini models
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## Troubleshooting

### Common Issues:

1. **Build fails with "publish directory not found"**
   - Solution: Use `.next` as publish directory
   - Or let Netlify auto-detect

2. **API routes not working**
   - Solution: Use Vercel instead of Netlify for better Next.js support

3. **Environment variables not working**
   - Solution: Add them in your deployment platform's settings

### Support:

- **Netlify**: Check the `netlify.toml` file for configuration
- **Vercel**: Usually works out of the box with Next.js
- **GitHub Pages**: Not recommended for Next.js apps with API routes

---

**Your Bharat Minds project is ready for deployment! 🎉**