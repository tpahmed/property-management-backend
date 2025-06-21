const { validationResult } = require('express-validator');
const MaintenanceRequest = require('../models/maintenance-request.model');
const axios = require('axios');

// Create a new maintenance request
exports.createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a tenant
    if (req.userRole !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can create maintenance requests' });
    }

    // Verify property exists and tenant is associated with it
    try {
      const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
      const response = await axios.get(`${propertyServiceUrl}/api/leases/tenant/${req.userId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      const leases = response.data.leases;
      const isValidProperty = leases.some(lease => 
        lease.propertyId === req.body.propertyId && lease.isActive
      );
      
      if (!isValidProperty) {
        return res.status(403).json({ message: 'You are not authorized to submit maintenance requests for this property' });
      }
    } catch (error) {
      console.error('Error verifying property:', error.message);
      return res.status(500).json({ message: 'Failed to verify property association' });
    }

    // Create new maintenance request
    const maintenanceRequest = new MaintenanceRequest({
      ...req.body,
      tenantId: req.userId,
      status: 'pending',
    });

    await maintenanceRequest.save();

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: maintenanceRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get all maintenance requests
exports.getAllRequests = async (req, res, next) => {
  try {
    // Parse query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category,
      propertyId
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (propertyId) filter.propertyId = propertyId;
    
    // Add role-based filtering
    if (req.userRole === 'tenant') {
      // Tenants can only see their own requests
      filter.tenantId = req.userId;
    } else if (req.userRole === 'property_manager' || req.userRole === 'property_owner') {
      // For managers and owners, we need to check which properties they manage/own
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        let endpoint = '/api/properties';
        
        if (req.userRole === 'property_owner') {
          endpoint = `/api/properties/owner/${req.userId}`;
        }
        
        const response = await axios.get(`${propertyServiceUrl}${endpoint}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const properties = response.data.properties;
        const propertyIds = properties.map(property => property._id);
        
        // Filter by properties they manage/own
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
    const requests = await MaintenanceRequest.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const totalCount = await MaintenanceRequest.countDocuments(filter);
    
    res.status(200).json({
      requests,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get maintenance request by ID
exports.getRequestById = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    
    const request = await MaintenanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if user has access to this request
    if (req.userRole === 'tenant' && request.tenantId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this maintenance request' });
    }
    
    // For property managers and owners, verify they manage/own the property
    if (req.userRole === 'property_manager' || req.userRole === 'property_owner') {
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(`${propertyServiceUrl}/api/properties/${request.propertyId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const property = response.data.property;
        
        if (req.userRole === 'property_owner' && property.ownerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have access to this maintenance request' });
        }
        
        if (req.userRole === 'property_manager' && property.managerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have access to this maintenance request' });
        }
      } catch (error) {
        console.error('Error verifying property access:', error.message);
        return res.status(500).json({ message: 'Failed to verify property access' });
      }
    }
    
    res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
};

// Update maintenance request status
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { requestId, status, note } = req.body;
    
    // Find the request
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if user has permission to update status
    if (req.userRole === 'tenant') {
      // Tenants can only cancel their own requests
      if (request.tenantId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to update this request' });
      }
      
      if (status !== 'canceled') {
        return res.status(403).json({ message: 'Tenants can only cancel maintenance requests' });
      }
      
      // Check if request is in a cancelable state
      if (request.status === 'completed') {
        return res.status(400).json({ message: 'Cannot cancel a completed request' });
      }
    } else if (req.userRole === 'property_manager' || req.userRole === 'property_owner') {
      // Verify property access
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(`${propertyServiceUrl}/api/properties/${request.propertyId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const property = response.data.property;
        
        if (req.userRole === 'property_owner' && property.ownerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have permission to update this request' });
        }
        
        if (req.userRole === 'property_manager' && property.managerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have permission to update this request' });
        }
      } catch (error) {
        console.error('Error verifying property access:', error.message);
        return res.status(500).json({ message: 'Failed to verify property access' });
      }
    }
    
    // Update request status
    request.status = status;
    
    // Add note if provided
    if (note) {
      request.notes.push({
        text: note,
        addedBy: req.userId,
        addedAt: new Date(),
        isPublic: true,
      });
    }
    
    // Update timestamps based on status
    if (status === 'assigned') {
      request.assignedAt = new Date();
    } else if (status === 'completed') {
      request.completedAt = new Date();
    }
    
    await request.save();
    
    res.status(200).json({
      message: 'Maintenance request status updated',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// Assign maintenance request
exports.assignRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { requestId, assignedTo, scheduledDate, note } = req.body;
    
    // Find the request
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if user has permission to assign
    if (req.userRole !== 'property_manager' && req.userRole !== 'property_owner') {
      return res.status(403).json({ message: 'Only property managers and owners can assign maintenance requests' });
    }
    
    // Verify property access
    try {
      const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
      const response = await axios.get(`${propertyServiceUrl}/api/properties/${request.propertyId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      const property = response.data.property;
      
      if (req.userRole === 'property_owner' && property.ownerId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to assign this request' });
      }
      
      if (req.userRole === 'property_manager' && property.managerId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to assign this request' });
      }
    } catch (error) {
      console.error('Error verifying property access:', error.message);
      return res.status(500).json({ message: 'Failed to verify property access' });
    }
    
    // Update request
    request.assignedTo = assignedTo;
    request.assignedAt = new Date();
    request.status = 'assigned';
    
    if (scheduledDate) {
      request.scheduledDate = new Date(scheduledDate);
    }
    
    // Add note if provided
    if (note) {
      request.notes.push({
        text: note,
        addedBy: req.userId,
        addedAt: new Date(),
        isPublic: true,
      });
    }
    
    await request.save();
    
    res.status(200).json({
      message: 'Maintenance request assigned successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// Add note to maintenance request
exports.addNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { requestId, text, isPublic = true } = req.body;
    
    // Find the request
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if user has access to this request
    if (req.userRole === 'tenant' && request.tenantId !== req.userId) {
      return res.status(403).json({ message: 'You do not have access to this maintenance request' });
    }
    
    // For property managers and owners, verify they manage/own the property
    if (req.userRole === 'property_manager' || req.userRole === 'property_owner') {
      try {
        const propertyServiceUrl = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
        const response = await axios.get(`${propertyServiceUrl}/api/properties/${request.propertyId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        const property = response.data.property;
        
        if (req.userRole === 'property_owner' && property.ownerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have access to this maintenance request' });
        }
        
        if (req.userRole === 'property_manager' && property.managerId !== req.userId) {
          return res.status(403).json({ message: 'You do not have access to this maintenance request' });
        }
      } catch (error) {
        console.error('Error verifying property access:', error.message);
        return res.status(500).json({ message: 'Failed to verify property access' });
      }
    }
    
    // Add note
    request.notes.push({
      text,
      addedBy: req.userId,
      addedAt: new Date(),
      isPublic,
    });
    
    await request.save();
    
    res.status(200).json({
      message: 'Note added successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// Rate completed maintenance request
exports.rateRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { requestId, score, comment } = req.body;
    
    // Find the request
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if user is the tenant who created the request
    if (request.tenantId !== req.userId) {
      return res.status(403).json({ message: 'Only the tenant who created the request can rate it' });
    }
    
    // Check if request is completed
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed maintenance requests can be rated' });
    }
    
    // Check if already rated
    if (request.rating && request.rating.score) {
      return res.status(400).json({ message: 'This maintenance request has already been rated' });
    }
    
    // Add rating
    request.rating = {
      score,
      comment,
      ratedAt: new Date(),
    };
    
    await request.save();
    
    res.status(200).json({
      message: 'Maintenance request rated successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
}; 