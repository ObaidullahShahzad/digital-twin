"use client";

import { useState, useEffect, JSX } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bot,
  Settings,
  LogOut,
  Search,
  Users,
  Calendar,
  Sparkles,
  Video,
  Loader2,
  Link,
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/services/auth";
import CalendarEventsDisplay from "../calender/calender";
import ProfileSettings from "../settings/ProfileSettings";
import {
  fetchBots,
  setupGmail,
  fetchMeetings,
  fetchComprehensiveAnalysis,
  fetchSentimentAnalysis,
  startMeetingWorkflow,
} from "@/services/api";

// Dynamically import ToastContainer to prevent hydration mismatch
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

// Theme colors
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

// Define interfaces
interface RecordingConfig {
  transcript?: {
    provider: string | { meeting_captions: Record<string, unknown> };
  };
  audio_mixed_raw?: Record<string, unknown>;
  realtime_endpoints?: unknown[];
  retention?: { type: string };
  video_mixed_layout?: string;
  video_mixed_mp4?: Record<string, unknown>;
  participant_events?: Record<string, unknown>;
  meeting_metadata?: Record<string, unknown>;
  video_mixed_participant_video_when_screenshare?: string;
  start_recording_on?: string;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  calendar_id: string | undefined;
  status?: "active" | "inactive";
  recording_config?: RecordingConfig;
}

interface Meeting {
  id: string;
  bot_id?: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  meeting_url: string;
  transcript: string;
  summary: string;
  user_id: string;
}
interface SentimentAnalysisResponse {
  success: boolean;
  bot_id: string;
  user_sentiments: {
    [key: string]: {
      name: string;
      sentiment_analysis: {
        overall_sentiment: string;
        sentiment_score: number;
        confidence_level: string;
        emotional_tone: string;
        key_indicators: string[];
        sentiment_changes: string;
        professional_assessment: string;
        engagement_level: string;
      };
      total_contributions: number;
      speaking_stats: {
        name: string;
        is_host: boolean;
        platform: string;
        total_words: number;
        total_speaking_time: number;
      };
    };
  };
  total_participants: number;
  generated_at: string;
}
interface ComprehensiveAnalysisResponse {
  success: boolean;
  comprehensive_analysis?: string;
  participants?: string[];
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
        Loading...
      </p>
    </div>
  </div>
);

// Modal Component for Meeting Link
const MeetingLinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onJoin: (url: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onJoin, isLoading }) => {
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleJoin = () => {
    if (meetingUrl.trim()) {
      onJoin(meetingUrl);
    } else {
      toast.error("Please enter a valid meeting URL");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.medium}`,
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Join Meeting
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ border: `1px solid ${theme.border.light}` }}
              >
                <X
                  className="w-6 h-6"
                  style={{ color: theme.text.secondary }}
                />
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text.secondary }}
              >
                Meeting URL
              </label>
              <input
                type="text"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="Enter meeting URL"
                className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                style={{
                  backgroundColor: theme.background.secondary,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.light}`,
                }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: theme.background.secondary,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.light}`,
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={isLoading || !meetingUrl.trim()}
                className="px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.primary,
                  color: "white",
                  border: `1px solid ${theme.primary}`,
                }}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Join Meeting"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal Component for Comprehensive Analysis
const ComprehensiveAnalysisModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  analysis: ComprehensiveAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}> = ({ isOpen, onClose, analysis, isLoading, error }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.medium}`,
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Comprehensive Analysis
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ border: `1px solid ${theme.border.light}` }}
              >
                <X
                  className="w-6 h-6"
                  style={{ color: theme.text.secondary }}
                />
              </button>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div
                  className="h-6 rounded w-3/4 mb-4"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-full mb-2"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-5/6 mb-2"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-2/3"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
              </div>
            ) : error ? (
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: `${theme.status.error}15`,
                  color: theme.status.error,
                }}
              >
                {error}
                <p className="mt-2 text-sm">
                  Please try again or contact support.
                </p>
              </div>
            ) : analysis ? (
              <div
                className="space-y-6 overflow-y-scroll max-h-[კ
                [500px]"
              >
                <div>
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Analysis
                  </h3>
                  <p
                    className="whitespace-pre-wrap"
                    style={{ color: theme.text.secondary }}
                  >
                    {analysis.comprehensive_analysis ?? "No analysis available"}
                  </p>
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Participants
                  </h3>
                  <ul
                    className="list-disc pl-5"
                    style={{ color: theme.text.secondary }}
                  >
                    {analysis.participants?.map((participant, index) => (
                      <li key={index}>{participant}</li>
                    )) ?? <li>No participants available</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <p style={{ color: theme.text.secondary }}>
                No analysis data available.
              </p>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: theme.secondary,
                  color: "white",
                  border: `1px solid ${theme.secondary}`,
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal Component for Sentiment Analysis
const SentimentAnalysisModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  analysis: SentimentAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}> = ({ isOpen, onClose, analysis, isLoading, error }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.medium}`,
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Sentiment Analysis
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ border: `1px solid ${theme.border.light}` }}
              >
                <X
                  className="w-6 h-6"
                  style={{ color: theme.text.secondary }}
                />
              </button>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div
                  className="h-6 rounded w-3/4 mb-4"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-full mb-2"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-5/6 mb-2"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <div
                  className="h-4 rounded w-2/3"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
              </div>
            ) : error ? (
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: `${theme.status.error}15`,
                  color: theme.status.error,
                }}
              >
                {error}
                <p className="mt-2 text-sm">
                  Please try again or contact support.
                </p>
              </div>
            ) : analysis ? (
              <div className="space-y-5 overflow-y-scroll max-h-[500px]">
                {Object.values(analysis.user_sentiments).map((user, index) => (
                  <div key={index}>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: theme.text.primary }}
                    >
                      {user.name}
                    </h3>
                    <div className="space-y-2">
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Overall Sentiment:</strong>{" "}
                        {user.sentiment_analysis.overall_sentiment}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Sentiment Score:</strong>{" "}
                        {user.sentiment_analysis.sentiment_score}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Confidence Level:</strong>{" "}
                        {user.sentiment_analysis.confidence_level}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Emotional Tone:</strong>{" "}
                        {user.sentiment_analysis.emotional_tone}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Key Indicators:</strong>
                      </p>
                      <ul
                        className="list-disc pl-5"
                        style={{ color: theme.text.secondary }}
                      >
                        {user.sentiment_analysis.key_indicators.map(
                          (indicator, i) => (
                            <li key={i}>{indicator}</li>
                          )
                        )}
                      </ul>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Sentiment Changes:</strong>{" "}
                        {user.sentiment_analysis.sentiment_changes}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Professional Assessment:</strong>{" "}
                        {user.sentiment_analysis.professional_assessment}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Engagement Level:</strong>{" "}
                        {user.sentiment_analysis.engagement_level}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Total Contributions:</strong>{" "}
                        {user.total_contributions}
                      </p>
                      <p style={{ color: theme.text.secondary }}>
                        <strong>Speaking Stats:</strong>
                      </p>
                      <ul
                        className="list-disc pl-5"
                        style={{ color: theme.text.secondary }}
                      >
                        <li>Total Words: {user.speaking_stats.total_words}</li>
                        <li>
                          Total Speaking Time:{" "}
                          {user.speaking_stats.total_speaking_time.toFixed(2)}{" "}
                          seconds
                        </li>
                        <li>
                          Is Host: {user.speaking_stats.is_host ? "Yes" : "No"}
                        </li>
                        <li>Platform: {user.speaking_stats.platform}</li>
                      </ul>
                    </div>
                  </div>
                ))}
                <p style={{ color: theme.text.secondary }}>
                  <strong>Total Participants:</strong>{" "}
                  {analysis.total_participants}
                </p>
              </div>
            ) : (
              <p style={{ color: theme.text.secondary }}>
                No sentiment analysis data available.
              </p>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: theme.secondary,
                  color: "white",
                  border: `1px solid ${theme.secondary}`,
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Meetings Component
const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comprehensiveModalOpen, setComprehensiveModalOpen] = useState(false);
  const [sentimentModalOpen, setSentimentModalOpen] = useState(false);
  const [meetingLinkModalOpen, setMeetingLinkModalOpen] = useState(false);
  const [joinMeetingLoading, setJoinMeetingLoading] = useState(false);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] =
    useState<ComprehensiveAnalysisResponse | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] =
    useState<SentimentAnalysisResponse | null>(null);
  const [comprehensiveLoading, setComprehensiveLoading] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [comprehensiveError, setComprehensiveError] = useState<string | null>(
    null
  );
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeeting = async () => {
      setIsLoading(true);
      try {
        const meetingData = await fetchMeetings();
        console.log("Meeting data fetched:", meetingData);
        if (meetingData.success) {
          setMeetings(meetingData.meetings);
        } else {
          throw new Error("Failed to fetch meetings data.");
        }
      } catch (error) {
        console.error("Failed to load meeting:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeeting();
  }, []);

  const handleComprehensiveAnalysis = async (botId: string) => {
    setComprehensiveModalOpen(true);
    setComprehensiveLoading(true);
    setComprehensiveError(null);
    setComprehensiveAnalysis(null);

    try {
      const analysisData = await fetchComprehensiveAnalysis(botId);
      if (analysisData.success) {
        setComprehensiveAnalysis(analysisData);
        console.log("Comprehensive analysis data:", analysisData);
      } else {
        throw new Error("Failed to fetch comprehensive analysis.");
      }
    } catch (error) {
      console.error("Failed to load comprehensive analysis:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching comprehensive analysis.";
      setComprehensiveError(errorMessage);
    } finally {
      setComprehensiveLoading(false);
    }
  };

  const handleSentimentAnalysis = async (botId: string) => {
    setSentimentModalOpen(true);
    setSentimentLoading(true);
    setSentimentError(null);
    setSentimentAnalysis(null);

    try {
      const analysisData = await fetchSentimentAnalysis(botId);
      if (analysisData.success) {
        setSentimentAnalysis(analysisData);
        console.log("Sentiment analysis data:", analysisData);
      } else {
        throw new Error("Failed to fetch sentiment analysis.");
      }
    } catch (error) {
      console.error("Failed to load sentiment analysis:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching sentiment analysis.";
      setSentimentError(errorMessage);
    } finally {
      setSentimentLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingUrl: string) => {
    setJoinMeetingLoading(true);
    try {
      const response = await startMeetingWorkflow(meetingUrl);
      if (
        response.success ||
        response.message === "Link-based automation started"
      ) {
        toast.success("Automation workflow has started successfully!");
        setMeetingLinkModalOpen(false);
        // Refresh meetings list after joining
        const meetingData = await fetchMeetings();
        if (meetingData.success) {
          setMeetings(meetingData.meetings);
        }
      } else {
        throw new Error(
          response.message || "Failed to start meeting workflow."
        );
      }
    } catch (error) {
      console.error("Failed to start meeting workflow:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start meeting workflow.";
      toast.error(errorMessage);
    } finally {
      setJoinMeetingLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center relative z-10 space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMeetingLinkModalOpen(true)}
          className="px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          style={{
            backgroundColor: theme.primary,
            color: "white",
            border: `1px solid ${theme.primary}`,
          }}
        >
          <Link className="w-5 h-5" />
          <span>Provide Meeting Link</span>
        </motion.button>
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: `${theme.status.error}15`,
            color: theme.status.error,
          }}
        >
          {error}
          <p className="mt-2 text-sm">
            An error occurred. Please try again or contact support.
          </p>
        </motion.div>
      )}
      {meetings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Video
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: theme.neutral }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: theme.text.secondary }}
          >
            No meetings found
          </h3>
          <p className="mb-6" style={{ color: theme.text.light }}>
            You have no scheduled meetings.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden group"
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3
                            className="text-xl truncate max-w-[220px] font-semibold transition-colors"
                            style={{ color: theme.text.primary }}
                          >
                            {meeting.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center text-sm"
                        style={{ color: theme.text.light }}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {meeting.start_time
                            ? new Date(meeting.start_time).toLocaleString(
                                "en-US",
                                {
                                  timeZone: "UTC",
                                }
                              )
                            : "No start time"}
                        </span>
                      </div>
                      <a
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm transition-colors"
                        style={{ color: theme.primary }}
                      >
                        Join Meeting →
                      </a>
                    </div>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          meeting.bot_id
                            ? handleComprehensiveAnalysis(meeting.bot_id)
                            : ""
                        }
                        className="px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                        style={{
                          backgroundColor: theme.primary,
                          color: "white",
                          border: `1px solid ${theme.primary}`,
                        }}
                      >
                        <span>Comprehensive Analysis</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          meeting.bot_id
                            ? handleSentimentAnalysis(meeting.bot_id)
                            : ""
                        }
                        className="px-4 py-2 rounded-xl font-semibold shadow-lg justify-center hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                        style={{
                          backgroundColor: theme.primary,
                          color: "white",
                          border: `1px solid ${theme.primary}`,
                        }}
                      >
                        <span>Sentiment Analysis</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
      <ComprehensiveAnalysisModal
        isOpen={comprehensiveModalOpen}
        onClose={() => setComprehensiveModalOpen(false)}
        analysis={comprehensiveAnalysis}
        isLoading={comprehensiveLoading}
        error={comprehensiveError}
      />
      <SentimentAnalysisModal
        isOpen={sentimentModalOpen}
        onClose={() => setSentimentModalOpen(false)}
        analysis={sentimentAnalysis}
        isLoading={sentimentLoading}
        error={sentimentError}
      />
      <MeetingLinkModal
        isOpen={meetingLinkModalOpen}
        onClose={() => setMeetingLinkModalOpen(false)}
        onJoin={handleJoinMeeting}
        isLoading={joinMeetingLoading}
      />
    </div>
  );
};

// Settings Component
const SettingsScreen: React.FC = () => {
  return <ProfileSettings />;
};

// BotCard Component
const BotCard: React.FC<{ bot: BotData }> = ({ bot }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden group"
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${theme.border.light}`,
      }}
      onClick={() => router.push(`/bot/${bot.id}`)}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3
                className="text-xl font-semibold transition-colors"
                style={{ color: theme.text.primary }}
              >
                {bot.name}
              </h3>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center text-sm"
            style={{ color: theme.text.light }}
          >
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              {bot.calendar_id ? "Calendar Connected" : "No Calendar"}
            </span>
          </div>
          <span
            className="font-medium text-sm transition-colors"
            style={{ color: theme.primary }}
          >
            View Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const BotsDashboard: React.FC = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [activeView, setActiveView] = useState<
    "bots" | "calendar" | "settings" | "meetings"
  >("bots");
  const [searchQuery, setSearchQuery] = useState("");
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { signOut } = useAuth();

  // Check screen size
  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load active view from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem("activeView") as
      | "bots"
      | "calendar"
      | "settings"
      | "meetings"
      | null;
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  // Save active view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  // Generate particles on mount
  useEffect(() => {
    const generatedParticles = Array.from({ length: 15 }, (_, i) => (
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
          duration: Math.random() * 15 + 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5,
        }}
      />
    ));
    setParticles(generatedParticles);
  }, []);

  // Fetch bots
  useEffect(() => {
    const loadBots = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching bots...");
        const data = await fetchBots();
        console.log("Bots fetched:", data);
        setBots(data);
      } catch (err: unknown) {
        console.error("Failed to fetch bots:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching bots.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadBots();
  }, []);

  // Setup Gmail on component mount
  useEffect(() => {
    const setupGmailOnMount = async () => {
      try {
        console.log("Starting Gmail setup...");
        const gmailSetupSuccess = await setupGmail();
        console.log("Gmail setup response:", gmailSetupSuccess);
        if (!gmailSetupSuccess) {
          console.log("Gmail setup error toast triggered");
        }
      } catch (error: unknown) {
        console.error("Failed to setup Gmail:", error);
        console.log("Gmail setup error toast triggered");
      }
    };
    setupGmailOnMount();
  }, []);

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    {
      icon: Bot,
      label: "Bots",
      active: activeView === "bots",
      onClick: () => setActiveView("bots"),
    },
    {
      icon: Calendar,
      label: "Calendar",
      active: activeView === "calendar",
      onClick: () => setActiveView("calendar"),
    },
    {
      icon: Video,
      label: "Meetings",
      active: activeView === "meetings",
      onClick: () => setActiveView("meetings"),
    },
    {
      icon: Settings,
      label: "Settings",
      active: activeView === "settings",
      onClick: () => setActiveView("settings"),
    },
  ];

  if (loading && activeView === "bots") {
    return <PageLoading />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: theme.background.primary }}
    >
      {isClient && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 9999 }}
        />
      )}

      {/* Animated background */}
      <div className="absolute inset-0">
        {particles}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl"
          style={{ backgroundColor: `${theme.primary}05` }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [0, -360],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 right-20 w-40 h-40 rounded-full blur-2xl"
          style={{ backgroundColor: `${theme.neutral}05` }}
        />
      </div>

      {/* Sidebar for Large Screens - Fixed */}
      {isLargeScreen && (
        <div
          className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl"
          style={{
            backgroundColor: theme.background.card,
            borderRight: `1px solid ${theme.border.light}`,
          }}
        >
          <div
            className="flex items-center justify-between p-6"
            style={{ borderBottom: `1px solid ${theme.border.light}` }}
          >
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span
                className="ml-3 text-xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Digital Twin
              </span>
            </div>
          </div>
          <nav className="mt-6 px-4">
            {sidebarItems.map((item, index) => (
              <motion.a
                key={item.label}
                href="#"
                onClick={item.onClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: item.active ? theme.primary : "transparent",
                  color: item.active ? "white" : theme.text.secondary,
                  border: `1px solid ${
                    item.active ? theme.primary : "transparent"
                  }`,
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </motion.a>
            ))}
          </nav>
          <div className="absolute bottom-6 left-4 right-4">
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/15"
              style={{
                color: theme.status.error,
                border: `1px solid ${theme.border.light}`,
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Sidebar for Small Screens - Drawer */}
      <AnimatePresence>
        {!isLargeScreen && sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl"
            style={{
              backgroundColor: theme.background.card,
              borderRight: `1px solid ${theme.border.light}`,
            }}
          >
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: `1px solid ${theme.border.light}` }}
            >
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span
                  className="ml-3 text-xl font-bold"
                  style={{ color: theme.text.primary }}
                >
                  Digital Twin
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ border: `1px solid ${theme.border.light}` }}
              >
                <X
                  className="w-5 h-5"
                  style={{ color: theme.text.secondary }}
                />
              </button>
            </div>
            <nav className="mt-6 px-4">
              {sidebarItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href="#"
                  onClick={() => {
                    item.onClick();
                    setSidebarOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: item.active
                      ? theme.primary
                      : "transparent",
                    color: item.active ? "white" : theme.text.secondary,
                    border: `1px solid ${
                      item.active ? theme.primary : "transparent"
                    }`,
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="absolute bottom-6 left-4 right-4">
              <button
                onClick={signOut}
                className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/15"
                style={{
                  color: theme.status.error,
                  border: `1px solid ${theme.border.light}`,
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={clsx("flex-1 transition-all duration-300", {
          "ml-64": isLargeScreen,
          "ml-0": !isLargeScreen,
        })}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-40 shadow-sm"
          style={{
            backgroundColor: theme.background.card,
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={clsx("p-2 rounded-lg transition-colors mr-4", {
                  hidden: isLargeScreen,
                  block: !isLargeScreen,
                })}
                style={{ border: `1px solid ${theme.border.light}` }}
              >
                <Menu
                  className="w-6 h-6"
                  style={{ color: theme.text.secondary }}
                />
              </button>
              <h1
                className="text-2xl hidden md:block font-bold"
                style={{ color: theme.text.primary }}
              >
                {activeView === "bots"
                  ? "My Bots"
                  : activeView === "calendar"
                  ? "Calendar"
                  : activeView === "meetings"
                  ? "Meetings"
                  : "Settings"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: theme.text.light }}
                />
                <input
                  type="text"
                  placeholder="Search bots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  style={{
                    backgroundColor: theme.background.secondary,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.light}`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {activeView === "bots" ? (
            <>
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl mb-6"
                  style={{
                    backgroundColor: `${theme.status.error}15`,
                    color: theme.status.error,
                  }}
                >
                  {error}
                  <p className="mt-2 text-sm">
                    An error occurred. Please try again or contact support.
                  </p>
                </motion.div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-6 shadow-lg"
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: theme.text.light }}
                      >
                        Total Bots
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: theme.text.primary }}
                      >
                        {bots.length}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-6 shadow-lg"
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: theme.primary }}>
                        Active Bots
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: theme.primary }}
                      >
                        {bots.filter((bot) => bot.status === "active").length}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-6 shadow-lg"
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: theme.primary }}>
                        Inactive Bots
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: theme.primary }}
                      >
                        {bots.filter((bot) => bot.status !== "active").length}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bots Grid */}
              <div className="mb-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: theme.text.primary }}
                >
                  Your Bots {searchQuery && `(${filteredBots.length} results)`}
                </h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl p-6 shadow-lg"
                        style={{
                          backgroundColor: theme.background.card,
                          border: `1px solid ${theme.border.light}`,
                        }}
                      >
                        <div className="animate-pulse">
                          <div className="flex items-center mb-4">
                            <div
                              className="w-12 h-12 rounded-xl"
                              style={{
                                backgroundColor: theme.background.secondary,
                              }}
                            ></div>
                            <div className="ml-4">
                              <div
                                className="h-5 rounded w-24 mb-2"
                                style={{
                                  backgroundColor: theme.background.secondary,
                                }}
                              ></div>
                              <div
                                className="h-3 rounded w-16"
                                style={{
                                  backgroundColor: theme.background.secondary,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div
                            className="h-4 rounded w-full mb-2"
                            style={{
                              backgroundColor: theme.background.secondary,
                            }}
                          ></div>
                          <div
                            className="h-4 rounded w-3/4"
                            style={{
                              backgroundColor: theme.background.secondary,
                            }}
                          ></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredBots.map((bot, index) => (
                        <motion.div
                          key={bot.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <BotCard bot={bot} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {!loading && filteredBots.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <Bot
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: theme.neutral }}
                    />
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ color: theme.text.secondary }}
                    >
                      {searchQuery ? "No bots found" : "No bots yet"}
                    </h3>
                    <p className="mb-6" style={{ color: theme.text.light }}>
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Create your first bot to get started"}
                    </p>
                  </motion.div>
                )}
              </div>
            </>
          ) : activeView === "calendar" ? (
            <CalendarEventsDisplay />
          ) : activeView === "meetings" ? (
            <Meetings />
          ) : (
            <SettingsScreen />
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {!isLargeScreen && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BotsDashboard;
