const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { queueToday } = require('../controllers/appointments.controller');

const router = express.Router();

// Entire queue namespace is staff/admin only.
router.use(auth, authorize('staff', 'admin'));

router.get('/today', queueToday);

module.exports = router;
