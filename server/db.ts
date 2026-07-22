import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Review, ReviewData } from '../src/types.js';

// Define the file-based database path
const DB_PATH = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    photo?: string;
    createdAt: string;
  }>;
  reviews: Review[];
  sessions: Array<{
    token: string;
    userId: string;
    expiresAt: string;
  }>;
}

// Simple salt for PBKDF2 hashing
const SALT = 'ai-code-review-assistant-salt-987241';

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

// Generate secure random tokens
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initialize and seed default database if it doesn't exist
function initDB(): DatabaseSchema {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    } catch (e) {
      console.error('Failed to read database, creating a fresh one', e);
    }
  }

  // Sample data to make the initial experience incredibly rich
  const adminId = 'u-admin-1';
  const userId = 'u-user-2';

  const defaultDb: DatabaseSchema = {
    users: [
      {
        id: adminId,
        name: 'Lead Architect (Admin)',
        email: 'admin@codereviewer.ai',
        passwordHash: hashPassword('adminpassword123'),
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: userId,
        name: 'Senior Developer',
        email: 'user@codereviewer.ai',
        passwordHash: hashPassword('userpassword123'),
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ],
    reviews: [
      {
        id: 'r-sample-1',
        userId: userId,
        userName: 'Senior Developer',
        filename: 'auth_helper.py',
        language: 'python',
        score: 82,
        complexity: 'Medium',
        risk: 'Medium',
        code: `def get_user_session(request):\n    session_id = request.cookies.get("session_id")\n    # TODO: Query database directly without validation\n    user = db.execute("SELECT * FROM users WHERE session = '" + session_id + "'").fetchone()\n    return user`,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        bookmarked: true,
        reviewJson: {
          summary: "The code retrieves a user session from cookies. However, it contains a critical SQL injection vulnerability by directly concatenating cookie variables into a SQL string. Additionally, there is a lack of error handling and cookie sanitation.",
          overallScore: 82,
          complexity: "Medium",
          risk: "High",
          maintainability: 85,
          metrics: {
            quality: 75,
            security: 20,
            performance: 90,
            bestPractices: 80
          },
          issues: [
            {
              id: 'iss-1',
              line: 4,
              severity: 'critical',
              category: 'security',
              title: 'SQL Injection Vulnerability',
              description: 'Direct string concatenation of untrusted input (cookie value) into raw SQL statement allows attackers to execute arbitrary SQL commands.',
              suggestion: "Use parameterized queries or an ORM. Change to: db.execute('SELECT * FROM users WHERE session = ?', (session_id,)).fetchone()"
            },
            {
              id: 'iss-2',
              line: 3,
              severity: 'low',
              category: 'best-practice',
              title: 'TODO Left in Code',
              description: 'Leftover developers note about direct querying without validation.',
              suggestion: 'Remove TODO notes and implement proper validation.'
            }
          ],
          suggestions: [
            {
              title: 'Parameterize SQL Queries',
              description: 'Ensure all parameters are bound dynamically rather than interpolated as raw strings.',
              impact: 'Eliminates SQL injection vector.'
            }
          ]
        }
      },
      {
        id: 'r-sample-2',
        userId: userId,
        userName: 'Senior Developer',
        filename: 'bubble_sort.ts',
        language: 'typescript',
        score: 91,
        complexity: 'Low',
        risk: 'Low',
        code: `export function bubbleSort(arr: number[]): number[] {\n  const len = arr.length;\n  for (let i = 0; i < len; i++) {\n    for (let j = 0; j < len - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        const temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}`,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewJson: {
          summary: "Classic implementation of the bubble sort algorithm. The algorithm is implemented correctly, but it has a performance bottleneck: its time complexity is always O(n²) even if the array is already sorted. Adding a 'swapped' flag can optimize the best-case time complexity to O(n).",
          overallScore: 91,
          complexity: "Low",
          risk: "Low",
          maintainability: 95,
          metrics: {
            quality: 95,
            security: 100,
            performance: 65,
            bestPractices: 90
          },
          issues: [
            {
              id: 'iss-3',
              line: 3,
              severity: 'medium',
              category: 'performance',
              title: 'O(n²) Complexity Bottleneck',
              description: 'Bubble sort is generally inefficient for larger datasets. An unoptimized implementation will run inner loops even when the array is already fully sorted.',
              suggestion: 'Add an early-exit condition if no elements are swapped during a pass.'
            }
          ],
          suggestions: [
            {
              title: 'Implement Swapped Flag',
              description: 'Keep track of whether a swap happened during the pass to allow early exit.',
              impact: 'Improves best-case scenario to O(n).'
            },
            {
              title: 'Use Built-in Array.prototype.sort()',
              description: 'For general purposes, use the highly optimized native sort method.',
              impact: 'Leverages browser-optimized engine (Timsort/Quicksort).'
            }
          ]
        }
      }
    ],
    sessions: []
  };

  saveDB(defaultDb);
  return defaultDb;
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database', e);
  }
}

// DB Instance
let dbInstance = initDB();

export const db = {
  // --- USERS ---
  getUsers() {
    return dbInstance.users;
  },

  getUserById(id: string) {
    return dbInstance.users.find(u => u.id === id);
  },

  getUserByEmail(email: string) {
    const lowerEmail = email.toLowerCase().trim();
    return dbInstance.users.find(u => u.email.toLowerCase() === lowerEmail);
  },

  createUser(name: string, email: string, passwordPlain: string, role: 'admin' | 'user' = 'user') {
    if (this.getUserByEmail(email)) {
      throw new Error('User with this email already exists.');
    }
    const newUser = {
      id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(passwordPlain),
      role,
      photo: '',
      createdAt: new Date().toISOString()
    };
    dbInstance.users.push(newUser);
    saveDB(dbInstance);
    return newUser;
  },

  updateUser(id: string, updates: { name?: string; email?: string; photo?: string; passwordPlain?: string }) {
    const user = dbInstance.users.find(u => u.id === id);
    if (!user) throw new Error('User not found.');

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.photo !== undefined) user.photo = updates.photo;
    
    if (updates.email !== undefined && updates.email.toLowerCase().trim() !== user.email) {
      const existing = this.getUserByEmail(updates.email);
      if (existing) throw new Error('Email already registered by another account.');
      user.email = updates.email.toLowerCase().trim();
    }

    if (updates.passwordPlain) {
      user.passwordHash = hashPassword(updates.passwordPlain);
    }

    saveDB(dbInstance);
    return user;
  },

  deleteUser(id: string) {
    dbInstance.users = dbInstance.users.filter(u => u.id !== id);
    // Also remove reviews and sessions of that user
    dbInstance.reviews = dbInstance.reviews.filter(r => r.userId !== id);
    dbInstance.sessions = dbInstance.sessions.filter(s => s.userId !== id);
    saveDB(dbInstance);
    return true;
  },

  // --- REVIEWS ---
  getReviews(userId?: string) {
    if (userId) {
      return dbInstance.reviews.filter(r => r.userId === userId);
    }
    return dbInstance.reviews;
  },

  getReviewById(id: string) {
    return dbInstance.reviews.find(r => r.id === id);
  },

  createReview(userId: string, filename: string, language: string, code: string, reviewJson: ReviewData) {
    const user = this.getUserById(userId);
    const newReview: Review = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName: user ? user.name : 'Unknown User',
      filename,
      language,
      score: reviewJson.overallScore,
      complexity: reviewJson.complexity,
      risk: reviewJson.risk,
      code,
      reviewJson,
      bookmarked: false,
      createdAt: new Date().toISOString()
    };
    dbInstance.reviews.push(newReview);
    saveDB(dbInstance);
    return newReview;
  },

  toggleBookmark(id: string, userId: string) {
    const review = dbInstance.reviews.find(r => r.id === id);
    if (!review) throw new Error('Review not found.');
    if (review.userId !== userId && this.getUserById(userId)?.role !== 'admin') {
      throw new Error('Unauthorized.');
    }
    review.bookmarked = !review.bookmarked;
    saveDB(dbInstance);
    return review;
  },

  deleteReview(id: string, userId: string) {
    const review = dbInstance.reviews.find(r => r.id === id);
    if (!review) throw new Error('Review not found.');
    const user = this.getUserById(userId);
    if (review.userId !== userId && user?.role !== 'admin') {
      throw new Error('Unauthorized to delete this review.');
    }
    dbInstance.reviews = dbInstance.reviews.filter(r => r.id !== id);
    saveDB(dbInstance);
    return true;
  },

  // --- SESSIONS ---
  createSession(userId: string) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration
    dbInstance.sessions.push({ token, userId, expiresAt });
    saveDB(dbInstance);
    return token;
  },

  getSession(token: string) {
    const session = dbInstance.sessions.find(s => s.token === token);
    if (!session) return null;
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return null;
    }
    return session;
  },

  deleteSession(token: string) {
    dbInstance.sessions = dbInstance.sessions.filter(s => s.token !== token);
    saveDB(dbInstance);
  }
};
