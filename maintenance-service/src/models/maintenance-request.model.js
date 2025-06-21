const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
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
    category: {
      type: String,
      required: true,
      enum: ['plumbing', 'electrical', 'appliance', 'heating_cooling', 'structural', 'pest_control', 'other'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'canceled'],
      default: 'pending',
    },
    preferredAvailability: {
      type: String,
      trim: true,
    },
    permissionToEnter: {
      type: Boolean,
      default: false,
    },
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
    assignedTo: {
      type: String, // ID of maintenance staff or contractor
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: [{
      text: {
        type: String,
        trim: true,
      },
      addedBy: {
        type: String, // User ID
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
    }],
    cost: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      details: {
        type: String,
        trim: true,
      },
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      ratedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest; 