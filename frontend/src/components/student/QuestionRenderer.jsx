import React, { useState } from 'react';
import { Check, Square, Image, FileText, Upload } from 'lucide-react';

export function QuestionRenderer({ 
  question, 
  answer, 
  onAnswerChange, 
  questionNumber,
  disabled = false 
}) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleSingleChoice = (option) => {
    onAnswerChange(option);
  };

  const handleMultiChoice = (option) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    onAnswerChange(newAnswers);
  };

  const handleTextAnswer = (text) => {
    onAnswerChange(text);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // For auto-save, store file info temporarily
      // In production, you'd upload to server and store URL
      const fileInfo = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified,
        // Note: For production, implement file upload to your backend
        // and store the returned file URL instead
      };
      onAnswerChange(fileInfo);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getQuestionIcon = () => {
    switch (question.type) {
      case 'single_choice': return <Check size={20} className="text-blue-600" />;
      case 'multi_choice': return <Square size={20} className="text-green-600" />;
      case 'image_upload': return <Image size={20} className="text-purple-600" />;
      case 'text': return <FileText size={20} className="text-orange-600" />;
      default: return <FileText size={20} />;
    }
  };

  const renderAnswerInput = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label 
                key={index}
                className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  answer === option
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`flex items-center justify-center w-6 h-6 border-2 rounded-full ${
                  answer === option ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                }`}>
                  {answer === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="flex-1 text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label 
                key={index}
                className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  Array.isArray(answer) && answer.includes(option)
                    ? 'bg-green-50 border-green-300 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`flex items-center justify-center w-6 h-6 border-2 rounded ${
                  Array.isArray(answer) && answer.includes(option) 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : 'border-gray-400'
                }`}>
                  {Array.isArray(answer) && answer.includes(option) && (
                    <Check size={16} />
                  )}
                </div>
                <span className="flex-1 text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => !disabled && handleTextAnswer(e.target.value)}
            placeholder="Type your detailed answer here..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[150px] text-gray-900 placeholder-gray-400"
            disabled={disabled}
          />
        );

      case 'image_upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <label htmlFor={`file-upload-${question.id}`} className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-semibold text-lg">
                    Click to upload image
                  </span>
                  <input
                    id={`file-upload-${question.id}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={disabled}
                  />
                </label>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            
            {(imagePreview || answer) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {answer?.fileName ? `Uploaded: ${answer.fileName}` : 'Uploaded Image'}
                </p>
                <img 
                  src={imagePreview} 
                  alt="Upload preview" 
                  className="max-w-full max-h-64 rounded-lg border shadow-sm mx-auto"
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-sm">
            {questionNumber}
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            {getQuestionIcon()}
            <span className="text-sm font-semibold uppercase tracking-wide">
              {question.type?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {question.max_score || 1} point{question.max_score !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Question Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 leading-relaxed">
        {question.title}
      </h3>

      {question.description && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 leading-relaxed">{question.description}</p>
        </div>
      )}

      {/* Answer Input */}
      <div className="mt-6">
        {renderAnswerInput()}
      </div>
    </div>
  );
}