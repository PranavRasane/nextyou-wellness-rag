const mongoose = require('mongoose')

const chunkSchema = new mongoose.Schema({
  chunk_id: { type: String, required: true },
  article_title: { type: String, required: true },
  content: { type: String, required: true },
  relevance_score: { type: Number, required: true },
})

const querySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  retrieved_chunks: {
    type: [chunkSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0
      },
      message: 'At least one chunk must be retrieved',
    },
  },
  answer: {
    type: String,
    required: true,
  },
  isUnsafe: {
    type: Boolean,
    default: false,
    required: true,
  },
  safety_reason: {
    type: String,
    default: '',
  },
  safety_suggestion: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  user_feedback: {
    helpful: { type: Boolean, default: null },
    feedback_text: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
})

// Index for faster queries
querySchema.index({ timestamp: -1 })
querySchema.index({ isUnsafe: 1 })

module.exports = mongoose.model('Query', querySchema)
