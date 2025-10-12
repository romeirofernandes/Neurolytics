import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ABBAAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 27, gender: 'Male', education: "Master's", city: 'Mumbai, Maharashtra', compatibleRT: 456, incompatibleRT: 423, reversedEffect: -33, accuracy: 92.5 },
    { id: 'P002', age: 30, gender: 'Female', education: 'PhD', city: 'Bangalore, Karnataka', compatibleRT: 445, incompatibleRT: 418, reversedEffect: -27, accuracy: 94.8 },
  ];

  const avgReversedEffect = (participantData.reduce((sum, p) => sum + p.reversedEffect, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 1, color: '#3b82f6' },
    { name: 'Female', value: 1, color: '#ec4899' },
  ];

  const rtComparison = participantData.map(p => ({
    id: p.id,
    Compatible: p.compatibleRT,
    Incompatible: p.incompatibleRT,
  }));

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let yPosition = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ABBA Task Analytics', margin, yPosition);
      yPosition += 20;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: [
          ['Total Participants', '2'],
          ['Avg Reversed Effect', `${avgReversedEffect}ms`],
          ['Avg Accuracy', `${avgAccuracy}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [249, 250, 251], textColor: [26, 26, 26], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['ID', 'Age', 'Gender', 'Education', 'City', 'Compatible RT', 'Incompatible RT', 'Reversed Effect', 'Accuracy']],
        body: participantData.map(p => [
          p.id, p.age.toString(), p.gender, p.education, p.city,
          `${p.compatibleRT}ms`, `${p.incompatibleRT}ms`, `${p.reversedEffect}ms`, `${p.accuracy}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [249, 250, 251], textColor: [26, 26, 26], fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      doc.save(`ABBA-analytics-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={downloadPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">2</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Reversed Effect</CardDescription>
            <CardTitle className="text-3xl">{avgReversedEffect}ms</CardTitle>
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
            <CardDescription>Reversed compatibility effect</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rtComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Compatible" fill="#ef4444" name="Compatible (Slower)" />
                <Bar dataKey="Incompatible" fill="#10b981" name="Incompatible (Faster)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reversed Effect Magnitude</CardTitle>
            <CardDescription>Action planning interference</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reversedEffect" stroke="#14b8a6" strokeWidth={3} dot={{ r: 6 }} />
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
                  <th className="pb-2">Compatible RT</th>
                  <th className="pb-2">Incompatible RT</th>
                  <th className="pb-2">Reversed Effect</th>
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
                    <td className="py-2 font-semibold text-teal-600">{p.reversedEffect}ms</td>
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

export default ABBAAnalytics;
