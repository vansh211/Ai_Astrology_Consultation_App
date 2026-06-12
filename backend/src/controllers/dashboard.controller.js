const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');
const Consultation = require('../models/Consultation');
const AIAnalysis = require('../models/AIAnalysis');
const Review = require('../models/Review');

/**
 * Fetch Astrologer Dashboard statistics and chart aggregates
 */
exports.getAstrologerDashboard = async (req, res) => {
  try {
    const astrologer = await Astrologer.findOne({ userId: req.user.id });
    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer profile not found' });
    }

    const astrologerId = astrologer._id;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Core Card Stats
    const totalAppointments = await Appointment.countDocuments({ astrologerId });
    
    const upcomingAppointments = await Appointment.countDocuments({
      astrologerId,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: now }
    });

    const totalConsultations = await Consultation.countDocuments({ astrologerId });
    
    // Find unique clients (distinct)
    const uniqueClientsList = await Appointment.distinct('clientId', { astrologerId });
    const totalClients = uniqueClientsList.length;

    const averageRating = astrologer.rating;

    // 2. Keyword Frequency Count (Aggregate)
    const consultations = await Consultation.find({ astrologerId });
    const consultationIds = consultations.map(c => c._id);
    const analyses = await AIAnalysis.find({ consultationId: { $in: consultationIds } });
    
    const keywordMap = {};
    analyses.forEach((a) => {
      if (a.keywords && Array.isArray(a.keywords)) {
        a.keywords.forEach((keyword) => {
          keywordMap[keyword] = (keywordMap[keyword] || 0) + 1;
        });
      }
    });

    // Transform map to sorted list
    const keywordChart = Object.entries(keywordMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 keywords

    // 3. Monthly Consultations (Group by month in code for robust database compatibility)
    const monthlyMap = {};
    consultations.forEach((c) => {
      const date = new Date(c.createdAt);
      const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g. "Jun 2026"
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });

    const monthlyConsultationsChart = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count
    })).slice(-6); // last 6 months

    // 4. Ratings trend (Reviews sorted by date)
    const reviews = await Review.find({ astrologerId })
      .populate('clientId', 'name')
      .sort({ createdAt: 1 })
      .limit(10);

    const ratingsTrendChart = reviews.map((r, index) => ({
      label: `Review #${index + 1}`,
      rating: r.rating,
      reviewer: r.clientId ? r.clientId.name : 'Client'
    }));

    return res.status(200).json({
      cards: {
        totalClients,
        totalAppointments,
        upcomingAppointments,
        totalConsultations,
        averageRating
      },
      charts: {
        keywordChart,
        monthlyConsultationsChart,
        ratingsTrendChart
      },
      recentReviews: reviews.slice(-3).reverse() // last 3 reviews
    });
  } catch (error) {
    console.error('Astrologer Dashboard Error:', error);
    return res.status(500).json({ message: 'Error compiling dashboard statistics', error: error.message });
  }
};

/**
 * Fetch Client Dashboard statistics
 */
exports.getClientDashboard = async (req, res) => {
  const clientId = req.user.id;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  try {
    // 1. Upcoming appointments list
    const upcomingAppointments = await Appointment.find({
      clientId,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: now }
    })
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ date: 1, slot: 1 });

    // 2. Count of past consultations
    const totalConsultations = await Consultation.countDocuments({ clientId });

    // 3. Past consultations lists
    const consultations = await Consultation.find({ clientId })
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const populatedConsultations = await Promise.all(
      consultations.map(async (c) => {
        const analysis = await AIAnalysis.findOne({ consultationId: c._id }).select('summary sentiment keywords');
        return {
          ...c.toObject(),
          analysis
        };
      })
    );

    // 4. Unique favorite astrologers (Astrologers with whom they have had consultations)
    const astrologerIds = await Consultation.distinct('astrologerId', { clientId });
    const favoriteAstrologers = await Astrologer.find({ _id: { $in: astrologerIds } })
      .populate('userId', 'name')
      .limit(3);

    return res.status(200).json({
      cards: {
        upcomingCount: upcomingAppointments.length,
        pastConsultationsCount: totalConsultations,
        favoriteAstrologersCount: favoriteAstrologers.length
      },
      upcomingAppointments,
      pastConsultations: populatedConsultations,
      favoriteAstrologers
    });
  } catch (error) {
    console.error('Client Dashboard Error:', error);
    return res.status(500).json({ message: 'Error compiling client dashboard', error: error.message });
  }
};
