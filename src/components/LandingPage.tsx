"use client";

import { Shield, Users, Zap, Palette, Star, ArrowRight, Sparkles, Heart, Trophy } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export const LandingPage = ({ onGetStarted, onLearnMore }: LandingPageProps) => {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Enterprise-grade security with role-based access control and session management",
      gradient: "bg-gradient-purple-blue",
      color: "text-purple"
    },
    {
      icon: Users,
      title: "User Management", 
      description: "Complete user lifecycle management with registration, profiles, and permissions",
      gradient: "bg-gradient-cyan-teal",
      color: "text-teal"
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Built with Next.js 15 and modern technologies for lightning-fast load times",
      gradient: "bg-gradient-pink-orange",
      color: "text-orange"
    },
    {
      icon: Palette,
      title: "Modern UI/UX",
      description: "Beautiful, responsive design with dark mode support and accessibility features",
      gradient: "bg-gradient-indigo-purple",
      color: "text-indigo"
    }
  ];

  const testimonials = [
    {
      quote: "EventEase has transformed how we manage our corporate events. The interface is intuitive and the features are exactly what we need.",
      rating: 5,
      author: "Sarah Johnson",
      role: "Event Manager",
      avatar: "🌟"
    },
    {
      quote: "The authentication system is rock-solid and the user management features have saved us countless hours. Highly recommended!",
      rating: 5,
      author: "Michael Chen",
      role: "Tech Lead",
      avatar: "🚀"
    },
    {
      quote: "From registration to event day management, EventEase covers everything. The AI assistant is incredibly helpful too!",
      rating: 5,
      author: "Emma Davis",
      role: "Conference Organizer",
      avatar: "💼"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Users", icon: Heart, color: "text-pink" },
    { number: "500+", label: "Events Created", icon: Trophy, color: "text-orange" },
    { number: "99.9%", label: "Uptime", icon: Zap, color: "text-green" },
    { number: "24/7", label: "Support", icon: Shield, color: "text-purple" }
  ];

  return (
    <div className="landing-theme min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 75%, #f5576c 100%)', 
      color: 'var(--landing-foreground)' 
    }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">✨ Welcome to the Future of Events</span>
            </div>
          </div>
          
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Your Complete<br />
            <span className="bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Event Management
            </span><br />
            <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent">
              Platform
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Streamline your event planning with our powerful, secure, and user-friendly platform. 
            <span className="text-yellow-200 font-semibold"> Built for organizers, loved by attendees.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="group px-10 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-yellow-200 hover:text-purple-800 hover:scale-105 flex items-center gap-3 shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onLearnMore}
              className="px-10 py-4 border-2 border-white/40 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:scale-105"
            >
              Explore Features
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <Icon className={`w-8 h-8 mx-auto ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Powerful Features for Every Event
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Everything you need to create, manage, and deliver exceptional events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-3xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:border-white/40 hover:-translate-y-4 hover:scale-105"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Loved by Event Professionals
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of satisfied event organizers and attendees worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-white/90 leading-relaxed italic mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.author}</div>
                    <div className="text-white/70 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="p-12 sm:p-16 rounded-3xl backdrop-blur-sm border border-white/20 relative overflow-hidden"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Background decoration */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Events?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of event organizers who trust EventEase to deliver exceptional experiences
              </p>
              <button
                onClick={onGetStarted}
                className="group px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:scale-105 inline-flex items-center gap-3 shadow-2xl"
              >
                <Heart className="w-5 h-5" />
                Start Your Free Account
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};