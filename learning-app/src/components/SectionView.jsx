import React, { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import AccordionPanel from './AccordionPanel.jsx';
import HintsPanel from './panels/HintsPanel.jsx';
import SolutionPanel from './panels/SolutionPanel.jsx';
import ResourcesPanel from './panels/ResourcesPanel.jsx';
import QuizPanel from './panels/QuizPanel.jsx';

function TasksSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[72, 88, 64, 95].map((width, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}

export default function SectionView({
  meta, data, loading, progress,
  currentIdx, total,
  onNext, onPrev,
}) {
  const { id, title, number, tag, description, outcomes, resources, quiz } = meta;
  const isDone = progress.completed[id];
  const scrollRef = useRef(null);
  const dataReady = Boolean(data);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [id]);

  const handleKey = useCallback((e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onNext, onPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div ref={scrollRef} className="section-scroll">
      <div style={{
        flex: 1,
        maxWidth: 860,
        width: '100%',
        padding: '36px 48px 80px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: 'var(--text-4)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                padding: '2px 8px', borderRadius: 'var(--radius-sm)',
              }}>
                Section {String(number).padStart(2, '0')}
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                color: 'var(--accent)',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                padding: '2px 8px', borderRadius: 'var(--radius-sm)',
              }}>
                {tag}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.4rem,3vw,1.9rem)',
              fontWeight: 700, lineHeight: 1.2,
              letterSpacing: '-0.02em', color: 'var(--text)',
              marginBottom: 10,
            }}>
              {title}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 620 }}>
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => progress.toggleComplete(id)}
            style={{
              flexShrink: 0, marginLeft: 20,
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: isDone ? 'var(--success)' : 'var(--border)',
              background:   isDone ? 'var(--success-bg)' : 'var(--bg)',
              color:        isDone ? 'var(--success)' : 'var(--text-3)',
              fontFamily: 'inherit',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--t)',
              whiteSpace: 'nowrap',
            }}
          >
            {isDone ? 'Completed' : 'Mark complete'}
          </button>
        </div>

        <AccordionPanel title="Learning Outcomes" resetKey={id}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {outcomes.map((o, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.86rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>→</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </AccordionPanel>

        <div style={{ borderTop: '1px solid var(--border)', padding: '18px 0' }}>
          <div style={{
            fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)',
            marginBottom: 16,
          }}>
            Tasks
          </div>

          {loading && !dataReady ? (
            <TasksSkeleton />
          ) : (
            <motion.div
              key={`tasks-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="md-content"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  a: ({ href, children, ...props }) => {
                    const isHttp = href && (href.startsWith('http://') || href.startsWith('https://'));
                    if (href && !isHttp) {
                      return <code style={{ color: 'var(--accent)', fontWeight: 500 }}>{children}</code>;
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                  },
                }}
              >
                {data?.readme || '*No content available.*'}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>

        {dataReady && (
          <motion.div
            key={`panels-${id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <HintsPanel
              sectionId={id}
              hintsMarkdown={data.hintsMarkdown || ''}
              hintsRevealed={progress.hintsRevealed}
              onRevealNext={() => progress.revealNextHint(id)}
            />

            <SolutionPanel
              sectionId={id}
              solutionFiles={data.solutionFiles || []}
            />

            <ResourcesPanel sectionId={id} resources={resources} />

            <QuizPanel
              sectionId={id}
              questions={quiz}
              quizAnswers={progress.quizAnswers}
              quizSubmitted={progress.quizSubmitted}
              onAnswer={progress.setQuizAnswer}
              onSubmit={() => progress.submitQuiz(id)}
              onRetry={() => progress.retryQuiz(id)}
            />
          </motion.div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 40, paddingTop: 24,
          borderTop: '1px solid var(--border)',
        }}>
          <button
            type="button"
            onClick={onPrev}
            style={navBtnStyle}
            onMouseEnter={e => applyHover(e, true)}
            onMouseLeave={e => applyHover(e, false)}
          >
            ← {currentIdx === 0 ? 'Overview' : 'Previous'}
          </button>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: total }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: i === currentIdx ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === currentIdx ? 'var(--accent)' : 'var(--bg-muted)',
                }}
                animate={{ width: i === currentIdx ? 20 : 7 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={currentIdx === total - 1}
            style={{
              ...navBtnStyle,
              background: 'var(--accent)',
              color: '#fff',
              borderColor: 'var(--accent)',
              opacity: currentIdx === total - 1 ? 0.4 : 1,
            }}
            onMouseEnter={e => {
              if (currentIdx < total - 1) {
                e.currentTarget.style.opacity = '0.88';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = currentIdx === total - 1 ? '0.4' : '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: '8px 18px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg)',
  color: 'var(--text-2)',
  fontFamily: 'inherit',
  fontSize: '0.84rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

function applyHover(e, on) {
  e.currentTarget.style.borderColor = on ? 'var(--border-strong)' : 'var(--border)';
  e.currentTarget.style.transform   = on ? 'translateY(-1px)' : 'translateY(0)';
}
