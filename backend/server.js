// backend/server.js
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const queryRoutes = require('./routes/queryRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api', queryRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Wellness RAG Backend',
    version: '1.0.0',
    mongoConnected: mongoose.connection.readyState === 1,
  })
})

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wellness RAG API',
    endpoints: {
      ask: 'POST /api/ask',
      feedback: 'POST /api/feedback',
      health: 'GET /api/health',
      stats: 'GET /api/stats',
    },
    documentation: 'See README for details',
  })
})

// 404 handler - must be the last route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'POST /api/ask',
      'POST /api/feedback',
      'GET /api/health',
      'GET /api/stats',
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err.stack)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  })
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas')

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
      console.log(`📝 API ready: http://localhost:${PORT}/`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

module.exports = app
