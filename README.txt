# ABA Tracker

A simple, user-friendly web application for Special Education professionals to track student behavior using the ABC (Antecedent-Behavior-Consequence) model.

![ABA Tracker Screenshot](screenshot.png)

## Features

- **Student Management**
  - Add students with name and grade level
  - Edit student information
  - Delete students and their associated incidents

- **Incident Recording**
  - Record behavioral incidents using the ABC model
  - Track when and where incidents occur (classroom, hallway, cafeteria, etc.)
  - Add intervention strategies and additional notes

- **Voice Recording with AI Transcription**
  - Record incidents using your voice
  - Automatic transcription via OpenAI Whisper
  - AI-powered parsing automatically fills ABC fields
  - Review and edit before submitting

- **Data Persistence**
  - All data is automatically saved to browser localStorage
  - Data persists across page refreshes and browser sessions

- **User-Friendly Interface**
  - Clean, colorful design appropriate for educational settings
  - Responsive layout works on desktop and mobile
  - Easy-to-use edit and delete functionality

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: OpenAI Whisper (transcription) + GPT-4o-mini (parsing)
- **Storage**: Browser localStorage

## Live Demo

Visit the live app: [Your Vercel URL here]

## Deployment

### Deploy to Vercel (Recommended)

1. **Fork or clone this repository**

2. **Get an OpenAI API Key**
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Keep it safe - you'll need it in the next step

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import this repository
   - In the "Environment Variables" section, add:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (starts with `sk-`)
   - Click "Deploy"

4. **Done!** Your app will be live at `your-project.vercel.app`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aba-tracker.git
   cd aba-tracker
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env file
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

4. **Run locally**
   ```bash
   vercel dev
   ```

5. Navigate to `http://localhost:3000`

## Usage

### Adding a Student
1. Enter the student's name in the "Add a Student" section
2. Select their grade level
3. Click "Add Student"

### Recording an Incident (Manual)
1. Select a student from the dropdown
2. Set the date/time and location of the incident
3. Fill in the ABC data:
   - **Antecedent**: What happened before the behavior?
   - **Behavior**: What did the student do?
   - **Consequence**: What happened after the behavior?
4. Optionally add intervention used and additional notes
5. Click "Record Incident"

### Recording an Incident (Voice)
1. Select a student from the dropdown
2. Set the date/time and location
3. Click the "🎤 Record Incident" button
4. Speak naturally about what happened (e.g., "The student was asked to complete a math worksheet. He threw his pencil and yelled 'I can't do this!' I redirected him to take a break in the calm corner.")
5. Click "Stop Recording"
6. Review the transcription and edit if needed
7. Click "Parse & Fill Fields" - AI will automatically populate the ABC fields
8. Review the filled fields and submit

### Editing/Deleting
- Click the pencil icon (✏️) to edit a student or incident
- Click the trash icon (🗑️) to delete a student or incident

## Project Structure

```
aba-tracker/
├── api/
│   ├── transcribe.js   # Whisper API endpoint
│   └── parse.js        # GPT parsing endpoint
├── index.html          # Main HTML structure
├── index.css           # Styles and responsive design
├── index.js            # Frontend application logic
├── package.json        # Project metadata
├── vercel.json         # Vercel configuration
├── .gitignore
└── README.md           # Project documentation
```

## API Endpoints

### POST /api/transcribe
Transcribes audio using OpenAI Whisper.
- **Input**: multipart/form-data with audio file
- **Output**: `{ "text": "transcription..." }`
- **Rate Limit**: 15 requests per IP per day

### POST /api/parse
Parses transcription into ABC format using GPT.
- **Input**: `{ "transcription": "..." }`
- **Output**: `{ "parsed": { "antecedent": "...", "behavior": "...", ... } }`
- **Rate Limit**: 15 requests per IP per day

## Data Storage

Data is stored in the browser's localStorage under the key `aba_tracker_data`. The data structure is:

```javascript
{
  students: [
    {
      id: "student_1",
      name: "Student Name",
      grade: "3rd Grade",
      incidents: [
        {
          id: "incident_1",
          when: "2024-01-15T10:30",
          where: "Classroom",
          antecedent: "...",
          behavior: "...",
          consequence: "...",
          intervention: "...",
          notes: "..."
        }
      ]
    }
  ],
  studentIdCounter: 2,
  incidentIdCounter: 2
}
```

## Browser Support

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: Voice recording requires microphone permissions and a browser that supports the MediaRecorder API.

## Cost Estimation

The voice recording feature uses OpenAI APIs:
- **Whisper**: ~$0.006 per minute of audio
- **GPT-4o-mini**: ~$0.00015 per 1K input tokens

For light usage (10-20 recordings per month), expect costs under $1/month.

## Future Improvements

- [ ] Export data to CSV/PDF
- [ ] Search and filter incidents
- [ ] Data visualization/charts
- [ ] Multiple user support with authentication
- [ ] Cloud sync option

## License

MIT License - Feel free to use this project for educational purposes.

## Acknowledgments

Built with care for Special Education professionals who work tirelessly to support their students.

---

Made with ❤️ for Special Education Heroes




