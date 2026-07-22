import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Copy, RefreshCw, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types.ts';

interface AIChatAssistantProps {
  filename: string;
  codeSnippet: string;
  issueTitle: string;
  onClose: () => void;
}

export default function AIChatAssistant({ filename, codeSnippet, issueTitle, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with helper prompt
  useEffect(() => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `Hi! I'm your interactive AI Code Tutor. I've loaded the context for **${filename}** regarding the issue: **"${issueTitle}"**.\n\nHere is the active code segment I'm reviewing:\n\`\`\`\n${codeSnippet}\n\`\`\`\n\nHow can I help you refactor or secure this segment today? I can write full replacement code blocks, explain the math, or optimize performance.`,
        createdAt: new Date().toISOString()
      }
    ]);
  }, [codeSnippet, issueTitle, filename]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Map message lists to gemini-friendly history
      const historyPayload = messages.slice(1).map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }]
      }));

      const token = localStorage.getItem('devreview_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat/fix', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename,
          code: codeSnippet,
          issueTitle,
          userMessage: userText,
          chatHistory: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error('Tutor assistant had connection limits.');
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-tutor-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I failed to formulate a response. Make sure your GEMINI_API_KEY is configured in Secrets.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper parser to render text and stylized ``` code blocks
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code content
        const lines = part.split('\n');
        const firstLine = lines[0].replace('```', '').trim();
        const codeLines = lines.slice(1, -1).join('\n');
        
        return (
          <div key={index} className="my-3 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 text-[10px] font-semibold text-gray-500 font-sans">
              <span>{firstLine || 'REFACTORED CODE'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeLines);
                }}
                className="flex items-center gap-1 hover:text-indigo-500 text-gray-400 font-semibold"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <pre className="p-3.5 font-mono text-[11px] leading-relaxed overflow-x-auto text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950 select-text">
              {codeLines}
            </pre>
          </div>
        );
      }
      
      return (
        <p key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col transition-all duration-300 animate-slideOver">
      
      {/* Header drawer */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <div className="space-y-0.5">
            <h3 className="font-sans font-bold text-sm text-gray-900 dark:text-white">AI Tutor Assistant</h3>
            <p className="text-[10px] text-gray-400 font-medium font-sans">Interactive Code Fixing</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg transition-colors"
          title="Close panel"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Messages logs */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
      >
        {messages.map((m) => {
          const isTutor = m.sender === 'assistant';
          return (
            <div 
              key={m.id}
              className={`flex flex-col max-w-[85%] ${isTutor ? 'self-start' : 'self-end ml-auto'}`}
            >
              <div className={`p-3.5 rounded-2xl leading-5 ${
                isTutor 
                  ? 'bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 text-gray-800 dark:text-gray-300' 
                  : 'bg-indigo-600 text-white rounded-br-none'
              }`}>
                {renderMessageContent(m.text)}
              </div>
              <span className={`text-[9px] text-gray-400 mt-1 px-1 ${!isTutor ? 'text-right' : ''}`}>
                {isTutor ? 'AI Tutor' : 'Developer'} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 self-start bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-3.5 rounded-2xl text-[11px] text-gray-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            AI Tutor is formulating refactoring plan...
          </div>
        )}
      </div>

      {/* Input Form footer */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask Tutor (e.g. rewrite using secure SHA-256)..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-850 disabled:text-gray-400 rounded-xl shadow-md shadow-indigo-500/10 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
