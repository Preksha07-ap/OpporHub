const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date for the event'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date for the event'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please add an application deadline'],
  },
  link: {
    type: String,
    required: [true, 'Please add a registration or official link'],
  },
  tags: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    required: [true, 'Please add a location (or link for online events)'],
  },
  type: {
    type: String,
    enum: ['Hackathon', 'Workshop', 'Seminar', 'Conference', 'Internship', 'Open Source', 'Other'],
    default: 'Other',
  },
  coverImage: {
    type: String, // Cloudinary Image URL
  },
  format: {
    type: String,
    enum: ['Online', 'In-Person', 'Hybrid'],
    default: 'In-Person',
  },
  capacity: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
