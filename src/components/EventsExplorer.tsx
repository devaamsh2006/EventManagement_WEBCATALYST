"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";   // ✅ QR code library
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useRef } from "react";
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
  ExternalLink,
  X
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
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // ✅ new state for ticket
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadTicket = async () => {
  if (ticketRef.current) {
    try {
      const dataUrl = await toPng(ticketRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ticket-${ticketCode}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download ticket:", error);
      toast.error("Could not download ticket. Try again.");
    }
  }
  };
  // Load events and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
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

  // Filter events
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userData.id),
          eventId: eventId,
        }),
      });

      if (response.ok) {
        const newCode = `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setTicketCode(newCode);
        toast.success("Successfully registered! 🎟 Ticket generated.");
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

  const handleShowEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
    setTicketCode(null); // reset ticket each time detail opens
  };

  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
    setSelectedEvent(null);
    setTicketCode(null);
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

  const formatDetailedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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
      {/* ... keep your hero, search, filters, grid code unchanged ... */}
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
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleShowEventDetail(event)}
                      >
                        View Details & Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
{showEventDetail && selectedEvent && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-background rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Modal Header */}
      <div className="relative p-6 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCloseEventDetail}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white pr-12">
          {selectedEvent.title}
        </h1>
      </div>

      {/* Event Banner */}
      <div className="px-6 mb-6">
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50">
          {selectedEvent.bannerImageUrl ? (
            <img 
              src={selectedEvent.bannerImageUrl} 
              alt={selectedEvent.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-blue-400" />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Event Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">
              {formatDetailedDate(selectedEvent.date)} at {selectedEvent.time}
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
            <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span className="font-medium">{selectedEvent.venue}</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Users className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{selectedEvent.maxAttendees} attendees</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              $299
            </span>
            <Badge 
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium"
            >
              Business
            </Badge>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            About This Event
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {selectedEvent.description || "A three-day intensive bootcamp covering business planning, funding strategies, market validation, product development, and scaling techniques. Includes one-on-one mentorship sessions, pitch practice, and networking with successful entrepreneurs and investors."}
          </p>
        </div>

        {/* Organizer Info */}
        {selectedEvent.organizer && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Event Organizer
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedEvent.organizer.avatarUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {selectedEvent.organizer.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedEvent.organizer.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEvent.organizer.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="space-y-3">
  {ticketCode ? (
  <div className="flex flex-col items-center space-y-4 py-4 border rounded-xl bg-gray-50 dark:bg-gray-900">
    {/* Ticket Content (QR + code) */}
    <div ref={ticketRef} className="flex flex-col items-center space-y-3">
      <QRCode value={ticketCode} size={128} />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Ticket Code: {ticketCode}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {selectedEvent.title} — {formatDetailedDate(selectedEvent.date)}
      </p>
    </div>

    {/* Download Button */}
    <Button
      onClick={handleDownloadTicket}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
    >
      <Download className="h-4 w-4" />
      Download Ticket
    </Button>

    {/* Warning Message */}
    <p className="text-xs text-red-600 dark:text-red-400 text-center max-w-xs">
      ⚠️ Please download your ticket now or take a screenshot.  
      You’ll need this QR code for entry.
    </p>
  </div>
) : (
  <Button
    onClick={() => handleRegister(selectedEvent.id)}
    disabled={!selectedEvent.isActive || registering === selectedEvent.id}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
    size="lg"
  >
    {registering === selectedEvent.id ? (
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
    ) : (
      <ArrowRight className="h-4 w-2 mr-2" />
    )}
    {registering === selectedEvent.id ? "Registering..." : "Register for Event"}
  </Button>
)}

</div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
