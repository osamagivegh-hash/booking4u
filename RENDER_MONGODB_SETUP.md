# Render MongoDB Setup Guide

## 🚨 Current Issue
Your deployment is failing with this MongoDB error:
```
❌ MongoDB connection error: MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

## ✅ Solution

### 1. **Check Your Render Environment Variables**

Go to your Render dashboard:
1. Click on your service
2. Go to "Environment" tab
3. Check if `MONGODB_URI` is set correctly

### 2. **Correct MongoDB URI Format**

Your `MONGODB_URI` should look like this:

#### **For MongoDB Atlas (Recommended):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

#### **For MongoDB Cloud:**
```
mongodb://username:password@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/database_name?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 3. **Set Environment Variable in Render**

1. **Go to Render Dashboard**
2. **Click on your service**
3. **Go to "Environment" tab**
4. **Add/Edit MONGODB_URI:**
   - **Key:** `MONGODB_URI`
   - **Value:** Your complete MongoDB connection string

### 4. **Example Environment Variables for Render**

```
NODE_ENV=production
RENDER=true
MONGODB_URI=mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/booking4u?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
PORT=10000
```

### 5. **Common Issues and Solutions**

#### **Issue 1: MONGODB_URI not set**
```
⚠️ MONGODB_URI environment variable not set, using fallback
```
**Solution:** Set the `MONGODB_URI` environment variable in Render

#### **Issue 2: Invalid format**
```
❌ Invalid MONGODB_URI format, using fallback
```
**Solution:** Make sure your URI starts with `mongodb://` or `mongodb+srv://`

#### **Issue 3: Connection timeout**
```
❌ MongoDB connection error: ServerSelectionError
```
**Solution:** Check if your MongoDB Atlas cluster allows connections from Render's IP ranges

### 6. **MongoDB Atlas Network Access**

Make sure your MongoDB Atlas cluster allows connections from anywhere:
1. Go to MongoDB Atlas dashboard
2. Click "Network Access"
3. Add IP address: `0.0.0.0/0` (allow from anywhere)
4. Or add Render's specific IP ranges

### 7. **Test Your Connection**

After setting the environment variable, your logs should show:
```
✅ Connected to MongoDB Atlas
📊 Database name: booking4u
🌐 Database host: cluster0-shard-00-00.npzs81o.mongodb.net
🔌 Database port: 27017
🔗 Connection state: 1
```

### 8. **Fallback Connection**

If the environment variable is not set or invalid, the server will use this fallback:
```
mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/booking4u?retryWrites=true&w=majority&appName=Cluster0
```

### 9. **Debugging Steps**

1. **Check Render logs** for MongoDB connection messages
2. **Verify environment variable** is set correctly
3. **Test MongoDB URI** in MongoDB Compass or similar tool
4. **Check MongoDB Atlas** network access settings
5. **Verify database name** and credentials

### 10. **Health Check Endpoint**

Test your deployment:
- **Health check:** `https://your-app.onrender.com/api/health`
- **Should show:** Database connection status

## 🎯 Expected Result

After fixing the MongoDB URI, you should see:
```
✅ Connected to MongoDB Atlas
📊 Database name: booking4u
🌐 Database host: cluster0-shard-00-00.npzs81o.mongodb.net
🔌 Database port: 27017
🔗 Connection state: 1
```

And your React frontend should load at the main URL!




