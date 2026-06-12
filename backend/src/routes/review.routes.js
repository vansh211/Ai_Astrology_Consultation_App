const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.post('/', protect, restrictTo('client'), reviewController.createReview);

module.exports = router;
