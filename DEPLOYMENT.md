# 🚀 Deployment Guide for Render

This guide will help you deploy your Booking4U application to Render.

## 📋 Prerequisites

- GitHub account
- Render account
- Your code pushed to GitHub repository

## 🔧 Step-by-Step Deployment

### 1. Prepare Your GitHub Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Make sure your repository is public** (required for free Render plan)

### 2. Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the backend service:**

   **Basic Settings:**
   - **Name**: `booking4u-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGIN=https://booking4u-frontend.onrender.com
   ENABLE_SWAGGER=false
   ENABLE_LOGGING=true
   ```

5. **Click "Create Web Service"**

### 3. Create MongoDB Database

1. **In Render Dashboard**, click **"New +"** → **"PostgreSQL"** (or MongoDB if available)
2. **Configure database:**
   - **Name**: `booking4u-db`
   - **Database**: `booking4u`
   - **User**: `booking4u_user`
3. **Copy the connection string** and add it to your backend environment variables:
   ```
   MONGODB_URI=mongodb://username:password@host:port/database
   ```

### 4. Deploy Frontend to Render

1. **Click "New +"** → **"Static Site"**
2. **Connect your GitHub repository**
3. **Configure the frontend service:**

   **Basic Settings:**
   - **Name**: `booking4u-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

   **Environment Variables:**
   ```
   REACT_APP_API_URL=https://booking4u-backend.onrender.com/api
   ```

4. **Click "Create Static Site"**

### 5. Update Backend CORS Settings

1. **Go to your backend service settings**
2. **Update environment variables:**
   ```
   CORS_ORIGIN=https://booking4u-frontend.onrender.com
   ```

### 6. Test Your Deployment

1. **Backend API**: `https://booking4u-backend.onrender.com/api/health`
2. **Frontend**: `https://booking4u-frontend.onrender.com`
3. **API Documentation**: `https://booking4u-backend.onrender.com/api-docs`

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check if all dependencies are in `package.json`
   - Verify build commands are correct
   - Check for any missing environment variables

2. **Database Connection Issues:**
   - Verify MongoDB URI is correct
   - Check if database is accessible from Render
   - Ensure database user has proper permissions

3. **CORS Errors:**
   - Update CORS_ORIGIN to match your frontend URL
   - Check if backend is running on correct port

4. **Frontend Can't Connect to Backend:**
   - Verify REACT_APP_API_URL is set correctly
   - Check if backend service is running
   - Ensure API endpoints are accessible

### Environment Variables Checklist:

**Backend:**
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`
- ✅ `MONGODB_URI=mongodb://...`
- ✅ `JWT_SECRET=your-secret-key`
- ✅ `CORS_ORIGIN=https://booking4u-frontend.onrender.com`

**Frontend:**
- ✅ `REACT_APP_API_URL=https://booking4u-backend.onrender.com/api`

## 📊 Monitoring

1. **Check service logs** in Render dashboard
2. **Monitor service health** and uptime
3. **Set up alerts** for service downtime
4. **Monitor database performance**

## 🔄 Updates and Maintenance

1. **To update your application:**
   - Push changes to GitHub
   - Render will automatically redeploy

2. **To update environment variables:**
   - Go to service settings
   - Update variables
   - Redeploy service

3. **Database backups:**
   - Set up automatic backups in Render
   - Export data regularly

## 💰 Cost Considerations

- **Free Plan Limitations:**
  - Services sleep after 15 minutes of inactivity
  - Limited build minutes per month
  - No custom domains on free plan

- **Upgrade Options:**
  - Starter plan: $7/month per service
  - Professional plan: $25/month per service

## 🎉 Success!

Once deployed, your Booking4U application will be live at:
- **Frontend**: `https://booking4u-frontend.onrender.com`
- **Backend**: `https://booking4u-backend.onrender.com`

Share your live application with users and start accepting bookings! 🚀
