const axios = require('axios');

// Middleware to authenticate user via auth service
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token with auth service
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.post(`${authServiceUrl}/api/auth/verify-token`, { token });
      
      if (response.data.valid) {
        // Add user info to request
        req.userId = response.data.userId;
        req.userRole = response.data.role;
        next();
      } else {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error('Error verifying token with auth service:', error.message);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Access denied. Role ${req.userRole} is not authorized to access this resource.`,
      });
    }
    next();
  };
}; 