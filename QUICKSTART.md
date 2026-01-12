# 🚀 NEXUS AI - Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Shashankxou/nexus-ai-productivity.git
cd nexus-ai-productivity

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py

# 4. Open browser
# Navigate to: http://localhost:5000
```

That's it! 🎉

---

## 📋 Step-by-Step Guide

### 1. Prerequisites

Make sure you have:
- ✅ Python 3.8 or higher
- ✅ pip (comes with Python)
- ✅ A modern web browser

Check your Python version:
```bash
python --version
# or
python3 --version
```

### 2. Download NEXUS AI

**Option A: Git Clone (Recommended)**
```bash
git clone https://github.com/Shashankxou/nexus-ai-productivity.git
cd nexus-ai-productivity
```

**Option B: Download ZIP**
1. Go to https://github.com/Shashankxou/nexus-ai-productivity
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal/command prompt in the extracted folder

### 3. Set Up Virtual Environment (Optional but Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You'll see `(venv)` in your terminal when activated.

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- SQLAlchemy (database)
- Matplotlib (charts)
- And other required packages

### 5. Run the Application

```bash
python app.py
```

You should see:
```
🚀 NEXUS AI - Personal Productivity Command Center
============================================================
📍 Running on: http://localhost:5000
🔒 All data stored locally in: nexus_ai.db
💡 Press Ctrl+C to stop the server
============================================================
```

### 6. Open in Browser

Open your web browser and go to:
```
http://localhost:5000
```

Or click the link in the terminal (Ctrl+Click or Cmd+Click).

---

## 🎯 First Steps in NEXUS AI

### Create Your First Task

1. Click **"Tasks"** in the sidebar
2. Click **"+ Add Task"** button
3. Fill in:
   - Title: "Learn NEXUS AI"
   - Priority: High
   - Deadline: Tomorrow
4. Click **"Save Task"**

### Try the Pomodoro Timer

1. Click **"Pomodoro Timer"** in sidebar
2. Select your task from dropdown
3. Click **"Start"** button
4. Focus for 25 minutes!

### Create a Note

1. Click **"Second Brain"** in sidebar
2. Click **"+ New Note"** button
3. Write your first note
4. Tags are auto-generated!

### Check Your Stats

1. Click **"Dashboard"** in sidebar
2. See your progress
3. Check AI suggestions
4. View earned badges

---

## 🎤 Try Voice Commands

1. Click the **microphone icon** (top right)
2. Allow microphone access
3. Say: **"Create task"** or **"Start pomodoro"**

---

## ⚙️ Optional Configuration

### Add API Keys (Optional)

For enhanced AI features:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```env
   OPENAI_API_KEY=your-key-here
   ```

3. Restart the app

**Note:** The app works perfectly without API keys!

---

## 🐛 Troubleshooting

### "Port 5000 already in use"

**Solution:** Change the port in `app.py` (last line):
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

Then access at: `http://localhost:5001`

### "Module not found" errors

**Solution:** Make sure you're in the virtual environment and reinstall:
```bash
pip install -r requirements.txt
```

### Charts not showing

**Solution:** Install matplotlib dependencies:
```bash
pip install --upgrade matplotlib pillow
```

### Voice commands not working

**Solution:**
- Use Chrome or Edge browser (best support)
- Allow microphone permissions when prompted
- Check browser console (F12) for errors

---

## 📱 Access from Other Devices

To access NEXUS AI from your phone/tablet on the same network:

1. Find your computer's IP address:
   
   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address"
   
   **macOS/Linux:**
   ```bash
   ifconfig
   ```
   Look for "inet" under your network interface

2. On your phone/tablet, open browser and go to:
   ```
   http://YOUR-IP-ADDRESS:5000
   ```
   Example: `http://192.168.1.100:5000`

---

## 🛑 Stopping the App

Press `Ctrl+C` in the terminal where the app is running.

To deactivate virtual environment:
```bash
deactivate
```

---

## 💾 Backup Your Data

Your data is stored in `nexus_ai.db`. To backup:

**Windows:**
```bash
copy nexus_ai.db nexus_ai_backup.db
```

**macOS/Linux:**
```bash
cp nexus_ai.db nexus_ai_backup.db
```

---

## 🎓 Learn More

- **Full Documentation:** [README.md](README.md)
- **Report Issues:** [GitHub Issues](https://github.com/Shashankxou/nexus-ai-productivity/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/Shashankxou/nexus-ai-productivity/discussions)

---

## 🎉 You're All Set!

Start boosting your productivity with NEXUS AI! 🚀

**Pro Tips:**
- ⭐ Star the repo if you like it
- 🐛 Report bugs to help improve
- 💡 Share your productivity wins
- 🤝 Contribute new features

---

**Happy Productivity!** 💪

Made with 💙 by Shashank
