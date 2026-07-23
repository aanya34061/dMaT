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

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.updatedAt = new Date().toISOString();
    writeDb(db);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to change password' }, { status: 500 });
  }
}
