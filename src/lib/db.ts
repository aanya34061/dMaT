import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data_store');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data_store directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DbSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    avatarUrl?: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED';
    createdAt: string;
    updatedAt: string;
    lastActive: string;
  }>;
  profiles: Array<{
    id: string;
    userId: string;
    bio?: string;
    streak: number;
    xp: number;
    accuracy: number;
    studyTimeMinutes: number;
    lastLogin: string;
    updatedAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    userId: string;
    plan: 'FREE' | 'PRO';
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: string;
    expiryDate?: string;
    paymentProvider?: string;
    paymentStatus: string;
    updatedAt: string;
  }>;
  progress: Array<{
    id: string;
    userId: string;
    lastQuestionId: number | null;
    answers: Record<string, number>; // questionId -> selectedIndex
    bookmarks: number[];
    completedChaptersCount?: number;
    completedTopics?: number[];
    updatedAt: string;
  }>;
  attempts: Array<{
    id: string;
    userId: string;
    questionId: number;
    isCorrect: boolean;
    userAnswer: number;
    attemptedAt: string;
  }>;
  questions: Array<{
    id: number;
    chapterId: number;
    title: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: string;
    enabled: boolean;
    createdAt: string;
  }>;
  chapters: Array<{
    id: number;
    title: string;
    description: string;
    iconName?: string;
    enabled: boolean;
  }>;
}

function getInitialDb(): DbSchema {
  let questions: any[] = [];
  let chapters: any[] = [];
  try {
    const qRaw = fs.readFileSync(path.join(process.cwd(), 'src/data/questions.json'), 'utf8');
    questions = JSON.parse(qRaw).map((q: any) => ({ ...q, enabled: true }));
  } catch (_) {}

  try {
    const cRaw = fs.readFileSync(path.join(process.cwd(), 'src/data/chapters.json'), 'utf8');
    chapters = JSON.parse(cRaw).map((c: any) => ({ ...c, enabled: true }));
  } catch (_) {}

  const now = new Date().toISOString();
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  return {
    users: [
      {
        id: 'usr-admin-1',
        email: 'admin@dmat.com',
        passwordHash: adminHash,
        name: 'dMAT Administrator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        lastActive: now,
      },
    ],
    profiles: [
      {
        id: 'prof-admin-1',
        userId: 'usr-admin-1',
        streak: 0,
        xp: 0,
        accuracy: 0,
        studyTimeMinutes: 0,
        lastLogin: now,
        updatedAt: now,
      },
    ],
    subscriptions: [
      {
        id: 'sub-admin-1',
        userId: 'usr-admin-1',
        plan: 'PRO',
        status: 'ACTIVE',
        startDate: now,
        paymentStatus: 'PAID',
        updatedAt: now,
      },
    ],
    progress: [],
    attempts: [],
    questions,
    chapters,
  };
}

export function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initData = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initData, null, 2), 'utf8');
      return initData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return getInitialDb();
  }
}

export function writeDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}
