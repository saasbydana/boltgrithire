"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { calculateScores } from "@/lib/scoring";

interface CompletionScreenProps {
  token: string;
}

export function CompletionScreen({ token }: CompletionScreenProps) {
  const [calculating, setCalculating] = useState(true);

  useEffect(() => {
    processScoring();
  }, []);

  const processScoring = async () => {
    try {
      const { data: assessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('invite_token', token)
        .maybeSingle();

      if (!assessment) return;

      await calculateScores(assessment.id);

      setTimeout(() => {
        setCalculating(false);
      }, 2000);
    } catch (err) {
      console.error('Error processing scores:', err);
      setCalculating(false);
    }
  };

  if (calculating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 shadow-lg text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Menghitung Skor...
          </h2>
          <p className="text-gray-600">
            Mohon tunggu sebentar, kami sedang memproses jawaban kamu.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="max-w-2xl w-full p-8 shadow-xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Selesai!
          </h1>
          <p className="text-gray-600 text-lg">
            Terima kasih sudah menyelesaikan assessment GritHire
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Apa Selanjutnya?</h3>
          <ul className="text-sm text-blue-800 space-y-2 text-left">
            <li>✓ Hasil assessment kamu sudah tersimpan dengan aman</li>
            <li>✓ Tim rekrutmen akan meninjau hasil kamu dalam 2-3 hari kerja</li>
            <li>✓ Kamu akan dihubungi via email untuk langkah selanjutnya</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          Kamu bisa menutup halaman ini sekarang.
        </div>
      </Card>
    </div>
  );
}
