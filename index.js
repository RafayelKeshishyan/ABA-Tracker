// ABA Tracker - Student Behavior Tracking Application

// In-memory data storage
let students = [];
let studentIdCounter = 1;
let incidentIdCounter = 1;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const incidentForm = document.getElementById('incidentForm');
const studentNameInput = document.getElementById('studentName');
const studentGradeSelect = document.getElementById('studentGrade');
const selectStudentDropdown = document.getElementById('selectStudent');
const studentsContainer = document.getElementById('studentsContainer');

// Incident form fields
const incidentWhen = document.getElementById('incidentWhen');
const incidentWhere = document.getElementById('incidentWhere');
const antecedentInput = document.getElementById('antecedent');
const behaviorInput = document.getElementById('behavior');
const consequenceInput = document.getElementById('consequence');
const interventionInput = document.getElementById('intervention');
const notesInput = document.getElementById('notes');

// Initialize the app
function init() {
    // Set default datetime to now
    setDefaultDateTime();
    
    // Add event listeners
    studentForm.addEventListener('submit', handleAddStudent);
    incidentForm.addEventListener('submit', handleAddIncident);
    
    // Initial render
    displayStudents();
}

// Set default datetime to current time
function setDefaultDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localISOTime = new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
    incidentWhen.value = localISOTime;
}

// Generate unique ID
function generateId(type) {
    if (type === 'student') {
        return `student_${studentIdCounter++}`;
    }
    return `incident_${incidentIdCounter++}`;
}

// Add a new student
function handleAddStudent(e) {
    e.preventDefault();
    
    const name = studentNameInput.value.trim();
    const grade = studentGradeSelect.value;
    
    if (!name || !grade) {
        alert('Please fill in all fields!');
        return;
    }
    
    const newStudent = {
        id: generateId('student'),
        name: name,
        grade: grade,
        incidents: []
    };
    
    students.push(newStudent);
    
    // Clear form
    studentForm.reset();
    
    // Update UI
    updateStudentDropdown();
    displayStudents();
    
    // Show success feedback
    showSuccessAnimation(studentForm.querySelector('.btn'));
}

// Add an incident to a student
function handleAddIncident(e) {
    e.preventDefault();
    
    const studentId = selectStudentDropdown.value;
    const when = incidentWhen.value;
    const where = incidentWhere.value;
    const antecedent = antecedentInput.value.trim();
    const behavior = behaviorInput.value.trim();
    const consequence = consequenceInput.value.trim();
    const intervention = interventionInput.value.trim();
    const notes = notesInput.value.trim();
    
    if (!studentId || !when || !where || !antecedent || !behavior || !consequence) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found!');
        return;
    }
    
    const newIncident = {
        id: generateId('incident'),
        when: when,
        where: where,
        antecedent: antecedent,
        behavior: behavior,
        consequence: consequence,
        intervention: intervention,
        notes: notes
    };
    
    student.incidents.push(newIncident);
    
    // Clear form (except student selection)
    antecedentInput.value = '';
    behaviorInput.value = '';
    consequenceInput.value = '';
    interventionInput.value = '';
    notesInput.value = '';
    incidentWhere.value = '';
    setDefaultDateTime();
    
    // Update UI
    displayStudents();
    
    // Show success feedback
    showSuccessAnimation(incidentForm.querySelector('.btn'));
}

// Update the student dropdown
function updateStudentDropdown() {
    // Keep the first option
    selectStudentDropdown.innerHTML = '<option value="">Choose a student...</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.grade})`;
        selectStudentDropdown.appendChild(option);
    });
}

// Display all students and their incidents
function displayStudents() {
    if (students.length === 0) {
        studentsContainer.innerHTML = `
            <div class="empty-state">
                <p>No students added yet.</p>
                <p>Add a student above to get started! ✨</p>
            </div>
        `;
        return;
    }
    
    studentsContainer.innerHTML = students.map(student => createStudentCard(student)).join('');
}

// Create a student card HTML
function createStudentCard(student) {
    const incidentCount = student.incidents.length;
    const incidentsHTML = student.incidents.length > 0 
        ? student.incidents.map(incident => createIncidentCard(incident)).join('')
        : '<p class="no-incidents">No incidents recorded yet.</p>';
    
    return `
        <div class="student-card">
            <div class="student-header">
                <div class="student-info">
                    <h3>👤 ${escapeHtml(student.name)}</h3>
                    <span class="student-grade">${escapeHtml(student.grade)}</span>
                </div>
                <div class="incident-count">
                    ${incidentCount} incident${incidentCount !== 1 ? 's' : ''}
                </div>
            </div>
            <div class="incidents-list">
                ${incidentsHTML}
            </div>
        </div>
    `;
}

// Create an incident card HTML
function createIncidentCard(incident) {
    const formattedDate = formatDateTime(incident.when);
    
    let additionalFields = '';
    if (incident.intervention) {
        additionalFields += `
            <div class="abc-item">
                <span class="abc-label intervention">Intervention</span>
                <span class="abc-text">${escapeHtml(incident.intervention)}</span>
            </div>
        `;
    }
    if (incident.notes) {
        additionalFields += `
            <div class="abc-item">
                <span class="abc-label notes">Notes</span>
                <span class="abc-text">${escapeHtml(incident.notes)}</span>
            </div>
        `;
    }
    
    return `
        <div class="incident-card">
            <div class="incident-meta">
                <span>🕐 ${formattedDate}</span>
                <span>📍 ${escapeHtml(incident.where)}</span>
            </div>
            <div class="incident-abc">
                <div class="abc-item">
                    <span class="abc-label antecedent">Antecedent</span>
                    <span class="abc-text">${escapeHtml(incident.antecedent)}</span>
                </div>
                <div class="abc-item">
                    <span class="abc-label behavior">Behavior</span>
                    <span class="abc-text">${escapeHtml(incident.behavior)}</span>
                </div>
                <div class="abc-item">
                    <span class="abc-label consequence">Consequence</span>
                    <span class="abc-text">${escapeHtml(incident.consequence)}</span>
                </div>
                ${additionalFields}
            </div>
        </div>
    `;
}

// Format datetime for display
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const options = { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success animation on button
function showSuccessAnimation(button) {
    button.classList.add('success-animation');
    setTimeout(() => {
        button.classList.remove('success-animation');
    }, 300);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

