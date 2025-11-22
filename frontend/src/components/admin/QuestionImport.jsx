import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { questionsAPI } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function QuestionImport({ onImportComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileSelect = async (file) => {
    if (!file || !file.name.endsWith('.xlsx')) {
      alert('Please select an Excel file (.xlsx)');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const response = await questionsAPI.importQuestions(file);
      setImportResult({ success: true, message: response.data.message });
      onImportComplete?.();
    } catch (error) {
      setImportResult({ 
        success: false, 
        message: error.response?.data?.detail || 'Import failed' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Questions from Excel</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-sm text-gray-600">Uploading and processing file...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-600"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".xlsx"
                className="sr-only"
                onChange={handleFileInput}
              />
              <p className="text-xs text-gray-500 mt-2">Excel files only (.xlsx)</p>
            </div>
          </>
        )}
      </div>

      {importResult && (
        <div
          className={`mt-4 p-4 rounded-md ${
            importResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <p
              className={`ml-2 text-sm ${
                importResult.success ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {importResult.message}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Excel Template Format:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Required columns:</strong> title, complexity, type</p>
          <p><strong>Optional columns:</strong> description, options, correct_answers, max_score, tags</p>
          <p><strong>Type values:</strong> single_choice, multi_choice, text, image_upload</p>
        </div>
      </div>
    </div>
  );
}