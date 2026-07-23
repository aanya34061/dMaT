'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  FileEdit,
  PenTool,
  HelpCircle,
  Menu,
  X,
  Share2,
  RotateCcw,
  BookMarked,
  Lightbulb,
  AlertTriangle,
  FileText,
  Star,
  Pin,
  Target,
  Layers,
  Trash2,
  Edit2
} from 'lucide-react';

import { Topic, Chapter, Subject, TopicNote, TopicBookmark } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import {
  ImportantBox,
  CommonMistakeBox,
  RememberBox,
  ExamTipBox,
  DefinitionBox,
  KeyPointBox
} from '../../components/LearnCallouts';

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    isLoaded,
    chapters,
    progress,
    markTopicCompleted,
    toggleTopicBookmark,
    saveTopicNote,
    deleteTopicNote
  } = useProgress();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [highlightText, setHighlightText] = useState<string>('');

  const readingContainerRef = useRef<HTMLDivElement>(null);

  // Load topics and subjects JSON data
  useEffect(() => {
    async function loadLearnData() {
      try {
        const topicsMod = await import('../../data/topics.json');
        const subjectsMod = await import('../../data/subjects.json');
        const loadedTopics = topicsMod.default as Topic[];
        const loadedSubjects = subjectsMod.default as Subject[];
        setTopics(loadedTopics);
        setSubjects(loadedSubjects);

        // Check query param for topic
        const topicParam = searchParams.get('topic');
        const idParam = searchParams.get('id');
        if (topicParam) {
          const matched = loadedTopics.find(
            (t) => t.id === parseInt(topicParam, 10) || t.slug === topicParam
          );
          if (matched) setSelectedTopicId(matched.id);
        } else if (idParam) {
          const matched = loadedTopics.find((t) => t.id === parseInt(idParam, 10));
          if (matched) setSelectedTopicId(matched.id);
        }
      } catch (err) {
        console.error('Failed to load learn dataset:', err);
      }
    }
    loadLearnData();
  }, [searchParams]);

  // Track scroll percentage inside reading container
  const handleScroll = () => {
    if (!readingContainerRef.current) return;
    const el = readingContainerRef.current;
    const totalHeight = el.scrollHeight - el.clientHeight;
    if (totalHeight <= 0) {
      setScrollPercentage(100);
      return;
    }
    const currentScroll = el.scrollTop;
    const pct = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
    setScrollPercentage(pct);
  };

  useEffect(() => {
    const el = readingContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [selectedTopicId, topics]);

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const handleSelectTopic = (topicId: number) => {
    setSelectedTopicId(topicId);
    setSidebarOpen(false);
    if (readingContainerRef.current) {
      readingContainerRef.current.scrollTop = 0;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('topic', String(topicId));
    router.push(`/learn?${params.toString()}`);
  };

  const toggleChapterExpand = (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Search filtering
  const filteredTopics = topics.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = t.topic.toLowerCase().includes(q);
    const chapterMatch = t.chapter.toLowerCase().includes(q);
    const defMatch = t.definitions?.some(
      (d) => d.term.toLowerCase().includes(q) || d.definition.toLowerCase().includes(q)
    );
    const formulaMatch = t.formulaBox?.some(
      (f) => f.title.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q)
    );
    const exampleMatch = t.examples?.some(
      (e) => e.title.toLowerCase().includes(q) || e.problem.toLowerCase().includes(q)
    );
    const theoryMatch = t.theory.toLowerCase().includes(q);
    return nameMatch || chapterMatch || defMatch || formulaMatch || exampleMatch || theoryMatch;
  });

  const isCompleted = activeTopic ? (progress.completedTopics || []).includes(activeTopic.id) : false;

  const isTopicBookmarked = activeTopic
    ? (progress.topicBookmarks || []).some(
        (b) => b.topicId === activeTopic.id && b.type === 'topic'
      )
    : false;

  const activeNotes = activeTopic
    ? (progress.notes || []).filter((n) => n.topicId === activeTopic.id)
    : [];

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeTopic) return;
    saveTopicNote(
      activeTopic.id,
      activeTopic.topic,
      activeTopic.chapter,
      noteInput.trim(),
      highlightText.trim() || undefined,
      editingNoteId || undefined
    );
    setNoteInput('');
    setHighlightText('');
    setEditingNoteId(null);
    setShowNoteModal(false);
  };

  const handleEditNote = (note: TopicNote) => {
    setEditingNoteId(note.id);
    setNoteInput(note.noteText);
    setHighlightText(note.highlightedText || '');
    setShowNoteModal(true);
  };

  // Navigation between topics
  const activeIdx = topics.findIndex((t) => t.id === selectedTopicId);
  const prevTopic = activeIdx > 0 ? topics[activeIdx - 1] : null;
  const nextTopic = activeIdx < topics.length - 1 ? topics[activeIdx + 1] : null;

  if (!isLoaded || topics.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-12 text-slate-500 font-semibold">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="w-10 h-10 text-blue-600 animate-pulse" />
          <p>Loading Learning Center theory...</p>
        </div>
      </div>
    );
  }

  const completedCount = (progress.completedTopics || []).length;
  const totalTopicsCount = topics.length;
  const overallProgressPct = Math.round((completedCount / totalTopicsCount) * 100);

  return (
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* MOBILE SIDEBAR TOGGLE BAR */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
        >
          <Menu className="w-4 h-4 text-blue-600" />
          Topics & Navigation
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Reading: <span className="text-blue-600 font-bold">{activeTopic.topic}</span>
        </span>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                Learning Center
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topic, formula, term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          {/* Overall Reading Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Course Progress</span>
              <span className="text-blue-600 font-bold">{completedCount}/{totalTopicsCount} Topics ({overallProgressPct}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters & Topics List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {chapters.map((ch) => {
            const chTopics = filteredTopics.filter((t) => t.chapterId === ch.id);
            if (chTopics.length === 0 && searchQuery) return null;

            const isExpanded = expandedChapters[ch.id] ?? true;
            const chCompletedCount = chTopics.filter((t) =>
              (progress.completedTopics || []).includes(t.id)
            ).length;

            return (
              <div key={ch.id} className="space-y-1">
                <button
                  onClick={() => toggleChapterExpand(ch.id)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {ch.id}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">
                      {ch.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">
                      {chCompletedCount}/{chTopics.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                    {chTopics.map((t) => {
                      const isActive = t.id === selectedTopicId;
                      const isTopicDone = (progress.completedTopics || []).includes(t.id);

                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTopic(t.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-sm'
                              : 'text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isTopicDone ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-white' : 'text-emerald-500'
                                }`}
                              />
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isActive ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                            )}
                            <span className="truncate">{t.topic}</span>
                          </div>

                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                              isActive
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {t.readingTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN TOPIC DISPLAY AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative">
        {/* STICKY TOP READING BAR */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          {/* Reading Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{ width: `${scrollPercentage}%` }}
            />
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/40">
              {activeTopic.chapter}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <h1 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-sm">
              {activeTopic.topic}
            </h1>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeTopic.readingTime} read</span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activeTopic.difficulty}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-bold">{scrollPercentage}% scrolled</span>
            </div>

            {/* Bookmark Topic Button */}
            <button
              onClick={() =>
                toggleTopicBookmark({
                  topicId: activeTopic.id,
                  topicTitle: activeTopic.topic,
                  chapterName: activeTopic.chapter,
                  type: 'topic',
                  snippet: activeTopic.summary
                })
              }
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isTopicBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="Bookmark Topic"
            >
              {isTopicBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {isTopicBookmarked ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>

            {/* Personal Note Button */}
            <button
              onClick={() => {
                setEditingNoteId(null);
                setNoteInput('');
                setHighlightText('');
                setShowNoteModal(true);
              }}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <FileEdit className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">Notes ({activeNotes.length})</span>
            </button>

            {/* Mark as Completed Button */}
            <button
              onClick={() => markTopicCompleted(activeTopic.id, activeTopic.topic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
            </button>
          </div>
        </header>

        {/* READING CONTAINER */}
        <div
          ref={readingContainerRef}
          className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-16 max-w-4xl mx-auto w-full space-y-10 scroll-smooth leading-relaxed"
        >
          {/* HIERARCHY BREADCRUMBS */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span>Subject: Digital Mathematics (dMAT)</span>
            <ChevronRight className="w-3 h-3" />
            <span>{activeTopic.chapter}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {activeTopic.topic}
            </span>
          </nav>

          {/* TOPIC TITLE & INTRO */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Chapter {activeTopic.chapterId}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {activeTopic.difficulty} Level
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                ⏱ {activeTopic.readingTime} Estimated
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {activeTopic.topic}
            </h1>

            <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border-l-4 border-blue-600">
              {activeTopic.introduction}
            </p>
          </div>

          {/* DEFINITIONS SECTION */}
          {activeTopic.definitions && activeTopic.definitions.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-violet-500" />
                Key Definitions
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeTopic.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 space-y-1 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-violet-900 dark:text-violet-300">
                        {def.term}
                      </h3>
                      <button
                        onClick={() =>
                          toggleTopicBookmark({
                            topicId: activeTopic.id,
                            topicTitle: activeTopic.topic,
                            chapterName: activeTopic.chapter,
                            type: 'definition',
                            snippet: `${def.term}: ${def.definition}`
                          })
                        }
                        className="text-violet-400 hover:text-violet-600 transition-colors p-1"
                        title="Bookmark Definition"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FORMULA BOX */}
          {activeTopic.formulaBox && activeTopic.formulaBox.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Formula Box
              </h2>
              {activeTopic.formulaBox.map((f, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-md border border-indigo-900/50"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      {f.title}
                    </span>
                    <button
                      onClick={() =>
                        toggleTopicBookmark({
                          topicId: activeTopic.id,
                          topicTitle: activeTopic.topic,
                          chapterName: activeTopic.chapter,
                          type: 'formula',
                          snippet: `${f.title} -> ${f.formula}`
                        })
                      }
                      className="text-indigo-300 hover:text-white transition-colors"
                      title="Bookmark Formula"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl text-center font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wide border border-indigo-500/30">
                    {f.formula}
                  </div>
                  <p className="text-xs text-indigo-200">{f.explanation}</p>
                </div>
              ))}
            </section>
          )}

          {/* MAIN THEORY TEXT */}
          <section className="space-y-6 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Complete Theory & Analysis
            </h2>
            <div className="prose dark:prose-invert max-w-none space-y-4">
              {activeTopic.theory.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className="text-xl font-extrabold text-slate-900 dark:text-white mt-6 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4
                      key={idx}
                      className="text-base font-bold text-blue-600 dark:text-blue-400 mt-4 mb-1"
                    >
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                return (
                  <p key={idx} className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </section>

          {/* DIAGRAMS & TABLES */}
          {activeTopic.diagrams && activeTopic.diagrams.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Visual Diagrams & Layouts
              </h2>
              {activeTopic.diagrams.map((diag, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {diag.title}
                  </h3>

                  {diag.type === 'table' ? (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {diag.content.split('\n').map((row, rIdx) => {
                            if (row.includes('---')) return null;
                            const cells = row.split('|').filter(Boolean);
                            if (cells.length === 0) return null;
                            const isHeader = rIdx === 0;
                            return (
                              <tr
                                key={rIdx}
                                className={`border-b border-slate-200 dark:border-slate-800 ${
                                  isHeader ? 'bg-slate-200/60 dark:bg-slate-800 font-bold' : ''
                                }`}
                              >
                                {cells.map((c, cIdx) => (
                                  <td key={cIdx} className="p-2.5">
                                    {c.trim()}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto">
                      {diag.content}
                    </pre>
                  )}

                  {diag.caption && (
                    <p className="text-xs text-slate-400 italic">{diag.caption}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* SPECIAL CALLOUT BOXES */}
          <section className="space-y-4">
            {activeTopic.importantPoints && activeTopic.importantPoints.length > 0 && (
              <ImportantBox title="Important Points">
                <ul className="list-disc pl-4 space-y-1">
                  {activeTopic.importantPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </ImportantBox>
            )}

            {activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0 && (
              <CommonMistakeBox title="Common Mistakes to Avoid">
                <ul className="list-disc pl-4 space-y-1">
                  {activeTopic.commonMistakes.map((cm, i) => (
                    <li key={i}>{cm}</li>
                  ))}
                </ul>
              </CommonMistakeBox>
            )}

            {activeTopic.examTips && activeTopic.examTips.length > 0 && (
              <ExamTipBox title="Exam Tips">
                <ul className="list-disc pl-4 space-y-1">
                  {activeTopic.examTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </ExamTipBox>
            )}
          </section>

          {/* STEP-BY-STEP WORKED EXAMPLES */}
          {activeTopic.examples && activeTopic.examples.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Step-by-Step Worked Examples
              </h2>
              {activeTopic.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      📌 {ex.title}
                    </h3>
                    <button
                      onClick={() =>
                        toggleTopicBookmark({
                          topicId: activeTopic.id,
                          topicTitle: activeTopic.topic,
                          chapterName: activeTopic.chapter,
                          type: 'example',
                          snippet: `${ex.title}: ${ex.problem}`
                        })
                      }
                      className="text-slate-400 hover:text-amber-500"
                      title="Bookmark Example"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">
                    <strong>Problem:</strong> {ex.problem}
                  </p>
                  <div className="text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <strong>Step-by-step Solution:</strong>
                    <p className="mt-1 whitespace-pre-line">{ex.solution}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* REAL WORLD EXAMPLES */}
          {activeTopic.realWorldExamples && activeTopic.realWorldExamples.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                Real-World Applications
              </h2>
              {activeTopic.realWorldExamples.map((rw, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2"
                >
                  <h3 className="font-extrabold text-sm text-purple-900 dark:text-purple-300">
                    🌍 {rw.title}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{rw.problem}</p>
                  <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                    Solution: {rw.solution}
                  </p>
                  {rw.code && (
                    <pre className="p-3 rounded-xl bg-slate-900 text-purple-300 text-xs font-mono overflow-x-auto">
                      {rw.code}
                    </pre>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* SUMMARY & KEY TAKEAWAYS */}
          <section className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/50 border border-blue-100 dark:border-indigo-900/40 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Summary & Key Takeaways
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {activeTopic.summary}
            </p>

            {activeTopic.keyTakeaways && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-blue-800 dark:text-blue-300">
                  Quick Takeaways
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeTopic.keyTakeaways.map((kt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{kt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* QUICK REVISION BOX */}
          {activeTopic.quickRevisionBox && activeTopic.quickRevisionBox.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                ⚡ Quick Revision Box
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeTopic.quickRevisionBox.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* END OF TOPIC FOOTER & PRACTICE INTEGRATION */}
          <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    Topic Completed!
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold text-sm">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Topic In Progress
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => markTopicCompleted(activeTopic.id, activeTopic.topic)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isCompleted ? 'Mark as Incomplete' : '✓ Complete Topic'}
                </button>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Practice Now Button */}
              <Link
                href={`/practice?chapter=${encodeURIComponent(
                  activeTopic.chapter
                )}&topic=${encodeURIComponent(activeTopic.topic)}`}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <PenTool className="w-4 h-4" />
                📝 Practice Now ({activeTopic.practiceQuestions.length} Questions)
              </Link>

              {/* Take Notes Button */}
              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteInput('');
                  setHighlightText('');
                  setShowNoteModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <FileEdit className="w-4 h-4 text-blue-400" />
                Take Notes for this Topic
              </button>
            </div>

            {/* Previous & Next Navigation */}
            <div className="flex items-center justify-between gap-4 pt-4">
              {prevTopic ? (
                <button
                  onClick={() => handleSelectTopic(prevTopic.id)}
                  className="flex items-center gap-2 text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all max-w-[48%]"
                >
                  <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Previous Topic
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {prevTopic.topic}
                    </span>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {nextTopic ? (
                <button
                  onClick={() => handleSelectTopic(nextTopic.id)}
                  className="flex items-center gap-2 text-right p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-all max-w-[48%] ml-auto"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                      Next Topic
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {nextTopic.topic}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </footer>
        </div>
      </main>

      {/* PERSONAL NOTES MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-blue-600" />
                Personal Note for {activeTopic.topic}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Highlighted snippet */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                Highlighted Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Formula: Total Bytes = (N * 32)/8"
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Note Text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Your Study Note</label>
              <textarea
                rows={4}
                placeholder="Write your detailed personal observations, reminders, or insights here..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Existing Notes for this Topic */}
            {activeNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto">
                <span className="text-xs font-bold text-slate-400">Saved Notes for Topic:</span>
                {activeNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs flex justify-between items-start gap-2"
                  >
                    <div>
                      {n.highlightedText && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 italic">
                          "{n.highlightedText}"
                        </p>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{n.noteText}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditNote(n)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Edit Note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTopicNote(n.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading Learning Center...</div>}>
      <LearnContent />
    </Suspense>
  );
}
