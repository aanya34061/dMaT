import { MockQuestion, QuestionSection, MockTestConfig } from '@/types/mockTest';
import dataTypes from './dataTypes.json';
import combinationalLogic from './combinationalLogic.json';
import linearTransformations from './linearTransformations.json';
import figureSequences from './figureSequences.json';
import mathematicalEquations from './mathematicalEquations.json';
import latinSquares from './latinSquares.json';
import generalAcademic from './generalAcademic.json';

export const ALL_MOCK_QUESTIONS: MockQuestion[] = [
  ...(dataTypes as MockQuestion[]),
  ...(combinationalLogic as MockQuestion[]),
  ...(linearTransformations as MockQuestion[]),
  ...(figureSequences as MockQuestion[]),
  ...(mathematicalEquations as MockQuestion[]),
  ...(latinSquares as MockQuestion[]),
  ...(generalAcademic as MockQuestion[]),
];

export function getAllMockQuestions(): MockQuestion[] {
  return ALL_MOCK_QUESTIONS.filter((q) => q.enabled !== false);
}

export function getMockQuestionsBySection(section: QuestionSection): MockQuestion[] {
  return ALL_MOCK_QUESTIONS.filter((q) => q.section === section && q.enabled !== false);
}

/**
 * Fisher-Yates shuffle helper
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Dedicated partition for the 5 official Full Mock Papers (Paper 1 to Paper 5).
 * Each paper receives exactly 80 questions covering ALL syllabus topics:
 * - Data Types (10 questions)
 * - Combinational Logic (10 questions)
 * - Linear Transformations (10 questions)
 * - Figure Sequences (15 questions)
 * - Mathematical Equations (15 questions)
 * - Latin Squares (10 questions)
 * - General Academic (10 questions)
 * Total: 80 Questions / 120 Minutes.
 * Across all 5 papers, questions are strictly non-overlapping (0 duplicate questions).
 */
export function getFullMockPaperQuestions(paperNum: number): MockQuestion[] {
  const p = Math.max(0, Math.min(4, paperNum - 1)); // 0, 1, 2, 3, 4

  const dtList = dataTypes as MockQuestion[];
  const clList = combinationalLogic as MockQuestion[];
  const ltList = linearTransformations as MockQuestion[];
  const figList = figureSequences as MockQuestion[];
  const matList = mathematicalEquations as MockQuestion[];
  const latList = latinSquares as MockQuestion[];
  const genList = generalAcademic as MockQuestion[];

  // 1. Data Types (10 questions: 4 memory allocation, 3 type conversion, 3 integer division)
  const paperDT: MockQuestion[] = [
    ...dtList.slice(0 + p * 4, 0 + p * 4 + 4),
    ...dtList.slice(25 + p * 3, 25 + p * 3 + 3),
    ...dtList.slice(50 + p * 3, 50 + p * 3 + 3),
  ];

  // 2. Combinational Logic (10 questions: 4 truth tables, 3 circuits, 3 cdnf)
  const paperCL: MockQuestion[] = [
    ...clList.slice(0 + p * 4, 0 + p * 4 + 4),
    ...clList.slice(25 + p * 3, 25 + p * 3 + 3),
    ...clList.slice(50 + p * 3, 50 + p * 3 + 3),
  ];

  // 3. Linear Transformations (10 questions: 4 rank/maps, 3 eigenvalues, 3 pca/lda)
  const paperLT: MockQuestion[] = [
    ...ltList.slice(0 + p * 4, 0 + p * 4 + 4),
    ...ltList.slice(25 + p * 3, 25 + p * 3 + 3),
    ...ltList.slice(50 + p * 3, 50 + p * 3 + 3),
  ];

  // 4. Figure Sequences (15 questions: 5 spatial patterns, 5 boundary bouncing, 5 multi-symbol)
  const paperFigs: MockQuestion[] = [
    ...figList.slice(0 + p * 5, 0 + p * 5 + 5),
    ...figList.slice(26 + p * 5, 26 + p * 5 + 5),
    ...figList.slice(78 + p * 5, 78 + p * 5 + 5),
  ];

  // 5. Mathematical Equations (15 questions: 5 linear, 5 substitution, 5 four-variable/recurrence)
  const paperMats: MockQuestion[] = [
    ...matList.slice(0 + p * 5, 0 + p * 5 + 5),
    ...matList.slice(35 + p * 5, 35 + p * 5 + 5),
    ...matList.slice(100 + p * 5, 100 + p * 5 + 5),
  ];

  // 6. Latin Squares (10 questions: 4 of 4x4, 3 of 5x5, 3 of 6x6)
  const paperLats: MockQuestion[] = [
    ...latList.slice(0 + p * 4, 0 + p * 4 + 4),
    ...latList.slice(35 + p * 3, 35 + p * 3 + 3),
    ...latList.slice(75 + p * 3, 75 + p * 3 + 3),
  ];

  // 7. General Academic (10 questions: 2 per domain across 5 faculties)
  const paperGens: MockQuestion[] = [
    ...genList.slice(0 * 51 + p * 2, 0 * 51 + p * 2 + 2),
    ...genList.slice(1 * 51 + p * 2, 1 * 51 + p * 2 + 2),
    ...genList.slice(2 * 51 + p * 2, 2 * 51 + p * 2 + 2),
    ...genList.slice(3 * 51 + p * 2, 3 * 51 + p * 2 + 2),
    ...genList.slice(4 * 51 + p * 2, 4 * 51 + p * 2 + 2),
  ];

  // Standard dMAT CBT Section Sequence
  return [
    ...paperDT,
    ...paperCL,
    ...paperLT,
    ...paperFigs,
    ...paperMats,
    ...paperLats,
    ...paperGens,
  ];
}

/**
 * Controlled question selection algorithm:
 * - Honors section quotas (e.g. 25 Figure, 25 Math, 15 Latin, 15 Academic)
 * - Returns exact non-overlapping curated test papers for full-mock-1 to 5
 * - Balances difficulty distribution
 * - Deprioritizes recently seen questions until the pool is exhausted
 */
export function selectMockQuestions(
  config: MockTestConfig,
  seenQuestionIds: string[] = [],
  customSectionFilter?: QuestionSection,
  customDifficultyFilter?: string
): MockQuestion[] {
  // Check for full-mock-1 through full-mock-5
  if (config.id && config.id.startsWith('full-mock-')) {
    const paperNum = parseInt(config.id.replace('full-mock-', ''), 10);
    if (paperNum >= 1 && paperNum <= 5) {
      return getFullMockPaperQuestions(paperNum);
    }
  }

  const allEnabled = getAllMockQuestions();

  // If a single section is specified (either by sectional test or custom filter)
  const targetSection = customSectionFilter || config.section;

  if (targetSection) {
    let pool = allEnabled.filter((q) => q.section === targetSection);
    if (customDifficultyFilter && customDifficultyFilter !== 'ALL') {
      pool = pool.filter((q) => q.difficulty === customDifficultyFilter);
    }

    return sampleBalancedQuestions(pool, config.questionCount, seenQuestionIds);
  }

  // Multi-section test (Full Mock / Express Mock)
  if (config.sectionQuotas && config.sectionQuotas.length > 0) {
    const selected: MockQuestion[] = [];

    for (const quota of config.sectionQuotas) {
      let pool = allEnabled.filter((q) => q.section === quota.section);
      if (customDifficultyFilter && customDifficultyFilter !== 'ALL') {
        pool = pool.filter((q) => q.difficulty === customDifficultyFilter);
      }

      const sampled = sampleBalancedQuestions(pool, quota.count, seenQuestionIds);
      selected.push(...sampled);
    }

    return shuffle(selected);
  }

  // Fallback: general pool
  let pool = allEnabled;
  if (customDifficultyFilter && customDifficultyFilter !== 'ALL') {
    pool = pool.filter((q) => q.difficulty === customDifficultyFilter);
  }
  return sampleBalancedQuestions(pool, config.questionCount, seenQuestionIds);
}

/**
 * Sample questions from a pool while balancing difficulty and deprioritizing seen questions
 */
function sampleBalancedQuestions(
  pool: MockQuestion[],
  targetCount: number,
  seenIds: string[]
): MockQuestion[] {
  if (pool.length <= targetCount) {
    return shuffle(pool);
  }

  const seenSet = new Set(seenIds);
  const unseen = pool.filter((q) => !seenSet.has(q.id));
  const seen = pool.filter((q) => seenSet.has(q.id));

  // If unseen has enough questions, draw from unseen; otherwise draw all unseen and fill from seen
  let candidatePool: MockQuestion[];
  if (unseen.length >= targetCount) {
    candidatePool = unseen;
  } else {
    candidatePool = [...unseen, ...shuffle(seen)];
  }

  // Group by difficulty for balanced distribution
  const byDifficulty: Record<string, MockQuestion[]> = {
    Easy: [],
    Medium: [],
    Hard: [],
    'Very Hard': [],
  };

  candidatePool.forEach((q) => {
    if (byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty].push(q);
    } else {
      byDifficulty['Medium'].push(q);
    }
  });

  // Target proportions: ~25% Easy, ~50% Medium, ~20% Hard, ~5% Very Hard
  const easyTarget = Math.round(targetCount * 0.25);
  const hardTarget = Math.round(targetCount * 0.2);
  const veryHardTarget = Math.max(1, Math.round(targetCount * 0.05));
  const medTarget = targetCount - easyTarget - hardTarget - veryHardTarget;

  const result: MockQuestion[] = [];

  const take = (diffKey: string, count: number) => {
    const available = shuffle(byDifficulty[diffKey]);
    const picked = available.slice(0, count);
    result.push(...picked);
  };

  take('Easy', easyTarget);
  take('Medium', medTarget);
  take('Hard', hardTarget);
  take('Very Hard', veryHardTarget);

  // If deficit due to category exhaustion, fill from remaining candidatePool
  if (result.length < targetCount) {
    const pickedIds = new Set(result.map((q) => q.id));
    const remaining = candidatePool.filter((q) => !pickedIds.has(q.id));
    const needed = targetCount - result.length;
    result.push(...shuffle(remaining).slice(0, needed));
  }

  return shuffle(result).slice(0, targetCount);
}
