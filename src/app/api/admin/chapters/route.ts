import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ success: true, chapters: db.chapters });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const { title, description, iconName } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const db = readDb();
    const newId = db.chapters.length > 0 ? Math.max(...db.chapters.map((c) => c.id)) + 1 : 1;

    const newChapter = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      iconName: iconName || 'BookOpen',
      enabled: true,
    };

    db.chapters.push(newChapter);
    writeDb(db);

    return NextResponse.json({ success: true, chapter: newChapter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add chapter' }, { status: 500 });
  }
}
