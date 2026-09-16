import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getAllMockQuestions } from '@/data/mockQuestions';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const db = readDb();
    let questions = db.mockQuestions;
    if (!questions || questions.length === 0) {
      // Fallback to static mock questions dataset
      questions = getAllMockQuestions();
    }

    if (section && section !== 'ALL') {
      questions = questions.filter((q: any) => q.section === section);
    }
    if (difficulty && difficulty !== 'ALL') {
      questions = questions.filter((q: any) => q.difficulty === difficulty);
    }
    if (search) {
      const sLower = search.toLowerCase();
      questions = questions.filter(
        (q: any) =>
          q.questionText?.toLowerCase().includes(sLower) ||
          q.topic?.toLowerCase().includes(sLower) ||
          q.id?.toLowerCase().includes(sLower)
      );
    }

    return NextResponse.json({
      success: true,
      total: questions.length,
      questions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch mock questions' }, { status: 500 });
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

    const body = await req.json();
    const db = readDb();
    if (!db.mockQuestions || db.mockQuestions.length === 0) {
      db.mockQuestions = getAllMockQuestions();
    }

    // Support Bulk Import
    if (Array.isArray(body)) {
      let importedCount = 0;
      for (const item of body) {
        if (item.questionText && item.options && item.options.length >= 2 && item.correctAnswer !== undefined) {
          const newId = item.id || `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          db.mockQuestions.unshift({
            ...item,
            id: newId,
            enabled: item.enabled !== undefined ? Boolean(item.enabled) : true,
            sourceType: item.sourceType || 'original',
            createdAt: new Date().toISOString(),
          });
          importedCount++;
        }
      }
      writeDb(db);
      return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} questions` });
    }

    // Single Question Creation
    const { section, topic, subtopic, difficulty, questionText, options, correctAnswer, explanation, visualData } = body;
    if (!questionText || !options || options.length < 2 || correctAnswer === undefined || !explanation) {
      return NextResponse.json({ error: 'questionText, options (>=2), correctAnswer, and explanation are required' }, { status: 400 });
    }

    const newQuestion = {
      id: `mock-${Date.now()}`,
      module: section === 'General Academic' ? 'general_academic' : 'core',
      section: section || 'Figure Sequences',
      topic: topic || 'General Reasoning',
      subtopic: subtopic || '',
      difficulty: difficulty || 'Medium',
      questionType: section === 'Figure Sequences' ? 'figure_sequence' : section === 'Latin Squares' ? 'latin_square' : 'multiple_choice',
      questionText: questionText.trim(),
      visualData,
      options,
      correctAnswer: parseInt(correctAnswer, 10),
      explanation: explanation.trim(),
      solutionSteps: [explanation.trim()],
      estimatedTime: 90,
      sourceType: 'user_created',
      sourceReference: 'Admin dashboard entry',
      tags: ['admin_created', (section || '').toLowerCase().replace(/\s+/g, '_')],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    db.mockQuestions.unshift(newQuestion);
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

    const body = await req.json();
    const { id, section, topic, difficulty, questionText, options, correctAnswer, explanation, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const db = readDb();
    if (!db.mockQuestions || db.mockQuestions.length === 0) {
      db.mockQuestions = getAllMockQuestions();
    }

    const qIdx = db.mockQuestions.findIndex((q: any) => q.id === id);
    if (qIdx === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const q = db.mockQuestions[qIdx];
    if (questionText) q.questionText = questionText.trim();
    if (section) q.section = section;
    if (topic) q.topic = topic;
    if (difficulty) q.difficulty = difficulty;
    if (options) q.options = options;
    if (correctAnswer !== undefined) q.correctAnswer = parseInt(correctAnswer, 10);
    if (explanation) q.explanation = explanation.trim();
    if (enabled !== undefined) q.enabled = Boolean(enabled);

    writeDb(db);

    return NextResponse.json({ success: true, question: q });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update mock question' }, { status: 500 });
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const db = readDb();
    if (!db.mockQuestions || db.mockQuestions.length === 0) {
      db.mockQuestions = getAllMockQuestions();
    }

    const index = db.mockQuestions.findIndex((q: any) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    db.mockQuestions.splice(index, 1);
    writeDb(db);

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete mock question' }, { status: 500 });
  }
}
