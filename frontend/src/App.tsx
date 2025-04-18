import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, BookOpen, FlaskRound as Flask, Monitor, Search } from 'lucide-react';
import ClassList from './pages/classes/ClassList';
import ClassDetail from './pages/classes/ClassDetail';
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              教师
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ClassList />} />
            <Route path="/classes" element={<ClassList />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/chapter/:chapterId" element={<CourseChapter />} />
            <Route path="/labs" element={<LabList />} />
            <Route path="/labs/create" element={<CreateLab />} />
            <Route path="/labs/:id" element={<LabDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;