const { validationResult } = require('express-validator');
const RentalApplication = require('../models/rental-application.model');
const Property = require('../models/property.model');

// Submit a new rental application
exports.submitApplication = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a tenant
    if (req.userRole !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can submit rental applications' });
    }

    const { propertyId } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property is available
    if (!property.isAvailable) {
      return res.status(400).json({ message: 'Property is not available for rent' });
    }

    // Check if user already has a pending application for this property
    const existingApplication = await RentalApplication.findOne({
      propertyId,
      tenantId: req.userId,
      status: 'pending',
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You already have a pending application for this property' });
    }

    // Create new application
    const application = new RentalApplication({
      ...req.body,
      tenantId: req.userId,
    });

    await application.save();

    res.status(201).json({
      message: 'Rental application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Get applications by property
exports.getApplicationsByProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    
    // Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized (owner or manager of the property)
    if (property.ownerId !== req.userId && property.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view applications for this property' });
    }
    
    // Get applications
    const applications = await RentalApplication.find({ propertyId });
    
    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};

// Get tenant's applications
exports.getTenantApplications = async (req, res, next) => {
  try {
    // Check if user is requesting their own applications
    if (req.userId !== req.params.tenantId && req.userRole !== 'property_manager' && req.userRole !== 'property_owner') {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }
    
    const applications = await RentalApplication.find({ tenantId: req.params.tenantId })
      .populate('propertyId');
    
    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};

// Review application (approve or reject)
exports.reviewApplication = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { applicationId, status, rejectionReason } = req.body;
    
    // Check if status is valid
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Status must be either approved or rejected' });
    }
    
    // Find the application
    const application = await RentalApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Find the property
    const property = await Property.findById(application.propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized (owner or manager of the property)
    if (property.ownerId !== req.userId && property.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to review applications for this property' });
    }
    
    // Update application
    application.status = status;
    application.reviewedBy = req.userId;
    application.reviewedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    
    // If approved, mark property as unavailable
    if (status === 'approved') {
      property.isAvailable = false;
      await property.save();
      
      // Reject all other pending applications for this property
      await RentalApplication.updateMany(
        { 
          propertyId: property._id, 
          _id: { $ne: applicationId },
          status: 'pending'
        },
        { 
          status: 'rejected',
          rejectionReason: 'Another application has been approved for this property',
          reviewedBy: req.userId,
          reviewedAt: new Date()
        }
      );
    }
    
    await application.save();
    
    res.status(200).json({
      message: `Application ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel application (by tenant)
exports.cancelApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    
    // Find the application
    const application = await RentalApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is the tenant who submitted the application
    if (application.tenantId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this application' });
    }
    
    // Check if application is in a cancelable state
    if (application.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel application with status: ${application.status}` });
    }
    
    // Update application
    application.status = 'canceled';
    await application.save();
    
    res.status(200).json({
      message: 'Application canceled successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
}; 