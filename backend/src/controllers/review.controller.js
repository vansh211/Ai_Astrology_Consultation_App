const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');

/**
 * Submit a review for a completed appointment
 */
exports.createReview = async (req, res) => {
  const { appointmentId, rating, reviewText } = req.body;

  if (!appointmentId || rating === undefined) {
    return res.status(400).json({ message: 'Appointment ID and rating (1-5) are required' });
  }

  const numericRating = Number(rating);
  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
  }

  try {
    // 1. Fetch completed appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if client is authorized
    if (appointment.clientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this appointment' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed consultations' });
    }

    // 2. Check if a review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this appointment' });
    }

    // 3. Create Review
    const review = await Review.create({
      clientId: req.user.id,
      astrologerId: appointment.astrologerId,
      appointmentId,
      rating: numericRating,
      reviewText: reviewText || ''
    });

    // 4. Update Astrologer average rating and count
    const astrologer = await Astrologer.findById(appointment.astrologerId);
    if (astrologer) {
      const allReviews = await Review.find({ astrologerId: astrologer._id });
      
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const count = allReviews.length;
      
      astrologer.reviewsCount = count;
      astrologer.rating = Number((totalRating / count).toFixed(2));
      await astrologer.save();
    }

    return res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Submit Review Error:', error);
    return res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
};
