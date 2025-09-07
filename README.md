# Booking4U - Appointment Booking System

A comprehensive appointment booking system built with React and Node.js.

## 🚀 Live Demo

- **Frontend**: https://booking4u-frontend.onrender.com
- **Backend API**: https://booking4u-backend.onrender.com/api
- **API Documentation**: https://booking4u-backend.onrender.com/api-docs

## 📋 Features

- **User Management**: Registration, login, and profile management
- **Business Management**: Create and manage business profiles
- **Service Management**: Add, edit, and manage services
- **Booking System**: Real-time appointment booking
- **Dashboard**: Comprehensive dashboards for customers and businesses
- **Messaging**: Real-time messaging between customers and businesses
- **Reviews**: Rating and review system
- **Notifications**: Real-time notifications
- **Multi-language**: Arabic and English support

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Heroicons
- Axios
- Zustand (State Management)
- React Hook Form
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io
- Express Validator
- Winston (Logging)
- Swagger (API Documentation)

## 🚀 Deployment

This application is deployed on Render with the following services:

### Backend Service
- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js

### Frontend Service
- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### Database
- **Service Type**: MongoDB
- **Database Name**: booking4u

## 📁 Project Structure

```
booking4u/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
└── README.md
```

## 🔧 Environment Variables

### Backend
- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `CORS_ORIGIN`: CORS allowed origin

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Bookings
- `GET /api/bookings/my-bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service

### Businesses
- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create new business
- `PUT /api/businesses/:id` - Update business

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Frontend Development**: React Team
- **Backend Development**: Node.js Team
- **Database Design**: MongoDB Team
- **UI/UX Design**: Design Team

## 📞 Support

For support, email support@booking4u.com or create an issue in the repository.

---

Made with ❤️ by the Booking4U Team