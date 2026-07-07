import { useState, useCallback } from 'react';

const KEY = 'payflow-v2-progress';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage full */ }
}

/**
 * Custom hook for persisted learning progress.
 * Returns state and updaters for completion, hints-revealed, quiz answers.
 */
export function useProgress() {
  const [state, setState] = useState(() => ({
    completed: {},
    hintsRevealed: {},   // sectionId -> count
    quizAnswers: {},     // sectionId -> { qIdx: optionIdx }
    quizSubmitted: {},   // sectionId -> boolean
    ...load(),
  }));

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const toggleComplete = useCallback((sectionId) => {
    setState(prev => {
      const next = {
        ...prev,
        completed: { ...prev.completed, [sectionId]: !prev.completed[sectionId] },
      };
      save(next);
      return next;
    });
  }, []);

  const revealNextHint = useCallback((sectionId) => {
    setState(prev => {
      const current = prev.hintsRevealed[sectionId] || 0;
      const next = {
        ...prev,
        hintsRevealed: { ...prev.hintsRevealed, [sectionId]: current + 1 },
      };
      save(next);
      return next;
    });
  }, []);

  const setQuizAnswer = useCallback((sectionId, qIdx, optionIdx) => {
    setState(prev => {
      const sectionAnswers = { ...(prev.quizAnswers[sectionId] || {}), [qIdx]: optionIdx };
      const next = {
        ...prev,
        quizAnswers: { ...prev.quizAnswers, [sectionId]: sectionAnswers },
      };
      save(next);
      return next;
    });
  }, []);

  const submitQuiz = useCallback((sectionId) => {
    setState(prev => {
      const next = {
        ...prev,
        quizSubmitted: { ...prev.quizSubmitted, [sectionId]: true },
      };
      save(next);
      return next;
    });
  }, []);

  const retryQuiz = useCallback((sectionId) => {
    setState(prev => {
      const next = {
        ...prev,
        quizAnswers: { ...prev.quizAnswers, [sectionId]: {} },
        quizSubmitted: { ...prev.quizSubmitted, [sectionId]: false },
      };
      save(next);
      return next;
    });
  }, []);

  const completedCount = Object.values(state.completed).filter(Boolean).length;

  return {
    ...state,
    completedCount,
    toggleComplete,
    revealNextHint,
    setQuizAnswer,
    submitQuiz,
    retryQuiz,
  };
}
