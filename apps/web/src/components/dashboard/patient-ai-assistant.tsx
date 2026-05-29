"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, AlertCircle, X, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export function PatientAiAssistant() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    {
      role: "ai",
      content: "Hello! I am your AI Health Assistant. You can ask me general questions about diseases, conditions, or medications. How can I help you today?",
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;

    const userMessage = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      // Get the token securely from your auth store logic
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const response = await fetch("http://localhost:5000/api/ai/patient-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: userMessage })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setMessages(prev => [...prev, { role: "ai", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg) {
              lastMsg.content += chunk;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [
        ...prev, 
        { role: "ai", content: "Sorry, I am unable to connect right now. Please try again later." }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button 
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 shadow-xl shadow-primary/25 bg-gradient-to-tr from-violet-500 to-indigo-500 hover:shadow-primary/40 transition-shadow p-0 flex items-center justify-center"
            >
              <Bot className="w-7 h-7 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden ${
              isExpanded 
                ? "top-6 left-6 right-6 bottom-6 md:top-24 md:left-72 md:right-10 md:bottom-10" 
                : "bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-3rem)]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Health Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">Powered by AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 flex items-start gap-2 text-[10px] text-amber-600/80">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>For educational purposes only. This AI cannot diagnose or prescribe. Always consult your doctor.</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${
                    msg.role === "user" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted/50 border border-border/50 rounded-tl-sm leading-relaxed"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center bg-primary/10 text-primary border border-primary/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl p-4 bg-muted/50 border border-border/50 rounded-tl-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about a medication or symptom..."
                  className="pr-12 py-6 rounded-xl border-border/50 bg-muted/30 focus-visible:ring-primary/50"
                  disabled={isStreaming}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!query.trim() || isStreaming}
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
