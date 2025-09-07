const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking4U API',
      version: '1.0.0',
      description: 'API documentation for Booking4U appointment booking system',
      contact: {
        name: 'Booking4U Team',
        email: 'support@booking4u.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;


