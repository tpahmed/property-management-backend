const express = require('express');
const { check } = require('express-validator');
const leaseController = require('../controllers/lease.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new lease
router.post(
  '/',
  [
    authenticate,
    authorize('property_owner', 'property_manager'),
    check('propertyId', 'Property ID is required').not().isEmpty(),
    check('tenantId', 'Tenant ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    check('rentAmount', 'Rent amount must be a number').isNumeric(),
    check('securityDeposit', 'Security deposit must be a number').isNumeric(),
    check('paymentDueDay', 'Payment due day must be a number between 1 and 31').isInt({ min: 1, max: 31 }),
  ],
  leaseController.createLease
);

// Get leases by property
router.get(
  '/property/:propertyId',
  authenticate,
  authorize('property_owner', 'property_manager'),
  leaseController.getLeasesByProperty
);

// Get tenant's leases
router.get(
  '/tenant/:tenantId',
  authenticate,
  leaseController.getTenantLeases
);

// Update lease
router.put(
  '/:id',
  [
    authenticate,
    authorize('property_owner', 'property_manager'),
    check('rentAmount', 'Rent amount must be a number').optional().isNumeric(),
    check('paymentDueDay', 'Payment due day must be a number between 1 and 31').optional().isInt({ min: 1, max: 31 }),
  ],
  leaseController.updateLease
);

// Terminate lease
router.post(
  '/terminate',
  [
    authenticate,
    check('leaseId', 'Lease ID is required').not().isEmpty(),
    check('reason', 'Reason is required').not().isEmpty(),
  ],
  leaseController.terminateLease
);

// Approve lease termination
router.put(
  '/approve-termination',
  [
    authenticate,
    authorize('property_owner', 'property_manager'),
    check('leaseId', 'Lease ID is required').not().isEmpty(),
  ],
  leaseController.approveTermination
);

// Offer lease renewal
router.post(
  '/offer-renewal',
  [
    authenticate,
    authorize('property_owner', 'property_manager'),
    check('leaseId', 'Lease ID is required').not().isEmpty(),
    check('newRentAmount', 'New rent amount must be a number').isNumeric(),
    check('newTermLength', 'New term length must be a number').isNumeric(),
  ],
  leaseController.offerRenewal
);

// Respond to renewal offer
router.put(
  '/respond-renewal',
  [
    authenticate,
    authorize('tenant'),
    check('leaseId', 'Lease ID is required').not().isEmpty(),
    check('response', 'Response must be either accepted or rejected').isIn(['accepted', 'rejected']),
  ],
  leaseController.respondToRenewal
);

module.exports = router; 