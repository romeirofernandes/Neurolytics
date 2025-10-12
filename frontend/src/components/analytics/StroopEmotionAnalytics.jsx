import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const StroopEmotionAnalytics = () => {
  // 6 participants with realistic Stroop + Emotion data
  const participantData = [
    { id: 'P001', age: 23, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', congruentRT: 645, incongruentRT: 892, stroopEffect: 247, accuracy: 94.5, dominantEmotion: 'Neutral', emotionVariance: 23.4 },
    { id: 'P002', age: 28, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', congruentRT: 598, incongruentRT: 845, stroopEffect: 247, accuracy: 97.2, dominantEmotion: 'Focused', emotionVariance: 18.7 },
    { id: 'P003', age: 31, gender: 'Male', education: 'PhD', city: 'Delhi, Delhi', congruentRT: 612, incongruentRT: 823, stroopEffect: 211, accuracy: 98.1, dominantEmotion: 'Neutral', emotionVariance: 15.2 },
    { id: 'P004', age: 25, gender: 'Female', education: "Bachelor's", city: 'Chennai, Tamil Nadu', congruentRT: 678, incongruentRT: 965, stroopEffect: 287, accuracy: 91.8, dominantEmotion: 'Anxious', emotionVariance: 31.5 },
    { id: 'P005', age: 29, gender: 'Male', education: "Master's", city: 'Pune, Maharashtra', congruentRT: 623, incongruentRT: 854, stroopEffect: 231, accuracy: 95.6, dominantEmotion: 'Neutral', emotionVariance: 20.1 },
    { id: 'P006', age: 26, gender: 'Female', education: "Bachelor's", city: 'Hyderabad, Telangana', congruentRT: 654, incongruentRT: 911, stroopEffect: 257, accuracy: 93.3, dominantEmotion: 'Focused', emotionVariance: 22.8 },
  ];

  const avgStroopEffect = (participantData.reduce((sum, p) => sum + p.stroopEffect, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  // Emotion distribution across all trials
  const emotionData = [
    { emotion: 'Neutral', count: 45, color: '#94a3b8' },
    { emotion: 'Focused', count: 28, color: '#3b82f6' },
    { emotion: 'Anxious', count: 12, color: '#f59e0b' },
    { emotion: 'Surprised', count: 8, color: '#ec4899' },
    { emotion: 'Happy', count: 7, color: '#10b981' },
  ];

  // Trial-by-trial emotion progression (averaged across participants)
  const emotionTimeSeries = [
    { trial: 1, neutral: 85, anxious: 10, focused: 5 },
    { trial: 10, neutral: 70, anxious: 15, focused: 15 },
    { trial: 20, neutral: 60, anxious: 20, focused: 20 },
    { trial: 30, neutral: 55, anxious: 18, focused: 27 },
    { trial: 40, neutral: 65, anxious: 12, focused: 23 },
  ];

  // Demographics
  const genderData = [
    { name: 'Male', value: 3, color: '#3b82f6' },
    { name: 'Female', value: 3, color: '#ec4899' },
  ];

  const educationData = [
    { name: "Bachelor's", value: 3, color: '#10b981' },
    { name: "Master's", value: 2, color: '#f59e0b' },
    { name: 'PhD', value: 1, color: '#8b5cf6' },
  ];

  const ageDistribution = [
    { range: '20-25', count: 2 },
    { range: '26-30', count: 3 },
    { range: '31-35', count: 1 },
  ];

  // Congruent vs Incongruent RT comparison
  const rtComparison = participantData.map(p => ({
    id: p.id,
    Congruent: p.congruentRT,
    Incongruent: p.incongruentRT,
  }));

  // Stroop Effect Size
  const stroopEffectData = participantData.map(p => ({
    id: p.id,
    effect: p.stroopEffect,
  }));

  // Emotion Variance vs Performance
  const emotionPerformanceData = participantData.map(p => ({
    variance: p.emotionVariance,
    stroopEffect: p.stroopEffect,
    accuracy: p.accuracy,
    name: p.id,
  }));

  // City distribution
  const cityData = [
    { city: 'Mumbai', count: 1 },
    { city: 'Bangalore', count: 1 },
    { city: 'Delhi', count: 1 },
    { city: 'Chennai', count: 1 },
    { city: 'Pune', count: 1 },
    { city: 'Hyderabad', count: 1 },
  ];

  // Radar chart for multidimensional performance
  const radarData = participantData.map(p => ({
    participant: p.id,
    speedScore: 100 - ((p.congruentRT / 700) * 100),
    accuracy: p.accuracy,
    controlScore: 100 - ((p.stroopEffect / 300) * 100),
    emotionStability: 100 - p.emotionVariance,
  }));

  const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">6</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Stroop Effect</CardDescription>
            <CardTitle className="text-3xl">{avgStroopEffect}ms</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Accuracy</CardDescription>
            <CardTitle className="text-3xl">{avgAccuracy}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dominant Emotion</CardDescription>
            <CardTitle className="text-2xl">Neutral</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congruent vs Incongruent RT */}
        <Card>
          <CardHeader>
            <CardTitle>Reaction Time: Congruent vs Incongruent</CardTitle>
            <CardDescription>Response times in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rtComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Congruent" fill="#10b981" />
                <Bar dataKey="Incongruent" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stroop Effect Size */}
        <Card>
          <CardHeader>
            <CardTitle>Stroop Effect by Participant</CardTitle>
            <CardDescription>Interference effect (Incongruent - Congruent RT)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stroopEffectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="effect" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Facial Emotion Distribution</CardTitle>
            <CardDescription>Detected emotions across all trials</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={emotionData} cx="50%" cy="50%" labelLine={true} label={({ emotion, count }) => `${emotion}: ${count}`} outerRadius={100} fill="#8884d8" dataKey="count">
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Time Series */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Progression During Task</CardTitle>
            <CardDescription>How emotions change throughout the experiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={emotionTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trial" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#94a3b8" />
                <Area type="monotone" dataKey="anxious" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="focused" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Participant Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Age</th>
                  <th className="pb-2">Gender</th>
                  <th className="pb-2">Education</th>
                  <th className="pb-2">City</th>
                  <th className="pb-2">Cong RT</th>
                  <th className="pb-2">Incong RT</th>
                  <th className="pb-2">Stroop</th>
                  <th className="pb-2">Accuracy</th>
                  <th className="pb-2">Dominant Emotion</th>
                </tr>
              </thead>
              <tbody>
                {participantData.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.id}</td>
                    <td className="py-2">{p.age}</td>
                    <td className="py-2">{p.gender}</td>
                    <td className="py-2">{p.education}</td>
                    <td className="py-2">{p.city}</td>
                    <td className="py-2">{p.congruentRT}ms</td>
                    <td className="py-2">{p.incongruentRT}ms</td>
                    <td className="py-2 font-semibold text-purple-600">{p.stroopEffect}ms</td>
                    <td className="py-2 font-semibold text-green-600">{p.accuracy}%</td>
                    <td className="py-2">{p.dominantEmotion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StroopEmotionAnalytics;
