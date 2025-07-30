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
  Loader2,
} from "lucide-react";
import { fetchCalendarEvents } from "@/services/api";

// Theme colors - matching the dashboard
const theme = {
  primary: "#244855", // Dark teal
  secondary: "#E64833", // Coral red
  accent: "#874F41", // Brown
  neutral: "#90AEAD", // Light teal
  light: "#FBE9D0", // Light cream
  text: {
    primary: "#2D3748", // Dark gray
    secondary: "#4A5568", // Medium gray
    light: "#718096", // Light gray
  },
  background: {
    primary: "#F7FAFC", // Very light gray
    secondary: "#EDF2F7", // Light gray
    card: "#FFFFFF", // White
  },
  border: {
    light: "#E2E8F0", // Light border
    medium: "#CBD5E0", // Medium border
    dark: "#A0AEC0", // Dark border
  },
  status: {
    success: "#48BB78",
    warning: "#ED8936",
    error: "#E53E3E",
  },
};

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

// Loading Component
const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={`${sizeClasses[size]} animate-spin`}
        style={{ color: theme.primary }}
      />
    </div>
  );
};

// Page Loading Component
const PageLoading: React.FC = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: theme.background.primary }}
  >
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p
        className="mt-4 text-lg font-medium"
        style={{ color: theme.text.secondary }}
      >
        Loading calendar events...
      </p>
    </div>
  </div>
);

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
        return {
          backgroundColor: `${theme.status.success}20`,
          color: theme.status.success,
          border: `1px solid ${theme.status.success}40`,
        };
      case "tentative":
        return {
          backgroundColor: `${theme.status.warning}20`,
          color: theme.status.warning,
          border: `1px solid ${theme.status.warning}40`,
        };
      case "cancelled":
        return {
          backgroundColor: `${theme.status.error}20`,
          color: theme.status.error,
          border: `1px solid ${theme.status.error}40`,
        };
      default:
        return {
          backgroundColor: `${theme.neutral}20`,
          color: theme.text.secondary,
          border: `1px solid ${theme.border.medium}`,
        };
    }
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return theme.status.success;
      case "declined":
        return theme.status.error;
      case "tentative":
        return theme.status.warning;
      default:
        return theme.text.light;
    }
  };

  // Memoized particles for performance
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: `${theme.neutral}20` }}
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
        />
      )),
    []
  );

  if (loading) {
    return <PageLoading />;
  }

  if (!eventsData || error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="absolute inset-0 overflow-hidden">{particles}</div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-3xl p-8 shadow-2xl text-center"
          style={{
            backgroundColor: theme.background.card,
            border: `1px solid ${theme.border.light}`,
          }}
          role="alert"
          aria-live="assertive"
        >
          <XCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: theme.status.error }}
          />
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: theme.text.primary }}
          >
            Unable to Load Events
          </h2>
          <p className="mb-6" style={{ color: theme.text.secondary }}>
            {error || "An unexpected error occurred. Please try again later."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/bots")}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              backgroundColor: theme.secondary,
              color: theme.light,
              border: `1px solid ${theme.border.dark}`,
            }}
            aria-label="Return to bots page"
          >
            Back to Bots
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ backgroundColor: theme.background.primary }}
    >
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
            className="inline-flex items-center space-x-2 transition-colors duration-200 mb-6 group"
            style={{ color: theme.text.secondary }}
            aria-label="Return to bots page"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="font-medium">Back to Bots</span>
          </motion.button>

          <div
            className="rounded-3xl p-6 shadow-2xl"
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.light}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Calendar
                    className="w-8 h-8"
                    style={{ color: theme.light }}
                  />
                </motion.div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ color: theme.text.primary }}
                  >
                    Calendar Events
                  </h1>
                  <p className="mt-1" style={{ color: theme.text.secondary }}>
                    {eventsData.message} • {eventsData.calendar_summary}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.text.primary }}
                >
                  {eventsData.total_count}
                </div>
                <div
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
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
            className="rounded-3xl p-8 shadow-2xl text-center"
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.light}`,
            }}
            role="alert"
            aria-live="polite"
          >
            <XCircle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: theme.status.error }}
            />
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: theme.text.primary }}
            >
              No Events Scheduled
            </h2>
            <p className="mb-6" style={{ color: theme.text.secondary }}>
              No upcoming events found for this calendar.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {eventsData.events.map((event, index) => {
              const startTime = formatDateTime(event.start.dateTime);
              const endTime = formatDateTime(event.end.dateTime);
              const statusStyles = getStatusColor(event.status);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group"
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.light}`,
                  }}
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
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <CalendarDays
                          className="w-6 h-6"
                          style={{ color: theme.light }}
                        />
                      </motion.div>
                      <div>
                        <h3
                          className="text-xl font-bold line-clamp-1"
                          style={{ color: theme.text.primary }}
                        >
                          {event.summary}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: theme.text.light }}
                        >
                          Event ID: {event.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={statusStyles}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{event.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div
                      className="flex items-center space-x-3"
                      style={{ color: theme.text.secondary }}
                    >
                      <Clock
                        className="w-4 h-4"
                        style={{ color: theme.primary }}
                      />
                      <div className="text-sm">
                        <div className="font-medium">{startTime.date}</div>
                        <div className="text-xs">
                          {startTime.time} - {endTime.time}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center space-x-3"
                      style={{ color: theme.text.secondary }}
                    >
                      <Users
                        className="w-4 h-4"
                        style={{ color: theme.accent }}
                      />
                      <div className="text-sm">
                        <span className="font-medium">
                          {event.attendees.length} Attendees
                        </span>
                      </div>
                    </div>

                    {event.hangoutLink && (
                      <div
                        className="flex items-center space-x-3"
                        style={{ color: theme.text.secondary }}
                      >
                        <Video
                          className="w-4 h-4"
                          style={{ color: theme.status.success }}
                        />
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
                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${theme.background.secondary}80`,
                          border: `1px solid ${theme.border.light}`,
                        }}
                      >
                        <User
                          className="w-3 h-3"
                          style={{ color: theme.text.light }}
                        />
                        <span
                          className="max-w-24 truncate"
                          style={{ color: theme.text.primary }}
                        >
                          {attendee.email.split("@")[0]}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getResponseStatusColor(
                              attendee.responseStatus
                            ),
                          }}
                        />
                      </div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div
                        className="flex items-center justify-center px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${theme.background.secondary}80`,
                          color: theme.text.secondary,
                          border: `1px solid ${theme.border.light}`,
                        }}
                      >
                        +{event.attendees.length - 3} more
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: `1px solid ${theme.border.light}` }}
                  >
                    <div
                      className="text-xs"
                      style={{ color: theme.text.light }}
                    >
                      Created: {new Date(event.created).toLocaleDateString()}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: theme.primary }}
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 w-full h-full flex items-center justify-center p-4"
              onClick={() => setSelectedEvent(null)}
              role="dialog"
              aria-labelledby="event-title"
              aria-describedby="event-details"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.light}`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <CalendarDays
                        className="w-8 h-8"
                        style={{ color: theme.light }}
                      />
                    </div>
                    <div>
                      <h2
                        id="event-title"
                        className="text-2xl font-bold"
                        style={{ color: theme.text.primary }}
                      >
                        {selectedEvent.summary}
                      </h2>
                      <p style={{ color: theme.text.secondary }}>
                        Event Details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="transition-colors p-2 rounded-lg"
                    style={{
                      backgroundColor: `${theme.background.secondary}80`,
                      border: `1px solid ${theme.border.light}`,
                      color: theme.text.light,
                    }}
                    aria-label="Close event details"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div id="event-details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: `${theme.primary}20`,
                        border: `1px solid ${theme.border.light}`,
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock
                          className="w-5 h-5"
                          style={{ color: theme.primary }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: theme.text.primary }}
                        >
                          Time
                        </span>
                      </div>
                      <div
                        className="space-y-2 text-sm"
                        style={{ color: theme.text.secondary }}
                      >
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

                    <div
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: `${theme.accent}20`,
                        border: `1px solid ${theme.border.light}`,
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Activity
                          className="w-5 h-5"
                          style={{ color: theme.accent }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: theme.text.primary }}
                        >
                          Status
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                        style={getStatusColor(selectedEvent.status)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="capitalize">
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: `${theme.neutral}20`,
                      border: `1px solid ${theme.border.light}`,
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Users
                        className="w-5 h-5"
                        style={{ color: theme.neutral }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: theme.text.primary }}
                      >
                        Attendees ({selectedEvent.attendees.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedEvent.attendees.map((attendee, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            backgroundColor: `${theme.background.card}80`,
                            border: `1px solid ${theme.border.light}`,
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <User
                              className="w-4 h-4"
                              style={{ color: theme.text.light }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme.text.primary }}
                            >
                              {attendee.email}
                            </span>
                            {attendee.organizer && (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${theme.status.warning}20`,
                                  color: theme.status.warning,
                                  border: `1px solid ${theme.border.light}`,
                                }}
                              >
                                Organizer
                              </span>
                            )}
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: getResponseStatusColor(
                                attendee.responseStatus
                              ),
                            }}
                          >
                            {attendee.responseStatus.charAt(0).toUpperCase() +
                              attendee.responseStatus.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEvent.conferenceData && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: `${theme.status.success}20`,
                        border: `1px solid ${theme.border.light}`,
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Video
                          className="w-5 h-5"
                          style={{ color: theme.status.success }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: theme.text.primary }}
                        >
                          Meeting Links
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEvent.conferenceData.entryPoints.map(
                          (entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg"
                              style={{
                                backgroundColor: `${theme.background.card}80`,
                                border: `1px solid ${theme.border.light}`,
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                {entry.entryPointType === "video" && (
                                  <Video
                                    className="w-4 h-4"
                                    style={{ color: theme.status.success }}
                                  />
                                )}
                                {entry.entryPointType === "phone" && (
                                  <Phone
                                    className="w-4 h-4"
                                    style={{ color: theme.primary }}
                                  />
                                )}
                                {entry.entryPointType === "more" && (
                                  <Link
                                    className="w-4 h-4"
                                    style={{ color: theme.accent }}
                                  />
                                )}
                                <div>
                                  <div
                                    className="text-sm font-medium"
                                    style={{ color: theme.text.primary }}
                                  >
                                    {entry.label || entry.uri}
                                  </div>
                                  {entry.pin && (
                                    <div
                                      className="text-xs"
                                      style={{ color: theme.text.secondary }}
                                    >
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
                                className="px-3 py-1 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor: theme.primary,
                                  color: theme.light,
                                  border: `1px solid ${theme.border.dark}`,
                                }}
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

                <div
                  className="mt-6 flex items-center justify-between pt-4"
                  style={{ borderTop: `1px solid ${theme.border.light}` }}
                >
                  <div className="text-xs" style={{ color: theme.text.light }}>
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
                    className="px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: theme.primary,
                      color: theme.light,
                      border: `1px solid ${theme.border.dark}`,
                    }}
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
