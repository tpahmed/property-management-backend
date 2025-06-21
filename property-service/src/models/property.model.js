const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'USA',
      },
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial'],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    squareFeet: {
      type: Number,
      required: true,
      min: 0,
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
    availableDate: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    images: [{
      url: {
        type: String,
        trim: true,
      },
      caption: {
        type: String,
        trim: true,
      },
    }],
    ownerId: {
      type: String,
      required: true,
    },
    managerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
propertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.state': 'text',
  'address.zipCode': 'text',
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 