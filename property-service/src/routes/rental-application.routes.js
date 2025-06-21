const express = require('express');
const { check } = require('express-validator');
const rentalApplicationController = require('../controllers/rental-application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Submit a new rental application
router.post(
  '/',
  [
    authenticate,
    authorize('tenant'),
    check('propertyId', 'Property ID is required').not().isEmpty(),
    check('moveInDate', 'Move-in date is required').isISO8601(),
    check('leaseTerm', 'Lease term is required').isNumeric(),
    check('employmentInfo.employer', 'Employer name is required').not().isEmpty(),
    check('employmentInfo.position', 'Position is required').not().isEmpty(),
    check('employmentInfo.monthlyIncome', 'Monthly income must be a number').isNumeric(),
    check('employmentInfo.employmentLength', 'Employment length must be a number').isNumeric(),
  ],
  rentalApplicationController.submitApplication
);

// Get applications by property
router.get(
  '/property/:propertyId',
  authenticate,
  authorize('property_owner', 'property_manager'),
  rentalApplicationController.getApplicationsByProperty
);

// Get tenant's applications
router.get(
  '/tenant/:tenantId',
  authenticate,
  rentalApplicationController.getTenantApplications
);

// Review application (approve or reject)
router.put(
  '/review',
  [
    authenticate,
    authorize('property_owner', 'property_manager'),
    check('applicationId', 'Application ID is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['approved', 'rejected']),
  ],
  rentalApplicationController.reviewApplication
);

// Cancel application (by tenant)
router.put(
  '/cancel/:id',
  authenticate,
  authorize('tenant'),
  rentalApplicationController.cancelApplication
);

module.exports = router; 