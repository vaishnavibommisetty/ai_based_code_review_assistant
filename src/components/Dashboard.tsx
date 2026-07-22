import React from 'react';
import { Review } from '../types.ts';
import { 
  BarChart2, ShieldCheck, Zap, AlertTriangle, Clock, 
  ArrowRight, PlusCircle, Search, Sparkles, Star, ChevronRight, FileCode2
} from 'lucide-react';

interface DashboardProps {
  reviews: Review[];
  onNewReview: () => void;
  onSelectReview: (review: Review) => void;
  onCompare: () => void;
}

export default function Dashboard({ reviews, onNewReview, onSelectReview, onCompare }: DashboardProps) {
  
  // Calculate general stats
  const totalFiles = reviews.length;
  
  const avgScore = totalFiles > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + r.score, 0) / totalFiles) 
    : 100;
  
  // Issues calculations
  let criticalCount = 0;
  let highCount = 0;
  let totalIssues = 0;
  let securityIssuesCount = 0;

  reviews.forEach(r => {
    if (r.reviewJson && r.reviewJson.issues) {
      r.reviewJson.issues.forEach(i => {
        totalIssues++;
        if (i.severity === 'critical') criticalCount++;
        if (i.severity === 'high') highCount++;
        if (i.category === 'security') securityIssuesCount++;
      });
    }
  });

  const criticalAndHigh = criticalCount + highCount;

  // Compute a security score (e.g., base of 100, drops by 15 per critical and 8 per high, bounded at 10)
  const securityHealth = Math.max(10, 100 - (criticalCount * 20) - (highCount * 10));

  // Language count dictionary
  const langCounts: Record<string, number> = {};
  reviews.forEach(r => {
    const lang = r.language.toUpperCase();
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const languageStats = Object.entries(langCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Upper Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-semibold">
            <Sparkles className="h-3 w-3" />
            AI Continuous Code Review
          </div>
          <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-tight">Repository Health Dashboard</h2>
          <p className="font-sans text-sm text-indigo-200 max-w-xl">
            Evaluate code quality metrics, security vulnerabilities, O-notation performance limits, and refactor using Gemini.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative shrink-0">
          <button
            id="dash-new-review-btn"
            onClick={onNewReview}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            New Code Review
          </button>
          <button
            id="dash-compare-btn"
            onClick={onCompare}
            className="px-5 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold text-sm transition-all border border-gray-700 flex items-center gap-2"
          >
            Compare Code
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Score */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</span>
            <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{avgScore}%</div>
            <div className="text-xs text-green-500 flex items-center gap-1 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              Healthy Index
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Star className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Files */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Files Reviewed</span>
            <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{totalFiles}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">Persistent database sync</div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <FileCode2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Security */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Health</span>
            <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{securityHealth}%</div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${securityHealth > 80 ? 'text-green-500' : 'text-amber-500'}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${securityHealth > 80 ? 'bg-green-500' : 'bg-amber-500'}`} />
              {securityHealth > 80 ? 'Secured Protocols' : 'Audit Remediations Pending'}
            </div>
          </div>
          <div className={`p-3.5 rounded-2xl ${securityHealth > 80 ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'}`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Issues */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerts & Issues</span>
            <div className="font-sans font-bold text-3xl text-gray-900 dark:text-white">{totalIssues}</div>
            <div className="text-xs text-red-500 font-semibold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {criticalAndHigh} Critical / High
            </div>
          </div>
          <div className={`p-3.5 rounded-2xl ${totalIssues > 0 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Reviews List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                Recent Code Reviews
              </h3>
              <span className="text-xs font-medium text-gray-500">{reviews.length} total reports</span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-full w-fit mx-auto text-gray-400">
                  <FileCode2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">No reviews found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You haven't submitted any code yet. Submit a file to get an automated AI audit of security and clean metrics.
                  </p>
                </div>
                <button
                  onClick={onNewReview}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {reviews.slice(0, 5).map((review) => {
                  // Calculate severity counts
                  let crit = 0, high = 0, med = 0, low = 0;
                  review.reviewJson?.issues?.forEach(i => {
                    if (i.severity === 'critical') crit++;
                    if (i.severity === 'high') high++;
                    if (i.severity === 'medium') med++;
                    if (i.severity === 'low') low++;
                  });

                  return (
                    <div
                      key={review.id}
                      onClick={() => onSelectReview(review)}
                      className="group py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-950/40 rounded-xl px-2 -mx-2 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl text-xs font-bold ${
                          review.score >= 90 
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' 
                            : review.score >= 70 
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' 
                            : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        }`}>
                          {review.score}
                        </div>
                        <div>
                          <h4 className="font-sans font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {review.filename}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span className="capitalize font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                              {review.language}
                            </span>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Issues badges */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
                          {crit > 0 && <span className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">{crit} critical</span>}
                          {high > 0 && <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">{high} high</span>}
                          {crit === 0 && high === 0 && <span className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">Secure</span>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Distribution & Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Languages distribution pie card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              Language Breakdown
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No language distribution available yet.</p>
            ) : (
              <div className="space-y-4">
                
                {/* Simulated clean Ring/Bar breakdown */}
                <div className="h-2 rounded-full w-full bg-gray-100 dark:bg-gray-800 flex overflow-hidden">
                  {languageStats.map((stat, idx) => {
                    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <div 
                        key={stat.name} 
                        style={{ width: `${stat.percentage}%` }} 
                        className={`${colorClass} h-full`}
                        title={`${stat.name}: ${stat.percentage}%`}
                      />
                    );
                  })}
                </div>

                <div className="space-y-2.5 pt-2">
                  {languageStats.map((stat, idx) => {
                    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <div key={stat.name} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                          <span className="font-semibold">{stat.name}</span>
                        </div>
                        <span className="font-mono text-gray-500">{stat.count} ({stat.percentage}%)</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="p-5 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-2xl border border-indigo-100/40 dark:border-indigo-950 space-y-3">
            <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-indigo-500" />
              Pro Refactoring Tips
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              When reviewing, click directly on flagged line rows to trigger our <strong>AI Chat assistant</strong>. Ask questions, optimize memory allocations, or automatically write production-grade replacements.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
