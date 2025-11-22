import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';
import { questionsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { QuestionForm } from './QuestionForm';
import { Modal } from '../common/Modal';

export function QuestionList({ onAddQuestion, onImportComplete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    complexity: '',
    tags: ''
  });

  // const { data: questions, loading, error, execute: fetchQuestions } = useApi(
  //   () => questionsAPI.getQuestions({ 
  //     search: debouncedSearch,
  //     type: filters.type,
  //     complexity: filters.complexity,
  //     tags: filters.tags
  //   })
  // );


  const { data: questions, loading, error, execute: fetchQuestions } = useApi(
    questionsAPI.getQuestions, // Just pass the function reference
    [] // initial data
  );

  // Manually fetch questions when filters change
  useEffect(() => {
    fetchQuestions({ 
      search: debouncedSearch,
      type: filters.type,
      complexity: filters.complexity,
      tags: filters.tags
    });
  }, [fetchQuestions, debouncedSearch, filters.type, filters.complexity, filters.tags]);

  

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  useEffect(() => {
    console.log('API Call Parameters:', {
      search: debouncedSearch,
      type: filters.type,
      complexity: filters.complexity,
      tags: filters.tags
    });
  }, [debouncedSearch, filters]);

  // Fetch questions when filters, search, or refresh trigger changes
  useEffect(() => {
    fetchQuestions();
  }, [debouncedSearch, filters, refreshTrigger]);

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await questionsAPI.deleteQuestion(questionId);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleView = (question) => {
    setViewingQuestion(question);
    setShowViewModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingQuestion) {
        await questionsAPI.updateQuestion(editingQuestion.id, formData);
      } else {
        await questionsAPI.createQuestion(formData);
      }
      setShowQuestionForm(false);
      setEditingQuestion(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question');
    }
  };

  const handleFormCancel = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} =`, value, 'Type:', typeof value);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      complexity: '',
      tags: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.type || filters.complexity || filters.tags || searchTerm;

  // Extract unique values for filter dropdowns
  const uniqueTypes = [...new Set(questions?.map(q => q.type) || [])];
  const uniqueComplexities = [...new Set(questions?.map(q => q.complexity) || [])];
  const allTags = questions?.flatMap(q => q.tags || []) || [];
  const uniqueTags = [...new Set(allTags)];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionForm
          question={editingQuestion}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* View Question Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Question Details"
        size="lg"
      >
        {viewingQuestion && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <p className="mt-1 text-sm text-gray-900">{viewingQuestion.title}</p>
            </div>
            
            {viewingQuestion.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{viewingQuestion.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Complexity</label>
                <p className="mt-1 text-sm text-gray-900">{viewingQuestion.complexity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {viewingQuestion.type?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {(viewingQuestion.type === 'single_choice' || viewingQuestion.type === 'multi_choice') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  <ul className="mt-1 space-y-1">
                    {viewingQuestion.options?.map((option, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        {option}
                        {viewingQuestion.correct_answers?.includes(option) && (
                          <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {viewingQuestion.tags && viewingQuestion.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {viewingQuestion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Question Bank</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Filter Questions</h4>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <X size={14} />
                  <span>Clear all</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Question Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Complexity Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Complexity
                  </label>
                  <select
                    value={filters.complexity}
                    onChange={(e) => handleFilterChange('complexity', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Levels</option>
                    {uniqueComplexities.map(complexity => (
                      <option key={complexity} value={complexity}>
                        {complexity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tag
                  </label>
                  <select
                    value={filters.tags}
                    onChange={(e) => handleFilterChange('tags', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Tags</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
               </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Type: {filters.type.replace('_', ' ')}
                      <button
                        onClick={() => handleFilterChange('type', '')}
                        className="ml-1 hover:text-green-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.complexity && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Complexity: {filters.complexity}
                      <button
                        onClick={() => handleFilterChange('complexity', '')}
                        className="ml-1 hover:text-yellow-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.tags && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Tag: {filters.tags}
                      <button
                        onClick={() => handleFilterChange('tags', '')}
                        className="ml-1 hover:text-purple-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complexity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions?.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {question.title}
                    </div>
                    {question.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {question.description.substring(0, 100)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {question.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {question.complexity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {question.max_score || 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {question.tags?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags && question.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                          +{question.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(question)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View question"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit question"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!questions || questions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {hasActiveFilters ? 'No questions match your filters.' : 'No questions found.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowQuestionForm(true)}
                className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Add Your First Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}