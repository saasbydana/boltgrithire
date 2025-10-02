"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleCheck as CheckCircle2, Clock, FileText } from "lucide-react";

interface ConsentScreenProps {
  candidateName: string;
  onConsent: () => void;
}

export function ConsentScreen({ candidateName, onConsent }: ConsentScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {candidateName}!
          </h1>
          <p className="text-gray-600">
            Terima kasih sudah meluangkan waktu untuk ikut assessment GritHire
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Durasi</h3>
              <p className="text-gray-600 text-sm">
                Assessment ini akan memakan waktu sekitar 12-15 menit
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">4 Bagian</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>1. Situational Judgment Test (6 pertanyaan)</li>
                <li>2. Grit & Growth Mindset Scale (8 pernyataan)</li>
                <li>3. Self-Learning Mini Task (10 menit)</li>
                <li>4. Loyalty & Values (3 pertanyaan)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Tips</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Jawab sejujur-jujurnya, tidak ada jawaban benar atau salah</li>
                <li>• Progress kamu akan disimpan secara otomatis</li>
                <li>• Pastikan koneksi internet kamu stabil</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Persetujuan:</strong> Dengan melanjutkan, kamu setuju bahwa data yang kamu berikan
            akan digunakan untuk proses evaluasi kandidat dan disimpan sesuai kebijakan privasi perusahaan.
          </p>
        </div>

        <Button
          onClick={onConsent}
          className="w-full py-6 text-lg"
          size="lg"
        >
          Mulai Assessment
        </Button>
      </Card>
    </div>
  );
}
