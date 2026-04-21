const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.post('/:eventId', protect, authorize('STUDENT'), registerForEvent);
router.get('/my', protect, authorize('STUDENT'), getMyRegistrations);
router.put('/:id/cancel', protect, authorize('STUDENT'), cancelRegistration);

// Organizer routes
router.get('/event/:eventId', protect, authorize('ORGANIZER'), getEventRegistrations);

module.exports = router;
