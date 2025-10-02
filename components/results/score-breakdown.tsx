"use client";

import { Progress } from "@/components/ui/progress";

interface ScoreBreakdownProps {
  sjtScore: number;
  gritScore: number;
  selfLearningScore: number;
  loyaltyScore: number;
}

export function ScoreBreakdown({
  sjtScore,
  gritScore,
  selfLearningScore,
  loyaltyScore
}: ScoreBreakdownProps) {
  const scores = [
    {
      label: 'Situational Judgment Test',
      score: sjtScore,
      weight: 40,
      description: 'Decision-making and problem-solving'
    },
    {
      label: 'Grit & Growth Mindset',
      score: gritScore,
      weight: 25,
      description: 'Perseverance and learning attitude'
    },
    {
      label: 'Self-Learning',
      score: selfLearningScore,
      weight: 25,
      description: 'Independent learning ability'
    },
    {
      label: 'Loyalty & Values',
      score: loyaltyScore,
      weight: 10,
      description: 'Cultural fit and commitment'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {scores.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {item.label}
              </p>
              <p className="text-xs text-gray-500">
                {item.description} • Weight: {item.weight}%
              </p>
            </div>
            <span className={`text-xl font-bold ml-4 ${getScoreColor(item.score)}`}>
              {item.score.toFixed(1)}
            </span>
          </div>
          <Progress value={item.score} className="h-2" />
        </div>
      ))}
    </div>
  );
}
