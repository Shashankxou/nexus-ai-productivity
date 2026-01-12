// ============================================================================
// NEXUS AI - Frontend JavaScript - Complete Version
// ============================================================================

// Global State
let currentView = 'dashboard';
let tasks = [];
let events = [];
let notes = [];
let userStats = {};
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroSessionsToday = 0;
let recognition = null;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createParticles();
    setupEventListeners();
    loadDashboard();
});

function initializeApp() {
    console.log('🚀 NEXUS AI - Initializing...');
    loadUserStats();
    setupNavigation();
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setupVoiceRecognition();
    }
}

// ============================================================================
// Particle Animation
// ============================================================================

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(0, 255, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
        particlesContainer.appendChild(particle);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(100px, -100px); }
        50% { transform: translate(-100px, 100px); }
        75% { transform: translate(100px, 100px); }
    }
`;
document.head.appendChild(style);

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    // Task filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            loadTasks(filter);
        });
    });
    
    // Add task button
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('taskModalTitle').textContent = 'Add Task';
        openModal('taskModal');
    });
    
    // Add event button
    document.getElementById('addEventBtn').addEventListener('click', () => {
        document.getElementById('eventForm').reset();
        openModal('eventModal');
    });
    
    // Add note button
    document.getElementById('addNoteBtn').addEventListener('click', () => {
        document.getElementById('noteForm').reset();
        document.getElementById('noteId').value = '';
        document.getElementById('noteModalTitle').textContent = 'New Note';
        openModal('noteModal');
    });
    
    // Pomodoro controls
    document.getElementById('startPomodoroBtn').addEventListener('click', startPomodoro);
    document.getElementById('pausePomodoroBtn').addEventListener('click', pausePomodoro);
    document.getElementById('resetPomodoroBtn').addEventListener('click', resetPomodoro);
    
    // Notes search
    document.getElementById('notesSearch').addEventListener('input', (e) => {
        loadNotes(e.target.value);
    });
    
    // Forms
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    document.getElementById('noteForm').addEventListener('submit', handleNoteSubmit);
}

// ============================================================================
// Navigation
// ============================================================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
}

function switchView(view) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    
    const viewElement = document.getElementById(`${view}View`);
    if (viewElement) {
        viewElement.classList.add('active');
    }
    
    const titles = {
        'dashboard': 'Dashboard',
        'tasks': 'Tasks',
        'calendar': 'Calendar',
        'pomodoro': 'Pomodoro Timer',
        'notes': 'Second Brain',
        'analytics': 'Analytics'
    };
    document.getElementById('viewTitle').textContent = titles[view];
    
    currentView = view;
    loadViewData(view);
}

function loadViewData(view) {
    switch(view) {
        case 'dashboard': loadDashboard(); break;
        case 'tasks': loadTasks(); break;
        case 'calendar': loadCalendar(); break;
        case 'pomodoro': loadPomodoro(); break;
        case 'notes': loadNotes(); break;
        case 'analytics': loadAnalytics(); break;
    }
}

// ============================================================================
// Dashboard
// ============================================================================

async function loadDashboard() {
    try {
        const suggestionResponse = await fetch('/api/ai/suggest-task');
        const suggestion = await suggestionResponse.json();
        
        if (suggestion && suggestion.task) {
            document.getElementById('aiSuggestionText').textContent = suggestion.message;
            document.getElementById('acceptSuggestionBtn').onclick = () => switchView('tasks');
        } else {
            document.getElementById('aiSuggestionText').textContent = 
                '✨ All caught up! No urgent tasks at the moment.';
            document.getElementById('acceptSuggestionBtn').style.display = 'none';
        }
        
        await loadUserStats();
        
        const tasksResponse = await fetch('/api/tasks');
        tasks = await tasksResponse.json();
        
        const notesResponse = await fetch('/api/notes');
        notes = await notesResponse.json();
        
        document.getElementById('totalTasks').textContent = tasks.length;
        document.getElementById('completedTasks').textContent = 
            tasks.filter(t => t.status === 'completed').length;
        document.getElementById('totalPomodoros').textContent = userStats.pomodoros_completed || 0;
        document.getElementById('totalNotes').textContent = notes.length;
        
        loadBadges();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadUserStats() {
    try {
        const response = await fetch('/api/stats');
        userStats = await response.json();
        
        document.getElementById('userLevel').textContent = userStats.level || 1;
        document.getElementById('userPoints').textContent = userStats.total_points || 0;
        document.getElementById('userStreak').textContent = userStats.current_streak || 0;
        
        if (userStats.motivational_message) {
            document.getElementById('motivationalMessage').textContent = 
                userStats.motivational_message;
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function loadBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    if (userStats.available_badges && userStats.available_badges.length > 0) {
        userStats.available_badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge-item';
            badgeElement.innerHTML = `<i>${badge.icon}</i><p>${badge.name}</p>`;
            badgesGrid.appendChild(badgeElement);
        });
    } else {
        badgesGrid.innerHTML = '<p style="color: var(--text-secondary);">Complete tasks to earn badges!</p>';
    }
}

// ============================================================================
// Tasks
// ============================================================================

async function loadTasks(filter = 'all') {
    try {
        const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;
        const response = await fetch(url);
        tasks = await response.json();
        
        renderTasks(tasks);
        updatePomodoroTaskSelect();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function renderTasks(tasksToRender) {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    if (tasksToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-tasks" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No tasks yet. Create your first task!</p>
            </div>
        `;
        return;
    }
    
    tasksToRender.forEach(task => {
        const taskCard = createTaskCard(task);
        container.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    
    const priorityClass = `priority-${task.priority}`;
    const deadline = task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline';
    const tags = task.tags || [];
    
    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">${task.title}</div>
            <span class="task-priority ${priorityClass}">${task.priority}</span>
        </div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-meta">
            <span><i class="fas fa-clock"></i> ${deadline}</span>
            ${task.estimated_time ? `<span><i class="fas fa-hourglass"></i> ${task.estimated_time}min</span>` : ''}
            ${task.pomodoros_completed ? `<span><i class="fas fa-fire"></i> ${task.pomodoros_completed}</span>` : ''}
        </div>
        ${tags.length > 0 ? `
            <div class="task-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        <div class="task-actions">
            <button class="btn-sm btn-primary" onclick="editTask(${task.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            ${task.status !== 'completed' ? `
                <button class="btn-sm btn-secondary" onclick="completeTask(${task.id})">
                    <i class="fas fa-check"></i> Complete
                </button>
            ` : ''}
            <button class="btn-sm btn-danger" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

async function completeTask(taskId) {
    try {
        await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });
        
        showNotification('🎉 Task completed! +10 points', 'success');
        await loadTasks();
        await loadUserStats();
        
    } catch (error) {
        console.error('Error completing task:', error);
        showNotification('Error completing task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        showNotification('Task deleted', 'info');
        await loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskEstimatedTime').value = task.estimated_time || '';
    
    if (task.deadline) {
        const deadline = new Date(task.deadline);
        document.getElementById('taskDeadline').value = deadline.toISOString().slice(0, 16);
    }
    
    if (task.tags && task.tags.length > 0) {
        document.getElementById('taskTags').value = task.tags.join(', ');
    }
    
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    openModal('taskModal');
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        estimated_time: parseInt(document.getElementById('taskEstimatedTime').value) || null,
        deadline: document.getElementById('taskDeadline').value || null,
        tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    try {
        if (taskId) {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            showNotification('Task updated!', 'success');
        } else {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            showNotification('Task created!', 'success');
        }
        
        closeModal('taskModal');
        await loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Error saving task', 'error');
    }
}

// ============================================================================
// Calendar
// ============================================================================

let calendar = null;

function loadCalendar() {
    if (calendar) {
        calendar.refetchEvents();
        return;
    }
    
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: async function(info, successCallback, failureCallback) {
            try {
                const response = await fetch(`/api/events?start=${info.startStr}&end=${info.endStr}`);
                const events = await response.json();
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
        dateClick: function(info) {
            document.getElementById('eventStart').value = info.dateStr + 'T09:00';
            document.getElementById('eventEnd').value = info.dateStr + 'T10:00';
            openModal('eventModal');
        }
    });
    
    calendar.render();
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        start: document.getElementById('eventStart').value,
        end: document.getElementById('eventEnd').value,
        location: document.getElementById('eventLocation').value,
        color: document.getElementById('eventColor').value
    };
    
    try {
        await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        showNotification('Event created!', 'success');
        closeModal('eventModal');
        if (calendar) calendar.refetchEvents();
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Error saving event', 'error');
    }
}

// ============================================================================
// Pomodoro
// ============================================================================

function loadPomodoro() {
    updatePomodoroDisplay();
    updatePomodoroTaskSelect();
}

function updatePomodoroTaskSelect() {
    const select = document.getElementById('pomodoroTaskSelect');
    select.innerHTML = '<option value="">No task selected</option>';
    
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    pendingTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.title;
        select.appendChild(option);
    });
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroSeconds / 60);
    const seconds = pomodoroSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const workDuration = parseInt(document.getElementById('workDuration').value) * 60;
    const progress = 1 - (pomodoroSeconds / workDuration);
    const circumference = 2 * Math.PI * 90;
    const offset = circumference * progress;
    document.getElementById('timerProgress').style.strokeDashoffset = offset;
}

function startPomodoro() {
    if (pomodoroRunning) return;
    
    pomodoroRunning = true;
    document.getElementById('startPomodoroBtn').style.display = 'none';
    document.getElementById('pausePomodoroBtn').style.display = 'inline-flex';
    document.getElementById('timerStatus').textContent = '🎯 Focus time!';
    
    pomodoroTimer = setInterval(() => {
        pomodoroSeconds--;
        updatePomodoroDisplay();
        
        if (pomodoroSeconds <= 0) {
            completePomodoroSession();
        }
    }, 1000);
}

function pausePomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroTimer);
    document.getElementById('startPomodoroBtn').style.display = 'inline-flex';
    document.getElementById('pausePomodoroBtn').style.display = 'none';
    document.getElementById('timerStatus').textContent = 'Paused';
}

function resetPomodoro() {
    pausePomodoro();
    const workDuration = parseInt(document.getElementById('workDuration').value);
    pomodoroSeconds = workDuration * 60;
    updatePomodoroDisplay();
    document.getElementById('timerStatus').textContent = 'Ready to focus';
}

async function completePomodoroSession() {
    pausePomodoro();
    showNotification('🎉 Pomodoro completed! Great work!', 'success');
    
    pomodoroSessionsToday++;
    addSessionDot();
    
    const taskId = document.getElementById('pomodoroTaskSelect').value;
    const duration = parseInt(document.getElementById('workDuration').value);
    
    try {
        await fetch('/api/pomodoro/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: taskId || null, duration })
        });
        
        await loadUserStats();
    } catch (error) {
        console.error('Error saving pomodoro:', error);
    }
    
    const sessionsUntilLongBreak = 4;
    const isLongBreak = pomodoroSessionsToday % sessionsUntilLongBreak === 0;
    const breakDuration = isLongBreak ? 
        parseInt(document.getElementById('longBreak').value) :
        parseInt(document.getElementById('shortBreak').value);
    
    pomodoroSeconds = breakDuration * 60;
    document.getElementById('timerStatus').textContent = 
        isLongBreak ? '☕ Long break time!' : '☕ Short break time!';
    updatePomodoroDisplay();
}

function addSessionDot() {
    const dotsContainer = document.getElementById('sessionDots');
    const dot = document.createElement('div');
    dot.className = 'session-dot completed';
    dotsContainer.appendChild(dot);
}

// ============================================================================
// Notes
// ============================================================================

async function loadNotes(searchQuery = '') {
    try {
        const url = searchQuery ? `/api/notes?search=${encodeURIComponent(searchQuery)}` : '/api/notes';
        const response = await fetch(url);
        notes = await response.json();
        
        renderNotes(notes);
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

function renderNotes(notesToRender) {
    const grid = document.getElementById('notesGrid');
    grid.innerHTML = '';
    
    if (notesToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-brain" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No notes yet. Start building your second brain!</p>
            </div>
        `;
        return;
    }
    
    notesToRender.forEach(note => {
        const noteCard = createNoteCard(note);
        grid.appendChild(noteCard);
    });
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.onclick = () => editNote(note.id);
    
    const tags = note.tags || [];
    const preview = note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '');
    const updatedDate = new Date(note.updated_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="note-header">
            <div class="note-title">${note.title}</div>
            ${note.is_favorite ? '<i class="fas fa-star" style="color: var(--neon-cyan);"></i>' : ''}
        </div>
        <div class="note-content">${preview}</div>
        ${tags.length > 0 ? `
            <div class="task-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        <div class="note-meta">Updated: ${updatedDate}</div>
    `;
    
    return card;
}

function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    
    if (note.tags && note.tags.length > 0) {
        document.getElementById('noteTags').value = note.tags.join(', ');
    }
    
    document.getElementById('noteModalTitle').textContent = 'Edit Note';
    openModal('noteModal');
}

async function handleNoteSubmit(e) {
    e.preventDefault();
    
    const noteId = document.getElementById('noteId').value;
    const noteData = {
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value,
        tags: document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    try {
        if (noteId) {
            await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            showNotification('Note updated!', 'success');
        } else {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            showNotification('Note created! +3 points', 'success');
        }
        
        closeModal('noteModal');
        await loadNotes();
        await loadUserStats();
    } catch (error) {
        console.error('Error saving note:', error);
        showNotification('Error saving note', 'error');
    }
}

// ============================================================================
// Analytics
// ============================================================================

async function loadAnalytics() {
    try {
        const response = await fetch('/api/ai/productivity-analysis?days=7');
        const analysis = await response.json();
        
        const container = document.getElementById('analyticsContent');
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: var(--gradient-primary);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${analysis.total_tasks_completed}</h3>
                        <p>Tasks Completed</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: var(--gradient-secondary);">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${Math.round(analysis.total_time_spent / 60)}h</h3>
                        <p>Time Spent</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: var(--gradient-tertiary);">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${Math.round(analysis.task_completion_rate)}%</h3>
                        <p>Completion Rate</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: var(--gradient-success);">
                        <i class="fas fa-hourglass"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${Math.round(analysis.average_task_duration)}min</h3>
                        <p>Avg Task Duration</p>
                    </div>
                </div>
            </div>
            
            <div class="chart-card" style="margin-top: 2rem;">
                <h3><i class="fas fa-lightbulb"></i> AI Recommendations</h3>
                <ul style="list-style: none; padding: 0;">
                    ${analysis.recommendations.map(rec => `
                        <li style="padding: 1rem; background: rgba(0, 255, 255, 0.05); 
                                   border-left: 3px solid var(--neon-cyan); margin-bottom: 1rem; 
                                   border-radius: 0.5rem;">
                            ${rec}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            ${analysis.most_productive_hours.length > 0 ? `
                <div class="chart-card" style="margin-top: 2rem;">
                    <h3><i class="fas fa-clock"></i> Most Productive Hours</h3>
                    <p style="color: var(--text-secondary);">
                        You're most productive at: 
                        ${analysis.most_productive_hours.map(h => `${h}:00`).join(', ')}
                    </p>
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// ============================================================================
// Voice Recognition
// ============================================================================

function setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
    };
    
    document.getElementById('voiceBtn').addEventListener('click', () => {
        recognition.start();
        showNotification('🎤 Listening...', 'info');
    });
}

function handleVoiceCommand(command) {
    const lower = command.toLowerCase();
    
    if (lower.includes('create task') || lower.includes('add task')) {
        openModal('taskModal');
        showNotification('Opening task form', 'success');
    } else if (lower.includes('create note') || lower.includes('add note')) {
        openModal('noteModal');
        showNotification('Opening note form', 'success');
    } else if (lower.includes('start pomodoro')) {
        switchView('pomodoro');
        setTimeout(startPomodoro, 500);
        showNotification('Starting Pomodoro', 'success');
    } else {
        showNotification(`Command not recognized: "${command}"`, 'info');
    }
}

// ============================================================================
// Modals
// ============================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================================
// Notifications
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(0, 255, 128, 0.2)' : 
                     type === 'error' ? 'rgba(255, 0, 0, 0.2)' : 
                     'rgba(0, 255, 255, 0.2)'};
        border: 1px solid ${type === 'success' ? '#00ff80' : 
                           type === 'error' ? '#ff4444' : 
                           'var(--neon-cyan)'};
        border-radius: 0.5rem;
        color: white;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const notifStyle = document.createElement('style');
notifStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(notifStyle);

// ============================================================================
// Utility Functions
// ============================================================================

function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

console.log('✨ NEXUS AI - Ready to boost your productivity!');
