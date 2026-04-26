const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
