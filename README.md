# TamilAI Rephrase - Tamil Content Rephraser

An intelligent, full-stack Tamil linguistic rephrasing and content optimization application. This system corrects Tamil spelling/grammar typos, converts Tanglish (mixed Roman script) into standard Tamil characters, adapts text into 7 style tones, calculates readability indices, and reads output with live Text-to-Speech (TTS).

---

## 🏛️ Technology Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons, and Motion/React.
- **Backend**: Express Server with Node.js & TypeScript, leveraging the Google GenAI SDK with the `gemini-3.5-flash` model.
- **Microphone & Speech**: Web Speech API for real-time dictation (`ta-IN`) and native Tamil audio synthesis.

---

## 🌟 Core Feature Specifications
1. **Intelligent Tamil Rephrasing**: Fixes spelling, typography, grammatical and structural flaws.
2. **Roman Script Translation (Tanglish)**: Detects and translates English-scripted Tamil (e.g., `"eppadi irukinga?"` ➔ `"எப்படி இருக்கிறீர்கள்?"`).
3. **7 Styling Modes**: Toggle styling suited for:
   - **Formal (முறையானது)**: Respectful administrative language.
   - **Simple (எளிமையானது)**: Clear, accessible conversational Tamil.
   - **Professional (தொழில்முறை)**: Polished business correspondence.
   - **Academic (கல்வித்துறை)**: Lit-heavy syntax with rich scholarship vocab.
   - **Creative (கற்பனைத்திறன்)**: Artistic, narrative and poetic descriptions.
   - **Social Media (சமூக ஊடகம்)**: Friendly, casual, trend-optimized.
   - **News Style (செய்தி ஊடகம்)**: Concise, direct, reporting structure.
4. **Modulable Length**: Shorten, Expand or maintain Same-Size constraints.
5. **Explainable AI (XAI)**: Displays a clear linguistic change log mapping spelling fixes, literary replacements, and sandhi rule applications.
6. **AI Metrics Dashboard**: Tracks reading index levels (**Easy**, **Medium**, **Advanced**) alongside AI Confidence Scores.
7. **Speech Synthesis & Recognition**: Real-time voice dictation matching `ta-IN` on entry and one-click playback audio output.

---

## 🚀 Setup & Execution Guide (Integrated Node.js Full-Stack)

Our repository features a unified, high-performance Node.js environment where Express serves as both the API server and the asset distributor.

### 📋 Prerequisites
- **Node.js**: v18.0 or higher
- **Gemini API Key**: From Google AI Studio

### 🛠️ Step-by-Step Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment credentials in `.env` (or copy `.env.example`):
   ```env
   GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   *The Express server boots your API routes at `/api/*` and mounts the Vite dev server at `http://localhost:3000` simultaneously.*

4. Build and start in Production Mode:
   ```bash
   npm run build
   npm run start
   ```

---

## 🐳 Optional Architecture: Python FastAPI Server Support

If you prefer to decouple the backend into a **FastAPI** microservice, here are the setup rules:

### Directory Concept:
```
tamilai-rephrase/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── services.py
│   ├── .env
│   └── requirements.txt
```

### 1. Backend Python FastAPI Setup
Create a Python virtual environment and install dependencies:
```bash
# Enter backend directory
cd backend

# Create Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

Configure `.env` in `backend/`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=8000
HOST=0.0.0.0
```

Start the FastAPI microservice:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend React Client Configuration
Redirect local fetch calls inside `src/components/Dashboard.tsx` from `/api/rephrase` to your FastAPI server:
```typescript
const response = await fetch("http://localhost:8000/api/rephrase", { ... });
```

---

## 📈 Deployment & Production Hosting Guide

### Option A: Railway or Render (Full-Stack Express)
Railway is ideal, as it reads the standard `package.json` configurations without any extra setups.
1. Create a server project on [Railway](https://railway.app/).
2. Connect your Git Repository.
3. Define the Environment Variable: `GEMINI_API_KEY`.
4. Railway will automatically notice the `"type": "module"` and trigger `npm run build` and `npm run start` correctly routing it through Cloudrun port bindings.

### Option B: Decoupled Deployments (Vercel Client + Render Backend)
1. **Frontend (Vercel)**: Push to Vercel, pointing build settings as standard Vite SPA.
2. **Backend (FastAPI on Render)**: Create a Web Service instance. Define your environment parameters, and secure CORS whitelist targets matching your live client domain name.

### Option C: Git Deployment (Staging)
Secure configurations with clean standard Git commands:
```bash
git init
git add .
git commit -m "feat: complete TamilAI Content Rephraser"
git remote add origin staging-github-url
git branch -M main
git push -u origin main
```
