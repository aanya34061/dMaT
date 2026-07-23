import { useState, useEffect, useCallback } from 'react';
import { Question, Chapter, UserProgress, RecentActivity, TopicBookmark, TopicNote } from '../types';
import defaultProgress from '../data/progress.json';

const PROGRESS_KEY = 'dmat_practice_progress_v1';

export function useProgress() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    answers: {},
    bookmarks: [],
    topicBookmarks: [],
    completedTopics: [],
    notes: [],
    recentActivity: [],
    lastQuestionId: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load questions, chapters, and progress
  useEffect(() => {
    async function loadData() {
      try {
        const questionsModule = await import('../data/questions.json');
        const chaptersModule = await import('../data/chapters.json');

        setQuestions(questionsModule.default as Question[]);
        setChapters(chaptersModule.default as Chapter[]);

        const token = typeof window !== 'undefined' ? localStorage.getItem('dmat_auth_token') : null;
        if (token) {
          try {
            const res = await fetch('/api/progress', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.progress) {
              const apiProg: UserProgress = {
                answers: data.progress.answers || {},
                bookmarks: data.progress.bookmarks || [],
                topicBookmarks: data.progress.topicBookmarks || [],
                completedTopics: data.progress.completedTopics || [],
                notes: data.progress.notes || [],
                recentActivity: [],
                lastQuestionId: data.progress.lastQuestionId || null,
              };
              setProgress(apiProg);
              if (typeof window !== 'undefined') {
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(apiProg));
              }
              setIsLoaded(true);
              return;
            }
          } catch (_) {}
        }

        const stored = localStorage.getItem(PROGRESS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProgress({
            answers: parsed.answers || {},
            bookmarks: parsed.bookmarks || [],
            topicBookmarks: parsed.topicBookmarks || [],
            completedTopics: parsed.completedTopics || [],
            notes: parsed.notes || [],
            recentActivity: parsed.recentActivity || [],
            lastQuestionId: parsed.lastQuestionId || null,
          });
        } else {
          const initial: UserProgress = {
            answers: defaultProgress.answers,
            bookmarks: defaultProgress.bookmarks,
            topicBookmarks: [],
            completedTopics: [],
            notes: [],
            recentActivity: defaultProgress.recentActivity.map((act) => ({
              ...act,
              type: act.type as 'quiz' | 'correct' | 'incorrect' | 'bookmark',
              timestamp: new Date().toISOString(),
            })),
            lastQuestionId: defaultProgress.lastQuestionId,
          };
          setProgress(initial);
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(initial));
        }
      } catch (err) {
        console.error('Failed to load study data:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const saveProgress = useCallback((newProgress: UserProgress) => {
    setProgress(newProgress);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    }
  }, []);

  const submitAnswer = useCallback((questionId: number, selectedIndex: number, questionText: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const updatedAnswers = { ...prev.answers, [questionId]: selectedIndex };

      const newActivity: RecentActivity = {
        id: `act-${Date.now()}`,
        type: isCorrect ? 'correct' : 'incorrect',
        title: isCorrect ? 'Correct Answer' : 'Incorrect Answer',
        detail: `Answered: "${questionText.substring(0, 40)}..."`,
        timestamp: new Date().toISOString(),
      };

      const updated = {
        ...prev,
        answers: updatedAnswers,
        recentActivity: [newActivity, ...(prev.recentActivity || [])].slice(0, 30),
        lastQuestionId: questionId,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        const token = localStorage.getItem('dmat_auth_token');
        if (token) {
          fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questionId,
              selectedIndex,
              isCorrect,
              lastQuestionId: questionId,
            }),
          }).catch(() => {});
        }
      }
      return updated;
    });
  }, []);

  const toggleBookmark = useCallback((questionId: number, questionText: string) => {
    setProgress((prev) => {
      const isBookmarked = (prev.bookmarks || []).includes(questionId);
      let updatedBookmarks: number[];
      let detail = '';

      if (isBookmarked) {
        updatedBookmarks = (prev.bookmarks || []).filter((id) => id !== questionId);
        detail = `Removed bookmark: "${questionText.substring(0, 40)}..."`;
      } else {
        updatedBookmarks = [...(prev.bookmarks || []), questionId];
        detail = `Bookmarked: "${questionText.substring(0, 40)}..."`;
      }

      const newActivity: RecentActivity = {
        id: `act-${Date.now()}`,
        type: 'bookmark',
        title: isBookmarked ? 'Bookmark Removed' : 'Question Bookmarked',
        detail,
        timestamp: new Date().toISOString(),
      };

      const updated = {
        ...prev,
        bookmarks: updatedBookmarks,
        recentActivity: [newActivity, ...(prev.recentActivity || [])].slice(0, 30),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        const token = localStorage.getItem('dmat_auth_token');
        if (token) {
          fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookmarks: updatedBookmarks,
            }),
          }).catch(() => {});
        }
      }
      return updated;
    });
  }, []);

  const toggleTopicBookmark = useCallback((bookmarkItem: Omit<TopicBookmark, 'id' | 'createdAt'>) => {
    setProgress((prev) => {
      const existingBookmarks = prev.topicBookmarks || [];
      const index = existingBookmarks.findIndex(
        (b) => b.topicId === bookmarkItem.topicId && b.snippet === bookmarkItem.snippet && b.type === bookmarkItem.type
      );

      let updatedTopicBookmarks: TopicBookmark[];
      if (index !== -1) {
        updatedTopicBookmarks = existingBookmarks.filter((_, i) => i !== index);
      } else {
        const newBm: TopicBookmark = {
          ...bookmarkItem,
          id: `tbm-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        updatedTopicBookmarks = [newBm, ...existingBookmarks];
      }

      const updated = {
        ...prev,
        topicBookmarks: updatedTopicBookmarks,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const markTopicCompleted = useCallback((topicId: number, topicTitle?: string) => {
    setProgress((prev) => {
      const currentCompleted = prev.completedTopics || [];
      const isAlreadyCompleted = currentCompleted.includes(topicId);
      const updatedCompleted = isAlreadyCompleted
        ? currentCompleted.filter((id) => id !== topicId)
        : [...currentCompleted, topicId];

      const newActivity: RecentActivity = {
        id: `act-${Date.now()}`,
        type: 'topic_completed',
        title: isAlreadyCompleted ? 'Topic Mark Undone' : 'Topic Completed!',
        detail: topicTitle ? `Finished reading "${topicTitle}"` : `Updated topic ${topicId}`,
        timestamp: new Date().toISOString(),
      };

      const updated = {
        ...prev,
        completedTopics: updatedCompleted,
        recentActivity: [newActivity, ...(prev.recentActivity || [])].slice(0, 30),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const saveTopicNote = useCallback((
    topicId: number,
    topicTitle: string,
    chapterName: string,
    noteText: string,
    highlightedText?: string,
    noteId?: string
  ) => {
    setProgress((prev) => {
      const existingNotes = prev.notes || [];
      let updatedNotes: TopicNote[];

      if (noteId) {
        updatedNotes = existingNotes.map((n) =>
          n.id === noteId ? { ...n, noteText, highlightedText, updatedAt: new Date().toISOString() } : n
        );
      } else {
        const newNote: TopicNote = {
          id: `note-${Date.now()}`,
          topicId,
          topicTitle,
          chapterName,
          highlightedText,
          noteText,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedNotes = [newNote, ...existingNotes];
      }

      const updated = {
        ...prev,
        notes: updatedNotes,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteTopicNote = useCallback((noteId: string) => {
    setProgress((prev) => {
      const updatedNotes = (prev.notes || []).filter((n) => n.id !== noteId);
      const updated = {
        ...prev,
        notes: updatedNotes,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const setLastQuestion = useCallback((questionId: number) => {
    setProgress((prev) => {
      const updated = { ...prev, lastQuestionId: questionId };
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        const token = localStorage.getItem('dmat_auth_token');
        if (token) {
          fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lastQuestionId: questionId,
            }),
          }).catch(() => {});
        }
      }
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const initial: UserProgress = {
      answers: {},
      bookmarks: [],
      topicBookmarks: [],
      completedTopics: [],
      notes: [],
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          type: 'quiz',
          title: 'Progress Reset',
          detail: 'All answers, bookmarks, notes, and topic progress have been cleared.',
          timestamp: new Date().toISOString(),
        },
      ],
      lastQuestionId: null,
    };
    saveProgress(initial);
  }, [saveProgress]);

  return {
    isLoaded,
    questions,
    chapters,
    progress,
    submitAnswer,
    toggleBookmark,
    toggleTopicBookmark,
    markTopicCompleted,
    saveTopicNote,
    deleteTopicNote,
    setLastQuestion,
    resetProgress,
  };
}

