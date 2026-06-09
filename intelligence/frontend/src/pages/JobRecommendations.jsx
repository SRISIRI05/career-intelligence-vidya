import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, MapPin, DollarSign, Award, ExternalLink } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const JobRecommendations = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data.recommendations);
      } catch (err) {
        console.error(err);
        setError('Error fetching job recommendations. Try uploading your resume first.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Matching profiles with vacant openings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Matching Error</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Job Matches</h1>
        <p className="text-slate-400 text-sm">Curated job openings from leading firms, ranked by compatibility with your resume skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job, idx) => (
            <GlassCard key={idx} className="flex flex-col justify-between p-6 border border-white/5">
              <div className="space-y-4">
                {/* Header: Company, Role & Score */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{job.role}</h3>
                    <p className="text-xs text-primary-300 font-semibold mt-0.5">{job.company}</p>
                  </div>
                  
                  {/* Score badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      {job.match_score}% Match
                    </span>
                  </div>
                </div>

                {/* Location & Salary */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-slate-500" />
                    <span>{job.salary_range}</span>
                  </div>
                </div>

                {/* Skill requirements tags */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} />
                    <span>Required Tech Stack</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills_required.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-1 rounded-md text-[10px] bg-white/5 text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-white/5">
                <a 
                  href={job.apply_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-md shadow-primary-500/15 flex items-center justify-center gap-1"
                >
                  <span>Apply Now</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm italic">
            No job recommendations available at this time. Please upload a resume first.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
