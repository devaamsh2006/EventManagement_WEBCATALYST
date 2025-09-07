"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Loader2,
  TrendingUp,
  Star,
  Award,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface UserEvent {
  registrationId: number;
  registeredAt: string;
  attendanceStatus: string;
  eventId: number;
  title: string;
  description?: string;
  venue: string;
  date: string;
  time: string;
  bannerImageUrl?: string;
  maxAttendees: number;
  organizerId: number;
  eventCreatedAt: string;
  eventUpdatedAt: string;
  isActive: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"events" | "profile" | "stats">("events");
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatarUrl: ""
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Load user's events and profile
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's registered events  
        const eventsRes = await fetch(`/api/users/${currentUser.id}/events`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setUserEvents(eventsData);
        } else {
          toast.error("Failed to load your events");
        }

        // Fetch user profile
        const profileRes = await fetch(`/api/users?id=${currentUser.id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setProfileForm({
            name: profileData.name,
            email: profileData.email,
            avatarUrl: profileData.avatarUrl || ""
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser.id]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(`/api/users?id=${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          avatarUrl: profileForm.avatarUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        
        // Update localStorage
        const updatedUser = { ...currentUser, ...updatedProfile };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return userEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && event.isActive;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPastEvents = () => {
    const now = new Date();
    return userEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStats = () => {
    const totalEvents = userEvents.length;
    const upcomingEvents = getUpcomingEvents().length;
    const attendedEvents = userEvents.filter(e => e.attendanceStatus === "present").length;
    const missedEvents = userEvents.filter(e => e.attendanceStatus === "absent").length;
    const attendanceRate = totalEvents > 0 ? Math.round((attendedEvents / totalEvents) * 100) : 0;
    
    return {
      totalEvents,
      upcomingEvents,
      attendedEvents,
      missedEvents,
      attendanceRate
    };
  };

  const stats = getStats();
  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="text-lg">
                {profile?.name.split(" ").map(n => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Welcome back, {profile?.name.split(" ")[0] || "User"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your events and manage your profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <User className="h-3 w-3 mr-1" />
              Attendee
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attended</p>
                <p className="text-2xl font-bold">{stats.attendedEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted/30 p-1 rounded-xl glass border-0">
        <Button
          variant={activeTab === "events" ? "default" : "ghost"}
          onClick={() => setActiveTab("events")}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-2" />
          My Events
        </Button>
        <Button
          variant={activeTab === "stats" ? "default" : "ghost"}
          onClick={() => setActiveTab("stats")}
          className="flex-1"
        >
          <Award className="h-4 w-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant={activeTab === "profile" ? "default" : "ghost"}
          onClick={() => setActiveTab("profile")}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Upcoming Events ({upcomingEvents.length})
            </h2>
            
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.registrationId} className="glass border-0 card-hover">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Event Banner */}
                        <div className="w-full lg:w-32 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {event.bannerImageUrl ? (
                            <img 
                              src={event.bannerImageUrl} 
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Calendar className="h-8 w-8 text-blue-400" />
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30">
                              Registered
                            </Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue}</span>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Registered on {formatDate(event.registeredAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass border-0">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">
                    Explore the events page to discover and register for upcoming events
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Events */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Past Events ({pastEvents.length})
            </h2>
            
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pastEvents.map((event) => (
                  <Card key={event.registrationId} className="glass border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Event Banner */}
                        <div className="w-full lg:w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {event.bannerImageUrl ? (
                            <img 
                              src={event.bannerImageUrl} 
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg opacity-75"
                            />
                          ) : (
                            <Calendar className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-muted-foreground">{event.title}</h3>
                            <Badge variant={
                              event.attendanceStatus === "present" ? "default" :
                              event.attendanceStatus === "absent" ? "destructive" :
                              "secondary"
                            }>
                              {event.attendanceStatus === "present" ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />Attended</>
                              ) : event.attendanceStatus === "absent" ? (
                                <><XCircle className="h-3 w-3 mr-1" />Missed</>
                              ) : (
                                <><AlertCircle className="h-3 w-3 mr-1" />Pending</>
                              )}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass border-0">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No past events</h3>
                  <p className="text-muted-foreground">
                    Your completed events will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Overview */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Events Attended</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{stats.attendedEvents}</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Events Missed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{stats.missedEvents}</span>
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</span>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance Progress</span>
                  <span>{stats.attendanceRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badges */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.totalEvents >= 1 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">First Event</p>
                    <p className="text-sm text-muted-foreground">Registered for your first event</p>
                  </div>
                </div>
              )}

              {stats.attendedEvents >= 3 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Active Attendee</p>
                    <p className="text-sm text-muted-foreground">Attended 3+ events</p>
                  </div>
                </div>
              )}

              {stats.attendanceRate >= 80 && stats.totalEvents >= 2 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Reliable Attendee</p>
                    <p className="text-sm text-muted-foreground">80%+ attendance rate</p>
                  </div>
                </div>
              )}

              {stats.totalEvents === 0 && (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Register for events to unlock achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "profile" && (
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileForm.avatarUrl || profile?.avatarUrl} />
                  <AvatarFallback className="text-xl">
                    {profileForm.name.split(" ").map(n => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Member since {profile && formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="pl-10 bg-background/50 border-border/50"
                      disabled={updating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      value={profileForm.email}
                      placeholder="Your email address"
                      className="pl-10 bg-muted/50 border-border/50"
                      disabled={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={profileForm.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.png"
                    className="bg-background/50 border-border/50"
                    disabled={updating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a URL to your profile picture
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={updating}
                  className="w-full md:w-auto"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}