import React from 'react';
import { motion } from 'framer-motion';

const s = {
  bar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: 'var(--topbar-h)',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 100,
    gap: 16,
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: {
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    color: 'var(--text)', letterSpacing: '-0.01em',
    border: 'none', background: 'none', fontFamily: 'inherit',
    padding: '4px 0',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  center: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 280 },
  progressLabel: { fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 },
  progressTrack: { flex: 1, height: 3, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' },
  right: { display: 'flex', alignItems: 'center', gap: 6 },
  themeLabel: { fontSize: '0.72rem', color: 'var(--text-4)', marginRight: 2 },
  themeBtns: { display: 'flex', gap: 4 },
};

const GlobeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', opacity: 0.85, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function TopBar({ theme, themes, onThemeChange, completedCount, total, onLogoClick }) {
  const pct = Math.round((completedCount / total) * 100);

  return (
    <header style={s.bar}>
      <div style={s.left}>
        <button style={s.logo} onClick={onLogoClick} aria-label="Go to home">
          <GlobeIcon />
          <span>PayFlow AI Practice</span>
        </button>
      </div>

      <div style={s.center}>
        <span style={s.progressLabel}>{completedCount}/{total}</span>
        <div style={s.progressTrack}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
          />
        </div>
      </div>

      <div style={s.right}>
        <span style={s.themeLabel}>Theme</span>
        <div style={s.themeBtns}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
              style={{
                fontSize: '0.72rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                padding: '3px 9px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderColor: theme === t.id ? 'var(--accent)' : 'var(--border)',
                background:  theme === t.id ? 'var(--accent-bg)' : 'transparent',
                color:       theme === t.id ? 'var(--accent)' : 'var(--text-3)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
