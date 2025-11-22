// components/student/TakeExam.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsAPI, attemptsAPI } from '../../services/api';
import { ExamCard } from '../../components/student/ExamCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';


export default function TakeExam() {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual fetch function - NO HOOKS
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching exams manually...');
      
      const response = await examsAPI.getExams();
      const examsData = response.data;
      
      console.log('📊 Exams data received:', examsData?.length || 0, 'exams');
      
      if (!examsData || !Array.isArray(examsData)) {
        console.error('Invalid exams data format:', examsData);
        setAvailableExams([]);
        return;
      }

      const now = new Date();
      const filteredExams = examsData.filter(exam => {
        if (!exam || !exam.is_published) return false;
        
        try {
          const startTime = new Date(exam.start_time);
          const endTime = new Date(exam.end_time);
          const isAvailable = now >= startTime && now <= endTime;
          
          return isAvailable;
        } catch (dateError) {
          console.error('Error parsing dates for exam:', exam, dateError);
          return false;
        }
      });
      
      console.log('✅ Available exams after filtering:', filteredExams.length);
      setAvailableExams(filteredExams);
      
    } catch (err) {
      console.error('❌ Error fetching exams:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load exams';
      setError(errorMessage);
      setAvailableExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exams only once on component mount
  useEffect(() => {
    console.log('🏁 TakeExam component mounted, fetching exams once...');
    fetchExams();
  }, [fetchExams]); // Empty dependency array ensures this runs only once

  const handleStartExam = async (exam) => {
    try {
      console.log('🚀 Starting exam attempt for:', exam.id);
      const response = await attemptsAPI.startAttempt({
        exam_id: exam.id
      });
      
      console.log('✅ Attempt created:', response.data);
      navigate(`/student/exam/${response.data.id}`);
    } catch (error) {
      console.error('❌ Failed to start exam:', error);
      const errorDetail = error.response?.data;
      
      let errorMessage = 'Failed to start exam';
      if (errorDetail?.detail) {
        errorMessage = errorDetail.detail;
      } else if (errorDetail && typeof errorDetail === 'object') {
        errorMessage = Object.values(errorDetail).flat().join(', ');
      }
      
      alert(errorMessage);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchExams();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading exams...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-red-600 text-xl font-semibold mb-2">Failed to load exams</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Available Exams</h1>
          <p className="text-gray-600 text-lg">
            {availableExams.length} exam{availableExams.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Available Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {availableExams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onStartExam={handleStartExam}
          />
        ))}
      </div>

      {/* No Exams Available */}
      {availableExams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">⏰</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No exams available</h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            There are no exams available at the moment. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}