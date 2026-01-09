// backend/routes/queryRoutes.js
const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const ragService = require('../services/ragService');

// POST /api/ask - Main RAG endpoint
router.post('/ask', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const trimmedQuery = query.trim();
    console.log(`📨 Received query: "${trimmedQuery}"`);
    
    // Process through RAG pipeline
    const ragResult = await ragService.processQuery(trimmedQuery);
    
    // Create database document
    const queryDoc = new Query({
      query: trimmedQuery,
      retrieved_chunks: ragResult.retrieved_chunks || [],
      answer: ragResult.data.answer,
      isUnsafe: ragResult.data.safety.isUnsafe,
      safety_reason: ragResult.data.safety.reason,
      safety_suggestion: ragResult.data.safety.warning?.suggestion || '',
      timestamp: new Date()
    });

    // Save to MongoDB
    await queryDoc.save();
    console.log(`💾 Saved to MongoDB with ID: ${queryDoc._id}`);
    
    // Return response
    res.json({
      success: true,
      data: ragResult.data,
      queryId: queryDoc._id,
      timestamp: queryDoc.timestamp
    });
    
  } catch (error) {
    console.error('❌ /api/ask error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/feedback - Collect user feedback
router.post('/feedback', async (req, res) => {
  try {
    const { queryId, helpful, feedback_text } = req.body;
    
    if (!queryId) {
      return res.status(400).json({
        success: false,
        error: 'Query ID is required'
      });
    }

    const updated = await Query.findByIdAndUpdate(
      queryId,
      {
        'user_feedback.helpful': helpful,
        'user_feedback.feedback_text': feedback_text || '',
        'user_feedback.timestamp': new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Query not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback saved successfully',
      data: {
        queryId: updated._id,
        helpful: updated.user_feedback.helpful
      }
    });
    
  } catch (error) {
    console.error('❌ /api/feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save feedback'
    });
  }
});

// GET /api/stats - Get basic statistics
router.get('/stats', async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();
    const unsafeQueries = await Query.countDocuments({ isUnsafe: true });
    const recentQueries = await Query.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('query timestamp isUnsafe safety_reason');

    res.json({
      success: true,
      data: {
        totalQueries,
        unsafeQueries,
        unsafePercentage: totalQueries > 0 ? ((unsafeQueries / totalQueries) * 100).toFixed(1) : 0,
        recentQueries
      }
    });
  } catch (error) {
    console.error('❌ /api/stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;