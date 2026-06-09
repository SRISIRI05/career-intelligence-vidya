import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, MessageSquare, Mic, MicOff, Send, 
  RefreshCw, CheckCircle, AlertCircle, Volume2, VolumeX
} from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

// Speech synthesis and recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

const MockInterview = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [role, setRole] = useState('Software Engineer');
  const [type, setType] = useState('Technical');
  const [mode, setMode] = useState('Text'); // Text or Voice
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  
  // Speech states
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Read target role from session storage
    const selectedRole = sessionStorage.getItem('selected_role');
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Browser Text-to-Speech synthesis helper
  const speak = (text) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    
    // Cancel any active utterance
    window.speechSynthesis.cancel();
    
    // Clean text: remove links or weird markdown codes
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set a premium default English voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) ||
                         voices.find(v => v.lang.startsWith('en')) || 
                         voices[0];
    
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/interview/start', { role, type });
      const { session_id, first_question } = res.data;
      
      setSessionId(session_id);
      setMessages([
        { sender: 'ai', text: first_question }
      ]);
      setInterviewStarted(true);
      
      // Auto speak the first question
      setTimeout(() => {
        speak(first_question);
      }, 500);
      
    } catch (err) {
      console.error(err);
      setError('Failed to initialize interview simulator. Ensure you are authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || userInput;
    if (!text.trim()) return;

    setUserInput('');
    setIsListening(false);
    setSubmittingAnswer(true);

    // Append user answer in logs
    setMessages(prev => [...prev, { sender: 'user', text }]);

    try {
      const res = await api.post('/interview/chat', {
        session_id: sessionId,
        user_answer: text
      });

      const { ai_response, is_finished } = res.data;
      setMessages(prev => [...prev, { sender: 'ai', text: ai_response, is_finished }]);
      
      // Speak AI follow-up
      speak(ai_response);
      
      if (is_finished) {
        // Stop any recognition
        if (recognition) recognition.stop();
      }
    } catch (err) {
      console.error(err);
      alert('Network error communicating with interview agent.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Browser Speech-to-Text Recognition handler
  const handleToggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition API is not supported by your current browser. Please use Chrome/Safari or write responses in Text mode.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      handleSendMessage(speechToText);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const res = await api.post('/interview/evaluate', { session_id: sessionId });
      sessionStorage.setItem('latest_interview_result', JSON.stringify(res.data));
      navigate('/interview-evaluation');
    } catch (err) {
      console.error(err);
      alert('Evaluation compilation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">AI Mock Interview</h1>
          <p className="text-slate-400 text-sm">Simulate face-to-face panels. Speak aloud or type your responses.</p>
        </div>
        
        {interviewStarted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              title={soundEnabled ? "Mute Speech Voice" : "Enable Speech Voice"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md text-sm transition-all flex items-center gap-1.5"
            >
              {evaluating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>Finish & Evaluate</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!interviewStarted ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <GlassCard hoverEffect={false}>
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-xs">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Target Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. Full Stack Developer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Panel Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="Technical">Technical (Coding & System Design)</option>
                    <option value="HR">HR (Career Fit & Alignment)</option>
                    <option value="Behavioral">Behavioral (STAR Method Drills)</option>
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Input Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="Text">Text Mode (Type responses)</option>
                    <option value="Voice">Voice Mode (Microphone speech)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Booting AI Hiring Managers...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Simulator Room</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Chat Simulator Room */
        <GlassCard hoverEffect={false} className="max-w-4xl mx-auto h-[500px] flex flex-col justify-between p-4 border border-white/5 relative">
          {/* Messages Log Panel */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 pr-2">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user' 
                    ? 'bg-primary-500/25 border border-primary-500/30 text-primary-300' 
                    : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                }`}>
                  {msg.sender === 'user' ? 'ME' : 'AI'}
                </div>
                
                {/* Chat bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                  msg.sender === 'user' 
                    ? 'bg-primary-500/10 border-primary-500/20 text-slate-200' 
                    : 'bg-white/5 border-white/5 text-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {submittingAnswer && (
              <div className="flex gap-3 mr-auto max-w-[80%] items-center">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold animate-pulse">AI</div>
                <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce delay-150"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* User Input actions pane */}
          <div className="p-3 border-t border-white/5 bg-dark-900/50 rounded-b-xl flex gap-3 items-center">
            {mode === 'Voice' ? (
              // Voice Input layout
              <div className="flex-1 flex gap-4 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleVoiceInput}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all
                      ${isListening 
                        ? 'bg-red-600 animate-pulse text-white shadow-red-500/30' 
                        : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20'}
                    `}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <span className="text-sm font-semibold text-slate-400">
                    {isListening ? 'Listening... Speak now!' : 'Click microphone to record your response'}
                  </span>
                </div>
                
                {/* Visualizer bars */}
                {isListening && (
                  <div className="flex gap-0.5 items-end h-5">
                    <span className="w-0.5 bg-red-400 h-2 animate-bounce"></span>
                    <span className="w-0.5 bg-red-400 h-4 animate-bounce delay-75"></span>
                    <span className="w-0.5 bg-red-400 h-5 animate-bounce delay-150"></span>
                    <span className="w-0.5 bg-red-400 h-3 animate-bounce delay-75"></span>
                    <span className="w-0.5 bg-red-400 h-1 animate-bounce"></span>
                  </div>
                )}
              </div>
            ) : (
              // Text input layout
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="flex-1 flex gap-3"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={submittingAnswer}
                  placeholder="Type your response..."
                  className="glass-input flex-1 px-4 py-3 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  disabled={submittingAnswer || !userInput.trim()}
                  className="w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-md disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default MockInterview;
