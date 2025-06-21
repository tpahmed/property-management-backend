const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, userController.getUserProfile);

// Update user profile
router.put(
  '/profile',
  [
    authenticate,
    check('firstName', 'First name must be valid').optional().isString(),
    check('lastName', 'Last name must be valid').optional().isString(),
    check('phone', 'Phone must be valid').optional().isString(),
  ],
  userController.updateUserProfile
);

// Change password
router.put(
  '/change-password',
  [
    authenticate,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  userController.changePassword
);

// Get users by role (for property managers and owners)
router.get(
  '/by-role/:role',
  authenticate,
  authorize('property_manager', 'property_owner'),
  userController.getUsersByRole
);

module.exports = router; 