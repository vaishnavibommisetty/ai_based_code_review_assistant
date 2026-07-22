import React, { useEffect, useState } from 'react';
import { User, Review } from '../types.ts';
import { ShieldAlert, Users, Calendar, BarChart2, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
}

interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  averageScore: number;
  languageBreakdown: Record<string, number>;
  riskBreakdown: { Low: number; Medium: number; High: number };
  dailyUploads: Record<string, number>;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('devreview_session_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      const usersRes = await fetch('/api/admin/users', { headers });
      
      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Failed to retrieve administrator statistics.');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Clearance error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      alert("Self-destructive operations are blocked. You cannot delete your own admin account.");
      return;
    }
    
    if (!window.confirm("WARNING: Deleting this account will permanently erase all associated historical code reviews, bookmarks, and sessions. Proceed?")) {
      return;
    }

    try {
      const token = localStorage.getItem('devreview_session_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Deletion failed.');
      }

      // Re-fetch statistics
      fetchAdminData();
    } catch (err: any) {
      alert('Failed to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Loading Administrative Datastores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-indigo-500" />
          Administrative Master Console
        </h2>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
          Supervise user registrations, inspect server statistics, and oversee general code review metrics.
        </p>
      </div>

      {/* Admin stats widgets */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Accounts</span>
              <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{stats.totalUsers}</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cumulative Audits</span>
              <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{stats.totalReviews}</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Average Index</span>
              <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{stats.averageScore}%</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BarChart2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Grid: User Accounts + General Language distribution lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Accounts Manager list table */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white">Registered Accounts List</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-gray-950/50 uppercase tracking-wider font-bold text-gray-400">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 text-right">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {u.name} {u.id === currentUser.id && <span className="text-[10px] text-indigo-500 font-bold">(You)</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`capitalize px-2 py-0.5 rounded font-bold ${
                        u.role === 'admin' 
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' 
                          : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.id !== currentUser.id ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Self locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Extra breakdowns */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white">Risk Matrix Logs</h3>
          
          {stats && (
            <div className="space-y-4">
              {/* Risks counts */}
              {[
                { label: 'High Risk Audits', val: stats.riskBreakdown.High, color: 'bg-red-500' },
                { label: 'Medium Risk Audits', val: stats.riskBreakdown.Medium, color: 'bg-amber-500' },
                { label: 'Low Risk Audits', val: stats.riskBreakdown.Low, color: 'bg-green-500' }
              ].map((rk) => (
                <div key={rk.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{rk.label}</span>
                    <span className="font-mono">{rk.val} modules</span>
                  </div>
                  <div className="h-2 rounded-full w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                      style={{ 
                        width: `${stats.totalReviews > 0 ? (rk.val / stats.totalReviews) * 100 : 0}%` 
                      }} 
                      className={`h-full ${rk.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
              Administrative Guidelines
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              As an Administrator, you can view all registered developers and clear redundant accounts. Deleting an account will automatically perform a clean wipe of all historical JSON review files and stored keys.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
