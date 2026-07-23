import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: Request) {
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

    const { name, avatarUrl, bio } = await req.json();
    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name) user.name = name.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    user.updatedAt = new Date().toISOString();

    const profile = db.profiles.find((p) => p.userId === user.id);
    if (profile && bio !== undefined) {
      profile.bio = bio;
      profile.updatedAt = new Date().toISOString();
    }

    writeDb(db);

    return NextResponse.json({ success: true, message: 'Profile updated successfully', user: { name: user.name, avatarUrl: user.avatarUrl } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Profile update failed' }, { status: 500 });
  }
}
