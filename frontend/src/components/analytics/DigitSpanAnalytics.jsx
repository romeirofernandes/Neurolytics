import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DigitSpanAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 23, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', forwardSpan: 7, backwardSpan: 5, totalSpan: 12, accuracy: 85.7 },
    { id: 'P002', age: 29, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', forwardSpan: 8, backwardSpan: 6, totalSpan: 14, accuracy: 91.2 },
    { id: 'P003', age: 26, gender: 'Female', education: 'PhD', city: 'Delhi, Delhi', forwardSpan: 9, backwardSpan: 7, totalSpan: 16, accuracy: 94.5 },
    { id: 'P004', age: 24, gender: 'Male', education: "Bachelor's", city: 'Pune, Maharashtra', forwardSpan: 6, backwardSpan: 5, totalSpan: 11, accuracy: 82.3 },
  ];

  const avgTotalSpan = (participantData.reduce((sum, p) => sum + p.totalSpan, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 2, color: '#3b82f6' },
    { name: 'Female', value: 2, color: '#ec4899' },
  ];

  const spanComparison = participantData.map(p => ({
    id: p.id,
    Forward: p.forwardSpan,
    Backward: p.backwardSpan,
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
            <CardDescription>Avg Total Span</CardDescription>
            <CardTitle className="text-3xl">{avgTotalSpan}</CardTitle>
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
            <CardTitle>Forward vs Backward Span</CardTitle>
            <CardDescription>Memory capacity comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spanComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Forward" fill="#10b981" name="Forward Span" />
                <Bar dataKey="Backward" fill="#3b82f6" name="Backward Span" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Span by Participant</CardTitle>
            <CardDescription>Overall memory capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalSpan" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
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
            <CardTitle>Accuracy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis domain={[75, 100]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#8b5cf6" />
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
                  <th className="pb-2">Forward Span</th>
                  <th className="pb-2">Backward Span</th>
                  <th className="pb-2">Total Span</th>
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
                    <td className="py-2">{p.forwardSpan}</td>
                    <td className="py-2">{p.backwardSpan}</td>
                    <td className="py-2 font-semibold text-green-600">{p.totalSpan}</td>
                    <td className="py-2 font-semibold text-purple-600">{p.accuracy}%</td>
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

export default DigitSpanAnalytics;
