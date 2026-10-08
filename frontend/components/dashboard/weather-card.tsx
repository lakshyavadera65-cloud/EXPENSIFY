'use client'

import { CloudLightning, MapPin, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeather } from '@/lib/hooks'

export function WeatherCard() {
  const { data } = useWeather()

  if (!data) return <Skeleton className="h-44 rounded-3xl" />

  return (
    <section
      aria-label="Weather"
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1e3a8a] via-[#1e40af] to-[#0c4a6e] p-5 text-white shadow-lg md:p-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-white/80">
            <MapPin className="size-3.5" aria-hidden="true" />
            {data.city}
          </span>
          <span className="font-heading text-4xl font-bold tabular-nums">{data.temperature}°C</span>
          <span className="text-sm text-white/85">{data.condition}</span>
        </div>
        <CloudLightning className="size-12 text-sky-200" aria-hidden="true" />
      </div>
      {data.warning && (
        <p className="relative mt-4 flex items-start gap-2 rounded-2xl bg-white/12 p-3 text-xs leading-relaxed text-white/95 backdrop-blur">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-300" aria-hidden="true" />
          {data.warning}
        </p>
      )}
    </section>
  )
}
