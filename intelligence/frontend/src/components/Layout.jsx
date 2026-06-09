import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Compass, GraduationCap, 
  HelpCircle, BookOpen, Briefcase, TrendingUp, 
  Menu, X, LogOut, User as UserIcon
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Scan', path: '/resume-upload', icon: FileText },
    { name: 'Roadmap', path: '/learning-plan', icon: Compass },
    { name: 'Quiz Room', path: '/quiz', icon: HelpCircle },
    { name: 'Mock Interview', path: '/interview', icon: GraduationCap },
    { name: 'Job Matcher', path: '/jobs', icon: Briefcase },
    { name: 'News Trends', path: '/news', icon: BookOpen },
    { name: 'Market Insights', path: '/insights', icon: TrendingUp }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <header className="md:hidden glass-panel h-16 px-4 flex items-center justify-between border-b border-white/5 z-20">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">V</div>
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">VidyaMitra</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 glass-panel border-r border-white/5 z-30 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col justify-between
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-white/5 justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-primary-500/25">V</div>
              <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-white via-slate-300 to-slate-400 bg-clip-text text-transparent">VidyaMitra</span>
            </Link>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="p-4 mx-4 my-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <UserIcon size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm truncate text-white">{user.name}</h4>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Links */}
          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/15' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-x-hidden p-6 md:p-10 flex flex-col justify-between">
        <div className="max-w-6xl w-full mx-auto">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 text-xs border-t border-white/5 pt-6 max-w-6xl w-full mx-auto">
          <p>© {new Date().getFullYear()} VidyaMitra – AI Career Agent. Designed for modern professionals.</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
