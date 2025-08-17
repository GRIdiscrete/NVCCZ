'use client';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize from the <html data-theme> set by ThemeScript (no hydration mismatch)
  useEffect(() => {
    const initial = (document.documentElement.dataset.theme as Theme) || 'light';
    setTheme(initial);
  }, []);

  // Apply + persist whenever it changes
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    // Keep the browser UI (mobile address bar) readable
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg =
        getComputedStyle(html).getPropertyValue('--bg').trim() ||
        (theme === 'dark' ? '#0b1220' : '#ffffff');
      meta.setAttribute('content', bg);
    }
  }, [theme]);

  // If the user hasn't chosen a theme, follow system changes live
  useEffect(() => {
    if (localStorage.getItem('theme')) return; // user preference overrides system
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={theme === 'dark'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{ border: '1px solid var(--border)', padding: '6px 10px', borderRadius: 8, background: 'var(--bg)', color: 'var(--fg)' }}
    >
      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}
