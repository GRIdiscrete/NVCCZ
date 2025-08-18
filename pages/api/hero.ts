import type { NextApiRequest, NextApiResponse } from 'next';

// Simple mock endpoint to serve hero slides with LQIP
const LQIP = "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGBQUGBgaGBoYIBweHh4eHh4eICEhICAhICEhISEhISEhISEhISEhISEhISEhISL/2wBDARESEhgVGBgYGiAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISL/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAAAAAAAAB//Z";

const slides = [
  {
    id: 'hero-1',
    title: 'Daily Markets. Clear Signals.',
    subtitle: 'Big-visual hero with calm overlay. Inspired by Bing News and Apple treatments.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=3840&q=80',
    alt: 'Aerial city skyline at dusk with soft light and distant markets mood',
    lqip: LQIP,
  },
  {
    id: 'hero-2',
    title: 'Zimbabwe Focus. Africa Context.',
    subtitle: 'Editorial hierarchy and premium spacing for headline overlays.',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=3840&q=80',
    alt: 'Hands using a tablet displaying financial charts and analytics',
    lqip: LQIP,
  },
  {
    id: 'hero-3',
    title: 'Personalized Feeds. Enterprise Ready.',
    subtitle: 'Viva Connections-style cards for announcements and integrations.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=3840&q=80',
    alt: 'Abstract soft gradient and bokeh lights for brand-forward backdrop',
    lqip: LQIP,
  },
];

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ slides });
}