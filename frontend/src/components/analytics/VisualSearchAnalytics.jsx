import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const VisualSearchAnalytics = () => {
  const participantData = [
    { id: 'P001', age: 26, gender: 'Male', education: "Bachelor's", city: 'Mumbai, Maharashtra', avgRT: 1523, searchSlope: 48, accuracy: 93.5, setSize8RT: 1245, setSize16RT: 1801 },
    { id: 'P002', age: 28, gender: 'Female', education: "Master's", city: 'Bangalore, Karnataka', avgRT: 1389, searchSlope: 42, accuracy: 96.2, setSize8RT: 1156, setSize16RT: 1622 },
    { id: 'P003', age: 31, gender: 'Male', education: 'PhD', city: 'Delhi, Delhi', avgRT: 1456, searchSlope: 38, accuracy: 97.8, setSize8RT: 1198, setSize16RT: 1714 },
  ];

  const avgSearchSlope = (participantData.reduce((sum, p) => sum + p.searchSlope, 0) / participantData.length).toFixed(1);
  const avgAccuracy = (participantData.reduce((sum, p) => sum + p.accuracy, 0) / participantData.length).toFixed(1);

  const genderData = [
    { name: 'Male', value: 2, color: '#3b82f6' },
    { name: 'Female', value: 1, color: '#ec4899' },
  ];

  const setSizeComparison = participantData.map(p => ({
    id: p.id,
    'Set Size 8': p.setSize8RT,
    'Set Size 16': p.setSize16RT,
  }));

  const slopeData = participantData.map(p => ({
    slope: p.searchSlope,
    avgRT: p.avgRT,
    name: p.id,
  }));

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let yPosition = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Visual Search Analytics', margin, yPosition);
      yPosition += 20;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: [
          ['Total Participants', '3'],
          ['Avg Search Slope', `${avgSearchSlope}ms/item`],
          ['Avg Accuracy', `${avgAccuracy}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [249, 250, 251], textColor: [26, 26, 26], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['ID', 'Age', 'Gender', 'Education', 'City', 'Avg RT', 'Search Slope', 'Accuracy', 'Set 8 RT', 'Set 16 RT']],
        body: participantData.map(p => [
          p.id, p.age.toString(), p.gender, p.education, p.city,
          `${p.avgRT}ms`, `${p.searchSlope}ms/item`, `${p.accuracy}%`, `${p.setSize8RT}ms`, `${p.setSize16RT}ms`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [249, 250, 251], textColor: [26, 26, 26], fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin }
      });

      doc.save(`VisualSearch-analytics-${Date.now()}.pdf`);
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
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Search Slope</CardDescription>
            <CardTitle className="text-3xl">{avgSearchSlope}ms/item</CardTitle>
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
            <CardTitle>RT by Set Size</CardTitle>
            <CardDescription>Search efficiency across different set sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={setSizeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Set Size 8" fill="#10b981" />
                <Bar dataKey="Set Size 16" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Slope by Participant</CardTitle>
            <CardDescription>Search efficiency (ms per item)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="searchSlope" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Slope vs Avg RT</CardTitle>
            <CardDescription>Efficiency correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="slope" name="Search Slope" />
                <YAxis dataKey="avgRT" name="Avg RT" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Participants" data={slopeData} fill="#8b5cf6" />
              </ScatterChart>
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
                  <th className="pb-2">Avg RT</th>
                  <th className="pb-2">Search Slope</th>
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
                    <td className="py-2">{p.avgRT}ms</td>
                    <td className="py-2 font-semibold text-blue-600">{p.searchSlope}ms/item</td>
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

export default VisualSearchAnalytics;
