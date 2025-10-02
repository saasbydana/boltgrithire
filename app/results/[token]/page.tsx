"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, type Assessment } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadarChart } from "@/components/results/radar-chart";
import { ScoreBreakdown } from "@/components/results/score-breakdown";
import { format } from "date-fns";

export default function ResultsPage() {
  const params = useParams();
  const token = params.token as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [token]);

  const loadAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('invite_token', token)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Assessment tidak ditemukan');
        return;
      }

      if (data.status !== 'completed') {
        setError('Assessment belum selesai');
        return;
      }

      setAssessment(data);
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Terjadi kesalahan saat memuat hasil');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationConfig = (recommendation: string | null) => {
    if (!recommendation) return null;

    const configs = {
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-600',
        title: 'Proceed to Next Stage',
        description: 'This candidate shows strong indicators of grit, self-learning ability, and cultural fit. Recommended to proceed to the next interview stage.'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        badge: 'bg-yellow-600',
        title: 'Interview to Confirm',
        description: 'This candidate shows moderate indicators. An in-depth interview is recommended to further assess their fit for the role.'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-600',
        title: 'Not Recommended',
        description: 'Based on the assessment results, this candidate may not be the best fit at this time. Consider other candidates who scored higher.'
      }
    };

    return configs[recommendation as keyof typeof configs];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Assessment tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const recommendationConfig = getRecommendationConfig(assessment.recommendation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Results
          </h1>
          <p className="text-gray-600">
            Completed on {format(new Date(assessment.completed_at!), 'MMMM dd, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Candidate</p>
            <p className="text-xl font-semibold text-gray-900">{assessment.candidate_name}</p>
            <p className="text-sm text-gray-500">{assessment.candidate_email}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Composite Score</p>
            <p className="text-4xl font-bold text-gray-900">
              {assessment.composite_score?.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">out of 100</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Recommendation</p>
            {recommendationConfig && (
              <Badge className={`${recommendationConfig.badge} text-white text-sm px-3 py-1`}>
                {recommendationConfig.title}
              </Badge>
            )}
          </Card>
        </div>

        {recommendationConfig && (
          <Card className={`p-6 mb-6 border-2 ${recommendationConfig.border} ${recommendationConfig.bg}`}>
            <h3 className={`font-semibold text-lg mb-2 ${recommendationConfig.text}`}>
              {recommendationConfig.title}
            </h3>
            <p className={`text-sm ${recommendationConfig.text}`}>
              {recommendationConfig.description}
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Distribution
            </h3>
            <RadarChart
              data={{
                sjt: assessment.sjt_score || 0,
                grit: assessment.grit_score || 0,
                selfLearning: assessment.self_learning_score || 0,
                loyalty: assessment.loyalty_score || 0
              }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Breakdown
            </h3>
            <ScoreBreakdown
              sjtScore={assessment.sjt_score || 0}
              gritScore={assessment.grit_score || 0}
              selfLearningScore={assessment.self_learning_score || 0}
              loyaltyScore={assessment.loyalty_score || 0}
            />
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Scoring Formula
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-700">
              Composite Score = (0.4 × SJT) + (0.25 × Grit) + (0.25 × Self-Learning) + (0.1 × Loyalty)
            </p>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• <strong>Green (75-100):</strong> Proceed to next stage</p>
            <p>• <strong>Yellow (60-74):</strong> Interview to confirm</p>
            <p>• <strong>Red (&lt;60):</strong> Not recommended</p>
          </div>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}
