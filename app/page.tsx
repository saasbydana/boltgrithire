import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Users, TrendingUp, CircleCheck as CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GritHire
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Standardized candidate assessment platform to identify candidates with grit, growth mindset, and loyalty potential
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Identify Grit</h3>
            <p className="text-sm text-gray-600">
              Measure perseverance through challenges
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Growth Mindset</h3>
            <p className="text-sm text-gray-600">
              Assess self-learning and independence
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cultural Fit</h3>
            <p className="text-sm text-gray-600">
              Evaluate loyalty and values alignment
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Data-Driven</h3>
            <p className="text-sm text-gray-600">
              Reduce bias with structured scoring
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Create Invite</h4>
              <p className="text-sm text-gray-600">
                Generate unique assessment link for each candidate
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Candidate Takes Test</h4>
              <p className="text-sm text-gray-600">
                12-15 minute assessment with 4 sections
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Automatic Scoring</h4>
              <p className="text-sm text-gray-600">
                AI-powered analysis generates composite score
              </p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review Results</h4>
              <p className="text-sm text-gray-600">
                Get clear recommendations with detailed insights
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-blue-50 to-slate-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Assessment Components
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                40%
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Situational Judgment Test</h4>
                <p className="text-sm text-gray-600">
                  6 scenario-based questions testing decision-making and problem-solving skills
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                25%
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Grit & Growth Mindset Scale</h4>
                <p className="text-sm text-gray-600">
                  8 statements measuring perseverance, resilience, and learning attitude
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                25%
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Self-Learning Mini Task</h4>
                <p className="text-sm text-gray-600">
                  10-minute timed task evaluating ability to learn and apply new tools independently
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                10%
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Loyalty & Values</h4>
                <p className="text-sm text-gray-600">
                  3 open-ended questions assessing cultural fit and long-term commitment potential
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
