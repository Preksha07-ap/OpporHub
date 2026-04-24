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
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  source: {
    type: String,
    default: 'Manual', // Can be 'Eventbrite', 'GDG', etc.
  },
  type: {
    type: String,
    enum: ['Hackathon', 'Tech Talk', 'Meetup', 'Webinar', 'College Fest', 'Startup Event', 'Workshop', 'Seminar', 'Conference', 'Internship', 'Open Source', 'Other'],
    default: 'Other',
  },
  perks: {
    type: [String],
    default: [],
  },
  participationType: {
    type: String,
    enum: ['Solo', 'Team', 'Both'],
    default: 'Solo',
  },
  duration: {
    type: String,
    enum: ['Few hours', '1 day', 'Multi-day'],
    default: 'Few hours',
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
  },
  workshopFormat: {
    type: String,
    enum: ['Hands-on', 'Project-based', 'Bootcamp'],
  },
  toolsUsed: {
    type: [String],
    default: [],
  },
  outcomes: {
    type: [String],
    default: [],
  },
  certificate: {
    type: Boolean,
    default: false,
  },
  pricing: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free',
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
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved',
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  engagement: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    baseInterest: { type: Number, default: () => Math.floor(Math.random() * 50) + 10 }, // Initial "seed" interest
    demographics: {
      year1: { type: Number, default: 0 },
      year2: { type: Number, default: 0 },
      year3: { type: Number, default: 0 },
      year4: { type: Number, default: 0 },
      topYearSeed: { type: Number, default: () => Math.floor(Math.random() * 4) + 1 } // To simulate "Popular among year X"
    }
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
