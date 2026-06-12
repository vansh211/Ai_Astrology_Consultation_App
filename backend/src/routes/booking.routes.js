const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.post('/', protect, restrictTo('client'), bookingController.createAppointment);
router.get('/', protect, bookingController.getAppointments);
router.patch('/:id', protect, restrictTo('astrologer'), bookingController.updateAppointmentStatus);

module.exports = router;
