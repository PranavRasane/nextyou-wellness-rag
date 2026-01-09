class SafetyService {
  constructor() {
    this.unsafeKeywords = {
      pregnancy: [
        'pregnant',
        'pregnancy',
        'trimester',
        'expecting',
        'baby',
        'gestation',
        'maternity',
        'postpartum',
        'prenatal',
        'antenatal',
        'conception',
        'fertility',
      ],
      medical: [
        'hernia',
        'glaucoma',
        'blood pressure',
        'hypertension',
        'surgery',
        'operation',
        'injury',
        'fracture',
        'sprain',
        'heart condition',
        'cardiac',
        'migraine',
        'vertigo',
        'osteoporosis',
        'arthritis',
        'carpal tunnel',
        'sciatica',
        'diabetes',
        'asthma',
        'epilepsy',
        'cancer',
        'tumor',
        'high bp',
        'low bp',
        'bp problem',
        'recent surgery',
      ],
    }

    // Safe alternatives mapping
    this.safeAlternatives = {
      headstand:
        'Consider gentle supine poses like Legs-Up-The-Wall (Viparita Karani)',
      shoulderstand: 'Try gentle neck stretches and bridge pose instead',
      backbend: 'Focus on gentle chest opening with supported fish pose',
      inversion: 'Practice forward folds or gentle twists',
      'advanced pose': 'Start with beginner variations and build gradually',
      'hot yoga': 'Try gentle hatha yoga at room temperature',
      'power yoga': 'Consider gentle vinyasa or restorative yoga',
    }

    // Medical disclaimer
    this.medicalDisclaimer =
      '⚠️ IMPORTANT: This information is not medical advice. Please consult a doctor or certified yoga therapist before attempting any yoga poses, especially if you have health concerns.'
  }

  checkSafety(query) {
    const lowerQuery = query.toLowerCase().trim()
    const result = {
      isUnsafe: false,
      reason: '',
      suggestion: '',
      warningLevel: 'none', // none, low, high
    }

    // Check pregnancy keywords (HIGH priority)
    for (const keyword of this.unsafeKeywords.pregnancy) {
      if (lowerQuery.includes(keyword)) {
        result.isUnsafe = true
        result.reason = 'pregnancy'
        result.warningLevel = 'high'
        result.suggestion =
          'Yoga during pregnancy requires special guidance. ' +
          'Please consult with a prenatal yoga specialist and your healthcare provider. ' +
          'Safe options may include: prenatal yoga classes, meditation, and gentle breathing exercises.'
        return result
      }
    }

    // Check medical condition keywords
    for (const keyword of this.unsafeKeywords.medical) {
      if (lowerQuery.includes(keyword)) {
        result.isUnsafe = true
        result.reason = 'medical_condition'
        result.warningLevel = 'high'
        result.suggestion =
          'Your question mentions a health condition that requires professional guidance. '

        // Add specific alternative if pose is mentioned
        for (const [pose, alternative] of Object.entries(
          this.safeAlternatives
        )) {
          if (lowerQuery.includes(pose)) {
            result.suggestion += `Instead of ${pose}, consider: ${alternative}. `
            break
          }
        }

        result.suggestion += this.medicalDisclaimer
        return result
      }
    }

    // Check for risky pose requests without conditions (LOW priority)
    const riskyPoses = [
      'headstand',
      'shoulderstand',
      'handstand',
      'wheel',
      'scorpion',
      'plow',
    ]
    for (const pose of riskyPoses) {
      if (
        lowerQuery.includes(pose) &&
        (lowerQuery.includes('how to') ||
          lowerQuery.includes('perform') ||
          lowerQuery.includes('do'))
      ) {
        result.isUnsafe = true
        result.reason = 'advanced_pose'
        result.warningLevel = 'low'
        result.suggestion =
          `${pose} is an advanced pose that requires proper preparation and guidance. ` +
          `Consider starting with beginner variations and working with a certified yoga instructor. ` +
          `Always use a spotter or wall support when first attempting inversions.`
        return result
      }
    }

    return result
  }

  getSafetyWarning(safetyResult) {
    if (!safetyResult.isUnsafe) return null

    const warningTypes = {
      high: {
        color: '#dc3545', // Red
        icon: '⚠️',
        title: 'SAFETY ADVISORY - HIGH RISK',
      },
      low: {
        color: '#ffc107', // Yellow
        icon: 'ℹ️',
        title: 'Safety Note',
      },
    }

    const warning = warningTypes[safetyResult.warningLevel] || warningTypes.high

    return {
      ...warning,
      message:
        'Your question touches on an area that can be risky without personalized guidance.',
      suggestion: safetyResult.suggestion,
      disclaimer: this.medicalDisclaimer,
    }
  }

  // Helper to check if query is safe for pose recommendation
  isSafeForPoseRecommendation(query) {
    const safety = this.checkSafety(query)
    return !safety.isUnsafe || safety.warningLevel === 'low'
  }
}

module.exports = new SafetyService()
