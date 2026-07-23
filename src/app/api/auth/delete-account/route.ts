import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required to delete account' }, { status: 400 });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === decoded.userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = db.users[userIndex];
    const isMatch = bcrypt.compareSync(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
    }

    // Delete user and associated records
    db.users.splice(userIndex, 1);
    db.profiles = db.profiles.filter((p) => p.userId !== decoded.userId);
    db.subscriptions = db.subscriptions.filter((s) => s.userId !== decoded.userId);
    db.progress = db.progress.filter((pr) => pr.userId !== decoded.userId);
    db.attempts = db.attempts.filter((a) => a.userId !== decoded.userId);

    writeDb(db);

    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
    response.cookies.delete('dmat_auth_token');
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Account deletion failed' }, { status: 500 });
  }
}
