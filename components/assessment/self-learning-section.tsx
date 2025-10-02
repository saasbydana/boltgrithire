"use client";

import { useEffect, useState } from "react";
import { supabase, type SelfLearningTask } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader as Loader2, Clock, ExternalLink } from "lucide-react";

interface SelfLearningSectionProps {
  assessmentId: string;
  onComplete: () => void;
}

export function SelfLearningSection({ assessmentId, onComplete }: SelfLearningSectionProps) {
  const [task, setTask] = useState<SelfLearningTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [started, setStarted] = useState(false);
  const [responses, setResponses] = useState({
    question1: "",
    question2: "",
    question3: ""
  });

  useEffect(() => {
    loadTask();
  }, []);

  useEffect(() => {
    if (!started || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeRemaining]);

  const loadTask = async () => {
    try {
      const { data, error } = await supabase
        .from('self_learning_tasks')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setTask(data);
      if (data) {
        setTimeRemaining(data.time_limit_minutes * 60);
      }
    } catch (err) {
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleSubmit = async () => {
    if (!task) return;

    const allAnswered = responses.question1 && responses.question2 && responses.question3;
    if (!allAnswered) {
      alert('Mohon jawab semua pertanyaan sebelum melanjutkan');
      return;
    }

    setSubmitting(true);

    try {
      const combinedResponse = `
Q1: Apa fungsi tool ini?
${responses.question1}

Q2: Kasih contoh cara pakai di kerjaan nyata.
${responses.question2}

Q3: Kalau besok disuruh implementasi, apa yang kamu lakuin duluan?
${responses.question3}
      `.trim();

      await supabase.from('assessment_responses').insert({
        assessment_id: assessmentId,
        section: 'self_learning',
        question_id: task.id,
        response_value: combinedResponse,
        time_spent_seconds: (task.time_limit_minutes * 60) - timeRemaining
      });

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

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Task tidak tersedia</p>
      </div>
    );
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isTimeUp = timeRemaining === 0;

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 shadow-lg">
          <div className="text-center mb-8">
            <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Self-Learning Mini Task
            </h2>
            <p className="text-gray-600">
              Kamu akan diberikan waktu <strong>{task.time_limit_minutes} menit</strong> untuk:
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                1. Mempelajari resource yang diberikan (video/dokumen)<br />
                2. Menjawab 3 pertanyaan terkait resource tersebut
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Perhatian:</strong> Timer akan dimulai saat kamu menekan tombol "Mulai Task".
                Pastikan kamu siap sebelum memulai.
              </p>
            </div>
          </div>

          <Button onClick={handleStart} size="lg" className="w-full">
            Mulai Task
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full p-8 shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Self-Learning Mini Task
            </h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5" />
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            {task.task_description}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Resource untuk dipelajari:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(task.resource_url, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Buka Resource
            </Button>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="q1" className="text-base font-semibold text-gray-900 mb-2 block">
              1. Apa fungsi tool ini?
            </Label>
            <Textarea
              id="q1"
              value={responses.question1}
              onChange={(e) => setResponses(prev => ({ ...prev, question1: e.target.value }))}
              placeholder="Jelaskan fungsi tool yang kamu pelajari..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <Label htmlFor="q2" className="text-base font-semibold text-gray-900 mb-2 block">
              2. Kasih contoh cara pakai di kerjaan nyata.
            </Label>
            <Textarea
              id="q2"
              value={responses.question2}
              onChange={(e) => setResponses(prev => ({ ...prev, question2: e.target.value }))}
              placeholder="Berikan contoh konkret penggunaan di pekerjaan..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <Label htmlFor="q3" className="text-base font-semibold text-gray-900 mb-2 block">
              3. Kalau besok disuruh implementasi, apa yang kamu lakuin duluan?
            </Label>
            <Textarea
              id="q3"
              value={responses.question3}
              onChange={(e) => setResponses(prev => ({ ...prev, question3: e.target.value }))}
              placeholder="Jelaskan langkah-langkah yang akan kamu ambil..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        {isTimeUp && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-900 font-medium">
              Waktu habis! Silakan submit jawaban kamu sekarang.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Lanjut ke Bagian 4'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
