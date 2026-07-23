import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
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
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.userId);

    if (!user || user.status === 'DISABLED') {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const profile = db.profiles.find((p) => p.userId === user.id) || {
      streak: 0,
      xp: 0,
      accuracy: 0.0,
      studyTimeMinutes: 0,
      lastLogin: user.createdAt,
    };

    const sub = db.subscriptions.find((s) => s.userId === user.id) || {
      plan: 'FREE' as const,
      status: 'ACTIVE' as const,
      startDate: user.createdAt,
      expiryDate: undefined,
    };

    const userProgress = db.progress.find((pr) => pr.userId === user.id) || {
      lastQuestionId: null,
      answers: {},
      bookmarks: [],
      completedChaptersCount: 0,
    };

    const userAttempts = db.attempts.filter((a) => a.userId === user.id);
    const correctCount = userAttempts.filter((a) => a.isCorrect).length;
    const totalCount = userAttempts.length;
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : profile.accuracy;

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      subscription: {
        plan: sub.plan,
        status: sub.status,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
      },
      profile: {
        streak: profile.streak,
        xp: profile.xp,
        accuracy: parseFloat(accuracy.toFixed(1)),
        studyTimeMinutes: profile.studyTimeMinutes,
        totalAttempts: totalCount,
        correctAnswers: correctCount,
        incorrectAnswers: totalCount - correctCount,
        completedChaptersCount: userProgress.completedChaptersCount || 0,
        bookmarkedCount: userProgress.bookmarks.length,
        lastLogin: profile.lastLogin,
      },
      progress: {
        lastQuestionId: userProgress.lastQuestionId,
        answers: userProgress.answers || {},
        bookmarks: userProgress.bookmarks || [],
      },
    };

    return NextResponse.json({ authenticated: true, user: userPayload });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
