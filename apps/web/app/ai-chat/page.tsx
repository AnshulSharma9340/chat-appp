"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdSend } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useSearchParams } from "next/navigation";


type AIMessage = {
  role: "user" | "ai";
  content: string;
  time: string;
};
export const dynamic = 'force-dynamic';

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "ai",
      content: "Hi! Main AI Assistant hoon 🤖 Kuch bhi pucho — coding, general knowledge, ya kuch bhi!",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
const fromRoom = searchParams.get("from");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: AIMessage = {
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URL}api/bot/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();

      const aiMessage: AIMessage = {
        role: "ai",
        content: data.reply,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Kuch gadbad ho gayi 😅 Please try again!",
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push(`/chat/${fromRoom}`)}
          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <IoArrowBack size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <p className="text-white font-semibold leading-none">AI Assistant</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              {isTyping ? "typing..." : "online"}
            </p>
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg, i) => {
            const isOwn = msg.role === "user";
            return (
              <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                    🤖
                  </div>
                )}

                <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg text-sm ${
                      isOwn
                        ? "bg-indigo-600 rounded-tr-sm text-white"
                        : "bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-tl-sm text-white/90"
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-white/30 px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl bg-emerald-900/40 border border-emerald-500/20 text-white/60 text-sm">
                <span className="animate-pulse">AI is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Input Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2.5 shadow-2xl">
            <input
              type="text"
              placeholder="AI se kuch bhi pucho..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm px-2 min-w-0"
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition shadow-lg flex-shrink-0"
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdSend size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
