import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Code, HelpCircle, ArrowRight, CheckCircle2, ChevronRight, FileSpreadsheet, MessageSquare, Terminal } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [typingText, setTypingText] = useState('');
  const typingPhrases = ['Security Auditor', 'Performance Engineer', 'Code Reviewer', 'Security Gatekeeper'];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect
  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIdx];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypingText(currentPhrase.substring(0, charIdx - 1));
        setCharIdx(prev => prev - 1);
      }, 50);
    } else {
      timer = setTimeout(() => {
        setTypingText(currentPhrase.substring(0, charIdx + 1));
        setCharIdx(prev => prev + 1);
      }, 100);
    }

    if (!isDeleting && charIdx === currentPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500); // Wait before deleting
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx(prev => (prev + 1) % typingPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx]);

  const faqs = [
    {
      q: 'Which programming languages are supported?',
      a: 'We fully support automated analysis for Python, JavaScript, TypeScript, Java, C++, C, HTML, CSS, PHP, and Rust. Gemini can analyze syntax, idioms, security and performance bottlenecks across all these environments.'
    },
    {
      q: 'How does the security analysis work?',
      a: 'Our review engine queries Gemini with custom high-precision audit templates to identify insecure dependencies, SQL injections, XSS vulnerabilities, sensitive credentials exposure, and permission misconfigurations. Remediation snippets are generated automatically.'
    },
    {
      q: 'Can I export reports as PDFs?',
      a: 'Yes, every completed review creates a professional audit report showing overall scores, severity metrics, detailed line-by-line recommendations, and structural optimizations that can be printed or saved directly as PDF.'
    },
    {
      q: 'What is the "Code Compare" tool?',
      a: 'The side-by-side code compare feature analyzes two independent source code files, identifies structural overlap, computes code duplication rates, and highlights redundant blocks of code.'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* Decorative Grid Patterns & Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Zap className="h-3 w-3 fill-current" />
              <span>Next-Generation Automated Audits</span>
            </div>
            
            <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-gray-900 dark:text-white">
              AI-Based Code <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                Review Assistant
              </span>
            </h1>

            <p className="font-sans text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0">
              Upload your code and receive instant AI-powered insights on quality, security, performance, and best practices. Your personal <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{typingText || '\u00A0'}</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="hero-start-review"
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Start Reviewing
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all text-center"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Floating Interactive Code Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
            
            {/* Mock Editor Window */}
            <div className="relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-gray-400 text-[10px]">main.py</span>
                <Terminal className="h-4 w-4 text-gray-400" />
              </div>
              <div className="p-4 space-y-2">
                <div><span className="text-pink-500">import</span> hashlib</div>
                <div><span className="text-pink-500">def</span> <span className="text-blue-500">store_password</span>(user_input):</div>
                <div className="pl-4 text-red-500 bg-red-500/5 border-l-2 border-red-500 py-0.5">
                  <span className="text-gray-400"># CRITICAL: MD5 is broken</span><br />
                  hash_val = hashlib.md5(user_input).hexdigest()
                </div>
                <div className="pl-4"><span className="text-indigo-500">return</span> hash_val</div>
                
                {/* AI Overlay Suggestion popup */}
                <div className="mt-4 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-sans font-semibold text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="h-4 w-4" />
                    Security Issue Found
                  </div>
                  <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Vulnerability: Weak hashing. MD5 is collision-prone. Use PBKDF2, bcrypt, or SHA-256 with salt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="font-sans font-bold text-3xl sm:text-4xl tracking-tight text-gray-900 dark:text-white">
              Enterprise Code Intelligence
            </h2>
            <p className="font-sans text-gray-600 dark:text-gray-400">
              DevReview uses custom context models to provide deeper logic reviews than standard static AST checkers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 border border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl space-y-4 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 hover:bg-white dark:hover:bg-gray-950 transition-all duration-200">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-gray-900 dark:text-white">Security Vulnerabilities</h3>
              <p className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Detect injections, weak crypto, credential exposure, unsafe dependency flows, and permission defects instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl space-y-4 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 hover:bg-white dark:hover:bg-gray-950 transition-all duration-200">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-gray-900 dark:text-white">Performance Auditing</h3>
              <p className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Pinpoint nested algorithm loops, unnecessary database calls, memory leak structures, and file handle failures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl space-y-4 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 hover:bg-white dark:hover:bg-gray-950 transition-all duration-200">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-gray-900 dark:text-white">Code Smells & Styling</h3>
              <p className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Get suggestions on file modularity, DRY violations, formatting consistency, descriptive variable naming, and dead code removal.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-sans font-bold text-3xl sm:text-4xl tracking-tight text-gray-900 dark:text-white">
            The Code Quality Loop
          </h2>
          <p className="font-sans text-gray-600 dark:text-gray-400">
            Four simple steps to elevate your repository’s security, stability, and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Upload & Select', desc: 'Drag-and-drop or paste code files directly in the browser editor.' },
            { step: '02', title: 'Deep AI Audit', desc: 'Gemini reviews quality indices, security protocols, and memory patterns.' },
            { step: '03', title: 'Inspect Report', desc: 'Read precise severity lists, annotated line suggestion tags, and overall indexes.' },
            { step: '04', title: 'Chat & Refactor', desc: 'Use our real-time interactive tutor sidebar to generate custom fixes instantly.' }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
                {item.step}
              </span>
              <h3 className="font-sans font-semibold text-base text-gray-900 dark:text-white pt-2">{item.title}</h3>
              <p className="font-sans text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans font-bold text-3xl tracking-tight text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="font-sans text-gray-600 dark:text-gray-400">
              Clear answers to the most common inquiries about DevReview.AI.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-sans font-semibold text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-90 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 font-sans text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-900/40 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-violet-700 text-white p-8 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
          
          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl tracking-tight leading-tight">
              Ready to Secure and Optimize Your Codebase?
            </h2>
            <p className="font-sans text-indigo-100 text-base md:text-lg max-w-xl mx-auto">
              Join thousands of developers getting real-time structural audits, memory optimizations, and security patches in seconds.
            </p>
            <div className="pt-4">
              <button
                id="cta-start-review"
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-indigo-600 bg-white hover:bg-indigo-50 rounded-2xl shadow-xl transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                Get Started For Free
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
                <Code className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                DevReview<span className="text-indigo-500">.AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Automated artificial intelligence code reviews focusing on deep vulnerability identification and performance analysis.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider mb-3">Supported Languages</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <li>Python & PHP</li>
              <li>TypeScript & JavaScript</li>
              <li>Java, C++, and C</li>
              <li>HTML & CSS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider mb-3">Security Controls</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <li>Vulnerability Check</li>
              <li>Input Sanitization</li>
              <li>SQLi and XSS Audits</li>
              <li>Cryptographic Auditing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider mb-3">DevReview.AI</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Crafted as a professional SaaS showcase, offering continuous repository intelligence.
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4">
              &copy; {new Date().getFullYear()} DevReview.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
