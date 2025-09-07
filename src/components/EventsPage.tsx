import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import EventsExplorer from '@/components/EventsExplorer';

export const EventsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      {/* Header Section */}
      <div className="glass border-b">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link 
              href="/" 
              className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Events</span>
          </nav>

          {/* Page Title */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight">
              Discover Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore amazing events happening around you. From conferences to workshops, 
              find the perfect experience that matches your interests.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <EventsExplorer />
      </div>
    </div>
  );
};