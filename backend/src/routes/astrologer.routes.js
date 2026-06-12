const express = require('express');
const router = express.Router();
const astrologerController = require('../controllers/astrologer.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.get('/', astrologerController.getAstrologers);
router.get('/:id', astrologerController.getAstrologerById);
router.put('/profile', protect, restrictTo('astrologer'), astrologerController.updateProfile);

module.exports = router;
