const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    default: []
  },
  sentiment: {
    type: String,
    required: true
  },
  chatHistory: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
