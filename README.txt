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

- **Data Persistence**
  - All data is automatically saved to browser localStorage
  - Data persists across page refreshes and browser sessions
  - No account or server required

- **User-Friendly Interface**
  - Clean, colorful design appropriate for educational settings
  - Responsive layout works on desktop and mobile
  - Easy-to-use edit and delete functionality

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript** - No frameworks or dependencies
- **localStorage API** - Client-side data persistence

## Getting Started

### Option 1: Open Directly
Simply open `index.html` in any modern web browser.

### Option 2: Use a Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server installed)
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Adding a Student
1. Enter the student's name in the "Add a Student" section
2. Select their grade level
3. Click "Add Student"

### Recording an Incident
1. Select a student from the dropdown
2. Set the date/time and location of the incident
3. Fill in the ABC data:
   - **Antecedent**: What happened before the behavior?
   - **Behavior**: What did the student do?
   - **Consequence**: What happened after the behavior?
4. Optionally add intervention used and additional notes
5. Click "Record Incident"

### Editing/Deleting
- Click the pencil icon (✏️) to edit a student or incident
- Click the trash icon (🗑️) to delete a student or incident

## Project Structure

```
aba-tracker/
├── index.html      # Main HTML structure
├── index.css       # Styles and responsive design
├── index.js        # Application logic and localStorage
└── README.md       # Project documentation
```

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

