import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);

    const decoded = verifyToken(token);
    const db = readDb();
    const results = db.mockResults || [];

    if (!decoded) {
      return NextResponse.json({ success: true, history: [] });
    }

    const userResults = results.filter((r: any) => r.userId === decoded.userId);
    return NextResponse.json({ success: true, history: userResults });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);

    const decoded = verifyToken(token);
    const { result } = await req.json();

    if (!result) {
      return NextResponse.json({ error: 'Result object is required' }, { status: 400 });
    }

    const db = readDb();
    if (!db.mockResults) db.mockResults = [];

    const record = {
      ...result,
      userId: decoded?.userId || null,
      savedAt: new Date().toISOString(),
    };

    db.mockResults.unshift(record);
    writeDb(db);

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save mock result' }, { status: 500 });
  }
}
