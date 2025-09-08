# Deploy to Netlify - Step by Step Guide

## Option 1: Deploy via Netlify Dashboard (Recommended)

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub/GitLab/Bitbucket
2. Ensure your `build` folder is in `.gitignore` (it should be)

### Step 2: Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"
4. Choose your Git provider (GitHub)
5. Select your `booking4u` repository
6. Choose the `frontend` folder as the base directory

### Step 3: Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Node version**: `18`

### Step 4: Set Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```
REACT_APP_API_URL=https://booking4u-backend.onrender.com/api
REACT_APP_BASE_URL=https://booking4u-backend.onrender.com
REACT_APP_SOCKET_URL=https://booking4u-backend.onrender.com
REACT_APP_NODE_ENV=production
```

### Step 5: Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

## Option 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```

### Step 3: Deploy
```bash
netlify deploy --prod --dir=build
```

## Option 3: Drag and Drop (Quick Test)

1. Go to [netlify.com](https://netlify.com)
2. Drag your `build` folder to the deploy area
3. Your site will be live immediately!

## After Deployment

1. **Test your site**: Visit the provided URL
2. **Check console**: Open browser dev tools for any errors
3. **Test functionality**: Try logging in, browsing services, etc.
4. **Custom domain**: Add your own domain in Netlify settings

## Troubleshooting

- **Build fails**: Check the build logs in Netlify dashboard
- **API errors**: Verify environment variables are set correctly
- **CORS errors**: Ensure backend CORS is configured for your domain
- **Images not loading**: Check that image URLs are correct

## Next Steps

1. Set up a custom domain (optional)
2. Configure SSL certificate (automatic with Netlify)
3. Set up form handling if needed
4. Configure redirects for SPA routing

