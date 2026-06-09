import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Cpu, Cloud, Shield, Layout, Settings, 
  Code, LineChart, Briefcase, Plus, ArrowRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const DomainSelection = () => {
  const navigate = useNavigate();
  const [customDomain, setCustomDomain] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const domains = [
    { name: "AI/ML", icon: Cpu, desc: "Build neural network architectures, LLMs, computer vision, and machine learning models.", color: "from-purple-500 to-indigo-500" },
    { name: "Full Stack Development", icon: Layout, desc: "Develop end-to-end client applications, servers, databases, and REST integration workflows.", color: "from-blue-500 to-indigo-500" },
    { name: "Cloud Computing", icon: Cloud, desc: "Deploy infrastructure-as-code, manage cloud instances, virtual private networks, and storage buckets.", color: "from-cyan-500 to-sky-500" },
    { name: "Data Science", icon: Database, desc: "Clean datasets, run exploratory statistical analysis, and discover company trends.", color: "from-teal-500 to-emerald-500" },
    { name: "DevOps", icon: Settings, desc: "Orchestrate Docker containers, CI/CD automated test pipelines, and configure Kubernetes clusters.", color: "from-orange-500 to-amber-500" },
    { name: "Cyber Security", icon: Shield, desc: "Audit networks, identify vulnerabilities, apply cryptographic protocols, and manage SIEM solutions.", color: "from-rose-500 to-red-500" },
    { name: "Software Engineering", icon: Code, desc: "Master algorithm structures, write OOP architectures, and design clean database patterns.", color: "from-pink-500 to-rose-500" },
    { name: "Business Analytics", icon: LineChart, desc: "Build SQL queries, design PowerBI dashboards, and capture requirements for tech solutions.", color: "from-emerald-500 to-teal-500" },
    { name: "Product Management", icon: Briefcase, desc: "Define project timelines, write roadmaps, coordinate design sprints, and prioritize backlogs.", color: "from-violet-500 to-purple-500" }
  ];

  const handleSelectDomain = (domainName) => {
    sessionStorage.setItem('selected_domain', domainName);
    navigate('/role-selection');
  };

  const handleCustomDomainSubmit = (e) => {
    e.preventDefault();
    if (customDomain.trim()) {
      handleSelectDomain(customDomain.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Select Career Domain</h1>
        <p className="text-slate-400 text-sm">Choose your specialization to customize your learning roadmaps and mock interviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((dom, idx) => {
          const Icon = dom.icon;
          return (
            <div 
              key={idx}
              onClick={() => handleSelectDomain(dom.name)}
              className="cursor-pointer group"
            >
              <GlassCard className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${dom.color} p-2.5 text-white mb-4 shadow-lg shadow-primary-500/10`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-primary-400 transition-colors">{dom.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{dom.desc}</p>
                </div>
                
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Roles</span>
                  <ArrowRight size={14} />
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Custom Domain Section */}
      <div className="pt-6 border-t border-white/5 max-w-2xl">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Plus size={18} className="text-primary-400" />
            <span>Specify a Custom Domain</span>
          </button>
        ) : (
          <GlassCard hoverEffect={false}>
            <form onSubmit={handleCustomDomainSubmit} className="flex gap-4">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. Game Development, Blockchain Engineering"
                className="glass-input flex-1 px-4 py-3 rounded-xl text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-md shadow-primary-500/15 flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default DomainSelection;
