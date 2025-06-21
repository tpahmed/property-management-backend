const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
const fetch = require('node-fetch');
const url = require('url');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('src/public'));

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL + '/api/auth' || 'http://127.0.0.1:3001/api/auth';
const USER_SERVICE_URL = process.env.AUTH_SERVICE_URL + '/api/users' || 'http://127.0.0.1:3001/api/users';
const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL + '/api/properties' || 'http://127.0.0.1:3002/api/properties';
const RENTAL_APPLICATION_SERVICE_URL = process.env.PROPERTY_SERVICE_URL + '/api/applications' || 'http://127.0.0.1:3002/api/applications';
const LEASE_SERVICE_URL = process.env.PROPERTY_SERVICE_URL + '/api/leases' || 'http://127.0.0.1:3002/api/leases';
const MAINTENANCE_SERVICE_URL = process.env.MAINTENANCE_SERVICE_URL + '/api/maintenance' || 'http://127.0.0.1:3003/api/maintenance';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL + '/api/payments' || 'http://127.0.0.1:3004/api/payments';

// Proxy middleware setup
const proxyOptions = {
  changeOrigin: true,
  proxyReqPathResolver: function(req) {
    // This reconstructs the full proxied path as needed:
    return url.parse(req.originalUrl).path;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    console.log(proxyReqOpts);
    console.log(`Proxying request to: ${srcReq.method} ${srcReq.path}`);
    return proxyReqOpts;
  },
  proxyErrorHandler: function(err, res, next) {
    console.error('Proxy error:', err);
    res.status(502).json({
      status: 'error',
      message: 'Service unavailable',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

// Proxy routes
app.use('/api/auth',proxy(AUTH_SERVICE_URL, proxyOptions));
app.use('/api/users',proxy(USER_SERVICE_URL, proxyOptions));
app.use('/api/properties',proxy(PROPERTY_SERVICE_URL, proxyOptions));
app.use('/api/applications',proxy(RENTAL_APPLICATION_SERVICE_URL, proxyOptions));
app.use('/api/leases',proxy(LEASE_SERVICE_URL, proxyOptions));
app.use('/api/maintenance',proxy(MAINTENANCE_SERVICE_URL, proxyOptions));
app.use('/api/payments',proxy(PAYMENT_SERVICE_URL, proxyOptions));

// Direct proxy test endpoints for debugging
app.get('/test/auth', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/health`);
    const data = await response.json();
    res.json({
      status: 'success',
      message: 'Direct connection to auth service successful',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to auth service',
      error: error.message
    });
  }
});

// API Endpoints documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Property Management API',
    version: '1.0.0',
    services: {
      auth: {
        base: '/api/auth',
        endpoints: [
          { method: 'POST', path: '/register', description: 'Register a new user' },
          { method: 'POST', path: '/login', description: 'Login a user' },
          { method: 'GET', path: '/me', description: 'Get current user info' }
        ]
      },
      users: {
        base: '/api/users',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all users (admin only)' },
          { method: 'GET', path: '/:id', description: 'Get user by ID' },
          { method: 'PUT', path: '/:id', description: 'Update user' },
          { method: 'DELETE', path: '/:id', description: 'Delete user (admin only)' }
        ]
      },
      properties: {
        base: '/api/properties',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all properties' },
          { method: 'POST', path: '/', description: 'Create a new property' },
          { method: 'GET', path: '/:id', description: 'Get property by ID' },
          { method: 'PUT', path: '/:id', description: 'Update property' },
          { method: 'DELETE', path: '/:id', description: 'Delete property' }
        ]
      },
      applications: {
        base: '/api/applications',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all applications' },
          { method: 'POST', path: '/', description: 'Submit a new application' },
          { method: 'GET', path: '/:id', description: 'Get application by ID' },
          { method: 'PUT', path: '/:id', description: 'Update application status' }
        ]
      },
      leases: {
        base: '/api/leases',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all leases' },
          { method: 'POST', path: '/', description: 'Create a new lease' },
          { method: 'GET', path: '/:id', description: 'Get lease by ID' },
          { method: 'PUT', path: '/:id', description: 'Update lease' }
        ]
      },
      maintenance: {
        base: '/api/maintenance',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all maintenance requests' },
          { method: 'POST', path: '/', description: 'Create a new maintenance request' },
          { method: 'GET', path: '/:id', description: 'Get maintenance request by ID' },
          { method: 'PUT', path: '/:id', description: 'Update maintenance request' }
        ]
      },
      payments: {
        base: '/api/payments',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all payments' },
          { method: 'POST', path: '/', description: 'Create a new payment' },
          { method: 'GET', path: '/:id', description: 'Get payment by ID' }
        ]
      }
    }
  });
});

// Root endpoint - redirect to index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'src/public' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

// Service health check endpoints with timeout
app.get('/services/health', async (req, res) => {
  const services = [
    { name: 'auth-service', url: `${AUTH_SERVICE_URL}/health` },
    { name: 'property-service', url: `${PROPERTY_SERVICE_URL}/health` },
    { name: 'maintenance-service', url: `${MAINTENANCE_SERVICE_URL}/health` },
    { name: 'payment-service', url: `${PAYMENT_SERVICE_URL}/health` },
  ];

  const serviceStatus = {};
  
  // Function to fetch with timeout
  const fetchWithTimeout = async (url, timeout = 2000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  for (const service of services) {
    try {
      const response = await fetchWithTimeout(service.url);
      serviceStatus[service.name] = response.ok ? 'up' : 'down';
    } catch (error) {
      console.log(`Error checking ${service.name}: ${error.message}`);
      serviceStatus[service.name] = 'down';
    }
  }

  res.status(200).json({ services: serviceStatus });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.status(200).json({
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || 3000,
      AUTH_SERVICE_URL,
      PROPERTY_SERVICE_URL,
      MAINTENANCE_SERVICE_URL,
      PAYMENT_SERVICE_URL
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Service URLs:`);
  console.log(`- Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`- Property Service: ${PROPERTY_SERVICE_URL}`);
  console.log(`- Maintenance Service: ${MAINTENANCE_SERVICE_URL}`);
  console.log(`- Payment Service: ${PAYMENT_SERVICE_URL}`);
});

module.exports = app; 