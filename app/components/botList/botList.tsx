"use client";
import { useState, useEffect, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bot,
  Settings,
  LogOut,
  Search,
  Plus,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CalendarEventsDisplay from "../calender/calender";
import { fetchBots, startWorkflow, setupGmail } from "@/services/api";
import Cookies from "js-cookie";

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
  calendar_id: string;
  recording_config?: RecordingConfig;
  status: "active" | "inactive";
}

// BotCard Component
const BotCard: React.FC<{ bot: BotData }> = ({ bot }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 border border-white/50 hover:border-blue-400/50 relative overflow-hidden group"
      onClick={() => router.push(`/bot/${bot.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {bot.name}
              </h3>
              <p className="text-gray-500 text-sm">ID: {bot.calendar_id}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              bot.status === "active"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {bot.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{bot.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Calendar Connected</span>
          </div>
          <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
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
  const [activeView, setActiveView] = useState<"bots" | "calendar">("bots");
  const [searchQuery, setSearchQuery] = useState("");
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  const router = useRouter();

  // Sign out function
  const handleSignOut = async () => {
    try {
      // Clear authentication token from cookies
      Cookies.remove("authToken");

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/");
      });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Generate particles on mount
  useEffect(() => {
    const generatedParticles = Array.from({ length: 15 }, (_, i) => (
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
          duration: Math.random() * 15 + 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5,
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
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
        const data = await fetchBots();
        setBots(data);
      } catch (err: unknown) {
        console.error("Failed to fetch bots:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching bots.";
        setError(errorMessage);
        if (errorMessage.includes("401")) {
          setError(
            `${errorMessage} Please check your NEXT_PUBLIC_AUTH_TOKEN in environment variables.`
          );
        }
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
        console.log("Starting Gmail setup..."); // Debugging log
        const gmailSetupSuccess = await setupGmail();
        console.log("Gmail setup response:", gmailSetupSuccess); // Debugging log
        if (!gmailSetupSuccess) {
          toast.error("Gmail setup failed. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          console.log("Gmail setup error toast triggered"); // Debugging log
        }
      } catch (error: unknown) {
        console.error("Failed to setup Gmail:", error);
        toast.error("Failed to setup Gmail. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        console.log("Gmail setup error toast triggered"); // Debugging log
      }
    };
    setupGmailOnMount();
  }, []);

  const handleStartWorkflow = async () => {
    try {
      console.log("Starting workflow..."); // Debugging log
      const response = await startWorkflow();
      console.log("Workflow response:", response); // Debugging log
      if (response.status === 200) {
        toast.success("Automation started successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        console.log("Success toast triggered"); // Debugging log
      }
    } catch (error: unknown) {
      console.error("Failed to start workflow:", error);
      toast.success("Automation started successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      console.log("Error toast triggered"); // Debugging log
    }
  };

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
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
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
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30">
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
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-xl"
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
          className="absolute top-1/3 right-20 w-40 h-40 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl"
        />
      </div>

      {/* Sidebar for Large Screens - Fixed */}
      {isLargeScreen && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                BotHub
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
                className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                  item.active
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </motion.a>
            ))}
          </nav>
          <div className="absolute bottom-6 left-4 right-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
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
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  BotHub
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X stroke="black" className="w-5 h-5" />
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
                  className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                    item.active
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="absolute bottom-6 left-4 right-4">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
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
        className={`flex-1 transition-all duration-300 ${
          isLargeScreen ? "ml-64" : "ml-0"
        } relative z-10`}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`${
                  isLargeScreen ? "hidden" : "block"
                } p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4`}
              >
                <Menu stroke="black" className="w-6 h-6" />
              </button>
              <h1 className="text-2xl hidden md:block font-bold text-gray-800">
                {activeView === "bots" ? "My Bots" : "Calendar"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  stroke="black"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5"
                />
                <input
                  type="text"
                  placeholder="Search bots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/60 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartWorkflow}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <span>Start Work Flow</span>
              </motion.button>
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
                  className="bg-red-100 text-red-700 p-4 rounded-xl mb-6"
                >
                  {error}
                  {error.includes("401") && (
                    <p className="mt-2 text-sm">
                      This may be due to an invalid or expired authorization
                      token. Please check your environment variables or contact
                      your API administrator.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Bots</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {bots.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Bots</p>
                      <p className="text-2xl font-bold text-green-600">
                        {bots.filter((bot) => bot.status === "active").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Inactive Bots</p>
                      <p className="text-2xl font-bold text-red-600">
                        {bots.filter((bot) => bot.status === "inactive").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bots Grid */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                        className="bg-white/60 rounded-2xl p-6 shadow-lg border border-white/50"
                      >
                        <div className="animate-pulse">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="ml-4">
                              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {searchQuery ? "No bots found" : "No bots yet"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Create your first bot to get started"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2 inline" />
                      Create New Bot
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <CalendarEventsDisplay />
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
