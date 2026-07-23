import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'DISABLED') {
      return NextResponse.json({ error: 'Your account has been disabled by an administrator' }, { status: 403 });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const now = new Date().toISOString();
    user.lastActive = now;
    user.updatedAt = now;

    let profile = db.profiles.find((p) => p.userId === user.id);
    if (profile) {
      profile.lastLogin = now;
      profile.updatedAt = now;
    } else {
      profile = {
        id: `prof-${Date.now()}`,
        userId: user.id,
        streak: 1,
        xp: 50,
        accuracy: 0.0,
        studyTimeMinutes: 0,
        lastLogin: now,
        updatedAt: now,
      };
      db.profiles.push(profile);
    }

    let sub = db.subscriptions.find((s) => s.userId === user.id);
    if (!sub) {
      sub = {
        id: `sub-${Date.now()}`,
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        startDate: now,
        paymentStatus: 'N/A',
        updatedAt: now,
      };
      db.subscriptions.push(sub);
    }

    let userProgress = db.progress.find((pr) => pr.userId === user.id);
    if (!userProgress) {
      userProgress = {
        id: `prog-${Date.now()}`,
        userId: user.id,
        lastQuestionId: null,
        answers: {},
        bookmarks: [],
        updatedAt: now,
      };
      db.progress.push(userProgress);
    }

    writeDb(db);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

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

    const response = NextResponse.json({ success: true, token, user: userPayload });
    response.cookies.set('dmat_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
