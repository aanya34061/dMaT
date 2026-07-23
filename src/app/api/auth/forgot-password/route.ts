import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions sent. Demo reset code is RESET-2026',
      resetCode: 'RESET-2026',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Forgot password request failed' }, { status: 500 });
  }
}
