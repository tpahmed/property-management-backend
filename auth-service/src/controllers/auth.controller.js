const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Register a new user
exports.register = async (req, res, next) => {
  console.log('Register endpoint hit with data:', {
    ...req.body,
    password: req.body.password ? '[REDACTED]' : undefined
  });
  
  try {
    console.log('Validating request data');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;
    console.log(`Processing registration for email: ${email}, role: ${role}`);

    // Check if user already exists
    console.log('Checking if user already exists');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User already exists with email: ${email}`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.log('No existing user found, proceeding with registration');

    // Create new user
    console.log('Creating new user');
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
    });

    console.log('Saving user to database');
    await user.save();
    console.log(`User saved successfully with ID: ${user._id}`);

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated');

    console.log('Registration successful, sending response');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
    console.log('Response sent');
  } catch (error) {
    console.error('Error in register controller:', error);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    res.status(200).json({
      valid: true,
      userId: decoded.userId,
      role: decoded.role
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', valid: false });
  }
}; 