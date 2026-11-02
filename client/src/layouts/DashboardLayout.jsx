import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  FileCheck2,
  History,
  FolderOpen,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, role, plan, logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Analysis', href: '/analyzer', icon: FileCheck2 },
    { name: 'Analysis History', href: '/history', icon: History },
    { name: 'My Documents', href: '/history', icon: FolderOpen },
    { name: 'Reports', href: '/history', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // If user has admin role, append Admin Portal
  if (role === 'admin') {
    navItems.push({ name: 'Admin Portal', href: '/admin', icon: ShieldAlert, badge: 'ADMIN' });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = userProfile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Researcher';

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex overflow-hidden">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================================
          FUTURISTIC CYBER SIDEBAR
      ========================================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-midnight-900/90 backdrop-blur-2xl border-r border-cyber-blue/15 transition-transform duration-300 lg:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-blue to-cyber-violet p-[2px] shadow-glow-blue">
                <div className="w-full h-full bg-midnight-900 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyber-blue" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white">AICheck</span>
                <span className="text-[10px] font-mono text-cyber-blue uppercase tracking-wider">Workspace</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Quick Info Badge */}
          <div className="p-4 mx-3 my-4 rounded-xl bg-midnight-850/80 border border-cyber-blue/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyber-blue/20 border border-cyber-blue/40 flex items-center justify-center text-cyber-blue font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-violet/20 text-cyber-violet-light border border-cyber-violet/30">
                    {plan} Plan
                  </span>
                  {role === 'admin' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 shadow-glow-blue/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-blue' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            to="/analyzer"
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 flex items-center justify-center gap-2 hover:shadow-glow-blue transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Document Scan</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA & TOPBAR
      ========================================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-midnight-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-midnight-900 border border-white/10 text-slate-300"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
              AICheck Workspace / <span className="text-white capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-midnight-900 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </Link>

            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-cyber-blue/20 border border-cyber-blue/40 flex items-center justify-center text-cyber-blue font-bold text-xs hover:scale-105 transition-transform"
              title="Profile"
            >
              {displayName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
