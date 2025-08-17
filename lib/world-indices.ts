import { API_BASE_URL } from "@/lib/constants";

export interface WorldIndex {
  symbol: string;
  name: string;
  full_name: string;
  last: string;
  change: string;
  change_abs: string;
}

export interface WorldIndicesResponse {
  status: string;
  timestamp: string;
  source: string;
  url: string;
  indices: WorldIndex[];
  count: number;
  columns: string[];
}

export async function fetchWorldIndices(): Promise<WorldIndicesResponse | null> {
  const endpoint = "/api/tradingview/world-indices";
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url);
    

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('the response' , response);

    // Validate essential fields
    if (!data || !Array.isArray(data.indices)) {
      throw new Error("Invalid or malformed API response");
    }

    // Return structured response as per the WorldIndicesResponse type
    const result: WorldIndicesResponse = {
      status: data.status ?? "unknown",
      timestamp: data.timestamp ?? new Date().toISOString(),
      source: data.source ?? "unknown",
      url: data.url ?? "",
      indices: data.indices.map((index: any) => ({
        symbol: index.symbol ?? "",
        name: index.name ?? "",
        full_name: index.full_name ?? "",
        last: index.last ?? "",
        change: index.change ?? "",
        change_abs: index.change_abs ?? ""
      })),
      count: data.count ?? data.indices.length,
      columns: data.columns ?? ["symbol", "last", "change", "change_abs"]
    };

    return result;

  } catch (error: any) {
    console.error("Failed to fetch world indices:", error.message);
    return null;
  }
} 