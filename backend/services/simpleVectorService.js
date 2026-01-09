// backend/services/simpleVectorService.js - Updated for CommonJS
class SimpleVectorService {
  constructor() {
    this.chunks = [
      {
        chunk_id: 'chunk_001',
        article_title: 'Introduction to Yoga',
        content:
          'Yoga is a 5,000-year-old practice from India that combines physical postures (asanas), breathing exercises (pranayama), and meditation to promote physical and mental wellbeing.',
        relevance_score: 0.95,
        pose_type: 'general',
      },
      {
        chunk_id: 'chunk_002',
        article_title: 'Benefits of Regular Practice',
        content:
          'Regular yoga practice improves flexibility, strength, posture, and balance. It reduces stress, anxiety, and helps with sleep quality. Yoga also enhances mental clarity and focus.',
        relevance_score: 0.92,
        pose_type: 'general',
      },
      {
        chunk_id: 'chunk_003',
        article_title: 'Downward Dog (Adho Mukha Svanasana)',
        content:
          'Start on hands and knees. Lift hips up and back, forming an inverted V shape. Hands shoulder-width, feet hip-width. Lengthen spine and press heels toward floor. Great for stretching hamstrings and strengthening arms.',
        relevance_score: 0.9,
        pose_type: 'beginner',
      },
      {
        chunk_id: 'chunk_004',
        article_title: 'Mountain Pose (Tadasana)',
        content:
          'Stand tall with feet together or hip-width apart. Weight evenly distributed. Engage thighs, lengthen spine, relax shoulders. Arms can be at sides or overhead. Focus on grounding and alignment.',
        relevance_score: 0.88,
        pose_type: 'beginner',
      },
      {
        chunk_id: 'chunk_005',
        article_title: 'Childs Pose (Balasana)',
        content:
          'Restorative pose. Kneel on floor, sit back on heels, fold forward resting forehead on ground. Arms can be extended forward or alongside body. Excellent for relaxation and stress relief.',
        relevance_score: 0.87,
        pose_type: 'restorative',
      },
      {
        chunk_id: 'chunk_006',
        article_title: 'Safety Precautions',
        content:
          'Always listen to your body. Never push into pain. If you have medical conditions (hernia, glaucoma, high blood pressure, pregnancy) consult a doctor before practicing. Use props for support when needed.',
        relevance_score: 0.85,
        pose_type: 'safety',
      },
    ]

    // Simple keyword matching for similarity
    this.keywordMap = {
      benefit: [0, 1], // chunk indices
      'good for': [0, 1],
      stress: [1, 5],
      flexibility: [1],
      'downward dog': [2],
      'mountain pose': [3],
      tadasana: [3],
      'child pose': [4],
      balasana: [4],
      rest: [4, 5],
      safe: [5],
      pregnant: [5],
      medical: [5],
      beginner: [2, 3, 4],
      'how to': [2, 3, 4],
    }
  }

  async searchSimilar(query, k = 3) {
    const lowerQuery = query.toLowerCase()
    const scores = new Array(this.chunks.length).fill(0)

    // Score based on keyword matching
    for (const [keyword, chunkIndices] of Object.entries(this.keywordMap)) {
      if (lowerQuery.includes(keyword)) {
        chunkIndices.forEach((idx) => {
          scores[idx] += 1
        })
      }
    }

    // Add base score for all chunks
    this.chunks.forEach((_, idx) => {
      scores[idx] += 0.1 // Small base score
    })

    // Get top k indices
    const indexedScores = scores.map((score, idx) => ({ idx, score }))
    indexedScores.sort((a, b) => b.score - a.score)

    const results = []
    for (let i = 0; i < Math.min(k, indexedScores.length); i++) {
      const { idx, score } = indexedScores[i]
      const chunk = this.chunks[idx]

      // Convert score to relevance (0.7 to 0.95 range)
      const relevance = 0.7 + (score / 10) * 0.25

      results.push({
        ...chunk,
        relevance_score: Math.min(0.95, relevance),
      })
    }

    // If no matches, return first k chunks
    if (results.length === 0) {
      return this.chunks.slice(0, k).map((chunk) => ({
        ...chunk,
        relevance_score: 0.85,
      }))
    }

    return results
  }
}

module.exports = new SimpleVectorService()
