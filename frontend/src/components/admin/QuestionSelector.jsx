import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Tag, Star, Clock } from 'lucide-react';
import { questionsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function QuestionSelector({ selectedQuestions = [], onQuestionsChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: questions, loading, execute: fetchQuestions } = useApi(
    () => questionsAPI.getQuestions({ search: debouncedSearch }),
    []
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchQuestions();
  }, [debouncedSearch]);

  const toggleQuestion = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    onQuestionsChange(Array.from(newSelected));
  };

  const isSelected = (questionId) => selectedQuestions.includes(questionId);

  const getTypeColor = (type) => {
    switch (type) {
      case 'single_choice': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'multi_choice': return 'bg-green-100 text-green-800 border-green-200';
      case 'text': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'image_upload': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityStars = (complexity) => {
    const level = parseInt(complexity.replace('Class ', ''));
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Questions
          </label>
          <p className="text-sm text-gray-600">
            {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-64"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Questions List - FIXED HEIGHT */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="small" />
            <span className="ml-3 text-gray-600">Loading questions...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {questions?.map((question) => (
              <div
                key={question.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected(question.id) 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleQuestion(question.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Indicator */}
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    isSelected(question.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected(question.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(question.type)}`}>
                        {question.type?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="flex items-center text-xs text-amber-600 font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        {getComplexityStars(question.complexity)}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {question.max_score || 1} pt
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-relaxed">
                      {question.title}
                    </h4>

                    {question.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {question.description}
                      </p>
                    )}

                    {question.tags && question.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1">
                        <Tag className="h-3 w-3 text-gray-400" />
                        {question.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{question.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!questions || questions.length === 0) && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No questions found</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              {searchTerm 
                ? 'No questions match your search. Try different keywords.'
                : 'No questions available in your question bank.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-blue-700">
                Ready to create your exam
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              ✓ Ready
            </div>
          </div>
        </div>
      )}
    </div>
  );
}