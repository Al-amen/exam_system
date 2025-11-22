import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, BarChart3 } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Available Exams', href: '/student/exams', icon: FileText },
    { name: 'My Results', href: '/student/results', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Check if current route is exam taking (full screen)
  const isExamTaking = location.pathname.includes('/student/exam/');

  if (isExamTaking) {
    return <Outlet />; // Full screen for exam taking
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}