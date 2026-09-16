import { MockTestConfig, QuestionSection } from '@/types/mockTest';

export const FULL_MOCK_PAPERS = [
  'full-mock-1',
  'full-mock-2',
  'full-mock-3',
  'full-mock-4',
  'full-mock-5',
] as const;

export const MOCK_TEST_CONFIGS: Record<string, MockTestConfig> = {
  'full-mock-1': {
    id: 'full-mock-1',
    title: 'dMAT Full Mock 1',
    subtitle: 'Diagnostic Baseline Simulation (Core + General Academic)',
    description:
      'Full-length 80-question diagnostic exam establishing your baseline score across Figure Sequences, Equations, Latin Squares, and General Academic data problem-solving under official 120-minute CBT conditions.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-mock-2': {
    id: 'full-mock-2',
    title: 'dMAT Full Mock 2',
    subtitle: 'Analytical Proficiency Benchmark (Core + General Academic)',
    description:
      'Second non-overlapping 80-question full-length exam evaluating multi-step linear elimination, 3x3 grid transitions, 5x5 Latin square constraints, and economic trend analysis.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-mock-3': {
    id: 'full-mock-3',
    title: 'dMAT Full Mock 3',
    subtitle: 'Speed & Spatial Deduction Exam (Core + General Academic)',
    description:
      'Third non-overlapping 80-question full simulation focusing on rapid mental rotation, non-linear substitutions, Latin square exclusions, and technical engineering data sets.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-mock-4': {
    id: 'full-mock-4',
    title: 'dMAT Full Mock 4',
    subtitle: 'Rigorous Simulation & Complex Constraints (Core + General Academic)',
    description:
      'Advanced non-overlapping 80-question CBT exam featuring multi-variable balance scales, 6x6 Latin square row/column deduction, and complex clinical trial statistics.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-mock-5': {
    id: 'full-mock-5',
    title: 'dMAT Full Mock 5',
    subtitle: 'Final Mastery & Exam Readiness (Core + General Academic)',
    description:
      'The pinnacle 80-question simulation calibrated to top percentile standards, verifying speed, precision, and endurance across all dMAT cognitive and academic faculties.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-standard': {
    id: 'full-standard',
    title: 'dMAT Full-Length Simulation',
    subtitle: 'Official Exam Format (Core + General Academic)',
    description:
      'Complete computer-based aptitude simulation matching official dMAT distribution: Data Types, Combinational Logic, Linear Transformations, Figure Sequences, Mathematical Equations, Latin Squares, and General Academic problem solving.',
    module: 'all',
    totalTimeMinutes: 120,
    questionCount: 80,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 10 },
      { section: 'Combinational Logic', count: 10 },
      { section: 'Linear Transformations', count: 10 },
      { section: 'Figure Sequences', count: 15 },
      { section: 'Mathematical Equations', count: 15 },
      { section: 'Latin Squares', count: 10 },
      { section: 'General Academic', count: 10 },
    ],
    difficultyDistribution: {
      Easy: 20,
      Medium: 40,
      Hard: 15,
      'Very Hard': 5,
    },
  },

  'full-express': {
    id: 'full-express',
    title: 'Express Full Mock',
    subtitle: 'Fast 60-Minute Comprehensive Benchmark',
    description:
      'A compact, high-yield diagnostic simulation covering all dMAT exam curriculum domains in 60 minutes. Ideal for daily benchmarking and rhythm development.',
    module: 'all',
    totalTimeMinutes: 60,
    questionCount: 40,
    passingPercentage: 65,
    sectionQuotas: [
      { section: 'Data Types', count: 5 },
      { section: 'Combinational Logic', count: 5 },
      { section: 'Linear Transformations', count: 5 },
      { section: 'Figure Sequences', count: 7 },
      { section: 'Mathematical Equations', count: 8 },
      { section: 'Latin Squares', count: 5 },
      { section: 'General Academic', count: 5 },
    ],
    difficultyDistribution: {
      Easy: 10,
      Medium: 20,
      Hard: 8,
      'Very Hard': 2,
    },
  },

  'sec-data-types': {
    id: 'sec-data-types',
    title: 'Data Types Sectional',
    subtitle: 'Core Module: Memory Footprint & Type Systems',
    description:
      'Intensive drill on memory footprint calculations, IEEE 754 floating-point layouts, widening conversions, narrowing truncation, and integer division truncation.',
    module: 'core',
    section: 'Data Types',
    totalTimeMinutes: 35,
    questionCount: 25,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 6,
      Medium: 13,
      Hard: 5,
      'Very Hard': 1,
    },
  },

  'sec-combinational-logic': {
    id: 'sec-combinational-logic',
    title: 'Combinational Logic Sectional',
    subtitle: 'Core Module: Boolean Functions & Logic Gates',
    description:
      'Speed deductions on truth tables, security sensor logic, cascaded gate expressions, De Morgan transformations, and Canonical Disjunctive Normal Form (CDNF).',
    module: 'core',
    section: 'Combinational Logic',
    totalTimeMinutes: 35,
    questionCount: 25,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 6,
      Medium: 13,
      Hard: 5,
      'Very Hard': 1,
    },
  },

  'sec-linear-transformations': {
    id: 'sec-linear-transformations',
    title: 'Linear Transformations Sectional',
    subtitle: 'Core Module: Matrices, Eigenvalues & Projections',
    description:
      'Timed drills on 2x2/3x3 matrix rank, Rank-Nullity Theorem, characteristic polynomials, eigenvalue spectra, matrix invertibility, dot products, and PCA/LDA.',
    module: 'core',
    section: 'Linear Transformations',
    totalTimeMinutes: 35,
    questionCount: 25,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 6,
      Medium: 13,
      Hard: 5,
      'Very Hard': 1,
    },
  },

  'sec-figure-sequences': {
    id: 'sec-figure-sequences',
    title: 'Figure Sequences Sectional',
    subtitle: 'Core Module: Spatial & Pattern Recognition',
    description:
      'Intensive drill on geometric rotations, perimeter progressions, shape morphing, element transformations, and interleaved visual logic rules.',
    module: 'core',
    section: 'Figure Sequences',
    totalTimeMinutes: 35,
    questionCount: 25,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 6,
      Medium: 13,
      Hard: 5,
      'Very Hard': 1,
    },
  },

  'sec-math-equations': {
    id: 'sec-math-equations',
    title: 'Mathematical Equations Sectional',
    subtitle: 'Core Module: Symbolic & Deductive Math',
    description:
      'Timed deduction focusing on variable systems, symbolic balances, non-linear substitutions, inequalities, and multi-step deduction without scrap paper.',
    module: 'core',
    section: 'Mathematical Equations',
    totalTimeMinutes: 40,
    questionCount: 25,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 6,
      Medium: 12,
      Hard: 5,
      'Very Hard': 2,
    },
  },

  'sec-latin-squares': {
    id: 'sec-latin-squares',
    title: 'Latin Squares Sectional',
    subtitle: 'Core Module: Grid Elimination & Logic Constraints',
    description:
      'Puzzles on 4x4, 5x5, and 6x6 grids testing row/column uniqueness, dual-axis exclusion, and cascading elimination strategies.',
    module: 'core',
    section: 'Latin Squares',
    totalTimeMinutes: 30,
    questionCount: 20,
    passingPercentage: 70,
    difficultyDistribution: {
      Easy: 5,
      Medium: 10,
      Hard: 4,
      'Very Hard': 1,
    },
  },

  'sec-general-academic': {
    id: 'sec-general-academic',
    title: 'General Academic Module Sectional',
    subtitle: 'APS India Focus: Academic Data Interpretation',
    description:
      'Crucial for Indian APS applicants in Engineering, Economics, and Management. Evaluates application of data tables, charts, experiment analysis, and logical transfer skills.',
    module: 'general_academic',
    section: 'General Academic',
    totalTimeMinutes: 40,
    questionCount: 25,
    passingPercentage: 65,
    difficultyDistribution: {
      Easy: 6,
      Medium: 13,
      Hard: 5,
      'Very Hard': 1,
    },
  },
};

export const SECTION_METADATA: Record<
  QuestionSection,
  {
    iconName: string;
    badgeColor: string;
    description: string;
    module: 'Core Module' | 'General Academic Module';
    recommendedTimePerQuestion: number; // in seconds
  }
> = {
  'Data Types': {
    iconName: 'Binary',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    description: 'Memory allocation, IEEE 754 layouts, type conversion, and integer division.',
    module: 'Core Module',
    recommendedTimePerQuestion: 75,
  },
  'Combinational Logic': {
    iconName: 'ToggleLeft',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Truth tables, Boolean algebra, logic gate combinations, and CDNF canonical forms.',
    module: 'Core Module',
    recommendedTimePerQuestion: 75,
  },
  'Linear Transformations': {
    iconName: 'Sliders',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: 'Matrix rank, Rank-Nullity Theorem, eigenvalues, matrix invertibility, and PCA/LDA.',
    module: 'Core Module',
    recommendedTimePerQuestion: 85,
  },
  'Figure Sequences': {
    iconName: 'Shapes',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Spatial patterns, matrix sequence rules, boundary bouncing, and multi-symbol progression.',
    module: 'Core Module',
    recommendedTimePerQuestion: 80,
  },
  'Mathematical Equations': {
    iconName: 'Calculator',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Linear equations, substitution methods, four-variable systems, and simultaneous elimination.',
    module: 'Core Module',
    recommendedTimePerQuestion: 90,
  },
  'Latin Squares': {
    iconName: 'Grid3X3',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Latin square fundamentals, row/column constraints, intermediary cells, and intersection strategies.',
    module: 'Core Module',
    recommendedTimePerQuestion: 85,
  },
  'General Academic': {
    iconName: 'GraduationCap',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Academic problem-solving, graph & table interpretation, and scenario deduction.',
    module: 'General Academic Module',
    recommendedTimePerQuestion: 95,
  },
};
