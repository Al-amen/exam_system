import { useState, useEffect, useCallback, useRef } from 'react';
import { attemptsAPI } from '../services/api';

export function useAutoSave(attemptId, initialAnswers = {}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const saveTimeoutRef = useRef(null);
  const periodicSaveRef = useRef(null);

  // Debounced auto-save on answer changes
  const autoSave = useCallback(async (answersToSave) => {
    if (!attemptId || Object.keys(answersToSave).length === 0) return;
    
    setSaveStatus('saving');
    try {
      await attemptsAPI.autoSaveAnswers(attemptId, answersToSave);
      setSaveStatus('saved');
      setLastSaveTime(Date.now());
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [attemptId]);

  // Auto-save on answer changes (debounced)
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(answers);
      }, 2000); // 2 second debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, autoSave]);

  // Periodic auto-save (every 30 seconds)
  useEffect(() => {
    periodicSaveRef.current = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        autoSave(answers);
      }
    }, 30000);

    return () => {
      if (periodicSaveRef.current) {
        clearInterval(periodicSaveRef.current);
      }
    };
  }, [answers, autoSave]);

  // Save answers before window close or refresh
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (Object.keys(answers).length > 0) {
        // Try to sync save (may not complete)
        attemptsAPI.autoSaveAnswers(attemptId, answers).catch(console.error);
        
        // Show confirmation message
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, attemptId]);

  const updateAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const bulkUpdateAnswers = useCallback((newAnswers) => {
    setAnswers(newAnswers);
  }, []);

  return {
    answers,
    updateAnswer,
    bulkUpdateAnswers,
    saveStatus,
    lastSaveTime
  };
}