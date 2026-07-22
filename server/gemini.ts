import { GoogleGenAI, Type } from "@google/genai";
import { ReviewData } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is missing. Please configure your API key in Settings > Secrets to enable automated code reviews.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export async function performCodeReview(filename: string, code: string, language: string): Promise<ReviewData> {
  const client = getAI();
  
  const systemInstruction = `You are an elite, senior-level code security auditor, staff performance engineer, and software architect.
Analyze the provided code file with absolute precision.
Identify security vulnerabilities (SQL injections, XSS, insecure storage, hardcoded secrets), performance bottlenecks, readability concerns, bugs, and best-practice violations.
Generate a structured JSON report following the response schema exactly. Be constructive, objective, and provide specific line-level suggestions where applicable.`;

  const prompt = `Review this code:
Filename: ${filename}
Language: ${language}

Source Code:
\`\`\`${language}
${code}
\`\`\``;

  const config = {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["summary", "overallScore", "complexity", "risk", "maintainability", "metrics", "issues", "suggestions"],
      properties: {
        summary: {
          type: Type.STRING,
          description: "A high-level synthesis of code health, major security findings, and performance notes."
        },
        overallScore: {
          type: Type.INTEGER,
          description: "Weighted average score (0 to 100) reflecting quality, performance, and security."
        },
        complexity: {
          type: Type.STRING,
          description: "Code complexity level: Low, Medium, or High."
        },
        risk: {
          type: Type.STRING,
          description: "Aggregated security/stability risk level: Low, Medium, or High."
        },
        maintainability: {
          type: Type.INTEGER,
          description: "Estimated maintainability index from 0 to 100."
        },
        metrics: {
          type: Type.OBJECT,
          required: ["quality", "security", "performance", "bestPractices"],
          properties: {
            quality: { type: Type.INTEGER, description: "Code structure and formatting index 0-100" },
            security: { type: Type.INTEGER, description: "Security hygiene index 0-100" },
            performance: { type: Type.INTEGER, description: "Runtime efficiency index 0-100" },
            bestPractices: { type: Type.INTEGER, description: "Adherence to idiomatic patterns 0-100" }
          }
        },
        issues: {
          type: Type.ARRAY,
          description: "List of discrete issues identified in the code.",
          items: {
            type: Type.OBJECT,
            required: ["line", "severity", "category", "title", "description", "suggestion"],
            properties: {
              line: {
                type: Type.INTEGER,
                description: "1-indexed line number where the issue exists. Set to 0 if the issue is global to the file."
              },
              severity: {
                type: Type.STRING,
                description: "Issue severity. Must be: critical, high, medium, or low."
              },
              category: {
                type: Type.STRING,
                description: "Type of concern. Must be: security, performance, best-practice, bug, or code-smell."
              },
              title: {
                type: Type.STRING,
                description: "Clear and concise title of the issue."
              },
              description: {
                type: Type.STRING,
                description: "Rich description explaining why this is problematic."
              },
              suggestion: {
                type: Type.STRING,
                description: "Actionable remediation, code changes, or guidelines to fix the problem."
              }
            }
          }
        },
        suggestions: {
          type: Type.ARRAY,
          description: "High-level strategic recommendations for modernizing or optimizing this codebase.",
          items: {
            type: Type.OBJECT,
            required: ["title", "description", "impact"],
            properties: {
              title: { type: Type.STRING, description: "Short title of the recommendation" },
              description: { type: Type.STRING, description: "Detailed explanation" },
              impact: { type: Type.STRING, description: "Qualitative/Quantitative business or tech impact" }
            }
          }
        }
      }
    }
  };

  try {
    let response;
    try {
      response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config
      });
    } catch (err: any) {
      console.warn("Primary model 'gemini-3.5-flash' failed, trying fallback 'gemini-3.1-flash-lite'...", err);
      response = await client.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config
      });
    }

    const text = response.text;
    if (!text) {
      throw new Error("AI review response was empty.");
    }
    
    // Parse structured JSON
    const data = JSON.parse(text) as ReviewData;
    
    // Double check issue structure and add sequential unique IDs if missing
    if (data.issues && Array.isArray(data.issues)) {
      data.issues = data.issues.map((issue, idx) => ({
        ...issue,
        id: `issue-${Date.now()}-${idx}`
      }));
    } else {
      data.issues = [];
    }
    
    return data;
  } catch (err: any) {
    console.error("Gemini Code Review API Error:", err);
    throw new Error(`Review failed: ${err.message || err}`);
  }
}

export async function getAIChatFix(
  filename: string,
  code: string,
  issueTitle: string,
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<string> {
  const client = getAI();

  const consolidatedPrompt = `Here is our conversation history so far:
${chatHistory.map(h => `${h.role === 'user' ? 'Developer' : 'AI Tutor'}: ${h.parts[0].text}`).join('\n')}

New Developer Query: ${userMessage}

Please provide your recommendation and the corrected code.`;

  const config = {
    systemInstruction: `You are an elite interactive AI coding tutor. The user is asking for assistance fixing a code issue.
Context:
- File name: "${filename}"
- Active code segment:
\`\`\`
${code}
\`\`\`
- Issue context: "${issueTitle}"

Provide clear, step-by-step guidance. Output highly optimized, fully formatted, and clean code snippets with explanations. Keep your tone encouraging, collaborative, and professional.`
  };

  try {
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config
    });
    const response = await chat.sendMessage({ message: consolidatedPrompt });
    return response.text || "I was unable to formulate a response. Please try reframing your question.";
  } catch (err: any) {
    console.warn("Primary model 'gemini-3.5-flash' failed in chat fix, trying fallback 'gemini-3.1-flash-lite'...", err);
    try {
      const chat = client.chats.create({
        model: "gemini-3.1-flash-lite",
        config
      });
      const response = await chat.sendMessage({ message: consolidatedPrompt });
      return response.text || "I was unable to formulate a response. Please try reframing your question.";
    } catch (fallbackErr: any) {
      console.error("Fallback model 'gemini-3.1-flash-lite' failed in chat fix as well:", fallbackErr);
      throw err;
    }
  }
}
