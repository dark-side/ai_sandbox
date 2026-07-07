import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccordionPanel from '../AccordionPanel.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPanel({ sectionId, questions = [], quizAnswers, quizSubmitted, onAnswer, onSubmit, onRetry }) {
  const answers   = quizAnswers[sectionId] || {};
  const submitted = quizSubmitted[sectionId] || false;

  if (questions.length === 0) {
    return (
      <AccordionPanel title="Knowledge Check" resetKey={sectionId}>
        <p className="panel-empty">No quiz questions for this section yet.</p>
      </AccordionPanel>
    );
  }

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const correct     = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const pct         = submitted ? Math.round((correct / questions.length) * 100) : 0;
  const passed      = pct >= 80;

  const badge = submitted
    ? `${correct}/${questions.length} (${pct}%)`
    : `${questions.length} question${questions.length !== 1 ? 's' : ''}`;

  return (
    <AccordionPanel title="Knowledge Check" badge={badge} resetKey={sectionId}>
      {/* Score bar */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              marginBottom: 16,
              borderRadius: 'var(--radius)',
              background: passed ? 'var(--success-bg)' : 'var(--warning-bg)',
              border: '1px solid',
              borderColor: passed ? 'var(--success)' : 'var(--warning)',
            }}
          >
            <span style={{
              fontSize: '0.85rem', fontWeight: 600,
              color: passed ? 'var(--success)' : 'var(--warning)',
            }}>
              {passed ? 'Passed' : 'Review needed'}: {correct} of {questions.length} correct ({pct}%)
            </span>
            <button
              onClick={onRetry}
              style={{
                fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
                padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, qi) => (
          <Question
            key={qi}
            index={qi}
            total={questions.length}
            question={q}
            selected={answers[qi]}
            submitted={submitted}
            onSelect={oi => onAnswer(sectionId, qi, oi)}
          />
        ))}
      </div>

      {/* Submit */}
      {!submitted && (
        <motion.button
          whileHover={allAnswered ? { scale: 1.01 } : {}}
          whileTap={allAnswered ? { scale: 0.99 } : {}}
          onClick={onSubmit}
          disabled={!allAnswered}
          style={{
            marginTop: 20,
            padding: '10px 24px',
            background: allAnswered ? 'var(--accent)' : 'var(--bg-muted)',
            color: allAnswered ? '#fff' : 'var(--text-4)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
          }}
        >
          {allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions to submit`}
        </motion.button>
      )}
    </AccordionPanel>
  );
}

function Question({ index, total, question, selected, submitted, onSelect }) {
  return (
    <div>
      <p style={{
        fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-4)', marginBottom: 8,
      }}>
        Question {index + 1} of {total}
        {submitted && (
          <span style={{
            marginLeft: 8,
            color: selected === question.correct ? 'var(--success)' : 'var(--danger)',
          }}>
            {selected === question.correct ? 'Correct' : 'Incorrect'}
          </span>
        )}
      </p>
      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', marginBottom: 12, lineHeight: 1.55 }}>
        {question.q}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {question.options.map((opt, oi) => {
          let bg    = 'var(--bg)';
          let bdr   = 'var(--border)';
          let clr   = 'var(--text-2)';
          let ltrBg = 'var(--bg-muted)';
          let ltrClr = 'var(--text-4)';

          if (submitted) {
            if (oi === question.correct) {
              bg = 'var(--success-bg)'; bdr = 'var(--success)'; clr = 'var(--text)';
              ltrBg = 'var(--success)'; ltrClr = '#fff';
            } else if (oi === selected && oi !== question.correct) {
              bg = 'var(--danger-bg)'; bdr = 'var(--danger)'; clr = 'var(--text-3)';
              ltrBg = 'var(--danger)'; ltrClr = '#fff';
            }
          } else if (selected === oi) {
            bg = 'var(--accent-bg)'; bdr = 'var(--accent)'; clr = 'var(--text)';
            ltrBg = 'var(--accent)'; ltrClr = '#fff';
          }

          return (
            <motion.button
              key={oi}
              onClick={() => !submitted && onSelect(oi)}
              whileHover={!submitted ? { x: 2 } : {}}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 12px',
                border: `1px solid ${bdr}`,
                borderRadius: 'var(--radius)',
                background: bg,
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                color: clr,
              }}
            >
              <span style={{
                width: 22, height: 22, minWidth: 22,
                borderRadius: '50%',
                background: ltrBg, color: ltrClr,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                flexShrink: 0, marginTop: 1,
                transition: 'background 0.15s ease, color 0.15s ease',
              }}>
                {LETTERS[oi]}
              </span>
              <span style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {submitted && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              borderLeft: `3px solid ${selected === question.correct ? 'var(--success)' : 'var(--danger)'}`,
              background: 'var(--bg-subtle)',
              fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.65,
            }}
          >
            <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>Explanation: </strong>
            {question.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
