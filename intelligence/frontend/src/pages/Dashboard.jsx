import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, HelpCircle, GraduationCap, 
  ArrowRight, AlertCircle, RefreshCw, CheckSquare, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/progress');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Error loading progress stats. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Aggregating workspace telemetry charts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Dashboard Error</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error || "Failed to load dashboard data."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { resume_score, skill_match_score, avg_quiz_score, avg_interview_score, learning_completion_rate, timeline, next_actions } = data;

  const cards = [
    { name: "Resume Score", value: resume_score || "--", max: "/100", link: "/resume-upload", desc: "ATS, formatting and skills scanner", icon: FileText, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { name: "Skill Compatibility", value: skill_match_score ? `${skill_match_score}%` : "--", max: "", link: "/domain-selection", desc: "Gap analysis vs target role", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Avg Quiz Accuracy", value: avg_quiz_score ? `${avg_quiz_score.toFixed(0)}%` : "--", max: "", link: "/quiz", desc: "Conceptual domains assessment score", icon: HelpCircle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "Interview Fluency", value: avg_interview_score || "--", max: "/100", link: "/interview", desc: "HR, technical and behavioral reviews", icon: GraduationCap, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
  ];

  // Radar chart data mapping technical categories
  const radarData = [
    { subject: 'ATS Keywords', A: resume_score || 30, fullMark: 100 },
    { subject: 'Coding Skill', A: avg_quiz_score || 25, fullMark: 100 },
    { subject: 'Speech Fluency', A: avg_interview_score || 35, fullMark: 100 },
    { subject: 'Certifications', A: resume_score ? Math.min(resume_score + 10, 95) : 30, fullMark: 100 },
    { subject: 'Experience Log', A: resume_score ? Math.max(resume_score - 15, 40) : 30, fullMark: 100 }
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Career Dashboard</h1>
        <p className="text-slate-400 text-sm">Trace your roadmap steps, review diagnostic metrics, and complete recommended action items.</p>
      </div>

      {/* Grid of scorecard stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Link key={idx} to={c.link} className="block group">
              <GlassCard className="h-full flex flex-col justify-between border border-white/5 hover:border-primary-500/30">
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${c.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-white tracking-tight">{c.value}</span>
                      <span className="text-xs text-slate-500 font-bold">{c.max}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-4 group-hover:text-primary-400 transition-colors">{c.desc}</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Line Graph */}
        <GlassCard hoverEffect={false} className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-white">Score Growth Timeline</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.4)" fontSize={10} />
                <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(21, 27, 44, 0.95)', borderColor: 'rgba(139, 92, 246, 0.2)', color: 'white', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Proficiency Level"
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skill Category Radar Chart */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <h3 className="font-bold text-base text-white">Capability Radar</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255, 255, 255, 0.5)" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Fluency" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Next Actions Suggestions */}
      <GlassCard hoverEffect={false} className="p-6">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-primary-400" />
          <span>AI Coach - Next Recommended Actions</span>
        </h3>
        
        <div className="space-y-3.5">
          {next_actions.map((act, idx) => (
            <div key={idx} className="flex gap-3 text-sm text-slate-300 align-top">
              <span className="w-5 h-5 rounded bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
