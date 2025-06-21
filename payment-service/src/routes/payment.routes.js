const express = require('express');
const { check } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a new payment
router.post(
  '/',
  [
    authenticate,
    check('leaseId', 'Lease ID is required').not().isEmpty(),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
    check('paymentMethod', 'Payment method is required').isIn(['credit_card', 'bank_transfer', 'cash', 'check', 'other']),
  ],
  paymentController.createPayment
);

// Process payment
router.post(
  '/process',
  [
    authenticate,
    check('paymentId', 'Payment ID is required').not().isEmpty(),
  ],
  paymentController.processPayment
);

// Get all payments (filtered by role)
router.get('/', authenticate, paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', authenticate, paymentController.getPaymentById);

// Generate payment receipt
router.get(
  '/:id/receipt',
  authenticate,
  paymentController.generateReceipt
);

// Get payment history for a lease
router.get(
  '/history/:leaseId',
  authenticate,
  paymentController.getPaymentHistory
);

module.exports = router; 