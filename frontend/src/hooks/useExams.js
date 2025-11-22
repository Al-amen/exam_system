// hooks/useExams.js
import { useState, useEffect, useCallback } from 'react';
import { examsAPI } from '../services/api';

export function useExams() {
  const [exams, setExams] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await examsAPI.getExams();
      const examsData = response.data;
      
      setExams(examsData || []);
      
      // Filter available exams
      const now = new Date();
      const available = (examsData || []).filter(exam => {
        if (!exam || !exam.is_published) return false;
        
        try {
          const startTime = new Date(exam.start_time);
          const endTime = new Date(exam.end_time);
          return now >= startTime && now <= endTime;
        } catch {
          return false;
        }
      });
      
      setAvailableExams(available);
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load exams');
      setExams([]);
      setAvailableExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return {
    exams,
    availableExams,
    loading,
    error,
    refetch: fetchExams
  };
}