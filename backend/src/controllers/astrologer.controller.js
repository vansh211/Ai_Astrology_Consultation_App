const Astrologer = require('../models/Astrologer');
const Review = require('../models/Review');

/**
 * Get all astrologers (with optional filters: specialization, minRating, maxFee)
 */
exports.getAstrologers = async (req, res) => {
  const { specialization, minRating, maxFee } = req.query;
  
  let filter = { isActive: true };

  if (specialization) {
    filter.specialization = specialization;
  }

  if (minRating) {
    filter.rating = { $gte: parseFloat(minRating) };
  }

  if (maxFee) {
    filter.fee = { $lte: parseFloat(maxFee) };
  }

  try {
    const astrologers = await Astrologer.find(filter)
      .populate('userId', 'name email')
      .sort({ rating: -1, reviewsCount: -1 });

    return res.status(200).json(astrologers);
  } catch (error) {
    console.error('Fetch Astrologers Error:', error);
    return res.status(500).json({ message: 'Error fetching astrologers list', error: error.message });
  }
};

/**
 * Get single astrologer by ID (including populated user data & reviews list)
 */
exports.getAstrologerById = async (req, res) => {
  try {
    const astrologer = await Astrologer.findById(req.params.id)
      .populate('userId', 'name email');

    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Get astrologer reviews
    const reviews = await Review.find({ astrologerId: astrologer._id })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      astrologer,
      reviews
    });
  } catch (error) {
    console.error('Fetch Astrologer Details Error:', error);
    return res.status(500).json({ message: 'Error retrieving astrologer details', error: error.message });
  }
};

/**
 * Update astrologer profile and availability slots
 */
exports.updateProfile = async (req, res) => {
  const { experience, specialization, bio, fee, availability, profilePhoto } = req.body;

  try {
    // Find astrologer profile matching authenticated user ID
    let astrologer = await Astrologer.findOne({ userId: req.user.id });
    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer profile not found' });
    }

    // Update fields
    if (experience !== undefined) astrologer.experience = experience;
    if (specialization) astrologer.specialization = specialization;
    if (bio !== undefined) astrologer.bio = bio;
    if (fee !== undefined) astrologer.fee = fee;
    if (availability) astrologer.availability = availability;
    if (profilePhoto !== undefined) astrologer.profilePhoto = profilePhoto;

    await astrologer.save();
    
    // Return populated profile
    astrologer = await Astrologer.findById(astrologer._id).populate('userId', 'name email');

    return res.status(200).json({
      message: 'Profile updated successfully',
      astrologer
    });
  } catch (error) {
    console.error('Update Astrologer Profile Error:', error);
    return res.status(500).json({ message: 'Error updating professional profile', error: error.message });
  }
};
