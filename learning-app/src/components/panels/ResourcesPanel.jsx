import React from 'react';
import AccordionPanel from '../AccordionPanel.jsx';

const SOURCE_SHORT = {
  'Anthropic': 'Anthropic',
  'Anthropic Docs': 'Anthropic Docs',
  'Anthropic Engineering': 'Anthropic Eng',
  'OpenAI': 'OpenAI',
  'OpenAI Cookbook': 'OpenAI Cookbook',
  'Addy Osmani': 'Addy Osmani',
  'Anthropic (GitHub)': 'GitHub',
  'Martin Fowler': 'Martin Fowler',
  'Hamel Husain': 'Hamel Husain',
  'Eugene Yan': 'Eugene Yan',
  'Simon Willison': 'Simon Willison',
  'Morph': 'Morph',
  'GitHub Docs': 'GitHub Docs',
  'OpenTelemetry': 'OTel',
  'Langfuse': 'Langfuse',
  'agents.md': 'agents.md',
};

export default function ResourcesPanel({ sectionId, resources = [] }) {
  return (
    <AccordionPanel
      title="Resources"
      badge={resources.length > 0 ? `${resources.length} links` : undefined}
      resetKey={sectionId}
    >
      {resources.length === 0 ? (
        <p className="panel-empty">No resources listed.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s ease, background 0.15s ease, transform 0.12s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-border)';
                e.currentTarget.style.background  = 'var(--accent-bg)';
                e.currentTarget.style.transform   = 'translateX(3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background  = 'var(--bg)';
                e.currentTarget.style.transform   = 'translateX(0)';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>
                  {SOURCE_SHORT[r.source] || r.source}
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem', color: 'var(--text-4)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                padding: '2px 7px', borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {r.time}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', flexShrink: 0 }}>
                →
              </span>
            </a>
          ))}
        </div>
      )}
    </AccordionPanel>
  );
}
