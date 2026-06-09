import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Award, ArrowRight, 
  HelpCircle, AlertCircle, RefreshCw, MessageSquare
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const QuizEvaluation = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const cached = sessionStorage.getItem('latest_quiz_result');
    if (cached) {
      setData(JSON.parse(cached));
    }
  }, []);

  if (!data) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Quiz Result Found</h3>
        <p className="text-slate-400 text-sm leading-relaxed">Please complete a quiz first to view evaluations.</p>
        <Link to="/quiz" className="inline-block px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm">
          Enter Quiz Room
        </Link>
      </div>
    );
  }

  const { score, total, accuracy, feedback, answers_evaluation } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Quiz Evaluation</h1>
          <p className="text-slate-400 text-sm">Automated scoring metrics and feedback</p>
        </div>
        <div className="flex gap-3">
          <Link to="/quiz" className="px-5 py-3 rounded-xl font-bold text-slate-300 border border-white/10 hover:bg-white/5 text-sm transition-all">
            Retake Quiz
          </Link>
          <Link to="/dashboard" className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-md text-sm transition-all flex items-center gap-1.5">
            <span>View Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Score and feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score widget */}
        <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center p-6">
          <h3 className="font-bold text-slate-300 text-sm mb-4">Quiz Score</h3>
          <div className="w-32 h-32 rounded-full border-4 border-primary-500/20 flex flex-col items-center justify-center bg-primary-500/5 relative">
            <span className="text-4xl font-extrabold text-white">{score}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">out of {total || 10}</span>
          </div>
          <p className="text-emerald-400 font-bold text-xs mt-4">Accuracy: {accuracy.toFixed(1)}%</p>
        </GlassCard>

        {/* AI feedback text */}
        <GlassCard hoverEffect={false} className="md:col-span-2 flex flex-col justify-between p-6">
          <div>
            <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-400" />
              <span>AI Tutor Feedback</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{feedback}</p>
          </div>
          <div className="pt-4 mt-4 text-[10px] text-slate-500 border-t border-white/5 flex items-center gap-1">
            <Award size={14} className="text-primary-400" />
            <span>Progress automatically synced to dashboard</span>
          </div>
        </GlassCard>
      </div>

      {/* Answers evaluation list */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-white">Question Correction Log</h3>
        
        <div className="space-y-4">
          {answers_evaluation.map((item, idx) => (
            <GlassCard key={idx} hoverEffect={false} className="p-6 border border-white/5">
              <div className="flex items-start gap-4">
                {item.is_correct ? (
                  <CheckCircle size={22} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
                )}
                
                <div className="space-y-3 flex-1 text-sm">
                  {/* Question */}
                  <h4 className="font-bold text-white leading-relaxed">
                    {idx + 1}. {item.question}
                  </h4>
                  
                  {/* Answers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-500 block mb-1">Your Answer:</span>
                      <span className={item.is_correct ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                        {item.user_answer || "[Skipped]"}
                      </span>
                    </div>
                    
                    {!item.is_correct && (
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-emerald-500/70 block mb-1">Correct Answer:</span>
                        <span className="text-emerald-300 font-semibold">{item.correct_answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizEvaluation;
