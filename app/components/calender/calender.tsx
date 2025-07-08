"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Activity,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Video,
  Phone,
  Link,
  CalendarDays,
  User,
} from "lucide-react";
import { fetchCalendarEvents } from "@/services/api";

// Define the structure for Calendar Event
interface Attendee {
  email: string;
  responseStatus: string;
  organizer?: boolean;
  self?: boolean;
}

interface ConferenceData {
  entryPoints: Array<{
    entryPointType: "video" | "phone" | "more";
    uri: string;
    label?: string;
    pin?: string;
    regionCode?: string;
  }>;
  conferenceSolution: {
    name: string;
    iconUri: string;
  };
  conferenceId: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location: string;
  attendees: Attendee[];
  hangoutLink?: string;
  conferenceData?: ConferenceData;
  htmlLink: string;
  status: "confirmed" | "tentative" | "cancelled";
  created: string;
  updated: string;
  meeting_urls?: string[];
}

interface CalendarApiResponse {
  success: boolean;
  calendar_id: string;
  events: CalendarEvent[];
  total_count: number;
  calendar_summary: string;
  message: string;
  filters_applied: {
    time_min: string;
    time_max: string | null;
    future_events_only: boolean;
  };
}

const CalendarEventsDisplay: React.FC = () => {
  const router = useRouter();
  const [eventsData, setEventsData] = useState<CalendarApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Validate API response
  const isValidCalendarApiResponse = useCallback(
    (data: unknown): data is CalendarApiResponse => {
      return (
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        "events" in data &&
        Array.isArray((data as { events: unknown }).events) &&
        "total_count" in data &&
        "calendar_id" in data &&
        "calendar_summary" in data &&
        "message" in data &&
        "filters_applied" in data
      );
    },
    []
  );

  // Fetch calendar events with retry logic
  const fetchCalendarData = useCallback(
    async (retries = 3): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const calendarData = await fetchCalendarEvents();
        if (!isValidCalendarApiResponse(calendarData)) {
          throw new Error("Invalid API response format");
        }
        if (!calendarData.success) {
          throw new Error(
            calendarData.message || "Failed to fetch calendar events"
          );
        }
        setEventsData(calendarData);
      } catch (err: unknown) {
        if (retries > 0) {
          console.warn(`Retrying... (${retries} attempts left)`);
          return fetchCalendarData(retries - 1);
        }
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching calendar data:", errorMessage);
        setError("Failed to load calendar events. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [isValidCalendarApiResponse]
  );

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100/80 text-green-700 border-green-200/50";
      case "tentative":
        return "bg-yellow-100/80 text-yellow-700 border-yellow-200/50";
      case "cancelled":
        return "bg-red-100/80 text-red-700 border-red-200/50";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-200/50";
    }
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-green-600";
      case "declined":
        return "text-red-600";
      case "tentative":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  // Memoized particles for performance
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      )),
    []
  );

  // Skeleton loader component
  const SkeletonEvent = () => (
    <div className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl p-6 shadow-2xl animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">{particles}</div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonEvent key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!eventsData || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">{particles}</div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl p-8 shadow-2xl text-center"
          role="alert"
          aria-live="assertive"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Events
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "An unexpected error occurred. Please try again later."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/bots")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            aria-label="Return to bots page"
          >
            Back to Bots
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">{particles}</div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/bots")}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6 group"
            aria-label="Return to bots page"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="font-medium">Back to Bots</span>
          </motion.button>

          <div className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Calendar Events
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {eventsData.message} • {eventsData.calendar_summary}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {eventsData.total_count}
                </div>
                <div className="text-sm text-gray-600">
                  {eventsData.total_count === 1 ? "Event" : "Events"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {eventsData.events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl p-8 shadow-2xl text-center"
            role="alert"
            aria-live="polite"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Events Scheduled
            </h2>
            <p className="text-gray-600 mb-6">
              No upcoming events found for this calendar.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {eventsData.events.map((event, index) => {
              const startTime = formatDateTime(event.start.dateTime);
              const endTime = formatDateTime(event.end.dateTime);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedEvent(event)}
                  role="button"
                  aria-label={`View details for ${event.summary}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
                      >
                        <CalendarDays className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                          {event.summary}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Event ID: {event.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        event.status
                      )}`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{event.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div className="text-sm">
                        <div className="font-medium">{startTime.date}</div>
                        <div className="text-xs">
                          {startTime.time} - {endTime.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <div className="text-sm">
                        <span className="font-medium">
                          {event.attendees.length} Attendees
                        </span>
                      </div>
                    </div>

                    {event.hangoutLink && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Video className="w-4 h-4 text-green-500" />
                        <div className="text-sm">
                          <span className="font-medium">
                            Google Meet Available
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.attendees.slice(0, 3).map((attendee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 bg-gray-100/80 px-3 py-1 rounded-full text-xs"
                      >
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-700 max-w-24 truncate">
                          {attendee.email.split("@")[0]}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            attendee.responseStatus === "accepted"
                              ? "bg-green-400"
                              : attendee.responseStatus === "declined"
                              ? "bg-red-400"
                              : attendee.responseStatus === "tentative"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="flex items-center justify-center bg-gray-100/80 px-3 py-1 rounded-full text-xs text-gray-600">
                        +{event.attendees.length - 3} more
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(event.created).toLocaleDateString()}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEvent(null)}
              role="dialog"
              aria-labelledby="event-title"
              aria-describedby="event-details"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="backdrop-blur-xl bg-white/95 border border-white/50 rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarDays className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2
                        id="event-title"
                        className="text-2xl font-bold text-gray-800"
                      >
                        {selectedEvent.summary}
                      </h2>
                      <p className="text-gray-600">Event Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close event details"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div id="event-details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/80 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">
                          Time
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Start:</span>{" "}
                          {formatDateTime(selectedEvent.start.dateTime).date} at{" "}
                          {formatDateTime(selectedEvent.start.dateTime).time}
                        </div>
                        <div>
                          <span className="font-medium">End:</span>{" "}
                          {formatDateTime(selectedEvent.end.dateTime).time}
                        </div>
                        <div>
                          <span className="font-medium">Timezone:</span>{" "}
                          {selectedEvent.start.timeZone}
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/80 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-gray-800">
                          Status
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          selectedEvent.status
                        )}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="capitalize">
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50/80 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">
                        Attendees ({selectedEvent.attendees.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedEvent.attendees.map((attendee, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white/60 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">
                              {attendee.email}
                            </span>
                            {attendee.organizer && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                Organizer
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-medium ${getResponseStatusColor(
                              attendee.responseStatus
                            )}`}
                          >
                            {attendee.responseStatus.charAt(0).toUpperCase() +
                              attendee.responseStatus.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEvent.conferenceData && (
                    <div className="bg-green-50/80 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <Video className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-800">
                          Meeting Links
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEvent.conferenceData.entryPoints.map(
                          (entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white/60 p-3 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                {entry.entryPointType === "video" && (
                                  <Video className="w-4 h-4 text-green-500" />
                                )}
                                {entry.entryPointType === "phone" && (
                                  <Phone className="w-4 h-4 text-blue-500" />
                                )}
                                {entry.entryPointType === "more" && (
                                  <Link className="w-4 h-4 text-purple-500" />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {entry.label || entry.uri}
                                  </div>
                                  {entry.pin && (
                                    <div className="text-xs text-gray-600">
                                      PIN: {entry.pin}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={entry.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                                aria-label={`Join meeting via ${entry.entryPointType}`}
                              >
                                Join
                              </motion.a>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div className="text-xs text-gray-500">
                    <div>
                      Created:{" "}
                      {new Date(selectedEvent.created).toLocaleString()}
                    </div>
                    <div>
                      Updated:{" "}
                      {new Date(selectedEvent.updated).toLocaleString()}
                    </div>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={selectedEvent.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    aria-label="Open event in Google Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Open in Calendar</span>
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarEventsDisplay;
