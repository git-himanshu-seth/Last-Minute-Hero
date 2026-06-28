import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  checkMongoStatus, 
  syncUserProfileToMongo, 
  syncTaskToMongo, 
  syncGoalToMongo, 
  syncHabitToMongo, 
  deleteFromMongo, 
  fetchAllUserDataFromMongo 
} from './server/mongodb';
import {
  checkCloudSqlStatus,
  syncUserProfileToCloudSql,
  syncTaskToCloudSql,
  syncGoalToCloudSql,
  syncHabitToCloudSql,
  deleteFromCloudSql,
  fetchAllUserDataFromCloudSql
} from './src/db/helpers.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with reasonable limit for base64 images
app.use(express.json({ limit: '10mb' }));

let aiInstance: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please add it in the Secrets panel.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

interface FallbackOptions {
  maxRetries?: number;
  models?: string[];
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: any,
  options: FallbackOptions = {}
) {
  const maxRetries = options.maxRetries ?? 2;
  const fallbackModels = options.models ?? ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  
  let lastError: any = null;
  
  for (const model of fallbackModels) {
    // Exclude 'model' parameter from original params to avoid conflict, we override it
    const { model: _, ...cleanParams } = params;
    const modelParams = { ...cleanParams, model };
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Querying model: ${model} (attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent(modelParams);
        if (response) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.error(`[Gemini API] Failed on model ${model} (attempt ${attempt}/${maxRetries}):`, err.message || err);
        
        if (attempt < maxRetries) {
          const delay = attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  throw lastError || new Error('All model attempts failed.');
}

// Ensure the dev server doesn't crash on startup if API key is missing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/gemini')) {
    try {
      getGeminiAI();
      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    next();
  }
});

// ==========================================
// MODULE 1: AI TASK CAPTURE ENGINE
// ==========================================
app.post('/api/gemini/capture', async (req, res) => {
  const { text, imageBase64 } = req.body;
  
  try {
    const ai = getGeminiAI();
    let prompt = `You are an expert AI task capture engine. Extract task properties from the user input.
    Make your best assessment for dates, estimation times, and priorities based on clues in the prompt.
    Current Time Context: ${new Date().toISOString()} (Use this to parse relative terms like "next Friday", "this weekend", etc.)
    
    User Input: "${text || "No text provided"}"
    
    You must output a single, strict JSON object with EXACTLY this structure:
    {
      "title": "Clear, actionable title",
      "description": "More detailed description or user motivation",
      "category": "academic" | "career" | "financial" | "fitness" | "personal" (choose one),
      "priority": "critical" | "high" | "medium" | "low",
      "deadline": "ISO-8601 date-time string (e.g., 2026-06-30T17:00:00Z)",
      "estimatedHours": number (e.g. 4),
      "urgency": number (1-10 level),
      "impact": number (1-10 level),
      "userImportance": number (1-10 level),
      "subtasks": ["subtask 1 title", "subtask 2 title", "subtask 3 title"]
    }`;

    let contents: any[] = [prompt];
    
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
      prompt += `\nAn image of the task/syllabus/bill has been provided. Read any text, screenshots, dates, or prices from it.`;
    }

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json(parsedJson);
  } catch (err: any) {
    console.error('Error in task capture:', err);
    res.status(500).json({ error: err.message || 'Failed to capture task details' });
  }
});

// ==========================================
// MODULE 2: INTELLIGENT PRIORITY ENGINE
// ==========================================
app.post('/api/gemini/prioritize', async (req, res) => {
  const { task } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an expert Productivity & Prioritization Psychologist.
    Analyze this task and calculate its Priority Score and provide an explanation.
    
    Formula Context: Priority Score = (Urgency × Impact × Deadline Risk × User Importance)
    
    Task Details:
    - Title: "${task.title}"
    - Description: "${task.description || 'None'}"
    - Urgency: ${task.urgency || 5} / 10
    - Impact: ${task.impact || 5} / 10
    - User Importance: ${task.userImportance || 5} / 10
    - Estimated Hours: ${task.estimatedHours || 2} hours
    - Deadline: ${task.deadline} (Current Time: ${new Date().toISOString()})
    
    Determine:
    1. A calculated priorityLevel ('critical' | 'high' | 'medium' | 'low')
    2. A precise explanation of why this priority is set (e.g. "Only 2 days left to complete an 8-hour task. The impact of completing this is extremely high for your career goal.")
    3. Suggested action item.

    Output a strict JSON object with this structure:
    {
      "priorityLevel": "critical" | "high" | "medium" | "low",
      "priorityScore": number (out of 1000, calculate appropriately based on variables),
      "explanation": "Clear, supportive, coaching-style explanation",
      "suggestedImmediateAction": "First tiny actionable step"
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 3: AI DAILY EXECUTION PLANNER
// ==========================================
app.post('/api/gemini/plan', async (req, res) => {
  const { tasks, habits, date, focusHistory } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an elite Time Management Planner. Create "Today's Mission" hour-by-hour planner.
    Use existing pending tasks, habits, and focus trends to create a realistic, burnout-free day.
    
    Date: ${date}
    Pending Tasks: ${JSON.stringify(tasks)}
    Habits to check off today: ${JSON.stringify(habits)}
    Focus history: "${focusHistory || 'Prefers working morning hours'}"
    
    Output a strict JSON object with this structure:
    {
      "tasks": [
        { "time": "08:00 AM", "taskTitle": "Morning Routine & Habits", "durationHours": 1 },
        { "time": "09:00 AM", "taskTitle": "Task Title 1", "durationHours": 2 }
      ],
      "focusHours": number (total hours of focused work planned today)
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 4: DEADLINE RESCUE MODE
// ==========================================
app.post('/api/gemini/rescue', async (req, res) => {
  const { task } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are a high-stakes Deadline Rescue Coordinator.
    This task is at severe risk of missing its deadline. Generate a highly detailed, hour-by-hour or day-by-day emergency recovery roadmap.
    
    Task Title: "${task.title}"
    Description: "${task.description || 'None'}"
    Deadline: ${task.deadline} (Current Time: ${new Date().toISOString()})
    Estimated Total Hours: ${task.estimatedHours}
    Completed Hours so far: ${task.completedHours || 0}
    
    Calculate remaining effort and generate a strict 3-phase rescue plan (Today, Tomorrow, Day After) to compress the remaining work and finish on time.
    
    Output a strict JSON object with this structure:
    {
      "today": ["Step 1", "Step 2"],
      "tomorrow": ["Step 1", "Step 2"],
      "dayAfter": ["Step 1", "Step 2"],
      "explanation": "Brief, motivating battle plan explaining how this saves the deadline."
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 5: PROCRASTINATION DETECTOR & prediction
// ==========================================
app.post('/api/gemini/procrastinate', async (req, res) => {
  const { task, postponedCount } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an empathetic Productivity Coach specializing in Procrastination Psychology.
    Analyze why the user has postponed this specific task ${postponedCount} times, and predict future outcome if they do not change.
    
    Task Details:
    - Title: "${task.title}"
    - Description: "${task.description || 'None'}"
    - Category: "${task.category}"
    - Estimated Hours: ${task.estimatedHours}
    
    Provide:
    1. A Psychological Root Cause (e.g. "Fear of starting a large 5+ hour academic task")
    2. A concrete mini-step behavioral Recommendation to bypass friction
    3. Prediction ("AI Time Machine"): An honest, supportive but urgent projection of what will happen (e.g., "If you continue delaying, you will miss the Friday deadline by 2 full days and trigger a 30% grade penalty.")
    
    Output a strict JSON object with this structure:
    {
      "rootCause": "Psychological analysis of friction",
      "recommendation": "Step-by-step low-friction action plan to overcome procrastination",
      "prediction": "Time Machine simulation warning of future consequences"
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 7: VOICE PRODUCTIVITY ASSISTANT
// ==========================================
app.post('/api/gemini/voice-assistant', async (req, res) => {
  const { query, tasks, currentPlan } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are a warm, direct, voice-activated Personal Productivity Assistant.
    Answer the user's query briefly, as if speaking out loud in a conversation. Be very motivating and punchy.
    
    User Query: "${query}"
    Current Pending Tasks: ${JSON.stringify(tasks)}
    Current Daily Plan: ${JSON.stringify(currentPlan)}
    
    Provide:
    1. "spokenResponse": A short, conversational 2-3 sentence answer suitable for text-to-speech.
    2. "actionsSuggested": list of concrete UI navigation or task updates they should do.
    
    Output a strict JSON object with this structure:
    {
      "spokenResponse": "Hey there! I looked at your schedule, and your top priority right now is the React revisions. Let's block out 45 minutes to knock that out first. You've got this!",
      "actionsSuggested": ["Focus on React Revision", "View Daily Planner"]
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 8: AI PRODUCTIVITY COACH
// ==========================================
app.post('/api/gemini/coach', async (req, res) => {
  const { tasks, habits, completedCount, missedCount } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an elite Performance Coach. Create a brief, structured performance report.
    Analyze completed vs missed deadlines, task completion patterns, and habit streaks.
    
    Tasks Data: ${JSON.stringify(tasks)}
    Habit Data: ${JSON.stringify(habits)}
    Stats: ${completedCount} completed, ${missedCount} missed deadlines.
    
    Generate:
    - Overall Score (0-100)
    - Strengths (list of 2 items)
    - Weaknesses (list of 2 items)
    - Key suggestions for the next week
    
    Output a strict JSON object with this structure:
    {
      "score": number,
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "suggestions": ["string", "string"]
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MODULE 9: MONGODB DATA PERSISTENCE & MONITORING
// ==========================================

// Get connection status and document counts
app.get('/api/mongodb/status', async (req, res) => {
  try {
    const status = await checkMongoStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full sync route to upload all user data
app.post('/api/mongodb/sync-all', async (req, res) => {
  const { userId, profile, tasks, goals, habits } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required for MongoDB sync' });
  }

  try {
    const results = {
      profile: false,
      tasksSynced: 0,
      goalsSynced: 0,
      habitsSynced: 0,
      errors: [] as string[]
    };

    // 1. Sync Profile
    if (profile) {
      const r = await syncUserProfileToMongo(userId, profile);
      if (r.success) results.profile = true;
      else results.errors.push(`Profile: ${r.error}`);
    }

    // 2. Sync Tasks
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        const r = await syncTaskToMongo(userId, task);
        if (r.success) results.tasksSynced++;
        else results.errors.push(`Task ${task.id}: ${r.error}`);
      }
    }

    // 3. Sync Goals
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        const r = await syncGoalToMongo(userId, goal);
        if (r.success) results.goalsSynced++;
        else results.errors.push(`Goal ${goal.id}: ${r.error}`);
      }
    }

    // 4. Sync Habits
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        const r = await syncHabitToMongo(userId, habit);
        if (r.success) results.habitsSynced++;
        else results.errors.push(`Habit ${habit.id}: ${r.error}`);
      }
    }

    res.json({
      success: results.errors.length === 0 || results.tasksSynced > 0 || results.goalsSynced > 0,
      message: `Sync complete. Synced ${results.tasksSynced} tasks, ${results.goalsSynced} goals, ${results.habitsSynced} habits.`,
      details: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single document sync endpoints
app.post('/api/mongodb/sync/profile', async (req, res) => {
  const { userId, profile } = req.body;
  const result = await syncUserProfileToMongo(userId, profile);
  res.json(result);
});

app.post('/api/mongodb/sync/task', async (req, res) => {
  const { userId, task } = req.body;
  const result = await syncTaskToMongo(userId, task);
  res.json(result);
});

app.post('/api/mongodb/sync/goal', async (req, res) => {
  const { userId, goal } = req.body;
  const result = await syncGoalToMongo(userId, goal);
  res.json(result);
});

app.post('/api/mongodb/sync/habit', async (req, res) => {
  const { userId, habit } = req.body;
  const result = await syncHabitToMongo(userId, habit);
  res.json(result);
});

app.delete('/api/mongodb/delete', async (req, res) => {
  const { collectionName, id } = req.body;
  if (!collectionName || !id) {
    return res.status(400).json({ success: false, error: 'collectionName and id are required' });
  }
  const result = await deleteFromMongo(collectionName, id);
  res.json(result);
});

// Recovery / loading route from MongoDB
app.get('/api/mongodb/restore/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId parameter is required' });
  }
  const result = await fetchAllUserDataFromMongo(userId);
  res.json(result);
});

// ==========================================
// MODULE 10: CLOUD SQL DATA PERSISTENCE & MONITORING
// ==========================================

// Get connection status and table counts
app.get('/api/cloudsql/status', async (req, res) => {
  try {
    const status = await checkCloudSqlStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full sync route to upload all user data to Cloud SQL
app.post('/api/cloudsql/sync-all', async (req, res) => {
  const { userId, profile, tasks, goals, habits } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required for Cloud SQL sync' });
  }

  try {
    const results = {
      profile: false,
      tasksSynced: 0,
      goalsSynced: 0,
      habitsSynced: 0,
      errors: [] as string[]
    };

    // 1. Sync Profile
    if (profile) {
      const r = await syncUserProfileToCloudSql(userId, profile);
      if (r.success) results.profile = true;
      else results.errors.push(`Profile: ${r.error}`);
    }

    // 2. Sync Tasks
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        const r = await syncTaskToCloudSql(userId, task);
        if (r.success) results.tasksSynced++;
        else results.errors.push(`Task ${task.id}: ${r.error}`);
      }
    }

    // 3. Sync Goals
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        const r = await syncGoalToCloudSql(userId, goal);
        if (r.success) results.goalsSynced++;
        else results.errors.push(`Goal ${goal.id}: ${r.error}`);
      }
    }

    // 4. Sync Habits
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        const r = await syncHabitToCloudSql(userId, habit);
        if (r.success) results.habitsSynced++;
        else results.errors.push(`Habit ${habit.id}: ${r.error}`);
      }
    }

    res.json({
      success: results.errors.length === 0 || results.tasksSynced > 0 || results.goalsSynced > 0 || results.habitsSynced > 0,
      message: `Cloud SQL Sync complete. Synced ${results.tasksSynced} tasks, ${results.goalsSynced} goals, ${results.habitsSynced} habits.`,
      details: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single document delete endpoint for Cloud SQL
app.delete('/api/cloudsql/delete', async (req, res) => {
  const { collectionName, id } = req.body;
  if (!collectionName || !id) {
    return res.status(400).json({ success: false, error: 'collectionName and id are required' });
  }
  const result = await deleteFromCloudSql(collectionName, id);
  res.json(result);
});

// Recovery / loading route from Cloud SQL
app.get('/api/cloudsql/restore/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId parameter is required' });
  }
  const result = await fetchAllUserDataFromCloudSql(userId);
  res.json(result);
});

// ==========================================
// MODULE 11: AI COLLABORATION WORKSPACE ENDPOINTS
// ==========================================

// 1. Chat Tagged Command Processor (@AI commands)
app.post('/api/gemini/workspace-command', async (req, res) => {
  const { command, channelName, context } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an elite Agile Project Manager and AI Tech Lead inside an AI Collaboration Workspace.
    Analyze the user's command tagged at you, along with the channel name and the team context.
    
    Channel Context: #${channelName || 'general'}
    Team Context Summary: ${JSON.stringify(context || {})}
    User Command: "${command}"
    
    Based on the command (e.g. "@AI summarize today's discussion", "@AI generate action items", "@AI assign tasks", "@AI create sprint plan", "@AI identify blockers"), formulate a highly professional, direct, and actionable response.
    Keep your response clean and formatted with Markdown. Offer concrete tasks, assignees, or sprint advice based on the team context if relevant.
    Do not add excessive meta-chat; give the team high-value content immediately.`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt]
    });

    res.json({ response: response.text || 'I am ready to help the team keep momentum!' });
  } catch (err: any) {
    console.error('Error in workspace command:', err);
    res.status(500).json({ error: err.message || 'Failed to process command' });
  }
});

// 2. Team Coach & Analytics (Deadline prediction, Smart Team Balancer, Burnout check)
app.post('/api/gemini/workspace-coach', async (req, res) => {
  const { groupName, members, tasks, goals } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an elite AI Team Coach, Agile Consultant, and Project Risk Predictor.
    Analyze this workspace team and generate a comprehensive Agile Coaching audit and delay prediction.
    
    Team/Workspace: "${groupName || 'Workspace Group'}"
    Members: ${JSON.stringify(members || [])}
    Group Tasks: ${JSON.stringify(tasks || [])}
    Group Goals: ${JSON.stringify(goals || [])}
    Current Time: ${new Date().toISOString()}
    
    You must perform:
    1. A Team Health Score calculation (0-100) based on task completions, deadline adherence, and member workload.
    2. Burnout Detection: Identify members with high task count or overdue items.
    3. AI Deadline & Delay Prediction: Predict success probability for upcoming goals, expected completion dates, and risk levels.
    4. Smart Team Balancer: Specific suggestions to redistribute overloaded tasks.
    5. Actionable Coaching recommendations (e.g., "Frontend team is overloaded. Move testing tasks to QA").
    
    You must output a single, strict JSON object with EXACTLY this structure:
    {
      "healthScore": number,
      "burnoutAlerts": [
        { "memberName": "Name", "alert": "Short alert message describing overload" }
      ],
      "delayPredictions": {
        "successProbability": number, 
        "expectedCompletion": "e.g., July 30",
        "riskLevel": "Low" | "Medium" | "High" | "Critical",
        "explanation": "Brief reasoning for deadline prediction"
      },
      "balancerSuggestions": [
        { "taskTitle": "Task Name", "suggestedAssignee": "Name", "reason": "Reason details" }
      ],
      "coachingSuggestions": [
        "Actionable direct feedback bullet 1",
        "Actionable direct feedback bullet 2"
      ]
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error in team coach analysis:', err);
    res.status(500).json({ error: err.message || 'Failed to compile coach report' });
  }
});

// 3. AI Standup Bot
app.post('/api/gemini/standup-bot', async (req, res) => {
  const { memberName, yesterday, today, blockers } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are the Daily Standup Scrum Master. Compile this developer's standup responses into a highly readable, structured, and visually clean Standup Report with action items or safety concerns for blockers.
    
    Member: ${memberName || 'Team Member'}
    Yesterday: "${yesterday || 'None'}"
    Today: "${today || 'None'}"
    Blockers: "${blockers || 'None'}"
    
    Output a clean Markdown report with emojis, brief sections for Accomplished, Planned, Blockers (highlighted with advice if any), and a "Scrum Master Assessment". Keep it concise yet actionable.`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt]
    });

    res.json({ report: response.text || 'Standup recorded!' });
  } catch (err: any) {
    console.error('Error in standup compilation:', err);
    res.status(500).json({ error: err.message || 'Failed to compile standup' });
  }
});

// 4. Meeting Summarization & Auto-tasking
app.post('/api/gemini/meeting-summarizer', async (req, res) => {
  const { meetingTitle, transcriptText } = req.body;
  
  try {
    const ai = getGeminiAI();
    const prompt = `You are an expert Executive Assistant. Summarize this meeting and extract tasks.
    
    Meeting Title: "${meetingTitle || 'Team Sync'}"
    Transcript/Notes Segment:
    """
    ${transcriptText || 'Discussion about finishing the homepage styling, fixing the MongoDB error, and preparing the slide deck.'}
    """
    
    Analyze the meeting details and return:
    1. A neat summary of what was discussed.
    2. Primary decisions made.
    3. Action items.
    4. Auto-generated tasks with suggested Assignee (matching names in conversation), priority, description, and days until deadline.
    
    You must output a single, strict JSON object with EXACTLY this structure:
    {
      "summary": "Clear high-level meeting summary",
      "decisions": "Bullet point summary of key decisions",
      "actionItems": ["Action item 1", "Action item 2"],
      "suggestedTasks": [
        {
          "title": "Clear short task title",
          "description": "Task description derived from the discussion",
          "assignedTo": "Name of attendee",
          "priority": "critical" | "high" | "medium" | "low",
          "daysToDeadline": number
        }
      ]
    }`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error in meeting summarizer:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize meeting' });
  }
});

// ==========================================
// MODULE 5: STRIPE INTEGRATION & AI GRAMMAR CHECK
// ==========================================

import Stripe from 'stripe';

let stripeClient: any = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key, {
        apiVersion: '2025-01-27' as any,
      });
    }
  }
  return stripeClient;
}

// Stripe checkout session creation
app.post('/api/stripe/checkout-session', async (req, res) => {
  const { plan, successUrl, cancelUrl, userId } = req.body;
  const stripe = getStripe();
  
  if (stripe) {
    try {
      const amount = plan === 'pro' ? 1200 : plan === 'enterprise' ? 4900 : 0;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Lifesaver AI - ${plan.toUpperCase()} Plan Subscription`,
                description: plan === 'pro' ? 'Unlimited tasks, full AI Coach, Advanced Rescue' : 'Team workspace, voice rooms, shared habits, unlimited AI',
              },
              unit_amount: amount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
        cancel_url: cancelUrl,
        metadata: { userId, plan },
      });
      return res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      console.error('Real Stripe Session creation failed:', err);
    }
  }

  // Graceful Simulation Fallback URL
  const simUrl = `/simulated-checkout?plan=${plan}&userId=${userId}&successUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;
  res.json({ id: 'simulated-session-id', url: simUrl });
});

// AI Grammar check and polishing
app.post('/api/gemini/grammar-check', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for grammar check' });
  }

  try {
    const ai = getGeminiAI();
    const prompt = `You are an elite, professional text polisher. Your task is to fix any grammatical issues, spelling mistakes, punctuation, and wording of the user input, making it sound clear, concise, and highly professional, while retaining the original meaning. Do not change it so much that it loses its identity. Only return the corrected text, absolutely nothing else. No introductions, no explanations, no wrappers.
    
    User Input: "${text}"`;

    const response = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: [prompt]
    });

    res.json({ correctedText: (response.text || text).trim() });
  } catch (err: any) {
    console.error('Error in grammar check:', err);
    res.status(500).json({ error: err.message || 'Grammar correction failed' });
  }
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
