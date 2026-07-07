import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AccordionPanel from '../AccordionPanel.jsx';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      style={{
        fontSize: '0.7rem', fontWeight: 500, fontFamily: 'inherit',
        padding: '2px 8px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        background: 'var(--bg)', color: copied ? 'var(--success)' : 'var(--text-3)',
        cursor: 'pointer', transition: 'color var(--t)',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function SolutionPanel({ sectionId, solutionFiles }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [sectionId]);

  useEffect(() => {
    const handleOpenEvent = (e) => {
      if (e.detail?.title === 'Reference Solution') {
        setRevealed(true);
      }
    };
    window.addEventListener('open-accordion', handleOpenEvent);
    return () => window.removeEventListener('open-accordion', handleOpenEvent);
  }, []);

  const badge = solutionFiles?.length > 0
    ? `${solutionFiles.length} file${solutionFiles.length !== 1 ? 's' : ''}`
    : undefined;

  return (
    <AccordionPanel title="Reference Solution" badge={badge} resetKey={sectionId}>
      {!revealed ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '12px 16px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Reveal the reference solution?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
              Try completing the tasks first. The solution is most valuable as a comparison, not a starting point.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRevealed(true)}
            style={{
              padding: '7px 16px', flexShrink: 0,
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius)',
              color: 'var(--accent)',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Show solution
          </motion.button>
        </div>
      ) : !solutionFiles || solutionFiles.length === 0 ? (
        <div style={{
          padding: '16px', textAlign: 'center',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border)',
        }}>
          <p className="panel-empty" style={{ color: 'var(--text-3)' }}>
            Reference solution not yet available for this section.
          </p>
          <p className="panel-empty" style={{ fontSize: '0.78rem', marginTop: 4 }}>
            Check <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75em' }}>solutions/{sectionId}/</code> in the repository.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {solutionFiles.map(file => (
            <div
              key={file.name}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--bg-muted)',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.78rem', color: 'var(--text-3)',
                }}>
                  {file.name}
                </span>
                <CopyBtn text={file.content} />
              </div>
              <pre style={{
                margin: 0, padding: '12px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.78rem', color: 'var(--text-2)',
                lineHeight: 1.65, overflowX: 'auto',
                maxHeight: 380, overflowY: 'auto',
                background: 'var(--bg-subtle)',
              }}>
                <code>{file.content}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </AccordionPanel>
  );
}
