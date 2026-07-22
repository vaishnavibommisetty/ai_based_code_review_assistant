import React, { useState } from 'react';
import { Review } from '../types.ts';
import { Search, Filter, Star, Trash2, Calendar, FileCode2, ChevronRight } from 'lucide-react';

interface ReviewHistoryProps {
  reviews: Review[];
  onSelectReview: (review: Review) => void;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReviewHistory({ reviews, onSelectReview, onToggleBookmark, onDelete }: ReviewHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'score-high' | 'score-low'

  const availableLanguages = Array.from(new Set(reviews.map(r => r.language.toLowerCase()))).sort();

  const handleToggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleBookmark(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => {
      const matchesSearch = r.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLang = langFilter === 'all' || r.language.toLowerCase() === langFilter;
      const matchesBookmark = !bookmarkOnly || r.bookmarked;
      return matchesSearch && matchesLang && matchesBookmark;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'score-high') return b.score - a.score;
      if (sortBy === 'score-low') return a.score - b.score;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-indigo-500" />
          Audit History
        </h2>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
          Manage and browse your complete list of historical code reviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Language Filter */}
        <div className="md:col-span-3">
          <select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Sort option */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score-high">Score: High-Low</option>
            <option value="score-low">Score: Low-High</option>
          </select>
        </div>

        {/* Bookmarks Toggle button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={() => setBookmarkOnly(prev => !prev)}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
              bookmarkOnly 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold' 
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950'
            }`}
          >
            <Star className={`h-4 w-4 ${bookmarkOnly ? 'fill-current' : ''}`} />
            Bookmarks Only
          </button>
        </div>

      </div>

      {/* Reviews Table / List representation */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl space-y-4 shadow-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-full w-fit mx-auto text-gray-400">
            <FileCode2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">No historical records</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn't find any code reviews that match your active filters. Try clearing your search parameters.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-gray-100 dark:divide-gray-800">
              
              <thead className="bg-gray-50/50 dark:bg-gray-950/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Vulnerability Risk</th>
                  <th className="px-6 py-4">Audit Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredReviews.map((review) => {
                  const rk = review.risk || 'Low';
                  return (
                    <tr 
                      key={review.id}
                      onClick={() => onSelectReview(review)}
                      className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-950/40 transition-colors group"
                    >
                      {/* Score circle column */}
                      <td className="px-6 py-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          review.score >= 85 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
                            : review.score >= 65 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                          {review.score}
                        </div>
                      </td>

                      {/* Filename column */}
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {review.filename}
                      </td>

                      {/* Language column */}
                      <td className="px-6 py-4">
                        <span className="capitalize font-mono text-[11px] bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">
                          {review.language}
                        </span>
                      </td>

                      {/* Risk column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          rk === 'Low' ? 'text-green-500' : rk === 'Medium' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rk === 'Low' ? 'bg-green-500' : rk === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {rk} Risk
                        </span>
                      </td>

                      {/* Date column */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleToggleBookmark(e, review.id)}
                            className={`p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 ${
                              review.bookmarked ? 'text-amber-500' : 'hover:text-amber-500'
                            }`}
                            title="Bookmark"
                          >
                            <Star className={`h-4.5 w-4.5 ${review.bookmarked ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={(e) => handleDelete(e, review.id)}
                            className="p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                          
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
}
