import React, { useState, useRef } from 'react';
import { Upload, FileCode2, Play, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface UploadCodeProps {
  onReviewComplete: (review: any) => void;
}

export default function UploadCode({ onReviewComplete }: UploadCodeProps) {
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { value: 'python', label: 'Python (.py)' },
    { value: 'javascript', label: 'JavaScript (.js)' },
    { value: 'typescript', label: 'TypeScript (.ts)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'cpp', label: 'C++ (.cpp, .cc)' },
    { value: 'c', label: 'C (.c)' },
    { value: 'html', label: 'HTML (.html)' },
    { value: 'css', label: 'CSS (.css)' },
    { value: 'php', label: 'PHP (.php)' },
    { value: 'rust', label: 'Rust (.rs)' },
    { value: 'golang', label: 'Go (.go)' }
  ];

  // Map file extension to standard language value
  const mapExtensionToLanguage = (ext: string): string => {
    switch (ext.toLowerCase()) {
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'java': return 'java';
      case 'cpp':
      case 'cc': return 'cpp';
      case 'c': return 'c';
      case 'html':
      case 'htm': return 'html';
      case 'css': return 'css';
      case 'php': return 'php';
      case 'rs': return 'rust';
      case 'go': return 'golang';
      default: return 'python';
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop() || '';
    setFilename(file.name);
    setLanguage(mapExtensionToLanguage(ext));
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCode(text);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const executeReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please select a file or input some code to analyze.');
      return;
    }
    
    const finalFilename = filename.trim() || `unnamed_module.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : 'txt'}`;
    setFilename(finalFilename);

    setLoading(true);
    setLoadingStage(1);
    setError('');

    // Staggered status updates for an immersive UI experience
    const stageTimer1 = setTimeout(() => setLoadingStage(2), 1200);
    const stageTimer2 = setTimeout(() => setLoadingStage(3), 2600);
    const stageTimer3 = setTimeout(() => setLoadingStage(4), 4500);

    try {
      const token = localStorage.getItem('devreview_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: finalFilename,
          language,
          code
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server rejected review parameters.');
      }

      const review = await res.json();
      
      // Complete review and trigger callback
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      onReviewComplete(review);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setError(err.message || 'Audit connection failed. Check your Gemini API Secrets configuration.');
      setLoading(false);
    }
  };

  const loadSample = () => {
    const samples: Record<string, { filename: string; code: string }> = {
      python: {
        filename: 'user_auth.py',
        code: `import sqlite3\nimport hashlib\n\ndef register_user(username, raw_password):\n    # CRITICAL: Vulnerable to SQL Injection and weak hashing!\n    cursor = sqlite3.connect("users.db").cursor()\n    \n    # Weak hash algorithm MD5\n    hashed = hashlib.md5(raw_password.encode()).hexdigest()\n    \n    query = "INSERT INTO members VALUES ('" + username + "', '" + hashed + "')"\n    cursor.execute(query)\n    print("Registered user successfully")\n    \n    # TODO: implement safe DB connection closing\n    return True`
      },
      javascript: {
        filename: 'data_parser.js',
        code: `function processDataset(items) {\n  var result = [];\n  // Performance issue: O(n^2) loop structure with nested indexes\n  for (var i = 0; i < items.length; i++) {\n    for (var j = 0; j < items.length; j++) {\n      if (items[i].id === items[j].parentId) {\n        result.push({\n          child: items[i],\n          parent: items[j]\n        });\n      }\n    }\n  }\n  return result;\n}`
      },
      typescript: {
        filename: 'memory_buffer.ts',
        code: `import fs from 'fs';\n\nexport class MemoryBuffer {\n  private cache: any = {};\n\n  // Memory leak: cache keeps accumulating items without cleanup\n  public setCache(key: string, val: any): void {\n    this.cache[key] = val;\n  }\n\n  public loadRawData(filePath: string) {\n    // Critical: Unhandled file descriptor leak if stream isn't closed\n    const stream = fs.createReadStream(filePath);\n    stream.on('data', (chunk) => {\n      this.setCache(filePath, chunk);\n    });\n  }\n}`
      }
    };

    const target = samples[language] || samples.python;
    setFilename(target.filename);
    setCode(target.code);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {loading ? (
        /* Immersive Audit Loading Screen */
        <div className="p-8 md:p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-6 max-w-2xl mx-auto">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-xl text-gray-900 dark:text-white">Analyzing Code Base</h3>
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
              {loadingStage === 1 && "Stage 1/4: Initializing sandboxed code buffers..."}
              {loadingStage === 2 && "Stage 2/4: Connecting to Gemini security auditor..."}
              {loadingStage === 3 && "Stage 3/4: Inspecting cryptographical algorithms and logic scopes..."}
              {loadingStage === 4 && "Stage 4/4: Constructing modular scorecard indicators..."}
            </p>
          </div>

          {/* Staggered progress steps */}
          <div className="flex justify-center items-center gap-1.5 pt-4">
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${loadingStage >= 1 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${loadingStage >= 2 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${loadingStage >= 3 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${loadingStage >= 4 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed font-sans italic">
            "Gemini is running O-complexity metrics, checking memory allocation limits, and auditing known vulnerability patterns."
          </p>
        </div>
      ) : (
        <form onSubmit={executeReview} className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-sans font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              Automated AI Code Auditor
            </h2>
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
              Drag and drop physical files, paste raw snippets, or run sample audits immediately.
            </p>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* File Path input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</label>
              <input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="e.g. auth_controller.py"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center space-y-2 transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20' 
                : 'border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 bg-white dark:bg-gray-900'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".py,.js,.ts,.tsx,.java,.cpp,.cc,.c,.html,.css,.php,.rs,.go"
            />
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full w-fit mx-auto">
              <Upload className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Drag & drop code file, or <span className="text-indigo-500">browse folders</span>
              </p>
              <p className="text-xs text-gray-400">
                Supports Py, JS, TS, Java, C++, C, HTML, CSS, PHP, Go, Rust up to 10MB
              </p>
            </div>
          </div>

          {/* Paste editor section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Source Code Canvas</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadSample}
                  className="px-2.5 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 rounded"
                >
                  Load Vulnerable Sample
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste raw source code here, or upload a file above to preview..."
              rows={14}
              className="w-full p-4 font-mono text-xs leading-relaxed border-0 bg-transparent text-gray-800 dark:text-gray-200 focus:ring-0 focus:outline-none resize-y"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Review Halt:</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              Analyze Code Base
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
