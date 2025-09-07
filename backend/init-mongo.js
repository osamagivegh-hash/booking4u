// Initialize MongoDB database with sample data
db = db.getSiblingDB('booking4u');

// Create collections
db.createCollection('users');
db.createCollection('businesses');
db.createCollection('services');
db.createCollection('bookings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.businesses.createIndex({ "ownerId": 1 });
db.businesses.createIndex({ "category": 1 });
db.businesses.createIndex({ "isActive": 1 });
db.businesses.createIndex({ "address.city": 1 });

db.services.createIndex({ "businessId": 1 });
db.services.createIndex({ "category": 1 });
db.services.createIndex({ "isActive": 1 });

db.bookings.createIndex({ "businessId": 1 });
db.bookings.createIndex({ "customerId": 1 });
db.bookings.createIndex({ "date": 1 });
db.bookings.createIndex({ "status": 1 });

// Create text indexes for search functionality
db.businesses.createIndex({ 
  "name": "text", 
  "description": "text", 
  "category": "text" 
});

db.services.createIndex({ 
  "name": "text", 
  "description": "text", 
  "category": "text" 
});

print('Database initialized successfully!');
