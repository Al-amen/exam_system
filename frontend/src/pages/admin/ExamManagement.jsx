import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Users, 
  Search,
  Filter,
  MoreVertical,
  FileText,
  BarChart3
} from 'lucide-react';
import { examsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { QuestionSelector } from '../../components/admin/QuestionSelector';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    data: exams, 
    loading, 
    error, 
    execute: fetchExams,
    setData: setExams 
  } = useApi(() => examsAPI.getExams(), []);

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    question_ids: [],
    is_published: false
  });

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Filter exams based on search and status
  const filteredExams = exams?.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && exam.is_published) ||
                         (statusFilter === 'draft' && !exam.is_published);
    return matchesSearch && matchesStatus;
  });

  // Use useCallback to prevent infinite re-renders
  const handleViewDetails = useCallback((examId) => {
    navigate(`/admin/exams/${examId}`);
  }, [navigate]);

  const handleEditExam = useCallback((examId) => {
    navigate(`/admin/exams/${examId}/edit`);
  }, [navigate]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Raw form data before processing:', newExam);
    
    // Check if user is authenticated
    if (!user) {
      alert('User not authenticated. Please log in again.');
      return;
    }
    
    // Validation
    if (newExam.question_ids.length === 0) {
      alert('Please select at least one question for the exam.');
      return;
    }

    // Date validation
    const startTime = new Date(newExam.start_time);
    const endTime = new Date(newExam.end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      alert('Please enter valid start and end times.');
      return;
    }

    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    if (newExam.duration_minutes < 1) {
      alert('Duration must be at least 1 minute.');
      return;
    }

    // Validate question IDs
    const isValidUUID = (id) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };

    const validQuestionIds = newExam.question_ids.filter(id => isValidUUID(id));
    if (validQuestionIds.length !== newExam.question_ids.length) {
      console.warn('Some question IDs are invalid:', newExam.question_ids);
      alert('Some selected questions have invalid IDs. Please try selecting them again.');
      return;
    }

    try {
      // Prepare data WITHOUT created_by field - backend will handle it from auth token
      const examData = {
        title: newExam.title.trim(),
        description: newExam.description?.trim() || null,
        start_time: new Date(newExam.start_time).toISOString(),
        end_time: new Date(newExam.end_time).toISOString(),
        duration_minutes: parseInt(newExam.duration_minutes),
        question_ids: validQuestionIds,
        is_published: Boolean(newExam.is_published)
      };

      console.log('🚀 Sending exam data to API:', examData);

      const response = await examsAPI.createExam(examData);
      console.log('✅ Exam created successfully:', response);
      
      // Update local state optimistically
      setExams(prevExams => [response.data || response, ...prevExams]);
      
      setShowCreateModal(false);
      setNewExam({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        question_ids: [],
        is_published: false
      });
      
      alert('Exam created successfully!');
    } catch (error) {
      console.error('❌ Full error details:', error);
      console.error('❌ Error response:', error.response);
      
      let errorMessage = 'Failed to create exam: ';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage += error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail.map(err => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage += validationErrors;
        } else if (typeof error.response.data.detail === 'object') {
          errorMessage += JSON.stringify(error.response.data.detail);
        } else {
          errorMessage += error.response.data.detail;
        }
      } else if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const handlePublishToggle = async (examId, currentStatus) => {
    try {
      const updatedExam = await examsAPI.updateExam(examId, { is_published: !currentStatus });
      
      // Update local state optimistically
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.id === examId 
            ? { ...exam, is_published: !currentStatus }
            : exam
        )
      );
    } catch (error) {
      alert('Failed to update exam: ' + (error.response?.data?.detail || 'Unknown error'));
      fetchExams();
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        await examsAPI.deleteExam(examId);
        setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
      } catch (error) {
        alert('Failed to delete exam: ' + (error.response?.data?.detail || 'Unknown error'));
        fetchExams();
      }
    }
  };

  const handleQuestionsChange = (questionIds) => {
    console.log('📝 Questions changed:', questionIds);
    setNewExam(prev => ({
      ...prev,
      question_ids: questionIds
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  


  const getTotalQuestions = (exam) => {
    // Use question_count from backend if available
    if (exam.question_count !== undefined && exam.question_count !== null) {
      return exam.question_count;
    }
    // Fallback to questions array length
    if (exam.questions && Array.isArray(exam.questions)) {
      return exam.questions.length;
    }
    // Fallback to question_ids length
    if (exam.question_ids && Array.isArray(exam.question_ids)) {
      return exam.question_ids.length;
    }
    return 0;
  };


  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ended': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'upcoming': return '🔵';
      case 'ended': return '⚫';
      default: return '⚫';
    }
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <div className="text-red-600 text-xl mb-2">Authentication Required</div>
          <div className="text-gray-600 mb-4">Please log in to access exam management.</div>
        </div>
      </div>
    );
  }

  if (loading && !exams.length) return <LoadingSpinner />;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <div className="text-red-600 text-xl mb-2">Failed to load exams</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button onClick={fetchExams} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
              <p className="mt-2 text-gray-600">Create and manage exams for your students</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Exam
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{exams?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ToggleRight className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exams?.filter(e => e.is_published).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exams?.filter(e => getExamStatus(e) === 'active').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exams?.reduce((total, exam) => total + getTotalQuestions(exam), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExams?.map((exam) => {
            const status = getExamStatus(exam);
            const totalQuestions = getTotalQuestions(exam);
            
            return (
              <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {exam.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          exam.is_published 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {exam.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exam.description}</p>
                  )}

                  {/* Exam Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(exam.start_time)} - {formatDate(exam.end_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{exam.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{totalQuestions} questions</span>
                    </div>
                  </div>

                  {/* Progress Bar for Active Exams */}
                  {status === 'active' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Time Remaining</span>
                        <span>Active</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handlePublishToggle(exam.id, exam.is_published)}
                        className={`p-2 rounded-lg transition-colors ${
                          exam.is_published 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={exam.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {exam.is_published ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleEditExam(exam.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit exam"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViewDetails(exam.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(!filteredExams || filteredExams.length === 0) && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first exam for students.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Exam
            </button>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Exam"
        size="2xl"
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-2xl -mx-6 -mt-6 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Exam</h2>
          <p className="text-gray-600 mt-1">Set up a new exam with questions from your question bank</p>
        </div>

        <form onSubmit={handleCreateExam} className="space-y-6 px-1">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newExam.description}
                onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                rows="3"
                placeholder="Enter exam description and instructions for students..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newExam.start_time}
                  onChange={(e) => setNewExam({ ...newExam, start_time: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newExam.end_time}
                  onChange={(e) => setNewExam({ ...newExam, end_time: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={newExam.duration_minutes}
                onChange={(e) => setNewExam({ ...newExam, duration_minutes: parseInt(e.target.value) || 1 })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              />
            </div>
          </div>

          {/* Question Selector */}
          <div className="border-t border-gray-200 pt-6">
            <QuestionSelector
              selectedQuestions={newExam.question_ids}
              onQuestionsChange={handleQuestionsChange}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-white sticky bottom-0 pb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="publish"
                  checked={newExam.is_published}
                  onChange={(e) => setNewExam({ ...newExam, is_published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="publish" className="ml-2 text-sm text-gray-700 font-medium">
                  Publish exam immediately
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                disabled={newExam.question_ids.length === 0}
              >
                {newExam.question_ids.length === 0 ? (
                  'Select Questions First'
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam ({newExam.question_ids.length} questions)
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}