
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audio';

export const LiveInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close());
    }
    setIsConnected(false);
    setIsListening(false);
    
    // Cleanup audio
    if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    inputAudioCtxRef.current = null;
    outputAudioCtxRef.current = null;
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = geminiService.connectLive({
        onopen: () => {
          setIsConnected(true);
          setIsListening(true);
          
          const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioCtxRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioCtxRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), outputAudioCtxRef.current, 24000, 1);
            const source = outputAudioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioCtxRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          // Handle Interruption
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }

          // Handle Transcriptions
          if (message.serverContent?.inputTranscription) {
            currentInputTransRef.current += message.serverContent.inputTranscription.text;
          }
          if (message.serverContent?.outputTranscription) {
            currentOutputTransRef.current += message.serverContent.outputTranscription.text;
          }
          
          if (message.serverContent?.turnComplete) {
            const userText = currentInputTransRef.current;
            const modelText = currentOutputTransRef.current;
            if (userText || modelText) {
              setTranscriptions(prev => [...prev, `User: ${userText}`, `Learnix: ${modelText}`]);
            }
            currentInputTransRef.current = '';
            currentOutputTransRef.current = '';
          }
        },
        onerror: (e: any) => console.error("Live Error:", e),
        onclose: () => setIsConnected(false),
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error("Failed to start live session", err);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 space-y-8">
      <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isConnected ? 'bg-blue-600/20 voice-pulse' : 'bg-slate-800'}`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isConnected ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-700'}`}>
          {isConnected ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{isConnected ? 'Learnix is Listening...' : 'Learnix Live Voice'}</h2>
        <p className="text-slate-400 max-w-xs mx-auto">
          {isConnected ? 'Talk naturally to Learnix. Responses are generated instantly with zero delay.' : 'Experience the future of conversational AI with Learnix\'s voice-native mode.'}
        </p>
      </div>

      <button
        onClick={isConnected ? stopSession : startSession}
        className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {isConnected ? 'Stop Session' : 'Start Talking'}
      </button>

      {transcriptions.length > 0 && (
        <div className="w-full max-w-md bg-slate-800/50 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar border border-slate-700">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Live Log</p>
          {transcriptions.map((t, i) => (
            <p key={i} className="text-sm text-slate-300 mb-1">{t}</p>
          ))}
        </div>
      )}
    </div>
  );
};
