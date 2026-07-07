import React, { useState, useEffect, useRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PANEL_TRANSITION = { duration: 0.26, ease: [0.4, 0, 0.2, 1] };

/**
 * Reusable animated accordion panel.
 * Pass resetKey (e.g. section id) to close/reset when navigating between sections.
 */
export default function AccordionPanel({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  resetKey,
  children,
  headerRight,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const containerRef = useRef(null);
  const panelId = useId();
  const bodyId = `${panelId}-body`;

  useEffect(() => {
    setOpen(defaultOpen);
  }, [resetKey, defaultOpen]);

  useEffect(() => {
    const handleOpenEvent = (e) => {
      if (e.detail?.title === title) {
        setOpen(true);
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, PANEL_TRANSITION.duration * 1000);
      }
    };
    window.addEventListener('open-accordion', handleOpenEvent);
    return () => window.removeEventListener('open-accordion', handleOpenEvent);
  }, [title]);

  return (
    <div ref={containerRef} className="accordion-panel">
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <motion.span
            className="accordion-chevron"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            ▶
          </motion.span>
          <span className="accordion-title">{title}</span>
          {badge && <span className="accordion-badge">{badge}</span>}
          {subtitle && <span className="accordion-subtitle">{subtitle}</span>}
        </div>
        {headerRight && (
          <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
            {headerRight}
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            key={`${resetKey ?? 'panel'}-body`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={PANEL_TRANSITION}
            style={{ overflow: 'hidden' }}
          >
            <div className="accordion-body-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
