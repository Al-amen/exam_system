import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function QuestionForm({ question, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexity: 'Class 1',
    type: 'single_choice',
    options: ['', ''],
    correct_answers: [],
    max_score: 1,
    tags: ''
  });

  const [newOption, setNewOption] = useState('');

  // Initialize form with question data if editing
  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        description: question.description || '',
        complexity: question.complexity || 'Class 1',
        type: question.type || 'single_choice',
        options: question.options || ['', ''],
        correct_answers: question.correct_answers || [],
        max_score: question.max_score || 1,
        // Ensure tags is always a string for the input, not an array
        tags: Array.isArray(question.tags) 
          ? question.tags.join(', ') 
          : (question.tags || '')
      });
    } else {
      // Reset to initial state for new questions
      setFormData({
        title: '',
        description: '',
        complexity: 'Class 1',
        type: 'single_choice',
        options: ['', ''],
        correct_answers: [],
        max_score: 1,
        tags: ''  // Ensure it's a string, not an array
      });
    }
  }, [question])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      // Check if option already exists
      if (formData.options.includes(newOption.trim())) {
        alert('This option already exists!');
        setNewOption('');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    // Also remove from correct answers if it was selected
    const removedOption = formData.options[index];
    const newCorrectAnswers = formData.correct_answers.filter(
      answer => answer !== removedOption
    );
    
    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correct_answers: newCorrectAnswers
    }));
  };

  const handleCorrectAnswerChange = (answer, isChecked) => {
    let newCorrectAnswers;
    
    if (formData.type === 'single_choice') {
      newCorrectAnswers = isChecked ? [answer] : [];
    } else {
      newCorrectAnswers = isChecked
        ? [...formData.correct_answers, answer]
        : formData.correct_answers.filter(a => a !== answer);
    }
    
    setFormData(prev => ({
      ...prev,
      correct_answers: newCorrectAnswers
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Question title is required');
      return;
    }
  
    if (!formData.complexity) {
      alert('Complexity is required');
      return;
    }
  
    if (!formData.type) {
      alert('Question type is required');
      return;
    }
  
    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      complexity: formData.complexity,
      type: formData.type,
      max_score: formData.max_score,
      // Convert comma-separated string to array for backend
      tags: formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []
    };
  
    // Only include options and correct_answers for choice questions
    if (isChoiceQuestion) {
      submitData.options = formData.options.filter(opt => opt.trim());
      submitData.correct_answers = formData.correct_answers.filter(ans => ans.trim());
      
      // Validate that we have at least one correct answer for choice questions
      if (submitData.correct_answers.length === 0) {
        alert('Please select at least one correct answer');
        return;
      }
    } else {
      // For text and image_upload questions, set these to null
      submitData.options = null;
      submitData.correct_answers = null;
    }
  
    console.log('Submitting data:', submitData);
    onSubmit(submitData);
  };
  const isChoiceQuestion = formData.type === 'single_choice' || formData.type === 'multi_choice';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Create New Question'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter the question"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional description or context"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity *
              </label>
              <select
                name="complexity"
                required
                value={formData.complexity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="single_choice">Single Choice</option>
                <option value="multi_choice">Multiple Choice</option>
                <option value="text">Text Answer</option>
                <option value="image_upload">Image Upload</option>
              </select>
            </div>
          </div>

          {/* Max Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Score
            </label>
            <input
              type="number"
              name="max_score"
              min="1"
              value={formData.max_score}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Options for Choice Questions */}
          {isChoiceQuestion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type={formData.type === 'single_choice' ? 'radio' : 'checkbox'}
                      name="correct_answer"
                      checked={formData.correct_answers.includes(option)}
                      onChange={(e) => handleCorrectAnswerChange(option, e.target.checked)}
                      className="focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add new option */}
                {/* Add new option */}
                <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                    }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add new option"
                />
                <button
                    type="button"
                    onClick={addOption}
                    disabled={!newOption.trim()}
                    className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!newOption.trim() ? "Enter option text first" : "Add option"}
                >
                    <Plus size={16} />
                </button>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="math, science, history (comma separated)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading && <LoadingSpinner size="small" />}
              <span>{question ? 'Update Question' : 'Create Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}