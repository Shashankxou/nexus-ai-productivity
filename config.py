import os
from datetime import timedelta

class Config:
    """Configuration for NEXUS AI Productivity App"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'nexus-ai-secret-key-change-in-production'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///nexus_ai.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI Configuration (Optional - App works without these)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')  # Optional: For AI suggestions
    GOOGLE_CALENDAR_API_KEY = os.environ.get('GOOGLE_CALENDAR_API_KEY')  # Optional: For calendar sync
    
    # App Configuration
    TASKS_PER_PAGE = 50
    NOTES_PER_PAGE = 20
    
    # Pomodoro Timer Defaults (in minutes)
    POMODORO_WORK_TIME = 25
    POMODORO_SHORT_BREAK = 5
    POMODORO_LONG_BREAK = 15
    POMODORO_SESSIONS_UNTIL_LONG_BREAK = 4
    
    # Gamification Settings
    POINTS_PER_TASK = 10
    POINTS_PER_POMODORO = 5
    POINTS_PER_NOTE = 3
    
    # AI Features (can be disabled if no API key)
    ENABLE_AI_SUGGESTIONS = bool(OPENAI_API_KEY)
    ENABLE_CALENDAR_SYNC = bool(GOOGLE_CALENDAR_API_KEY)
    
    # Time Zone
    TIMEZONE = 'UTC'
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
