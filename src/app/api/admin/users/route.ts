import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
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
    const search = (searchParams.get('search') || '').toLowerCase();
    const plan = searchParams.get('plan') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = readDb();

    let filtered = db.users.map((u) => {
      const p = db.profiles.find((pr) => pr.userId === u.id);
      const s = db.subscriptions.find((sub) => sub.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        registrationDate: u.createdAt,
        currentPlan: s?.plan || 'FREE',
        accuracy: p?.accuracy || 0,
        xp: p?.xp || 0,
        lastActive: u.lastActive,
        status: u.status,
        role: u.role,
      };
    });

    if (search) {
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }

    if (plan !== 'ALL') {
      filtered = filtered.filter((u) => u.currentPlan === plan);
    }

    if (status !== 'ALL') {
      filtered = filtered.filter((u) => u.status === status);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    const { userId, status, plan, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (status) user.status = status;
    if (role) user.role = role;
    user.updatedAt = new Date().toISOString();

    if (plan) {
      let sub = db.subscriptions.find((s) => s.userId === userId);
      const now = new Date().toISOString();
      if (sub) {
        sub.plan = plan;
        sub.updatedAt = now;
      } else {
        db.subscriptions.push({
          id: `sub-${Date.now()}`,
          userId,
          plan,
          status: 'ACTIVE',
          startDate: now,
          paymentStatus: plan === 'PRO' ? 'PAID' : 'N/A',
          updatedAt: now,
        });
      }
    }

    writeDb(db);

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = readDb();
    const index = db.users.findIndex((u) => u.id === userId);

    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    db.users.splice(index, 1);
    db.profiles = db.profiles.filter((p) => p.userId !== userId);
    db.subscriptions = db.subscriptions.filter((s) => s.userId !== userId);
    db.progress = db.progress.filter((pr) => pr.userId !== userId);
    db.attempts = db.attempts.filter((a) => a.userId !== userId);

    writeDb(db);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
