import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PosnerAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 26, gender: 'Male', education: "Bachelor's", city: 'Mumbai, Maharashtra', validRT: 298, invalidRT: 378, cueingEffect: 80, accuracy: 96.5 },
    { id: 'P002', age: 29, gender: 'Female', education: "Master's", city: 'Bangalore, Karnataka', validRT: 285, invalidRT: 365, cueingEffect: 80, accuracy: 97.8 },
    { id: 'P003', age: 24, gender: 'Male', education: "Bachelor's", city: 'Delhi, Delhi', validRT: 312, invalidRT: 402, cueingEffect: 90, accuracy: 95.2 },
    { id: 'P004', age: 31, gender: 'Female', education: 'PhD', city: 'Pune, Maharashtra', validRT: 278, invalidRT: 358, cueingEffect: 80, accuracy: 98.1 },
    { id: 'P005', age: 27, gender: 'Male', education: "Master's", city: 'Chennai, Tamil Nadu', validRT: 305, invalidRT: 392, cueingEffect: 87, accuracy: 96.0 },
  ];

  const avgCueingEffect = (participantData.reduce((sum, p) => sum + p.cueingEffect, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 3, color: '#3b82f6' },
    { name: 'Female', value: 2, color: '#ec4899' },
  ];

  const rtComparison = participantData.map(p => ({
    id: p.id,
    Valid: p.validRT,
    Invalid: p.invalidRT,
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
            <CardDescription>Avg Cueing Effect</CardDescription>
            <CardTitle className="text-3xl">{avgCueingEffect}ms</CardTitle>
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
            <CardTitle>Valid vs Invalid Cue RT</CardTitle>
            <CardDescription>Attentional orienting effects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rtComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Valid" fill="#10b981" name="Valid Cue" />
                <Bar dataKey="Invalid" fill="#ef4444" name="Invalid Cue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cueing Effect by Participant</CardTitle>
            <CardDescription>Spatial attention benefit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cueingEffect" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
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
            <CardTitle>Accuracy by Participant</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#10b981" />
              </BarChart>
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
                  <th className="pb-2">Valid RT</th>
                  <th className="pb-2">Invalid RT</th>
                  <th className="pb-2">Cueing Effect</th>
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
                    <td className="py-2">{p.validRT}ms</td>
                    <td className="py-2">{p.invalidRT}ms</td>
                    <td className="py-2 font-semibold text-orange-600">{p.cueingEffect}ms</td>
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

export default PosnerAnalytics;
