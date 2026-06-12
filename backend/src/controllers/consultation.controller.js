const fs = require('fs');
const path = require('path');
const Appointment = require('../models/Appointment');
const Astrologer = require('../models/Astrologer');
const Consultation = require('../models/Consultation');
const Transcript = require('../models/Transcript');
const AIAnalysis = require('../models/AIAnalysis');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { uploadToCloudinary } = require('../config/cloudinary');
const { transcribeAudio, analyzeTranscript, chatWithTranscript } = require('../config/ai');
const { sendConsultationUploaded } = require('../utils/email');
const { generateConsultationPDF } = require('../utils/pdf');

/**
 * Upload audio, run Whisper + Gemini pipelines, save records, send emails
 */
exports.uploadRecording = async (req, res) => {
  const { appointmentId, notes } = req.body;

  if (!appointmentId) {
    if (req.file) fs.unlinkSync(req.file.path); // clean up
    return res.status(400).json({ message: 'Appointment ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Audio recording file is required' });
  }

  try {
    // 1. Fetch appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('clientId', 'name email')
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!appointment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Appointment booking not found' });
    }

    // Verify updating user matches the astrologer assigned
    if (appointment.astrologerId.userId._id.toString() !== req.user.id.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Not authorized to upload recordings for this appointment' });
    }

    // 2. Upload recording (Cloudinary or local Relative url fallback)
    console.log('Uploading consultation recording...');
    const uploadResult = await uploadToCloudinary(req.file.path);

    // 3. Trigger Whisper Speech-to-Text
    console.log('Running Whisper transcription...');
    const specialization = appointment.astrologerId.specialization;
    const transcriptText = await transcribeAudio(req.file.path, specialization);

    // 4. Trigger Gemini analysis (Summary, Keywords, Sentiment)
    console.log('Running Gemini transcript analysis...');
    const analysisResult = await analyzeTranscript(transcriptText, specialization);

    // 5. Create Database entries
    const consultation = await Consultation.create({
      appointmentId: appointment._id,
      clientId: appointment.clientId._id,
      astrologerId: appointment.astrologerId._id,
      recordingUrl: uploadResult.url,
      recordingPublicId: uploadResult.publicId,
      notes: notes || ''
    });

    const transcript = await Transcript.create({
      consultationId: consultation._id,
      text: transcriptText
    });

    const aiAnalysis = await AIAnalysis.create({
      consultationId: consultation._id,
      summary: analysisResult.summary,
      keywords: analysisResult.keywords,
      sentiment: analysisResult.sentiment,
      chatHistory: []
    });

    // 6. Complete appointment status
    appointment.status = 'completed';
    await appointment.save();

    // 7. Clean up local uploaded file only if successfully pushed to Cloudinary
    if (uploadResult.isCloud) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temporary upload file cleared.');
      } catch (err) {
        console.error('Error unlinking temp file:', err);
      }
    }

    // 8. Send Notifications & Emails
    await Notification.create({
      recipientId: appointment.clientId._id,
      title: 'Consultation Report Ready',
      message: `Your consultation recording and AI insights from Dr. ${appointment.astrologerId.userId.name} are now available.`,
      type: 'consultation_uploaded'
    });

    await sendConsultationUploaded(consultation, appointment.clientId, appointment.astrologerId.userId);

    return res.status(201).json({
      message: 'Consultation records and AI analysis generated successfully',
      consultation,
      transcript,
      aiAnalysis
    });
  } catch (error) {
    console.error('Consultation Processing Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: 'Error processing consultation media', error: error.message });
  }
};

/**
 * Get past consultations list
 */
exports.getConsultations = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query.clientId = req.user.id;
    } else {
      const astrologer = await Astrologer.findOne({ userId: req.user.id });
      if (!astrologer) {
        return res.status(404).json({ message: 'Astrologer profile not found' });
      }
      query.astrologerId = astrologer._id;
    }

    const consultations = await Consultation.find(query)
      .populate('clientId', 'name email')
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Fetch summaries/analysis and map them together
    const populatedList = await Promise.all(
      consultations.map(async (c) => {
        const analysis = await AIAnalysis.findOne({ consultationId: c._id }).select('summary keywords sentiment');
        return {
          ...c.toObject(),
          analysis
        };
      })
    );

    return res.status(200).json(populatedList);
  } catch (error) {
    console.error('Get Consultations Error:', error);
    return res.status(500).json({ message: 'Error fetching consultations history', error: error.message });
  }
};

/**
 * Get detailed consultation report (with transcript and analysis)
 */
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Check authorization: must be either the client or the astrologer
    const isClient = consultation.clientId._id.toString() === req.user.id.toString();
    const isAstrologer = consultation.astrologerId.userId._id.toString() === req.user.id.toString();
    if (!isClient && !isAstrologer) {
      return res.status(403).json({ message: 'Not authorized to view this consultation' });
    }

    const transcript = await Transcript.findOne({ consultationId: consultation._id });
    const aiAnalysis = await AIAnalysis.findOne({ consultationId: consultation._id });

    return res.status(200).json({
      consultation,
      transcript: transcript ? transcript.text : '',
      aiAnalysis
    });
  } catch (error) {
    console.error('Get Consultation Details Error:', error);
    return res.status(500).json({ message: 'Error fetching consultation details', error: error.message });
  }
};

/**
 * Stream professional PDF report
 */
exports.getPDFReport = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const isClient = consultation.clientId._id.toString() === req.user.id.toString();
    const isAstrologer = consultation.astrologerId.userId._id.toString() === req.user.id.toString();
    if (!isClient && !isAstrologer) {
      return res.status(403).json({ message: 'Not authorized to access report' });
    }

    const transcript = await Transcript.findOne({ consultationId: consultation._id });
    const aiAnalysis = await AIAnalysis.findOne({ consultationId: consultation._id });

    const clientName = consultation.clientId.name;
    const astrologerName = consultation.astrologerId.userId.name;
    const specialization = consultation.astrologerId.specialization;

    generateConsultationPDF(
      res,
      consultation,
      transcript ? transcript.text : '',
      aiAnalysis || {},
      clientName,
      astrologerName,
      specialization
    );
  } catch (error) {
    console.error('PDF Report Generation Error:', error);
    return res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
  }
};

/**
 * RAG Chat session
 */
exports.chatConsultation = async (req, res) => {
  const { query } = req.body;
  const consultationId = req.params.id;

  if (!query) {
    return res.status(400).json({ message: 'Chat query is required' });
  }

  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify role permissions
    const isClient = consultation.clientId.toString() === req.user.id.toString();
    const isAstrologer = await Astrologer.findOne({ userId: req.user.id, _id: consultation.astrologerId });
    if (!isClient && !isAstrologer) {
      return res.status(403).json({ message: 'Not authorized to chat about this consultation' });
    }

    const transcript = await Transcript.findOne({ consultationId });
    const aiAnalysis = await AIAnalysis.findOne({ consultationId });

    if (!transcript || !aiAnalysis) {
      return res.status(400).json({ message: 'AI transcription and analysis records are missing for this session' });
    }

    // Send context, query, and chat logs to Gemini/Mock
    const updatedHistory = await chatWithTranscript(transcript.text, aiAnalysis.chatHistory, query);
    
    // Save updated history
    aiAnalysis.chatHistory = updatedHistory;
    await aiAnalysis.save();

    return res.status(200).json({
      history: updatedHistory
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ message: 'AI processing failure in chat session', error: error.message });
  }
};

/**
 * Get side-by-side comparison trends for client consultations
 */
exports.getComparison = async (req, res) => {
  try {
    const consultations = await Consultation.find({ clientId: req.user.id })
      .populate({
        path: 'astrologerId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: 1 });

    const comparisonData = await Promise.all(
      consultations.map(async (c) => {
        const analysis = await AIAnalysis.findOne({ consultationId: c._id });
        const appointment = await Appointment.findById(c.appointmentId);
        
        // Find review if exists
        const review = await Appointment.findOne({ appointmentId: c.appointmentId }); // reviews are checked by appointment
        
        return {
          id: c._id,
          date: c.createdAt,
          astrologer: c.astrologerId.userId.name,
          specialization: c.astrologerId.specialization,
          sentiment: analysis ? analysis.sentiment : 'Neutral',
          keywords: analysis ? analysis.keywords : [],
          summary: analysis ? analysis.summary : '',
          remedies: c.notes || ''
        };
      })
    );

    return res.status(200).json(comparisonData);
  } catch (error) {
    console.error('Get Comparison Error:', error);
    return res.status(500).json({ message: 'Error retrieving comparative data', error: error.message });
  }
};
