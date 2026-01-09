// backend/services/ragService.js
const safetyService = require('./safetyService')
const vectorService = require('./simpleVectorService')

class RAGService {
  constructor() {
    console.log('🧠 RAG Service initialized (simple keyword-based)')
  }

  async processQuery(query) {
    try {
      console.log(`🔍 Processing: "${query}"`)

      // 1. Safety check
      const safetyResult = safetyService.checkSafety(query)
      console.log('🛡️ Safety:', safetyResult.isUnsafe ? 'UNSAFE' : 'SAFE')

      // 2. Vector search for relevant chunks
      const chunks = await vectorService.searchSimilar(query, 3)
      console.log(`📚 Retrieved ${chunks.length} chunks`)

      // 3. Generate answer based on safety and chunks
      let answer
      if (safetyResult.isUnsafe) {
        answer = this.generateSafetyResponse(query, safetyResult)
      } else {
        answer = this.generateAnswerFromChunks(query, chunks)
      }

      // 4. Prepare response for API
      const response = {
        answer,
        sources: chunks.map((chunk, index) => ({
          id: chunk.chunk_id || `chunk_${index + 1}`,
          title: chunk.article_title || 'Yoga Knowledge',
          preview: chunk.content
            ? chunk.content.substring(0, 100) + '...'
            : 'No content',
          relevance: chunk.relevance_score
            ? chunk.relevance_score.toFixed(3)
            : '0.850',
        })),
        safety: {
          isUnsafe: safetyResult.isUnsafe,
          reason: safetyResult.reason,
          warning: safetyResult.isUnsafe
            ? this.getSafetyWarning(safetyResult)
            : null,
        },
      }

      console.log('✅ Response generated')
      return {
        success: true,
        data: response,
        retrieved_chunks: chunks,
      }
    } catch (error) {
      console.error('❌ RAG processing error:', error)
      return {
        success: false,
        error: error.message,
        data: {
          answer:
            "I'm having trouble accessing my yoga knowledge base. Please try again.",
          sources: [],
          safety: { isUnsafe: false, reason: '', warning: null },
        },
      }
    }
  }

  generateSafetyResponse(query, safetyResult) {
    const warningLevels = {
      high: '⚠️ HIGH RISK - ',
      low: 'ℹ️ NOTE - ',
    }

    const prefix =
      warningLevels[safetyResult.warningLevel] || warningLevels.high

    return `${prefix}${
      safetyResult.suggestion ||
      'Please consult a certified yoga therapist or doctor.'
    }`
  }

  generateAnswerFromChunks(query, chunks) {
    if (!chunks || chunks.length === 0) {
      return "I don't have specific information about that in my yoga knowledge base. Try asking about common poses like Downward Dog or benefits of yoga."
    }

    const queryLower = query.toLowerCase()
    const mainChunk = chunks[0]

    // Simple template-based answer generation
    if (
      queryLower.includes('benefit') ||
      queryLower.includes('good for') ||
      queryLower.includes('advantage')
    ) {
      return `According to yoga teachings: ${mainChunk.content} Regular practice provides these benefits and promotes overall wellbeing.`
    } else if (
      queryLower.includes('how to') ||
      queryLower.includes('perform') ||
      queryLower.includes('do ')
    ) {
      return `To practice safely: ${mainChunk.content} Remember to breathe deeply and listen to your body.`
    } else if (
      queryLower.includes('what is') ||
      queryLower.includes('define')
    ) {
      return `In yoga: ${mainChunk.content}`
    } else {
      return `Based on yoga knowledge: ${mainChunk.content}`
    }
  }

  getSafetyWarning(safetyResult) {
    return {
      title:
        safetyResult.warningLevel === 'high'
          ? 'SAFETY ADVISORY'
          : 'Safety Note',
      message: 'This requires professional guidance.',
      suggestion: safetyResult.suggestion,
    }
  }
}

module.exports = new RAGService()
