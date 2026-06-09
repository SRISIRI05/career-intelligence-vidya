import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, Briefcase, GraduationCap, CheckCircle, 
  ArrowRight, ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Check session storage first
    const cached = sessionStorage.getItem('latest_analysis');
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // 2. Fallback to API call
    const fetchLatest = async () => {
      try {
        const res = await api.get('/resume/latest');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('No active resume analysis found. Please scan a resume first.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading resume analysis data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Resume Data Found</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error || "Please upload a resume PDF/DOCX to generate a score card."}</p>
        <Link to="/resume-upload" className="inline-block px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm">
          Upload Resume Now
        </Link>
      </div>
    );
  }

  const { resume, score } = data;

  const scoreCategories = [
    { name: "ATS Score", value: score.ats_score, color: "from-blue-500 to-indigo-500" },
    { name: "Technical Skills", value: score.technical_score, color: "from-emerald-500 to-teal-500" },
    { name: "Communication", value: score.communication_score, color: "from-purple-500 to-pink-500" },
    { name: "Projects", value: score.projects_score, color: "from-amber-500 to-orange-500" },
    { name: "Certifications", value: score.certifications_score, color: "from-cyan-500 to-sky-500" },
    { name: "Experience", value: score.experience_score, color: "from-rose-500 to-pink-500" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Resume Score Analysis</h1>
          <p className="text-slate-400 text-sm">Parsed File: <span className="text-primary-300 font-semibold">{resume.filename}</span></p>
        </div>
        <button
          onClick={() => navigate('/domain-selection')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-lg shadow-primary-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <span>Select Domain & Role</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Main Score Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Circular Score */}
        <GlassCard hoverEffect={false} className="flex flex-col items-center justify-center text-center p-8">
          <h3 className="font-bold text-lg text-slate-300 mb-6">Overall Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-white/5 fill-transparent" strokeWidth="10" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                className="stroke-primary-500 fill-transparent transition-all duration-1000" 
                strokeWidth="10" 
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * score.overall_score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-white tracking-tighter">{score.overall_score}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">out of 100</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-6 max-w-xs leading-relaxed">
            Your resume ranks in the <span className="text-emerald-400 font-bold">top 15%</span> of candidate files for similar technical vacancies.
          </p>
        </GlassCard>

        {/* Detailed scores bar layout */}
        <GlassCard hoverEffect={false} className="md:col-span-2 space-y-5">
          <h3 className="font-bold text-lg text-white mb-2">Category Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scoreCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>{cat.name}</span>
                  <span className="font-bold">{cat.value}/100</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                    style={{ width: `${cat.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Extracted Sections & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Extracted Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills badge list */}
          <GlassCard hoverEffect={false}>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-primary-400" />
              <span>Extracted Skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.parsed_skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-500/10 border border-primary-500/20 text-primary-300 shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Projects and Experience */}
          <GlassCard hoverEffect={false} className="space-y-6">
            <h3 className="font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <Briefcase size={20} className="text-cyan-400" />
              <span>Experience & Projects</span>
            </h3>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-300">Professional Experience</h4>
              {resume.parsed_experience.length > 0 ? (
                resume.parsed_experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-sm">
                    <div className="flex justify-between font-bold text-white">
                      <span>{exp.role}</span>
                      <span className="text-slate-400 text-xs font-medium">{exp.duration}</span>
                    </div>
                    <p className="text-xs text-primary-300 font-semibold">{exp.company}</p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No historical experience parsed. Complete domains below.</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="font-semibold text-sm text-slate-300">Key Projects</h4>
              {resume.parsed_projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-sm">
                  <h5 className="font-bold text-white">{proj.title}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.details}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Recommendations Column */}
        <div className="space-y-6">
          <GlassCard hoverEffect={false} className="h-full">
            <h3 className="font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span>Improvement Actions</span>
            </h3>
            <div className="space-y-4 mt-4">
              {score.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-slate-400 leading-relaxed align-top">
                  <span className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
