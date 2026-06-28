import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  FileSpreadsheet, 
  StickyNote, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Pin, 
  Palette, 
  Check, 
  AlertTriangle, 
  CloudLightning,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string; // 'yellow' | 'green' | 'blue' | 'red' | 'slate'
  pinned: boolean;
  tags: string[];
  createdAt: string;
}

const COLOR_MAP: Record<string, string> = {
  yellow: 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/15',
  green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/15',
  blue: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/15',
  red: 'bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/15',
  slate: 'bg-slate-500/10 border-slate-500/30 text-slate-200 hover:bg-slate-500/15'
};

const COLOR_DOTS: Record<string, string> = {
  yellow: 'bg-amber-400',
  green: 'bg-emerald-400',
  blue: 'bg-cyan-400',
  red: 'bg-red-400',
  slate: 'bg-slate-400'
};

export const GoogleSyncHub: React.FC = () => {
  const { 
    user, 
    googleAccessToken, 
    loginWithGoogle, 
    tasks: appTasks, 
    goals: appGoals, 
    habits: appHabits,
    showToast,
    addTask: addAppTask
  } = useApp();

  // Authentication State
  const isAuthenticated = !!googleAccessToken;

  // Google Tasks States
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [googleTasks, setGoogleTasks] = useState<any[]>([]);
  const [loadingTasksLists, setLoadingTasksLists] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [exportingTasks, setExportingTasks] = useState(false);
  const [importingTasks, setImportingTasks] = useState(false);

  // Google Sheets States
  const [exportingSheets, setExportingSheets] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  // Keep Notes States (stored in LocalStorage & syncable to Google Drive)
  const [notes, setNotes] = useState<KeepNote[]>(() => {
    const saved = localStorage.getItem('lifesaver_ai_keep_notes');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'n1',
        title: 'Project Kickoff Notes',
        content: 'Establish secure connection protocols to our Cloud SQL development databases and map user profiles schemas in drizzle config.',
        color: 'yellow',
        pinned: true,
        tags: ['academic', 'career'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'n2',
        title: 'Daily Micro-Habit Checklist',
        content: 'Aim to review code lints twice daily, complete at least 3 critical priority sprints before UTC noon, and do a quick burnout check-in.',
        color: 'green',
        pinned: false,
        tags: ['personal'],
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('yellow');
  const [notePinned, setNotePinned] = useState(false);
  const [noteTag, setNoteTag] = useState('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [savingNote, setSavingNote] = useState(false);
  const [backingUpNotes, setBackingUpNotes] = useState(false);

  // Save Keep Notes to localStorage
  useEffect(() => {
    localStorage.setItem('lifesaver_ai_keep_notes', JSON.stringify(notes));
  }, [notes]);

  // Fetch Google Task Lists
  const fetchTaskLists = async () => {
    if (!googleAccessToken) return;
    setLoadingTasksLists(true);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      if (!res.ok) throw new Error('Failed to retrieve Google Tasks lists');
      const data = await res.json();
      const lists = data.items || [];
      setTaskLists(lists);
      if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error loading Google Task Lists: ' + err.message, 'error');
    } finally {
      setLoadingTasksLists(false);
    }
  };

  // Fetch Tasks inside selected list
  const fetchTasksForSelectedList = async (listId: string) => {
    if (!googleAccessToken || !listId) return;
    setLoadingTasks(true);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks for list');
      const data = await res.json();
      setGoogleTasks(data.items || []);
    } catch (err: any) {
      console.error(err);
      showToast('Error loading Google Tasks: ' + err.message, 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTaskLists();
    }
  }, [googleAccessToken]);

  useEffect(() => {
    if (selectedListId) {
      fetchTasksForSelectedList(selectedListId);
    }
  }, [selectedListId]);

  // Sync: Push App Sprints to Google Tasks
  const exportAppTasksToGoogle = async () => {
    if (!googleAccessToken || !selectedListId) {
      showToast('Please authenticate and select a Task List first.', 'error');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to export ${appTasks.length} local Sprints into your Google Tasks list?`);
    if (!confirmed) return;

    setExportingTasks(true);
    try {
      let count = 0;
      for (const t of appTasks) {
        // Simple check to avoid exact double inserts by comparing titles
        const alreadyExists = googleTasks.some(gt => gt.title.toLowerCase() === t.title.toLowerCase());
        if (alreadyExists) continue;

        const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: t.title,
            notes: `${t.description || ''}\nPriority: ${t.priority.toUpperCase()}\nStatus: ${t.status}`,
            due: t.deadline ? new Date(t.deadline).toISOString() : undefined,
          }),
        });

        if (res.ok) count++;
      }
      showToast(`Export complete! Successfully pushed ${count} new Sprints to Google Tasks.`, 'success');
      fetchTasksForSelectedList(selectedListId);
    } catch (err: any) {
      console.error(err);
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setExportingTasks(false);
    }
  };

  // Sync: Pull Google Tasks to App Sprints
  const importGoogleTasksToApp = async () => {
    if (!googleAccessToken || googleTasks.length === 0) {
      showToast('No Google Tasks found to import.', 'error');
      return;
    }
    const confirmed = window.confirm(`Importing Sprints: This will add ${googleTasks.length} tasks from your Google Tasks list into your local life-saver sprints board. Proceed?`);
    if (!confirmed) return;

    setImportingTasks(true);
    try {
      let count = 0;
      for (const gt of googleTasks) {
        if (!gt.title) continue;
        const alreadyExists = appTasks.some(t => t.title.toLowerCase() === gt.title.toLowerCase());
        if (alreadyExists) continue;

        // Add to our App tasks
        await addAppTask(gt.title);
        count++;
      }
      showToast(`Import complete! Loaded ${count} new tasks into your AI Sprints board.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Import failed: ' + err.message, 'error');
    } finally {
      setImportingTasks(false);
    }
  };

  // Export Productivity Stats to Google Sheets
  const exportToGoogleSheets = async () => {
    if (!googleAccessToken) {
      showToast('Please authenticate with Google first.', 'error');
      return;
    }

    setExportingSheets(true);
    try {
      // 1. Create a brand new Google Sheet
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `LifeSaver AI Productivity Dashboard (${new Date().toLocaleDateString()})`,
          },
        }),
      });

      if (!res.ok) throw new Error('Could not create spreadsheet');
      const spreadsheet = await res.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      // Prepare Rows
      const rows = [
        ['LIFE-SAVER PRODUCTIVITY DASHBOARD EXPORT'],
        ['Generated At', new Date().toLocaleString()],
        ['User Email', user?.email || 'N/A'],
        [],
        ['SUMMARY STATISTICS'],
        ['Total Sprints/Tasks', appTasks.length],
        ['Completed Sprints', appTasks.filter(t => t.status === 'completed').length],
        ['Pending Sprints', appTasks.filter(t => t.status === 'pending').length],
        ['Active Goals', appGoals.length],
        ['Habit Streaks Tracking', appHabits.length],
        [],
        ['SPRINTS LISTING'],
        ['ID', 'Title', 'Priority', 'Status', 'Deadline', 'Estimated Hours', 'Completed Hours', 'Risk Level'],
        ...appTasks.map(t => [
          t.id, 
          t.title, 
          t.priority.toUpperCase(), 
          t.status.toUpperCase(), 
          t.deadline || 'N/A', 
          t.estimatedHours, 
          t.completedHours, 
          t.riskLevel ? t.riskLevel.toUpperCase() : 'SAFE'
        ]),
        [],
        ['GOALS LISTING'],
        ['ID', 'Title', 'Type', 'Target Date', 'Progress %'],
        ...appGoals.map(g => [
          g.id,
          g.title,
          g.type.toUpperCase(),
          g.targetDate || 'N/A',
          `${g.progress}%`
        ]),
        [],
        ['HABITS LISTING'],
        ['ID', 'Title', 'Current Streak', 'Consistency Score %', 'Total Completions'],
        ...appHabits.map(h => [
          h.id,
          h.title,
          h.streak,
          `${h.consistencyScore}%`,
          h.completions?.length || 0
        ])
      ];

      // 2. Append rows to the spreadsheet
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: 'Sheet1!A1',
            majorDimension: 'ROWS',
            values: rows,
          }),
        }
      );

      if (!appendRes.ok) throw new Error('Could not write rows to sheet');

      setSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      showToast('Productivity logs written to Google Sheets successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Sheets synchronization failed: ' + err.message, 'error');
    } finally {
      setExportingSheets(false);
    }
  };

  // Google Keep-like Notes Actions
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) {
      showToast('Please fill in a note title or content.', 'error');
      return;
    }

    const newNote: KeepNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      color: noteColor,
      pinned: notePinned,
      tags: [noteTag],
      createdAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setNoteTitle('');
    setNoteContent('');
    setNotePinned(false);
    showToast('New keep note captured locally!', 'success');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    showToast('Note discarded.', 'info');
  };

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  // Backup Notes to Google Drive as Markdown Document
  const backupNotesToGoogleDrive = async () => {
    if (!googleAccessToken) {
      showToast('Please connect your Google Account first.', 'error');
      return;
    }
    if (notes.length === 0) {
      showToast('No notes to back up.', 'error');
      return;
    }

    setBackingUpNotes(true);
    try {
      // 1. Build beautiful Markdown Content
      let markdown = `# LifeSaver AI - Keep Notes Backup\n`;
      markdown += `Generated on: ${new Date().toLocaleString()}\n`;
      markdown += `Total Notes: ${notes.length}\n\n`;
      markdown += `==============================================\n\n`;

      notes.forEach((n, idx) => {
        markdown += `## [${n.pinned ? '📌 ' : ''}${n.title}]\n`;
        markdown += `*Category Tag: ${n.tags.join(', ')}*\n`;
        markdown += `*Color Theme: ${n.color.toUpperCase()}*\n`;
        markdown += `*Created At: ${new Date(n.createdAt).toLocaleString()}*\n\n`;
        markdown += `${n.content}\n\n`;
        markdown += `----------------------------------------------\n\n`;
      });

      // 2. Upload text content to Google Drive
      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'text/plain'
        },
        body: markdown
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const file = await uploadRes.json();

      // 3. Rename file to a meaningful title
      const renameRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `LifeSaver_Notes_Backup_${new Date().toISOString().split('T')[0]}.md`
        })
      });

      if (!renameRes.ok) throw new Error('Renaming backup failed');

      showToast('Google Keep notes successfully backed up to your Google Drive!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Drive backup failed: ' + err.message, 'error');
    } finally {
      setBackingUpNotes(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = colorFilter === 'all' || n.color === colorFilter;
    return matchesSearch && matchesColor;
  });

  // Split into pinned and unpinned
  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-[#0b0c10] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider">
              Google Workspace Sync Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly bridge your offline Sprints, stats, and notes into Google Tasks, Sheets, and Drive.
          </p>
        </div>

        {/* Auth Button */}
        {!isAuthenticated ? (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-slate-100 transition text-xs shadow-lg"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            Connect Google Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                <Check className="w-3 h-3" /> SESSION ACTIVE
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{user?.email || 'Connected'}</span>
            </div>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="p-8 rounded-2xl bg-[#0d0d12] border border-dashed border-white/10 text-center space-y-4">
          <CloudLightning className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-white">Unlock Google Workspace Automation</h3>
            <p className="text-xs text-slate-400">
              Link your developer profile to pull & push real Google Tasks list items, export beautiful visual logs directly to Google Sheets, and back up Keep-styled notes files to Google Drive.
            </p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="px-5 py-2.5 bg-red-500 text-black font-semibold text-xs rounded-xl hover:bg-red-400 transition"
          >
            Connect My Workspace Now
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: GOOGLE TASKS SYNC */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Google Tasks Bridge</h3>
              </div>
              <button 
                onClick={fetchTaskLists}
                className="text-[10px] text-red-400 hover:underline font-mono"
                disabled={loadingTasksLists}
              >
                {loadingTasksLists ? 'Syncing...' : '🔄 Reload Lists'}
              </button>
            </div>

            {/* List Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Target Task List</label>
              <div className="relative">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full bg-[#121318] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                >
                  {taskLists.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                  {taskLists.length === 0 && (
                    <option value="">No lists found</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Tasks Counters */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-center">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Local Sprints</span>
                <span className="text-lg font-bold text-white">{appTasks.length}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Google Tasks</span>
                <span className="text-lg font-bold text-emerald-400">
                  {loadingTasks ? '...' : googleTasks.length}
                </span>
              </div>
            </div>

            {/* Synchronization Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={exportAppTasksToGoogle}
                disabled={exportingTasks || appTasks.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs rounded-xl transition"
              >
                {exportingTasks ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                Push Sprints to Google
              </button>

              <button
                onClick={importGoogleTasksToApp}
                disabled={importingTasks || googleTasks.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#121318] hover:bg-white/5 border border-white/10 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition"
              >
                {importingTasks ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                Pull Tasks to Board
              </button>
            </div>

            {/* List preview of Google Tasks */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Google Tasks Preview</span>
              <div className="h-40 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar text-xs">
                {googleTasks.map(gt => (
                  <div key={gt.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <div className="truncate">
                      <span className="font-semibold text-slate-200 block truncate">{gt.title}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{gt.notes || 'No description'}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      gt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {gt.status || 'needsAction'}
                    </span>
                  </div>
                ))}
                {googleTasks.length === 0 && !loadingTasks && (
                  <p className="text-[11px] text-slate-500 text-center py-8">Select a list to view current Google Tasks.</p>
                )}
                {loadingTasks && (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
                    <span className="text-slate-400">Fetching Google tasks...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: GOOGLE SHEETS SYNC */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Google Sheets Exporter</h3>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export your active tasks, goal tracking stats, and habit metrics directly to Google Sheets. This creates an elegant structured log sheet updated with your AI-powered performance ratings.
                </p>

                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">What gets written:</span>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pl-3 list-disc">
                    <li>Dynamic task summary rows with AI Risk assessments</li>
                    <li>Goals status lists with progress percentage metrics</li>
                    <li>Daily habit streaks and consistency records</li>
                    <li>Unified time stamps and account markers</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={exportToGoogleSheets}
                disabled={exportingSheets}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl transition"
              >
                {exportingSheets ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                Create & Export Spreadsheet
              </button>

              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white rounded-xl transition text-center"
                >
                  Open Google Sheet <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOWER: GOOGLE KEEP NOTE ORGANIZER (Saves locally & cloud persistent + backup to drive) */}
      <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Keep Notes Board</h3>
              <p className="text-[10px] text-slate-500">Color-coded note taker synced locally and exportable to Google Drive as Markdown.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={backupNotesToGoogleDrive}
              disabled={!isAuthenticated || notes.length === 0 || backingUpNotes}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 text-[10px] font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {backingUpNotes ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <UploadCloud className="w-3 h-3" />
              )}
              Backup Board to Drive
            </button>
          </div>
        </div>

        {/* Note Creator Form */}
        <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-[#121318] border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Note Title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="bg-[#0b0c10] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white outline-none w-full placeholder:text-slate-500"
            />
            <div className="flex flex-wrap items-center gap-2 justify-between">
              {/* Color selection circles */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">Color:</span>
                <div className="flex gap-1.5">
                  {Object.keys(COLOR_DOTS).map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNoteColor(c)}
                      className={`w-5 h-5 rounded-full ${COLOR_DOTS[c]} transition relative ${
                        noteColor === c ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#121318]' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pin indicator toggler */}
              <button
                type="button"
                onClick={() => setNotePinned(!notePinned)}
                className={`p-1.5 rounded-lg border transition ${
                  notePinned ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/5 text-slate-500'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            placeholder="Write your keep thoughts here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full h-20 bg-[#0b0c10] border border-white/5 rounded-xl p-3 outline-none text-xs text-white resize-none placeholder:text-slate-500"
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">Tag:</span>
              <select
                value={noteTag}
                onChange={(e) => setNoteTag(e.target.value)}
                className="bg-[#0b0c10] border border-white/5 rounded-lg px-2 py-1 text-[10px] text-slate-300 outline-none"
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="career">Career</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-red-500 hover:bg-red-400 text-black font-semibold text-xs rounded-xl flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Pin to Board
            </button>
          </div>
        </form>

        {/* Notes Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search keep notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121318] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">Filter Color:</span>
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="bg-[#121318] border border-white/5 rounded-xl px-2.5 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="all">All Colors</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="slate">Slate</option>
            </select>
          </div>
        </div>

        {/* PINNED NOTES SECTION */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned Notes
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map(n => (
                <div key={n.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${COLOR_MAP[n.color] || COLOR_MAP.slate}`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                      <button onClick={() => handleTogglePin(n.id)} className="text-amber-400">
                        <Pin className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 uppercase">{n.tags[0]}</span>
                    <button onClick={() => handleDeleteNote(n.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL NOTES GRID */}
        <div className="space-y-3">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Notes Board</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map(n => (
              <div key={n.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${COLOR_MAP[n.color] || COLOR_MAP.slate}`}>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                    <button onClick={() => handleTogglePin(n.id)} className="text-slate-400 hover:text-white">
                      <Pin className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{n.content}</p>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 uppercase">{n.tags[0]}</span>
                  <button onClick={() => handleDeleteNote(n.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-xs text-slate-500">Your Keep Notes board is empty. Add a note to organize your thoughts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
