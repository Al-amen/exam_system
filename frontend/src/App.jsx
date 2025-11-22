import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import QuestionBank from './pages/admin/QuestionBank';
import ExamManagement from './pages/admin/ExamManagement';
import Results from './pages/common/Results';
import ExamDetails from './pages/admin/ExamDetails';
import EditExam from './pages/admin/EditExam';
import ExamTaking from './pages/student/ExamTaking';
import TakeExam from './pages/student/TakeExam';


function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected admin routes with explicit child routes */}
      <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="questions" element={<QuestionBank />} />
          <Route path="exams" element={<ExamManagement />} />
          {/* Add these new routes */}
          <Route path="exams/:id" element={< ExamDetails />} />
          <Route path="exams/:id/edit" element={< EditExam />} />
          <Route path="results" element={<Results />} />
          <Route index element={<Navigate to="questions" replace />} />
          {/* Catch all for invalid admin routes */}
          <Route path="*" element={<Navigate to="questions" replace />} />
      </Route>
      
      {/* Protected student routes */}
      <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="exams" element={< TakeExam />} />
          <Route path="results" element={<Results />} />
          <Route index element={<Navigate to="exams" replace />} />
          <Route path="*" element={<Navigate to="exams" replace />} />
        </Route>

        {/* Standalone exam taking route (outside dashboard layout) */}
        <Route 
          path="/student/exam/:attemptId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamTaking />
            </ProtectedRoute>
          } 
        />
      
      {/* Redirect all other routes */}
      <Route 
        path="*" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;