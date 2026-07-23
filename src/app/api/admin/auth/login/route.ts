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
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied: Admin credentials required' }, { status: 403 });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const now = new Date().toISOString();
    user.lastActive = now;
    writeDb(db);

    const token = signToken({ userId: user.id, email: user.email, role: 'ADMIN' });

    const response = NextResponse.json({
      success: true,
      token,
      admin: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set('dmat_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Admin login failed' }, { status: 500 });
  }
}
