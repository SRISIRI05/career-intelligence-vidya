import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Compass, GraduationCap, ShieldCheck, 
  HelpCircle, Briefcase, ChevronRight, Users, Award, BookOpen
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Home = () => {
  const features = [
    {
      title: "ATS Resume Analysis",
      desc: "Instant ATS score check, spelling scans, structure analysis, and keyword matching using GPT-4.",
      icon: FileText,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Skill Gap Detection",
      desc: "Compares your skill profile with job requirements. Spotlights missing credentials and certifications.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Learning Roadmaps",
      desc: "Dynamic 3-month schedules with weekly study items, project builders, and curated resource links.",
      icon: Compass,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "AI mock interviews",
      desc: "Simulate HR and deep tech panels with full transcript evaluations in text and voice interfaces.",
      icon: GraduationCap,
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "Interactive Quizzes",
      desc: "Test your theoretical and situational domain strength with auto-generated MCQ sets.",
      icon: HelpCircle,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Job Recommendations",
      desc: "Curate job openings from top firms and calculate matching stats dynamically.",
      icon: Briefcase,
      color: "from-cyan-500 to-sky-500"
    }
  ];

  const stats = [
    { value: "95%", label: "Placement Success Rate" },
    { value: "10K+", label: "Careers Mentored" },
    { value: "85+", label: "Preconfigured Job Roles" },
    { value: "24/7", label: "Autonomous AI Coach Access" }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 overflow-hidden relative">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

      {/* HEADER NAVBAR */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center font-extrabold text-white shadow-lg">V</div>
          <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">VidyaMitra</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-semibold hover:text-white text-slate-300 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-105">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
          <span>Next-Generation Career CoPilot</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          AI-Powered Career <br />
          <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Growth Platform</span>
        </h1>
        <p className="text-slate-400 md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Supercharge your career path. Scan resumes, isolate skill gaps, build structured 3-month roadmaps, and practice with AI voice interview coaches.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-0.5">
            <span>Start Career Journey</span>
            <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span>Upload Resume</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto border-y border-white/5 py-10">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">{s.value}</h3>
              <p className="text-slate-400 text-xs md:text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Complete Agentic Workflows</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From parsing the first line of your resume to matching job openings, VidyaMitra coordinates specialized AI agents to guide every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <GlassCard key={idx} className="relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} p-2.5 text-white mb-6 shadow-lg shadow-primary-500/10`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* USER FEEDBACK */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
        <h3 className="text-center text-2xl font-bold mb-10 text-slate-300">Loved by Engineers and Designers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard hoverEffect={false}>
            <p className="italic text-slate-300 mb-4 text-sm leading-relaxed">
              "The 3-month roadmap generated was incredibly specific. It linked exact YouTube courses for Docker and Terraform that helped me transition from standard web developer to AWS Cloud associate in months."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center font-bold text-xs text-primary-400">AA</div>
              <div>
                <h4 className="font-bold text-xs text-white">Ananya Arora</h4>
                <p className="text-[10px] text-slate-500">Cloud Infrastructure Engineer</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard hoverEffect={false}>
            <p className="italic text-slate-300 mb-4 text-sm leading-relaxed">
              "The voice interview room is a game changer. Speaking directly to the simulator helped debug my filler word habits and gave concrete grading metrics on communication and accuracy."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center font-bold text-xs text-cyan-400">RS</div>
              <div>
                <h4 className="font-bold text-xs text-white">Rohan Sharma</h4>
                <p className="text-[10px] text-slate-500">ML Engineer Candidate</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 mt-20 text-center text-slate-500 text-xs px-6">
        <p>© 2026 VidyaMitra – AI Career Agent. Powered by OpenAI GPT-4 & Supabase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
