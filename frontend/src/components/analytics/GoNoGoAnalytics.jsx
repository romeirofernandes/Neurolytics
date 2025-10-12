import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const GoNoGoAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 23, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', goRT: 412, commissionErrors: 6.7, omissionErrors: 2.1, accuracy: 91.2 },
    { id: 'P002', age: 28, gender: 'Male', education: "Master's", city: 'Delhi, Delhi', goRT: 389, commissionErrors: 4.5, omissionErrors: 1.5, accuracy: 94.0 },
    { id: 'P003', age: 26, gender: 'Female', education: "Bachelor's", city: 'Bangalore, Karnataka', goRT: 425, commissionErrors: 8.2, omissionErrors: 2.8, accuracy: 89.0 },
    { id: 'P004', age: 31, gender: 'Male', education: 'PhD', city: 'Chennai, Tamil Nadu', goRT: 378, commissionErrors: 3.8, omissionErrors: 1.2, accuracy: 95.0 },
    { id: 'P005', age: 29, gender: 'Male', education: "Master's", city: 'Pune, Maharashtra', goRT: 398, commissionErrors: 5.5, omissionErrors: 1.8, accuracy: 92.7 },
    { id: 'P006', age: 25, gender: 'Female', education: "Bachelor's", city: 'Hyderabad, Telangana', goRT: 418, commissionErrors: 7.1, omissionErrors: 2.5, accuracy: 90.4 },
  ];

  const avgCommissionError = (participantData.reduce((sum, p) => sum + p.commissionErrors, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 3, color: '#3b82f6' },
    { name: 'Female', value: 3, color: '#ec4899' },
  ];

  const educationData = [
    { name: "Bachelor's", value: 3, color: '#10b981' },
    { name: "Master's", value: 2, color: '#f59e0b' },
    { name: 'PhD', value: 1, color: '#8b5cf6' },
  ];

  const errorComparison = participantData.map(p => ({
    id: p.id,
    Commission: p.commissionErrors,
    Omission: p.omissionErrors,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">6</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Commission Errors</CardDescription>
            <CardTitle className="text-3xl">{avgCommissionError}%</CardTitle>
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
            <CardTitle>Error Rates by Participant</CardTitle>
            <CardDescription>Commission vs Omission errors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Commission" fill="#ef4444" name="Commission Errors %" />
                <Bar dataKey="Omission" fill="#f59e0b" name="Omission Errors %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Go Trial Reaction Time</CardTitle>
            <CardDescription>Response speed on Go trials</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="goRT" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
              </AreaChart>
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
                <YAxis domain={[85, 100]} />
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
                  <th className="pb-2">Go RT</th>
                  <th className="pb-2">Commission %</th>
                  <th className="pb-2">Omission %</th>
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
                    <td className="py-2">{p.goRT}ms</td>
                    <td className="py-2 text-red-600">{p.commissionErrors}%</td>
                    <td className="py-2 text-orange-600">{p.omissionErrors}%</td>
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

export default GoNoGoAnalytics;
