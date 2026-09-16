import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data_store', 'db.json');
const DATA_DIR = isVercel ? '/tmp/data_store' : path.join(process.cwd(), 'data_store');
const DB_FILE = isVercel ? path.join('/tmp/data_store', 'db.json') : BUNDLED_DB_FILE;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}
ensureDataDir();

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
  mockQuestions?: any[];
  mockResults?: any[];
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
    if (isVercel && !fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
      ensureDataDir();
      fs.copyFileSync(BUNDLED_DB_FILE, DB_FILE);
    }
    if (!fs.existsSync(DB_FILE)) {
      if (fs.existsSync(BUNDLED_DB_FILE)) {
        const content = fs.readFileSync(BUNDLED_DB_FILE, 'utf8');
        return JSON.parse(content);
      }
      const initData = getInitialDb();
      try {
        ensureDataDir();
        fs.writeFileSync(DB_FILE, JSON.stringify(initData, null, 2), 'utf8');
      } catch (_) {}
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
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}
