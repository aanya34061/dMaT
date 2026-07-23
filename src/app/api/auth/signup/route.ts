import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const db = readDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr-${Date.now()}`;
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      createdAt: now,
      updatedAt: now,
      lastActive: now,
    };

    const newProfile = {
      id: `prof-${Date.now()}`,
      userId,
      streak: 1,
      xp: 50,
      accuracy: 0.0,
      studyTimeMinutes: 0,
      lastLogin: now,
      updatedAt: now,
    };

    const newSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      plan: 'FREE' as const,
      status: 'ACTIVE' as const,
      startDate: now,
      paymentStatus: 'N/A',
      updatedAt: now,
    };

    const newProgress = {
      id: `prog-${Date.now()}`,
      userId,
      lastQuestionId: null,
      answers: {},
      bookmarks: [],
      updatedAt: now,
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    db.subscriptions.push(newSubscription);
    db.progress.push(newProgress);

    writeDb(db);

    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

    const userPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatarUrl: newUser.avatarUrl,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastActive: newUser.lastActive,
      subscription: {
        plan: newSubscription.plan,
        status: newSubscription.status,
        startDate: newSubscription.startDate,
      },
      profile: {
        streak: newProfile.streak,
        xp: newProfile.xp,
        accuracy: newProfile.accuracy,
        studyTimeMinutes: newProfile.studyTimeMinutes,
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        completedChaptersCount: 0,
        bookmarkedCount: 0,
        lastLogin: newProfile.lastLogin,
      },
      progress: {
        lastQuestionId: null,
        answers: {},
        bookmarks: [],
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
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
