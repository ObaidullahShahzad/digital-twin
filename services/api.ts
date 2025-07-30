import Cookies from "js-cookie";

// Define interfaces (unchanged except for ComprehensiveAnalysisResponse)
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
  platform?: string | undefined;
}

interface RawBotResponse {
  bot_id: string;
  bot_name: string;
  platform: string;
  meeting_title: string;
  meeting_summary: string;
  meeting_start_time: string;
  recording_config?: RecordingConfig;
  status_changes?: Array<{
    code: string;
  }>;
}

interface BotsApiResponse {
  success: boolean;
  total_bots: number;
  bots: RawBotResponse[];
}

// types/bot.ts
export interface BotStatusResponse {
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
  video_download_url?: string | null;
  meeting_summary?: string;
  recordings: {
    media_shortcuts?: {
      transcript?: {
        data?: {
          download_url?: string;
        };
      };
    };
  }[];
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
  attendees: Array<{
    email: string;
    organizer?: boolean;
    self?: boolean;
    responseStatus: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string;
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
  };
  htmlLink: string;
  status: string;
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

interface SetupGmailResponse {
  success: boolean;
}

interface GoogleLoginResponse {
  success: boolean;
  token: string;
}

interface GoogleAuthTokenResponse {
  access_token: string;
  user_email: string;
  expires_at: string;
  message: string;
}

interface UserSettingsResponse {
  user_id: number;
  email: string;
  full_name: string;
  profile_picture: string;
  enable_backend_tasks: boolean;
  bot_name: string;
}

interface UpdateProfileResponse {
  full_name: string;
  bot_name: string;
  enable_backend_tasks: boolean;
}

interface Meeting {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  meeting_url: string;
  transcript: string;
  summary: string;
  user_id: string;
}

interface MeetingsResponse {
  success: boolean;
  meetings: Meeting[];
  total_count: number;
}

interface ComprehensiveAnalysisResponse {
  success: boolean;
  bot_id: string;
  comprehensive_analysis: string;
  meeting_statistics: Record<string, unknown>; // Fixed: Replaced `any` with `Record<string, unknown>`
  participants: string[];
  generated_at: string;
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

interface StartMeetingWorkflowResponse {
  success: boolean;
  message: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const startMeetingWorkflow = async (
  meetingUrl: string
): Promise<StartMeetingWorkflowResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("startMeetingWorkflow: Retrieved authToken:", authToken);

    const queryParams = new URLSearchParams({
      meeting_url: meetingUrl,
    });

    const response = await fetch(
      `${baseUrl}api/v1/automation/start/link/workflow?${queryParams}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: StartMeetingWorkflowResponse = await response.json();
    console.log("Meeting workflow response:", data);
    return data;
  } catch (error: unknown) {
    console.error("Failed to start meeting workflow:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while starting meeting workflow.";
    throw new Error(errorMessage);
  }
};

// Function to fetch all meetings
export const fetchMeetings = async (): Promise<MeetingsResponse> => {
  const authToken = Cookies.get("authToken");
  try {
    const response = await fetch(`${baseUrl}api/v1/automation/meetings`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MeetingsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

// Comprehensive Analysis API call
export const fetchComprehensiveAnalysis = async (
  bot_id: string
): Promise<ComprehensiveAnalysisResponse> => {
  const authToken = Cookies.get("authToken");
  try {
    const response = await fetch(
      `${baseUrl}api/v1/analysis/bot/${bot_id}/analysis/comprehensive`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ComprehensiveAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching comprehensive analysis:", error);
    throw error;
  }
};

// Sentiment Analysis API call
export const fetchSentimentAnalysis = async (
  bot_id: string
): Promise<SentimentAnalysisResponse> => {
  const authToken = Cookies.get("authToken");
  try {
    const response = await fetch(
      `${baseUrl}api/v1/analysis/bot/${bot_id}/analysis/sentiment`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SentimentAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    throw error;
  }
};

export const fetchCompleteAnalysis = async (meetingId: string) => {
  // Placeholder for complete analysis API call
  console.log("Fetching complete analysis for meeting:", meetingId);
  // Implement when API is available
};

export async function fetchGoogleAuthToken(
  session: string,
  retries = 3
): Promise<GoogleAuthTokenResponse> {
  if (!baseUrl) {
    console.error("API base URL is not defined.");
    throw new Error("API base URL is not defined.");
  }
  if (!session) {
    console.error("Session parameter is missing.");
    throw new Error("Session parameter is missing.");
  }

  const url = `${baseUrl}api/v1/auth/auth/token`;
  console.log(
    "Fetching Google auth token from:",
    url,
    "with session:",
    session
  );

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session}`,
        },
        signal: controller.signal,
      });

      console.log("Response status:", response.status, "OK:", response.ok);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "No additional error details available");
        console.error(
          `Attempt ${attempt} failed: Status: ${response.status}, Message: ${errorText}`
        );
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const authData: GoogleAuthTokenResponse = await response.json();
      console.log("Auth data received:", authData);

      if (!authData.access_token || !authData.expires_at) {
        console.error("Invalid auth token response:", authData);
        throw new Error("Invalid response: missing access_token or expires_at");
      }

      return authData;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error(
          error instanceof Error
            ? `Failed to fetch Google auth token after ${retries} attempts: ${error.message}`
            : "Failed to fetch Google auth token using GET"
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Max retries reached");
}

export const fetchBots = async (): Promise<BotData[]> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("fetchBots: Retrieved authToken:", authToken);

    const response = await fetch(`${baseUrl}api/v1/meetings/user-bots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: BotsApiResponse = await response.json();
    console.log("Fetched bots data:", data);

    if (!data.success) {
      throw new Error("API returned success: false");
    }

    return data.bots.map((bot: RawBotResponse) => ({
      id: bot.bot_id,
      name: bot.bot_name,
      description: bot.platform
        ? `AI-powered meeting assistant for ${bot.platform}`
        : "AI-powered meeting assistant",
      calendar_id: bot.bot_id || "N/A",
      recording_config: bot.recording_config,
      status:
        bot.status_changes && bot.status_changes.length > 0
          ? bot.status_changes[bot.status_changes.length - 1].code === "done"
            ? "inactive"
            : "active"
          : "inactive",
    }));
  } catch (error: unknown) {
    console.error("Failed to fetch bots:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching bots.";
    throw new Error(errorMessage);
  }
};

export const fetchBotStatus = async (
  botId: string
): Promise<BotStatusResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("fetchBotStatus: Retrieved authToken:", authToken);

    const response = await fetch(
      `${baseUrl}api/v1/meetings/bot/${botId}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: BotStatusResponse = await response.json();
    console.log(`Bot status data for bot ${botId}:`, data);
    return data;
  } catch (error: unknown) {
    console.error(`Failed to fetch bot status for bot ${botId}:`, error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching bot status.";
    throw new Error(errorMessage);
  }
};

export const fetchCalendarEvents = async (): Promise<CalendarApiResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("fetchCalendarEvents: Retrieved authToken:", authToken);

    const queryParams = new URLSearchParams({
      calendar_id: "primary",
      max_results: "50",
      include_past_events: "false",
    });

    const response = await fetch(
      `${baseUrl}api/v1/calendar/google-calendar-events-upcoming?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: CalendarApiResponse = await response.json();
    console.log("Fetched calendar events:", data);
    return data;
  } catch (error: unknown) {
    console.error("Failed to fetch calendar events:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching calendar events.";
    throw new Error(errorMessage);
  }
};

export const startWorkflow = async () => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("startWorkflow: Retrieved authToken:", authToken);

    const response = await fetch(`${baseUrl}api/v1/automation/start/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    return response;
  } catch (error: unknown) {
    console.error("Failed to start workflow:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while starting workflow.";
    throw new Error(errorMessage);
  }
};

export const setupGmail = async (): Promise<boolean> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("setupGmail: Retrieved authToken:", authToken);

    const response = await fetch(`${baseUrl}api/v1/gmail/setup-gmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: SetupGmailResponse = await response.json();
    console.log("Setup Gmail response:", data);
    return data.success;
  } catch (error: unknown) {
    console.error("Failed to setup Gmail:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while setting up Gmail.";
    throw new Error(errorMessage);
  }
};

export const googleLogin = async (): Promise<GoogleLoginResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }

    const response = await fetch(`${baseUrl}login/google`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: GoogleLoginResponse = await response.json();
    console.log("Google login response:", data);
    return data;
  } catch (error: unknown) {
    console.error("Failed to perform Google login:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while performing Google login.";
    throw new Error(errorMessage);
  }
};

export const fetchUserSettings = async (): Promise<UserSettingsResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("fetchUserSettings: Retrieved authToken:", authToken);

    const response = await fetch(`${baseUrl}api/v1/user/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: UserSettingsResponse = await response.json();
    console.log("Fetched user settings:", data);
    return data;
  } catch (error: unknown) {
    console.error("Failed to fetch user settings:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching user settings.";
    throw new Error(errorMessage);
  }
};

export const updateUserProfile = async (profileData: {
  full_name: string;
  bot_name: string;
  enable_backend_tasks: boolean;
}): Promise<UpdateProfileResponse> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    console.log("updateUserProfile: Retrieved authToken:", authToken);

    const response = await fetch(`${baseUrl}api/v1/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No additional error details available");
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const data: UpdateProfileResponse = await response.json();
    console.log("Updated user profile:", data);
    return data;
  } catch (error: unknown) {
    console.error("Failed to update user profile:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while updating user profile.";
    throw new Error(errorMessage);
  }
};
