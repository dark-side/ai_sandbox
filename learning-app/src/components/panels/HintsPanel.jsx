import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AccordionPanel from '../AccordionPanel.jsx';

const HINT_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

function parseHints(md) {
  if (!md) return [];
  const blocks = md.split(/\n(?=\*\*Hint\s+\d+)/);
  return blocks
    .filter(b => b.trim().startsWith('**Hint'))
    .map(block => {
      const titleMatch = block.match(/^\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : 'Hint';
      const body  = block.replace(/^\*\*(.+?)\*\*\s*/, '').trim();
      return { title, body };
    });
}

export default function HintsPanel({ sectionId, hintsMarkdown, hintsRevealed, onRevealNext }) {
  const hints    = parseHints(hintsMarkdown);
  const revealed = hintsRevealed[sectionId] || 0;
  const hasMore  = revealed < hints.length;

  const badge = hints.length > 0
    ? `${Math.min(revealed, hints.length)} / ${hints.length} revealed`
    : null;

  return (
    <AccordionPanel
      title="Hints"
      badge={badge}
      resetKey={sectionId}
      subtitle={hints.length === 0 ? 'none available' : undefined}
    >
      {hints.length === 0 ? (
        <p className="panel-empty">No hints for this section.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hints.map((hint, i) => (
            <HintItem
              key={`${sectionId}-hint-${i}`}
              index={i}
              hint={hint}
              isRevealed={i < revealed}
              autoOpen={i === revealed - 1}
            />
          ))}

          {hasMore && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onRevealNext}
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                padding: '7px 16px',
                background: 'var(--warning-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--warning)',
                fontSize: '0.82rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Reveal hint {revealed + 1}
            </motion.button>
          )}

          {!hasMore && hints.length > 0 && (
            <p className="panel-empty" style={{ fontSize: '0.78rem', marginTop: 4 }}>
              All hints revealed. Check the Reference Solution panel for the reference implementation.
            </p>
          )}
        </div>
      )}
    </AccordionPanel>
  );
}

function HintItem({ index, hint, isRevealed, autoOpen }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [hint.title]);

  useEffect(() => {
    if (isRevealed && autoOpen) setOpen(true);
  }, [isRevealed, autoOpen]);

  if (!isRevealed) {
    return (
      <div style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius)',
        border: '1px dashed var(--border)',
        opacity: 0.45,
        fontSize: '0.82rem',
        color: 'var(--text-4)',
        fontStyle: 'italic',
        userSelect: 'none',
      }}>
        Hint {index + 1} (locked)
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ minHeight: 44, padding: '10px 14px' }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', flex: 1 }}>
          {hint.title}
        </span>
        <motion.span
          className="accordion-chevron"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          ▶
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={HINT_TRANSITION}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              padding: '12px 14px',
              fontSize: '0.84rem',
              color: 'var(--text-2)',
              lineHeight: 1.7,
              borderTop: '1px solid var(--border)',
            }}>
              {hint.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
