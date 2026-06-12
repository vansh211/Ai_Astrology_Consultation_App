const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.get('/astrologer', protect, restrictTo('astrologer'), dashboardController.getAstrologerDashboard);
router.get('/client', protect, restrictTo('client'), dashboardController.getClientDashboard);

module.exports = router;
