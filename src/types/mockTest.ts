export type QuestionModule = 'core' | 'general_academic';

export type QuestionSection =
  | 'Data Types'
  | 'Combinational Logic'
  | 'Linear Transformations'
  | 'Figure Sequences'
  | 'Mathematical Equations'
  | 'Latin Squares'
  | 'General Academic';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type MockQuestionType =
  | 'figure_sequence'
  | 'equation'
  | 'latin_square'
  | 'general_academic'
  | 'multiple_choice';

export interface SvgFigureFrame {
  id: string;
  label?: string;
  svgContent: string; // inner SVG elements or complete SVG string
}

export interface LatinSquareVisualData {
  size: number; // 4, 5, 6
  symbols: string[]; // e.g. ["1", "2", "3", "4"] or ["A", "B", "C", "D"]
  grid: (string | null)[][]; // null represents empty or "?" cell
  targetCell: { row: number; col: number };
  symbolType: 'numbers' | 'letters' | 'symbols';
}

export interface FigureSequenceVisualData {
  frames: SvgFigureFrame[]; // Sequence frames (e.g. 1 to 4 or 5)
  questionIndex: number; // index of the missing frame, usually 4 or 5
  optionFrames?: SvgFigureFrame[]; // Option figures A, B, C, D if visual
  ruleDescription?: string;
}

export interface AcademicDataVisual {
  type: 'table' | 'bar_chart' | 'line_chart' | 'scatter' | 'diagram';
  title?: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      values: number[];
      color?: string;
    }[];
  };
  caption?: string;
}

export interface MockVisualData {
  type: 'figure_sequence' | 'latin_square' | 'academic_data' | 'svg' | 'equation_system';
  figureData?: FigureSequenceVisualData;
  latinSquareData?: LatinSquareVisualData;
  academicData?: AcademicDataVisual;
  svgString?: string;
}

export interface MockQuestion {
  id: string;
  module: QuestionModule;
  section: QuestionSection;
  topic: string;
  subtopic: string;
  difficulty: QuestionDifficulty;
  questionType: MockQuestionType;
  questionText: string;
  visualData?: MockVisualData;
  options: string[]; // Exactly 4 options: [A, B, C, D]
  correctAnswer: number; // 0-based index: 0, 1, 2, 3
  explanation: string;
  solutionSteps: string[];
  estimatedTime: number; // in seconds, e.g. 75, 90, 120
  sourceType: 'original' | 'official_reference' | 'user_created';
  sourceReference?: string;
  tags: string[];
  enabled?: boolean;
}

export interface MockDifficultyDistribution {
  Easy: number;
  Medium: number;
  Hard: number;
  'Very Hard'?: number;
}

export interface MockTestConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  module: 'core' | 'general_academic' | 'all';
  section?: QuestionSection;
  totalTimeMinutes: number;
  questionCount: number;
  passingPercentage: number;
  sectionQuotas?: {
    section: QuestionSection;
    count: number;
  }[];
  difficultyDistribution: MockDifficultyDistribution;
}

export type QuestionAttemptStatus =
  | 'unanswered'
  | 'answered'
  | 'marked'
  | 'marked_answered';

export interface MockSessionState {
  sessionId: string;
  configId: string;
  testTitle: string;
  mode: 'full' | 'sectional' | 'custom';
  sectionName?: QuestionSection;
  questions: MockQuestion[];
  answers: Record<string, number>; // questionId -> selected option index
  statuses: Record<string, QuestionAttemptStatus>; // questionId -> status
  questionTimes: Record<string, number>; // questionId -> time in seconds spent
  currentIndex: number;
  startedAt: string;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  examMode: boolean;
  isSubmitted: boolean;
  submittedAt?: string;
}

export interface SectionBreakdownItem {
  section: QuestionSection;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  timeSpentSeconds: number;
}

export interface DifficultyBreakdownItem {
  difficulty: QuestionDifficulty;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface WeakTopicAnalysis {
  topic: string;
  section: QuestionSection;
  incorrectCount: number;
  accuracy: number;
  recommendation: string;
  practiceUrl: string;
}

export interface StrongTopicAnalysis {
  topic: string;
  section: QuestionSection;
  accuracy: number;
}

export interface QuestionResultItem {
  questionId: string;
  questionNumber: number;
  section: QuestionSection;
  topic: string;
  difficulty: QuestionDifficulty;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  status: 'correct' | 'incorrect' | 'skipped';
  wasMarked: boolean;
  explanation: string;
  solutionSteps: string[];
}

export interface MockResult {
  id: string;
  sessionId: string;
  configId?: string;
  userId?: string;
  testTitle: string;
  mode: 'full' | 'sectional' | 'custom';
  sectionName?: QuestionSection;
  completedAt: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  markedForReviewCount: number;
  score: number;
  percentage: number;
  accuracy: number;
  passed: boolean;
  totalDurationSeconds: number;
  timeTakenSeconds: number;
  averageTimePerQuestionSeconds: number;
  fastestQuestion?: { questionId: string; questionNumber: number; timeSeconds: number; isCorrect: boolean };
  slowestQuestion?: { questionId: string; questionNumber: number; timeSeconds: number; isCorrect: boolean };
  sectionBreakdown: SectionBreakdownItem[];
  difficultyBreakdown: DifficultyBreakdownItem[];
  weakTopics: WeakTopicAnalysis[];
  strongTopics: StrongTopicAnalysis[];
  questionResults: QuestionResultItem[];
}
