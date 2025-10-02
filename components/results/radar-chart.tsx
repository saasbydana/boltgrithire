"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarChartProps {
  data: {
    sjt: number;
    grit: number;
    selfLearning: number;
    loyalty: number;
  };
}

export function RadarChart({ data }: RadarChartProps) {
  const chartData = [
    {
      subject: 'Situational Judgment',
      score: data.sjt,
      fullMark: 100,
    },
    {
      subject: 'Grit & Growth Mindset',
      score: data.grit,
      fullMark: 100,
    },
    {
      subject: 'Self-Learning',
      score: data.selfLearning,
      fullMark: 100,
    },
    {
      subject: 'Loyalty & Values',
      score: data.loyalty,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
