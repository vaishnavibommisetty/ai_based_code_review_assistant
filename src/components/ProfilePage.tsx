import React, { useState } from 'react';
import { User, Review } from '../types.ts';
import { User as UserIcon, Mail, ShieldAlert, Key, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  reviews: Review[];
  onUpdateProfile: (updates: { name: string; email: string; photo?: string; currentPassword?: string; newPassword?: string }) => Promise<any>;
}

export default function ProfilePage({ user, reviews, onUpdateProfile }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState(user.photo || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const avatarGradients = [
    'from-indigo-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-600',
    'from-violet-600 to-purple-800'
  ];

  // Calculate statistics specific to this user
  const totalAudits = reviews.length;
  const bookmarksCount = reviews.filter(r => r.bookmarked).length;
  
  const avgQuality = totalAudits > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + (r.reviewJson?.metrics?.quality || 0), 0) / totalAudits)
    : 100;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password and password confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const updates: any = { name, email, photo };
      if (newPassword) {
        updates.currentPassword = currentPassword;
        updates.newPassword = newPassword;
      }

      await onUpdateProfile(updates);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectPresetAvatar = (gradientClass: string) => {
    // Generate a beautiful, stylized gradient SVG preset
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simple gradient
      const grad = ctx.createLinearGradient(0, 0, 100, 100);
      if (gradientClass.includes('indigo')) { grad.addColorStop(0, '#6366f1'); grad.addColorStop(1, '#7c3aed'); }
      else if (gradientClass.includes('pink')) { grad.addColorStop(0, '#ec4899'); grad.addColorStop(1, '#e11d48'); }
      else if (gradientClass.includes('emerald')) { grad.addColorStop(0, '#34d399'); grad.addColorStop(1, '#0d9488'); }
      else if (gradientClass.includes('amber')) { grad.addColorStop(0, '#fbbf24'); grad.addColorStop(1, '#f97316'); }
      else if (gradientClass.includes('sky')) { grad.addColorStop(0, '#38bdf8'); grad.addColorStop(1, '#2563eb'); }
      else { grad.addColorStop(0, '#7c3aed'); grad.addColorStop(1, '#581c87'); }
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 100, 100);
      
      // Draw letter initials
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.charAt(0).toUpperCase(), 50, 52);
      
      setPhoto(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-indigo-500" />
          Account Profile & Security
        </h2>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
          Manage your personal account credentials, select custom presets, and view personal metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Avatar preset & user aggregates */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col items-center space-y-6">
          <div className="relative">
            {photo ? (
              <img 
                src={photo} 
                alt={user.name} 
                className="h-28 w-28 rounded-full border border-indigo-500/20 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-3xl border border-indigo-500/20">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Preset options */}
          <div className="text-center space-y-3.5 w-full">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preset Avatars</span>
            <div className="flex flex-wrap justify-center gap-2">
              {avatarGradients.map((grad, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectPresetAvatar(grad)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} border border-white dark:border-gray-900 hover:scale-115 transition-transform active:scale-90`}
                  title="Generate Preset Avatar"
                />
              ))}
            </div>
          </div>

          {/* Personal aggregate stats cards */}
          <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Role Clearance:</span>
              <span className="capitalize font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 px-2 py-0.5 rounded text-[10px]">
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Total Submissions:</span>
              <span className="font-mono font-bold">{totalAudits} files</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Bookmarked Reports:</span>
              <span className="font-mono font-bold">{bookmarksCount} saved</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Average Code Quality:</span>
              <span className="font-mono font-bold text-green-500">{avgQuality}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Credentials Edit Form */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Block */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-4">
              <h3 className="font-sans font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Key className="h-4.5 w-4.5 text-indigo-500" />
                Change Password (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* New */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Toasts / notifications messages */}
            {successMsg && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5" />
                {errorMsg}
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
