export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string; // Base64 or placeholder avatar
  role: UserRole;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: User;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type IssueCategory = 'security' | 'performance' | 'best-practice' | 'bug' | 'code-smell';

export interface CodeIssue {
  id: string;
  line: number; // 1-indexed, or 0 if general
  severity: SeverityLevel;
  category: IssueCategory;
  title: string;
  description: string;
  suggestion: string;
}

export interface CodeSuggestion {
  title: string;
  description: string;
  impact: string;
}

export interface ReviewData {
  summary: string;
  overallScore: number;
  complexity: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  maintainability: number; // Score 0-100
  metrics: {
    quality: number; // 0-100
    security: number; // 0-100
    performance: number; // 0-100
    bestPractices: number; // 0-100
  };
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  filename: string;
  language: string;
  score: number;
  complexity: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  code: string;
  reviewJson: ReviewData;
  bookmarked?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface CompareResult {
  similarity: number;
  duplicateBlocks: Array<{
    startLineA: number;
    endLineA: number;
    startLineB: number;
    endLineB: number;
    content: string;
  }>;
  fileAName: string;
  fileBName: string;
  fileACode: string;
  fileBCode: string;
  diffSummary: string;
}
