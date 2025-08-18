"use client";

import useSWR from "swr";
import { HeroCarousel, HeroSlide } from "@/components/hero";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HeroClient() {
  const { data } = useSWR<{ slides: HeroSlide[] }>("/api/hero", fetcher);
  const slides = data?.slides || [
    {
      id: "hero-1",
      title: "Daily Markets. Clear Signals.",
      subtitle: "Big-visual hero with calm overlay.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80",
      alt: "Aerial city skyline at dusk with soft light and distant markets mood",
    },
  ];

  return <HeroCarousel slides={slides} />;
}