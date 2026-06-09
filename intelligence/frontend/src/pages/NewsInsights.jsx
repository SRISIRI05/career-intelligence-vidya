import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const NewsInsights = () => {
  const [news, setNews] = useState([]);
  const [domain, setDomain] = useState('AI/ML');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      const selectedDomain = sessionStorage.getItem('selected_domain') || 'AI/ML';
      setDomain(selectedDomain);
      
      try {
        const res = await api.get(`/news?domain=${selectedDomain}`);
        setNews(res.data.news);
      } catch (err) {
        console.error(err);
        setError('Error loading news feeds.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Harvesting domain technology updates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Industry Trends</h1>
        <p className="text-slate-400 text-sm">Hiring trends, technology expansions, and corporate events in your target domain: <span className="text-primary-300 font-semibold">{domain}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.length > 0 ? (
          news.map((item, idx) => (
            <GlassCard key={idx} className="flex flex-col justify-between p-6 border border-white/5">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Source: {item.source}</span>
                  <span>{item.published_at}</span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug hover:text-primary-300 transition-colors">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 mt-6 border-t border-white/5 flex">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                >
                  <span>Read Full Article</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm italic">
            No news insights available for this domain.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsInsights;
