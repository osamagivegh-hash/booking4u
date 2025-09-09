import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Home Page Component
function Home() {
  return (
    <div className="page">
      <h1>Booking4U - نظام حجز المواعيد الذكي</h1>
      <p>Welcome to Booking4U - Smart Appointment Booking System</p>
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>Easy appointment booking</li>
          <li>Business management</li>
          <li>Real-time notifications</li>
          <li>Multi-language support</li>
        </ul>
      </div>
    </div>
  );
}

// About Page Component
function About() {
  return (
    <div className="page">
      <h1>About Booking4U</h1>
      <p>Booking4U is a comprehensive appointment booking system designed to streamline business operations.</p>
      <div className="about-content">
        <h2>Our Mission</h2>
        <p>To provide businesses with an easy-to-use platform for managing appointments and customer relationships.</p>
        
        <h2>Why Choose Us?</h2>
        <ul>
          <li>User-friendly interface</li>
          <li>Secure and reliable</li>
          <li>24/7 customer support</li>
          <li>Mobile responsive design</li>
        </ul>
      </div>
    </div>
  );
}

// Services Page Component
function Services() {
  return (
    <div className="page">
      <h1>Our Services</h1>
      <div className="services-grid">
        <div className="service-card">
          <h3>Appointment Booking</h3>
          <p>Easy online booking system for your customers</p>
        </div>
        <div className="service-card">
          <h3>Business Management</h3>
          <p>Comprehensive tools to manage your business</p>
        </div>
        <div className="service-card">
          <h3>Customer Communication</h3>
          <p>Stay connected with your customers</p>
        </div>
        <div className="service-card">
          <h3>Analytics & Reports</h3>
          <p>Track your business performance</p>
        </div>
      </div>
    </div>
  );
}

// Contact Page Component
function Contact() {
  return (
    <div className="page">
      <h1>Contact Us</h1>
      <div className="contact-info">
        <div className="contact-section">
          <h2>Get in Touch</h2>
          <p>Have questions? We'd love to hear from you.</p>
          <div className="contact-details">
            <p><strong>Email:</strong> info@booking4u.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Business St, City, State 12345</p>
          </div>
        </div>
        <div className="contact-section">
          <h2>Business Hours</h2>
          <ul>
            <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
            <li>Saturday: 10:00 AM - 4:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Navigation Component
function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">Booking4U</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2024 Booking4U. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
