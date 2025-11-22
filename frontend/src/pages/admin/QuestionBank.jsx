import React, { useState } from 'react';
import { QuestionImport } from '../../components/admin/QuestionImport';
import { QuestionList } from '../../components/admin/QuestionList';
import { Modal } from '../../components/common/Modal';

export default function QuestionBank() {
  const [showImport, setShowImport] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImportComplete = () => {
    setShowImport(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddQuestion = () => {
    // TODO: Implement add question modal
    console.log('Add question clicked');
  };

  const handleEditQuestion = (question) => {
    // TODO: Implement edit question modal
    console.log('Edit question:', question);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
        <button
          onClick={() => setShowImport(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Import from Excel
        </button>
      </div>

      {/* Simple message for empty state */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-700">
          No questions available. Start by importing questions from Excel or creating your first question.
        </p>
      </div>

      <QuestionList 
        key={refreshTrigger}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
      />

      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import Questions"
      >
        <QuestionImport onImportComplete={handleImportComplete} />
      </Modal>
    </div>
  );
}