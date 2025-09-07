"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Clock,
  Star,
  ArrowRight,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description?: string;
  venue: string;
  date: string;
  time: string;
  bannerImageUrl?: string;
  maxAttendees: number;
  organizerId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  organizer?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
}

export default function EventsExplorer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [registering, setRegistering] = useState<number | null>(null);

  // Load events and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch events and categories in parallel
        const [eventsRes, categoriesRes] = await Promise.all([
          fetch("/api/events?isActive=true&limit=20&sort=date&order=asc"),
          fetch("/api/categories")
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
          setFilteredEvents(eventsData);
        } else {
          throw new Error("Failed to fetch events");
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter events based on search and category
  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter (would need category mappings for full implementation)
    if (selectedCategory !== "all") {
      // For now, we'll filter based on event title keywords
      const categoryKeywords = {
        "Technology": ["tech", "ai", "programming", "code", "hackathon", "cyber", "robot"],
        "Cultural": ["cultural", "festival", "food", "international"],
        "Academic": ["seminar", "workshop", "bootcamp", "research"],
        "Sports": ["basketball", "tennis", "championship", "tournament"],
        "Arts": ["art", "exhibition", "dance", "creative", "digital"],
        "Music": ["jazz", "concert", "symphony", "music"],
        "Competition": ["competition", "championship", "contest", "pitch"]
      };

      const keywords = categoryKeywords[selectedCategory as keyof typeof categoryKeywords] || [];
      if (keywords.length > 0) {
        filtered = filtered.filter(event =>
          keywords.some(keyword =>
            event.title.toLowerCase().includes(keyword) ||
            event.description?.toLowerCase().includes(keyword)
          )
        );
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory]);

  const handleRegister = async (eventId: number) => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Please log in to register for events");
      return;
    }

    try {
      const userData = JSON.parse(user);
      setRegistering(eventId);

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userData.id),
          eventId: eventId,
        }),
      });

      if (response.ok) {
        toast.success("Successfully registered for the event!");
      } else {
        const error = await response.json();
        if (error.code === "DUPLICATE_REGISTRATION") {
          toast.info("You're already registered for this event");
        } else if (error.code === "EVENT_CAPACITY_EXCEEDED") {
          toast.error("Event is full. Registration closed.");
        } else {
          toast.error(error.error || "Failed to register for event");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegistering(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/30 dark:from-slate-900/50 dark:to-slate-800/30 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join workshops, festivals, seminars, and competitions happening around you. 
            Connect with your community and expand your horizons.
          </p>
          
          {/* Search and Filter Bar */}
          <div className="glass rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, venues, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-foreground"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-full"
            >
              All Events
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="rounded-full"
                style={{
                  backgroundColor: selectedCategory === category.name ? category.color : undefined,
                  borderColor: category.color,
                  color: selectedCategory === category.name ? "white" : category.color
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Check back later for upcoming events"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="glass card-hover border-0 overflow-hidden">
                  {/* Event Banner */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50">
                    {event.bannerImageUrl ? (
                      <img 
                        src={event.bannerImageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-blue-700">
                        {event.isActive ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
                        {event.title}
                      </CardTitle>
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {event.maxAttendees} attendees</span>
                      </div>
                    </div>

                    {/* Organizer */}
                    {event.organizer && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={event.organizer.avatarUrl} />
                          <AvatarFallback>
                            {event.organizer.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          by {event.organizer.name}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleRegister(event.id)}
                        disabled={!event.isActive || registering === event.id}
                        className="flex-1"
                        size="sm"
                      >
                        {registering === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        {registering === event.id ? "Registering..." : "Register"}
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}