import { API_BASE_URL } from "@/lib/constants";

export type ZseMarketActivity = {
  trades: number;
  market_cap: number;
  foreign_buys: number;
  foreign_sells: number;
};

export type ZseMarketActivityResponse = {
  status: string;
  date: string;
  timestamp: string;
  source: string;
  url: string;
  market_activity: ZseMarketActivity;
};



export async function fetchMarketActivity(): Promise<{
  success: boolean;
  data?: ZseMarketActivityResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/zse/market-activity`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const json = await response.json();

    // ✅ Validate structure
    if (
      !json.market_activity ||
      typeof json.market_activity.trades !== "number" ||
      typeof json.market_activity.market_cap !== "number" ||
      typeof json.market_activity.foreign_buys !== "number" ||
      typeof json.market_activity.foreign_sells !== "number" ||
      typeof json.date !== "string"
    ) {
      throw new Error("Invalid market activity data structure");
    }

    const structuredData: ZseMarketActivityResponse = {
      status: json.status,
      date: json.date,
      timestamp: json.timestamp,
      source: json.source,
      url: json.url,
      market_activity: json.market_activity,
    };

    return { success: true, data: structuredData };
  } catch (error: any) {
    console.error("Error fetching market activity:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
} 