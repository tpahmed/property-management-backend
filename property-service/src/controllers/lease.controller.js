const { validationResult } = require('express-validator');
const Lease = require('../models/lease.model');
const Property = require('../models/property.model');
const RentalApplication = require('../models/rental-application.model');

// Create a new lease
exports.createLease = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, tenantId, applicationId } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is authorized (owner or manager of the property)
    if (property.ownerId !== req.userId && property.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to create a lease for this property' });
    }

    // If applicationId is provided, check if application exists and is approved
    if (applicationId) {
      const application = await RentalApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Rental application not found' });
      }
      
      if (application.status !== 'approved') {
        return res.status(400).json({ message: 'Cannot create lease for an application that is not approved' });
      }
      
      if (application.propertyId.toString() !== propertyId || application.tenantId !== tenantId) {
        return res.status(400).json({ message: 'Application does not match property or tenant' });
      }
    }

    // Check if there's already an active lease for this property
    const existingLease = await Lease.findOne({ propertyId, isActive: true });
    if (existingLease) {
      return res.status(400).json({ message: 'An active lease already exists for this property' });
    }

    // Create new lease
    const lease = new Lease({
      ...req.body,
      ownerId: property.ownerId,
      managerId: property.managerId,
      isActive: true,
    });

    await lease.save();

    // Update property availability
    property.isAvailable = false;
    await property.save();

    res.status(201).json({
      message: 'Lease created successfully',
      lease,
    });
  } catch (error) {
    next(error);
  }
};

// Get leases by property
exports.getLeasesByProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    
    // Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized (owner or manager of the property)
    if (property.ownerId !== req.userId && property.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view leases for this property' });
    }
    
    // Get leases
    const leases = await Lease.find({ propertyId });
    
    res.status(200).json({ leases });
  } catch (error) {
    next(error);
  }
};

// Get tenant's leases
exports.getTenantLeases = async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    
    // Check if user is requesting their own leases
    if (req.userId !== tenantId && req.userRole !== 'property_manager' && req.userRole !== 'property_owner') {
      return res.status(403).json({ message: 'Not authorized to view these leases' });
    }
    
    // Get leases
    const leases = await Lease.find({ tenantId }).populate('propertyId');
    
    res.status(200).json({ leases });
  } catch (error) {
    next(error);
  }
};

// Update lease
exports.updateLease = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const leaseId = req.params.id;
    
    // Find the lease
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    
    // Check if user is authorized (owner or manager of the property)
    if (lease.ownerId !== req.userId && lease.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this lease' });
    }
    
    // Update lease fields
    const updateData = { ...req.body };
    
    // Don't allow changing propertyId, tenantId, ownerId
    delete updateData.propertyId;
    delete updateData.tenantId;
    delete updateData.ownerId;
    
    // Only owner can change managerId
    if (updateData.managerId && lease.ownerId !== req.userId) {
      delete updateData.managerId;
    }
    
    const updatedLease = await Lease.findByIdAndUpdate(
      leaseId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Lease updated successfully',
      lease: updatedLease,
    });
  } catch (error) {
    next(error);
  }
};

// Terminate lease
exports.terminateLease = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { leaseId, reason, moveOutDate } = req.body;
    
    // Find the lease
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    
    // Check if lease is active
    if (!lease.isActive) {
      return res.status(400).json({ message: 'Lease is already inactive' });
    }
    
    // Determine requestedBy based on user role
    let requestedBy;
    if (req.userId === lease.tenantId) {
      requestedBy = 'tenant';
    } else if (req.userId === lease.ownerId) {
      requestedBy = 'owner';
    } else if (req.userId === lease.managerId) {
      requestedBy = 'manager';
    } else {
      return res.status(403).json({ message: 'Not authorized to terminate this lease' });
    }
    
    // Update lease
    lease.terminationRequested = true;
    lease.terminationDetails = {
      requestedBy,
      requestDate: new Date(),
      reason,
      moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
    };
    
    // If owner or manager is requesting termination, auto-approve
    if (requestedBy === 'owner' || requestedBy === 'manager') {
      lease.terminationDetails.approvedBy = req.userId;
      lease.terminationDetails.approvedDate = new Date();
      lease.isActive = false;
      
      // Make property available again
      const property = await Property.findById(lease.propertyId);
      if (property) {
        property.isAvailable = true;
        await property.save();
      }
    }
    
    await lease.save();
    
    res.status(200).json({
      message: 'Lease termination request processed',
      lease,
    });
  } catch (error) {
    next(error);
  }
};

// Approve lease termination request
exports.approveTermination = async (req, res, next) => {
  try {
    const { leaseId } = req.body;
    
    // Find the lease
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    
    // Check if termination is requested
    if (!lease.terminationRequested) {
      return res.status(400).json({ message: 'No termination request exists for this lease' });
    }
    
    // Check if already approved
    if (lease.terminationDetails.approvedBy) {
      return res.status(400).json({ message: 'Termination request is already approved' });
    }
    
    // Check if user is authorized (owner or manager)
    if (lease.ownerId !== req.userId && lease.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to approve termination requests' });
    }
    
    // Update lease
    lease.terminationDetails.approvedBy = req.userId;
    lease.terminationDetails.approvedDate = new Date();
    lease.isActive = false;
    
    // Make property available again
    const property = await Property.findById(lease.propertyId);
    if (property) {
      property.isAvailable = true;
      await property.save();
    }
    
    await lease.save();
    
    res.status(200).json({
      message: 'Lease termination approved',
      lease,
    });
  } catch (error) {
    next(error);
  }
};

// Offer lease renewal
exports.offerRenewal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { leaseId, newRentAmount, newTermLength } = req.body;
    
    // Find the lease
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    
    // Check if user is authorized (owner or manager)
    if (lease.ownerId !== req.userId && lease.managerId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to offer renewal for this lease' });
    }
    
    // Check if lease is active
    if (!lease.isActive) {
      return res.status(400).json({ message: 'Cannot offer renewal for inactive lease' });
    }
    
    // Update lease
    lease.renewalOffered = true;
    lease.renewalDetails = {
      offeredAt: new Date(),
      newRentAmount,
      newTermLength,
      status: 'pending',
    };
    
    await lease.save();
    
    res.status(200).json({
      message: 'Lease renewal offer created',
      lease,
    });
  } catch (error) {
    next(error);
  }
};

// Respond to renewal offer
exports.respondToRenewal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { leaseId, response } = req.body;
    
    // Check if response is valid
    if (response !== 'accepted' && response !== 'rejected') {
      return res.status(400).json({ message: 'Response must be either accepted or rejected' });
    }
    
    // Find the lease
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    
    // Check if user is the tenant
    if (lease.tenantId !== req.userId) {
      return res.status(403).json({ message: 'Only the tenant can respond to renewal offers' });
    }
    
    // Check if renewal is offered
    if (!lease.renewalOffered || !lease.renewalDetails) {
      return res.status(400).json({ message: 'No renewal offer exists for this lease' });
    }
    
    // Check if renewal is pending
    if (lease.renewalDetails.status !== 'pending') {
      return res.status(400).json({ message: `Renewal offer has already been ${lease.renewalDetails.status}` });
    }
    
    // Update lease
    lease.renewalDetails.status = response;
    lease.renewalDetails.responseDate = new Date();
    
    // If accepted, create a new lease
    if (response === 'accepted') {
      const newLease = new Lease({
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        ownerId: lease.ownerId,
        managerId: lease.managerId,
        startDate: lease.endDate, // Start when current lease ends
        endDate: new Date(lease.endDate.getTime() + (lease.renewalDetails.newTermLength * 30 * 24 * 60 * 60 * 1000)), // Approximate months to milliseconds
        rentAmount: lease.renewalDetails.newRentAmount,
        securityDeposit: lease.securityDeposit,
        isActive: false, // Will become active when current lease ends
        paymentDueDay: lease.paymentDueDay,
        lateFeesApplicable: lease.lateFeesApplicable,
        lateFeeAmount: lease.lateFeeAmount,
        lateFeeApplicableAfterDays: lease.lateFeeApplicableAfterDays,
      });
      
      await newLease.save();
    }
    
    await lease.save();
    
    res.status(200).json({
      message: `Renewal offer ${response}`,
      lease,
    });
  } catch (error) {
    next(error);
  }
};