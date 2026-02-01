# ABA Tracker

A modern React application for Special Education professionals to track student behavior using the ABC (Antecedent-Behavior-Consequence) model with AI-powered voice transcription.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%2B%20GPT--4o--mini-412991?logo=openai)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

## Features

### AI-Powered Voice Transcription
- **One-click recording** - Speak naturally about behavioral incidents
- **OpenAI Whisper** - Professional-grade speech-to-text transcription
- **GPT-4o-mini parsing** - Automatically extracts ABC data from natural speech
- **60-second workflow** - What used to take 5-10 minutes of typing

### Student & Incident Management
- Add, edit, and delete student profiles
- Track incidents with full ABC documentation
- Color-coded labels for quick visual scanning
- Persistent storage via localStorage

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
│   ├── StudentForm.jsx      # Add new students
│   ├── StudentCard.jsx      # Display student with incidents
│   ├── IncidentForm.jsx     # Log new incidents
│   ├── IncidentCard.jsx     # Display incident details
│   ├── RecordingButton.jsx  # Voice recording control
│   ├── TranscriptionModal.jsx # AI transcription UI
│   └── EditModal.jsx        # Edit students/incidents
├── hooks/
│   ├── useLocalStorage.js   # Persistent state hook
│   └── useRecording.js      # Audio recording hook
├── styles/
│   └── index.css            # Global styles
├── App.jsx                  # Main application
└── main.jsx                 # Entry point

api/
├── transcribe.js            # Whisper API endpoint
└── parse.js                 # GPT parsing endpoint
```

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/RafayelKeshishyan/ABA-Tracker.git
cd ABA-Tracker

# Install dependencies
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your-api-key" > .env

# Run development server
npm run dev
```

### Deployment

Deploy to Vercel with one click:

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
{ "text": "The student was asked to..." }
```

### POST /api/parse
Parses transcription into ABC format using GPT-4o-mini.

```json
// Request
{ "transcription": "The student was asked to..." }

// Response
{
  "parsed": {
    "antecedent": "Student was asked to complete worksheet",
    "behavior": "Threw pencil and yelled",
    "consequence": "Teacher redirected to calm corner",
    "intervention": "Break in calm corner",
    "notes": "Calmed down after 5 minutes"
  }
}
```

## Usage

1. **Add a student** - Enter name and grade level
2. **Log an incident** - Select student, set time/location
3. **Record voice** - Click microphone, describe what happened naturally
4. **Review & submit** - AI fills the form, review and save

## License

MIT

---

**Built for Special Education professionals**
