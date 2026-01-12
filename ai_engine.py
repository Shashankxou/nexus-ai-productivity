import os
import json
import random
from datetime import datetime, timedelta
from collections import Counter
import re

class AIEngine:
    """
    AI Engine for NEXUS AI - Provides intelligent features
    Works locally without API keys, with optional OpenAI integration
    """
    
    def __init__(self, openai_api_key=None):
        self.openai_api_key = openai_api_key
        self.has_openai = bool(openai_api_key)
        
    def suggest_next_task(self, tasks, current_time=None):
        """
        AI-powered task suggestion based on priority, deadline, and patterns
        """
        if not tasks:
            return None
            
        current_time = current_time or datetime.now()
        pending_tasks = [t for t in tasks if t['status'] == 'pending']
        
        if not pending_tasks:
            return None
        
        # Score each task
        scored_tasks = []
        for task in pending_tasks:
            score = 0
            
            # Priority scoring
            priority_scores = {'urgent': 100, 'high': 75, 'medium': 50, 'low': 25}
            score += priority_scores.get(task['priority'], 50)
            
            # Deadline urgency
            if task['deadline']:
                deadline = datetime.fromisoformat(task['deadline'])
                hours_until_deadline = (deadline - current_time).total_seconds() / 3600
                
                if hours_until_deadline < 0:
                    score += 200  # Overdue!
                elif hours_until_deadline < 24:
                    score += 150  # Due today
                elif hours_until_deadline < 72:
                    score += 100  # Due in 3 days
                elif hours_until_deadline < 168:
                    score += 50   # Due this week
            
            # Time-based suggestions
            hour = current_time.hour
            if 9 <= hour < 12:  # Morning - high priority tasks
                if task['priority'] in ['urgent', 'high']:
                    score += 30
            elif 14 <= hour < 17:  # Afternoon - medium tasks
                if task['priority'] == 'medium':
                    score += 20
            elif 20 <= hour < 23:  # Evening - low priority or creative
                if task['priority'] == 'low':
                    score += 15
            
            scored_tasks.append((task, score))
        
        # Sort by score and return top suggestion
        scored_tasks.sort(key=lambda x: x[1], reverse=True)
        best_task = scored_tasks[0][0]
        
        # Generate suggestion message
        messages = [
            f"🎯 Focus on '{best_task['title']}' - it's your top priority right now!",
            f"⚡ Time to tackle '{best_task['title']}' - you've got this!",
            f"🚀 Let's crush '{best_task['title']}' together!",
            f"💪 '{best_task['title']}' is calling - let's get it done!",
        ]
        
        return {
            'task': best_task,
            'message': random.choice(messages),
            'reason': self._get_suggestion_reason(best_task, current_time)
        }
    
    def _get_suggestion_reason(self, task, current_time):
        """Generate human-readable reason for suggestion"""
        reasons = []
        
        if task['priority'] == 'urgent':
            reasons.append("urgent priority")
        
        if task['deadline']:
            deadline = datetime.fromisoformat(task['deadline'])
            hours_until = (deadline - current_time).total_seconds() / 3600
            
            if hours_until < 0:
                reasons.append("overdue")
            elif hours_until < 24:
                reasons.append("due today")
            elif hours_until < 72:
                reasons.append("due soon")
        
        return "Based on " + " and ".join(reasons) if reasons else "optimal timing"
    
    def analyze_productivity(self, tasks, time_entries, days=7):
        """
        Analyze productivity patterns and generate insights
        """
        insights = {
            'total_tasks_completed': 0,
            'total_time_spent': 0,
            'average_task_duration': 0,
            'most_productive_hours': [],
            'task_completion_rate': 0,
            'productivity_trend': 'stable',
            'recommendations': []
        }
        
        # Calculate completed tasks
        completed_tasks = [t for t in tasks if t['status'] == 'completed']
        insights['total_tasks_completed'] = len(completed_tasks)
        
        # Calculate total time
        total_minutes = sum(entry['duration'] or 0 for entry in time_entries)
        insights['total_time_spent'] = total_minutes
        
        # Average task duration
        if completed_tasks:
            insights['average_task_duration'] = total_minutes / len(completed_tasks)
        
        # Most productive hours (analyze time entries)
        hour_productivity = Counter()
        for entry in time_entries:
            if entry['start_time']:
                hour = datetime.fromisoformat(entry['start_time']).hour
                hour_productivity[hour] += entry['duration'] or 0
        
        if hour_productivity:
            top_hours = hour_productivity.most_common(3)
            insights['most_productive_hours'] = [h[0] for h in top_hours]
        
        # Task completion rate
        total_tasks = len(tasks)
        if total_tasks > 0:
            insights['task_completion_rate'] = (len(completed_tasks) / total_tasks) * 100
        
        # Generate recommendations
        recommendations = []
        
        if insights['task_completion_rate'] < 50:
            recommendations.append("📊 Your completion rate is below 50%. Try breaking tasks into smaller chunks!")
        
        if insights['most_productive_hours']:
            peak_hour = insights['most_productive_hours'][0]
            recommendations.append(f"⏰ You're most productive around {peak_hour}:00. Schedule important tasks then!")
        
        if insights['average_task_duration'] > 120:
            recommendations.append("⚡ Tasks are taking over 2 hours on average. Consider using Pomodoro technique!")
        
        if not recommendations:
            recommendations.append("🎉 Great job! Keep up the excellent productivity!")
        
        insights['recommendations'] = recommendations
        
        return insights
    
    def suggest_time_blocks(self, tasks, events, date):
        """
        Suggest optimal time blocks for tasks based on calendar and patterns
        """
        suggestions = []
        
        # Get events for the day
        day_events = [e for e in events if datetime.fromisoformat(e['start']).date() == date.date()]
        
        # Find free time slots (assuming 9 AM to 9 PM work day)
        work_start = datetime.combine(date.date(), datetime.min.time().replace(hour=9))
        work_end = datetime.combine(date.date(), datetime.min.time().replace(hour=21))
        
        # Sort events by start time
        day_events.sort(key=lambda e: e['start'])
        
        # Find gaps between events
        free_slots = []
        current_time = work_start
        
        for event in day_events:
            event_start = datetime.fromisoformat(event['start'])
            if event_start > current_time:
                free_slots.append((current_time, event_start))
            current_time = max(current_time, datetime.fromisoformat(event['end']))
        
        # Add final slot if there's time left
        if current_time < work_end:
            free_slots.append((current_time, work_end))
        
        # Match tasks to free slots
        pending_tasks = [t for t in tasks if t['status'] == 'pending']
        pending_tasks.sort(key=lambda t: (
            {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}.get(t['priority'], 2),
            t['deadline'] or '9999-12-31'
        ))
        
        for task in pending_tasks[:5]:  # Top 5 tasks
            estimated_time = task.get('estimated_time', 60)  # Default 1 hour
            
            for slot_start, slot_end in free_slots:
                slot_duration = (slot_end - slot_start).total_seconds() / 60
                
                if slot_duration >= estimated_time:
                    suggestions.append({
                        'task': task,
                        'suggested_start': slot_start.isoformat(),
                        'suggested_end': (slot_start + timedelta(minutes=estimated_time)).isoformat(),
                        'confidence': 'high' if slot_duration >= estimated_time * 1.5 else 'medium'
                    })
                    break
        
        return suggestions
    
    def summarize_note(self, note_content):
        """
        Generate a summary of a note (local NLP-based)
        """
        # Simple extractive summarization
        sentences = re.split(r'[.!?]+', note_content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if not sentences:
            return "Empty note"
        
        # Take first 2-3 sentences as summary
        summary_length = min(3, len(sentences))
        summary = '. '.join(sentences[:summary_length]) + '.'
        
        return summary
    
    def extract_keywords(self, text):
        """
        Extract keywords from text for tagging
        """
        # Simple keyword extraction
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        
        # Common stop words to exclude
        stop_words = {'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 
                     'would', 'could', 'should', 'about', 'which', 'their', 'there'}
        
        keywords = [w for w in words if w not in stop_words]
        
        # Count frequency
        keyword_freq = Counter(keywords)
        
        # Return top 5 keywords
        return [k[0] for k in keyword_freq.most_common(5)]
    
    def generate_motivational_message(self, stats):
        """
        Generate motivational messages based on user stats
        """
        messages = []
        
        if stats['current_streak'] > 0:
            messages.append(f"🔥 {stats['current_streak']} day streak! You're on fire!")
        
        if stats['tasks_completed'] > 0:
            if stats['tasks_completed'] >= 100:
                messages.append(f"🏆 Century club! {stats['tasks_completed']} tasks completed!")
            elif stats['tasks_completed'] >= 50:
                messages.append(f"⭐ Half-century! {stats['tasks_completed']} tasks done!")
            else:
                messages.append(f"💪 {stats['tasks_completed']} tasks conquered!")
        
        if stats['level'] > 1:
            messages.append(f"🎮 Level {stats['level']} Productivity Master!")
        
        if not messages:
            messages.append("🚀 Let's make today productive!")
        
        return random.choice(messages)
    
    def calculate_level(self, total_points):
        """
        Calculate user level based on points (gamification)
        """
        # Level up every 100 points
        return (total_points // 100) + 1
    
    def check_badges(self, stats):
        """
        Check and award badges based on achievements
        """
        badges = []
        
        # Task completion badges
        if stats['tasks_completed'] >= 1:
            badges.append({'id': 'first_task', 'name': 'First Steps', 'icon': '🎯'})
        if stats['tasks_completed'] >= 10:
            badges.append({'id': 'task_warrior', 'name': 'Task Warrior', 'icon': '⚔️'})
        if stats['tasks_completed'] >= 50:
            badges.append({'id': 'task_master', 'name': 'Task Master', 'icon': '👑'})
        if stats['tasks_completed'] >= 100:
            badges.append({'id': 'centurion', 'name': 'Centurion', 'icon': '🏆'})
        
        # Pomodoro badges
        if stats['pomodoros_completed'] >= 1:
            badges.append({'id': 'pomodoro_starter', 'name': 'Pomodoro Starter', 'icon': '🍅'})
        if stats['pomodoros_completed'] >= 25:
            badges.append({'id': 'focus_master', 'name': 'Focus Master', 'icon': '🎯'})
        
        # Streak badges
        if stats['current_streak'] >= 3:
            badges.append({'id': 'consistent', 'name': 'Consistent', 'icon': '📅'})
        if stats['current_streak'] >= 7:
            badges.append({'id': 'week_warrior', 'name': 'Week Warrior', 'icon': '🔥'})
        if stats['current_streak'] >= 30:
            badges.append({'id': 'unstoppable', 'name': 'Unstoppable', 'icon': '💎'})
        
        # Note badges
        if stats['notes_created'] >= 10:
            badges.append({'id': 'knowledge_seeker', 'name': 'Knowledge Seeker', 'icon': '📚'})
        if stats['notes_created'] >= 50:
            badges.append({'id': 'brain_builder', 'name': 'Brain Builder', 'icon': '🧠'})
        
        return badges
