const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const { protect, restrictTo } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/upload', protect, restrictTo('astrologer'), upload.single('recording'), consultationController.uploadRecording);
router.get('/', protect, consultationController.getConsultations);
router.get('/comparison', protect, restrictTo('client'), consultationController.getComparison);
router.get('/:id', protect, consultationController.getConsultationById);
router.get('/:id/pdf', protect, consultationController.getPDFReport);
router.post('/:id/chat', protect, consultationController.chatConsultation);

module.exports = router;
