"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

export const AITeacherChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! 🖐️ I'm your AI English tutor. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { role: "user", text: textToSend }];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: textToSend }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.explanation || "I'm here to guide you with grammar and vocabulary!" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I can explain grammar, review your writing, and give you personalized practice tips." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between h-[420px] font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6b6b] to-[#4ecdc4] text-slate-950 flex items-center justify-center font-bold shadow-lg">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-base">AI Teacher</h3>
          <span className="text-xs text-[#4ecdc4] font-mono">Gemini 1.5 Flash • Online</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#ff6b6b] text-white rounded-br-none font-medium"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-sans"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-[#4ecdc4] animate-pulse">
              AI Teacher is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Pills matching Reference Screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
        <button
          onClick={() => handleSend("Explain grammar for current sentence")}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
        >
          Explain grammar
        </button>
        <button
          onClick={() => handleSend("Check my writing and accuracy")}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
        >
          Check my writing
        </button>
        <button
          onClick={() => handleSend("Learn new words for level A1")}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
        >
          Learn new words
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about English..."
          className="w-full p-3.5 pr-12 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6b6b] transition-colors"
        />
        <button
          onClick={() => handleSend()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#ff6b6b] text-white hover:bg-[#ff8585] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
