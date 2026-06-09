import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Award, AlertCircle, 
  ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Info
} from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const EligibilityCheck = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [role, setRole] = useState('');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const selectedDomain = sessionStorage.getItem('selected_domain');
    const selectedRole = sessionStorage.getItem('selected_role');
    
    if (!selectedDomain || !selectedRole) {
      navigate('/domain-selection');
      return;
    }
    
    setDomain(selectedDomain);
    setRole(selectedRole);

    const runEligibilityCheck = async () => {
      try {
        const res = await api.post('/evaluate', { domain: selectedDomain, role: selectedRole });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || 'Eligibility check failed. Please ensure a resume is uploaded.');
      } finally {
        setLoading(false);
      }
    };

    runEligibilityCheck();
  }, [navigate]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      // Trigger roadmap generator
      const res = await api.post('/plan/generate', { domain, role });
      // Fetch skills gap as well to store in db/cache
      await api.get(`/skills/gap?role=${role}`);
      
      sessionStorage.setItem('latest_plan', JSON.stringify(res.data));
      navigate('/learning-plan');
    } catch (err) {
      console.error(err);
      alert('Plan formulation failed. Please check backend logs.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-cyan-500 animate-spin animate-reverse"></div>
        </div>
        <h3 className="font-bold text-lg text-white">Evaluating Eligibility</h3>
        <p className="text-slate-400 text-sm">Comparing resume keywords against target requirements...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Verification Error</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error || "Please upload your resume to evaluate role compatibility."}</p>
        <div className="flex gap-4 justify-center pt-2">
          <Link to="/resume-upload" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm">
            Upload Resume
          </Link>
          <Link to="/role-selection" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm">
            Back to Roles
          </Link>
        </div>
      </div>
    );
  }

  const { eligible, match_percentage, matched_skills, missing_skills, evaluation_summary, suggestions } = data;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <Link to="/role-selection" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} />
            <span>Select Different Role</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Eligibility Check</h1>
          <p className="text-slate-400 text-sm">Evaluating: <span className="text-primary-300 font-semibold">{role}</span></p>
        </div>
      </div>

      {/* Scoring Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge card */}
        <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center p-6">
          <h3 className="font-bold text-slate-300 text-sm mb-4">Compatibility Match</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" className="stroke-white/5 fill-transparent" strokeWidth="8" />
              <circle 
                cx="72" 
                cy="72" 
                r="62" 
                className="stroke-primary-500 fill-transparent transition-all duration-1000" 
                strokeWidth="8" 
                strokeDasharray="390"
                strokeDashoffset={390 - (390 * match_percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white">{match_percentage}%</span>
            </div>
          </div>
          <div className="mt-6">
            {eligible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>Highly Eligible</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert size={14} />
                <span>Roadmap Suggested</span>
              </span>
            )}
          </div>
        </GlassCard>

        {/* Text evaluation summary */}
        <GlassCard hoverEffect={false} className="md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Info size={18} className="text-primary-400" />
              <span>AI Evaluation Summary</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{evaluation_summary}</p>
          </div>
          
          <div className="pt-6 border-t border-white/5 mt-6">
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generatingPlan ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Synthesizing Learning Roadmap...</span>
                </>
              ) : (
                <>
                  <span>Generate 3-Month Learning Plan</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Skills Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched skills */}
        <GlassCard hoverEffect={false}>
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>Matched Skills ({matched_skills.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {matched_skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                {skill}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Missing skills */}
        <GlassCard hoverEffect={false}>
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <AlertCircle size={18} className="text-amber-400" />
            <span>Missing Skills ({missing_skills.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills.length > 0 ? (
              missing_skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No major skill gaps identified. Proceed to roadmap!</span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Suggested next steps */}
      <GlassCard hoverEffect={false}>
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
          <Award size={18} className="text-primary-400" />
          <span>Bridging Gaps Suggestions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((s, idx) => (
            <div key={idx} className="flex gap-2 text-sm text-slate-400 align-top">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default EligibilityCheck;
