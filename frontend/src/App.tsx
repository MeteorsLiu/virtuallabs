import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, BookOpen, FlaskRound as Flask, Monitor, Search } from 'lucide-react';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClassList from './pages/classes/ClassList';
import ClassDetail from './pages/classes/ClassDetail';
import CreateClass from './pages/classes/CreateClass';
import AddStudent from './pages/classes/AddStudent';
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';
import CourseChapter from './pages/courses/CourseChapter';
import CreateCourse from './pages/courses/CreateCourse';
import LabList from './pages/labs/LabList';
import LabDetail from './pages/labs/LabDetail';
import CreateLab from './pages/labs/CreateLab';

function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'classes';

  // Don't show navigation on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Monitor className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">K8s学习平台</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/classes"
                className={`${
                  currentPath === 'classes'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <Users className="h-5 w-5 mr-2" />
                班级管理
              </Link>
              <Link
                to="/courses"
                className={`${
                  currentPath === 'courses'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                课程管理
              </Link>
              <Link
                to="/labs"
                className={`${
                  currentPath === 'labs'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <Flask className="h-5 w-5 mr-2" />
                实验管理
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="w-64 px-4 py-1 pr-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/classes/create" element={<ProtectedRoute><CreateClass /></ProtectedRoute>} />
            <Route path="/classes/:id" element={<ProtectedRoute><ClassDetail /></ProtectedRoute>} />
            <Route path="/classes/:classId/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
            <Route path="/courses/create" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
            <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/courses/:courseId/chapter/:chapterId" element={<ProtectedRoute><CourseChapter /></ProtectedRoute>} />
            <Route path="/labs" element={<ProtectedRoute><LabList /></ProtectedRoute>} />
            <Route path="/labs/create" element={<ProtectedRoute><CreateLab /></ProtectedRoute>} />
            <Route path="/labs/:id" element={<ProtectedRoute><LabDetail /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;