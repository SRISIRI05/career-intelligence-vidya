import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, CheckCircle, XCircle, AlertCircle, 
  ArrowRight, ShieldCheck, MessageSquare, Sparkles 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const InterviewEvaluation = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('latest_interview_result');
    if (cached) {
      setData(JSON.parse(cached));
    }
  }, []);

  if (!data) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Evaluation Found</h3>
        <p className="text-slate-400 text-sm leading-relaxed">Please complete a mock interview session first to view diagnostics.</p>
        <Link to="/interview" className="inline-block px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm">
          Enter Mock Room
        </Link>
      </div>
    );
  }

  const { overall_score, communication, technical_accuracy, confidence, problem_solving, clarity, strengths, weaknesses, recommendations } = data;

  const scoreMetrics = [
    { name: "Communication Skills", value: communication, color: "from-blue-500 to-indigo-500" },
    { name: "Technical Accuracy", value: technical_accuracy, color: "from-emerald-500 to-teal-500" },
    { name: "Confidence & Pace", value: confidence, color: "from-purple-500 to-pink-500" },
    { name: "Problem Solving", value: problem_solving, color: "from-amber-500 to-orange-500" },
    { name: "Clarity & Relevance", value: clarity, color: "from-cyan-500 to-sky-500" }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Interview Diagnostic Report</h1>
          <p className="text-slate-400 text-sm">Performance metrics computed by AI Agent</p>
        </div>
        <div className="flex gap-3">
          <Link to="/interview" className="px-5 py-3 rounded-xl font-bold text-slate-300 border border-white/10 hover:bg-white/5 text-sm transition-all">
            Practice Again
          </Link>
          <Link to="/jobs" className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-md text-sm transition-all flex items-center gap-1.5">
            <span>View Job Matches</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Overal rating & bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Score */}
        <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center p-6">
          <h3 className="font-bold text-slate-300 text-sm mb-4">Overall Score</h3>
          <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center bg-cyan-500/5 relative">
            <span className="text-4xl font-extrabold text-white">{overall_score}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">out of 100</span>
          </div>
          <p className="text-slate-400 text-xs mt-4 leading-relaxed">
            Your technical fluency ranks as <span className="text-cyan-400 font-bold">Strong Intermediate</span>. Ready to apply for matching vacancies.
          </p>
        </GlassCard>

        {/* Detailed bars */}
        <GlassCard hoverEffect={false} className="md:col-span-2 space-y-4 p-6">
          <h3 className="font-bold text-base text-white mb-2">Diagnostic Scorecard</h3>
          <div className="space-y-4">
            {scoreMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>{metric.name}</span>
                  <span className="font-bold">{metric.value}/100</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <GlassCard hoverEffect={false}>
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>Core Strengths</span>
          </h3>
          <div className="space-y-3">
            {strengths.map((str, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                <span>{str}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weaknesses */}
        <GlassCard hoverEffect={false}>
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <XCircle size={18} className="text-red-400" />
            <span>Identified Weaknesses</span>
          </h3>
          <div className="space-y-3">
            {weaknesses.map((weak, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                <span>{weak}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Coaching Tips */}
      <GlassCard hoverEffect={false}>
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-primary-400" />
          <span>AI Coach Recommendations</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-2.5 text-sm text-slate-400 leading-relaxed">
              <span className="w-5 h-5 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default InterviewEvaluation;
