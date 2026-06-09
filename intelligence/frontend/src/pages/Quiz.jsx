import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Timer, Award, CheckCircle, RefreshCw, HelpCircle } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const Quiz = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('Full Stack Development');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [count, setCount] = useState(10);
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to read user's active domain from session
    const selectedDomain = sessionStorage.getItem('selected_domain');
    if (selectedDomain) {
      setDomain(selectedDomain);
    }
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) {
      if (timeLeft === 0 && quizStarted) {
        handleSubmitQuiz();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/quiz/generate', {
        domain,
        difficulty,
        question_count: count,
        question_type: "MCQ"
      });
      setQuestions(res.data);
      setAnswers(new Array(res.data.length).fill(''));
      setCurrentIndex(0);
      setQuizStarted(true);
      setTimeLeft(res.data.length * 60); // 60 seconds per question
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    const updated = [...answers];
    updated[currentIndex] = option;
    setAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const payload = {
        domain,
        difficulty,
        questions: questions,
        answers: answers
      };
      const res = await api.post('/quiz/submit', payload);
      sessionStorage.setItem('latest_quiz_result', JSON.stringify(res.data));
      navigate('/quiz-evaluation');
    } catch (err) {
      console.error(err);
      alert('Error submitting answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (!quizStarted) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Quiz Assessment Room</h1>
          <p className="text-slate-400 text-sm">Test your core knowledge using randomized multiple choice questions.</p>
        </div>

        <GlassCard hoverEffect={false}>
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Domain */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="e.g. AI/ML, Cloud Computing"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Length */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Number of Questions</label>
                <select
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                >
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Generating AI Questions...</span>
                </>
              ) : (
                <>
                  <span>Begin Quiz Assessment</span>
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header bar during quiz */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-primary-400" />
          <span className="text-sm font-semibold text-slate-400">
            Question <span className="text-white font-bold">{currentIndex + 1}</span> of {questions.length}
          </span>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold">
          <Timer size={14} className="text-primary-400" />
          <span className={timeLeft < 60 ? "text-red-400 font-bold" : "text-slate-200"}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <GlassCard hoverEffect={false} className="p-8 space-y-6">
        {currentQ?.scenario && (
          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-slate-300 text-xs leading-relaxed">
            <span className="font-bold text-primary-400 block mb-1">Scenario Background:</span>
            {currentQ.scenario}
          </div>
        )}

        <h3 className="text-lg font-bold text-white leading-relaxed">
          {currentQ?.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ?.options?.map((opt, idx) => {
            const isSelected = answers[currentIndex] === opt;
            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className={`
                  p-4 rounded-xl border cursor-pointer text-sm font-semibold leading-relaxed transition-all
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0
                    ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-500'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{opt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Nav Actions */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25 text-xs transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Evaluating Answers...</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>Submit Quiz</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-6 py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 text-xs transition-all"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
