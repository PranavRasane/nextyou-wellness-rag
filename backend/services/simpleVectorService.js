const { pipeline } = require('@xenova/transformers')
const fs = require('fs').promises
const path = require('path')

class SimpleVectorService {
  constructor() {
    this.embedder = null
    this.chunks = []
    this.embeddings = []
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('Initializing simple vector service...')

      // Load embedding model
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      )

      // Load yoga chunks from file
      const dataPath = path.join(__dirname, '../data/yoga_chunks.json')
      try {
        const data = await fs.readFile(dataPath, 'utf8')
        const parsed = JSON.parse(data)
        this.chunks = parsed.chunks || []
        this.embeddings = parsed.embeddings || []

        console.log(`Loaded ${this.chunks.length} yoga chunks`)
      } catch (error) {
        console.log('No existing chunks found. Using sample data.')
        await this.loadSampleData()
      }

      this.isInitialized = true
      console.log('Simple vector service initialized')
    } catch (error) {
      console.error('Failed to initialize vector service:', error)
      // Still mark as initialized to prevent repeated errors
      this.isInitialized = true
      await this.loadSampleData()
    }
  }

  async loadSampleData() {
    this.chunks = [
      {
        chunk_id: 'sample_001',
        article_title: 'Introduction to Yoga',
        content:
          'Yoga is a 5,000-year-old practice from India that combines physical postures, breathing exercises, and meditation.',
        article_url: '',
        pose_type: 'general',
      },
      {
        chunk_id: 'sample_002',
        article_title: 'Benefits of Daily Practice',
        content:
          'Regular yoga practice improves flexibility, strength, posture, and reduces stress. It also enhances mental clarity.',
        article_url: '',
        pose_type: 'general',
      },
      {
        chunk_id: 'sample_003',
        article_title: 'Mountain Pose (Tadasana)',
        content:
          'Stand tall with feet together, weight evenly distributed. Engage thighs, lengthen spine, and relax shoulders. Breathe deeply.',
        article_url: '',
        pose_type: 'beginner',
      },
      {
        chunk_id: 'sample_004',
        article_title: 'Downward Facing Dog',
        content:
          'Start on hands and knees. Lift hips up and back, forming an inverted V shape. Keep hands shoulder-width apart.',
        article_url: '',
        pose_type: 'beginner',
      },
      {
        chunk_id: 'sample_005',
        article_title: 'Childs Pose (Balasana)',
        content:
          'Kneel on floor, sit back on heels, fold forward resting forehead on ground. Arms can be extended or alongside body.',
        article_url: '',
        pose_type: 'restorative',
      },
    ]

    // Create simple embeddings for sample data
    this.embeddings = this.chunks.map((chunk, index) => {
      return this.createSimpleEmbedding(chunk.content, index)
    })
  }

  createSimpleEmbedding(text, seed) {
    // Create a simple deterministic embedding
    const embedding = new Array(384).fill(0)
    const hash = text
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), seed)

    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin(hash + i * 0.1) * 0.5
    }

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    )
    if (magnitude > 0) {
      return embedding.map((val) => val / magnitude)
    }

    return embedding
  }

  async embedText(text) {
    await this.initialize()

    try {
      if (this.embedder) {
        const result = await this.embedder(text, {
          pooling: 'mean',
          normalize: true,
        })
        return Array.from(result.data)
      }
    } catch (error) {
      console.log('Using fallback embedding:', error.message)
    }

    // Fallback embedding
    return this.createSimpleEmbedding(text, 0)
  }

  cosineSimilarity(vecA, vecB) {
    let dot = 0,
      magA = 0,
      magB = 0

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i]
      magA += vecA[i] * vecA[i]
      magB += vecB[i] * vecB[i]
    }

    magA = Math.sqrt(magA)
    magB = Math.sqrt(magB)

    if (magA === 0 || magB === 0) return 0
    return dot / (magA * magB)
  }

  async searchSimilar(query, k = 3) {
    await this.initialize()

    try {
      // Embed the query
      const queryVector = await this.embedText(query)

      // Calculate similarities
      const similarities = this.embeddings.map((embedding, idx) => ({
        index: idx,
        similarity: this.cosineSimilarity(queryVector, embedding),
      }))

      // Sort by similarity
      similarities.sort((a, b) => b.similarity - a.similarity)

      // Get top k results
      const results = []
      for (let i = 0; i < Math.min(k, similarities.length); i++) {
        const { index, similarity } = similarities[i]
        const chunk = this.chunks[index]

        results.push({
          chunk_id: chunk.chunk_id,
          article_title: chunk.article_title,
          content: chunk.content,
          relevance_score: similarity,
          article_url: chunk.article_url || '',
          pose_type: chunk.pose_type || 'general',
        })
      }

      return results
    } catch (error) {
      console.error('Vector search failed:', error)
      // Return first k chunks as fallback
      return this.chunks.slice(0, k).map((chunk, idx) => ({
        ...chunk,
        relevance_score: 0.9 - idx * 0.1,
      }))
    }
  }
}

module.exports = new SimpleVectorService()
