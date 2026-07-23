import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

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

    const { plan, paymentProvider } = await req.json(); // 'FREE' or 'PRO'
    if (!plan || !['FREE', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const db = readDb();
    let sub = db.subscriptions.find((s) => s.userId === decoded.userId);

    const now = new Date().toISOString();
    const expiry = plan === 'PRO' ? new Date(Date.now() + 365 * 86400000).toISOString() : undefined;

    if (sub) {
      sub.plan = plan;
      sub.status = 'ACTIVE';
      sub.startDate = now;
      sub.expiryDate = expiry;
      sub.paymentProvider = paymentProvider || 'system';
      sub.paymentStatus = plan === 'PRO' ? 'PAID' : 'N/A';
      sub.updatedAt = now;
    } else {
      sub = {
        id: `sub-${Date.now()}`,
        userId: decoded.userId,
        plan,
        status: 'ACTIVE',
        startDate: now,
        expiryDate: expiry,
        paymentProvider: paymentProvider || 'system',
        paymentStatus: plan === 'PRO' ? 'PAID' : 'N/A',
        updatedAt: now,
      };
      db.subscriptions.push(sub);
    }

    writeDb(db);

    return NextResponse.json({ success: true, message: `Subscription updated to ${plan}`, subscription: sub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Subscription update failed' }, { status: 500 });
  }
}
