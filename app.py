from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt

from config import Config
from models import db, Task, Event, Note, TimeEntry, UserStats
from ai_engine import AIEngine

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize database
db.init_app(app)

# Initialize AI Engine
ai_engine = AIEngine(openai_api_key=app.config.get('OPENAI_API_KEY'))

# Create database tables
with app.app_context():
    db.create_all()
    # Create default user stats if not exists
    if not UserStats.query.first():
        stats = UserStats()
        db.session.add(stats)
        db.session.commit()

# ============================================================================
# ROUTES - Main Page
# ============================================================================

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

# ============================================================================
# API ROUTES - Tasks
# ============================================================================

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    status = request.args.get('status')
    priority = request.args.get('priority')
    
    query = Task.query
    
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    
    tasks = query.order_by(Task.order_index, Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.json
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
        tags=json.dumps(data.get('tags', [])),
        estimated_time=data.get('estimated_time')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    # Update fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'status' in data:
        old_status = task.status
        task.status = data['status']
        
        # If task completed, update stats
        if old_status != 'completed' and data['status'] == 'completed':
            task.completed_at = datetime.utcnow()
            update_user_stats('task_completed')
    
    if 'deadline' in data:
        task.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
    if 'tags' in data:
        task.tags = json.dumps(data['tags'])
    if 'estimated_time' in data:
        task.estimated_time = data['estimated_time']
    if 'order_index' in data:
        task.order_index = data['order_index']
    
    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

@app.route('/api/tasks/reorder', methods=['POST'])
def reorder_tasks():
    """Reorder tasks (for drag and drop)"""
    data = request.json
    task_orders = data.get('tasks', [])
    
    for item in task_orders:
        task = Task.query.get(item['id'])
        if task:
            task.order_index = item['order']
    
    db.session.commit()
    return jsonify({'success': True})

# ============================================================================
# API ROUTES - Events (Calendar)
# ============================================================================

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all events"""
    start = request.args.get('start')
    end = request.args.get('end')
    
    query = Event.query
    
    if start:
        query = query.filter(Event.start_time >= datetime.fromisoformat(start))
    if end:
        query = query.filter(Event.end_time <= datetime.fromisoformat(end))
    
    events = query.order_by(Event.start_time).all()
    return jsonify([event.to_dict() for event in events])

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event"""
    data = request.json
    
    event = Event(
        title=data['title'],
        description=data.get('description', ''),
        start_time=datetime.fromisoformat(data['start']),
        end_time=datetime.fromisoformat(data['end']),
        location=data.get('location', ''),
        color=data.get('color', '#00ffff'),
        is_recurring=data.get('is_recurring', False),
        recurrence_rule=data.get('recurrence_rule'),
        task_id=data.get('task_id')
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify(event.to_dict()), 201

@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    """Update an event"""
    event = Event.query.get_or_404(event_id)
    data = request.json
    
    if 'title' in data:
        event.title = data['title']
    if 'description' in data:
        event.description = data['description']
    if 'start' in data:
        event.start_time = datetime.fromisoformat(data['start'])
    if 'end' in data:
        event.end_time = datetime.fromisoformat(data['end'])
    if 'location' in data:
        event.location = data['location']
    if 'color' in data:
        event.color = data['color']
    
    db.session.commit()
    return jsonify(event.to_dict())

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event"""
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return '', 204

# ============================================================================
# API ROUTES - Notes (Second Brain)
# ============================================================================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    """Get all notes"""
    search = request.args.get('search', '')
    tag = request.args.get('tag')
    
    query = Note.query
    
    if search:
        query = query.filter(
            (Note.title.contains(search)) | (Note.content.contains(search))
        )
    
    if tag:
        query = query.filter(Note.tags.contains(tag))
    
    notes = query.order_by(Note.updated_at.desc()).all()
    return jsonify([note.to_dict() for note in notes])

@app.route('/api/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    data = request.json
    
    # Extract keywords for auto-tagging
    keywords = ai_engine.extract_keywords(data['content'])
    existing_tags = data.get('tags', [])
    all_tags = list(set(existing_tags + keywords[:3]))  # Merge and deduplicate
    
    note = Note(
        title=data['title'],
        content=data['content'],
        tags=json.dumps(all_tags),
        linked_notes=json.dumps(data.get('linked_notes', []))
    )
    
    db.session.add(note)
    db.session.commit()
    
    update_user_stats('note_created')
    
    return jsonify(note.to_dict()), 201

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Get a specific note"""
    note = Note.query.get_or_404(note_id)
    return jsonify(note.to_dict())

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Update a note"""
    note = Note.query.get_or_404(note_id)
    data = request.json
    
    if 'title' in data:
        note.title = data['title']
    if 'content' in data:
        note.content = data['content']
        # Re-extract keywords
        keywords = ai_engine.extract_keywords(data['content'])
        existing_tags = json.loads(note.tags) if note.tags else []
        all_tags = list(set(existing_tags + keywords[:3]))
        note.tags = json.dumps(all_tags)
    
    if 'tags' in data:
        note.tags = json.dumps(data['tags'])
    if 'linked_notes' in data:
        note.linked_notes = json.dumps(data['linked_notes'])
    if 'is_favorite' in data:
        note.is_favorite = data['is_favorite']
    
    note.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(note.to_dict())

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    return '', 204

@app.route('/api/notes/<int:note_id>/summary', methods=['GET'])
def get_note_summary(note_id):
    """Get AI-generated summary of a note"""
    note = Note.query.get_or_404(note_id)
    summary = ai_engine.summarize_note(note.content)
    return jsonify({'summary': summary})

# ============================================================================
# API ROUTES - Time Tracking
# ============================================================================

@app.route('/api/time-entries', methods=['GET'])
def get_time_entries():
    """Get time entries"""
    task_id = request.args.get('task_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = TimeEntry.query
    
    if task_id:
        query = query.filter_by(task_id=task_id)
    if start_date:
        query = query.filter(TimeEntry.start_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(TimeEntry.end_time <= datetime.fromisoformat(end_date))
    
    entries = query.order_by(TimeEntry.start_time.desc()).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/api/time-entries', methods=['POST'])
def create_time_entry():
    """Create a time entry"""
    data = request.json
    
    entry = TimeEntry(
        task_id=data.get('task_id'),
        start_time=datetime.fromisoformat(data['start_time']),
        end_time=datetime.fromisoformat(data['end_time']) if data.get('end_time') else None,
        duration=data.get('duration'),
        entry_type=data.get('entry_type', 'manual')
    )
    
    db.session.add(entry)
    
    # Update task actual time
    if entry.task_id and entry.duration:
        task = Task.query.get(entry.task_id)
        if task:
            task.actual_time = (task.actual_time or 0) + entry.duration
    
    db.session.commit()
    
    return jsonify(entry.to_dict()), 201

@app.route('/api/pomodoro/complete', methods=['POST'])
def complete_pomodoro():
    """Mark a pomodoro session as complete"""
    data = request.json
    task_id = data.get('task_id')
    duration = data.get('duration', 25)  # Default 25 minutes
    
    # Create time entry
    entry = TimeEntry(
        task_id=task_id,
        start_time=datetime.utcnow() - timedelta(minutes=duration),
        end_time=datetime.utcnow(),
        duration=duration,
        entry_type='pomodoro'
    )
    db.session.add(entry)
    
    # Update task
    if task_id:
        task = Task.query.get(task_id)
        if task:
            task.pomodoros_completed = (task.pomodoros_completed or 0) + 1
            task.actual_time = (task.actual_time or 0) + duration
    
    # Update user stats
    update_user_stats('pomodoro_completed')
    
    db.session.commit()
    
    return jsonify({'success': True, 'entry': entry.to_dict()})

# ============================================================================
# API ROUTES - AI Features
# ============================================================================

@app.route('/api/ai/suggest-task', methods=['GET'])
def suggest_task():
    """Get AI suggestion for next task"""
    tasks = Task.query.filter_by(status='pending').all()
    tasks_dict = [task.to_dict() for task in tasks]
    
    suggestion = ai_engine.suggest_next_task(tasks_dict)
    
    return jsonify(suggestion if suggestion else {'message': 'No tasks to suggest'})

@app.route('/api/ai/productivity-analysis', methods=['GET'])
def productivity_analysis():
    """Get productivity analysis"""
    days = int(request.args.get('days', 7))
    
    # Get data for analysis
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    tasks = Task.query.filter(Task.created_at >= cutoff_date).all()
    time_entries = TimeEntry.query.filter(TimeEntry.start_time >= cutoff_date).all()
    
    tasks_dict = [task.to_dict() for task in tasks]
    entries_dict = [entry.to_dict() for entry in time_entries]
    
    analysis = ai_engine.analyze_productivity(tasks_dict, entries_dict, days)
    
    return jsonify(analysis)

@app.route('/api/ai/suggest-time-blocks', methods=['GET'])
def suggest_time_blocks():
    """Get AI-suggested time blocks for tasks"""
    date_str = request.args.get('date', datetime.now().isoformat())
    date = datetime.fromisoformat(date_str)
    
    tasks = Task.query.filter_by(status='pending').all()
    events = Event.query.filter(
        Event.start_time >= date,
        Event.start_time < date + timedelta(days=1)
    ).all()
    
    tasks_dict = [task.to_dict() for task in tasks]
    events_dict = [event.to_dict() for event in events]
    
    suggestions = ai_engine.suggest_time_blocks(tasks_dict, events_dict, date)
    
    return jsonify(suggestions)

# ============================================================================
# API ROUTES - User Stats & Gamification
# ============================================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get user statistics"""
    stats = UserStats.query.first()
    if not stats:
        stats = UserStats()
        db.session.add(stats)
        db.session.commit()
    
    stats_dict = stats.to_dict()
    
    # Add badges
    badges = ai_engine.check_badges(stats_dict)
    stats_dict['available_badges'] = badges
    
    # Add motivational message
    stats_dict['motivational_message'] = ai_engine.generate_motivational_message(stats_dict)
    
    return jsonify(stats_dict)

@app.route('/api/stats/chart', methods=['GET'])
def get_stats_chart():
    """Generate productivity chart"""
    chart_type = request.args.get('type', 'weekly')  # weekly, monthly
    
    if chart_type == 'weekly':
        days = 7
    else:
        days = 30
    
    # Get completed tasks per day
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    tasks = Task.query.filter(
        Task.completed_at >= cutoff_date,
        Task.status == 'completed'
    ).all()
    
    # Group by date
    daily_counts = {}
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).date()
        daily_counts[date] = 0
    
    for task in tasks:
        date = task.completed_at.date()
        if date in daily_counts:
            daily_counts[date] += 1
    
    # Create chart
    dates = sorted(daily_counts.keys())
    counts = [daily_counts[d] for d in dates]
    
    plt.figure(figsize=(10, 6))
    plt.style.use('dark_background')
    plt.plot(dates, counts, color='#00ffff', linewidth=2, marker='o')
    plt.fill_between(dates, counts, alpha=0.3, color='#00ffff')
    plt.xlabel('Date', color='#00ffff')
    plt.ylabel('Tasks Completed', color='#00ffff')
    plt.title(f'Productivity - Last {days} Days', color='#00ffff', fontsize=16)
    plt.grid(True, alpha=0.2)
    plt.tight_layout()
    
    # Save to bytes
    img = BytesIO()
    plt.savefig(img, format='png', facecolor='#0a0a0a')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png')

# ============================================================================
# Helper Functions
# ============================================================================

def update_user_stats(action):
    """Update user statistics based on action"""
    stats = UserStats.query.first()
    if not stats:
        stats = UserStats()
        db.session.add(stats)
    
    if action == 'task_completed':
        stats.tasks_completed += 1
        stats.total_points += Config.POINTS_PER_TASK
    elif action == 'pomodoro_completed':
        stats.pomodoros_completed += 1
        stats.total_points += Config.POINTS_PER_POMODORO
    elif action == 'note_created':
        stats.notes_created += 1
        stats.total_points += Config.POINTS_PER_NOTE
    
    # Update level
    stats.level = ai_engine.calculate_level(stats.total_points)
    
    # Update streak
    today = datetime.utcnow().date()
    last_activity = stats.last_activity.date() if stats.last_activity else None
    
    if last_activity == today:
        pass  # Same day, no change
    elif last_activity == today - timedelta(days=1):
        stats.current_streak += 1  # Consecutive day
        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak
    else:
        stats.current_streak = 1  # Streak broken
    
    stats.last_activity = datetime.utcnow()
    
    # Update badges
    badges = ai_engine.check_badges(stats.to_dict())
    stats.badges = json.dumps([b['id'] for b in badges])
    
    db.session.commit()

# ============================================================================
# Run Application
# ============================================================================

if __name__ == '__main__':
    print("🚀 NEXUS AI - Personal Productivity Command Center")
    print("=" * 60)
    print("📍 Running on: http://localhost:5000")
    print("🔒 All data stored locally in: nexus_ai.db")
    print("💡 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
