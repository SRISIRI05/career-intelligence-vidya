import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeAnalysis from './pages/ResumeAnalysis';
import DomainSelection from './pages/DomainSelection';
import JobRoleSelection from './pages/JobRoleSelection';
import EligibilityCheck from './pages/EligibilityCheck';
import LearningPlan from './pages/LearningPlan';
import Quiz from './pages/Quiz';
import QuizEvaluation from './pages/QuizEvaluation';
import MockInterview from './pages/MockInterview';
import InterviewEvaluation from './pages/InterviewEvaluation';
import JobRecommendations from './pages/JobRecommendations';
import NewsInsights from './pages/NewsInsights';
import MarketInsights from './pages/MarketInsights';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED WORKSPACE ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-upload" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ResumeUpload />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-analysis" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ResumeAnalysis />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/domain-selection" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DomainSelection />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/role-selection" 
            element={
              <ProtectedRoute>
                <Layout>
                  <JobRoleSelection />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eligibility-check" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EligibilityCheck />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning-plan" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LearningPlan />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Quiz />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz-evaluation" 
            element={
              <ProtectedRoute>
                <Layout>
                  <QuizEvaluation />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MockInterview />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview-evaluation" 
            element={
              <ProtectedRoute>
                <Layout>
                  <InterviewEvaluation />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <Layout>
                  <JobRecommendations />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/news" 
            element={
              <ProtectedRoute>
                <Layout>
                  <NewsInsights />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MarketInsights />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* FALLBACK REDIRECT */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
