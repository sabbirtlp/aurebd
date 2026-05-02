"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AIChatbot.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Aurea BD. I am your personal skincare concierge. How may I assist your beauty journey today? ✨" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!mounted) return null;

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
    <div className={styles.chatbotContainer}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.chatWindow}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className={styles.titleBox}>
                  <h3>Aurea Assistant</h3>
                  <div className={styles.status}>
                    <span className={styles.statusDot}></span>
                    ONLINE • CONCIERGE
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className={styles.messageArea}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${styles.messageRow} ${m.role === 'user' ? styles.userRow : styles.assistantRow}`}
                >
                  <div className={`${styles.message} ${m.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className={styles.messageRow}>
                  <div className={`${styles.message} ${styles.assistantMessage}`}>
                    <Loader2 className={`${styles.loader} w-4 h-4`} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className={styles.inputField}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={styles.sendBtn}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className={styles.footer}>
                Powered by Aurea Intelligence
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnOpen : ''}`}
      >
        {isOpen ? <X className="w-7 h-7" /> : (
          <div className="relative">
            <MessageSquare className="w-7 h-7" />
            <div className={styles.dot}></div>
          </div>
        )}
      </motion.button>
    </div>
  );
}
