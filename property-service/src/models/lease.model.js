const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
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
    managerId: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    paymentDueDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      default: 1,
    },
    lateFeesApplicable: {
      type: Boolean,
      default: true,
    },
    lateFeeAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lateFeeApplicableAfterDays: {
      type: Number,
      min: 0,
      default: 5,
    },
    renewalOffered: {
      type: Boolean,
      default: false,
    },
    renewalDetails: {
      offeredAt: {
        type: Date,
      },
      newRentAmount: {
        type: Number,
        min: 0,
      },
      newTermLength: {
        type: Number, // in months
        min: 1,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
      },
      responseDate: {
        type: Date,
      },
    },
    terminationRequested: {
      type: Boolean,
      default: false,
    },
    terminationDetails: {
      requestedBy: {
        type: String, // 'tenant', 'owner', or 'manager'
      },
      requestDate: {
        type: Date,
      },
      reason: {
        type: String,
        trim: true,
      },
      approvedBy: {
        type: String, // userId of approver
      },
      approvedDate: {
        type: Date,
      },
      moveOutDate: {
        type: Date,
      },
    },
    documents: [{
      title: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    specialTerms: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lease = mongoose.model('Lease', leaseSchema);

module.exports = Lease; 