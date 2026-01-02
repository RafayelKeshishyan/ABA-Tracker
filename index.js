// ABA Tracker - Student Behavior Tracking Application

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const studentGradeSelect = document.getElementById('studentGrade');

// Initialize the app
function init() {
    // Add event listeners
    studentForm.addEventListener('submit', handleAddStudent);
}

// Add a new student (placeholder for now)
function handleAddStudent(e) {
    e.preventDefault();
    
    const name = studentNameInput.value.trim();
    const grade = studentGradeSelect.value;
    
    if (!name || !grade) {
        alert('Please fill in all fields!');
        return;
    }
    
    console.log('Student added:', name, grade);
    alert('Student added: ' + name + ' (' + grade + ')');
    
    // Clear form
    studentForm.reset();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

