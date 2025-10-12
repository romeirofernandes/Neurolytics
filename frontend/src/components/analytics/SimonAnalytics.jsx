import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const SimonAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 27, gender: 'Male', education: "Bachelor's", city: 'Mumbai, Maharashtra', compatibleRT: 412, incompatibleRT: 467, simonEffect: 55, accuracy: 94.2 },
    { id: 'P002', age: 24, gender: 'Female', education: "Master's", city: 'Bangalore, Karnataka', compatibleRT: 398, incompatibleRT: 445, simonEffect: 47, accuracy: 96.1 },
    { id: 'P003', age: 30, gender: 'Male', education: 'PhD', city: 'Delhi, Delhi', compatibleRT: 385, incompatibleRT: 428, simonEffect: 43, accuracy: 97.5 },
    { id: 'P004', age: 25, gender: 'Female', education: "Bachelor's", city: 'Pune, Maharashtra', compatibleRT: 425, incompatibleRT: 478, simonEffect: 53, accuracy: 92.8 },
  ];

  const avgSimonEffect = (participantData.reduce((sum, p) => sum + p.simonEffect, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 2, color: '#3b82f6' },
    { name: 'Female', value: 2, color: '#ec4899' },
  ];

  const educationData = [
    { name: "Bachelor's", value: 2, color: '#10b981' },
    { name: "Master's", value: 1, color: '#f59e0b' },
    { name: 'PhD', value: 1, color: '#8b5cf6' },
  ];

  const rtComparison = participantData.map(p => ({
    id: p.id,
    Compatible: p.compatibleRT,
    Incompatible: p.incompatibleRT,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">4</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Simon Effect</CardDescription>
            <CardTitle className="text-3xl">{avgSimonEffect}ms</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Accuracy</CardDescription>
            <CardTitle className="text-3xl">{avgAccuracy}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compatible vs Incompatible RT</CardTitle>
            <CardDescription>Response times by spatial compatibility</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rtComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Compatible" fill="#10b981" />
                <Bar dataKey="Incompatible" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simon Effect by Participant</CardTitle>
            <CardDescription>Spatial interference magnitude</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="simonEffect" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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

        <Card>
          <CardHeader>
            <CardTitle>Education Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={educationData} cx="50%" cy="50%" label={({ name, value }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
                  {educationData.map((entry, index) => (
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
                  <th className="pb-2">Compatible RT</th>
                  <th className="pb-2">Incompatible RT</th>
                  <th className="pb-2">Simon Effect</th>
                  <th className="pb-2">Accuracy</th>
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
                    <td className="py-2">{p.compatibleRT}ms</td>
                    <td className="py-2">{p.incompatibleRT}ms</td>
                    <td className="py-2 font-semibold text-cyan-600">{p.simonEffect}ms</td>
                    <td className="py-2 font-semibold text-green-600">{p.accuracy}%</td>
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

export default SimonAnalytics;
