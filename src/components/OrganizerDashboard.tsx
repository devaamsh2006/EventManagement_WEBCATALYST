"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Settings,
  Trash2,
  Edit,
  Download,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
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
}

interface Registration {
  id: number;
  userId: number;
  eventId: number;
  registeredAt: string;
  attendanceStatus: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
}

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "attendees">("overview");
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    maxAttendees: 50,
    bannerImageUrl: ""
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Load organizer's events and registrations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizer's events
        const eventsRes = await fetch(`/api/events?organizerId=${currentUser.id}&sort=createdAt&order=desc`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }



        // Fetch all registrations for overview
        const registrationsRes = await fetch("/api/registrations?limit=100");
        if (registrationsRes.ok) {
          const registrationsData = await registrationsRes.json();
          setRegistrations(registrationsData);
          console.log(registrationsData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenerateDescription = async () => {
  if (!formData.title || !formData.venue) {
    alert("Please enter the title and venue first.");
    return;
  }

  setGenerating(true);

  try {
    const response = await fetch("/api/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        venue: formData.venue,
        date: formData.date,
        time: formData.time,
      }),
    });

    const data = await response.json();
    setFormData((prev) => ({
      ...prev,
      description: data.description,
    }));
  } catch (error) {
    console.error("Error generating description:", error);
    alert("Failed to generate description.");
  } finally {
    setGenerating(false);
  }
};


  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      venue: "",
      date: "",
      time: "",
      maxAttendees: 50,
      bannerImageUrl: ""
    });
    setEditingEvent(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.venue.trim() || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          organizerId: parseInt(currentUser.id),
          maxAttendees: parseInt(formData.maxAttendees.toString()),
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [newEvent, ...prev]);
        toast.success("Event created successfully!");
        setShowCreateForm(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Create event error:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;

    try {
      setCreating(true);

      const response = await fetch(`/api/events?id=${editingEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxAttendees: parseInt(formData.maxAttendees.toString()),
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id ? updatedEvent : event
        ));
        toast.success("Event updated successfully!");
        setShowCreateForm(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Update event error:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      venue: event.venue,
      date: event.date,
      time: event.time,
      maxAttendees: event.maxAttendees,
      bannerImageUrl: event.bannerImageUrl || ""
    });
    setShowCreateForm(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast.success("Event deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete event error:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  const loadEventAttendees = async (eventId: number, eventTitle: string) => {
  try {
    const response = await fetch(`/api/events/${eventId}/attendees`);
    if (response.ok) {
      const attendees = await response.json();
      setRegistrations(attendees);
      setSelectedEventId(eventId);
      setSelectedEventTitle(eventTitle); // ✅ save title
      setActiveTab("attendees");
    } else {
      toast.error("Failed to load attendees");
    }
  } catch (error) {
    console.error("Load attendees error:", error);
    toast.error("Failed to load attendees");
  }
};


  const updateAttendance = async (registrationId: number, status: string) => {
    try {
      const response = await fetch(`/api/registrations?id=${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceStatus: status,
        }),
      });

      if (response.ok) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === registrationId ? { ...reg, attendanceStatus: status } : reg
        ));
        toast.success(`Attendance marked as ${status}`);
      } else {
        toast.error("Failed to update attendance");
      }
    } catch (error) {
      console.error("Update attendance error:", error);
      toast.error("Failed to update attendance");
    }
  };

  const exportRegistrations = (eventId?: number) => {
    const relevantRegistrations = eventId 
      ? registrations.filter(reg => reg.eventId === eventId)
      : registrations;

    const csvContent = [
      ["Name", "Email", "Event", "Registration Date", "Attendance Status"],
      ...relevantRegistrations.map(reg => [
        reg.userName || reg.name,
        reg.userEmail || reg.email,
        reg.eventTitle,
        new Date(reg.registeredAt).toLocaleDateString(),
        reg.attendanceStatus
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${eventId || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Registration data exported successfully");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStats = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.isActive).length;
    const totalAttendees = registrations.length;
    const presentAttendees = registrations.filter(r => r.attendanceStatus === "present").length;
    
    return {
      totalEvents,
      activeEvents,
      totalAttendees,
      presentAttendees,
      attendanceRate: totalAttendees > 0 ? Math.round((presentAttendees / totalAttendees) * 100) : 0
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your events and track attendee engagement
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowCreateForm(true);
              resetForm();
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
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
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">{stats.activeEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.totalAttendees}</p>
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
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "events" ? "default" : "ghost"}
          onClick={() => setActiveTab("events")}
          className="flex-1"
        >
          My Events
        </Button>
        <Button
          variant={activeTab === "attendees" ? "default" : "ghost"}
          onClick={() => setActiveTab("attendees")}
          className="flex-1"
        >
          Attendees
        </Button>
      </div>

      {/* Create/Edit Event Form */}
      {showCreateForm && (
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Enter venue location"
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees *</Label>
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={handleInputChange}
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
                  <Input
                    id="bannerImageUrl"
                    name="bannerImageUrl"
                    value={formData.bannerImageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/banner.jpg"
                    className="bg-background/50 border-border/50"
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <div className="flex gap-2">
    <Textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder="Describe your event..."
      rows={3}
      className="bg-background/50 border-border/50 flex-1"
      disabled={creating || generating}
    />
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerateDescription}
      disabled={creating || generating}
    >
      {generating ? "Generating..." : "Generate Description"}
    </Button>
  </div>
</div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {creating 
                    ? (editingEvent ? "Updating..." : "Creating...") 
                    : (editingEvent ? "Update Event" : "Create Event")
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab Content */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Events</h2>
            <Button variant="outline" onClick={() => exportRegistrations()}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="glass border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge variant={event.isActive ? "default" : "secondary"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Max {event.maxAttendees} attendees</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadEventAttendees(event.id, event.title)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Attendees
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportRegistrations(event.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {events.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "attendees" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selectedEventId ? `Event Attendees` : "All Attendees"}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportRegistrations(selectedEventId || undefined)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="glass border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Attendee</th>
                      <th className="text-left p-4 font-medium">Event</th>
                      <th className="text-left p-4 font-medium">Registered</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="border-b border-border/30 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {/* {registration.userName.split(" ").map(n => n[0]).join("")} */}
                                {(registration.userName || registration.name || "NA").split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{(registration.userName || registration.name)}</p>
                              <p className="text-sm text-muted-foreground">{registration.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{registration.eventTitle || selectedEventTitle}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{formatDate(registration.registeredAt)}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            registration.attendanceStatus === "present" ? "default" :
                            registration.attendanceStatus === "absent" ? "destructive" :
                            "secondary"
                          }>
                            {registration.attendanceStatus}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAttendance(registration.id, "present")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAttendance(registration.id, "absent")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {registrations.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No attendees yet</h3>
                  <p className="text-muted-foreground">
                    Attendees will appear here once they register for your events
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                  <Badge variant={event.isActive ? "default" : "secondary"}>
                    {event.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No events created yet</p>
              )}
            </CardContent>
          </Card>

        
        </div>
      )}
    </div>
  );
}