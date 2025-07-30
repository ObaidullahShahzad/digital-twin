import { useState, useEffect } from "react";
import { User, Mail, Bot, Save, Settings } from "lucide-react";
import { fetchUserSettings, updateUserProfile } from "@/services/api";
import Image from "next/image";

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

interface ProfileData {
  name: string;
  email: string;
  botName: string;
  enableBackendTasks: boolean;
  profileImage: string | null;
}

const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-3 border-t-transparent rounded-full animate-spin`}
      style={{
        borderColor: theme.neutral,
        borderTopColor: "transparent",
      }}
    />
  );
};

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

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    botName: "",
    enableBackendTasks: true,
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await fetchUserSettings();
        setProfileData({
          name: settings.full_name,
          email: settings.email,
          botName: settings.bot_name,
          enableBackendTasks: settings.enable_backend_tasks,
          profileImage: settings.profile_picture,
        });
      } catch (error) {
        console.error("Failed to load user settings:", error);
        showToast("Failed to load profile data. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    const toast = document.createElement("div");
    const bgColor =
      type === "success" ? theme.status.success : theme.status.error;

    toast.className = `fixed top-6 right-1/2 -translate-x-1/2 px-6 py-4 rounded-xl text-white z-50 shadow-2xl transform transition-all duration-300 translate-x-full opacity-0`;
    toast.style.backgroundColor = bgColor;
    toast.style.backdropFilter = "blur(10px)";

    const icon = type === "success" ? "✓" : "✗";
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-lg font-semibold">${icon}</span>
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    }, 100);

    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      toast.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  const handleInputChange = (
    field: keyof ProfileData,
    value: string | boolean
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!profileData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    if (!profileData.botName.trim()) {
      showToast("Bot name is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        full_name: profileData.name,
        bot_name: profileData.botName,
        enable_backend_tasks: profileData.enableBackendTasks,
      });
      showToast("Profile updated successfully!", "success");
      console.log("Profile data saved:", profileData);
    } catch (error) {
      console.error("Failed to save profile:", error);
      showToast("Failed to save profile. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="" style={{ backgroundColor: theme.background.primary }}>
      <div className=" mx-auto">
        <div
          className="opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]"
          style={{
            backgroundColor: theme.background.card,
            borderColor: theme.border.light,
          }}
        >
          <div
            className="rounded-2xl shadow-2xl border backdrop-blur-sm overflow-hidden"
            style={{
              backgroundColor: theme.background.card,
              borderColor: theme.border.light,
            }}
          >
            {/* Header Section */}
            <div
              className="px-8 py-12 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white transform translate-x-20 translate-y-20" />
              </div>
              <div className="relative">
                <Settings className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
                <h1 className="text-4xl font-bold text-white mb-2">
                  Profile Settings
                </h1>
                <p className="text-white/80 text-lg">
                  Customize your profile and bot preferences
                </p>
              </div>
            </div>

            <div className="p-8">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-12">
                <div className="relative group">
                  <div
                    className="w-40 h-40 rounded-full shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.neutral} 100%)`,
                    }}
                  >
                    {profileData.profileImage ? (
                      <Image
                        src={profileData.profileImage}
                        alt="Profile"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-24 h-24 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: theme.text.primary }}
                    >
                      Full Name *
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <User
                          className="w-5 h-5 transition-colors duration-200"
                          style={{ color: theme.text.light }}
                        />
                      </div>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] hover:shadow-md"
                        style={{
                          backgroundColor: theme.background.secondary,
                          borderColor: theme.border.light,
                          color: theme.text.primary,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.border.light;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: theme.text.primary }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: theme.text.light }}
                      />
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 cursor-not-allowed"
                        style={{
                          backgroundColor: theme.background.secondary,
                          borderColor: theme.border.light,
                          color: theme.text.light,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: theme.text.primary }}
                    >
                      Bot Name *
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Bot
                          className="w-5 h-5 transition-colors duration-200"
                          style={{ color: theme.text.light }}
                        />
                      </div>
                      <input
                        type="text"
                        value={profileData.botName}
                        onChange={(e) =>
                          handleInputChange("botName", e.target.value)
                        }
                        placeholder="Enter your bot's name"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] hover:shadow-md"
                        style={{
                          backgroundColor: theme.background.secondary,
                          borderColor: theme.border.light,
                          color: theme.text.primary,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.border.light;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <p
                      className="text-xs mt-2"
                      style={{ color: theme.text.light }}
                    >
                      This will be the display name for your bot
                    </p>
                  </div>
                </div>
              </div>

              {/* Bot Preferences Section */}
              <div
                className="p-8 rounded-2xl mb-8"
                style={{ backgroundColor: theme.light }}
              >
                <h3
                  className="text-xl font-bold mb-6 flex items-center"
                  style={{ color: theme.text.primary }}
                >
                  <Bot
                    className="w-6 h-6 mr-3"
                    style={{ color: theme.primary }}
                  />
                  Bot Preferences
                </h3>
                <div
                  className="p-6 rounded-xl border-2"
                  style={{
                    backgroundColor: theme.background.card,
                    borderColor: theme.border.light,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="font-semibold text-lg mb-1"
                        style={{ color: theme.text.primary }}
                      >
                        Background Tasks
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        Enable your bot to perform background operations
                        automatically
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profileData.enableBackendTasks}
                        onChange={(e) =>
                          handleInputChange(
                            "enableBackendTasks",
                            e.target.checked
                          )
                        }
                      />
                      <div
                        className="w-14 h-8 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"
                        style={{
                          backgroundColor: profileData.enableBackendTasks
                            ? theme.primary
                            : theme.border.medium,
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className={`flex items-center space-x-3 px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 text-white text-lg ${
                    isLoading
                      ? "cursor-not-allowed opacity-70"
                      : "hover:scale-105 hover:shadow-2xl transform"
                  }`}
                  style={{
                    background: isLoading ? theme.primary : theme.primary,
                  }}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
