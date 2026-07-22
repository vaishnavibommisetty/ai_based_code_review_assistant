import React, { useState } from 'react';
import { CompareResult } from '../types.ts';
import { Columns, Copy, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, FileCode } from 'lucide-react';

export default function CodeCompare() {
  const [codeA, setCodeA] = useState('');
  const [codeB, setCodeB] = useState('');
  const [fileAName, setFileAName] = useState('controller_v1.py');
  const [fileBName, setFileBName] = useState('controller_v2.py');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeA.trim() || !codeB.trim()) {
      setError('Please provide code snippets for both modules in order to perform duplication analysis.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('devreview_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          codeA,
          codeB,
          fileAName,
          fileBName
        })
      });

      if (!res.ok) {
        throw new Error('Comparison failed.');
      }

      const analysis = await res.json();
      setResult(analysis);
    } catch (err: any) {
      setError('Duplication comparison service is briefly offline.');
    } finally {
      setLoading(false);
    }
  };

  const loadSamples = () => {
    setFileAName('hash_handler.py');
    setFileBName('hash_helper_v2.py');
    
    setCodeA(`import hashlib\n\ndef generate_md5(data):\n    # Core crypto logic\n    m = hashlib.md5()\n    m.update(data.encode('utf-8'))\n    return m.hexdigest()\n\ndef process_records(items):\n    result = []\n    for item in items:\n        processed = generate_md5(item)\n        result.append(processed)\n    return result`);
    
    setCodeB(`import hashlib\n\ndef compute_md5_hash(data):\n    # Shared copy of crypto\n    m = hashlib.md5()\n    m.update(data.encode('utf-8'))\n    return m.hexdigest()\n\ndef migrate_user_data(users):\n    output = []\n    for u in users:\n        val = compute_md5_hash(u)\n        output.append(val)\n    return output`);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <Columns className="h-6 w-6 text-indigo-500" />
          Code Compare & Duplication Detector
        </h2>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
          Paste two separate files side-by-side to detect duplicate algorithms, evaluate Jaccard code similarities, and spot copy-paste redundancy.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleCompare} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box A */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Module A Source</span>
                <input
                  type="text"
                  value={fileAName}
                  onChange={e => setFileAName(e.target.value)}
                  placeholder="Filename A"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <textarea
                value={codeA}
                onChange={e => setCodeA(e.target.value)}
                placeholder="Paste code module A here..."
                rows={12}
                className="w-full p-4 font-mono text-xs leading-relaxed border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
              />
            </div>

            {/* Box B */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Module B Source</span>
                <input
                  type="text"
                  value={fileBName}
                  onChange={e => setFileBName(e.target.value)}
                  placeholder="Filename B"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <textarea
                value={codeB}
                onChange={e => setCodeB(e.target.value)}
                placeholder="Paste code module B here..."
                rows={12}
                className="w-full p-4 font-mono text-xs leading-relaxed border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
              />
            </div>

          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Action button row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={loadSamples}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl transition-all"
            >
              Load Overlapping Redundancy Samples
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Comparing Code Bases...
                </>
              ) : (
                <>
                  <Columns className="h-4 w-4" />
                  Evaluate Similarity
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Results visual view */
        <div className="space-y-6">
          
          {/* Similarity score summary card */}
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className={`p-4 rounded-3xl flex items-center justify-center font-extrabold text-3xl shrink-0 ${
              result.similarity > 70 
                ? 'bg-red-500/10 text-red-500 border border-red-500/25' 
                : result.similarity > 35 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' 
                : 'bg-green-500/10 text-green-500 border border-green-500/25'
            }`}>
              {result.similarity}%
            </div>
            <div className="space-y-1 text-center md:text-left flex-1">
              <h3 className="font-sans font-bold text-lg text-gray-900 dark:text-white">Overlap Index: {result.similarity}% Duplicate Patterns</h3>
              <p className="font-sans text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {result.diffSummary}
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Reset Compare
            </button>
          </div>

          {/* Overlapping blocks sections */}
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white">Identified Duplicate Code Blocks ({result.duplicateBlocks.length})</h3>
            
            {result.duplicateBlocks.length === 0 ? (
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                Zero consecutive copy-paste blocks detected. Code structure is unique!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {result.duplicateBlocks.map((block, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 border border-red-500/20 dark:border-red-500/10 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-red-500/[0.03] dark:bg-red-500/[0.01] border-b border-red-500/10 text-xs font-semibold text-red-600">
                      <span className="flex items-center gap-1.5 font-sans font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        Redundant Block {idx + 1}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {result.fileAName} (Lines {block.startLineA}-{block.endLineA}) ⇄ {result.fileBName} (Lines {block.startLineB}-{block.endLineB})
                      </span>
                    </div>
                    <pre className="p-4 font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50/20 dark:bg-gray-950/10 overflow-x-auto">
                      {block.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-side view box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* File A Reviewer container */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm h-[400px] flex flex-col">
              <div className="px-4 py-2.5 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <FileCode className="h-4 w-4" />
                {result.fileAName}
              </div>
              <div className="p-4 overflow-auto font-mono text-[11px] bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                {result.fileACode.split('\n').map((l, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 shrink-0 text-right text-gray-400 pr-3 select-none font-semibold border-r border-gray-100 dark:border-gray-900 mr-3">{i + 1}</span>
                    <pre className="flex-1 whitespace-pre">{l || ' '}</pre>
                  </div>
                ))}
              </div>
            </div>

            {/* File B Reviewer container */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm h-[400px] flex flex-col">
              <div className="px-4 py-2.5 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <FileCode className="h-4 w-4" />
                {result.fileBName}
              </div>
              <div className="p-4 overflow-auto font-mono text-[11px] bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                {result.fileBCode.split('\n').map((l, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 shrink-0 text-right text-gray-400 pr-3 select-none font-semibold border-r border-gray-100 dark:border-gray-900 mr-3">{i + 1}</span>
                    <pre className="flex-1 whitespace-pre">{l || ' '}</pre>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
