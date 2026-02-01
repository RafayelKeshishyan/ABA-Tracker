# ABCScribe

AI-powered voice-to-text documentation for behavior tracking. Speak naturally about incidents and let AI automatically extract ABC (Antecedent-Behavior-Consequence) data.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%2B%20GPT--4o--mini-412991?logo=openai)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

## The Problem

Special Education professionals spend **5-10 minutes** manually typing each behavioral incident into ABC format. With multiple incidents daily, documentation becomes a burden that takes time away from students.

## The Solution

**ABCScribe** lets you speak naturally about what happened. AI handles the rest:

1. **Record** - Click the microphone and describe the incident
2. **Transcribe** - OpenAI Whisper converts speech to text
3. **Parse** - GPT-4o-mini extracts ABC components automatically
4. **Done** - Review and save in under 60 seconds

## Features

- **Voice Recording** - One-click audio capture
- **AI Transcription** - OpenAI Whisper speech-to-text
- **Smart Parsing** - GPT extracts Antecedent, Behavior, Consequence, Intervention, Notes
- **Student Management** - Organize incidents by student
- **Persistent Storage** - Data saved locally in browser

## Tech Stack

| Frontend | Backend | AI |
|----------|---------|-----|
| React 18 | Vercel Serverless | OpenAI Whisper |
| Vite | Node.js | GPT-4o-mini |
| Custom Hooks | REST API | - |

## Project Structure

```
src/
├── components/
│   ├── StudentForm.jsx       # Add new students
│   ├── StudentCard.jsx       # Display student with incidents
│   ├── IncidentForm.jsx      # Log new incidents
│   ├── IncidentCard.jsx      # Display incident details
│   ├── RecordingButton.jsx   # Voice recording control
│   ├── TranscriptionModal.jsx # AI transcription UI
│   └── EditModal.jsx         # Edit students/incidents
├── hooks/
│   ├── useLocalStorage.js    # Persistent state hook
│   └── useRecording.js       # Audio recording hook
├── styles/
│   └── index.css             # Global styles
├── App.jsx                   # Main application
└── main.jsx                  # Entry point

api/
├── transcribe.js             # Whisper API endpoint
└── parse.js                  # GPT parsing endpoint
```

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/RafayelKeshishyan/ABCScribe.git
cd ABCScribe

# Install dependencies
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your-api-key" > .env

# Run development server
npm run dev
```

### Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

## API Endpoints

### POST /api/transcribe
Converts audio to text using OpenAI Whisper.

```json
// Request
{ "audio": "base64...", "filename": "recording.webm" }

// Response
{ "text": "The student was asked to complete a worksheet..." }
```

### POST /api/parse
Parses transcription into ABC format using GPT-4o-mini.

```json
// Request
{ "transcription": "The student was asked to complete a worksheet..." }

// Response
{
  "parsed": {
    "antecedent": "Student was asked to complete worksheet",
    "behavior": "Threw pencil and yelled 'I can't do this'",
    "consequence": "Teacher redirected to calm corner",
    "intervention": "5-minute break in calm corner",
    "notes": "Student calmed down after break"
  }
}
```

## Example Voice Input

> "So Marcus was in the hallway and he didn't want to go back to class, kept saying no. Then he just sat down on the floor. I tried to get him up but he wasn't having it. Eventually got him to move with a sticker promise. This was right after lunch."

**AI Output:**
- **Antecedent:** Student was asked to return to class after lunch
- **Behavior:** Refused verbally, sat down on floor in hallway
- **Consequence:** Staff attempted redirection, used sticker reward
- **Intervention:** Sticker reward system
- **Notes:** Incident occurred in hallway, post-lunch transition

## License

MIT

---

**Built for Special Education professionals** - Less paperwork, more time with students.
