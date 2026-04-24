const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, deadline, link, tags, location, type, format, capacity } = req.body;

  let coverImage = '';
  if (req.file) {
    coverImage = req.file.path;
  }

  const event = await Event.create({
    title,
    description,
    startDate,
    endDate,
    deadline,
    link,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    location,
    type,
    format,
    capacity,
    coverImage,
    organizerId: req.user._id,
  });

  res.status(201).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // Add filtering as needed (e.g., status: 'Upcoming')
  const events = await Event.find({ approvalStatus: 'Approved' }).populate('organizerId', 'name profileData');
  res.json(events);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizerId', 'name profileData');

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Make sure user is event owner
  if (event.organizerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }

  let updateData = { ...req.body };
  if (req.file) {
    updateData.coverImage = req.file.path;
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Make sure user is event owner
  if (event.organizerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  await event.deleteOne();

  res.json({ message: 'Event removed' });
});
// @desc    Get logged in organizer's events
// @route   GET /api/events/my
// @access  Private/Organizer
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizerId: req.user._id });
  res.json(events);
});

// @desc    Get pending events for admin
// @route   GET /api/events/admin/pending
// @access  Private/Admin
const getPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ approvalStatus: 'Pending' }).populate('organizerId', 'name profileData');
  res.json(events);
});

// @desc    Approve event
// @route   PUT /api/events/admin/:id/approve
// @access  Private/Admin
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: 'Approved' },
    { new: true, runValidators: true }
  );

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});

// @desc    Reject event
// @route   PUT /api/events/admin/:id/reject
// @access  Private/Admin
const rejectEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: 'Rejected' },
    { new: true, runValidators: true }
  );

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});

// @desc    Track event engagement (view/click)
// @route   POST /api/events/:id/track
// @access  Public
const trackEngagement = asyncHandler(async (req, res) => {
  const { type, studentYear } = req.body; // 'view', 'click' and optional 1, 2, 3, 4
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (!event.engagement) {
    event.engagement = { 
      views: 0, 
      clicks: 0, 
      baseInterest: Math.floor(Math.random() * 50) + 10,
      demographics: { year1: 0, year2: 0, year3: 0, year4: 0, topYearSeed: Math.floor(Math.random() * 4) + 1 }
    };
  }

  if (type === 'view') event.engagement.views += 1;
  if (type === 'click') event.engagement.clicks += 1;

  // Track demographic if user year is provided
  if (studentYear && event.engagement.demographics) {
    const yearKey = `year${studentYear}`;
    if (event.engagement.demographics.hasOwnProperty(yearKey)) {
      event.engagement.demographics[yearKey] += 1;
    }
  }

  await event.save();
  res.json({ success: true, engagement: event.engagement });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent
};
