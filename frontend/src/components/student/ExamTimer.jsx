import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export function ExamTimer({ duration, onTimeUp, startTime, isSubmitted = false }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;

    // Calculate initial time left based on start time
    const calculateInitialTime = () => {
      const now = new Date();
      const start = new Date(startTime);
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const totalSeconds = duration * 60;
      return Math.max(0, totalSeconds - elapsedSeconds);
    };

    setTimeLeft(calculateInitialTime());

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 300) { // 5 minutes warning
          setIsWarning(true);
        }
        if (prev <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUp, startTime, isSubmitted]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-700">
        <Clock size={20} />
        <span className="font-mono text-lg font-semibold">Exam Submitted</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 ${
      timeLeft <= 60
        ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
        : isWarning 
        ? 'bg-orange-50 border-orange-300 text-orange-700' 
        : 'bg-blue-50 border-blue-300 text-blue-700'
    }`}>
      {timeLeft <= 60 ? <AlertTriangle size={20} /> : <Clock size={20} />}
      <div>
        <div className="font-mono text-xl font-bold">
          {formatTime(timeLeft)}
        </div>
        {timeLeft <= 300 && (
          <div className="text-xs font-medium">
            {timeLeft <= 60 ? 'Time almost up!' : 'Time running out!'}
          </div>
        )}
      </div>
    </div>
  );
}