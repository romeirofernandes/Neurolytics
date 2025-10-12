import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const NBackAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 25, gender: 'Male', education: "Bachelor's", city: 'Mumbai, Maharashtra', accuracy: 78.5, avgRT: 1215, hits: 23, falseAlarms: 7 },
    { id: 'P002', age: 30, gender: 'Female', education: "Master's", city: 'Bangalore, Karnataka', accuracy: 85.2, avgRT: 1089, hits: 26, falseAlarms: 4 },
    { id: 'P003', age: 27, gender: 'Male', education: 'PhD', city: 'Delhi, Delhi', accuracy: 88.1, avgRT: 1045, hits: 27, falseAlarms: 3 },
    { id: 'P004', age: 24, gender: 'Female', education: "Bachelor's", city: 'Chennai, Tamil Nadu', accuracy: 75.8, avgRT: 1298, hits: 22, falseAlarms: 8 },
    { id: 'P005', age: 28, gender: 'Male', education: "Master's", city: 'Pune, Maharashtra', accuracy: 82.4, avgRT: 1134, hits: 25, falseAlarms: 5 },
  ];

  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);
  const avgRT = Math.round(participantData.reduce((sum, p) => sum + p.avgRT, 0) / participantData.length);

  const genderData = [
    { name: 'Male', value: 3, color: '#3b82f6' },
    { name: 'Female', value: 2, color: '#ec4899' },
  ];

  const performanceData = participantData.map(p => ({
    id: p.id,
    Hits: p.hits,
    'False Alarms': p.falseAlarms,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">5</CardTitle>
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
            <CardDescription>Avg Reaction Time</CardDescription>
            <CardTitle className="text-3xl">{avgRT}ms</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by Participant</CardTitle>
            <CardDescription>Working memory performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reaction Time Distribution</CardTitle>
            <CardDescription>Response speed across participants</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="avgRT" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hits vs False Alarms</CardTitle>
            <CardDescription>Signal detection performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Hits" fill="#10b981" />
                <Bar dataKey="False Alarms" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" label={({ name, value }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
                  <th className="pb-2">Accuracy</th>
                  <th className="pb-2">Avg RT</th>
                  <th className="pb-2">Hits</th>
                  <th className="pb-2">False Alarms</th>
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
                    <td className="py-2 font-semibold text-purple-600">{p.accuracy}%</td>
                    <td className="py-2">{p.avgRT}ms</td>
                    <td className="py-2 text-green-600">{p.hits}</td>
                    <td className="py-2 text-red-600">{p.falseAlarms}</td>
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

export default NBackAnalytics;
