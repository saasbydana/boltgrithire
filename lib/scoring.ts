import { supabase } from './supabase';

export async function calculateScores(assessmentId: string) {
  try {
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (!responses) return;

    const sjtScore = await calculateSJTScore(responses);
    const gritScore = await calculateGritScore(responses);
    const selfLearningScore = calculateSelfLearningScore(responses);
    const loyaltyScore = calculateLoyaltyScore(responses);

    const compositeScore =
      (0.4 * sjtScore) +
      (0.25 * gritScore) +
      (0.25 * selfLearningScore) +
      (0.1 * loyaltyScore);

    let recommendation: 'green' | 'yellow' | 'red';
    if (compositeScore >= 75) {
      recommendation = 'green';
    } else if (compositeScore >= 60) {
      recommendation = 'yellow';
    } else {
      recommendation = 'red';
    }

    await supabase
      .from('assessments')
      .update({
        sjt_score: sjtScore,
        grit_score: gritScore,
        self_learning_score: selfLearningScore,
        loyalty_score: loyaltyScore,
        composite_score: compositeScore,
        recommendation: recommendation
      })
      .eq('id', assessmentId);

    return {
      sjtScore,
      gritScore,
      selfLearningScore,
      loyaltyScore,
      compositeScore,
      recommendation
    };
  } catch (error) {
    console.error('Error calculating scores:', error);
    throw error;
  }
}

async function calculateSJTScore(responses: any[]): Promise<number> {
  const sjtResponses = responses.filter(r => r.section === 'sjt');
  if (sjtResponses.length === 0) return 0;

  const { data: questions } = await supabase
    .from('sjt_questions')
    .select('id, correct_option');

  if (!questions) return 0;

  const correctAnswersMap = new Map(
    questions.map(q => [q.id, q.correct_option])
  );

  let correctCount = 0;
  sjtResponses.forEach(response => {
    const correctAnswer = correctAnswersMap.get(response.question_id);
    if (correctAnswer === response.response_value) {
      correctCount++;
    }
  });

  return (correctCount / sjtResponses.length) * 100;
}

async function calculateGritScore(responses: any[]): Promise<number> {
  const gritResponses = responses.filter(r => r.section === 'grit');
  if (gritResponses.length === 0) return 0;

  const { data: statements } = await supabase
    .from('grit_statements')
    .select('id, is_reverse_coded');

  if (!statements) return 0;

  const reverseCodedMap = new Map(
    statements.map(s => [s.id, s.is_reverse_coded])
  );

  let totalScore = 0;
  gritResponses.forEach(response => {
    let score = parseInt(response.response_value);
    const isReverseCoded = reverseCodedMap.get(response.question_id);

    if (isReverseCoded) {
      score = 6 - score;
    }

    totalScore += score;
  });

  const maxPossibleScore = gritResponses.length * 5;
  return (totalScore / maxPossibleScore) * 100;
}

function calculateSelfLearningScore(responses: any[]): number {
  const selfLearningResponses = responses.filter(r => r.section === 'self_learning');
  if (selfLearningResponses.length === 0) return 0;

  let totalScore = 0;

  selfLearningResponses.forEach(response => {
    const text = response.response_value.toLowerCase();
    let score = 50;

    const positiveKeywords = [
      'fungsi', 'berguna', 'membantu', 'efisien', 'otomatis', 'mudah',
      'dokumentasi', 'tutorial', 'belajar', 'praktek', 'coba', 'implementasi',
      'langkah', 'pertama', 'setup', 'install', 'konfigurasi', 'test'
    ];

    const keywordCount = positiveKeywords.filter(keyword =>
      text.includes(keyword)
    ).length;

    score += keywordCount * 5;

    const wordCount = text.split(/\s+/).length;
    if (wordCount > 50) score += 10;
    if (wordCount > 100) score += 10;
    if (wordCount > 150) score += 10;

    if (text.match(/\d+\./g)?.length > 2) score += 10;

    totalScore += Math.min(score, 100);
  });

  return totalScore / selfLearningResponses.length;
}

function calculateLoyaltyScore(responses: any[]): number {
  const loyaltyResponses = responses.filter(r => r.section === 'loyalty');
  if (loyaltyResponses.length === 0) return 0;

  let totalScore = 0;

  loyaltyResponses.forEach(response => {
    const text = response.response_value.toLowerCase();
    let score = 50;

    const positiveKeywords = [
      'belajar', 'berkembang', 'growth', 'karir', 'tim', 'team', 'kultur',
      'challenge', 'tantangan', 'misi', 'visi', 'value', 'nilai', 'loyal',
      'komitmen', 'dedikasi', 'passion', 'semangat', 'motivasi', 'tujuan',
      'tanggung jawab', 'kontribusi', 'impact', 'dampak'
    ];

    const keywordCount = positiveKeywords.filter(keyword =>
      text.includes(keyword)
    ).length;

    score += keywordCount * 4;

    const wordCount = text.split(/\s+/).length;
    if (wordCount > 40) score += 10;
    if (wordCount > 80) score += 10;

    totalScore += Math.min(score, 100);
  });

  return totalScore / loyaltyResponses.length;
}
