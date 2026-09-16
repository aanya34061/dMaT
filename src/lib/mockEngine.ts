import {
  MockQuestion,
  MockSessionState,
  MockResult,
  SectionBreakdownItem,
  DifficultyBreakdownItem,
  WeakTopicAnalysis,
  StrongTopicAnalysis,
  QuestionResultItem,
  QuestionSection,
  QuestionDifficulty,
} from '@/types/mockTest';

export const ACTIVE_SESSION_KEY = 'dmat_mock_session_active_v1';
export const MOCK_HISTORY_KEY = 'dmat_mock_history_v1';

export function getActiveSession(): MockSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveSession(session: MockSessionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save active mock session:', err);
  }
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
}

export function getMockHistory(): MockResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMockResult(result: MockResult): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMockHistory();
    const updated = [result, ...history.filter((r) => r.id !== result.id)].slice(0, 50);
    localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(updated));

    // Also sync to backend API if authenticated
    const token = localStorage.getItem('dmat_auth_token');
    if (token) {
      fetch('/api/mock-tests/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save mock result:', err);
  }
}

export function evaluateMockSubmission(session: MockSessionState): MockResult {
  const {
    sessionId,
    configId,
    testTitle,
    mode,
    sectionName,
    questions,
    answers,
    statuses,
    questionTimes,
    startedAt,
    timeRemainingSeconds,
    totalTimeSeconds,
  } = session;

  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let markedCount = 0;

  const sectionStats: Record<
    string,
    { total: number; attempted: number; correct: number; incorrect: number; skipped: number; timeSpent: number }
  > = {};

  const difficultyStats: Record<
    string,
    { total: number; attempted: number; correct: number }
  > = {
    Easy: { total: 0, attempted: 0, correct: 0 },
    Medium: { total: 0, attempted: 0, correct: 0 },
    Hard: { total: 0, attempted: 0, correct: 0 },
    'Very Hard': { total: 0, attempted: 0, correct: 0 },
  };

  const topicStats: Record<
    string,
    { section: QuestionSection; total: number; attempted: number; correct: number; incorrect: number }
  > = {};

  const questionResults: QuestionResultItem[] = [];

  let fastestSecs = Infinity;
  let slowestSecs = -Infinity;
  let fastestItem: { questionId: string; questionNumber: number; timeSeconds: number; isCorrect: boolean } | undefined;
  let slowestItem: { questionId: string; questionNumber: number; timeSeconds: number; isCorrect: boolean } | undefined;

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const userAnswer = q.id in answers ? answers[q.id] : null;
    const isAnswered = userAnswer !== null;
    const isCorrect = isAnswered && userAnswer === q.correctAnswer;
    const timeSpent = questionTimes[q.id] || 0;
    const st = statuses[q.id] || 'unanswered';
    const wasMarked = st === 'marked' || st === 'marked_answered';

    if (wasMarked) markedCount++;

    let status: 'correct' | 'incorrect' | 'skipped' = 'skipped';
    if (!isAnswered) {
      skippedCount++;
    } else if (isCorrect) {
      correctCount++;
      status = 'correct';
    } else {
      incorrectCount++;
      status = 'incorrect';
    }

    // Tracking fastest and slowest attempted question
    if (isAnswered && timeSpent > 0) {
      if (timeSpent < fastestSecs) {
        fastestSecs = timeSpent;
        fastestItem = { questionId: q.id, questionNumber: qNum, timeSeconds: timeSpent, isCorrect };
      }
      if (timeSpent > slowestSecs) {
        slowestSecs = timeSpent;
        slowestItem = { questionId: q.id, questionNumber: qNum, timeSeconds: timeSpent, isCorrect };
      }
    }

    // Section stats
    if (!sectionStats[q.section]) {
      sectionStats[q.section] = { total: 0, attempted: 0, correct: 0, incorrect: 0, skipped: 0, timeSpent: 0 };
    }
    sectionStats[q.section].total++;
    sectionStats[q.section].timeSpent += timeSpent;
    if (isAnswered) sectionStats[q.section].attempted++;
    if (isCorrect) sectionStats[q.section].correct++;
    else if (isAnswered) sectionStats[q.section].incorrect++;
    else sectionStats[q.section].skipped++;

    // Difficulty stats
    const diffKey = q.difficulty || 'Medium';
    if (!difficultyStats[diffKey]) {
      difficultyStats[diffKey] = { total: 0, attempted: 0, correct: 0 };
    }
    difficultyStats[diffKey].total++;
    if (isAnswered) difficultyStats[diffKey].attempted++;
    if (isCorrect) difficultyStats[diffKey].correct++;

    // Topic stats
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { section: q.section, total: 0, attempted: 0, correct: 0, incorrect: 0 };
    }
    topicStats[q.topic].total++;
    if (isAnswered) topicStats[q.topic].attempted++;
    if (isCorrect) topicStats[q.topic].correct++;
    else if (isAnswered) topicStats[q.topic].incorrect++;

    questionResults.push({
      questionId: q.id,
      questionNumber: qNum,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      timeSpentSeconds: timeSpent,
      status,
      wasMarked,
      explanation: q.explanation,
      solutionSteps: q.solutionSteps,
    });
  });

  const attempted = correctCount + incorrectCount;
  const score = correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
  const timeTakenSeconds = Math.max(0, totalTimeSeconds - timeRemainingSeconds);
  const averageTimePerQuestionSeconds = attempted > 0 ? Math.round(timeTakenSeconds / attempted) : 0;

  // Section breakdown
  const sectionBreakdown: SectionBreakdownItem[] = Object.entries(sectionStats).map(
    ([secName, stats]) => ({
      section: secName as QuestionSection,
      total: stats.total,
      attempted: stats.attempted,
      correct: stats.correct,
      incorrect: stats.incorrect,
      skipped: stats.skipped,
      accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
      timeSpentSeconds: stats.timeSpent,
    })
  );

  // Difficulty breakdown
  const difficultyBreakdown: DifficultyBreakdownItem[] = Object.entries(difficultyStats).map(
    ([diffName, stats]) => ({
      difficulty: diffName as QuestionDifficulty,
      total: stats.total,
      attempted: stats.attempted,
      correct: stats.correct,
      accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
    })
  );

  // Weak topics analysis: accuracy < 70% or incorrect > 0
  const weakTopics: WeakTopicAnalysis[] = Object.entries(topicStats)
    .filter(([_, stats]) => stats.incorrect > 0 || (stats.attempted > 0 && stats.correct / stats.attempted < 0.75))
    .map(([topicName, stats]) => {
      const topicAcc = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
      return {
        topic: topicName,
        section: stats.section,
        incorrectCount: stats.incorrect,
        accuracy: topicAcc,
        recommendation: `Solve 10 practice problems in "${topicName}" to strengthen pattern identification.`,
        practiceUrl: `/practice?topic=${encodeURIComponent(topicName)}`,
      };
    })
    .sort((a, b) => b.incorrectCount - a.incorrectCount);

  // Strong topics: accuracy >= 80% with at least 1 attempted
  const strongTopics: StrongTopicAnalysis[] = Object.entries(topicStats)
    .filter(([_, stats]) => stats.attempted > 0 && stats.correct / stats.attempted >= 0.8)
    .map(([topicName, stats]) => ({
      topic: topicName,
      section: stats.section,
      accuracy: Math.round((stats.correct / stats.attempted) * 100),
    }));

  return {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sessionId,
    configId,
    testTitle,
    mode,
    sectionName,
    completedAt: new Date().toISOString(),
    totalQuestions,
    attempted,
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
    markedForReviewCount: markedCount,
    score,
    percentage,
    accuracy,
    passed: percentage >= 65,
    totalDurationSeconds: totalTimeSeconds,
    timeTakenSeconds,
    averageTimePerQuestionSeconds,
    fastestQuestion: fastestItem,
    slowestQuestion: slowestItem,
    sectionBreakdown,
    difficultyBreakdown,
    weakTopics,
    strongTopics,
    questionResults,
  };
}
