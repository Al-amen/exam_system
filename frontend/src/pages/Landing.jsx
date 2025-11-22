import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">ExamPro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  className="btn-primary"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Online
            <span className="text-primary-600"> Exam System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your examination process with our comprehensive online exam platform. 
            Perfect for educational institutions, corporate training, and certification programs.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Exam Creation</h3>
              <p className="text-gray-600">
                Create and manage exams effortlessly with our intuitive interface. 
                Import questions from Excel, set time limits, and publish with one click.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Seamless Experience</h3>
              <p className="text-gray-600">
                Students enjoy a smooth exam-taking experience with auto-save, 
                resume functionality, and real-time progress tracking.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Grading</h3>
              <p className="text-gray-600">
                Automatic grading for objective questions with detailed analytics 
                and performance insights for both students and administrators.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1000+</div>
              <div className="text-gray-600">Exams Conducted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">5000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">ExamPro</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm">
                Sign In
              </Link>
              <Link to="/register" className="text-gray-600 hover:text-gray-900 text-sm">
                Register
              </Link>
            </div>
            <div className="text-gray-600 text-sm mt-4 md:mt-0">
              © 2024 ExamPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}