import React, { useState, useEffect } from 'react';
import { User, Review } from './types.ts';
import { ThemeProvider } from './components/ThemeContext.tsx';
import Navbar from './components/Navbar.tsx';
import LandingPage from './components/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import UploadCode from './components/UploadCode.tsx';
import DisplayReport from './components/DisplayReport.tsx';
import ReviewHistory from './components/ReviewHistory.tsx';
import CodeCompare from './components/CodeCompare.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AIChatAssistant from './components/AIChatAssistant.tsx';
import { ShieldCheck, Mail, Key, User as UserIcon, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Chat Sidebar State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCodeSnippet, setChatCodeSnippet] = useState('');
  const [chatIssueTitle, setChatIssueTitle] = useState('');

  // Helper to get auth headers with token
  const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) => {
    const token = localStorage.getItem('devreview_session_token');
    const headers: Record<string, string> = { ...additionalHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Initial Handshake / Fetch User Session & Reviews
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('devreview_session_token', data.token);
        }
        setCurrentUser(data.user);
        setCurrentView('dashboard');
        fetchReviews();
      } else {
        setCurrentUser(null);
        setCurrentView('landing');
      }
    } catch {
      setCurrentUser(null);
      setCurrentView('landing');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const list = await res.json();
        setReviews(list);
      }
    } catch (e) {
      console.error("Error fetching reviews", e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // 2. Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication rejected by security gate.');
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('devreview_session_token', data.token);
      }
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      setCurrentView('dashboard');
      
      // Fetch reviews with a small delay to ensure token is active
      setTimeout(() => {
        fetchReviews();
      }, 50);
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {}
    localStorage.removeItem('devreview_session_token');
    setCurrentUser(null);
    setReviews([]);
    setSelectedReview(null);
    setChatOpen(false);
    setCurrentView('landing');
  };

  // 3. Review Operations
  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}/bookmark`, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        // Update state arrays
        setReviews(prev => prev.map(r => r.id === id ? { ...r, bookmarked: updated.bookmarked } : r));
        if (selectedReview?.id === id) {
          setSelectedReview(prev => prev ? { ...prev, bookmarked: updated.bookmarked } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this audit record?")) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        if (selectedReview?.id === id) {
          setSelectedReview(null);
          setCurrentView('dashboard');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (updates: any) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Profile update failed.');
    }

    const data = await res.json();
    setCurrentUser(data.user);
    return data.user;
  };

  // 4. Open tutor drawer helper
  const handleOpenTutorChat = (codeSegment: string, issueTitle: string) => {
    setChatCodeSnippet(codeSegment);
    setChatIssueTitle(issueTitle);
    setChatOpen(true);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        
        {/* Sticky Header Nav */}
        <Navbar
          user={currentUser}
          activeTab={currentView}
          setActiveTab={(tab) => {
            if (tab === 'landing' && currentUser) {
              setCurrentView('dashboard');
            } else {
              setCurrentView(tab);
            }
          }}
          onLogout={handleLogout}
          onOpenLogin={() => {
            setAuthMode('login');
            setAuthError('');
            setShowAuthModal(true);
          }}
        />

        {/* Core Screen Switcher */}
        <main className="flex-grow">
          {currentView === 'landing' && (
            <LandingPage 
              onStart={() => {
                if (currentUser) {
                  setCurrentView('dashboard');
                } else {
                  setAuthMode('login');
                  setAuthError('');
                  setShowAuthModal(true);
                }
              }} 
            />
          )}

          {currentView === 'dashboard' && currentUser && (
            <Dashboard
              reviews={reviews}
              onNewReview={() => setCurrentView('upload')}
              onSelectReview={(review) => {
                setSelectedReview(review);
                setCurrentView('report');
              }}
              onCompare={() => setCurrentView('compare')}
            />
          )}

          {currentView === 'upload' && currentUser && (
            <UploadCode
              onReviewComplete={(review) => {
                // Prepend to history
                setReviews(prev => [review, ...prev]);
                setSelectedReview(review);
                setCurrentView('report');
              }}
            />
          )}

          {currentView === 'report' && currentUser && selectedReview && (
            <DisplayReport
              review={selectedReview}
              onBack={() => setCurrentView('dashboard')}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDeleteReview}
              onOpenChat={handleOpenTutorChat}
            />
          )}

          {currentView === 'history' && currentUser && (
            <ReviewHistory
              reviews={reviews}
              onSelectReview={(review) => {
                setSelectedReview(review);
                setCurrentView('report');
              }}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDeleteReview}
            />
          )}

          {currentView === 'compare' && currentUser && (
            <CodeCompare />
          )}

          {currentView === 'profile' && currentUser && (
            <ProfilePage
              user={currentUser}
              reviews={reviews}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentView === 'admin' && currentUser && currentUser.role === 'admin' && (
            <AdminDashboard currentUser={currentUser} />
          )}
        </main>

        {/* Interactive Floating Chat Side Drawer */}
        {chatOpen && selectedReview && (
          <AIChatAssistant
            filename={selectedReview.filename}
            codeSnippet={chatCodeSnippet}
            issueTitle={chatIssueTitle}
            onClose={() => setChatOpen(false)}
          />
        )}

        {/* Premium Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
              onClick={() => setShowAuthModal(false)}
            />
            
            {/* Modal Box */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 overflow-hidden animate-zoomIn">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
              
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1.5 text-center">
                <h3 className="font-sans font-extrabold text-xl text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-indigo-500" />
                  {authMode === 'login' ? 'Sign In to DevReview.AI' : 'Create Sandbox Account'}
                </h3>
                <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
                  {authMode === 'login' 
                    ? 'Access continuous security intelligence and code metrics.' 
                    : 'Get started with high-precision automated reviews.'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        required
                        placeholder="Ada Lovelace"
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      required
                      placeholder="developer@gmail.com"
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 mt-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:bg-gray-300 rounded-xl shadow-lg shadow-indigo-500/15 transition-all"
                >
                  {authLoading ? 'Verifying Credentials...' : authMode === 'login' ? 'Sign In Securely' : 'Register Sandbox Account'}
                </button>
              </form>

              {/* Mode toggle */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                      }}
                      className="text-indigo-500 font-semibold hover:underline"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="text-indigo-500 font-semibold hover:underline"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </ThemeProvider>
  );
}
