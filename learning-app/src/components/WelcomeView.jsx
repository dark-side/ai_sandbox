import React from 'react';
import { motion } from 'framer-motion';

export default function WelcomeView({ sections, completed, completedCount, onSelect }) {
  const total = sections.length;
  const pct   = Math.round((completedCount / total) * 100);

  const firstIncomplete = sections.find(s => !completed[s.id]) ?? sections[0];
  const startTarget = firstIncomplete?.id ?? sections[0]?.id;

  return (
    <div style={{
      height: '100%',
      marginTop: 'var(--topbar-h)',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth',
      padding: '56px 40px 80px',
    }}>
      {/* Hero: centered, clean */}
      <div style={{
        maxWidth: 640,
        margin: '0 auto 56px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Logo Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--accent)',
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          padding: '4px 12px', borderRadius: 'var(--radius-lg)',
          marginBottom: 20,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>PayFlow AI Practice · 12 Sections</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem,4.5vw,2.5rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
          PayFlow AI Engineering<br />
          <span style={{ color: 'var(--accent)' }}>Practice Portal</span>
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 28 }}>
          Build a production-grade <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>Ticket to PR pipeline</strong> one
          discipline at a time. Each section has tasks, progressive hints, a reference solution, and a knowledge check.
        </p>

        {/* Progress */}
        {completedCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', maxWidth: 320, marginBottom: 24 }}>
            <div style={{
              flex: 1, height: 4,
              background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
              {completedCount} / {total} complete
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onSelect(startTarget)}
          style={{
            padding: '10px 28px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.target.style.opacity = 0.88; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)'; }}
        >
          {completedCount > 0 ? 'Continue' : 'Start Section 1'}
        </button>
      </div>

      {/* Section grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {sections.map((meta, i) => {
          const isDone = completed[meta.id];
          return (
            <motion.button
              key={meta.id}
              onClick={() => onSelect(meta.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              whileHover={{ y: -2, boxShadow: 'var(--shadow)' }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
                opacity: isDone ? 0.6 : 1,
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--text-4)',
                }}>
                  Section {meta.number}
                </span>
                {isDone && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)' }}>
                    Done
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 6, lineHeight: 1.35,
              }}>
                {meta.title}
              </div>
              <div style={{
                display: 'inline-block',
                fontSize: '0.65rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: 'var(--accent)',
                background: 'var(--accent-bg)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
              }}>
                {meta.tag}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
