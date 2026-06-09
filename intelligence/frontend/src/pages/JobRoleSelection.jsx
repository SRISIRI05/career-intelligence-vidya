import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, ArrowRight, ArrowLeft, Briefcase, Award } from 'lucide-react';
import GlassCard from '../components/GlassCard';

// Predefined roles mapping matching the backend models
const PREDEFINED_ROLES = {
  "AI/ML": ["ML Engineer", "Data Scientist", "Computer Vision Engineer", "NLP Scientist", "AI Researcher"],
  "Full Stack Development": ["Full Stack Developer", "Frontend Engineer", "Backend Engineer", "React Developer", "Node.js Developer"],
  "Cloud Computing": ["Cloud Engineer", "Cloud Infrastructure Architect", "AWS Engineer", "Azure Solutions Specialist"],
  "Data Science": ["Data Scientist", "Data Analyst", "Machine Learning Specialist", "BI Developer", "Database Administrator"],
  "DevOps": ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Infrastructure Automation Engineer"],
  "Cyber Security": ["Cyber Security Analyst", "Security Engineer", "Penetration Tester", "Information Security Officer"],
  "Software Engineering": ["Software Engineer", "Systems Developer", "Java Developer", "Python Engineer"],
  "Business Analytics": ["Business Analyst", "BI Consultant", "Systems Analyst", "Operations Analyst"],
  "Product Management": ["Product Manager", "Technical Product Manager", "Product Owner", "Associate Product Manager"]
};

const JobRoleSelection = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const selectedDomain = sessionStorage.getItem('selected_domain');
    if (!selectedDomain) {
      navigate('/domain-selection');
    } else {
      setDomain(selectedDomain);
    }
  }, [navigate]);

  const getRolesList = () => {
    if (!domain) return [];
    // Fetch from dictionary or return a generic set if custom domain
    return PREDEFINED_ROLES[domain] || [
      "Junior Software Developer",
      "Technical Specialist",
      "Project Associate",
      "System Consultant"
    ];
  };

  const filteredRoles = getRolesList().filter(role => 
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRole = (roleName) => {
    sessionStorage.setItem('selected_role', roleName);
    navigate('/eligibility-check');
  };

  const handleCustomRoleSubmit = (e) => {
    e.preventDefault();
    if (customRole.trim()) {
      handleSelectRole(customRole.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <Link to="/domain-selection" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} />
            <span>Change Domain</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Target Job Role</h1>
          <p className="text-slate-400 text-sm">Targeting Domain: <span className="text-primary-300 font-semibold">{domain}</span></p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Grid of Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelectRole(role)}
              className="cursor-pointer group"
            >
              <GlassCard className="p-5 flex items-center justify-between border border-white/5 hover:border-primary-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-primary-300 transition-colors text-sm">{role}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Domain: {domain}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
              </GlassCard>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-500 text-sm italic">
            No pre-selected roles match your query. Try writing a custom role.
          </div>
        )}
      </div>

      {/* Custom Role Input */}
      <div className="pt-6 border-t border-white/5 max-w-2xl">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Plus size={18} className="text-primary-400" />
            <span>Target a Custom Job Role Name</span>
          </button>
        ) : (
          <GlassCard hoverEffect={false}>
            <form onSubmit={handleCustomRoleSubmit} className="flex gap-4">
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Lead Technical Architect, Junior Associate Analyst"
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

export default JobRoleSelection;
