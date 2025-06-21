const { validationResult } = require('express-validator');
const Payment = require('../models/payment.model');
const axios = require('axios');

// Create a new payment
exports.createPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaseId, amount, paymentMethod, description } = req.body;

    // Verify lease exists and get lease details
    try {
      const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
      const leaseResponse = await axios.get(`${propertyServiceUrl}/api/leases/${leaseId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      const lease = leaseResponse.data.lease;
      
      // Check if user is the tenant of this lease
      if (req.userRole === 'tenant' && lease.tenantId !== req.userId) {
        return res.status(403).json({ message: 'You are not authorized to make payments for this lease' });
      }
      
      // Create new payment
      const payment = new Payment({
        leaseId,
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        ownerId: lease.ownerId,
        amount,
        paymentMethod,
        description,
        status: 'pending',
        paymentType: req.body.paymentType || 'rent',
        dueDate: req.body.dueDate || new Date(),
        period: req.body.period || {
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      await payment.save();

      res.status(201).json({
        message: 'Payment created successfully',
        payment,
      });
    } catch (error) {
      console.error('Error verifying lease:', error.message);
      return res.status(500).json({ message: 'Failed to verify lease details' });
    }
  } catch (error) {
    next(error);
  }
};

// Process payment (simulate payment processing)
exports.processPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment is already processed
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: `Payment is already ${payment.status}` });
    }

    // Check if user is authorized
    if (req.userRole === 'tenant' && payment.tenantId !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to process this payment' });
    }

    // Simulate payment processing
    // In a real application, this would integrate with a payment gateway
    const isSuccessful = Math.random() > 0.1; // 90% success rate for simulation

    if (isSuccessful) {
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.transactionId = `txn_${Date.now()}`;
      payment.receiptUrl = `https://example.com/receipts/${payment._id}`;

      await payment.save();

      res.status(200).json({
        message: 'Payment processed successfully',
        payment,
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        message: 'Payment processing failed',
        payment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all payments (filtered by role)
exports.getAllPayments = async (req, res, next) => {
  try {
    // Parse query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentType,
      startDate,
      endDate,
      leaseId,
      propertyId
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    if (leaseId) filter.leaseId = leaseId;
    if (propertyId) filter.propertyId = propertyId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Add role-based filtering
    if (req.userRole === 'tenant') {
      // Tenants can only see their own payments
      filter.tenantId = req.userId;
    } else if (req.userRole === 'property_owner') {
      // Owners can see payments for their properties
      filter.ownerId = req.userId;
    } else if (req.userRole === 'property_manager') {
      // For managers, we need to check which properties they manage
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(`${propertyServiceUrl}/api/properties`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const properties = response.data.properties;
        const propertyIds = properties.map(property => property._id);
        
        // Filter by properties they manage
        if (!propertyId) { // If propertyId is not already specified in query
          filter.propertyId = { $in: propertyIds };
        } else {
          // Verify they have access to the specified property
          if (!propertyIds.includes(propertyId)) {
            return res.status(403).json({ message: 'You do not have access to this property' });
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error.message);
        return res.status(500).json({ message: 'Failed to verify property access' });
      }
    }
    
    // Execute query with pagination
    const payments = await Payment.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const totalCount = await Payment.countDocuments(filter);
    
    res.status(200).json({
      payments,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user has access to this payment
    if (req.userRole === 'tenant' && payment.tenantId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this payment' });
    }
    
    if (req.userRole === 'property_owner' && payment.ownerId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this payment' });
    }
    
    if (req.userRole === 'property_manager') {
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(`${propertyServiceUrl}/api/properties/${payment.propertyId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const property = response.data.property;
        
        if (property.managerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have access to this payment' });
        }
      } catch (error) {
        console.error('Error verifying property access:', error.message);
        return res.status(500).json({ message: 'Failed to verify property access' });
      }
    }
    
    res.status(200).json({ payment });
  } catch (error) {
    next(error);
  }
};

// Generate payment receipt
exports.generateReceipt = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only generate receipts for completed payments' });
    }
    
    // Check if user has access to this payment
    if (req.userRole === 'tenant' && payment.tenantId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this payment' });
    }
    
    if (req.userRole === 'property_owner' && payment.ownerId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this payment' });
    }
    
    // Generate receipt (in a real application, this would create a PDF or similar)
    const receipt = {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      date: payment.paymentDate,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      tenant: payment.tenantId,
      property: payment.propertyId,
      description: payment.description,
      period: payment.period,
    };
    
    res.status(200).json({ receipt });
  } catch (error) {
    next(error);
  }
};

// Get payment history for a lease
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { leaseId } = req.params;
    
    // Verify lease exists and user has access
    try {
      const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
      const leaseResponse = await axios.get(`${propertyServiceUrl}/api/leases/${leaseId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      const lease = leaseResponse.data.lease;
      
      // Check if user has access to this lease
      if (req.userRole === 'tenant' && lease.tenantId !== req.userId) {
        return res.status(403).json({ message: 'You do not have access to this lease' });
      }
      
      if (req.userRole === 'property_owner' && lease.ownerId !== req.userId) {
        return res.status(403).json({ message: 'You do not have access to this lease' });
      }
      
      if (req.userRole === 'property_manager' && lease.managerId !== req.userId) {
        return res.status(403).json({ message: 'You do not have access to this lease' });
      }
      
      // Get payments for this lease
      const payments = await Payment.find({ leaseId }).sort({ createdAt: -1 });
      
      res.status(200).json({ payments });
    } catch (error) {
      console.error('Error verifying lease access:', error.message);
      return res.status(500).json({ message: 'Failed to verify lease access' });
    }
  } catch (error) {
    next(error);
  }
}; 