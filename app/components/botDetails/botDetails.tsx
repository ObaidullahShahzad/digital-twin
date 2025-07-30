"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  XCircle,
  Calendar,
  MonitorPlay,
  Clock,
  Settings,
  ArrowLeft,
  Video,
  FileText,
  Shield,
  Eye,
  EyeOff,
  Users,
  Mic,
} from "lucide-react";
import { fetchBotStatus } from "@/services/api";

// Define interfaces
interface MediaShortcuts {
  transcript?: {
    data?: {
      download_url?: string;
    };
  };
}

interface Recording {
  media_shortcuts?: MediaShortcuts;
}

interface BotStatusResponse {
  bot_name: string;
  meeting_url: {
    platform: string;
    meeting_id: string;
  };
  join_at: string;
  recording_config: {
    transcript?: {
      provider?: string | { meeting_captions: Record<string, unknown> };
    };
    video_mixed_layout?: string;
    retention?: {
      type?: string;
    };
  };
  transcript_available: boolean;
  video_download_url?: string | null; // Changed from `string | undefined` to `string | null`
  meeting_summary?: string;
  recordings: Recording[];
  status_changes: {
    code: string;
    message: string | null;
    created_at: string;
    sub_code: string | null;
  }[];
  participants?: {
    debug?: string;
    name?: string;
  }[];
}

// Define the theme object
const theme = {
  primary: "#244855", // Dark teal
  secondary: "#E64833", // Coral red
  accent: "#244855", // Brown
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
  cardDark: {
    background: "#244855", // Dark background for cards
    iconBg: "#E2E8F0", // Light background for icons
    text: "#FFFFFF", // White text
    textSecondary: "#CBD5E0", // Light secondary text
  },
};

const BotDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [bot, setBot] = useState<BotStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No bot ID provided.");
      setLoading(false);
      return;
    }

    const loadBotStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBotStatus(id);
        setBot(data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch bot status.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadBotStatus();
  }, [id]);

  const floatingOrbs = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full blur-xl opacity-20"
      style={{
        background: `linear-gradient(45deg, ${
          i % 2 === 0 ? theme.primary : theme.neutral
        }, ${theme.accent})`,
        width: `${Math.random() * 200 + 100}px`,
        height: `${Math.random() * 200 + 100}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 400 - 200, 0],
        y: [0, Math.random() * 400 - 200, 0],
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: Math.random() * 20 + 20,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 5,
      }}
    />
  ));

  const particles = Array.from({ length: 25 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 rounded-full"
      style={{
        background: `linear-gradient(to-r, ${theme.neutral}40, ${theme.primary}40)`,
      }}
      animate={{
        x: [0, Math.random() * 200 - 100, 0],
        y: [0, Math.random() * 200 - 100, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: Math.random() * 25 + 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 10,
      }}
    />
  ));

  if (loading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: theme.background.primary }}
      >
        <div className="absolute inset-0">{floatingOrbs}</div>
        <div className="absolute inset-0">{particles}</div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4"
          style={{ borderColor: theme.border.light }}
        >
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-16 h-16 border-4 rounded-full"
              style={{
                borderColor: `${theme.primary}20`,
                borderTopColor: theme.primary,
              }}
            />
            <div className="text-center">
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: theme.text.primary }}
              >
                Loading Bot Details
              </h3>
              <p style={{ color: theme.text.secondary }}>
                Please wait while we fetch the information...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: theme.background.primary }}
      >
        <div className="absolute inset-0">{floatingOrbs}</div>
        <div className="absolute inset-0">{particles}</div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl text-center max-w-md w-full mx-4"
          style={{ borderColor: theme.border.light }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: `linear-gradient(to-br, ${theme.secondary}, ${theme.status.error})`,
            }}
          >
            <XCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: theme.text.primary }}
          >
            {error ? "Something went wrong" : "Bot not found"}
          </h2>
          <p
            className="mb-8 leading-relaxed"
            style={{ color: theme.text.secondary }}
          >
            {error ||
              "The bot you're looking for doesn't exist or has been removed."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/bots")}
            className="text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
            style={{
              background: `linear-gradient(to-r, ${theme.primary}, ${theme.accent})`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bots</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const transcriptUrl =
    bot?.recordings?.[0]?.media_shortcuts?.transcript?.data?.download_url ||
    null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: theme.background.primary }}
    >
      <div className="absolute inset-0">{floatingOrbs}</div>
      <div className="absolute inset-0">{particles}</div>

      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 transition-colors duration-200 mb-6 group"
            style={{
              color: theme.text.secondary,
            }}
          >
            <motion.div
              whileHover={{ x: -4 }}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
              style={{ background: theme.background.card }}
            >
              <ArrowLeft
                className="w-4 h-4"
                style={{ color: theme.text.primary }}
              />
            </motion.div>
            <span
              className="font-medium"
              style={{ color: theme.text.secondary }}
            >
              Back to Bots
            </span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Bot Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-3xl p-6 sm:p-8 shadow-2xl"
            style={{
              background: theme.background.card,
              borderColor: theme.border.light,
              borderWidth: 1,
            }}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: theme.accent,
                  }}
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    style={{ color: theme.text.primary }}
                  >
                    {bot.bot_name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Meeting Details */}
            <div className="space-y-6">
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold mb-4 flex items-center"
                  style={{ color: theme.text.primary }}
                >
                  <MonitorPlay
                    className="w-5 h-5 mr-2"
                    style={{ color: theme.primary }}
                  />
                  Meeting Details
                </h2>
                <div
                  className="p-4 sm:p-6 rounded-2xl border"
                  style={{
                    background: theme.cardDark.background,
                    borderColor: theme.border.light,
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <Settings
                          className="w-5 h-5"
                          style={{ color: theme.primary }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Platform
                        </p>
                        <p
                          className="font-semibold capitalize"
                          style={{ color: theme.cardDark.text }}
                        >
                          {bot.meeting_url.platform}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <Calendar
                          className="w-5 h-5"
                          style={{ color: theme.primary }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Meeting ID
                        </p>
                        <p
                          className="font-semibold font-mono"
                          style={{ color: theme.cardDark.text }}
                        >
                          {bot.meeting_url.meeting_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:col-span-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <Clock
                          className="w-5 h-5"
                          style={{ color: theme.primary }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Join Time
                        </p>
                        <p
                          className="font-semibold"
                          style={{ color: theme.cardDark.text }}
                        >
                          {new Date(bot.join_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Configuration */}
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold mb-4 flex items-center"
                  style={{ color: theme.text.primary }}
                >
                  <Video
                    className="w-5 h-5 mr-2"
                    style={{ color: theme.accent }}
                  />
                  Recording Configuration
                </h2>
                <div
                  className="p-4 sm:p-6 rounded-2xl border"
                  style={{
                    background: theme.cardDark.background,
                    borderColor: theme.border.light,
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <FileText
                          className="w-5 h-5"
                          style={{ color: theme.accent }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Transcript Provider
                        </p>
                        <p
                          className="font-semibold"
                          style={{ color: theme.cardDark.text }}
                        >
                          {typeof bot.recording_config.transcript?.provider ===
                          "string"
                            ? bot.recording_config.transcript.provider
                            : bot.recording_config.transcript?.provider
                                ?.meeting_captions
                            ? Object.keys(
                                bot.recording_config.transcript.provider
                                  .meeting_captions
                              ).length > 0
                              ? "Meeting Captions"
                              : "Not Available"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <Video
                          className="w-5 h-5"
                          style={{ color: theme.neutral }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Video Layout
                        </p>
                        <p
                          className="font-semibold"
                          style={{ color: theme.cardDark.text }}
                        >
                          {bot.recording_config.video_mixed_layout || "Default"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: theme.cardDark.iconBg }}
                      >
                        <Shield
                          className="w-5 h-5"
                          style={{ color: theme.secondary }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Retention
                        </p>
                        <p
                          className="font-semibold"
                          style={{ color: theme.cardDark.text }}
                        >
                          {bot.recording_config.retention?.type || "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: theme.cardDark.iconBg,
                        }}
                      >
                        {bot.transcript_available ? (
                          <Eye
                            className="w-5 h-5"
                            style={{ color: theme.status.success }}
                          />
                        ) : (
                          <EyeOff
                            className="w-5 h-5"
                            style={{ color: theme.border.dark }}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.cardDark.textSecondary }}
                        >
                          Transcript Available
                        </p>
                        <p
                          className="font-semibold"
                          style={{ color: theme.cardDark.text }}
                        >
                          {bot.transcript_available ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript Section */}
              {bot.transcript_available && transcriptUrl && (
                <div>
                  <h2
                    className="text-lg sm:text-xl font-bold mb-4 flex items-center"
                    style={{ color: theme.text.primary }}
                  >
                    <Mic
                      className="w-5 h-5 mr-2"
                      style={{ color: theme.secondary }}
                    />
                    Transcript
                  </h2>
                  <div
                    className="p-4 sm:p-6 rounded-2xl border"
                    style={{
                      background: theme.cardDark.background,
                      borderColor: theme.border.light,
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="mb-4 text-white px-6 py-2 rounded-full font-semibold shadow-lg"
                      style={{
                        background: `linear-gradient(to-r, ${theme.secondary}, ${theme.status.error})`,
                      }}
                    >
                      {showTranscript ? "Hide Transcript" : "Show Transcript"}
                    </motion.button>
                    {showTranscript && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 rounded-xl max-h-96 overflow-y-auto"
                        style={{ background: `${theme.background.card}20` }}
                      >
                        <p style={{ color: theme.cardDark.textSecondary }}>
                          {bot.meeting_summary ||
                            "No transcript text available."}
                        </p>
                        <a
                          href={transcriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block hover:underline"
                          style={{ color: theme.primary }}
                        >
                          Download Full Transcript
                        </a>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Playback */}
              {bot.video_download_url && (
                <div>
                  <h2
                    className="text-lg sm:text-xl font-bold mb-4 flex items-center"
                    style={{ color: theme.text.primary }}
                  >
                    <Video
                      className="w-5 h-5 mr-2"
                      style={{ color: theme.neutral }}
                    />
                    Meeting Recording
                  </h2>
                  <div
                    className="p-4 sm:p-6 rounded-2xl border"
                    style={{
                      background: theme.cardDark.background,
                      borderColor: theme.border.light,
                    }}
                  >
                    <div className="relative w-full h-0 pb-[56.25%]">
                      <video
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        controls
                        src={bot.video_download_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar: Status History and Participants */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl p-6 shadow-2xl space-y-6"
            style={{
              background: theme.background.card,
              borderColor: theme.border.light,
              borderWidth: 1,
            }}
          >
            {/* Status Timeline */}
            <div>
              <h2
                className="text-lg sm:text-xl font-bold mb-6 flex items-center"
                style={{ color: theme.text.primary }}
              >
                <Clock
                  className="w-5 h-5 mr-2"
                  style={{ color: theme.status.success }}
                />
                Status Timeline
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {bot.status_changes.map(
                  (
                    status: {
                      code: string;
                      message: string | null;
                      created_at: string;
                      sub_code: string | null;
                    },
                    index: number
                  ) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-8 pb-4 last:pb-0"
                    >
                      <div
                        className="absolute left-0 top-0 w-3 h-3 rounded-full"
                        style={{
                          background: `linear-gradient(to-r, ${theme.primary}, ${theme.accent})`,
                        }}
                      ></div>
                      {index !== bot.status_changes.length - 1 && (
                        <div
                          className="absolute left-1.5 top-3 w-0.5 h-full"
                          style={{
                            background: `linear-gradient(to-b, ${theme.neutral}50, transparent)`,
                          }}
                        ></div>
                      )}
                      <div
                        className="rounded-xl p-4 shadow-sm"
                        style={{ background: `${theme.background.card}80` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                status.code === "done"
                                  ? `${theme.status.error}30`
                                  : `${theme.status.success}30`,
                              color:
                                status.code === "done"
                                  ? theme.status.error
                                  : theme.status.success,
                            }}
                          >
                            {status.code}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: theme.text.light }}
                          >
                            {new Date(status.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: theme.text.secondary }}
                        >
                          {status.message || "No additional information"}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            {/* Participants Section */}
            {bot.participants && bot.participants.length > 0 && (
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold mb-4 flex items-center"
                  style={{ color: theme.text.primary }}
                >
                  <Users
                    className="w-5 h-5 mr-2"
                    style={{ color: theme.neutral }}
                  />
                  Participants
                </h2>
                <div
                  className="p-4 rounded-2xl border max-h-96 overflow-y-auto"
                  style={{
                    background: theme.cardDark.background,
                    borderColor: theme.border.light,
                  }}
                >
                  <div className="space-y-3">
                    {bot.participants.map(
                      (
                        participant: { debug?: string; name?: string },
                        index: number
                      ) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 rounded-xl"
                          style={{ background: `${theme.background.card}20` }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: theme.cardDark.iconBg }}
                          >
                            <Users
                              className="w-5 h-5"
                              style={{ color: theme.neutral }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: theme.cardDark.textSecondary }}
                            >
                              Participant {index + 1}
                            </p>
                            <p
                              className="font-semibold"
                              style={{ color: theme.cardDark.text }}
                            >
                              {participant.name ||
                                participant.debug ||
                                "Unknown"}
                            </p>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BotDetail;
