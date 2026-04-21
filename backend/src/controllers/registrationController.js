const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private/Student
const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if the student is already registered
  const existingRegistration = await Registration.findOne({
    eventId,
    studentId: req.user._id
  });

  if (existingRegistration) {
    res.status(400);
    throw new Error('Already registered for this event');
  }

  // Check capacity
  if (event.capacity > 0) {
    const currentRegistrations = await Registration.countDocuments({ eventId, status: 'Registered' });
    if (currentRegistrations >= event.capacity) {
      res.status(400);
      throw new Error('Event is full');
    }
  }

  const registration = await Registration.create({
    eventId,
    studentId: req.user._id,
    status: 'Registered'
  });

  res.status(201).json(registration);
});

// @desc    Get user's own registrations
// @route   GET /api/registrations/my
// @access  Private/Student
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ studentId: req.user._id })
    .populate({
      path: 'eventId',
      select: 'title startDate endDate deadline location format type status link'
    });
    
  res.json(registrations);
});

// @desc    Get all registrations for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Private/Organizer
const getEventRegistrations = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Ensure the requester is the event organizer
  if (event.organizerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these registrations');
  }

  const registrations = await Registration.find({ eventId })
    .populate('studentId', 'name email profileData');

  res.json(registrations);
});

// @desc    Cancel a registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private/Student
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  // Ensure the registration belongs to the current user
  if (registration.studentId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this registration');
  }

  registration.status = 'Cancelled';
  const updatedRegistration = await registration.save();

  res.json(updatedRegistration);
});

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration
};
