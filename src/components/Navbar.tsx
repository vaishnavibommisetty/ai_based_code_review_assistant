import React from 'react';
import { useTheme } from './ThemeContext.tsx';
import { User } from '../types.ts';
import { Code2, Sun, Moon, LogOut, ShieldAlert, User as UserIcon, History, Columns, FileCode2, BarChart2 } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({ user, activeTab, setActiveTab, onLogout, onOpenLogin }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  const handleNav = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav(user ? 'dashboard' : 'landing')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Code2 className="h-6 w-6" id="nav-logo-icon" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              DevReview<span className="text-indigo-500">.AI</span>
            </span>
          </div>

          {/* Middle Nav - Authenticated Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <button
                id="tab-dashboard"
                onClick={() => handleNav('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Dashboard
              </button>
              
              <button
                id="tab-upload"
                onClick={() => handleNav('upload')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'upload' || activeTab === 'report'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <FileCode2 className="h-4 w-4" />
                New Review
              </button>

              <button
                id="tab-compare"
                onClick={() => handleNav('compare')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'compare'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <Columns className="h-4 w-4" />
                Code Compare
              </button>

              <button
                id="tab-history"
                onClick={() => handleNav('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <History className="h-4 w-4" />
                History
              </button>

              {user.role === 'admin' && (
                <button
                  id="tab-admin"
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
            </div>
          )}

          {/* Right Nav */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => handleNav('profile')}
                >
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name || 'User'} 
                      className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover group-hover:border-indigo-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs border border-indigo-500/30 group-hover:border-indigo-500">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {(user.name || 'User').split(' ')[0]}
                  </span>
                </div>

                <button
                  id="nav-logout"
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-get-started-btn"
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all scale-100 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
