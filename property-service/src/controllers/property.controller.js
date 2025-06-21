const { validationResult } = require('express-validator');
const Property = require('../models/property.model');

// Create a new property
exports.createProperty = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a property owner
    if (req.userRole !== 'property_owner') {
      return res.status(403).json({ message: 'Only property owners can create properties' });
    }

    // Create new property
    const property = new Property({
      ...req.body,
      ownerId: req.userId,
    });

    await property.save();

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// Get all properties
exports.getAllProperties = async (req, res, next) => {
  try {
    // Parse query parameters
    const { 
      page = 1, 
      limit = 10, 
      minRent, 
      maxRent, 
      propertyType, 
      bedrooms, 
      city, 
      state,
      isAvailable
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (minRent) filter.rentAmount = { $gte: Number(minRent) };
    if (maxRent) {
      filter.rentAmount = { ...filter.rentAmount, $lte: Number(maxRent) };
    }
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (state) filter['address.state'] = { $regex: state, $options: 'i' };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    
    // Execute query with pagination
    const properties = await Property.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const totalCount = await Property.countDocuments(filter);
    
    res.status(200).json({
      properties,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get property by ID
exports.getPropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(200).json({ property });
  } catch (error) {
    next(error);
  }
};

// Update property
exports.updateProperty = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const propertyId = req.params.id;
    
    // Find the property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized to update (owner or assigned manager)
    if (property.ownerId !== req.userId && property.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }
    
    // Update property fields
    const updateData = { ...req.body };
    
    // Don't allow changing ownerId
    delete updateData.ownerId;
    
    // Only owner can change managerId
    if (updateData.managerId && property.ownerId !== req.userId) {
      delete updateData.managerId;
    }
    
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

// Delete property
exports.deleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    
    // Find the property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is the owner
    if (property.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Only the property owner can delete this property' });
    }
    
    await Property.findByIdAndDelete(propertyId);
    
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Search properties
exports.searchProperties = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const properties = await Property.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    res.status(200).json({ properties });
  } catch (error) {
    next(error);
  }
};

// Get properties by owner
exports.getPropertiesByOwner = async (req, res, next) => {
  try {
    // Check if user is the owner or has admin privileges
    if (req.userId !== req.params.ownerId && req.userRole !== 'property_manager') {
      return res.status(403).json({ message: 'Not authorized to access these properties' });
    }
    
    const properties = await Property.find({ ownerId: req.params.ownerId });
    
    res.status(200).json({ properties });
  } catch (error) {
    next(error);
  }
};

// Assign manager to property
exports.assignManager = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { propertyId, managerId } = req.body;
    
    // Find the property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is the owner
    if (property.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Only the property owner can assign managers' });
    }
    
    // Update the manager
    property.managerId = managerId;
    await property.save();
    
    res.status(200).json({
      message: 'Manager assigned successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
}; 