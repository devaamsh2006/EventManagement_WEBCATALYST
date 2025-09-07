"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Calendar, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Search,
  LogIn,
  LogOut,
  UserPlus,
  Loader2,
  Sparkles,
  Heart,
  Star
} from "lucide-react";
import { Toaster } from "sonner";
import { toast } from "sonner";

import { LandingPage } from "@/components/LandingPage";
import { EventsPage } from "@/components/EventsPage";
import AuthForm from "@/components/AuthForm";
import OrganizerDashboard from "@/components/OrganizerDashboard";
import UserDashboard from "@/components/UserDashboard";
import AIChatAssistant from "@/components/AIChatAssistant";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

type AppView = "home" | "events" | "auth" | "organizer" | "user";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize theme and check for existing session
  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    // Check for existing user session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView(userData.role === "admin" ? "organizer" : "user");
      } catch (error) {
        console.error("Failed to parse saved user data");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    toast.success(`Switched to ${newDarkMode ? "dark" : "light"} mode`, {
      icon: newDarkMode ? "🌙" : "☀️"
    });
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Navigate to appropriate dashboard
    setCurrentView(userData.role === "admin" ? "organizer" : "user");
    setSidebarOpen(false);
    
    toast.success(`Welcome back, ${userData.name}!`, {
      icon: "🎉",
      description: "Great to see you again!"
    });
  };

  const handleSignupSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Navigate to appropriate dashboard
    setCurrentView(userData.role === "admin" ? "organizer" : "user");
    setSidebarOpen(false);
    
    toast.success("Welcome to EventEase!", {
      icon: "✨",
      description: "Your account has been created successfully."
    });
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clean up server-side if needed
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }
    
    setUser(null);
    setCurrentView("home");
    setSidebarOpen(false);
    localStorage.removeItem("user");
    toast.success("Logged out successfully", {
      icon: "👋",
      description: "See you next time!"
    });
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-purple-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            <Sparkles className="h-6 w-6 animate-pulse mx-auto text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">EventEase</h2>
            <p className="text-muted-foreground">✨ Loading your magical experience...</p>
          </div>
        </div>
      </div>
    );
  }

  // Landing page view (no header/sidebar for clean look)
  if (currentView === "home") {
    return (
      <>
        <LandingPage 
          onGetStarted={() => navigateTo("auth")}
          onLearnMore={() => navigateTo("events")}
        />
        
        {/* Floating theme toggle for landing page */}
        <div className="fixed top-6 right-6 z-50">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme} 
            className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-110"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Floating AI Chat Assistant */}
        <AIChatAssistant 
          isOrganizer={user?.role === "admin"}
        />

        {/* Global Toast Provider */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--card-foreground))"
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/30 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo("home")}
            >
              <div className="w-12 h-12 bg-gradient-purple-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  EventEase
                </span>
                <span className="text-xs text-muted-foreground -mt-1">✨ Magical Events</span>
              </div>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl">
              <Search className="h-4 w-4 text-indigo-600" />
              <span className="ml-2 hidden md:inline text-indigo-600">Search</span>
            </Button>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme} 
              className="hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl"
            >
              {darkMode ? 
                <Sun className="h-4 w-4 text-orange-500" /> : 
                <Moon className="h-4 w-4 text-indigo-600" />
              }
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo(user.role === "admin" ? "organizer" : "user")}
                  className="hidden sm:flex hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl"
                >
                  <Avatar className="h-6 w-6 mr-2 ring-2 ring-green-500/30">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-xs bg-gradient-cyan-teal text-white">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-green-700 dark:text-green-400">{user.name.split(" ")[0]}</span>
                  {user.role === "admin" && <Star className="h-3 w-3 text-yellow-500 ml-1" />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo("auth")}
                className="hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl"
              >
                <LogIn className="h-4 w-4 text-blue-600" />
                <span className="ml-1 hidden sm:inline text-blue-600">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-72 glass-strong border-r border-border/30 z-30 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${(currentView === 'organizer' || (user && currentView === 'user')) ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
      `}>
        <nav className="p-6 space-y-3">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</h3>
          </div>

          <Button
            variant={currentView === "events" ? "default" : "ghost"}
            className={`w-full justify-start group rounded-xl transition-all duration-300 ${
              currentView === "events" 
                ? "bg-gradient-cyan-teal text-white shadow-lg" 
                : "hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
            }`}
            onClick={() => navigateTo("events")}
          >
            <Calendar className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            Discover Events
            <Sparkles className="h-3 w-3 ml-auto text-cyan-500" />
          </Button>

          {user ? (
            <>
              <Button
                variant={currentView === "user" ? "default" : "ghost"}
                className={`w-full justify-start group rounded-xl transition-all duration-300 ${
                  currentView === "user" 
                    ? "bg-gradient-pink-orange text-white shadow-lg" 
                    : "hover:bg-pink-100 dark:hover:bg-pink-900/30"
                }`}
                onClick={() => navigateTo("user")}
              >
                <User className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                My Dashboard
                <Heart className="h-3 w-3 ml-auto text-pink-500" />
              </Button>

              {user.role === "admin" && (
                <Button
                  variant={currentView === "organizer" ? "default" : "ghost"}
                  className={`w-full justify-start group rounded-xl transition-all duration-300 ${
                    currentView === "organizer" 
                      ? "bg-gradient-indigo-purple text-white shadow-lg" 
                      : "hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  }`}
                  onClick={() => navigateTo("organizer")}
                >
                  <Settings className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  Organizer Dashboard
                  <Star className="h-3 w-3 ml-auto text-yellow-500" />
                </Button>
              )}
            </>
          ) : (
            <Button
              variant={currentView === "auth" ? "default" : "ghost"}
              className={`w-full justify-start group rounded-xl transition-all duration-300 ${
                currentView === "auth" 
                  ? "bg-gradient-purple-blue text-white shadow-lg" 
                  : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
              }`}
              onClick={() => navigateTo("auth")}
            >
              <UserPlus className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
              Sign Up / Login
              <Sparkles className="h-3 w-3 ml-auto text-purple-500" />
            </Button>
          )}
        </nav>

        {/* User Profile Card in Sidebar */}
        {user && (
          <div className="absolute bottom-6 left-6 right-6">
            <Card className="glass-strong border-border/50 rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-gradient-to-r from-pink-500 to-purple-500">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-gradient-purple-blue text-white font-bold">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 rounded-lg ${
                          user.role === "admin" 
                            ? "bg-gradient-indigo-purple text-white border-transparent" 
                            : "bg-gradient-cyan-teal text-white border-transparent"
                        }`}
                      >
                        {user.role === "admin" ? "✨ Organizer" : "🎉 Attendee"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className={`
        pt-16 min-h-screen transition-all duration-300
        ${(currentView === 'organizer' || (user && currentView === 'user')) 
          ? 'lg:pl-72' 
          : ''
        }
      `}>
        <div className="p-4 lg:p-6">
          {/* Route-based Content Rendering */}
          {currentView === "events" && (
            <div className="max-w-7xl mx-auto">
              <EventsPage />
            </div>
          )}

          {currentView === "auth" && (
            <div className="max-w-md mx-auto py-8">
              <AuthForm
                onLoginSuccess={handleLoginSuccess}
                onSignupSuccess={handleSignupSuccess}
              />
            </div>
          )}

          {currentView === "organizer" && user?.role === "admin" && (
            <div className="max-w-7xl mx-auto">
              <OrganizerDashboard />
            </div>
          )}

          {currentView === "user" && user && (
            <div className="max-w-7xl mx-auto">
              <UserDashboard />
            </div>
          )}

          {/* Fallback for invalid states */}
          {((currentView === "organizer" && user?.role !== "admin") || 
            (currentView === "user" && !user)) && (
            <div className="max-w-md mx-auto py-8">
              <Card className="glass-strong border-0 rounded-3xl overflow-hidden">
                <CardHeader className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <div className="w-20 h-20 bg-gradient-purple-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <LogIn className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Access Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center p-8">
                  <p className="text-muted-foreground text-lg">
                    ✨ Please log in to access this magical area of EventEase.
                  </p>
                  <Button 
                    onClick={() => navigateTo("auth")} 
                    className="w-full bg-gradient-purple-blue hover:from-purple-600 hover:to-blue-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In to Continue
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Chat Assistant */}
      <AIChatAssistant 
        isOrganizer={user?.role === "admin"}
      />

      {/* Global Toast Provider */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--card-foreground))"
          }
        }}
      />
    </div>
  );
}