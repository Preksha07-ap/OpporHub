const Event = require('../models/Event');
const Registration = require('../models/Registration');
const asyncHandler = require('express-async-handler');

// @desc    Get analytics for organizer
// @route   GET /api/analytics/organizer
// @access  Private/Organizer
const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // Total Events
  const totalEvents = await Event.countDocuments({ organizerId });

  // Find all events for this organizer
  const events = await Event.find({ organizerId }).select('_id title type capacity');
  const eventIds = events.map((event) => event._id);

  // Total Registrations
  const totalRegistrations = await Registration.countDocuments({
    eventId: { $in: eventIds },
  });

  // Registrations breakdown per event using Aggregation Pipeline
  const registrationsPerEvent = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    { $group: { _id: '$eventId', count: { $sum: 1 } } },
  ]);

  // Map aggregated count to the event object
  const eventPerformances = events.map((event) => {
    const regData = registrationsPerEvent.find((reg) => reg._id.toString() === event._id.toString());
    return {
      _id: event._id,
      title: event.title,
      type: event.type,
      capacity: event.capacity,
      registrations: regData ? regData.count : 0,
    };
  });

  res.json({
    totalEvents,
    totalRegistrations,
    eventPerformances,
  });
});

module.exports = {
  getOrganizerAnalytics
};
