import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const db = readDb();
    return NextResponse.json({ success: true, questions: db.questions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch questions' }, { status: 500 });
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

    const { chapterId, title, options, correctIndex, explanation, difficulty, enabled } = await req.json();

    if (!title || !options || options.length < 2 || correctIndex === undefined || !explanation) {
      return NextResponse.json({ error: 'Title, options, correctIndex, and explanation are required' }, { status: 400 });
    }

    const db = readDb();
    const newId = db.questions.length > 0 ? Math.max(...db.questions.map((q) => q.id)) + 1 : 1;

    const newQuestion = {
      id: newId,
      chapterId: parseInt(chapterId || '1', 10),
      title: title.trim(),
      options,
      correctIndex: parseInt(correctIndex, 10),
      explanation: explanation.trim(),
      difficulty: difficulty || 'Medium',
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      createdAt: new Date().toISOString(),
    };

    db.questions.push(newQuestion);
    writeDb(db);

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add question' }, { status: 500 });
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

    const { id, chapterId, title, options, correctIndex, explanation, difficulty, enabled } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const db = readDb();
    const qIndex = db.questions.findIndex((q) => q.id === parseInt(id, 10));

    if (qIndex === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const q = db.questions[qIndex];
    if (title) q.title = title.trim();
    if (options) q.options = options;
    if (correctIndex !== undefined) q.correctIndex = parseInt(correctIndex, 10);
    if (explanation) q.explanation = explanation.trim();
    if (difficulty) q.difficulty = difficulty;
    if (enabled !== undefined) q.enabled = Boolean(enabled);
    if (chapterId) q.chapterId = parseInt(chapterId, 10);

    writeDb(db);

    return NextResponse.json({ success: true, question: q });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update question' }, { status: 500 });
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
    const id = parseInt(searchParams.get('id') || '0', 10);

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const db = readDb();
    const index = db.questions.findIndex((q) => q.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    db.questions.splice(index, 1);
    writeDb(db);

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete question' }, { status: 500 });
  }
}
