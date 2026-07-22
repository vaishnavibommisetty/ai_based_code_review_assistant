import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js";
import { performCodeReview, getAIChatFix } from "./server/gemini.js";
import { ReviewData } from "./src/types.js";

// A custom, efficient side-by-side duplicate code analyzer
function analyzeFileSimilarity(codeA: string, codeB: string, fileAName: string, fileBName: string) {
  const linesA = codeA.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const linesB = codeB.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  
  const setA = new Set(linesA);
  const setB = new Set(linesB);
  
  let intersection = 0;
  for (const l of setA) {
    if (setB.has(l)) intersection++;
  }
  
  const union = setA.size + setB.size - intersection;
  const jaccard = union > 0 ? (intersection / union) * 100 : 0;
  
  const rawLinesA = codeA.split('\n');
  const rawLinesB = codeB.split('\n');
  const duplicateBlocks: Array<{
    startLineA: number;
    endLineA: number;
    startLineB: number;
    endLineB: number;
    content: string;
  }> = [];
  
  let i = 0;
  while (i < rawLinesA.length) {
    if (rawLinesA[i].trim().length < 5) {
      i++;
      continue;
    }
    
    let bestMatchLen = 0;
    let bestMatchJ = -1;
    
    for (let j = 0; j < rawLinesB.length; j++) {
      let matchLen = 0;
      while (
        i + matchLen < rawLinesA.length &&
        j + matchLen < rawLinesB.length &&
        rawLinesA[i + matchLen].trim() === rawLinesB[j + matchLen].trim() &&
        rawLinesA[i + matchLen].trim().length > 3
      ) {
        matchLen++;
      }
      
      if (matchLen >= 3 && matchLen > bestMatchLen) {
        bestMatchLen = matchLen;
        bestMatchJ = j;
      }
    }
    
    if (bestMatchLen >= 3) {
      duplicateBlocks.push({
        startLineA: i + 1,
        endLineA: i + bestMatchLen,
        startLineB: bestMatchJ + 1,
        endLineB: bestMatchJ + bestMatchLen,
        content: rawLinesA.slice(i, i + bestMatchLen).join('\n')
      });
      i += bestMatchLen;
    } else {
      i++;
    }
  }
  
  const similarity = Math.min(100, Math.round(jaccard));
  let diffSummary = '';
  
  if (similarity > 75) {
    diffSummary = 'CRITICAL SIMILARITY: Extremely high code duplication. These files share the exact same structural footprint, suggesting copy-paste implementation with negligible refactoring.';
  } else if (similarity > 40) {
    diffSummary = 'MODERATE DUPLICATION: Substantial blocks of duplicate modules, helper functions, or architecture detected. Recommend refactoring into shared utility files.';
  } else if (similarity > 15) {
    diffSummary = 'LOW SIMILARITY: Small shared structures detected, typical of common imports, framework boilerplate, or standard configuration structures.';
  } else {
    diffSummary = 'FULLY UNIQUE: Zero overlapping code block patterns. Both codebases represent completely distinct logical flows and independent solutions.';
  }
  
  return {
    similarity,
    duplicateBlocks,
    fileAName,
    fileBName,
    fileACode: codeA,
    fileBCode: codeB,
    diffSummary
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max body limits for code upload
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Session middleware helper
  function getSessionUser(req: express.Request) {
    let token = '';
    
    // Try Auth Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Try Cookie
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const parts = c.split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          acc[k] = v;
        }
        return acc;
      }, {} as Record<string, string>);
      token = cookies['session_token'] || '';
    }
    
    if (!token) return null;
    const session = db.getSession(token);
    if (!session) return null;
    
    return db.getUserById(session.userId) || null;
  }

  // --- AUTH ENDPOINTS ---
  app.post("/api/auth/register", (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All registration fields are required." });
      }
      
      const user = db.createUser(name, email, password, "user");
      const token = db.createSession(user.id);
      
      res.setHeader('Set-Cookie', `session_token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${7 * 24 * 60 * 60}`);
      res.json({ token, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Registration failed." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      
      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials. User not found." });
      }
      
      const { hashPassword } = require("./server/db.js");
      if (user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid credentials. Password incorrect." });
      }
      
      const token = db.createSession(user.id);
      res.setHeader('Set-Cookie', `session_token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${7 * 24 * 60 * 60}`);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, photo: user.photo } });
    } catch (err: any) {
      res.status(500).json({ error: "Authentication failed." });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const parts = c.split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          acc[k] = v;
        }
        return acc;
      }, {} as Record<string, string>);
      token = cookies['session_token'] || '';
    }

    const session = token ? db.getSession(token) : null;
    const user = session ? db.getUserById(session.userId) : null;

    if (!user) {
      return res.status(401).json({ error: "No active session." });
    }
    res.json({ user, token });
  });

  app.post("/api/auth/logout", (req, res) => {
    // Read and delete token
    let token = '';
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const parts = c.split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          acc[k] = v;
        }
        return acc;
      }, {} as Record<string, string>);
      token = cookies['session_token'] || '';
    }
    if (token) {
      db.deleteSession(token);
    }
    res.setHeader('Set-Cookie', 'session_token=; Path=/; HttpOnly; SameSite=None; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.json({ success: true });
  });

  app.put("/api/auth/profile", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });
    
    try {
      const { name, email, photo, currentPassword, newPassword } = req.body;
      
      // Password change verification
      let passwordPlain = undefined;
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password is required to set a new password." });
        }
        const { hashPassword } = require("./server/db.js");
        if (user.passwordHash !== hashPassword(currentPassword)) {
          return res.status(400).json({ error: "Current password verification failed." });
        }
        passwordPlain = newPassword;
      }

      const updatedUser = db.updateUser(user.id, { name, email, photo, passwordPlain });
      res.json({ user: updatedUser });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update profile." });
    }
  });

  // --- REVIEWS ENDPOINTS ---
  app.post("/api/reviews", async (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Sign in to submit files for review." });

    const { filename, language, code } = req.body;
    if (!filename || !code || !language) {
      return res.status(400).json({ error: "Filename, language, and code content are required." });
    }

    try {
      // Perform automated AI review via Gemini
      const reviewJson = await performCodeReview(filename, code, language);
      
      // Save record to persistent DB
      const review = db.createReview(user.id, filename, language, code, reviewJson);
      res.json(review);
    } catch (err: any) {
      console.error("Review flow crash:", err);
      res.status(500).json({ error: err.message || "An error occurred during code analysis." });
    }
  });

  app.get("/api/reviews", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    // Admins see all logs, standard users see only their own
    if (user.role === 'admin') {
      res.json(db.getReviews());
    } else {
      res.json(db.getReviews(user.id));
    }
  });

  app.get("/api/reviews/:id", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    const review = db.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review report not found." });

    if (review.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access to this report." });
    }

    res.json(review);
  });

  app.post("/api/reviews/:id/bookmark", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    try {
      const review = db.toggleBookmark(req.params.id, user.id);
      res.json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Bookmark operation failed." });
    }
  });

  app.delete("/api/reviews/:id", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    try {
      db.deleteReview(req.params.id, user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Delete operation failed." });
    }
  });

  // Compare files (duplicate code detection)
  app.post("/api/reviews/compare", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    const { codeA, codeB, fileAName, fileBName } = req.body;
    if (!codeA || !codeB) {
      return res.status(400).json({ error: "Both code snippets are required for analysis." });
    }

    try {
      const analysis = analyzeFileSimilarity(codeA, codeB, fileAName || 'File A', fileBName || 'File B');
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: "Similarity computation failed." });
    }
  });

  // AI Code repair tutor chat
  app.post("/api/chat/fix", async (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized." });

    const { filename, code, issueTitle, userMessage, chatHistory } = req.body;
    if (!code || !issueTitle || !userMessage) {
      return res.status(400).json({ error: "Snippet context, active issue, and message query are required." });
    }

    try {
      const assistantResponse = await getAIChatFix(filename || 'Code Segment', code, issueTitle, userMessage, chatHistory || []);
      res.json({ text: assistantResponse });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Chat tutor failed." });
    }
  });

  // --- ADMIN PANEL ENDPOINTS ---
  app.get("/api/admin/users", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin clearance required." });
    }
    
    // Return all registered accounts without passwords hashes
    const secureUsers = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      photo: u.photo,
      createdAt: u.createdAt
    }));
    res.json(secureUsers);
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin clearance required." });
    }

    if (user.id === req.params.id) {
      return res.status(400).json({ error: "You cannot delete your own admin account." });
    }

    try {
      db.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "User deletion failed." });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin clearance required." });
    }

    const reviews = db.getReviews();
    const users = db.getUsers();

    // 1. Averages
    const totalReviews = reviews.length;
    const averageScore = totalReviews > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.score, 0) / totalReviews) : 100;
    
    // 2. Language share breakdown
    const languageBreakdown: Record<string, number> = {};
    reviews.forEach(r => {
      const lang = r.language.toLowerCase();
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
    });

    // 3. Risk breakdown counts
    const riskBreakdown = { Low: 0, Medium: 0, High: 0 };
    reviews.forEach(r => {
      const rk = r.risk as 'Low' | 'Medium' | 'High';
      if (riskBreakdown[rk] !== undefined) {
        riskBreakdown[rk]++;
      } else {
        riskBreakdown.Low++; // fallback
      }
    });

    // 4. Daily logs timeline (last 7 days)
    const dailyUploads: Record<string, number> = {};
    for (let index = 0; index < 7; index++) {
      const d = new Date();
      d.setDate(d.getDate() - index);
      const key = d.toISOString().split('T')[0];
      dailyUploads[key] = 0;
    }
    
    reviews.forEach(r => {
      const key = r.createdAt.split('T')[0];
      if (dailyUploads[key] !== undefined) {
        dailyUploads[key]++;
      }
    });

    res.json({
      totalUsers: users.length,
      totalReviews,
      averageScore,
      languageBreakdown,
      riskBreakdown,
      dailyUploads
    });
  });

  // Vite development vs production asset handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Code Review Server online on port ${PORT}`);
  });
}

startServer();
