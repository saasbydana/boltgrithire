"use client";

import { useEffect, useState } from "react";
import { supabase, type LoyaltyQuestion } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader as Loader2 } from "lucide-react";

interface LoyaltySectionProps {
  assessmentId: string;
  onComplete: () => void;
}

export function LoyaltySection({ assessmentId, onComplete }: LoyaltySectionProps) {
  const [questions, setQuestions] = useState<LoyaltyQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_questions')
        .select('*')
        .order('order_num');

      if (error) throw error;
      setQuestions(data || []);

      const initialResponses: Record<string, string> = {};
      data?.forEach(q => {
        initialResponses[q.id] = "";
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    const allAnswered = questions.every(q => responses[q.id]?.trim().length > 0);

    if (!allAnswered) {
      alert('Mohon jawab semua pertanyaan sebelum melanjutkan');
      return;
    }

    setSubmitting(true);

    try {
      const responsesToInsert = questions.map(question => ({
        assessment_id: assessmentId,
        section: 'loyalty',
        question_id: question.id,
        response_value: responses[question.id],
        time_spent_seconds: 0
      }));

      await supabase.from('assessment_responses').insert(responsesToInsert);

      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      onComplete();
    } catch (err) {
      console.error('Error saving responses:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const allAnswered = questions.every(q => responses[q.id]?.trim().length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full p-8 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loyalty & Values
          </h2>
          <p className="text-gray-600 text-sm">
            Bagian terakhir! Jawab pertanyaan di bawah dengan jujur dan detail.
          </p>
        </div>

        <div className="space-y-8 mb-8">
          {questions.map((question, index) => (
            <div key={question.id}>
              <Label htmlFor={question.id} className="text-base font-semibold text-gray-900 mb-3 block">
                {index + 1}. {question.question_text}
              </Label>
              <Textarea
                id={question.id}
                value={responses[question.id] || ""}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Ketik jawaban kamu di sini..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 50 karakter ({responses[question.id]?.length || 0}/50)
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            Setelah submit, assessment kamu akan selesai dan hasilnya akan dikirim ke tim rekrutmen.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
