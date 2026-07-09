const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
    },
    routeNumber: {
      type: String,
      unique: true,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    vehicle: {
      vehicleNumber: String,
      vehicleType: String,
      manufacturer: String,
      capacity: Number,
      registrationNumber: String,
      insuranceExpiry: Date,
    },
    driver: {
      driverId: String,
      driverName: String,
      licenseNumber: String,
      licenseExpiry: Date,
      phone: String,
      address: String,
    },
    conductor: {
      conductorName: String,
      phone: String,
      address: String,
    },
    startPoint: {
      name: String,
      latitude: Number,
      longitude: Number,
    },
    endPoint: {
      name: String,
      latitude: Number,
      longitude: Number,
    },
    stops: [
      {
        stopName: String,
        sequence: Number,
        latitude: Number,
        longitude: Number,
        arrivalTime: String,
      },
    ],
    pickupTime: String,
    dropTime: String,
    distance: Number,
    fare: Number,
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        boarding: String,
        status: {
          type: String,
          enum: ['active', 'inactive'],
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    gpsTracking: {
      enabled: Boolean,
      trackingUrl: String,
      lastLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transport', transportSchema);
