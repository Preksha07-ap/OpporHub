const express = require('express');
const router = express.Router();
const { getOrganizerAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/organizer')
  .get(protect, authorize('ORGANIZER'), getOrganizerAnalytics);

module.exports = router;
