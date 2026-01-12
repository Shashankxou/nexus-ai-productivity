from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Task(db.Model):
    """Task model for to-do list"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    order_index = db.Column(db.Integer, default=0)
    tags = db.Column(db.String(500))  # JSON string of tags
    estimated_time = db.Column(db.Integer)  # in minutes
    actual_time = db.Column(db.Integer, default=0)  # in minutes
    pomodoros_completed = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'order_index': self.order_index,
            'tags': json.loads(self.tags) if self.tags else [],
            'estimated_time': self.estimated_time,
            'actual_time': self.actual_time,
            'pomodoros_completed': self.pomodoros_completed
        }

class Event(db.Model):
    """Calendar event model"""
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    color = db.Column(db.String(20), default='#00ffff')  # Neon cyan default
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_rule = db.Column(db.String(100))  # daily, weekly, monthly
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start': self.start_time.isoformat(),
            'end': self.end_time.isoformat(),
            'location': self.location,
            'color': self.color,
            'is_recurring': self.is_recurring,
            'recurrence_rule': self.recurrence_rule,
            'task_id': self.task_id
        }

class Note(db.Model):
    """Note model for Second Brain"""
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(500))  # JSON string of tags
    linked_notes = db.Column(db.String(500))  # JSON string of note IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_favorite = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'tags': json.loads(self.tags) if self.tags else [],
            'linked_notes': json.loads(self.linked_notes) if self.linked_notes else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_favorite': self.is_favorite
        }

class TimeEntry(db.Model):
    """Time tracking entries"""
    __tablename__ = 'time_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in minutes
    entry_type = db.Column(db.String(20), default='manual')  # manual, pomodoro
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'entry_type': self.entry_type
        }

class UserStats(db.Model):
    """User statistics and gamification"""
    __tablename__ = 'user_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    total_points = db.Column(db.Integer, default=0)
    tasks_completed = db.Column(db.Integer, default=0)
    pomodoros_completed = db.Column(db.Integer, default=0)
    notes_created = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    badges = db.Column(db.String(1000))  # JSON string of earned badges
    level = db.Column(db.Integer, default=1)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'total_points': self.total_points,
            'tasks_completed': self.tasks_completed,
            'pomodoros_completed': self.pomodoros_completed,
            'notes_created': self.notes_created,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'badges': json.loads(self.badges) if self.badges else [],
            'level': self.level,
            'last_activity': self.last_activity.isoformat()
        }
