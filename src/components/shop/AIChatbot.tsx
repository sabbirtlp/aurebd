"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Aurea BD. I am your personal skincare concierge. How may I assist your beauty journey today? ✨" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I apologize, my connection to the Aurea network is weak. Please try again in a moment." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-[9999] font-sans" style={{ bottom: '24px', right: '24px' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="nm-card flex flex-col overflow-hidden"
            style={{ 
              marginBottom: '1rem', 
              width: '380px', 
              maxWidth: '90vw', 
              height: '550px',
              border: '1px solid var(--border)',
              background: 'var(--bg-color)'
            }}
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between" style={{ background: 'var(--primary)', color: 'white' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase m-0">Aurea Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-tighter">Online • Concierge</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-1 bg-transparent border-none text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4"
              style={{ background: 'var(--bg-color)' }}
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'text-white rounded-tr-none' 
                      : 'text-gray-800 shadow-sm border rounded-tl-none'
                  }`}
                  style={{
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--nm-light)',
                    borderColor: m.role === 'assistant' ? 'var(--border)' : 'transparent',
                    color: m.role === 'user' ? 'white' : 'var(--text-dark)'
                  }}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl rounded-tl-none border shadow-sm" style={{ background: 'var(--nm-light)', borderColor: 'var(--border)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--primary)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ background: 'var(--bg-color)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 rounded-2xl p-2 px-4 nm-inset transition-colors" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                  style={{ color: 'var(--text-dark)' }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2 border-none rounded-xl hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center mt-3 uppercase tracking-widest font-black opacity-30">
                Powered by Aurea Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="btn-nm flex items-center justify-center p-0"
        style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%',
          background: isOpen ? 'var(--bg-color)' : 'var(--primary)',
          color: isOpen ? 'var(--primary)' : 'white',
          boxShadow: isOpen ? 'var(--nm-inner-pressed)' : 'var(--nm-outer-raised)',
          border: '1px solid var(--border)'
        }}
      >
        {isOpen ? <X className="w-7 h-7" /> : (
          <div className="relative">
            <MessageSquare className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2" style={{ borderColor: 'var(--primary)' }}></span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
