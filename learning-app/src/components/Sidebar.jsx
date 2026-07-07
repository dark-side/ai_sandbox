import React from 'react';
import { motion } from 'framer-motion';

const SIDEBAR_W = 264;

export default function Sidebar({ sections, currentId, completed, onSelect }) {
  return (
    <aside style={{
      width: SIDEBAR_W,
      minWidth: SIDEBAR_W,
      height: '100%',
      marginTop: 'var(--topbar-h)',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg)',
      overflowY: 'auto',
      flexShrink: 0,
      paddingBottom: 32,
    }}>
      <div style={{
        padding: '14px 16px 8px',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-4)',
        borderBottom: '1px solid var(--border)',
        marginBottom: 4,
      }}>
        Sections
      </div>

      {sections.map((meta, idx) => {
        const isActive = meta.id === currentId;
        const isDone   = completed[meta.id];

        return (
          <div key={meta.id} style={{ position: 'relative' }}>
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--accent-bg)',
                  borderLeft: '3px solid var(--accent)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              />
            )}
            <button
              type="button"
              onClick={() => onSelect(meta.id)}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px 9px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                borderLeft: isActive ? 'none' : '3px solid transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Section number chip */}
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: isActive ? 'var(--accent)' : 'var(--text-4)',
                minWidth: 22,
                fontVariantNumeric: 'tabular-nums',
              }}>
                S{String(meta.number).padStart(2, '0')}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text)' : isDone ? 'var(--text-4)' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textDecoration: isDone ? 'line-through' : 'none',
                  lineHeight: 1.35,
                }}>
                  {meta.title}
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-4)', marginTop: 1 }}>
                  {meta.tag}
                </div>
              </div>

              {isDone && (
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', flexShrink: 0, fontWeight: 600 }}>
                  Done
                </span>
              )}
            </button>
          </div>
        );
      })}
    </aside>
  );
}
