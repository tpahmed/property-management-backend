const mongoose = require('mongoose');

const rentalApplicationSchema = new mongoose.Schema(
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
    moveInDate: {
      type: Date,
      required: true,
    },
    leaseTerm: {
      type: Number, // in months
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'canceled'],
      default: 'pending',
    },
    employmentInfo: {
      employer: {
        type: String,
        required: true,
        trim: true,
      },
      position: {
        type: String,
        required: true,
        trim: true,
      },
      monthlyIncome: {
        type: Number,
        required: true,
        min: 0,
      },
      employmentLength: {
        type: Number, // in months
        required: true,
        min: 0,
      },
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 850,
    },
    previousRentals: [{
      address: {
        type: String,
        trim: true,
      },
      landlordName: {
        type: String,
        trim: true,
      },
      landlordContact: {
        type: String,
        trim: true,
      },
      rentalDuration: {
        type: Number, // in months
        min: 0,
      },
    }],
    references: [{
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        trim: true,
      },
    }],
    additionalNotes: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String, // managerId or ownerId
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RentalApplication = mongoose.model('RentalApplication', rentalApplicationSchema);

module.exports = RentalApplication; 