const nodemailer = require('nodemailer');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM || 'no-reply@tumharapandit.com';

let transporter = null;

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
  });
  console.log('Nodemailer SMTP transporter initialized.');
} else {
  console.log('Nodemailer credentials missing. Emails will be logged to console in Mock Mode.');
}

/**
 * Sends email (falls back to console logging if credentials are missing)
 */
const sendMail = async ({ to, subject, html }) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log(`Email successfully sent to: ${to}`);
      return true;
    } catch (error) {
      console.error(`Nodemailer failed to send email to ${to}:`, error.message);
    }
  }

  // MOCK EMAIL LOGGING
  console.log('\n=================== MOCK EMAIL SENT ===================');
  console.log(`FROM:    ${from}`);
  console.log(`TO:      ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:`);
  // Simple HTML strip for clean terminal display
  const textBody = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(textBody);
  console.log('========================================================\n');
  return true;
};

/**
 * Sends Appointment Confirmation Email
 */
const sendBookingConfirmation = async (appointment, clientUser, astrologerUser) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background: #0b0a13; color: #f8fafc;">
      <h2 style="color: #fde047; text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Appointment Confirmed!</h2>
      <p>Dear ${clientUser.name},</p>
      <p>Your astrology consultation request has been successfully confirmed. Here are the booking details:</p>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #fde047; margin: 20px 0;">
        <strong>Astrologer:</strong> Dr./Prof. ${astrologerUser.name}<br/>
        <strong>Date:</strong> ${dateStr}<br/>
        <strong>Time Slot:</strong> ${appointment.slot}<br/>
        <strong>Status:</strong> Confirmed
      </div>
      <p>Please log in to your Client Portal at the scheduled time to conduct your consultation.</p>
      <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">Cosmic Astrology Consultations &copy; 2026</p>
    </div>
  `;

  return sendMail({
    to: clientUser.email,
    subject: `Appointment Confirmed with ${astrologerUser.name}`,
    html
  });
};

/**
 * Sends Consultation Uploaded Email (includes AI Report notification)
 */
const sendConsultationUploaded = async (consultation, clientUser, astrologerUser) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background: #0b0a13; color: #f8fafc;">
      <h2 style="color: #fde047; text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Consultation Report Available</h2>
      <p>Dear ${clientUser.name},</p>
      <p>Your recent consultation recording and AI-generated astrological report from <strong>Dr./Prof. ${astrologerUser.name}</strong> are now available in your portal.</p>
      <p>Log in to view:</p>
      <ul>
        <li>Audio recording playback</li>
        <li>Full speech-to-text transcript</li>
        <li>AI summaries, keywords, and sentiment trends</li>
        <li>Astrologer remedies and prescriptions</li>
        <li>Downloadable PDF report and Interactive Chatbot</li>
      </ul>
      <div style="text-align: center; margin: 35px 0;">
        <a href="http://localhost:3000/consultations/${consultation._id}" style="background: #7c3aed; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Consultation Details</a>
      </div>
      <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">Cosmic Astrology Consultations &copy; 2026</p>
    </div>
  `;

  return sendMail({
    to: clientUser.email,
    subject: `Consultation Recording & AI Report Available`,
    html
  });
};

/**
 * Sends 24-hour Reminder Email
 */
const sendReminderEmail = async (appointment, clientUser, astrologerUser) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background: #0b0a13; color: #f8fafc;">
      <h2 style="color: #fde047; text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Appointment Reminder - 24 Hours</h2>
      <p>Dear ${clientUser.name},</p>
      <p>This is a reminder that your upcoming astrology consultation is scheduled in less than 24 hours.</p>
      <div style="background: rgba(124, 58, 237, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #fde047; margin: 20px 0;">
        <strong>Astrologer:</strong> Dr./Prof. ${astrologerUser.name}<br/>
        <strong>Date:</strong> ${dateStr}<br/>
        <strong>Time Slot:</strong> ${appointment.slot}<br/>
      </div>
      <p>Please ensure you have a stable internet connection for the consultation.</p>
      <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">Cosmic Astrology Consultations &copy; 2026</p>
    </div>
  `;

  return sendMail({
    to: clientUser.email,
    subject: `Reminder: Consultation scheduled tomorrow with ${astrologerUser.name}`,
    html
  });
};

/**
 * Scans DB and dispatches 24h reminder emails to users.
 * To be run at daily intervals.
 */
const checkAndSendReminders = async () => {
  console.log('Running scheduled 24-hour reminder check...');
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 1hr window

    // Find confirmed appointments starting tomorrow that haven't sent reminders
    const appointments = await Appointment.find({
      status: 'confirmed',
      reminderSent: false,
      date: { $gte: tomorrow, $lte: dayAfterTomorrow }
    }).populate('clientId').populate({
      path: 'astrologerId',
      populate: { path: 'userId' }
    });

    console.log(`Found ${appointments.length} appointments for tomorrow requiring reminders.`);

    for (const app of appointments) {
      if (app.clientId && app.astrologerId && app.astrologerId.userId) {
        await sendReminderEmail(app, app.clientId, app.astrologerId.userId);
        app.reminderSent = true;
        await app.save();
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders process:', error.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendConsultationUploaded,
  checkAndSendReminders
};
