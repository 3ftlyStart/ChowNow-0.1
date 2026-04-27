
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, DollarSign, Flame, Mic, MicOff } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToNono } from '../services/geminiService';

interface NonoAssistantProps {
  onPostToInstagram?: (caption: string, topic: string) => void;
}

export const NonoAssistant: React.FC<NonoAssistantProps> = ({ onPostToInstagram }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I\'m Nono! 🍔 Curious about our ChowNow specials? Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const processMessage = async (text: string) => {
    if (isLoading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToNono(text, messages);
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    processMessage(input);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Logic handled by onend usually, but we can force stop if we had ref
      return; 
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome!");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Optional: Auto-send if high confidence? Let's just fill input for now.
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickPrompts = [
    { text: "Suggest a meal under $10", icon: <DollarSign size={12} />, label: "Under $10" },
    { text: "I want something spicy!", icon: <Flame size={12} />, label: "Spicy" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden border border-gray-100 flex flex-col animate-fade-in-up" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-red to-orange-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold font-display">Ask Nono</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <Sparkles size={10} /> AI Powered
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-red text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-tl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {!isLoading && (
            <div className="px-4 pb-2 pt-1 flex gap-2 overflow-x-auto bg-gray-50 no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => processMessage(prompt.text)}
                  className="flex items-center gap-1 whitespace-nowrap bg-white hover:bg-brand-yellow/20 hover:text-brand-dark hover:border-brand-yellow text-gray-600 text-xs px-3 py-1.5 rounded-full transition border border-gray-200 shadow-sm"
                >
                  {prompt.icon} {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form 
              onSubmit={handleSend}
              className="flex items-center gap-2"
            >
               <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Suggest a meal..."}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-brand-red text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-brand-yellow hover:bg-yellow-400 text-brand-dark p-4 rounded-full shadow-xl transition transform hover:scale-110 flex items-center justify-center group"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} className="group-hover:animate-pulse" />}
      </button>
    </div>
  );
};
