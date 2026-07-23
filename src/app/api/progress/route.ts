import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookies = req.headers.get('cookie') || '';
      const match = cookies.match(/dmat_auth_token=([^;]+)/);
      if (match) token = match[1];
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDb();
    const userProgress = db.progress.find((p) => p.userId === decoded.userId) || {
      lastQuestionId: null,
      answers: {},
      bookmarks: [],
    };

    return NextResponse.json({ success: true, progress: userProgress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookies = req.headers.get('cookie') || '';
      const match = cookies.match(/dmat_auth_token=([^;]+)/);
      if (match) token = match[1];
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, selectedIndex, isCorrect, bookmarks, lastQuestionId } = await req.json();
    const db = readDb();

    let userProgress = db.progress.find((p) => p.userId === decoded.userId);
    if (!userProgress) {
      userProgress = {
        id: `prog-${Date.now()}`,
        userId: decoded.userId,
        lastQuestionId: null,
        answers: {},
        bookmarks: [],
        updatedAt: new Date().toISOString(),
      };
      db.progress.push(userProgress);
    }

    if (lastQuestionId !== undefined) {
      userProgress.lastQuestionId = lastQuestionId;
    }

    if (bookmarks !== undefined) {
      userProgress.bookmarks = bookmarks;
    }

    if (questionId !== undefined && selectedIndex !== undefined) {
      userProgress.answers[String(questionId)] = selectedIndex;

      // Add attempt record
      db.attempts.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userId: decoded.userId,
        questionId,
        isCorrect: Boolean(isCorrect),
        userAnswer: selectedIndex,
        attemptedAt: new Date().toISOString(),
      });

      // Update XP & accuracy in profile
      const profile = db.profiles.find((p) => p.userId === decoded.userId);
      if (profile) {
        profile.xp += isCorrect ? 20 : 5;
        const userAttempts = db.attempts.filter((a) => a.userId === decoded.userId);
        const correctCount = userAttempts.filter((a) => a.isCorrect).length;
        profile.accuracy = parseFloat(((correctCount / userAttempts.length) * 100).toFixed(1));
        profile.updatedAt = new Date().toISOString();
      }
    }

    userProgress.updatedAt = new Date().toISOString();
    writeDb(db);

    return NextResponse.json({ success: true, progress: userProgress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save progress' }, { status: 500 });
  }
}
