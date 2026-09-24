"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface LegalChatbotProps {
  contractText?: string;
  reportSummary?: string;
}

const QUICK_PROMPTS = [
  "Explain this contract in 3 bullet points",
  "What is the single highest financial risk here?",
  "Draft a polite WhatsApp message to push back",
  "Is the non-compete clause enforceable?",
];

export function LegalChatbot({
  contractText,
  reportSummary,
}: LegalChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hi! I am your ClauseGuard AI Legal Assistant. Ask me anything about your contract, or tap one of the quick questions below to get started!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeModel, setActiveModel] = useState<string>("gemini-2.5-flash-lite");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Focus input on open & support Escape to dismiss
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          contractText: contractText || "",
          reportSummary: reportSummary || "",
          chatHistory: messages,
        }),
      });

      const data = await res.json();
      if (data.model_used) {
        setActiveModel(data.model_used);
      }
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.reply || "I evaluated your contract. What other section should we check?",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "I ran into a temporary network issue. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Circular Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label="Open ClauseGuard AI Legal Assistant Chat"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2D0818] via-[#480E28] to-[#FC6C26] text-[#FFF8DF] p-0.5 shadow-2xl shadow-[#FC6C26]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-[#FC6C26] focus:ring-offset-2"
            title="Open AI Legal Assistant Chat"
          >
            <div className="w-full h-full rounded-full bg-[#1F040F] flex items-center justify-center relative">
              <MessageSquare className="w-6 h-6 text-[#FC6C26] group-hover:scale-110 transition-transform" />
              {/* Pulsing indicator */}
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#FC6C26] animate-ping" />
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#FC6C26]" />
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Window Drawer */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="ClauseGuard AI Legal Assistant Chat"
          aria-modal="true"
          className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh] bg-[#FFFDF5] rounded-3xl shadow-2xl border border-[#FC6C26]/30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Chat Window Header */}
          <div className="p-4 bg-gradient-to-r from-[#1F040F] via-[#2D0818] to-[#1F040F] text-[#FFF8DF] border-b border-[#FC6C26]/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FC6C26] to-[#68173B] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#1F040F] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#FC6C26]" />
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#FFF8DF] flex items-center gap-1.5">
                  <span>ClauseGuard AI Chat</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-[#FC6C26] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini Live ({activeModel})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat window"
                className="p-1 rounded-lg text-[#FFF8DF]/70 hover:text-white hover:bg-[#3B0D24] transition-colors focus:outline-none focus:ring-1 focus:ring-[#FC6C26]"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area with aria-live */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#FFFDF5]"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser
                        ? "bg-[#2D0818] text-[#FFF8DF]"
                        : "bg-[#FC6C26] text-[#1F040F]"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#2D0818] text-[#FFF8DF] rounded-tr-xs"
                        : "bg-[#FFF8DF] text-[#18030B] border border-[#FC6C26]/20 rounded-tl-xs shadow-2xs"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500" aria-label="Assistant is typing">
                <div className="w-6 h-6 rounded-full bg-[#FC6C26] text-[#1F040F] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#FFF8DF] border border-[#FC6C26]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div
            className="px-3 py-2 bg-[#FFF8DF] border-t border-[#FC6C26]/15 flex items-center gap-1.5 overflow-x-auto scrollbar-thin"
            role="group"
            aria-label="Quick question shortcuts"
          >
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Quick question: ${prompt}`}
                onClick={() => sendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFE8B6] border border-[#FC6C26]/25 text-[10px] font-bold text-[#2D0818] whitespace-nowrap transition-colors shrink-0 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#FC6C26]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#FC6C26]/20 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a question about your contract..."
              aria-label="Ask a question about your contract"
              className="flex-1 px-3.5 py-2 text-xs bg-[#FFFDF5] border border-[#FC6C26]/30 rounded-xl text-[#18030B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send inquiry to AI Legal Assistant"
              className="p-2 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
