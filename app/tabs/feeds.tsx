"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Newspaper,
  BarChart3,
  Globe,
  Filter,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZW } from "country-flag-icons/react/3x2";

// External components / utils from your codebase
import { FeedItem, BankRatesResponse } from "@/types.db";
import { BankRatesCard } from "@/components/rss-feeds/BankRatesCard";
import { FeedCard } from "@/components/rss-feeds/FeedCard";
import { categories, isFinancialOrEconomic, categorizeByRegion } from "@/utils/feedUtils";
import ZimFinancialData from "@/components/MenuAllFinancialData";
import FloatingRBZData from "@/components/rss-feeds/FloatingRBZData";
import WeatherCard from "@/components/rss-feeds/sidebar/WeatherCard";

// ---------------------------------------------------------------------------
// Fetcher
const fetcher = async (url: string) => fetch(url).then((res) => res.json());

// ---------------------------------------------------------------------------
// Combined Rate Card (polished + mobile-friendly)
const CombinedRateCard = ({
  cryptoData,
  forexData,
  cryptoLoading,
  forexLoading,
}: {
  cryptoData: any[];
  forexData: any[];
  cryptoLoading: boolean;
  forexLoading: boolean;
}) => {
  const [currentView, setCurrentView] = useState<"crypto" | "forex">("crypto");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchView = (newView: "crypto" | "forex") => {
    if (newView !== currentView && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(newView);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const getCurrentTitle = () => (currentView === "crypto" ? "Cryptocurrency" : "Forex Rates");
  const isCurrentlyLoading = () => (currentView === "crypto" ? cryptoLoading : forexLoading);
  const list = currentView === "crypto" ? cryptoData : forexData;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3 shadow-[0_8px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-all duration-300 hover:border-slate-600">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300">
            <DollarSign size={16} />
          </span>
          <h3 className="text-sm font-semibold text-white">
            {getCurrentTitle()}
            {isCurrentlyLoading() && (
              <span className="ml-2 inline-block align-middle">
                <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-t-2 border-sky-300" />
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchView("crypto")}
            className={`h-2 w-2 rounded-full transition-all ${
              currentView === "crypto" ? "bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]" : "bg-slate-500 hover:bg-slate-400"
            }`}
            aria-label="Show crypto"
          />
          <button
            onClick={() => switchView("forex")}
            className={`h-2 w-2 rounded-full transition-all ${
              currentView === "forex" ? "bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]" : "bg-slate-500 hover:bg-slate-400"
            }`}
            aria-label="Show forex"
          />
        </div>
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={currentView}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className={`divide-y divide-slate-700/50 ${isTransitioning ? "pointer-events-none opacity-60" : "opacity-100"}`}
        >
          {list.map((item, idx) => (
            <li
              key={`${currentView}-${idx}`}
              className="flex min-h-[40px] items-center justify-between gap-2 py-2 pl-2 pr-1 transition-colors hover:bg-slate-700/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {currentView === "crypto" ? item.symbol : item.pair}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-right text-xs font-bold text-white">
                  {currentView === "crypto" ? item.price : item.rate}
                </span>
                <span
                  className={`inline-flex min-w-0 items-center truncate rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                    item.trend === "up"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : item.trend === "down"
                      ? "bg-rose-400/10 text-rose-400"
                      : "text-slate-300"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 flex-shrink-0" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="mr-1 h-3 w-3 flex-shrink-0" />
                  ) : null}
                  <span className="truncate">{item.change}</span>
                </span>
              </div>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* Nav controls (mobile friendly) */}
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => switchView(currentView === "crypto" ? "forex" : "crypto")}
          className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-200 hover:border-sky-500 hover:bg-slate-700"
        >
          Toggle View
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchView("crypto")}
            className="rounded-full p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Crypto"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => switchView("forex")}
            className="rounded-full p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Forex"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const FeedPage = () => {
  const [mounted, setMounted] = useState(false);

  const { data, error, isLoading: feedsLoading, mutate } = useSWR<{ items: FeedItem[] }>(
    mounted ? "/api/feeds" : null,
    fetcher
  );
  const { data: cryptoData, isLoading: cryptoLoading } = useSWR(mounted ? "/api/crypto" : null, fetcher);
  const { data: forexData, isLoading: forexLoading } = useSWR(mounted ? "/api/forex" : null, fetcher);
  const { data: bankRatesData, isLoading: bankRatesLoading } = useSWR<BankRatesResponse>(
    mounted ? "/api/bankRates" : null,
    fetcher
  );

  const [selectedCategory, setSelectedCategory] = useState("zimbabwean");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);

  const feedsData = data?.items || [];

  const filteredFeeds = useMemo(
    () =>
      feedsData.filter((feed) => {
        if (!isFinancialOrEconomic(feed)) return false; // domain filter first
        const feedCategory = categorizeByRegion(feed);
        if (feedCategory !== selectedCategory) return false; // region filter
        if (!searchTerm) return true; // text search
        const q = searchTerm.toLowerCase();
        return (
          feed.title.toLowerCase().includes(q) || feed.contentSnippet?.toLowerCase().includes(q)
        );
      }),
    [feedsData, selectedCategory, searchTerm]
  );

  const refresh = async () => {
    await mutate();
  };

  // Fallback rates when APIs are empty
  const getRatesData = () => {
    let forexRates = [
      { pair: "USD/ZWL", rate: "24,500", change: "+0.8%", trend: "up" },
      { pair: "USD/GBP", rate: "1.2680", change: "-0.3%", trend: "down" },
      { pair: "USD/EUR", rate: "1.0925", change: "+0.1%", trend: "up" },
    ];
    if (forexData && (forexData as any).success && (forexData as any).data) {
      forexRates = (forexData as any).data;
    } else if (Array.isArray(forexData)) {
      forexRates = forexData as any;
    }

    return {
      crypto:
        (Array.isArray(cryptoData) && cryptoData) ||
        [
          { symbol: "BTC", price: "$43,250", change: "+2.4%", trend: "up" },
          { symbol: "ETH", price: "$2,580", change: "-1.2%", trend: "down" },
          { symbol: "BNB", price: "$315", change: "+0.8%", trend: "up" },
          { symbol: "ADA", price: "$0.52", change: "+3.1%", trend: "up" },
        ],
      forex: forexRates,
    };
  };

  if (!mounted) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-sky-500" />
      </div>
    );
  }

  if (feedsLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-slate-800/50" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-700/60 bg-slate-800/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
          Error loading feeds: {(error as any).message}
        </div>
      </div>
    );
  }

  const rates = getRatesData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 shadow-md" />
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
                  NVCCZ Financial Feeds
                </h1>
                <p className="text-[11px] text-slate-400">Curated informatics • live rates</p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 shadow-sm transition-colors hover:border-sky-500 hover:bg-slate-800"
            >
              <RefreshCw size={14} className="" /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* RBZ + Summary modules */}
      <section className="mx-auto max-w-7xl px-2 py-2 sm:px-3">
        <div className="mb-2"><FloatingRBZData /></div>
        <div className="mb-2"><ZimFinancialData /></div>
      </section>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl gap-3 px-2 pb-6 sm:px-3 lg:grid lg:grid-cols-5">
        {/* Sidebar */}
        <aside className="order-2 mt-3 space-y-3 lg:order-1 lg:col-span-2 lg:mt-0 lg:pr-2 xl:col-span-1">
          <CombinedRateCard
            cryptoData={rates.crypto}
            forexData={rates.forex}
            cryptoLoading={cryptoLoading}
            forexLoading={forexLoading}
          />
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3 shadow-[0_8px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl">
            <WeatherCard />
          </div>
          {/* Optional: bank rates card */}
          {/* <BankRatesCard data={bankRatesData} isLoading={bankRatesLoading} /> */}
        </aside>

        {/* Content */}
        <section className="order-1 lg:order-2 lg:col-span-3 xl:col-span-4">
          {/* Search & Filters */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3 shadow-[0_8px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Search financial news…"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/40 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Filter size={16} /> Filter
              </div>
            </div>

            {/* Category pills (scrollable on mobile) */}
            <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`snap-start inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all ${
                    selectedCategory === category.id
                      ? "bg-sky-600 text-white shadow"
                      : "bg-slate-900/40 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  {category.id === "zimbabwean" ? (
                    <ZW className="h-4 w-4" />
                  ) : category.id === "african" ? (
                    <MapPin size={16} />
                  ) : (
                    <Globe size={16} />
                  )}
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="mb-2 mt-3">
            <h2 className="text-sm font-semibold tracking-tight text-slate-200">
              Latest News <span className="text-slate-400">({filteredFeeds.length} articles)</span>
            </h2>
          </div>

          {/* Feed grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredFeeds.map((feed, idx) => (
              <motion.div
                key={feed.guid || idx}
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="[--x:50%] [--y:50%] group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/60 p-2 shadow-[0_8px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-all hover:border-sky-500/60 hover:shadow-[0_18px_50px_rgba(2,6,23,0.45)]"
              >
                <FeedCard feed={feed} />
                {/* hover shimmer */}
                <div className="pointer-events-none absolute -inset-12 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.10), transparent 40%)" }} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filteredFeeds.length === 0 && !feedsLoading && (
            <div className="grid place-items-center py-10 text-center">
              <Newspaper className="mb-3 h-14 w-14 text-slate-500" />
              <h3 className="text-base font-medium text-slate-300">No articles found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FeedPage;
