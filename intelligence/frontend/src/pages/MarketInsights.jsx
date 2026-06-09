import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const MarketInsights = () => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/news/insights');
        setExchangeRates(res.data.exchange_rates);
        setIndicators(res.data.market_indicators);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 animate-spin"></div>
        <p className="text-slate-400 text-sm">Harvesting currency tables & sector growth index...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Market Insights</h1>
        <p className="text-slate-400 text-sm">Real-time currency exchange rates and tech sector industry indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exchange rates column */}
        <GlassCard hoverEffect={false} className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white border-b border-white/5 pb-3 flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-primary-400" />
              <span>USD Currency Rates</span>
            </h3>
            
            <div className="space-y-4">
              {Object.entries(exchangeRates).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-sm font-semibold text-slate-300">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-white font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/5 text-[10px] text-slate-500">
            Rates auto-synced via ExchangeRate API
          </div>
        </GlassCard>

        {/* Market growth Indicators Column */}
        <div className="md:col-span-2 space-y-4">
          <GlassCard hoverEffect={false}>
            <h3 className="font-bold text-base text-white border-b border-white/5 pb-3 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-cyan-400" />
              <span>Technology Sector Indicators</span>
            </h3>
            
            <div className="space-y-4">
              {indicators.map((ind, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-200">{ind.indicator}</h4>
                    <span className="text-xs text-slate-400">Quarterly trend review</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary-300 block">{ind.trend}</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{ind.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
