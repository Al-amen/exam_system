import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Plus,
  Calendar, 
  Clock, 
  Users,
  AlertCircle
} from 'lucide-react';
import { examsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { QuestionSelector } from '../../components/admin/QuestionSelector';
import { useAuth } from '../../contexts/AuthContext';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { 
    data: exam, 
    loading, 
    error, 
    execute: fetchExam 
  } = useApi(() => examsAPI.getExam(id), null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    question_ids: [],
    is_published: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExam();
    }
  }, [id]);

  useEffect(() => {
    if (exam) {
      // Format dates for datetime-local input
      const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: exam.title || '',
        description: exam.description || '',
        start_time: formatDateForInput(exam.start_time),
        end_time: formatDateForInput(exam.end_time),
        duration_minutes: exam.duration_minutes || 60,
        question_ids: exam.questions?.map(q => q.id) || [],
        is_published: exam.is_published || false
      });
    }
  }, [exam]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionsChange = (questionIds) => {
    setFormData(prev => ({
      ...prev,
      question_ids: questionIds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    // Validation
    if (formData.question_ids.length === 0) {
      alert('Please select at least one question for the exam.');
      return;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      alert('Please enter valid start and end times.');
      return;
    }

    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    if (formData.duration_minutes < 1) {
      alert('Duration must be at least 1 minute.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        duration_minutes: parseInt(formData.duration_minutes),
        question_ids: formData.question_ids,
        is_published: Boolean(formData.is_published)
      };

      console.log('🔄 Updating exam with data:', updateData);

      await examsAPI.updateExam(id, updateData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/admin/exams');
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to update exam:', error);
      
      let errorMessage = 'Failed to update exam: ';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage += error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail.map(err => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage += validationErrors;
        } else {
          errorMessage += JSON.stringify(error.response.data.detail);
        }
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => navigate('/admin/exams')}
            className="btn-primary"
          >
            Back to Exams
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

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/exams')}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Exam</h1>
              <p className="mt-2 text-gray-600">Update the exam details and questions</p>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccess}
          onClose={() => {}}
          title="Exam Updated"
          size="md"
        >
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Updated Successfully!</h3>
            <p className="text-gray-600">Redirecting back to exams...</p>
          </div>
        </Modal>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="Enter exam title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
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
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
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
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 1)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Exam Questions</h2>
            <QuestionSelector
              selectedQuestions={formData.question_ids}
              onQuestionsChange={handleQuestionsChange}
            />
          </div>

          {/* Publish Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Publish Settings</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publish"
                checked={formData.is_published}
                onChange={(e) => handleInputChange('is_published', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="publish" className="ml-3 text-sm text-gray-700 font-medium">
                Publish exam to make it available to students
              </label>
            </div>
            {formData.is_published && (
              <div className="mt-3 flex items-center text-sm text-amber-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Published exams are visible to students immediately.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/exams')}
              className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/admin/exams/${id}`)}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Preview
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting || formData.question_ids.length === 0}
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Exam ({formData.question_ids.length} questions)
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}