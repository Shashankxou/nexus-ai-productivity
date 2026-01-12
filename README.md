# 🚀 NEXUS AI - Personal Productivity Command Center

![NEXUS AI](https://img.shields.io/badge/NEXUS-AI-00ffff?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

A **futuristic, AI-powered personal productivity application** with a stunning neon UI, running entirely on your local machine. Features intelligent task management, Pomodoro timer, calendar, second brain note-taking, and gamification.

---

## ✨ Features

### 🎯 Core Features

- **AI-Powered Task Suggestions** - Get intelligent recommendations on what to work on next
- **Smart To-Do List** - Priority-based task management with drag-and-drop reordering
- **Pomodoro Timer** - Focus sessions with automatic break management
- **Interactive Calendar** - Visual event management with recurring events support
- **Second Brain** - Wiki-style note-taking with auto-tagging and search
- **Productivity Analytics** - AI-driven insights and trend analysis
- **Gamification** - Earn points, level up, and unlock badges

### 🎨 Futuristic UI

- **Dark Neon Theme** - Cyberpunk-inspired design with cyan/purple accents
- **Animated Background** - Moving grid and floating particles
- **Smooth Transitions** - Polished animations throughout
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Voice Input** - Control the app with voice commands (Web Speech API)

### 🤖 AI Features

- **Task Prioritization** - AI analyzes deadlines, priority, and time of day
- **Productivity Insights** - Discover your most productive hours
- **Time Block Suggestions** - AI recommends optimal scheduling
- **Auto-Tagging** - Automatic keyword extraction for notes
- **Motivational Messages** - Dynamic encouragement based on your progress

### 🎮 Gamification

- **Points System** - Earn points for completing tasks and pomodoros
- **Level Progression** - Level up as you accomplish more
- **Achievement Badges** - Unlock badges for milestones
- **Streak Tracking** - Maintain daily productivity streaks

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shashankxou/nexus-ai-productivity.git
   cd nexus-ai-productivity
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   ```
   Navigate to: http://localhost:5000
   ```

That's it! The app will create a local SQLite database automatically on first run.

---

## 📁 Project Structure

```
nexus-ai-productivity/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── models.py             # Database models
├── ai_engine.py          # AI features and algorithms
├── requirements.txt      # Python dependencies
├── nexus_ai.db          # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css    # Futuristic styling
│   └── js/
│       └── app.js       # Frontend logic
└── templates/
    └── index.html       # Single-page application
```

---

## 🎯 Usage Guide

### Dashboard

The dashboard is your command center:
- **AI Suggestion Card** - Shows your next recommended task
- **Stats Overview** - Quick view of tasks, pomodoros, and notes
- **Productivity Chart** - Visual trend of your completed tasks
- **Achievement Badges** - Display of earned badges

### Tasks

Manage your to-do list:
- **Add Task** - Click "+ Add Task" button
- **Set Priority** - Choose from Low, Medium, High, Urgent
- **Add Deadline** - Set due dates for time-sensitive tasks
- **Estimate Time** - Track how long tasks should take
- **Add Tags** - Organize with custom tags
- **Complete Task** - Mark as done to earn points
- **Filter** - View All, Pending, In Progress, or Completed

### Calendar

Visual event management:
- **Month/Week/Day Views** - Switch between different views
- **Add Events** - Click on any date to create an event
- **Color Coding** - Customize event colors
- **Recurring Events** - Set up daily, weekly, or monthly repeats
- **Link to Tasks** - Connect events with your tasks

### Pomodoro Timer

Focus with the Pomodoro Technique:
- **Customize Duration** - Set work time (default 25 min)
- **Break Times** - Configure short (5 min) and long (15 min) breaks
- **Link to Task** - Track time spent on specific tasks
- **Session Tracking** - Visual dots show completed sessions
- **Auto-Break** - Automatic break after work sessions

### Second Brain (Notes)

Build your knowledge base:
- **Create Notes** - Rich text note-taking
- **Auto-Tagging** - AI extracts keywords automatically
- **Search** - Find notes instantly
- **Wiki-Style Links** - Connect related notes
- **Favorites** - Star important notes

### Analytics

Understand your productivity:
- **Completion Rate** - Percentage of tasks completed
- **Time Spent** - Total hours tracked
- **Productive Hours** - When you work best
- **AI Recommendations** - Personalized improvement tips

---

## 🎮 Gamification System

### Points

- **Complete Task**: +10 points
- **Complete Pomodoro**: +5 points
- **Create Note**: +3 points

### Levels

- Level up every 100 points
- Higher levels unlock more features (future updates)

### Badges

- **First Steps** - Complete your first task
- **Task Warrior** - Complete 10 tasks
- **Task Master** - Complete 50 tasks
- **Centurion** - Complete 100 tasks
- **Pomodoro Starter** - Complete first pomodoro
- **Focus Master** - Complete 25 pomodoros
- **Consistent** - 3-day streak
- **Week Warrior** - 7-day streak
- **Unstoppable** - 30-day streak
- **Knowledge Seeker** - Create 10 notes
- **Brain Builder** - Create 50 notes

---

## 🎤 Voice Commands

Enable voice input by clicking the microphone icon:

- **"Create task"** or **"Add task"** - Opens task form
- **"Create note"** or **"Add note"** - Opens note form
- **"Start pomodoro"** - Switches to Pomodoro view and starts timer

More commands coming in future updates!

---

## ⚙️ Configuration

### Optional API Keys

The app works fully offline, but you can enhance it with optional APIs:

1. **Create a `.env` file** in the project root:
   ```env
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=your-openai-key  # Optional: Enhanced AI features
   GOOGLE_CALENDAR_API_KEY=your-google-key  # Optional: Calendar sync
   ```

2. **Without API keys**, the app uses local AI algorithms (included)

### Customization

Edit `config.py` to customize:
- Pomodoro durations
- Points per action
- Database location
- Time zone

---

## 🔒 Privacy & Security

- **100% Local** - All data stored on your machine
- **No Cloud** - No data sent to external servers (unless you add API keys)
- **SQLite Database** - Simple, portable, and secure
- **No Tracking** - Zero analytics or telemetry
- **Open Source** - Inspect the code yourself

Your data is in `nexus_ai.db` - back it up regularly!

---

## 🛠️ Tech Stack

### Backend
- **Flask 3.0.0** - Web framework
- **SQLAlchemy** - Database ORM
- **APScheduler** - Background tasks
- **NLTK** - Natural language processing
- **Matplotlib** - Chart generation

### Frontend
- **Vanilla JavaScript** - No framework bloat
- **FullCalendar** - Interactive calendar
- **Web Speech API** - Voice recognition
- **CSS3 Animations** - Smooth transitions
- **Custom Neon Theme** - Futuristic design

### AI Engine
- Local algorithms for task prioritization
- Keyword extraction for auto-tagging
- Productivity pattern analysis
- Time block optimization

---

## 📊 Database Schema

### Tables

- **tasks** - To-do items with priority, deadline, tags
- **events** - Calendar events with recurrence
- **notes** - Second brain knowledge base
- **time_entries** - Time tracking records
- **user_stats** - Gamification data

All tables auto-created on first run.

---

## 🚧 Roadmap

### v1.1 (Coming Soon)
- [ ] Email notifications
- [ ] Export to PDF/CSV
- [ ] Dark/Light theme toggle
- [ ] Mobile app (PWA)
- [ ] Habit tracking

### v1.2
- [ ] Team collaboration
- [ ] Cloud sync (optional)
- [ ] Advanced AI with GPT integration
- [ ] Voice output (text-to-speech)
- [ ] Kanban board view

### v2.0
- [ ] Desktop app (Electron)
- [ ] Plugin system
- [ ] Custom themes
- [ ] Advanced analytics
- [ ] Integration with other tools

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in app.py (last line):
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Database Errors
```bash
# Delete and recreate database:
rm nexus_ai.db
python app.py
```

### Voice Recognition Not Working
- Use Chrome or Edge (best support)
- Allow microphone permissions
- Check browser console for errors

### Charts Not Loading
```bash
# Install matplotlib dependencies:
pip install --upgrade matplotlib pillow
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements.txt

# Run in debug mode
export FLASK_ENV=development  # Linux/Mac
set FLASK_ENV=development     # Windows
python app.py
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Flask** - Excellent web framework
- **FullCalendar** - Beautiful calendar component
- **Font Awesome** - Icon library
- **Google Fonts** - Orbitron and Rajdhani fonts
- **Inspiration** - Cyberpunk aesthetics and productivity apps

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Shashankxou/nexus-ai-productivity/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shashankxou/nexus-ai-productivity/discussions)
- **Email**: support@nexusai.local

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/0a0a0a/00ffff?text=Dashboard+View)

### Tasks
![Tasks](https://via.placeholder.com/800x450/0a0a0a/00ffff?text=Task+Management)

### Pomodoro
![Pomodoro](https://via.placeholder.com/800x450/0a0a0a/00ffff?text=Pomodoro+Timer)

### Notes
![Notes](https://via.placeholder.com/800x450/0a0a0a/00ffff?text=Second+Brain)

---

## 🎯 Key Highlights

✅ **Runs 100% locally** - No internet required  
✅ **AI-powered** - Smart task suggestions  
✅ **Futuristic UI** - Neon cyberpunk theme  
✅ **Gamified** - Points, levels, badges  
✅ **Voice control** - Hands-free operation  
✅ **Privacy-first** - Your data stays yours  
✅ **Open source** - Free forever  
✅ **Cross-platform** - Windows, Mac, Linux  

---

**Made with 💙 by Shashank**

**Version**: 1.0.0  
**Last Updated**: January 2026  

---

🚀 **Start your productivity journey with NEXUS AI today!** 🚀
