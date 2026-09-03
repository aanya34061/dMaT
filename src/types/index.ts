export interface QuestionSolution {
  understanding: string;
  keyConceptTitle?: string;
  steps: string[];
  diagram?: string | {
    type?: 'truthTable' | 'matrix' | 'logicGate' | 'flowchart' | 'equation' | 'svg' | 'image' | 'code';
    title?: string;
    content: string;
    headers?: string[];
    rows?: string[][];
    caption?: string;
  };
  finalAnswer: string;
  wrongOptions: string[]; // explanations for why options are incorrect
  keyConcept: string;
  examTip?: string;
  commonMistakes?: string;
}

export interface Question {
  id: number;
  chapter: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[]; // ["A", "B", "C", "D"]
  correctAnswer: number; // 0-based index of option
  explanation: string;
  bookPage: number;
  image?: string;
  questionImage?: string;
  optionImages?: string[];
  solution?: QuestionSolution;
}

export interface Chapter {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  description: string;
  chapters: number[];
}

export interface ExampleItem {
  title: string;
  problem: string;
  solution: string;
  diagram?: string;
  code?: string;
}

export interface TopicConcept {
  title: string;
  content: string;
  formula?: string;
  keyPoints?: string[];
}

export interface FormulaBoxItem {
  title: string;
  formula: string;
  explanation: string;
}

export interface DiagramItem {
  title: string;
  type: 'svg' | 'table' | 'code';
  content: string;
  caption?: string;
}

export interface Topic {
  id: number;
  chapterId: number;
  chapter: string;
  topic: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  readingTime: string;
  introduction: string;
  theory: string;
  definitions?: { term: string; definition: string }[];
  importantConcepts?: TopicConcept[];
  formulaBox?: FormulaBoxItem[];
  notes?: string[];
  diagrams?: DiagramItem[];
  realWorldExamples?: ExampleItem[];
  examples?: ExampleItem[];
  importantPoints?: string[];
  commonMistakes?: string[];
  examTips?: string[];
  summary: string;
  keyTakeaways?: string[];
  quickRevisionBox?: string[];
  practiceQuestions: number[];
}

export interface TopicNote {
  id: string;
  topicId: number;
  topicTitle: string;
  chapterName: string;
  highlightedText?: string;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicBookmark {
  id: string;
  topicId: number;
  topicTitle: string;
  chapterName: string;
  type: 'topic' | 'definition' | 'example' | 'formula';
  snippet: string;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'correct' | 'incorrect' | 'bookmark' | 'quiz' | 'topic_completed';
  title: string;
  detail: string;
  timestamp: string;
}

export interface UserProgress {
  answers: { [questionId: number]: number }; // maps questionId -> selectedOptionIndex
  bookmarks: number[]; // array of bookmarked questionIds
  topicBookmarks?: TopicBookmark[];
  completedTopics?: number[]; // topic IDs
  notes?: TopicNote[];
  recentActivity: RecentActivity[];
  lastQuestionId: number | null;
}

