export type AfricanIndex = {
  symbol: string;
  name: string;
  full_name: string;
  price: string;
  change: string;
  'change %': string;
  high: string;
  low: string;
  tech_rating: string;
};

export type AfricanIndicesResponse = {
  count: number;
  indices: AfricanIndex[];
  source: string;
  status: string;
  timestamp: string;
  url: string;
};

import { API_BASE_URL } from "@/lib/constants";

export async function fetchAfricanIndices(): Promise<{
  success: boolean;
  data?: AfricanIndicesResponse;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tradingview/african-indices`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const json = await res.json();

    const structuredData: AfricanIndicesResponse = {
      count: json.count,
      indices: json.indices.map((index: any) => ({
        symbol: index.symbol ?? '',
        name: index.name ?? '',
        full_name: index.full_name ?? '',
        price: index.price ?? '',
        change: index.change ?? '',
        'change %': index['change %'] ?? index['change %'] ?? '',
        high: index.high ?? '',
        low: index.low ?? '',
        tech_rating: index.tech_rating ?? '',
      })),
      source: json.source ?? 'TradingView',
      status: json.status ?? 'success',
      timestamp: json.timestamp ?? new Date().toISOString(),
      url: json.url ?? 'https://www.tradingview.com/markets/indices/quotes-africa/',
    };

    return { success: true, data: structuredData };
  } catch (error: any) {
    console.error('Error fetching African indices:', error.message);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
} 