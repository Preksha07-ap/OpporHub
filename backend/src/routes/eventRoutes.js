const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  trackEngagement
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .get(getEvents)
  .post(protect, authorize('ORGANIZER'), upload.single('coverImage'), createEvent);
router.route('/organizer/my')
  .get(protect, authorize('ORGANIZER'), getMyEvents);

router.route('/admin/pending')
  .get(protect, authorize('ADMIN'), getPendingEvents);

router.route('/admin/:id/approve')
  .put(protect, authorize('ADMIN'), approveEvent);

router.route('/admin/:id/reject')
  .put(protect, authorize('ADMIN'), rejectEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('ORGANIZER'), upload.single('coverImage'), updateEvent)
  .delete(protect, authorize('ORGANIZER'), deleteEvent);

router.post('/:id/track', trackEngagement);

module.exports = router;
