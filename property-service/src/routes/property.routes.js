const express = require('express');
const { check } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new property
router.post(
  '/',
  [
    authenticate,
    authorize('property_owner'),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('address.street', 'Street address is required').not().isEmpty(),
    check('address.city', 'City is required').not().isEmpty(),
    check('address.state', 'State is required').not().isEmpty(),
    check('address.zipCode', 'Zip code is required').not().isEmpty(),
    check('propertyType', 'Property type is required').isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial']),
    check('bedrooms', 'Bedrooms must be a number').isNumeric(),
    check('bathrooms', 'Bathrooms must be a number').isNumeric(),
    check('squareFeet', 'Square feet must be a number').isNumeric(),
    check('rentAmount', 'Rent amount must be a number').isNumeric(),
    check('securityDeposit', 'Security deposit must be a number').isNumeric(),
    check('availableDate', 'Available date is required').isISO8601(),
  ],
  propertyController.createProperty
);

// Get all properties
router.get('/', propertyController.getAllProperties);

// Get property by ID
router.get('/:id', propertyController.getPropertyById);

// Update property
router.put(
  '/:id',
  [
    authenticate,
    check('title', 'Title must be valid').optional().not().isEmpty(),
    check('description', 'Description must be valid').optional().not().isEmpty(),
    check('propertyType', 'Property type must be valid').optional().isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial']),
    check('bedrooms', 'Bedrooms must be a number').optional().isNumeric(),
    check('bathrooms', 'Bathrooms must be a number').optional().isNumeric(),
    check('squareFeet', 'Square feet must be a number').optional().isNumeric(),
    check('rentAmount', 'Rent amount must be a number').optional().isNumeric(),
    check('securityDeposit', 'Security deposit must be a number').optional().isNumeric(),
    check('availableDate', 'Available date must be valid').optional().isISO8601(),
  ],
  propertyController.updateProperty
);

// Delete property
router.delete('/:id', authenticate, propertyController.deleteProperty);

// Search properties
router.get('/search', propertyController.searchProperties);

// Get properties by owner
router.get('/owner/:ownerId', authenticate, propertyController.getPropertiesByOwner);

// Assign manager to property
router.post(
  '/assign-manager',
  [
    authenticate,
    authorize('property_owner'),
    check('propertyId', 'Property ID is required').not().isEmpty(),
    check('managerId', 'Manager ID is required').not().isEmpty(),
  ],
  propertyController.assignManager
);

module.exports = router; 