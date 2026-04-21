const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .get(getEvents)
  .post(protect, authorize('ORGANIZER'), upload.single('coverImage'), createEvent);
router.route('/organizer/my')
  .get(protect, authorize('ORGANIZER'), getMyEvents);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('ORGANIZER'), upload.single('coverImage'), updateEvent)
  .delete(protect, authorize('ORGANIZER'), deleteEvent);

module.exports = router;
