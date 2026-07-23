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
      const match = cookies.match(/dmat_admin_token=([^;]+)/) || cookies.match(/dmat_auth_token=([^;]+)/);
      if (match) token = match[1];
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const db = readDb();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const totalUsers = db.users.filter((u) => u.role === 'USER').length;
    const activeUsers = db.users.filter((u) => u.role === 'USER' && u.status === 'ACTIVE').length;
    const proSubscribers = db.subscriptions.filter((s) => s.plan === 'PRO' && s.status === 'ACTIVE').length;
    const freeUsers = Math.max(0, totalUsers - proSubscribers);
    const totalQuestions = db.questions.length;
    const totalChapters = db.chapters.length;

    const newUsersToday = db.users.filter((u) => u.createdAt.startsWith(todayStr)).length;

    let totalAccuracySum = 0;
    db.profiles.forEach((p) => {
      totalAccuracySum += p.accuracy || 0;
    });
    const averageAccuracy = db.profiles.length > 0 ? parseFloat((totalAccuracySum / db.profiles.length).toFixed(1)) : 0;

    const totalRevenue = proSubscribers * 29; // $29 per Pro subscription placeholder

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        proSubscribers,
        freeUsers,
        totalQuestions,
        totalChapters,
        averageAccuracy,
        totalRevenue,
        newUsersToday,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch admin stats' }, { status: 500 });
  }
}
