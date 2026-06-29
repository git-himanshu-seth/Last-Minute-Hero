# ⏰⚡ Success Scheduler — Product Requirements Document (PRD) & Software Requirements Specification (SRS)

---

## 📋 1. Project Overview

**Success Scheduler** (formerly *Last Minute Life Saver*) is a full-stack, AI-powered, active accountability companion and group sprint coordinator. Unlike passive digital calendars or task planners that function as quiet reminders, Success Scheduler operates as an **Active Accountability Partner**. 

By combining advanced cognitive pacing, structured database serialization, and the cognitive reasoning of **Google Gemini AI**, the system proactively acts to prevent deadline failures, isolate procrastination behaviors, and dynamically compress schedules. For team environments, it scales into a shared collaborative workspace equipped with digital Kanban boards, simulated real-time chats, voice/video call frames, and automated sprint standups with a smart team balancer.

---

## 🎯 2. Problem Statement

Traditional time-management tools fail because they assume perfect human execution. They act as passive storage systems: you input a task, and they send an email or push notification on the day it is due. 
*   **Passive Failure**: Users ignore passive notification bells. By the time a reminder triggers, the remaining effort required to complete the task exceeds the actual time left before the deadline.
*   **Lack of Friction Analysis**: Planners fail to track *why* a user is putting off a task. They do not diagnose cognitive friction (e.g., confusion, perfectionism, lack of energy).
*   **Static Scheduling**: Traditional calendars do not adjust to real-time velocity. If a user slips behind, the schedule remains fixed until they manually drag-and-drop boxes, creating administrative fatigue.
*   **Collaborative Blindspots**: In group projects (e.g., hackathons, student sprints), workload distribution is often invisible. Overloaded team members burn out silently, while available members remain idle due to coordination delays.

---

## 🚀 3. Objectives

The system is engineered around four core objectives:
1.  **Predictive Intervention**: Transition task management from a historic log to a predictive pacing model that warns users of deadline breaches *days* in advance.
2.  **Cognitive Alignment**: Mitigate procrastination at the point of action using custom psychological probes and behavioral interventions.
3.  **Autonomous Scheduling**: Enable seamless capture of complex timelines (syllabi, invoices, project outlines) directly into structured, actionable schedules using multi-modal AI.
4.  **Equalized Collaboration**: Facilitate dynamic, automated team balancing so sprint groups can self-correct workloads without needing a full-time human project manager.

---

## 👥 4. User Roles

The system accommodates three logical user roles:

| Role | Scope of Access | Primary Objective | Key Features Utilized |
|---|---|---|---|
| **Individual Focus User** | Personal Dashboard, private tasks, habits, and vocal coaching. | Eliminate personal procrastination; manage individual deadlines. | Bento Dashboard, Multimodal Syllabus Capture, Procrastination Probe, AI Vocal Coach. |
| **Group Sprint Coordinator** | Full access to workspaces, team Kanban boards, standup audits, and balancer actions. | Ensure smooth project delivery; balance team workloads. | Shared Workspace, Smart Team Balancer, Meeting Summarizer, Standup Bot. |
| **System Administrator** | Diagnostic suites, performance auditing, system logs, and licensing overrides. | Maintain runtime integrity; manage environment billing configurations. | Systems Diagnostics Dashboard, Simulated Checkout sandbox. |

---

## ⚙️ 5. Features and Functionalities (Feature-by-Feature Deep Dive)

---

### Module 5.1: The Dynamic Bento Dashboard & 3D Risk Analyzer

```
+-------------------------------------------------------------------------+
| [⚡ ACCOUNTABILITY PANEL]                                                |
|                                                                         |
|        / \               PRODUCTIVITY SCORE:  [ 84% ]                   |
|       /   \              Accountability Streak: 12 Days                 |
|      |  O  |             Active Focus Mode: ON                          |
|       \   /                                                             |
|        \ /               Pacing Velocity: [ CRITICAL DETECTED ]         |
|   Hazard Dial                                                           |
+-------------------------------------------------------------------------+
```

#### A. Feature Description
The primary control cockpit of the application. It computes a real-time **Productivity & Accountability Score (0-100%)** based on task progression and habit compliance. It features an interactive, animated visual Hazard Dial that alerts the user to their active deadline risk profile.

#### B. Why It Is Needed
Users experience "planning fallacy"—the tendency to underestimate how long a task will take. They need an active, ambient visualization of their current temporal safety margin to snap out of complacency.

#### C. Problems It Solves
*   Eliminates passive ignorance of dates.
*   Solves the "out of sight, out of mind" cognitive bias of collapsed calendars.
*   Aggregates fragmented progress variables (habits, tasks, goals) into a single, high-density score.

#### D. How It Works
The system continuously evaluates tasks and habits. A custom weight coefficient is applied:
$$\text{Accountability Score} = (\text{Completed Tasks Ratio} \times 0.6) + (\text{Habit Streak Score} \times 0.4)$$
If any active critical task is overdue or the velocity is insufficient, the system sets the hazard dial to "CRITICAL DETECTED" and alerts the visual UI.

#### E. User Flow & Expected Behavior
1.  User signs in.
2.  Dashboard renders immediately with a fluid fade-in.
3.  The hazard dial animates to the calculated percentage.
4.  Overdue high-priority items flash in deep crimson red borders.
5.  Clicking any gauge opens the respective item instantly.

#### F. Technical Implementation Details
*   **Component**: `src/components/Dashboard.tsx`
*   **Animations**: Staggered cards and floating dial arcs powered by `motion/react`.
*   **Dynamic Class Calculation**: Employs custom utility functions (`cn()`) to toggle glow shadows based on risk states.

#### G. Database Structure & APIs Involved
*   **Collections**: `users`, `tasks`, `habits`
*   **APIs**: Calls server endpoint `/api/gemini/prioritize` when tasks are updated to recalculate current safety margin coefficients.

#### H. Security Considerations
*   Dashboard read operations are fully protected by Firebase Security Rules ensuring a user can never access or query another user's progress.

#### I. Future Scalability Options
*   Integrating native WebSockets to stream changes immediately without polling.
*   Introducing desktop push notification widgets.

---

### Module 5.2: Multimodal Task Capture & Syllabus Reader

```
+-------------------------------------------------------------------------+
| [📁 MULTIMODAL SYLLABUS CAPTURE]                                        |
|                                                                         |
|   +---------------------------------------------+   [ Capture ]         |
|   | Drag & Drop Course Syllabus, Invoice, etc.  |                       |
|   +---------------------------------------------+   [ Custom Query... ] |
+-------------------------------------------------------------------------+
```

#### A. Feature Description
Allows users to drag and drop physical documents (e.g., course syllabi, contract invoices, milestones lists, project briefs) or upload screenshot images. The AI parses the text, extracts names, deadlines, estimated effort hours, and constructs a structured task array.

#### B. Why It Is Needed
Manual administrative setup is a major friction point. Users procrastinate before they even start because entering fifty tasks from a syllabus takes hours.

#### C. Problems It Solves
*   Reduces entry friction to zero.
*   Solves transcription errors (incorrect dates, omitted milestones).
*   Categorizes tasks and estimates workloads automatically.

#### D. How It Works
The user uploads an image. The client converts it to a base64 string. This string is dispatched alongside a system prompt to the Express server. The server runs the Google Gemini API with multimodal input support (`gemini-2.5-flash`), parses the image content, and enforces a strict structured JSON output response.

#### E. User Flow & Expected Behavior
1.  User enters the "Tasks & Planner" tab.
2.  Drags an image of an invoice or checklist into the target box.
3.  Clicking "Process Document" initiates an overlay spinner.
4.  Within seconds, extracted tasks with pre-populated deadlines, descriptions, and efforts appear as a preview card list.
5.  Clicking "Approve & Import" inserts them all directly into the database.

#### F. Technical Implementation Details
*   **Component**: `src/components/Tasks.tsx`
*   **API Client**: Uses standard HTML5 `FileReader` API to parse inputs into C-Style Data URIs before network dispatch.

#### G. Database Structure & APIs Involved
*   **Collections**: Writes to `tasks` collections.
*   **Endpoints**: Post request is sent to `/api/gemini/capture`.

#### H. Security Considerations
*   Base64 strings are processed directly in-memory on the server.
*   No physical image files are saved to the server disk, mitigating directory traversal attacks.

#### I. Future Scalability Options
*   Support for multi-page PDFs utilizing Google Cloud Storage processing.
*   Direct synchronization with campus LMS portals (Canvas, Blackboard).

---

### Module 5.3: Emergency Rescue Compression & Time Machine

```
+-------------------------------------------------------------------------+
| [⏳ EMERGENCY RESCUE INTERVENTION]                                      |
|                                                                         |
|   Estimated Remaining Work: 18 Hours     Time Remaining: 12 Hours       |
|                                                                         |
|   >> [⚠️ WARNING]: Effort exceeds remaining hours by 6.0 Hours.          |
|                                                                         |
|   [ GENERATE HOUR-BY-HOUR RESCUE COMPRESSION PLAN ]                     |
+-------------------------------------------------------------------------+
```

#### A. Feature Description
When a user's remaining task effort exceeds the available hours before a high-priority deadline, standard calendars crash. The **Emergency Rescue Engine** executes an optimization routine to re-plan the user's schedule, suggesting hours to strip from non-essential habits and generating an extreme recovery plan.

#### B. Why It Is Needed
When users fall behind, they experience anxiety paralysis. They need a logical, step-by-step escape hatch that strips away clutter and outlines exactly how to salvage the remaining hours.

#### C. Problems It Solves
*   Mitigates cognitive freeze due to stress.
*   Replaces generic warnings with action-oriented hourly checklists.
*   Prevents planning failures when timelines become critical.

#### D. How It Works
The UI calculates if:
$$\text{Remaining Task Duration (Hours)} > \text{Available Time to Deadline (Hours)}$$
If this inequality evaluates to true, the UI triggers a "Critical Rescue Warning". It sends the context to Gemini which returns a compressed timeline, temporarily turning off repeating hobbies to free up dedicated blocks of sprint hours.

#### E. User Flow & Expected Behavior
1.  User has a task due tomorrow at 5 PM (12 hours remaining) with an estimated 18 hours of effort left.
2.  The dashboard triggers a pulsating warning.
3.  User clicks "Generate Emergency Plan".
4.  Gemini structures an hour-by-hour schedule: *"6 AM - 9 AM: Code core; 10 AM - 12 PM: Draft documentation; (Habit "Gym" suspended today)."*
5.  The compressed plan is saved as a sub-schedule on the task.

#### F. Technical Implementation Details
*   **Component**: `src/components/Tasks.tsx`, `src/components/Dashboard.tsx`
*   **Procrastination Probe**: If the user clicks "Postpone", a modal intercepts them, asking them to write their cognitive resistance. This is processed via `/api/gemini/procrastinate` to return psychological micro-coaching.

#### G. Database Structure & APIs Involved
*   **Collections**: Overwrites specific task `rescuePlan` fields.
*   **Endpoints**: Calls `/api/gemini/rescue` and `/api/gemini/procrastinate`.

#### H. Security Considerations
*   User responses in procrastination logs are treated with high-security constraints and are only visible to the owner.

#### I. Future Scalability Options
*   Integrating external calendars (Google Calendar, Outlook) to auto-block hours and auto-reject conflicting appointments.

---

### Module 5.4: Synthetic Vocal Coaching

```
+-------------------------------------------------------------------------+
| [🎙️ AI VOCAL COMPANION]                                                |
|                                                                         |
|   "Keep moving. You have 3 critical sprints before sunrise!"            |
|                                                                         |
|      ||| | ||| ||| | |||    (Bouncing CSS frequency waves)              |
|                                                                         |
|   [🎙️ Click to Speak]  [🔊 Mute Voice]                                  |
+-------------------------------------------------------------------------+
```

#### A. Feature Description
A vocal assistant module that allows users to engage with their scheduler hands-free. It uses conversational AI with native web audio technologies, translating text summaries into synthetic vocal instructions accompanied by a real-time responsive audio wave visualization.

#### B. Why It Is Needed
Reading blocks of text on a dashboard lacks emotional resonance. Hearing a direct, encouraging voice coach provides conversational accountability.

#### C. Problems It Solves
*   Solves the "impersonal" feel of traditional productivity apps.
*   Enables accessibility for visually impaired developers or multi-taskers.
*   Creates an immersive accountability atmosphere.

#### D. How It Works
The user submits a question or initiates an assessment. The app queries the Express server. The server forwards user context (schedules, active tasks) to Gemini to formulate a short, encouraging speech output. The client feeds this output to the Web Speech Synthesis API (`window.speechSynthesis`). While speaking, custom CSS keyframe animations bounce standard SVG bars to simulate voice frequencies.

#### E. User Flow & Expected Behavior
1.  User opens the "AI Vocal Coach" tab.
2.  Selects "Assess My Progress".
3.  The wave simulator starts bouncing.
4.  A crisp, synthetic voice speaks: *"You completed your habit check-ins today, but your core task is behind. I recommend tackling subtask 1 right now."*
5.  User can toggle voice outputs or write manual questions in the coach chat.

#### F. Technical Implementation Details
*   **Component**: `src/components/VoiceAssistant.tsx`
*   **Speech Synthesis**: Employs the `SpeechSynthesisUtterance` interface, picking high-quality English voice engines.

#### G. Database Structure & APIs Involved
*   **Endpoints**: Calls `/api/gemini/voice-assistant`.

#### H. Security Considerations
*   Mic permission requests are explicitly declared in `metadata.json` and restricted within the sandboxed frame layer.

#### I. Future Scalability Options
*   Integration with Web Speech Recognition API for bidirectional hands-free vocal conversations.

---

### Module 5.5: Shared AI Collaboration Workspace

```
+-------------------------------------------------------------------------+
| [👥 COLLABORATIVE KANBAN BOARD]                                         |
|                                                                         |
|   BACKLOG          TODO          IN PROGRESS      REVIEW       COMPLETED|
|  [ Task A ]     [ Task B ]       [ Task C ]     [ Task D ]     [ Task E]|
|                                                                         |
|   [ Smart Team Balancer ]   [ Meeting Summarizer ]  [ Standup Bot ]     |
+-------------------------------------------------------------------------+
```

#### A. Feature Description
A robust, modular collaboration environment tailored for project teams. It supports full digital Kanban and Sprint Boards, automated standup bots, a simulated multi-party group chat with active AI colleagues, WebRTC-style visual voice calling, and a smart meeting summaries processor.

#### B. Why It Is Needed
Hackathons and fast-moving sprints are chaotic. Teams lack the overhead to manually maintain Jira tasks, leading to out-of-sync tasks and unbalanced effort loads.

#### C. Problems It Solves
*   Saves hours of sprint administration.
*   Solves team standup writing fatigue.
*   Identifies bottlenecked developers and reallocates tickets instantly.
*   Converts unstructured meeting recordings directly into actionable sprint board tickets.

#### D. How It Works
The Workspace integrates multiple subsystems:
*   **Smart Team Balancer**: Evaluates each member's listed workload value. For any member exceeding 80% workload, the optimizer re-assigns tickets to the member with the lowest workload, ensuring skills match.
*   **Standup Bot**: Compiles Scrum standups and generates an automated **Scrum Master Assessment** outlining active blockers.
*   **Meeting Notes Summarizer**: Parses transcripts, extracts task items, and writes them directly to the Kanban board list.

#### E. User Flow & Expected Behavior
1.  User clicks the "AI Workspace" tab.
2.  Kanban boards display tasks assigned to human and simulated AI developers.
3.  User pastes a meeting transcript in the "Meeting Summarizer" modal.
4.  The system parses the text and automatically adds three new cards to the Kanban "Backlog".
5.  Clicking "Smart Team Balancer" pops a confirmation modal detailing how cards were reallocated to maintain balanced workloads.

#### F. Technical Implementation Details
*   **Component**: `src/components/Workspace.tsx`, `src/components/RealtimeCall.tsx`
*   **Digital Team Profiles**: Features simulated workspace developers (e.g., frontend, backend, UI designers) with individual skills lists and workloads.

#### G. Database Structure & APIs Involved
*   **Collections**: `users` (team organization context), `groups`, `tasks`
*   **Endpoints**: Calls `/api/gemini/coach` and custom client-side parsing pipelines.

#### H. Security Considerations
*   Collaboration channels verify workspace boundaries to ensure team code repositories or notes are restricted to verified workspace participants.

#### I. Future Scalability Options
*   Direct Slack, Discord, or Microsoft Teams webhooks integration.
*   Real WebRTC mesh peer-to-peer audio and video integrations.

---

## 🏗️ 6. System Architecture

Success Scheduler utilizes a modern, resilient full-stack architecture running inside sandboxed Docker containers on Google Cloud Run.

```
                     ┌──────────────────────────────────────┐
                     │          Vite Web Browser            │
                     │  - React 19 Engine                   │
                     │  - Tailwind Utility Styles           │
                     │  - Framer Motion Layouts             │
                     │  - HTML5 Speech & Canvas Audio       │
                     └──────────────────┬───────────────────┘
                                        │ (HTTPS / REST)
                                        ▼
                     ┌──────────────────────────────────────┐
                     │          Express.js Server           │
                     │  - Port 3000 Ingress Node            │
                     │  - Esbuild Standalone CJS Bundle     │
                     │  - Environment Validation Layers     │
                     └──────────┬────────────────┬──────────┘
                                │                │
                 ┌──────────────┘                └──────────────┐
                 ▼ (SDK Client)                                 ▼ (Database Handlers)
   ┌───────────────────────────┐                  ┌───────────────────────────┐
   │    Google Gemini API      │                  │  Data Persistence Layers  │
   │  - gemini-2.5-flash       │                  │  - Firebase Firestore     │
   │  - Multimodal Processing  │                  │  - Cloud SQL PostgreSQL   │
   │  - Structured JSON Output │                  │  - MongoDB Atlas Cloud    │
   └───────────────────────────┘                  └───────────────────────────┘
```

### Flow Breakdown
1.  **Ingress Layer**: External requests flow via a unified Nginx Reverse Proxy mapped exclusively to **Port 3000**.
2.  **App Server Node**: Built with **Express.js**,compiled to a single-file CommonJS binary (`dist/server.cjs`) using `esbuild` for ultra-fast startup times.
3.  **Client Application**: Transpiled by Vite as a single-page React SPA. Assets are served statically in production, and dynamically proxied in development mode.

---

## 💾 7. Database Design

Success Scheduler maintains a highly decoupled, dual-syncing database architecture. It features a local-first memory model that synchronizes seamlessly with **Firebase Firestore** for client transactions and can hook up to **Cloud SQL (PostgreSQL)** or **MongoDB Atlas** for enterprise-scale persistence.

### 7.1 Firestore Schema Design

#### 1. `users` (Collection)
Defines individual profile configurations, organizational membership, and productivity telemetry.
```json
{
  "_id": "vM81mO9Xm8Ush2ks092Ksiw",
  "name": "Alex Hustle",
  "email": "alex.hustle@developer.com",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "productivityScore": 84,
  "timezone": "America/Los_Angeles",
  "occupation": "Full Stack Engineer",
  "organization": "Success Scheduler Studio",
  "createdAt": "2026-06-29T08:00:00.000Z"
}
```

#### 2. `tasks` (Collection)
The primary work units. Integrates metadata, subtask checklists, and AI-generated recovery plans.
```json
{
  "_id": "task_9281048",
  "userId": "vM81mO9Xm8Ush2ks092Ksiw",
  "title": "Build Core Authentication Module",
  "description": "Establish standard login layouts and configure Firebase client synchronization.",
  "priority": "critical",
  "category": "career",
  "status": "pending",
  "deadline": "2026-06-30T17:00:00.000Z",
  "estimatedHours": 6.5,
  "completedHours": 2.0,
  "urgency": 9,
  "impact": 8,
  "userImportance": 7,
  "riskLevel": "high",
  "riskScore": 720,
  "subtasks": [
    { "id": "sub_1", "title": "Setup login routing logic", "completed": true },
    { "id": "sub_2", "title": "Configure credential input controls", "completed": false }
  ],
  "rescuePlan": {
    "today": ["08:00 - 10:00 Setup login routing logic", "13:00 - 15:00 Setup input controls"],
    "tomorrow": ["09:00 - 11:00 Final validations and launch check"],
    "dayAfter": [],
    "explanation": "Schedule compressed. Suspended gym habit today to open up 2 hours of focus time."
  }
}
```

#### 3. `habits` (Collection)
Repeating routines that reinforce streak scoring and contribute to user health calculations.
```json
{
  "_id": "habit_7482",
  "userId": "vM81mO9Xm8Ush2ks092Ksiw",
  "name": "Code Review Standup",
  "frequency": "daily",
  "streak": 5,
  "lastCompleted": "2026-06-28T09:00:00.000Z"
}
```

---

## 💻 8. Frontend Modules

The frontend is built using **React 19** and styled using **Tailwind CSS**.

### Main Modules:
1.  **App Core Container (`src/App.tsx`)**:
    *   Acts as the parent router, loading navigation sidebars and swapping tabs based on state values.
    *   Listens for active user authentication sessions and mounts landing overlays if unauthenticated.
2.  **Dashboard Module (`src/components/Dashboard.tsx`)**:
    *   Drives bento grid animations, countdown displays, and renders the Productivity Gauge dial.
3.  **Task & Syllabus Planner (`src/components/Tasks.tsx` & `src/components/DiagramPlanner.tsx`)**:
    *   Hosts task creation interfaces, subtask checklists, and drag-and-drop syllabus capturing.
4.  **AI Voice Engine (`src/components/VoiceAssistant.tsx`)**:
    *   Coordinates microphone click feeds, text parsing, and web-speech synthesis playback parameters.
5.  **Workspace Hub (`src/components/Workspace.tsx` & `src/components/RealtimeCall.tsx`)**:
    *   Manages the virtual group experience, compiling standups, hosting chats, and driving the smart workload balancer.

---

## 🔌 9. Backend Modules (Express API Route Specs)

The Express backend handles AI computations, structured JSON cleanups, and secure database sync validation.

```
                                EXPRESS ROUTE DISPATCHER
                                
            [Client REST Request] ────► [JSON Limit Check (10mb)]
                                                  │
                                                  ▼
                                      [Route Segment Handler]
                                                  │
                      ┌───────────────────────────┼───────────────────────────┐
                      ▼                           ▼                           ▼
            [/api/gemini/capture]       [/api/gemini/rescue]        [/api/gemini/coach]
                      │                           │                           │
                      ▼                           ▼                           ▼
            [Fetch Gemini SDK]          [Fetch Gemini SDK]          [Fetch Gemini SDK]
                      │                           │                           │
                      ▼                           ▼                           ▼
            [Clean Markdown JSON]       [Clean Markdown JSON]       [Clean Markdown JSON]
                      │                           │                           │
                      ▼                           ▼                           ▼
            [Database Sync Hook]        [Database Sync Hook]        [Database Sync Hook]
                      │                           │                           │
                      ▼                           ▼                           ▼
            [JSON Output Response]      [JSON Output Response]      [JSON Output Response]
```

### Backend File Structure:
*   `server.ts`: Initial entry file hosting route setups, port bindings, and Vite development server middlewares.
*   `server/mongodb.ts`: Connects to MongoDB Atlas cluster node and serializes data synced from the frontend.
*   `src/db/helpers.ts`: Maps and formats incoming data payloads to PostgreSQL tables.

---

## 🌐 10. Real-Time Features

The application incorporates complex simulated real-time elements, establishing high-fidelity mock environments that simulate standard production integrations:

1.  **Workspace Real-Time Chat Simulation**:
    *   Maintains a simulated channel populated with diverse developer profiles.
    *   As the user types, standard delay timers trigger, showing "typing..." states.
    *   The simulated teammates generate highly relevant responses matching active tasks on the Kanban board.
2.  **WebRTC Video & Screen Share Simulation**:
    *   Simulates the WebRTC media pipeline. Clicking "Start Video" mounts local cameras (managed safely in the frame).
    *   Generates canvas-based rendering screens mimicking shared slides, complete with audio volume bars.

---

## 🧠 11. AI Features & Models Utilized

The AI core operates exclusively on **Google Gemini 2.5 Flash** due to its class-leading multimodal reasoning, fast output speed, and exceptional structured instruction performance.

```
                                GEMINI AI INSTRUCTION FLOW
                                
     [User Raw Data / Screenshot] ──► [System Instruction Override]
                                                 │
                                                 ▼
                                     [Structured API Request]
                                                 │
                                                 ▼
                                       [Google Gemini 2.5]
                                                 │
                                                 ▼
                                    [C-Block Code Clean-Up]
                                                 │
                      ┌──────────────────────────┴──────────────────────────┐
                      ▼                                                     ▼
            { Parse JSON Payload }                              { Speak Vocal Synthesis }
                      │                                                     │
                      ▼                                                     ▼
         [Update Database / UI View]                              [Animate Voice Wave]
```

### Primary AI System Instructions:
*   **JSON Enforcement**: Instructs Gemini to return strict C-style JSON data structures without conversational headers. This prevents runtime parser exceptions.
*   **Cognitive Coaching Persona**: Guides vocal outputs to maintain a focused, encouraging, professional, and slightly structured tone suitable for a high-performance workspace.

---

## 🤝 12. Collaboration Features

Team success relies on robust coordination tools. The collaboration workspace includes three primary elements:

1.  **Smart Team Balancer**:
    *   Iterates across active project members.
    *   Calculates their total workload percentages.
    *   If a developer exceeds the **80% Hazard Threshold**, the system triggers a redistribution routine. It automatically reassigns non-started tickets to developers possessing compatible skills and whose workload is under **40%**.
2.  **Meeting Notes Summarizer**:
    *   Processes messy meeting transcripts (e.g., raw text files).
    *   Converts descriptions of features and assigned duties into structured task tickets.
3.  **Standup Report Generator**:
    *   Aggregates developer log arrays, structuring them into clean Scrum Standup panels.

---

## 📐 13. UI/UX Screens (Interactive Mockups & Layouts)

---

### Wireframe 13.1: The Landing & Authentication Page

```
+-------------------------------------------------------------------------+
| [⚡] Success Scheduler                                   [ Try Demo Mode ]|
+-------------------------------------------------------------------------+
|                                                                         |
|                STRIKE BACK AGAINST THE CLOCK                             |
|         The proactive, AI-driven accountability scheduler               |
|                                                                         |
|            +--------------------------------------------+               |
|            |           [ Enter Account Form ]           |               |
|            |                                            |               |
|            |  Email Address: [ your@domain.com ]        |               |
|            |  Password:      [ ****** ]                 |               |
|            |                                            |               |
|            |  [ SIGN IN ]       - OR -   [ SIGN UP ]    |               |
|            |                                            |               |
|            |        [ G | Sign In with Google ]         |               |
|            +--------------------------------------------+               |
|                                                                         |
|  © 2026 Success Scheduler. Built with Google Gemini 2.5.               |
+-------------------------------------------------------------------------+
```

---

### Wireframe 13.2: The Core Bento Dashboard Screen

```
+-------------------------------------------------------------------------+
| [⚡ SUCCESS SCHEDULER] | [Dashboard] [Tasks] [AI Coach] [Team Workspace] |
+-------------------------------------------------------------------------+
| [🔥 PROGRESS]           | [🎯 MY HABITS]          | [🚨 DEADLINE METRICS] |
| Score: 84%              | [X] Standup (Streak 5)  | Task: Setup Backend   |
| Streak: 12 Days         | [ ] Code Review         | Due: 4 Hours!         |
|                         | [X] Push to Dev         | Status: [CRITICAL]    |
|                         |                         |                       |
|   +-----------------+   |                         |  +-----------------+  |
|   |   Hazard Dial   |   |                         |  |  RESCUE MACHINE |  |
|   |     [ 84% ]     |   |                         |  | [GENERATE PLAN] |  |
|   +-----------------+   |                         |  +-----------------+  |
+-------------------------+-------------------------+-----------------------+
| [📊 ANALYTICS]                                                           |
| Mon [███] Tue [████] Wed [██] Thu [█████] Fri [███] Sat [ ] Sun [ ]     |
+-------------------------------------------------------------------------+
```

---

### Wireframe 13.3: Task Capture & Multimodal Syllabus Reader

```
+-------------------------------------------------------------------------+
| [✏️ NEW TASK / SYLLABUS CAPTURE]                                         |
+-------------------------------------------------------------------------+
|  Task Title: [ Integrate Stripe API ]                                   |
|  Category:   [ Career     ]   Priority: [ Critical ]   Effort: [ 6.5h ] |
|                                                                         |
|  [📂 UPLOAD MULTIMODAL DOCUMENT (SYLLABUS / SCREENSHOT)]                |
|  +-------------------------------------------------------------------+  |
|  | Drag & Drop Syllabus PDF, Invoice, or screenshot here.             |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  Prompt: [ Parse this syllabus and build structured task lists ]        |
|                                                                         |
|  [⚡ AUTO-CAPTURE VIA GEMINI ]                                          |
+-------------------------------------------------------------------------+
```

---

### Wireframe 13.4: Collaborative Team Workspace & Scrum Board

```
+-------------------------------------------------------------------------+
| [👥 AI TEAM SPRINT INTERFACE]                         [ Smart Balancer ]|
+-------------------------------------------------------------------------+
|                                                                         |
|  BACKLOG           TODO            IN PROGRESS        COMPLETED         |
|  +-------------+   +-------------+ +-------------+    +-------------+   |
|  | Setup DB    |   | Layout UI   | | Build API   |    | Landing CSS |   |
|  | Owner: Alex |   | Owner: Lisa | | Owner: AI   |    | Owner: Sam  |   |
|  | Risk: Safe  |   | Risk: Mod   | | Risk: CRIT  |    | Risk: Safe  |   |
|  +-------------+   +-------------+ +-------------+    +-------------+   |
|                                                                         |
|  +---------------------------------------+ +-------------------------+  |
|  | [💬 SPRINT GROUP REAL-TIME CHAT]      | | [📹 SPRINT TEAM STREAM] |  |
|  | Dev-AI: "I finished the API draft!"   | | +---------------------+ |  |
|  | Human:  "Awesome! Let's deploy."      | | |   WebRTC Stream     | |  |
|  | Input:  [ Type @AI for help... ]      | | +---------------------+ |  |
|  +---------------------------------------+ +-------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 🔌 14. REST API Documentation (Endpoints & Payloads)

| Endpoint | Method | Input Payload | Output Structure | Usage |
|---|---|---|---|---|
| `/api/gemini/capture` | `POST` | `{ "text": string, "imageBase64"?: string }` | `{ "title": string, "description": string, "deadline": ISOString, "estimatedHours": number, "subtasks": string[] }` | Extracts structured schedules from unstructured syllabus data or receipts. |
| `/api/gemini/prioritize` | `POST` | `{ "task": TaskObject }` | `{ "priorityLevel": string, "priorityScore": number, "suggestedImmediateAction": string }` | Analyzes task hazards based on urgencies, deadlines, and current times. |
| `/api/gemini/plan` | `POST` | `{ "tasks": Task[], "habits": Habit[] }` | `{ "todayPlan": string[], "tomorrowPlan": string[] }` | Generates a balanced day plan. |
| `/api/gemini/rescue` | `POST` | `{ "task": TaskObject }` | `{ "rescueTimeline": string[], "explanation": string }` | Compresses timelines to salvage high-risk milestones. |
| `/api/gemini/procrastinate` | `POST` | `{ "task": Task, "reason": string }` | `{ "coachingAdvice": string, "procrastinationScore": number }` | Probes procrastination and offers behavioral solutions. |

---

## 🔒 15. Security Specification

### 1. In-Transit Encryption
*   All communication between the client web browser and the Cloud Run backend server is encrypted using **HTTPS / TLS 1.3**.

### 2. Zero Secret Exposure
*   **No client-side keys**: The system never stores or exposes API keys or Mongo connection strings in the client bundle. All credentials (e.g., `GEMINI_API_KEY`, `MONGODB_URI`) are maintained in secure environment variables on the Cloud Run container server-side.

### 3. Firestore Document Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /habits/{habitId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🚀 16. Deployment & Environment Setup

### Production Build Script Sequence:
The system builds a self-contained production container via the following npm scripts:
1.  **Vite Build**: Compiles all client-side React code and assets into highly compressed, static files placed in `/dist`.
2.  **Server Compilation**: Bundles the backend `server.ts` file using `esbuild` into a standalone CommonJS binary at `dist/server.cjs`.
3.  **Standalone Execution**: Starts the production node server by executing `node dist/server.cjs`, exposing standard traffic on **Port 3000**.

---

## 🔮 17. Future Enhancements

```
                              FUTURE SCALABILITY TIMELINE
                              
       Phase 1 (Q3 2026)             Phase 2 (Q4 2026)             Phase 3 (Q1 2027)
  +─────────────────────────+   +─────────────────────────+   +─────────────────────────+
  |  - External Calendars   |   |  - Native iOS/Android   |   |  - Multi-Project Teams  |
  |  - Canvas/LMS Sync      |   |  - Local LLM Fallback   |   |  - Advanced Analytics   |
  +─────────────────────────+   +─────────────────────────+   +─────────────────────────+
```

1.  **Dynamic Calendar Integration**: Direct two-way synchronization with Google Calendar, Microsoft Outlook, and Apple iCloud Calendars to auto-block focus hours.
2.  **Academic Integration (LMS Sync)**: Integrate with Canvas API, Blackboard, and Google Classroom to pull assignments, tests, and homework sheets directly.
3.  **Local Offline-First LLM Execution**: Incorporate small local language models (e.g., Gemini Nano) directly into the browser to process light tasks without requiring server network calls.
4.  **Native Mobile Applications**: Port the visual bento experience to iOS and Android devices using React Native, utilizing physical device vocal engines.
