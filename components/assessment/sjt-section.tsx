"use client";

import { useEffect, useState } from "react";
import { supabase, type SJTQuestion } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader as Loader2 } from "lucide-react";

interface SJTSectionProps {
  assessmentId: string;
  onComplete: () => void;
}

export function SJTSection({ assessmentId, onComplete }: SJTSectionProps) {
  const [questions, setQuestions] = useState<SJTQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('sjt_questions')
        .select('*')
        .order('created_at');

      if (error) throw error;

      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      await supabase.from('assessment_responses').insert({
        assessment_id: assessmentId,
        section: 'sjt',
        question_id: questions[currentIndex].id,
        response_value: selectedAnswer,
        time_spent_seconds: timeSpent
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer("");
        setStartTime(Date.now());
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Error saving response:', err);
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tidak ada pertanyaan tersedia</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full p-8 shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Situational Judgment Test
            </h2>
            <span className="text-sm text-gray-500">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Pilih opsi yang paling mendekati cara kamu akan bertindak
          </p>
        </div>

        <div className="mb-8">
          <p className="text-lg font-medium text-gray-900 mb-6">
            {currentQuestion.question_text}
          </p>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionKey = `option_${option.toLowerCase()}` as keyof SJTQuestion;
                const optionText = currentQuestion[optionKey] as string;

                return (
                  <div
                    key={option}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={option} className="mt-1" />
                    <Label htmlFor={option} className="flex-1 cursor-pointer">
                      <span className="font-medium text-gray-900">{option})</span>{' '}
                      <span className="text-gray-700">{optionText}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || submitting}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : currentIndex < questions.length - 1 ? (
              'Selanjutnya'
            ) : (
              'Lanjut ke Bagian 2'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
