# Last Minute Life Saver ⏰⚡

> **AI that doesn't just remind you — it helps you finish.**

Last Minute Life Saver is an AI-powered, high-stakes productivity companion designed to prevent procrastination, predict deadline failures, and proactively pull users across the finish line. Unlike passive notification-based calendars, Last Minute Life Saver steps in as an **Active Accountability Partner**, restructuring workloads dynamically using **Google Gemini 2.5** and providing synthetic vocal coaching.

---

## 🛠️ Full System Architecture

```
                       ┌─────────────────────────┐
                       │   React 19 Frontend     │
                       │   (Tailwind, Motion)    │
                       └────────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │   Firebase Auth   │               │  Vite Dev Proxy / │
        │  & Firestore Sync │               │ Express API Route │
        └───────────────────┘               └─────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌───────────────────┐
                                            │  Google Gemini    │
                                            │  AI Core Engine   │
                                            └───────────────────┘
```

---

## 💾 Firestore Schema Design

### 1. `users`
- `_id`: String (Firebase UID)
- `name`: String
- `email`: String
- `photoUrl`: String (Optional)
- `productivityScore`: Number (0-100)
- `createdAt`: ISO Date

### 2. `tasks`
- `_id`: String (Document ID)
- `userId`: String (Owner reference)
- `title`: String
- `description`: String
- `priority`: `'critical' | 'high' | 'medium' | 'low'`
- `category`: `'academic' | 'career' | 'financial' | 'fitness' | 'personal'`
- `status`: `'pending' | 'completed'`
- `deadline`: ISO Date
- `estimatedHours`: Number
- `completedHours`: Number
- `urgency`: Number (1-10)
- `impact`: Number (1-10)
- `userImportance`: Number (1-10)
- `riskLevel`: `'safe' | 'moderate' | 'high' | 'critical'`
- `riskScore`: Number
- `subtasks`: Array of `{ id: String, title: String, completed: Boolean }`
- `rescuePlan`: `{ today: String[], tomorrow: String[], dayAfter: String[], explanation: String }` (Optional)

---

## 🔌 REST API Design (Express.js Backend)

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/api/gemini/capture` | POST | `{ text, imageBase64 }` | Extracts structured task schema from natural language prompts or screenshots. |
| `/api/gemini/prioritize` | POST | `{ task }` | Evaluates Urgency, Impact, and Deadline risk to determine real Priority Score. |
| `/api/gemini/plan` | POST | `{ tasks, habits, date }` | Assembles a realistic hour-by-hour focus schedule. |
| `/api/gemini/rescue` | POST | `{ task }` | Generates Emergency Recovery plans for overdue assignments. |
| `/api/gemini/procrastinate`| POST | `{ task, postponedCount }`| Probes cognitive resistance and provides procrastination strategies. |
| `/api/gemini/voice-assistant`| POST | `{ query, tasks, plan }` | Returns synth voice responses suitable for speech synthesis. |
| `/api/gemini/coach` | POST | `{ tasks, habits }` | Reviews weekly analytics, generating ratings and coaching advice. |

---

## 💡 Advanced AI Capabilities

1. **Multimodal Capturing**: Users can drag and drop course syllabi, invoice receipts, or interview letters. Gemini reads raw text, extracts deadlines, estimates workloads, and populates the database automatically.
2. **AI Time Machine**: Simulates pacing. Warning outputs look like: *"If you continue at this rate, you will miss the deadline by 2 full days."*
3. **Emergency Rescue Compression**: Re-allocates non-essential routines when remaining effort surpasses available hours.
4. **Vocal Coach Synth**: Leverages Web Speech Synthesis matched with real-time CSS bounced frequency wave simulations to deliver conversational audio.

---

## 🔒 Security Best Practices

- **Zero Client-Side Key Leaks**: All Gemini API requests are proxied via the Express server using Node's `process.env.GEMINI_API_KEY`.
- **Firebase Sandbox Isolation**: Strict document subscription rules ensure authenticated users only observe and modify records containing their specific `userId`.
