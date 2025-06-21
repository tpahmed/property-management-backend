const express = require('express');
const { check } = require('express-validator');
const maintenanceRequestController = require('../controllers/maintenance-request.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new maintenance request
router.post(
  '/',
  [
    authenticate,
    authorize('tenant'),
    check('propertyId', 'Property ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').isIn([
      'plumbing', 'electrical', 'appliance', 'heating_cooling', 'structural', 'pest_control', 'other'
    ]),
    check('priority', 'Priority must be valid').isIn(['low', 'medium', 'high', 'emergency']),
  ],
  maintenanceRequestController.createRequest
);

// Get all maintenance requests (filtered by role)
router.get('/', authenticate, maintenanceRequestController.getAllRequests);

// Get maintenance request by ID
router.get('/:id', authenticate, maintenanceRequestController.getRequestById);

// Update maintenance request status
router.put(
  '/status',
  [
    authenticate,
    check('requestId', 'Request ID is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['pending', 'assigned', 'in_progress', 'completed', 'canceled']),
  ],
  maintenanceRequestController.updateRequestStatus
);

// Assign maintenance request
router.put(
  '/assign',
  [
    authenticate,
    authorize('property_manager', 'property_owner'),
    check('requestId', 'Request ID is required').not().isEmpty(),
    check('assignedTo', 'Assigned To is required').not().isEmpty(),
  ],
  maintenanceRequestController.assignRequest
);

// Add note to maintenance request
router.post(
  '/note',
  [
    authenticate,
    check('requestId', 'Request ID is required').not().isEmpty(),
    check('text', 'Text is required').not().isEmpty(),
  ],
  maintenanceRequestController.addNote
);

// Rate completed maintenance request
router.post(
  '/rate',
  [
    authenticate,
    authorize('tenant'),
    check('requestId', 'Request ID is required').not().isEmpty(),
    check('score', 'Score must be between 1 and 5').isInt({ min: 1, max: 5 }),
  ],
  maintenanceRequestController.rateRequest
);

module.exports = router; 