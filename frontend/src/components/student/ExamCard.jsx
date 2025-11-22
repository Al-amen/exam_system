import React from 'react';
import { Clock, Calendar, Play, AlertCircle, CheckCircle } from 'lucide-react';

export function ExamCard({ exam, onStartExam }) {
  const now = new Date();
  const startTime = new Date(exam.start_time);
  const endTime = new Date(exam.end_time);
  const isAvailable = now >= startTime && now <= endTime && exam.is_published;
  const hasEnded = now > endTime;
  const notStarted = now < startTime;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (hasEnded) {
      return { 
        text: 'Exam Ended', 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertCircle 
      };
    }
    if (notStarted) {
      return { 
        text: 'Starts Soon', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Calendar 
      };
    }
    if (isAvailable) {
      return { 
        text: 'Available', 
        color: 'bg-green-100 text-green-800', 
        icon: Play 
      };
    }
    return { 
      text: 'Not Available', 
      color: 'bg-gray-100 text-gray-800', 
      icon: AlertCircle 
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-4">{exam.title}</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon size={14} className="mr-1" />
          {status.text}
        </span>
      </div>
      
      {exam.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{exam.description}</p>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-3 text-gray-400" />
          <div>
            <div className="font-medium">Starts</div>
            <div>{formatDate(exam.start_time)}</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-3 text-gray-400" />
          <div>
            <div className="font-medium">Ends</div>
            <div>{formatDate(exam.end_time)}</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="mr-3 text-gray-400" />
          <div>
            <div className="font-medium">Duration</div>
            <div>{exam.duration_minutes} minutes</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircle size={16} className="mr-3 text-gray-400" />
          <div>
            <div className="font-medium">Questions</div>
            <div>{exam.question_count || exam.questions?.length || 0} questions</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onStartExam(exam)}
        disabled={!isAvailable}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Play size={18} />
        <span>{hasEnded ? 'View Results' : 'Start Exam'}</span>
      </button>
    </div>
  );
}