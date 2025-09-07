"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
}

interface AIChatAssistantProps {
  isOrganizer?: boolean;
  events: EventItem[]; // 🔹 pass all events here
}

export default function AIChatAssistant({ isOrganizer = false, events }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: isOrganizer 
          ? "👋 Hi Organizer! I can help you create/manage events, generate event descriptions, and handle attendee queries."
          : "👋 Hello! I can help you find events, answer registration questions, and give event details. Ask me about any event!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isOrganizer, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse = generateResponse(input.trim(), isOrganizer, events);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI response error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = (query: string, isOrganizer: boolean, events: EventItem[]): string => {
    const lowerQuery = query.toLowerCase();

    // 🔹 Event matching
    const matchedEvent = events.find(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.venue.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(e.title.toLowerCase().split(" ")[0])
    );

    if (matchedEvent) {
      return `📢 Event: ${matchedEvent.title}
📅 Date: ${matchedEvent.date} at ${matchedEvent.time}
📍 Venue: ${matchedEvent.venue}
ℹ️ ${matchedEvent.description || "No description available yet."}`;
    }

    // 🔹 Organizer: Auto-generate event description
    if (isOrganizer) {
      if (lowerQuery.startsWith("generate description")) {
        const topic = query.replace(/generate description/i, "").trim() || "event";
        return `✨ Auto-generated description for ${topic}:\nA fun and engaging ${topic} where participants can collaborate, showcase their skills, and learn from peers.`;
      }
      if (query.split(" ").length === 1) {
        return `✨ "${query}" sounds great! Here's a short description:\nAn exciting ${query} where participants come together to innovate, compete, and learn.`;
      }
    }

    // 🔹 Website FAQs
    if (lowerQuery.includes("register")) {
      return isOrganizer
        ? "📋 As an organizer, view/manage registrations in your dashboard."
        : "✅ To register, open the event page and click 'View Details & Register'. Your ticket will be generated with a QR code.";
    }

    if (lowerQuery.includes("ticket") || lowerQuery.includes("qr")) {
      return "🎟️ After registering for any event, you’ll receive an on-screen QR ticket which you can download or screenshot for entry.";
    }

    if (lowerQuery.includes("dashboard")) {
      return isOrganizer
        ? "📊 Your Organizer Dashboard shows event stats, registrations, and lets you manage attendees."
        : "📌 Your User Dashboard shows your registered events, tickets, and attendance history.";
    }

    if (lowerQuery.includes("account") || lowerQuery.includes("profile")) {
      return "👤 You can update your profile (name, avatar, preferences) in the dashboard. Email cannot be changed for security.";
    }

    if (lowerQuery.includes("help") || lowerQuery.includes("how")) {
      return isOrganizer
        ? "💡 Organizer Tips:\n• Write engaging event descriptions\n• Track registrations\n• Export attendee data\n• Promote events with clear details"
        : "🙋 You can:\n• Browse events on the homepage\n• Use filters/search\n• Register for events\n• View tickets in your dashboard";
    }

    // 🔹 Default fallback
    return "🤔 I couldn’t find details for that. Try asking about events (e.g., 'When is the coding contest?') or website features (like registration, tickets, dashboard).";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="lg"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col">
          <Card className="glass-strong border-0 shadow-2xl h-full flex flex-col">
            {/* Header */}
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      AI Assistant
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {isOrganizer ? "Organizer Helper" : "Your EventEase Guide"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50">
                              <Bot className="h-4 w-4 text-blue-600" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-muted/60 text-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === "user" ? "text-blue-100" : "text-muted-foreground"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>

                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/60 rounded-2xl px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-border/30">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about any event or feature..."
                      className="flex-1 bg-background/50 border-border/50 rounded-xl"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || loading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl px-3"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI answers based on event details & website features
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
