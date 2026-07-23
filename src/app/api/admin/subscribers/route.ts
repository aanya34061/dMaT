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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'ALL'; // ALL, ACTIVE, EXPIRED, FREE, PRO

    const db = readDb();

    let subscribers = db.subscriptions.map((sub) => {
      const u = db.users.find((usr) => usr.id === sub.userId);
      return {
        id: sub.id,
        userId: sub.userId,
        name: u?.name || 'Unknown User',
        email: u?.email || 'N/A',
        plan: sub.plan,
        status: sub.status,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        paymentStatus: sub.paymentStatus || (sub.plan === 'PRO' ? 'PAID' : 'N/A'),
      };
    });

    if (filter === 'ACTIVE') subscribers = subscribers.filter((s) => s.status === 'ACTIVE');
    else if (filter === 'EXPIRED') subscribers = subscribers.filter((s) => s.status === 'EXPIRED');
    else if (filter === 'FREE') subscribers = subscribers.filter((s) => s.plan === 'FREE');
    else if (filter === 'PRO') subscribers = subscribers.filter((s) => s.plan === 'PRO');

    return NextResponse.json({ success: true, subscribers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch subscribers' }, { status: 500 });
  }
}
