import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptsAPI, examsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ExamTimer } from '../../components/student/ExamTimer';
import { QuestionRenderer } from '../../components/student/QuestionRenderer';

export default function ExamTaking() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);

  // Fetch attempt data - FIXED: Provide proper initial data
  const { data: attempt, loading: attemptLoading, error: attemptError } = useApi(
    () => attemptsAPI.getAttempt(attemptId),
    null // This is fine, but the hook now handles null safely
  );

  // Fetch exam data when attempt is available - FIXED: Use proper conditional
  const shouldFetchExam = attempt && attempt.exam_id;
  const { data: exam, loading: examLoading, error: examError } = useApi(
    shouldFetchExam ? () => examsAPI.getExam(attempt.exam_id) : null,
    null,
    shouldFetchExam // Only auto-execute if we should fetch
  );

  // Initialize auto-save hook with saved answers
  const { answers, updateAnswer, saveStatus, lastSaveTime } = useAutoSave(
    attemptId,
    attempt?.auto_saved_answers || {}
  );

  // Set exam data when both attempt and exam are loaded
  useEffect(() => {
    if (attempt && exam) {
      setExamData({
        ...exam,
        attempt: attempt
      });
    }
  }, [attempt, exam]);

  // Rest of your component remains the same...
  const handleTimeUp = async () => {
    if (!isSubmitting) {
      await submitExam();
    }
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('🚀 Submitting exam attempt:', attemptId);
      await attemptsAPI.submitAttempt(attemptId);
      
      console.log('✅ Exam submitted successfully');
      navigate('/student/results', { 
        state: { 
          message: 'Exam submitted successfully!',
          examId: attempt.exam_id,
          attemptId: attemptId
        }
      });
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit exam: ' + (error.response?.data?.detail || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    updateAnswer(questionId, answer);
  };

  // ... rest of your event handlers

  // Loading state
  if (attemptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">Loading your exam...</p>
        </div>
      </div>
    );
  }

  // Error state for attempt
  if (attemptError || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-red-600 text-xl font-semibold mb-2">Exam not found</h3>
          <p className="text-gray-600 mb-6">
            {attemptError || 'The exam attempt could not be loaded.'}
          </p>
          <button 
            onClick={() => navigate('/student/exams')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // Show loading for exam data
  if (examLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">Loading exam content...</p>
        </div>
      </div>
    );
  }

  // Error state for exam
  if (examError || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-red-600 text-xl font-semibold mb-2">Exam content not found</h3>
          <p className="text-gray-600 mb-6">
            {examError || 'The exam content could not be loaded.'}
          </p>
          <button 
            onClick={() => navigate('/student/exams')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // Check if exam has already been submitted
  if (attempt.status === 'submitted' || attempt.status === 'graded') {
    navigate('/student/results', { 
      state: { 
        message: 'Exam already submitted',
        examId: attempt.exam_id,
        attemptId: attemptId
      }
    });
    return null;
  }

  // Rest of your component JSX...
  const questions = exam.questions || [];
  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).filter(qId => {
    const answer = answers[qId];
    return answer !== null && answer !== undefined && answer !== '' && 
           (!Array.isArray(answer) || answer.length > 0);
  }).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your existing JSX for the exam interface */}
      {/* ... */}
    </div>
  );
}