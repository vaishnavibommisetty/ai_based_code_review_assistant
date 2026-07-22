import React, { useState } from 'react';
import { Review, CodeIssue } from '../types.ts';
import { 
  ShieldCheck, AlertOctagon, HelpCircle, FileText, Bookmark, 
  Trash2, MessageSquare, ChevronDown, ChevronUp, Share2, Sparkles, Printer, FileDown, CheckCircle
} from 'lucide-react';

interface DisplayReportProps {
  review: Review;
  onBack: () => void;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenChat: (codeSegment: string, issueTitle: string) => void;
}

export default function DisplayReport({ review, onBack, onToggleBookmark, onDelete, onOpenChat }: DisplayReportProps) {
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const { filename, language, score, complexity, risk, code, reviewJson, bookmarked, id } = review;
  const issues = reviewJson?.issues || [];
  const suggestions = reviewJson?.suggestions || [];

  // Count severity
  const counts = {
    all: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  const filteredIssues = severityFilter 
    ? issues.filter(i => i.severity === severityFilter)
    : issues;

  // Print optimized view helper
  const handlePrint = () => {
    window.print();
  };

  // Raw JSON Export
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(review, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `devreview_audit_${filename}.json`);
    dlAnchorElem.click();
  };

  // Simple lines renderer
  const codeLines = code.split('\n');

  const scrollToLine = (lineNum: number) => {
    setHighlightedLine(lineNum);
    const lineElem = document.getElementById(`code-line-${lineNum}`);
    if (lineElem) {
      lineElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Report Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 mb-1"
          >
            ← Back to Dashboard
          </button>
          <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            Audit Report: {filename}
            <span className="capitalize font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-normal">
              {language}
            </span>
          </h2>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onToggleBookmark(id)}
            className={`p-2.5 rounded-xl border transition-all ${
              bookmarked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
            title="Bookmark Report"
          >
            <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            PDF Report
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-1.5"
          >
            <FileDown className="h-4 w-4" />
            Export JSON
          </button>

          <button
            onClick={() => onDelete(id)}
            className="p-2.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            title="Delete Audit Record"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Main Scorecard Overview (Bento Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Circular Gauge Bento Grid */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Health Score</span>
          
          {/* Radial score gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Back track */}
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" fill="transparent" />
              {/* Score level gauge */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke={score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444'} 
                strokeWidth="8" 
                strokeDasharray={`${2 * Math.PI * 40}`} 
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`} 
                strokeLinecap="round"
                fill="transparent" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono">{score}%</span>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                {score >= 85 ? 'Optimized' : score >= 65 ? 'Warning' : 'Vulnerable'}
              </span>
            </div>
          </div>

          {/* Qualitative index labels */}
          <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl space-y-0.5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Complexity</span>
              <div className={`text-sm font-bold ${complexity === 'Low' ? 'text-green-500' : complexity === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                {complexity}
              </div>
            </div>
            <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl space-y-0.5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Stability Risk</span>
              <div className={`text-sm font-bold ${risk === 'Low' ? 'text-green-500' : risk === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                {risk}
              </div>
            </div>
          </div>
        </div>

        {/* Right Index metrics bars Bento Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric Indexes Breakdown</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {[
              { label: 'Code Quality Index', val: reviewJson?.metrics?.quality || 85, color: 'bg-indigo-500' },
              { label: 'Security Hygiene', val: reviewJson?.metrics?.security || 90, color: 'bg-emerald-500' },
              { label: 'Performance Audit', val: reviewJson?.metrics?.performance || 80, color: 'bg-amber-500' },
              { label: 'Idiomatic Best Practices', val: reviewJson?.metrics?.bestPractices || 85, color: 'bg-rose-500' }
            ].map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <span>{metric.label}</span>
                  <span className="font-mono">{metric.val}%</span>
                </div>
                <div className="h-2 rounded-full w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div style={{ width: `${metric.val}%` }} className={`h-full ${metric.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Executive Summary</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
              {reviewJson?.summary || "The review engine has analyzed your modules successfully."}
            </p>
          </div>
        </div>

      </div>

      {/* Inline Issues Filter & Collapse Sections */}
      <div className="space-y-4">
        
        {/* Severity Filters Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Severity Filter:</span>
          
          <button
            onClick={() => setSeverityFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === null 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            All Issues ({counts.all})
          </button>

          {counts.critical > 0 && (
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                severityFilter === 'critical' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20'
              }`}
            >
              Critical ({counts.critical})
            </button>
          )}

          {counts.high > 0 && (
            <button
              onClick={() => setSeverityFilter('high')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                severityFilter === 'high' 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              High ({counts.high})
            </button>
          )}

          {counts.medium > 0 && (
            <button
              onClick={() => setSeverityFilter('medium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                severityFilter === 'medium' 
                  ? 'bg-yellow-600 text-white border-yellow-600' 
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20'
              }`}
            >
              Medium ({counts.medium})
            </button>
          )}

          {counts.low > 0 && (
            <button
              onClick={() => setSeverityFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                severityFilter === 'low' 
                  ? 'bg-gray-600 text-white border-gray-600' 
                  : 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20'
              }`}
            >
              Low ({counts.low})
            </button>
          )}
        </div>

        {/* Layout: Sidebar issues + Main Code Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Issues Accordions List */}
          <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs text-gray-500">
                No active issues matched your selected filters. Your code is secure for this criterion!
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isOpen = expandedIssueId === issue.id;
                return (
                  <div 
                    key={issue.id}
                    className={`border rounded-2xl bg-white dark:bg-gray-900 transition-all ${
                      isOpen 
                        ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    {/* Accordion Trigger */}
                    <div 
                      onClick={() => {
                        setExpandedIssueId(isOpen ? null : issue.id);
                        if (issue.line > 0) {
                          scrollToLine(issue.line);
                        }
                      }}
                      className="p-4 flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            issue.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                            issue.severity === 'high' ? 'bg-amber-500/10 text-amber-500' :
                            issue.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 capitalize">
                            {issue.category}
                          </span>
                          {issue.line > 0 && (
                            <span className="text-indigo-500 font-bold">
                              Line {issue.line}
                            </span>
                          )}
                        </div>
                        <h4 className="font-sans font-bold text-sm text-gray-900 dark:text-white">
                          {issue.title}
                        </h4>
                      </div>
                      <div className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Accordion Expand Panel */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-50 dark:border-gray-800 space-y-3.5 text-xs">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed leading-5">
                          {issue.description}
                        </p>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/60 rounded-xl space-y-1">
                          <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Recommendation:</span>
                          <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
                            {issue.suggestion}
                          </p>
                        </div>

                        {/* Ask AI Code Tutor */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Gather line logic context around the issue
                              let lineContext = '';
                              if (issue.line > 0) {
                                const startIdx = Math.max(0, issue.line - 4);
                                const endIdx = Math.min(codeLines.length - 1, issue.line + 4);
                                lineContext = codeLines.slice(startIdx, endIdx + 1).join('\n');
                              } else {
                                lineContext = code;
                              }
                              onOpenChat(lineContext, issue.title);
                            }}
                            className="px-3.5 py-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-500/20 flex items-center gap-1.5 border border-indigo-500/20 active:scale-95 transition-all text-[11px]"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Fix with AI Tutor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Main Visual Code Canvas with Line annotations */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[700px]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source Code Viewer</span>
              <span className="text-[10px] text-gray-400">Click a flagged line below to highlight</span>
            </div>
            
            {/* Scrollable code window */}
            <div className="flex-1 overflow-auto font-mono text-xs p-4 leading-relaxed bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isLineFlagged = issues.some(i => i.line === lineNum);
                const isLineSelected = highlightedLine === lineNum;

                // Find corresponding issues for this line to draw overlay badges
                const lineIssues = issues.filter(i => i.line === lineNum);

                return (
                  <div key={lineNum} className="space-y-0.5">
                    <div 
                      id={`code-line-${lineNum}`}
                      onClick={() => setHighlightedLine(lineNum)}
                      className={`flex items-start -mx-4 px-4 py-0.5 group cursor-pointer transition-all ${
                        isLineSelected 
                          ? 'bg-indigo-500/15 border-l-4 border-indigo-500 font-semibold' 
                          : isLineFlagged 
                          ? 'bg-red-500/5 dark:bg-red-500/[0.02] border-l-4 border-red-500/50 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900/40 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Line Index */}
                      <span className="w-8 shrink-0 select-none text-right text-gray-400 font-semibold pr-3 border-r border-gray-100 dark:border-gray-900">
                        {lineNum}
                      </span>
                      {/* Line content */}
                      <pre className="pl-4 flex-1 whitespace-pre-wrap font-mono select-text break-all">
                        {line || ' '}
                      </pre>
                    </div>

                    {/* Inline issue tag expanders */}
                    {isLineSelected && lineIssues.map(li => (
                      <div 
                        key={li.id}
                        className="my-1.5 ml-12 mr-4 p-3 bg-red-500/[0.03] dark:bg-red-500/[0.01] border border-red-500/20 rounded-xl space-y-1 animate-fadeIn"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-red-500 uppercase">
                          <AlertOctagon className="h-3.5 w-3.5" />
                          {li.severity} severity issue • line {li.line}
                        </div>
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white">{li.title}</h5>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{li.description}</p>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onOpenChat(line, li.title)}
                            className="px-2.5 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 active:scale-95"
                          >
                            <Sparkles className="h-3 w-3" />
                            Discuss with Tutor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Strategic optimization cards */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            AI Strategic Modernization Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/80 rounded-2xl space-y-1.5">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">{item.description}</p>
                <div className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Expected Impact: {item.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
