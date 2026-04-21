const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Registered', 'Attended', 'Cancelled'],
    default: 'Registered',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// A user should only be able to register once for a specific event
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
