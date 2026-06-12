const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const jwt = require('jsonwebtoken');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_cosmic_jwt_key_12345', {
    expiresIn: '30d'
  });
};

/**
 * Register a new User (Client or Astrologer)
 */
exports.register = async (req, res) => {
  const { name, email, password, role, experience, specialization, bio, fee } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User record
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    let astrologerProfile = null;

    // If role is astrologer, initialize the professional profile
    if (role === 'astrologer') {
      if (experience === undefined || !specialization || fee === undefined) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: 'Astrologers require experience, specialization, and consultation fee parameters'
        });
      }

      astrologerProfile = await Astrologer.create({
        userId: user._id,
        experience,
        specialization,
        bio: bio || '',
        fee,
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
        ]
      });
    }

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      astrologer: astrologerProfile
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
};

/**
 * Login User
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    let astrologerProfile = null;
    if (user.role === 'astrologer') {
      astrologerProfile = await Astrologer.findOne({ userId: user._id });
    }

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      astrologer: astrologerProfile
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during login', error: error.message });
  }
};

/**
 * Get current user profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let astrologerProfile = null;
    if (user.role === 'astrologer') {
      astrologerProfile = await Astrologer.findOne({ userId: user._id });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      astrologer: astrologerProfile
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Internal server error fetching profile', error: error.message });
  }
};
