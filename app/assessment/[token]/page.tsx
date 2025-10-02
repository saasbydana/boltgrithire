"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, type Assessment } from "@/lib/supabase";
import { ConsentScreen } from "@/components/assessment/consent-screen";
import { SJTSection } from "@/components/assessment/sjt-section";
import { GritSection } from "@/components/assessment/grit-section";
import { SelfLearningSection } from "@/components/assessment/self-learning-section";
import { LoyaltySection } from "@/components/assessment/loyalty-section";
import { CompletionScreen } from "@/components/assessment/completion-screen";
import { Progress } from "@/components/ui/progress";
import { Loader as Loader2 } from "lucide-react";

type AssessmentStep = 'consent' | 'sjt' | 'grit' | 'self-learning' | 'loyalty' | 'complete';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('consent');
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

      if (data.status === 'completed') {
        router.push(`/results/${token}`);
        return;
      }

      setAssessment(data);

      if (data.status === 'in_progress') {
        const { data: responses } = await supabase
          .from('assessment_responses')
          .select('section')
          .eq('assessment_id', data.id);

        if (responses && responses.length > 0) {
          const completedSections = new Set(responses.map(r => r.section));
          if (completedSections.has('loyalty')) {
            setCurrentStep('complete');
          } else if (completedSections.has('self_learning')) {
            setCurrentStep('loyalty');
          } else if (completedSections.has('grit')) {
            setCurrentStep('self-learning');
          } else if (completedSections.has('sjt')) {
            setCurrentStep('grit');
          } else {
            setCurrentStep('sjt');
          }
        } else {
          setCurrentStep('sjt');
        }
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Terjadi kesalahan saat memuat assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async () => {
    if (!assessment) return;

    try {
      await supabase
        .from('assessments')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      setCurrentStep('sjt');
    } catch (err) {
      console.error('Error updating assessment:', err);
    }
  };

  const handleStepComplete = (nextStep: AssessmentStep) => {
    setCurrentStep(nextStep);
  };

  const getProgress = () => {
    const steps: AssessmentStep[] = ['consent', 'sjt', 'grit', 'self-learning', 'loyalty', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return (currentIndex / (steps.length - 1)) * 100;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentStep !== 'consent' && currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Progress value={getProgress()} className="h-2" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {currentStep === 'sjt' && 'Bagian 1 dari 4: Situational Judgment'}
              {currentStep === 'grit' && 'Bagian 2 dari 4: Grit & Growth Mindset'}
              {currentStep === 'self-learning' && 'Bagian 3 dari 4: Self-Learning Task'}
              {currentStep === 'loyalty' && 'Bagian 4 dari 4: Loyalty & Values'}
            </p>
          </div>
        </div>
      )}

      <div className={currentStep !== 'consent' && currentStep !== 'complete' ? 'pt-24' : ''}>
        {currentStep === 'consent' && (
          <ConsentScreen
            candidateName={assessment.candidate_name}
            onConsent={handleConsent}
          />
        )}

        {currentStep === 'sjt' && (
          <SJTSection
            assessmentId={assessment.id}
            onComplete={() => handleStepComplete('grit')}
          />
        )}

        {currentStep === 'grit' && (
          <GritSection
            assessmentId={assessment.id}
            onComplete={() => handleStepComplete('self-learning')}
          />
        )}

        {currentStep === 'self-learning' && (
          <SelfLearningSection
            assessmentId={assessment.id}
            onComplete={() => handleStepComplete('loyalty')}
          />
        )}

        {currentStep === 'loyalty' && (
          <LoyaltySection
            assessmentId={assessment.id}
            onComplete={() => handleStepComplete('complete')}
          />
        )}

        {currentStep === 'complete' && (
          <CompletionScreen token={token} />
        )}
      </div>
    </div>
  );
}
