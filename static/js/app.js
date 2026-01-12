// ============================================================================
// NEXUS AI - Frontend JavaScript
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
    
    // Load user stats
    loadUserStats();
    
    // Setup navigation
    setupNavigation();
    
    // Setup voice recognition if available
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

// Add CSS animation for particles
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
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(`${view}View`);
    if (viewElement) {
        viewElement.classList.add('active');
    }
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'tasks': 'Tasks',
        'calendar': 'Calendar',
        'pomodoro': 'Pomodoro Timer',
        'notes': 'Second Brain',
        'analytics': 'Analytics'
    };
    document.getElementById('viewTitle').textContent = titles[view];
    
    // Load view-specific data
    currentView = view;
    loadViewData(view);
}

function loadViewData(view) {
    switch(view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'pomodoro':
            loadPomodoro();
            break;
        case 'notes':
            loadNotes();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ============================================================================
// Dashboard
// ============================================================================

async function loadDashboard() {
    try {
        // Load AI suggestion
        const suggestionResponse = await fetch('/api/ai/suggest-task');
        const suggestion = await suggestionResponse.json();
        
        if (suggestion && suggestion.task) {
            document.getElementById('aiSuggestionText').textContent = suggestion.message;
            document.getElementById('acceptSuggestionBtn').onclick = () => {
                switchView('tasks');
                // Optionally highlight the suggested task
            };
        } else {
            document.getElementById('aiSuggestionText').textContent = 
                '✨ All caught up! No urgent tasks at the moment.';
            document.getElementById('acceptSuggestionBtn').style.display = 'none';
        }
        
        // Load stats
        await loadUserStats();
        
        // Update dashboard stats
        const tasksResponse = await fetch('/api/tasks');
        tasks = await tasksResponse.json();
        
        const notesResponse = await fetch('/api/notes');
        notes = await notesResponse.json();
        
        document.getElementById('totalTasks').textContent = tasks.length;
        document.getElementById('completedTasks').textContent = 
            tasks.filter(t => t.status === 'completed').length;
        document.getElementById('totalPomodoros').textContent = userStats.pomodoros_completed || 0;
        document.getElementById('totalNotes').textContent = notes.length;
        
        // Load badges
        loadBadges();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadUserStats() {
    try {
        const response = await fetch('/api/stats');
        userStats = await response.json();
        
        // Update sidebar stats
        document.getElementById('userLevel').textContent = userStats.level || 1;
        document.getElementById('userPoints').textContent = userStats.total_points || 0;
        document.getElementById('userStreak').textContent = userStats.current_streak || 0;
        
        // Update motivational message
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
            badgeElement.innerHTML = `
                <i>${badge.icon}</i>
                <p>${badge.name}</p>
            `;
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
        
        // Update pomodoro task select
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
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    const priorityClass = `priority-${task.priority}`;
    const statusIcon = task.status === 'completed' ? 'fa-check-circle' : 
                      task.status === 'in_progress' ? 'fa-spinner' : 'fa-circle';
    
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
            ${task.pomodoros_completed ? `<span><i class="fas fa-tomato"></i> ${task.pomodoros_completed}</span>` : ''}
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
        
        // Show celebration animation
        showNotification('🎉 Task completed! +10 points', 'success');
        
        // Reload tasks and stats
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
        showNotification('Error deleting task', 'error');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Populate form
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskEstimatedTime').value = task.estimated_time || '';
    
    if (task.deadline) {
        const deadline = new Date(task.deadline);
        document.getElementById('taskDeadline').value = 
            deadline.toISOString().slice(0, 16);
    }
    
    if (task.tags && task.tags.length > 0) {
        document.getElementById('taskTags').value = task.tags.join(', ');
    }
    
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    openModal('taskModal');
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
                console.error('Error loading events:', error);
                failureCallback(error);
            }
        },
        eventClick: function(info) {
            // Handle event click
            console.log('Event clicked:', info.event);
        },
        dateClick: function(info) {
            // Open add event modal with selected date
            document.getElementById('eventStart').value = info.dateStr + 'T09:00';
            document.getElementById('eventEnd').value = info.dateStr + 'T10:00';
            openModal('eventModal');
        }
    });
    
    calendar.render();
}

// ============================================================================
// Pomodoro Timer
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
    
    // Update progress circle
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
    
    // Play completion sound (if available)
    playNotificationSound();
    
    // Show notification
    showNotification('🎉 Pomodoro completed! Great work!', 'success');
    
    // Add session dot
    pomodoroSessionsToday++;
    addSessionDot();
    
    // Save to backend
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
    
    // Start break
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
// Notes (Second Brain)
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

// Continued in next part...
