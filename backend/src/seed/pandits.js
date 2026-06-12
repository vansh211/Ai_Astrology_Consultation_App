const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

const DEFAULT_AVAILABILITY = [
  { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { day: 'Saturday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM'] },
];

const DEFAULT_PANDITS = [
  {
    name: 'Pandit Ram Sharma',
    email: 'ram.sharma@tumharapandit.com',
    password: 'pandit123',
    experience: 22,
    specialization: 'Vedic Astrology',
    bio: 'Renowned Vedic astrologer with over two decades of experience in birth chart analysis, dasha predictions, and remedial solutions.',
    fee: 499,
    rating: 4.9,
    reviewsCount: 128,
    profilePhoto: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Pandit Amrita Devi',
    email: 'amrita.devi@tumharapandit.com',
    password: 'pandit123',
    experience: 15,
    specialization: 'Love & Relationships',
    bio: 'Specialist in love compatibility, marriage timing, and relationship remedies through traditional Jyotish principles.',
    fee: 599,
    rating: 4.8,
    reviewsCount: 96,
    profilePhoto: 'https://images.unsplash.com/photo-1583394838336-acd9777366e8?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Pandit Vikram Singh',
    email: 'vikram.singh@tumharapandit.com',
    password: 'pandit123',
    experience: 18,
    specialization: 'Kundli & Matchmaking',
    bio: 'Expert in Gun Milan, Kundli matching, and manglik dosha analysis for harmonious marital alliances.',
    fee: 699,
    rating: 4.7,
    reviewsCount: 84,
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Pandit Suresh Joshi',
    email: 'suresh.joshi@tumharapandit.com',
    password: 'pandit123',
    experience: 25,
    specialization: 'Career & Finance',
    bio: 'Guides clients on career transitions, business ventures, and financial prosperity through planetary transit analysis.',
    fee: 799,
    rating: 4.9,
    reviewsCount: 142,
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Pandit Meera Patel',
    email: 'meera.patel@tumharapandit.com',
    password: 'pandit123',
    experience: 12,
    specialization: 'Numerology',
    bio: 'Combines numerology with astrology to reveal life path numbers, lucky dates, and name correction guidance.',
    fee: 449,
    rating: 4.6,
    reviewsCount: 67,
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Pandit Arjun Mishra',
    email: 'arjun.mishra@tumharapandit.com',
    password: 'pandit123',
    experience: 10,
    specialization: 'Tarot Reading',
    bio: 'Intuitive tarot reader offering clarity on life decisions, spiritual growth, and future possibilities.',
    fee: 399,
    rating: 4.5,
    reviewsCount: 53,
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  },
];

const seedPandits = async () => {
  try {
    const existing = await User.findOne({ email: DEFAULT_PANDITS[0].email });
    if (existing) {
      console.log('Default pandits already seeded — skipping.');
      return;
    }

    for (const pandit of DEFAULT_PANDITS) {
      const user = await User.create({
        name: pandit.name,
        email: pandit.email,
        password: pandit.password,
        role: 'astrologer',
      });

      await Astrologer.create({
        userId: user._id,
        experience: pandit.experience,
        specialization: pandit.specialization,
        bio: pandit.bio,
        fee: pandit.fee,
        rating: pandit.rating,
        reviewsCount: pandit.reviewsCount,
        profilePhoto: pandit.profilePhoto,
        availability: DEFAULT_AVAILABILITY,
        isActive: true,
      });
    }

    console.log(`Seeded ${DEFAULT_PANDITS.length} default pandits for Tumhara Pandit.`);
  } catch (error) {
    console.error('Pandit seed error:', error.message);
  }
};

module.exports = seedPandits;
