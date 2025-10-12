import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area } from 'recharts';

const BARTAnalytics = () => {
  // 5 participants with realistic BART data
  const participantData = [
    { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', avgPumps: 28.4, totalEarnings: 2450, explosions: 8, riskScore: 'Moderate' },
    { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', avgPumps: 35.2, totalEarnings: 2890, explosions: 12, riskScore: 'High' },
    { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi, Delhi', avgPumps: 22.1, totalEarnings: 2180, explosions: 5, riskScore: 'Conservative' },
    { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune, Maharashtra', avgPumps: 31.5, totalEarnings: 2720, explosions: 10, riskScore: 'Moderate-High' },
    { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai, Tamil Nadu', avgPumps: 26.8, totalEarnings: 2530, explosions: 7, riskScore: 'Moderate' },
  ];

  const avgPumps = (participantData.reduce((sum, p) => sum + p.avgPumps, 0) / participantData.length).toFixed(1);
  const avgEarnings = Math.round(participantData.reduce((sum, p) => sum + p.totalEarnings, 0) / participantData.length);

  // Trial-by-trial risk progression
  const riskProgression = [
    { trial: 5, avgPumps: 25.2 },
    { trial: 10, avgPumps: 27.8 },
    { trial: 15, avgPumps: 29.5 },
    { trial: 20, avgPumps: 28.1 },
    { trial: 25, avgPumps: 30.3 },
    { trial: 30, avgPumps: 28.7 },
  ];

  // Risk profile distribution
  const riskProfiles = [
    { profile: 'Conservative', count: 1, color: '#10b981' },
    { profile: 'Moderate', count: 2, color: '#3b82f6' },
    { profile: 'Moderate-High', count: 1, color: '#f59e0b' },
    { profile: 'High', count: 1, color: '#ef4444' },
  ];

  // Earnings vs Explosions
  const earningsExplosionData = participantData.map(p => ({
    id: p.id,
    earnings: p.totalEarnings,
    explosions: p.explosions,
  }));

  // Demographics
  const genderData = [
    { name: 'Male', value: 3, color: '#3b82f6' },
    { name: 'Female', value: 2, color: '#ec4899' },
  ];

  const educationData = [
    { name: "Bachelor's", value: 2, color: '#10b981' },
    { name: "Master's", value: 2, color: '#f59e0b' },
    { name: 'PhD', value: 1, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">5</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Pumps per Balloon</CardDescription>
            <CardTitle className="text-3xl">{avgPumps}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Total Earnings</CardDescription>
            <CardTitle className="text-3xl">₹{avgEarnings}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Risk Profile</CardDescription>
            <CardTitle className="text-2xl">Moderate</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk-Taking by Participant</CardTitle>
            <CardDescription>Average pumps per balloon</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgPumps" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Earnings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalEarnings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Profile Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskProfiles} cx="50%" cy="50%" labelLine={true} label={({ profile, count }) => `${profile}: ${count}`} outerRadius={100} dataKey="count">
                  {riskProfiles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Progression Over Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trial" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgPumps" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                  <th className="pb-2">Avg Pumps</th>
                  <th className="pb-2">Earnings</th>
                  <th className="pb-2">Explosions</th>
                  <th className="pb-2">Risk Score</th>
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
                    <td className="py-2 font-semibold">{p.avgPumps}</td>
                    <td className="py-2 text-green-600 font-semibold">₹{p.totalEarnings}</td>
                    <td className="py-2 text-red-600">{p.explosions}</td>
                    <td className="py-2">{p.riskScore}</td>
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

export default BARTAnalytics;
