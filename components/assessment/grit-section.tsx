"use client";

import { useEffect, useState } from "react";
import { supabase, type GritStatement } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader as Loader2 } from "lucide-react";

interface GritSectionProps {
  assessmentId: string;
  onComplete: () => void;
}

export function GritSection({ assessmentId, onComplete }: GritSectionProps) {
  const [statements, setStatements] = useState<GritStatement[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStatements();
  }, []);

  const loadStatements = async () => {
    try {
      const { data, error } = await supabase
        .from('grit_statements')
        .select('*')
        .order('order_num');

      if (error) throw error;
      setStatements(data || []);
    } catch (err) {
      console.error('Error loading statements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (statementId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [statementId]: value
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length !== statements.length) {
      alert('Mohon jawab semua pernyataan sebelum melanjutkan');
      return;
    }

    setSubmitting(true);

    try {
      const responsesToInsert = statements.map(statement => ({
        assessment_id: assessmentId,
        section: 'grit',
        question_id: statement.id,
        response_value: responses[statement.id].toString(),
        time_spent_seconds: 0
      }));

      await supabase.from('assessment_responses').insert(responsesToInsert);
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

  const allAnswered = Object.keys(responses).length === statements.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full p-8 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Grit & Growth Mindset Scale
          </h2>
          <p className="text-gray-600 text-sm">
            Jawab sejujur-jujurnya (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)
          </p>
        </div>

        <div className="space-y-8 mb-8">
          {statements.map((statement, index) => (
            <div key={statement.id} className="border-b pb-6 last:border-b-0">
              <p className="text-gray-900 font-medium mb-4">
                {index + 1}. {statement.statement_text}
              </p>

              <div className="flex items-center justify-between max-w-2xl">
                <Label className="text-xs text-gray-500 w-24 text-left">
                  Sangat<br />Tidak Setuju
                </Label>

                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleResponseChange(statement.id, value)}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                        responses[statement.id] === value
                          ? 'bg-blue-600 text-white border-blue-600 scale-110'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:scale-105'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <Label className="text-xs text-gray-500 w-24 text-right">
                  Sangat<br />Setuju
                </Label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Lanjut ke Bagian 3'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
