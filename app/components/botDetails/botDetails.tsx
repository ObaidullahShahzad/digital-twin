// app/components/botDetails/botDetails.tsx
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
} from "lucide-react";
import { fetchBotStatus } from "@/services/api";

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

interface BotStatus {
  id: string;
  name: string;
  meeting_url: { meeting_id: string; platform: string };
  join_at: string;
  recording_config: RecordingConfig;
  status_changes: Array<{
    code: string;
    message: string | null;
    created_at: string;
    sub_code: string | null;
  }>;
  transcript_available: boolean;
}

const BotDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [bot, setBot] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setBot({
          id: data.id,
          name: data.bot_name,
          meeting_url: data.meeting_url,
          join_at: data.join_at,
          recording_config: data.recording_config,
          status_changes: data.status_changes,
          transcript_available: data.transcript_available,
        });
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

  // Enhanced animated background with gradient orbs
  const floatingOrbs = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full blur-xl opacity-20"
      style={{
        background: `linear-gradient(45deg, ${
          i % 2 === 0 ? "#3B82F6, #8B5CF6" : "#06B6D4, #10B981"
        })`,
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

  // Subtle floating particles
  const particles = Array.from({ length: 25 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/40 to-indigo-400/40 rounded-full"
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
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">{floatingOrbs}</div>
        <div className="absolute inset-0">{particles}</div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50 max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Loading Bot Details
              </h3>
              <p className="text-gray-600">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">{floatingOrbs}</div>
        <div className="absolute inset-0">{particles}</div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50 text-center max-w-md w-full mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {error ? "Something went wrong" : "Bot not found"}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error ||
              "The bot you're looking for doesn't exist or has been removed."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/bots")}
            className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bots</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const latestStatus = bot.status_changes[bot.status_changes.length - 1];
  const isActive = latestStatus.code !== "done";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0">{floatingOrbs}</div>
      <div className="absolute inset-0">{particles}</div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/bots")}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-6 group"
          >
            <motion.div
              whileHover={{ x: -4 }}
              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span className="font-medium">Back to Bots</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bot Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    {bot.name}
                  </h1>
                  <p className="text-gray-500 text-sm font-mono bg-gray-100 px-3 py-1 rounded-full">
                    ID: {bot.id}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-white" : "bg-white/70"
                    }`}
                  />
                  <span>{isActive ? "Active" : "Inactive"}</span>
                </div>
              </motion.div>
            </div>

            {/* Meeting Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <MonitorPlay className="w-5 h-5 mr-2 text-blue-600" />
                  Meeting Details
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Platform
                        </p>
                        <p className="text-gray-800 font-semibold capitalize">
                          {bot.meeting_url.platform}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Meeting ID
                        </p>
                        <p className="text-gray-800 font-semibold font-mono">
                          {bot.meeting_url.meeting_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Join Time
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {new Date(bot.join_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Configuration */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-indigo-600" />
                  Recording Configuration
                </h2>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Transcript Provider
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {typeof bot.recording_config.transcript?.provider ===
                          "string"
                            ? bot.recording_config.transcript.provider
                            : bot.recording_config.transcript?.provider
                                ?.meeting_captions
                            ? "Meeting Captions"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Video Layout
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {bot.recording_config.video_mixed_layout || "Default"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Retention
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {bot.recording_config.retention?.type || "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          bot.transcript_available
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {bot.transcript_available ? (
                          <Eye className="w-5 h-5 text-white" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Transcript Available
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {bot.transcript_available ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status History Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Status Timeline
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bot.status_changes.map((status, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-8 pb-4 last:pb-0"
                >
                  <div className="absolute left-0 top-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  {index !== bot.status_changes.length - 1 && (
                    <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gradient-to-b from-blue-200 to-transparent"></div>
                  )}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          status.code === "done"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {status.code}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(status.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {status.message || "No additional information"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BotDetail;
