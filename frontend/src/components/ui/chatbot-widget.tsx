"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMessageCircle, IconX, IconSend, IconRobot, IconUser } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const QUICK_QUESTIONS = [
  "Làm sao đăng chuyến đi?",
  "Premium có gì khác biệt?",
  "Chính sách an toàn là gì?",
  "Cách ghép xe thế nào?"
];

export function ChatbotWidget() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If not authenticated, do not render widget
  if (!isAuthenticated) return null;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !hasFetchedHistory) {
      // Fetch history on first open
      apiClient.get('/chatbot/history').then(res => {
        if (res.data?.data) {
          setMessages(res.data.data);
        }
        setHasFetchedHistory(true);
      }).catch(err => {
        console.error("Failed to fetch chat history:", err);
      });
    }
  }, [isOpen, hasFetchedHistory]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (text.length > 500) {
      alert("Tin nhắn quá dài (tối đa 500 ký tự).");
      return;
    }

    const newMessage: ChatMessage = { role: "user", content: text };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await apiClient.post('/chatbot/message', { content: text });
      if (res.data?.data) {
        setMessages(prev => [...prev, res.data.data]);
      }
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0]; // Extract first validation error if it's an array
      }
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Hệ thống: ${errorMsg}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              drag
              dragMomentum={false}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow cursor-move active:cursor-grabbing"
            >
              <IconMessageCircle size={28} className="pointer-events-none" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-4 md:bottom-24 md:right-6 w-[350px] max-w-[calc(100vw-32px)] h-[500px] max-h-[70vh] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl z-[9999] flex flex-col border border-surface-200 dark:border-surface-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-500 text-white p-4 flex items-center justify-between cursor-move active:cursor-grabbing">
              <div className="flex items-center gap-2 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <IconRobot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Trợ lý Parago</h3>
                  <p className="text-[10px] text-primary-100">Kéo để di chuyển</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50 dark:bg-surface-900 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-500">
                    <IconMessageCircle size={32} />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>
                  
                  <div className="w-full space-y-2 mt-4">
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="w-full text-left px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-[var(--text-secondary)] hover:border-primary-500 hover:text-primary-500 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2 max-w-[85%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                        msg.role === "user" ? "bg-surface-200 text-[var(--text-secondary)]" : "bg-primary-100 text-primary-600"
                      )}>
                        {msg.role === "user" ? <IconUser size={14} /> : <IconRobot size={14} />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm whitespace-pre-wrap",
                        msg.role === "user" 
                          ? "bg-primary-500 text-white rounded-tr-sm" 
                          : msg.isError
                            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm shadow-sm"
                            : "bg-white dark:bg-surface-800 text-[var(--text-primary)] border border-surface-200 dark:border-surface-700 rounded-tl-sm shadow-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-2 max-w-[85%] mr-auto">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 mt-1">
                        <IconRobot size={14} />
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-tl-sm shadow-sm flex gap-1 items-center">
                        <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputValue);
                      }
                    }}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-[var(--text-primary)] min-h-[20px] max-h-[100px]"
                    rows={1}
                    maxLength={500}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                >
                  <IconSend size={18} />
                </button>
              </form>
              <div className="text-right mt-1 px-1">
                <span className="text-[10px] text-[var(--text-muted)]">
                  {inputValue.length}/500
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
