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

interface AIChatAssistantProps {
  isOrganizer?: boolean;
}

export default function AIChatAssistant({ isOrganizer = false }: AIChatAssistantProps) {
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

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: isOrganizer 
          ? "👋 Hi! I'm your EventEase AI assistant. I can help you with event management, attendee questions, and organizing tips. What can I help you with today?"
          : "👋 Hello! I'm your EventEase AI assistant. I can help you find events, answer questions about registrations, and provide event details. How can I assist you today?",
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
      // Simulate AI response (replace with actual AI integration)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse = generateResponse(input.trim(), isOrganizer);
      
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

  const generateResponse = (query: string, isOrganizer: boolean): string => {
    const lowerQuery = query.toLowerCase();

    // Event-related queries
    if (lowerQuery.includes("event") || lowerQuery.includes("workshop") || lowerQuery.includes("seminar")) {
      if (isOrganizer) {
        return "As an organizer, you can create events through your dashboard. Make sure to include compelling descriptions, clear venues, and appropriate capacity limits. Would you like tips on promoting your events or managing registrations?";
      } else {
        return "You can discover events on the main page. Use the search and filter options to find events that interest you. Once you find an event, simply click 'Register' to sign up. Your registered events will appear in your dashboard.";
      }
    }

    // Registration queries
    if (lowerQuery.includes("register") || lowerQuery.includes("sign up")) {
      if (isOrganizer) {
        return "You can view all registrations for your events in the Organizer Dashboard. Track attendance, export registration data to CSV, and mark attendees as present or absent during events.";
      } else {
        return "To register for an event, browse the events page and click the 'Register' button on any event that interests you. You'll need to be logged in to register. Your registrations will be tracked in your user dashboard.";
      }
    }

    // Dashboard queries
    if (lowerQuery.includes("dashboard")) {
      if (isOrganizer) {
        return "Your Organizer Dashboard shows event statistics, lets you create/edit events, manage attendees, and export data. You can track attendance rates and view recent registrations to understand engagement.";
      } else {
        return "Your User Dashboard shows your registered events, attendance history, and achievement badges. You can also update your profile settings and track your attendance statistics.";
      }
    }

    // Account queries
    if (lowerQuery.includes("account") || lowerQuery.includes("profile")) {
      return "You can update your profile in the dashboard. Change your name, upload an avatar, and view your account statistics. Note that email addresses cannot be changed for security reasons.";
    }

    // Help queries
    if (lowerQuery.includes("help") || lowerQuery.includes("how")) {
      if (isOrganizer) {
        return "Here are some organizer tips:\n• Create engaging event descriptions\n• Set realistic capacity limits\n• Use high-quality banner images\n• Track attendance during events\n• Export data for analysis\n\nWhat specific area would you like help with?";
      } else {
        return "Here's how to get started:\n• Browse events on the home page\n• Use filters to find relevant events\n• Register for events you're interested in\n• Check your dashboard for upcoming events\n• Build your attendance streak!\n\nWhat else would you like to know?";
      }
    }

    // Default responses
    const defaultResponses = isOrganizer ? [
      "That's an interesting question! As an organizer, you might want to focus on creating engaging events and building your community. Is there a specific aspect of event management you'd like to explore?",
      "I'm here to help with your event organization needs. Whether it's about creating events, managing attendees, or understanding analytics, I'm ready to assist!",
      "Great question! For organizers, success often comes from understanding your audience and creating valuable experiences. What would you like to know more about?"
    ] : [
      "That's a great question! I'm here to help you make the most of EventEase. Whether you're looking for events or need help with registration, I'm ready to assist!",
      "Interesting! EventEase offers many opportunities to discover and participate in exciting events. What specific area would you like to explore?",
      "I'd love to help you with that! There's so much to discover on EventEase. Are you looking for specific types of events or need help with navigation?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
            {/* Chat Header */}
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
                      {isOrganizer ? "Event Management Helper" : "Your EventEase Guide"}
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
                {/* Messages Area */}
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

                {/* Input Area */}
                <div className="p-4 border-t border-border/30">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about EventEase..."
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
                    AI responses are simulated for demo purposes
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