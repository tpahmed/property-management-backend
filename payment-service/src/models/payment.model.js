const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    leaseId: {
      type: String,
      required: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentType: {
      type: String,
      enum: ['rent', 'security_deposit', 'late_fee', 'maintenance', 'other'],
      default: 'rent',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'cash', 'check', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: function() {
        return this.paymentType === 'rent';
      },
    },
    paymentDate: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isLateFee: {
      type: Boolean,
      default: false,
    },
    period: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 