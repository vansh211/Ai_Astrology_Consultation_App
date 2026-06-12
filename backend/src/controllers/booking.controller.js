const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendBookingConfirmation } = require('../utils/email');

/**
 * Request/Create a new appointment slot booking
 */
exports.createAppointment = async (req, res) => {
  const { astrologerId, date, slot, notes } = req.body;

  if (!astrologerId || !date || !slot) {
    return res.status(400).json({ message: 'Astrologer ID, date, and slot are required' });
  }

  try {
    // Check if astrologer profile exists
    const astrologer = await Astrologer.findById(astrologerId).populate('userId', 'name');
    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Check if slot is already booked for this astrologer on this date
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const conflictingBooking = await Appointment.findOne({
      astrologerId,
      date: bookingDate,
      slot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'This time slot is already requested or booked' });
    }

    // Create the appointment (defaults to pending)
    const appointment = await Appointment.create({
      clientId: req.user.id,
      astrologerId,
      date: bookingDate,
      slot,
      notes: notes || ''
    });

    // Create notifications for the astrologer user
    await Notification.create({
      recipientId: astrologer.userId._id,
      title: 'New Appointment Booking Request',
      message: `Client ${req.user.name} has requested a consultation slot on ${bookingDate.toLocaleDateString()} at ${slot}.`,
      type: 'appointment_booked'
    });

    return res.status(201).json({
      message: 'Appointment booking requested successfully',
      appointment
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    return res.status(500).json({ message: 'Error scheduling appointment', error: error.message });
  }
};

/**
 * Astrologer confirms, cancels, or completes booking requests
 */
exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const appointmentId = req.params.id;

  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status target' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('clientId', 'name email')
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment booking not found' });
    }

    // Ensure the updating user is the owner astrologer of the slot
    if (appointment.astrologerId.userId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }

    appointment.status = status;
    await appointment.save();

    // Create notification for the client user
    let title = '';
    let message = '';

    if (status === 'confirmed') {
      title = 'Appointment Confirmed';
      message = `Your consultation with Dr. ${appointment.astrologerId.userId.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot} has been confirmed.`;
      
      // Dispatch Nodemailer booking confirmation email
      await sendBookingConfirmation(appointment, appointment.clientId, appointment.astrologerId.userId);
    } else if (status === 'cancelled') {
      title = 'Appointment Cancelled';
      message = `Your consultation with Dr. ${appointment.astrologerId.userId.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot} has been cancelled.`;
    } else if (status === 'completed') {
      title = 'Consultation Completed';
      message = `Your consultation session with Dr. ${appointment.astrologerId.userId.name} has concluded. Recording details will be posted shortly.`;
    }

    await Notification.create({
      recipientId: appointment.clientId._id,
      title,
      message,
      type: status === 'confirmed' ? 'appointment_confirmed' : 'reminder'
    });

    return res.status(200).json({
      message: `Appointment status successfully updated to ${status}`,
      appointment
    });
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    return res.status(500).json({ message: 'Error updating appointment state', error: error.message });
  }
};

/**
 * Get appointments list based on current user role (Client vs Astrologer)
 */
exports.getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'client') {
      // Find appointments booked by this client
      appointments = await Appointment.find({ clientId: req.user.id })
        .populate({
          path: 'astrologerId',
          populate: { path: 'userId', select: 'name email' }
        })
        .sort({ date: -1, slot: 1 });
    } else {
      // Find professional profile of the astrologer
      const astrologer = await Astrologer.findOne({ userId: req.user.id });
      if (!astrologer) {
        return res.status(404).json({ message: 'Astrologer profile not found' });
      }

      // Find appointments scheduled with this astrologer
      appointments = await Appointment.find({ astrologerId: astrologer._id })
        .populate('clientId', 'name email')
        .sort({ date: -1, slot: 1 });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Fetch Appointments Error:', error);
    return res.status(500).json({ message: 'Error retrieving appointments list', error: error.message });
  }
};
