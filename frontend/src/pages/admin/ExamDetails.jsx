import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Edit,
  BarChart3,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { examsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { 
    data: exam, 
    loading, 
    error, 
    execute: fetchExam 
  } = useApi(() => examsAPI.getExam(id), null);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchExam();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExamStatus = () => {
    if (!exam) return 'loading';
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditExam = () => {
    navigate(`/admin/exams/${id}/edit`);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl mb-2">Failed to load exam</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchExam}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <div className="text-gray-600 text-xl mb-2">Exam not found</div>
          <button 
            onClick={() => navigate('/admin/exams')}
            className="btn-primary"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const status = getExamStatus();
  const totalQuestions = exam.questions?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/exams')}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  exam.is_published 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {exam.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {totalQuestions} Questions
                </span>
              </div>
              
              {exam.description && (
                <p className="text-gray-600 text-lg max-w-3xl">{exam.description}</p>
              )}
            </div>

            <div className="mt-4 lg:mt-0 flex space-x-3">
              <button
                onClick={handleEditExam}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Exam
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Start Time</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(exam.start_time)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">End Time</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(exam.end_time)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{exam.duration_minutes} minutes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-lg font-semibold text-gray-900">{totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Questions ({totalQuestions})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="inline-block w-4 h-4 mr-2" />
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Exam Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created By</label>
                      <p className="mt-1 text-sm text-gray-900">You</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(exam.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Visibility</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {exam.is_published ? 'Published to students' : 'Draft (not visible to students)'}
                      </p>
                    </div>
                  </div>
                </div>

                {exam.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{exam.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Questions</h3>
                {totalQuestions === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
                    <p className="mt-1 text-sm text-gray-500">This exam doesn't have any questions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exam.questions?.map((question, index) => (
                      <div key={question.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {question.type?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">{question.title}</h4>
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Points: {question.max_score || 1}</span>
                              <span>Complexity: {question.complexity}</span>
                            </div>
                          </div>
                          <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics coming soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Exam performance analytics will be available after students start taking the exam.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}