
import React, { useState } from 'react';
import { AppMode } from './types';
import { ChatInterface } from './components/ChatInterface';
import { LiveInterface } from './components/LiveInterface';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Learnix</h1>
            <div className="flex items-center space-x-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active System</p>
            </div>
          </div>
        </div>

        <nav className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setMode(AppMode.TEXT)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === AppMode.TEXT ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMode(AppMode.LIVE)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === AppMode.LIVE ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m4-8a3 3 0 01-3 3H9a3 3 0 01-3-3V5a3 3 0 116 0v6z" />
            </svg>
            <span>Live Voice</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col max-w-5xl mx-auto w-full">
        {mode === AppMode.TEXT ? <ChatInterface /> : <LiveInterface />}
      </main>

      {/* Footer Info */}
      <footer className="p-3 text-center border-t border-slate-900 bg-slate-950 flex flex-col items-center gap-1">
        <p className="text-[11px] text-slate-400 font-medium">
          Learnix by <span className="text-blue-400">Muhammed Sabith KP</span>
        </p>
        <p className="text-[9px] text-slate-600 uppercase tracking-widest">
          Powered by Gemini 3 Flash & 2.5 Live
        </p>
      </footer>
    </div>
  );
};

export default App;
