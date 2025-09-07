# 🚀 MongoDB Migration Guide: Local to Atlas

This guide will help you migrate your local MongoDB database to MongoDB Atlas for your Booking4U project.

## 📋 Prerequisites

1. **Local MongoDB running** on port 27017
2. **MongoDB Atlas account** with a cluster created
3. **Database password** for your Atlas cluster
4. **Node.js** installed on your system

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
# Install MongoDB driver
npm install mongodb

# Or use the provided package file
npm install --package-lock-only package-migration.json
```

### Step 2: Update Atlas URI

1. **Open** `migrate-to-atlas.js`
2. **Find** this line:
   ```javascript
   const ATLAS_MONGODB_URI = 'mongodb+srv://osamagivegh:<db_password>@cluster0.npzs81o.mongodb.net/booking4U?retryWrites=true&w=majority&appName=Cluster0';
   ```
3. **Replace** `<db_password>` with your actual Atlas database password

### Step 3: Verify Local MongoDB

Make sure your local MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Or check if the service is running
net start MongoDB
```

## 🚀 Running the Migration

### Option 1: Direct Execution
```bash
node migrate-to-atlas.js
```

### Option 2: Using npm script
```bash
npm run migrate
```

## 📊 What the Script Does

1. **Connects** to both local MongoDB and Atlas
2. **Discovers** all collections in your local database
3. **Migrates** each collection with all documents
4. **Creates** indexes automatically
5. **Verifies** the migration was successful
6. **Generates** a detailed migration report

## 🔍 Migration Process

The script will:

- ✅ **Connect** to local MongoDB (`mongodb://localhost:27017/booking4U`)
- ✅ **Connect** to Atlas cluster
- ✅ **List** all collections in local database
- ✅ **Migrate** each collection:
  - Clear existing data in Atlas (overwrite)
  - Insert all documents in batches
  - Create indexes
- ✅ **Verify** document counts match
- ✅ **Generate** migration report

## 📈 Expected Output

```
============================================================
MONGODB MIGRATION: LOCAL TO ATLAS
============================================================
🔄 Connecting to local MongoDB...
✅ Connected to local MongoDB
🔄 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas
✅ Both database connections verified
ℹ️  Found 8 collections: users, businesses, services, bookings, messages, reviews, news, notifications
🔄 Migrating collection: users
ℹ️  Found 15 documents in users
ℹ️  Cleared existing data in Atlas collection: users
🔄 Inserted batch 1/1 for users
✅ Collection users migrated: 15 documents inserted, 0 errors
✅ Created index email_1 for users
...
✅ Migration verification successful!

==================================================
MIGRATION SUMMARY
==================================================
Duration: 2.5 minutes
Collections migrated: 8
Documents migrated: 1,247
Errors: 0
Status: SUCCESS
==================================================
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Failed to Atlas**
   ```
   ❌ Connection failed: Authentication failed
   ```
   **Solution**: Check your Atlas password and username

2. **Local MongoDB Not Running**
   ```
   ❌ Connection failed: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Start your local MongoDB service

3. **Network Issues**
   ```
   ❌ Connection failed: timeout
   ```
   **Solution**: Check your internet connection and Atlas cluster status

4. **Permission Issues**
   ```
   ❌ Failed to migrate collection: not authorized
   ```
   **Solution**: Check Atlas user permissions

### Debug Mode:

Add this to see detailed connection info:
```javascript
// Add to the script for debugging
console.log('Local URI:', LOCAL_MONGODB_URI);
console.log('Atlas URI:', ATLAS_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
```

## 📁 Files Created

After migration, you'll have:
- `migration-report.json` - Detailed migration report
- Console output with full migration log

## 🔒 Security Notes

1. **Never commit** your Atlas password to version control
2. **Use environment variables** for production:
   ```javascript
   const ATLAS_MONGODB_URI = process.env.ATLAS_MONGODB_URI;
   ```
3. **Restrict Atlas IP access** to your deployment servers

## 🎯 Post-Migration Steps

1. **Update your application** to use Atlas URI
2. **Test all functionality** with Atlas database
3. **Update environment variables** in Render
4. **Remove local MongoDB dependency** if desired

## 📞 Support

If you encounter issues:
1. Check the migration report (`migration-report.json`)
2. Verify Atlas cluster is accessible
3. Check MongoDB logs for detailed errors
4. Ensure all collections have proper indexes

## 🚀 Ready for Production

After successful migration:
- Your data is safely in MongoDB Atlas
- You can deploy to Render with Atlas URI
- Your application will be cloud-ready!

---

**Happy Migrating!** 🎉
