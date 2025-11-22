import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, Search } from 'lucide-react';

// Mock data for demonstration
const mockResults = [
  {
    id: '1',
    exam_title: 'Mathematics Midterm',
    student_name: 'John Doe',
    score: 85,
    total_score: 100,
    submitted_at: '2024-01-15T10:30:00Z',
    status: 'graded'
  },
  {
    id: '2',
    exam_title: 'Physics Final',
    student_name: 'Jane Smith',
    score: 92,
    total_score: 100,
    submitted_at: '2024-01-16T14:20:00Z',
    status: 'graded'
  },
  {
    id: '3',
    exam_title: 'Chemistry Quiz',
    student_name: 'Mike Johnson',
    score: 78,
    total_score: 100,
    submitted_at: '2024-01-17T09:15:00Z',
    status: 'graded'
  }
];

const chartData = [
  { name: '90-100', students: 12 },
  { name: '80-89', students: 8 },
  { name: '70-79', students: 5 },
  { name: '60-69', students: 3 },
  { name: 'Below 60', students: 2 }
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

export default function Results() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const isAdmin = user?.role === 'admin';

  // Filter results based on search and filter
  const filteredResults = mockResults.filter(result => {
    const matchesSearch = result.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || result.status === filter;
    return matchesSearch && matchesFilter;
  });

  const exportResults = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'Exam Results' : 'My Results'}
        </h2>
        {isAdmin && (
          <button
            onClick={exportResults}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export Results</span>
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Overview */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="card">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search exams or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="graded">Graded</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.exam_title}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.student_name}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.score}/{result.total_score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((result.score / result.total_score) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.status === 'graded' ? 'Graded' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'No results match your search criteria.' 
                : 'No results available.'}
            </p>
          </div>
        )}
      </div>

      {/* Student-specific view */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {mockResults.length}
            </div>
            <div className="text-sm text-gray-600">Exams Taken</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(mockResults.reduce((acc, curr) => acc + curr.score, 0) / mockResults.length)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockResults.filter(r => r.score >= 80).length}
            </div>
            <div className="text-sm text-gray-600">Exams Passed</div>
          </div>
        </div>
      )}
    </div>
  );
}