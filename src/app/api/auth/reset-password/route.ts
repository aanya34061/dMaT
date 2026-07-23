import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, resetCode, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.updatedAt = new Date().toISOString();
    writeDb(db);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully. You can now sign in.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Password reset failed' }, { status: 500 });
  }
}
