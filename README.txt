# ABA Tracker

A professional web application for Special Education professionals to efficiently track and document student behavior using the ABC (Antecedent-Behavior-Consequence) model, powered by advanced AI transcription technology.

![ABA Tracker Screenshot](screenshot.png)

## 🎯 Key Feature: AI-Powered Voice Transcription

**Transform spoken observations into structured documentation in seconds.**

ABA Tracker's flagship feature leverages cutting-edge AI technology to revolutionize how behavioral incidents are recorded:

### **Intelligent Voice-to-Text Transcription**
- **One-click recording**: Simply speak naturally about the incident—no typing required
- **Real-time transcription**: Powered by OpenAI's Whisper API for accurate, professional-grade transcription
- **Automatic field population**: Advanced GPT-4o-mini AI intelligently parses your spoken description and automatically extracts:
  - **Antecedent** (what happened before the behavior)
  - **Behavior** (the observable action)
  - **Consequence** (what happened after)
  - **Intervention strategies** (if mentioned)
  - **Additional context** (automatically categorized)

### **Workflow Efficiency**
1. Record your observation naturally—speak as you would describe it to a colleague
2. Review and edit the AI-generated transcription if needed
3. Let AI automatically populate all ABC fields
4. Submit with one click

**Result**: What used to take 5-10 minutes of manual data entry now takes less than 60 seconds, allowing educators to focus on their students rather than paperwork.

---

## Getting Started

**No installation or setup required.** Simply visit the live application and start using it immediately:

👉 **[Visit ABA Tracker](https://your-vercel-url.vercel.app)**

The application works entirely in your browser—just open the link and begin tracking student behavior. All features, including the advanced AI transcription, are ready to use immediately.

---

## Additional Features

While the AI transcription is our standout feature, ABA Tracker also includes standard functionality expected in professional behavior tracking systems:

### **Student Management**
- Add, edit, and delete student profiles
- Organize by grade level
- Automatic data cleanup when students are removed

### **Manual Incident Recording**
- Traditional form-based data entry for those who prefer typing
- Full ABC model support with intervention tracking
- Location and timestamp documentation

### **Data Management**
- Automatic browser-based storage (localStorage)
- Data persists across sessions
- Edit and delete functionality for all records

### **User Experience**
- Clean, intuitive interface designed for educational professionals
- Responsive design—works seamlessly on desktop, tablet, and mobile devices
- Color-coded visual organization for quick scanning

---

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI Engine**: 
  - OpenAI Whisper API (speech-to-text transcription)
  - GPT-4o-mini (intelligent text parsing and field extraction)
- **Storage**: Browser localStorage

---

## Usage Guide

### **AI Voice Transcription Workflow** (Recommended)

1. Select the student from the dropdown menu
2. Set the date, time, and location of the incident
3. Click the **🎤 Record Incident** button
4. Speak naturally about what happened:
   > *Example: "The student was asked to complete a math worksheet. He threw his pencil and yelled 'I can't do this!' I redirected him to take a break in the calm corner, and he calmed down after 5 minutes."*
5. Click **Stop Recording**
6. Review the AI-generated transcription (edit if necessary)
7. Click **Parse & Fill Fields**—AI automatically populates all ABC fields
8. Review the populated fields and submit

### **Manual Entry Workflow**

1. Select a student from the dropdown
2. Set the date/time and location
3. Manually fill in:
   - **Antecedent**: What happened before the behavior?
   - **Behavior**: What did the student do?
   - **Consequence**: What happened after the behavior?
4. Optionally add intervention strategies and notes
5. Click **Record Incident**

### **Editing and Management**

- Click the **✏️ pencil icon** to edit any student or incident
- Click the **🗑️ trash icon** to delete records
- All changes are automatically saved

---

## Technical Details

### API Endpoints

#### `POST /api/transcribe`
Transcribes audio recordings using OpenAI Whisper API.
- **Input**: multipart/form-data with audio file
- **Output**: `{ "text": "transcription..." }`
- **Rate Limit**: 15 requests per IP per day

#### `POST /api/parse`
Intelligently parses transcription text into structured ABC format using GPT-4o-mini.
- **Input**: `{ "transcription": "..." }`
- **Output**: `{ "parsed": { "antecedent": "...", "behavior": "...", "consequence": "...", "intervention": "...", "notes": "..." } }`
- **Rate Limit**: 15 requests per IP per day

### Data Storage

Data is stored locally in the browser's localStorage under the key `aba_tracker_data`. The data structure:

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

### Project Structure

```
aba-tracker/
├── api/
│   ├── transcribe.js   # OpenAI Whisper transcription endpoint
│   └── parse.js        # GPT-4o-mini parsing endpoint
├── index.html          # Main application interface
├── index.css           # Styling and responsive design
├── index.js            # Frontend application logic
├── package.json        # Project dependencies
├── vercel.json         # Vercel deployment configuration
└── README.txt          # Project documentation
```

---

## Browser Compatibility

Fully supported on all modern browsers:
- **Chrome** (recommended for best performance)
- **Firefox**
- **Safari**
- **Edge**

**Note**: The AI voice transcription feature requires:
- Microphone permissions
- A browser that supports the MediaRecorder API
- Modern browser with ES6+ support

---

## Cost Information

The AI transcription feature utilizes OpenAI's APIs:
- **Whisper API**: ~$0.006 per minute of audio
- **GPT-4o-mini**: ~$0.00015 per 1K input tokens

**Estimated costs**: For typical usage (10-20 voice recordings per month), expect costs under **$1/month**.

---

## For Developers / Self-Hosting

If you'd like to host your own instance of this application:

### Deploy to Vercel (Recommended)

1. **Fork or clone this repository**

2. **Obtain an OpenAI API Key**
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Name it (e.g., "ABA Tracker")
   - **Important**: Copy the key immediately—you won't be able to view it again
   - This is a standard OpenAI API key that works for both Whisper (transcription) and GPT-4o-mini (parsing)—no special configuration needed

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import this repository
   - In the "Environment Variables" section, add:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your OpenAI API key (starts with `sk-`)
   - Click "Deploy"

4. **Complete**: Your application will be live at `your-project.vercel.app`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aba-tracker.git
   cd aba-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

4. **Set up environment variables**
   ```bash
   # Create a .env file
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

5. **Run locally**
   ```bash
   vercel dev
   ```

6. Navigate to `http://localhost:3000`

---

## Future Enhancements

- [ ] Export data to CSV/PDF formats
- [ ] Advanced search and filtering capabilities
- [ ] Data visualization and trend analysis
- [ ] Multi-user support with authentication
- [ ] Cloud synchronization options
- [ ] Customizable ABC field templates
- [ ] Batch import/export functionality

---

## License

MIT License - Free for educational and professional use.

---

## Acknowledgments

Built with dedication for Special Education professionals who work tirelessly to support their students. This tool aims to reduce administrative burden and allow educators to focus on what matters most—their students.

---

**Made with ❤️ for Special Education Professionals**
