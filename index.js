// ABA Tracker - Student Behavior Tracking Application

// In-memory data storage
let students = [];
let studentIdCounter = 1;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const studentGradeSelect = document.getElementById('studentGrade');
const studentsContainer = document.getElementById('studentsContainer');

// Initialize the app
function init() {
    // Add event listeners
    studentForm.addEventListener('submit', handleAddStudent);
    
    // Initial render
    displayStudents();
}

// Generate unique ID
function generateId(type) {
    if (type === 'student') {
        return `student_${studentIdCounter++}`;
    }
    return `item_${Date.now()}`;
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
    displayStudents();
    
    // Show success feedback
    showSuccessAnimation(studentForm.querySelector('.btn'));
}

// Display all students
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
    return `
        <div class="student-card">
            <div class="student-header">
                <div class="student-info">
                    <h3>👤 ${escapeHtml(student.name)}</h3>
                    <span class="student-grade">${escapeHtml(student.grade)}</span>
                </div>
            </div>
        </div>
    `;
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

