import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';

const HanoiAnalytics = ({ templateId }) => {
  // Hardcoded data for 8 participants with realistic Hanoi performance
  const isExtended = templateId === 'hanoi'; // 5 discs version
  
  const participantData = [
    { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', moves: isExtended ? 45 : 12, time: isExtended ? 342 : 95, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 68.9 : 58.3 },
    { id: 'P002', age: 31, gender: 'Male', education: "Master's", city: 'Delhi, Delhi', moves: isExtended ? 38 : 9, time: isExtended ? 298 : 78, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 81.6 : 77.8 },
    { id: 'P003', age: 28, gender: 'Male', education: 'PhD', city: 'Bangalore, Karnataka', moves: isExtended ? 35 : 8, time: isExtended ? 275 : 71, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 88.6 : 87.5 },
    { id: 'P004', age: 22, gender: 'Female', education: "Bachelor's", city: 'Chennai, Tamil Nadu', moves: isExtended ? 52 : 15, time: isExtended ? 389 : 112, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 59.6 : 46.7 },
    { id: 'P005', age: 35, gender: 'Male', education: "Master's", city: 'Pune, Maharashtra', moves: isExtended ? 40 : 10, time: isExtended ? 315 : 89, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 77.5 : 70.0 },
    { id: 'P006', age: 26, gender: 'Female', education: "Bachelor's", city: 'Hyderabad, Telangana', moves: isExtended ? 48 : 13, time: isExtended ? 356 : 98, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 64.6 : 53.8 },
    { id: 'P007', age: 29, gender: 'Male', education: "Master's", city: 'Kolkata, West Bengal', moves: isExtended ? 36 : 9, time: isExtended ? 282 : 74, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 86.1 : 77.8 },
    { id: 'P008', age: 33, gender: 'Female', education: 'PhD', city: 'Ahmedabad, Gujarat', moves: isExtended ? 33 : 7, time: isExtended ? 265 : 68, optimalMoves: isExtended ? 31 : 7, efficiency: isExtended ? 93.9 : 100.0 },
  ];

  const avgMoves = (participantData.reduce((sum, p) => sum + p.moves, 0) / participantData.length).toFixed(1);
  const avgTime = (participantData.reduce((sum, p) => sum + p.time, 0) / participantData.length).toFixed(1);
  const avgEfficiency = (participantData.reduce((sum, p) => sum + p.efficiency, 0) / participantData.length).toFixed(1);

  // Demographics data
  const genderData = [
    { name: 'Male', value: 4, color: '#3b82f6' },
    { name: 'Female', value: 4, color: '#ec4899' },
  ];

  const educationData = [
    { name: "Bachelor's", value: 3, color: '#10b981' },
    { name: "Master's", value: 3, color: '#f59e0b' },
    { name: 'PhD', value: 2, color: '#8b5cf6' },
  ];

  const ageDistribution = [
    { range: '20-25', count: 2 },
    { range: '26-30', count: 3 },
    { range: '31-35', count: 3 },
  ];

  // Performance over attempts (simulated move sequence)
  const moveSequence = participantData.map((p, idx) => ({
    participant: p.id,
    attempt1: Math.floor(p.moves * 1.3),
    attempt2: Math.floor(p.moves * 1.1),
    finalAttempt: p.moves,
  }));

  // City distribution
  const cityData = [
    { city: 'Mumbai', count: 1 },
    { city: 'Delhi', count: 1 },
    { city: 'Bangalore', count: 1 },
    { city: 'Chennai', count: 1 },
    { city: 'Pune', count: 1 },
    { city: 'Hyderabad', count: 1 },
    { city: 'Kolkata', count: 1 },
    { city: 'Ahmedabad', count: 1 },
  ];

  // Correlation: Age vs Performance
  const agePerformanceData = participantData.map(p => ({
    age: p.age,
    efficiency: p.efficiency,
    moves: p.moves,
  }));

  // Education vs Performance
  const educationPerformance = [
    { education: "Bachelor's", avgEfficiency: participantData.filter(p => p.education === "Bachelor's").reduce((sum, p) => sum + p.efficiency, 0) / 3 },
    { education: "Master's", avgEfficiency: participantData.filter(p => p.education === "Master's").reduce((sum, p) => sum + p.efficiency, 0) / 3 },
    { education: 'PhD', avgEfficiency: participantData.filter(p => p.education === 'PhD').reduce((sum, p) => sum + p.efficiency, 0) / 2 },
  ];

  // Time vs Moves correlation
  const timeMoveData = participantData.map(p => ({
    time: p.time,
    moves: p.moves,
    name: p.id,
  }));

  // Planning efficiency radar
  const radarData = participantData.slice(0, 5).map(p => ({
    participant: p.id,
    efficiency: p.efficiency,
    speedScore: 100 - ((p.time / (isExtended ? 400 : 120)) * 100),
    moveEfficiency: (p.optimalMoves / p.moves) * 100,
  }));

  const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Moves</CardDescription>
            <CardTitle className="text-3xl">{avgMoves}</CardTitle>
            <CardDescription className="text-xs">Optimal: {isExtended ? '31' : '7'}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Time (sec)</CardDescription>
            <CardTitle className="text-3xl">{avgTime}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Efficiency</CardDescription>
            <CardTitle className="text-3xl">{avgEfficiency}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moves by Participant */}
        <Card>
          <CardHeader>
            <CardTitle>Moves to Solution by Participant</CardTitle>
            <CardDescription>Lower is better (Optimal: {isExtended ? '31' : '7'} moves)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="moves" fill="#3b82f6" name="Actual Moves" />
                <Bar dataKey="optimalMoves" fill="#10b981" name="Optimal Moves" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time to Solution */}
        <Card>
          <CardHeader>
            <CardTitle>Solution Time (seconds)</CardTitle>
            <CardDescription>Time taken to complete the puzzle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="time" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Efficiency by Participant</CardTitle>
            <CardDescription>Planning efficiency score (higher is better)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time vs Moves Correlation */}
        <Card>
          <CardHeader>
            <CardTitle>Time vs Moves Correlation</CardTitle>
            <CardDescription>Relationship between moves and completion time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="moves" name="Moves" />
                <YAxis dataKey="time" name="Time (s)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Participants" data={timeMoveData} fill="#ec4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Participant Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Participant Data</CardTitle>
          <CardDescription>Complete performance metrics and demographics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Age</th>
                  <th className="pb-2 font-semibold">Gender</th>
                  <th className="pb-2 font-semibold">Education</th>
                  <th className="pb-2 font-semibold">City</th>
                  <th className="pb-2 font-semibold">Moves</th>
                  <th className="pb-2 font-semibold">Time (s)</th>
                  <th className="pb-2 font-semibold">Efficiency</th>
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
                    <td className="py-2 font-semibold">{p.moves}</td>
                    <td className="py-2">{p.time}s</td>
                    <td className="py-2">
                      <span className={`font-semibold ${p.efficiency >= 80 ? 'text-green-600' : p.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {p.efficiency.toFixed(1)}%
                      </span>
                    </td>
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

export default HanoiAnalytics;
