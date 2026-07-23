import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
    else {
      const cookies = req.headers.get('cookie') || '';
      const match = cookies.match(/dmat_admin_token=([^;]+)/) || cookies.match(/dmat_auth_token=([^;]+)/);
      if (match) token = match[1];
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const db = readDb();

    // Past 7 days analytics data generator
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyActiveUsers = days.map((day, idx) => ({
      date: day,
      users: 12 + idx * 4 + (idx % 2 === 0 ? 8 : 2),
    }));

    const registrations = days.map((day, idx) => ({
      date: day,
      count: 2 + (idx % 3),
    }));

    const questionAttempts = days.map((day, idx) => ({
      date: day,
      attempts: 45 + idx * 22,
    }));

    const chapterCompletions = db.chapters.slice(0, 6).map((c) => ({
      chapter: c.title.length > 18 ? c.title.substring(0, 18) + '...' : c.title,
      completions: 15 + Math.floor(Math.random() * 35),
    }));

    const subscriptionGrowth = [
      { month: 'Jan', free: 40, pro: 10 },
      { month: 'Feb', free: 65, pro: 18 },
      { month: 'Mar', free: 90, pro: 28 },
      { month: 'Apr', free: 120, pro: 42 },
      { month: 'May', free: 150, pro: 58 },
      { month: 'Jun', free: 190, pro: 75 },
    ];

    return NextResponse.json({
      success: true,
      analytics: {
        dailyActiveUsers,
        registrations,
        questionAttempts,
        chapterCompletions,
        subscriptionGrowth,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
