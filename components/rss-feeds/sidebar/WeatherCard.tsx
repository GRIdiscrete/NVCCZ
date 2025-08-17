'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  WiDaySunny,
  WiNightClear,
  WiCloud,
  WiCloudy,
  WiDayCloudy,
  WiNightAltCloudy,
  WiRain,
  WiShowers,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiHumidity,
  WiStrongWind,
} from 'react-icons/wi'

// Types for incoming data (either provided or fetched)
export type WeatherNow = {
  location: string
  tempC: number
  condition: string
  icon?: string
  highC?: number
  lowC?: number
  feelsLikeC?: number
  humidity?: number
  windKph?: number
  updatedAt?: string | number | Date
  isNight?: boolean
}

type WeatherCardProps = {
  // Provide either data or a fetchUrl.
  data?: WeatherNow
  fetchUrl?: string // Should return WeatherNow JSON
  compact?: boolean
  className?: string
}

function pickIcon(condition: string, isNight?: boolean) {
  const c = condition.toLowerCase()
  if (/thunder|storm/.test(c)) return <WiThunderstorm className="text-blue-400 drop-shadow-lg" size={42} />
  if (/rain|drizzle/.test(c)) return <WiRain className="text-blue-400 drop-shadow-lg" size={42} />
  if (/shower/.test(c)) return <WiShowers className="text-blue-400 drop-shadow-lg" size={42} />
  if (/snow|sleet|hail/.test(c)) return <WiSnow className="text-blue-200 drop-shadow-lg" size={42} />
  if (/fog|mist|haze|smoke/.test(c)) return <WiFog className="text-gray-300 drop-shadow-lg" size={42} />
  if (/overcast/.test(c)) return <WiCloudy className="text-gray-300 drop-shadow-lg" size={42} />
  if (/cloud/.test(c)) return isNight ? <WiNightAltCloudy className="text-indigo-300 drop-shadow-lg" size={42} /> : <WiDayCloudy className="text-sky-300 drop-shadow-lg" size={42} />
  if (/clear|sun/.test(c)) return isNight ? <WiNightClear className="text-amber-300 drop-shadow-lg" size={42} /> : <WiDaySunny className="text-yellow-400 drop-shadow-lg" size={42} />
  return isNight ? <WiNightAltCloudy className="text-indigo-300 drop-shadow-lg" size={42} /> : <WiDayCloudy className="text-sky-300 drop-shadow-lg" size={42} />
}

function formatUpdatedAt(v?: WeatherNow['updatedAt']) {
  try {
    if (!v) return '—'
    const d = typeof v === 'string' || typeof v === 'number' ? new Date(v) : v
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export default function WeatherCard({ data, fetchUrl, compact = true, className = '' }: WeatherCardProps) {
  const [loading, setLoading] = useState<boolean>(!!fetchUrl)
  const [error, setError] = useState<string | null>(null)
  const [weather, setWeather] = useState<WeatherNow | undefined>(data)

  useEffect(() => {
    let active = true
    async function load() {
      if (!fetchUrl) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(fetchUrl)
        if (!res.ok) throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`)
        const json = await res.json()
        if (active) setWeather(json as WeatherNow)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        if (active) setError(msg)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [fetchUrl])

  // Fallback demo data if nothing provided (keeps the card useful in the sidebar)
  const view = useMemo<WeatherNow>(() => {
    if (weather) return weather
    return {
      location: 'Harare, ZW',
      tempC: 22,
      condition: 'Partly Cloudy',
      highC: 25,
      lowC: 16,
      feelsLikeC: 21,
      humidity: 58,
      windKph: 9,
      updatedAt: Date.now(),
      isNight: false,
    }
  }, [weather])

  const icon = pickIcon(view.condition, view.isNight)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -2, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={`relative w-full ${compact ? 'max-w-[280px]' : 'max-w-[340px]'} bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 border border-slate-700/60 rounded-xl p-4 text-gray-100 shadow-2xl shadow-slate-900/50 backdrop-blur-lg overflow-hidden cursor-pointer ${className}`}
      aria-busy={loading}
    >
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" />
      
      
      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="min-w-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-medium text-blue-400/90 truncate tracking-wide uppercase"
          >
            Weather
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-bold text-white truncate drop-shadow-sm" 
            title={view.location}
          >
            {view.location}
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] text-slate-400 font-medium"
        >
          {formatUpdatedAt(view.updatedAt)}
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative flex items-center gap-3 mb-4">
        <motion.div 
          className="shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.1, 
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.6 }
          }}
        >
          {icon}
        </motion.div>
        <div className="leading-none">
          <div className="flex items-baseline gap-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-black drop-shadow-lg bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent"
            >
              {Math.round(view.tempC)}°
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-slate-300 font-medium"
            >
              {view.condition}
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-2 flex items-center gap-2 text-[11px] text-slate-400"
          >
            {typeof view.highC === 'number' && <span className="px-1.5 py-0.5 bg-red-500/20 rounded text-red-300">H: {Math.round(view.highC)}°</span>}
            {typeof view.lowC === 'number' && <span className="px-1.5 py-0.5 bg-blue-500/20 rounded text-blue-300">L: {Math.round(view.lowC)}°</span>}
            {typeof view.feelsLikeC === 'number' && <span className="text-slate-300">Feels {Math.round(view.feelsLikeC)}°</span>}
          </motion.div>
        </div>
      </div>

      {/* Footer mini stats */}
      <div className="relative grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg border border-slate-600/20 backdrop-blur-sm"
        >
          <WiHumidity className="text-blue-400 drop-shadow-sm" size={18} />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">
              {typeof view.humidity === 'number' ? `${view.humidity}%` : '—'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">Humidity</span>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg border border-slate-600/20 backdrop-blur-sm"
        >
          <WiStrongWind className="text-blue-400 drop-shadow-sm" size={18} />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">
              {typeof view.windKph === 'number' ? `${Math.round(view.windKph)}` : '—'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">km/h</span>
          </div>
        </motion.div>
      </div>

      {/* Loading / Error overlays */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 relative"
        >
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </div>
          <div className="text-center mt-2 text-xs text-slate-400">Loading weather...</div>
        </motion.div>
      )}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="text-[11px] text-red-400 font-medium">{error}</div>
        </motion.div>
      )}
    </motion.div>
  )
}
