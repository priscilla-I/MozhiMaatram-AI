# MozhiMaatram AI - Intelligent Tamil Content Rephraser

## About

MozhiMaatram AI is an AI-powered Tamil content rephrasing application that intelligently rewrites Tamil text while preserving its original meaning. It improves grammar, sentence structure, and readability while supporting multiple writing styles.

## Features

* Tamil content rephrasing
* Grammar correction
* Multiple writing modes
* Tanglish conversion
* Readability analysis
* AI confidence score
* Explainable AI
* Voice input
* Text-to-speech
* Side-by-side comparison
* Dark mode support

## Technologies Used

* HTML
* CSS
* TypeScript
* TSX
* JSON
* npm
* Vite

## Project Structure

```text
mozhi-maatram-ai/
├── .env.example            # Environment variables example template
├── .gitignore              # Files to ignore in Git repository
├── index.html              # Core HTML entry page
├── metadata.json           # Application metadata and capabilities
├── package.json            # Configuration and packages script
├── server.ts               # Full-stack developer server & Gemini API proxy router
├── tsconfig.json           # TypeScript compilation configurations
├── vite.config.ts          # Vite build tool and development configurations
└── src/                    # Frontend source files
    ├── App.tsx             # Root React component
    ├── main.tsx            # Main React client-side entry block
    ├── index.css           # Global custom CSS rules and Tailwind CSS
    ├── types.ts            # Common custom type declarations
    └── components/         # Frontend React UI components
        ├── Dashboard.tsx        # Shell view with form controls and audio recorders
        ├── ComparisonView.tsx   # Left/Right visual box for text and TTS
        └── Explanations.tsx     # Grammatical rules change explanations table
```

## Setup & Execution Guide

### Prerequisites

* Node.js (v18 or higher)
* npm

### Installation

Clone repository

```bash
git clone <repository-url>
```

Open project

```bash
cd mozhi-maatram-ai
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

Build production version

```bash
npm run build
```

Preview production build

```bash
npm run start
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

## Future Enhancements

* Offline support
* PDF upload
* Browser extension
* Mobile application
* Personalized suggestions

## Conclusion

MozhiMaatram AI is an intelligent Tamil digital writing assistant that improves grammar, readability, and sentence structure while preserving the original meaning of Tamil content.
