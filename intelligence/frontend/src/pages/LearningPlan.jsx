import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, CheckSquare, Layers, Youtube, ExternalLink, 
  ArrowRight, BookOpen, AlertCircle, RefreshCw, Play
} from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const LearningPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [resources, setResources] = useState(null);
  
  const [activeMonth, setActiveMonth] = useState('month_1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlanAndResources = async () => {
      try {
        // 1. Fetch latest plan
        let planData = null;
        try {
          const planRes = await api.get('/plan/latest');
          planData = planRes.data;
          setPlan(planData);
        } catch (planErr) {
          // If no plan, redirect back to selection
          navigate('/domain-selection');
          return;
        }

        // 2. Fetch external media resources
        if (planData) {
          const resRes = await api.get(`/resources?role=${planData.role}&domain=${planData.domain}`);
          setResources(resRes.data);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading training plan data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAndResources();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Formulating learning resources & videos...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Roadmap Found</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error || "Please select a domain and job role to build your roadmap."}</p>
        <Link to="/domain-selection" className="inline-block px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm">
          Select Domain
        </Link>
      </div>
    );
  }

  const { roadmap, role, domain } = plan;
  const currentMonthData = roadmap[activeMonth];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Personal Roadmap</h1>
          <p className="text-slate-400 text-sm">Custom curriculum targeting: <span className="text-primary-300 font-semibold">{role} ({domain})</span></p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/quiz"
            className="px-5 py-3 rounded-xl font-bold text-slate-300 border border-white/10 hover:bg-white/5 text-sm transition-all"
          >
            Take Domain Quiz
          </Link>
          <Link
            to="/interview"
            className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-md text-sm transition-all flex items-center gap-2"
          >
            <span>Start Mock Interview</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Month selectors */}
      <div className="flex border-b border-white/5 gap-2 pb-1 overflow-x-auto">
        {['month_1', 'month_2', 'month_3'].map((monthKey, idx) => (
          <button
            key={monthKey}
            onClick={() => setActiveMonth(monthKey)}
            className={`
              px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-all duration-300
              ${activeMonth === monthKey 
                ? 'border-primary-500 text-primary-400 bg-primary-500/5 rounded-t-lg' 
                : 'border-transparent text-slate-400 hover:text-white'}
            `}
          >
            Month {idx + 1}: {roadmap[monthKey]?.focus || `Stage ${idx+1}`}
          </button>
        ))}
      </div>

      {/* Active Month Curriculum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Topics & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topics Card */}
          <GlassCard hoverEffect={false}>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Calendar size={18} className="text-primary-400" />
              <span>Syllabus & Core Topics</span>
            </h3>
            <div className="space-y-4">
              {currentMonthData?.topics?.map((topic, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-slate-300 align-top">
                  <span className="w-5 h-5 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Tasks or Projects Card */}
          <GlassCard hoverEffect={false}>
            {activeMonth === 'month_2' ? (
              <>
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                  <Layers size={18} className="text-cyan-400" />
                  <span>Month 2 Projects</span>
                </h3>
                <div className="space-y-4">
                  {currentMonthData?.projects?.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-sm">
                      <h4 className="font-bold text-white">{proj.title || proj}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">{proj.details || "Build an end-to-end sandbox application demonstrating integration of database models and validation libraries."}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : activeMonth === 'month_3' ? (
              <>
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                  <CheckSquare size={18} className="text-purple-400" />
                  <span>Interview Preparation Tasks</span>
                </h3>
                <div className="space-y-4">
                  {currentMonthData?.interview_prep?.map((task, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-slate-300">
                      <input type="checkbox" className="mt-1 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                  <CheckSquare size={18} className="text-emerald-400" />
                  <span>Practice Tasks</span>
                </h3>
                <div className="space-y-4">
                  {currentMonthData?.practice_tasks?.map((task, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-slate-300">
                      <input type="checkbox" className="mt-1 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </div>

        {/* Media Side Panels (YouTube / Pexels / Google links) */}
        <div className="space-y-6">
          {/* YouTube Video tutorials */}
          <GlassCard hoverEffect={false}>
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <Youtube size={20} className="text-red-500" />
              <span>YouTube Video Tutorials</span>
            </h3>
            
            <div className="space-y-4">
              {resources?.youtube_videos?.slice(0, 2).map((vid, idx) => (
                <div key={idx} className="group overflow-hidden rounded-xl border border-white/5 bg-white/5 flex flex-col">
                  {/* Thumbnail wrapper */}
                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    <img 
                      src={vid.thumbnail} 
                      alt={vid.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <a 
                        href={`https://www.youtube.com/watch?v=${vid.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30"
                      >
                        <Play size={20} fill="white" />
                      </a>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-slate-200 font-bold">{vid.duration}</span>
                  </div>
                  {/* Info */}
                  <div className="p-3 text-xs space-y-1">
                    <h4 className="font-semibold text-slate-200 line-clamp-1 group-hover:text-primary-300 transition-colors">{vid.title}</h4>
                    <p className="text-slate-400 font-medium">Channel: {vid.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Google Reference documentation links */}
          <GlassCard hoverEffect={false}>
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-400" />
              <span>Recommended Readings</span>
            </h3>
            <div className="space-y-4">
              {resources?.google_links?.slice(0, 3).map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/20 hover:bg-white/10 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2 text-slate-200 font-bold mb-1">
                    <span className="line-clamp-1">{link.title}</span>
                    <ExternalLink size={12} className="text-slate-500 shrink-0" />
                  </div>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">{link.snippet}</p>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LearningPlan;
