import Cookies from "js-cookie";

// Define the structure of the BotData
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

// Define the structure of the raw API response for bots list
interface RawBotResponse {
  id: string;
  bot_name: string;
  meeting_url: {
    platform: string;
    meeting_id: string;
  };
  recording_config?: RecordingConfig;
  status_changes: Array<{
    code: string;
  }>;
}

// Define the structure of the bot status API response
interface BotStatusResponse {
  id: string;
  meeting_url: {
    meeting_id: string;
    platform: string;
  };
  bot_name: string;
  join_at: string;
  recording_config: RecordingConfig;
  status_changes: Array<{
    code: string;
    message: string | null;
    created_at: string;
    sub_code: string | null;
  }>;
  recordings: unknown[];
  automatic_leave: {
    waiting_room_timeout: number;
    noone_joined_timeout: number;
    everyone_left_timeout: {
      timeout: number;
      activate_after: number | null;
    };
    in_call_not_recording_timeout: number;
    recording_permission_denied_timeout: number;
    silence_detection: {
      timeout: number;
      activate_after: number;
    };
    bot_detection: {
      using_participant_events: {
        timeout: number;
        activate_after: number;
      };
    };
  };
  calendar_meetings: unknown[];
  metadata: Record<string, unknown>;
  transcript_available: boolean;
}

// Define the structure for Calendar Event
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

// Define the structure for Calendar API response
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

// Define the structure for setupGmail API response
interface SetupGmailResponse {
  success: boolean;
}

// Define the structure for Google login API response
interface GoogleLoginResponse {
  success: boolean;
  token: string;
}
const AUTH_TOKEN = Cookies.get("authToken");
const baseUrl = "https://rw880wk80cgs8w48k8c08goo.stixor.com/";

export const fetchBots = async (): Promise<BotData[]> => {
  try {
    if (!baseUrl) {
      throw new Error(
        "API base URL is not defined. Please check your environment variables."
      );
    }
    if (!AUTH_TOKEN) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await fetch(`${baseUrl}api/v1/meetings/bots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
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

    const data: RawBotResponse[] = await response.json();
    console.log("Fetched bots data:", data);

    return data.map((bot: RawBotResponse) => ({
      id: bot.id,
      name: bot.bot_name,
      description: `AI-powered meeting assistant for ${bot.meeting_url.platform}`,
      calendar_id: bot.meeting_url.meeting_id,
      recording_config: bot.recording_config,
      status:
        bot.status_changes[bot.status_changes.length - 1]?.code === "done"
          ? "inactive"
          : "active",
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
    if (!AUTH_TOKEN) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await fetch(
      `${baseUrl}api/v1/meetings/bot/${botId}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
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
    if (!AUTH_TOKEN) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

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
          Authorization: `Bearer ${AUTH_TOKEN}`,
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
    if (!AUTH_TOKEN) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await fetch(`${baseUrl}api/v1/automation/start/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
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
    if (!AUTH_TOKEN) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await fetch(`${baseUrl}api/v1/gmail/setup-gmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
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
