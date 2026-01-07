// ABA Tracker - Student Behavior Tracking Application

// LocalStorage key
const STORAGE_KEY = 'aba_tracker_data';

// In-memory data storage
let students = [];
let studentIdCounter = 1;
let incidentIdCounter = 1;

// Edit mode state
let editingStudentId = null;
let editingIncidentId = null;

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

// Modal elements
const editModal = document.getElementById('editModal');
const editModalTitle = document.getElementById('editModalTitle');
const editForm = document.getElementById('editForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');

// Edit form fields
const editStudentName = document.getElementById('editStudentName');
const editStudentGrade = document.getElementById('editStudentGrade');
const editStudentFields = document.getElementById('editStudentFields');
const editIncidentFields = document.getElementById('editIncidentFields');
const editIncidentWhen = document.getElementById('editIncidentWhen');
const editIncidentWhere = document.getElementById('editIncidentWhere');
const editAntecedent = document.getElementById('editAntecedent');
const editBehavior = document.getElementById('editBehavior');
const editConsequence = document.getElementById('editConsequence');
const editIntervention = document.getElementById('editIntervention');
const editNotes = document.getElementById('editNotes');

// Initialize the app
function init() {
    // Load data from localStorage
    loadFromStorage();
    
    // Set default datetime to now
    setDefaultDateTime();
    
    // Add event listeners
    studentForm.addEventListener('submit', handleAddStudent);
    incidentForm.addEventListener('submit', handleAddIncident);
    editForm.addEventListener('submit', handleEditSave);
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Update UI
    updateStudentDropdown();
    displayStudents();
}

// ==================== LocalStorage Functions ====================

function saveToStorage() {
    const data = {
        students: students,
        studentIdCounter: studentIdCounter,
        incidentIdCounter: incidentIdCounter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const data = JSON.parse(stored);
            students = data.students || [];
            studentIdCounter = data.studentIdCounter || 1;
            incidentIdCounter = data.incidentIdCounter || 1;
        } catch (e) {
            console.error('Error loading data from storage:', e);
            students = [];
        }
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
        students = [];
        studentIdCounter = 1;
        incidentIdCounter = 1;
        saveToStorage();
        updateStudentDropdown();
        displayStudents();
    }
}

// ==================== Utility Functions ====================

function setDefaultDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localISOTime = new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
    incidentWhen.value = localISOTime;
}

function generateId(type) {
    if (type === 'student') {
        return `student_${studentIdCounter++}`;
    }
    return `incident_${incidentIdCounter++}`;
}

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccessAnimation(button) {
    button.classList.add('success-animation');
    setTimeout(() => {
        button.classList.remove('success-animation');
    }, 300);
}

// ==================== Student Functions ====================

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
    saveToStorage();
    
    // Clear form
    studentForm.reset();
    
    // Update UI
    updateStudentDropdown();
    displayStudents();
    
    // Show success feedback
    showSuccessAnimation(studentForm.querySelector('.btn'));
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    editingStudentId = studentId;
    editingIncidentId = null;
    
    // Set modal for student editing
    editModalTitle.textContent = 'Edit Student';
    editStudentFields.style.display = 'block';
    editIncidentFields.style.display = 'none';
    
    // Populate fields
    editStudentName.value = student.name;
    editStudentGrade.value = student.grade;
    
    // Show modal
    editModal.classList.add('active');
}

function deleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const incidentCount = student.incidents.length;
    const message = incidentCount > 0 
        ? `Delete "${student.name}" and their ${incidentCount} incident(s)? This cannot be undone!`
        : `Delete "${student.name}"? This cannot be undone!`;
    
    if (confirm(message)) {
        students = students.filter(s => s.id !== studentId);
        saveToStorage();
        updateStudentDropdown();
        displayStudents();
    }
}

// ==================== Incident Functions ====================

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
    saveToStorage();
    
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

function editIncident(studentId, incidentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const incident = student.incidents.find(i => i.id === incidentId);
    if (!incident) return;
    
    editingStudentId = studentId;
    editingIncidentId = incidentId;
    
    // Set modal for incident editing
    editModalTitle.textContent = 'Edit Incident';
    editStudentFields.style.display = 'none';
    editIncidentFields.style.display = 'block';
    
    // Populate fields
    editIncidentWhen.value = incident.when;
    editIncidentWhere.value = incident.where;
    editAntecedent.value = incident.antecedent;
    editBehavior.value = incident.behavior;
    editConsequence.value = incident.consequence;
    editIntervention.value = incident.intervention || '';
    editNotes.value = incident.notes || '';
    
    // Show modal
    editModal.classList.add('active');
}

function deleteIncident(studentId, incidentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    if (confirm('Delete this incident? This cannot be undone!')) {
        student.incidents = student.incidents.filter(i => i.id !== incidentId);
        saveToStorage();
        displayStudents();
    }
}

// ==================== Modal Functions ====================

function handleEditSave(e) {
    e.preventDefault();
    
    if (editingIncidentId) {
        // Editing an incident
        const student = students.find(s => s.id === editingStudentId);
        if (!student) return;
        
        const incident = student.incidents.find(i => i.id === editingIncidentId);
        if (!incident) return;
        
        incident.when = editIncidentWhen.value;
        incident.where = editIncidentWhere.value;
        incident.antecedent = editAntecedent.value.trim();
        incident.behavior = editBehavior.value.trim();
        incident.consequence = editConsequence.value.trim();
        incident.intervention = editIntervention.value.trim();
        incident.notes = editNotes.value.trim();
        
    } else if (editingStudentId) {
        // Editing a student
        const student = students.find(s => s.id === editingStudentId);
        if (!student) return;
        
        student.name = editStudentName.value.trim();
        student.grade = editStudentGrade.value;
    }
    
    saveToStorage();
    updateStudentDropdown();
    displayStudents();
    closeModal();
}

function closeModal() {
    editModal.classList.remove('active');
    editingStudentId = null;
    editingIncidentId = null;
    editForm.reset();
}

// ==================== UI Functions ====================

function updateStudentDropdown() {
    selectStudentDropdown.innerHTML = '<option value="">Choose a student...</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.grade})`;
        selectStudentDropdown.appendChild(option);
    });
}

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

function createStudentCard(student) {
    const incidentCount = student.incidents.length;
    const incidentsHTML = student.incidents.length > 0 
        ? student.incidents.map(incident => createIncidentCard(student.id, incident)).join('')
        : '<p class="no-incidents">No incidents recorded yet.</p>';
    
    return `
        <div class="student-card">
            <div class="student-header">
                <div class="student-info">
                    <h3>👤 ${escapeHtml(student.name)}</h3>
                    <span class="student-grade">${escapeHtml(student.grade)}</span>
                </div>
                <div class="student-actions">
                    <span class="incident-count">${incidentCount} incident${incidentCount !== 1 ? 's' : ''}</span>
                    <button class="btn-icon btn-edit" onclick="editStudent('${student.id}')" title="Edit Student">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteStudent('${student.id}')" title="Delete Student">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="incidents-list">
                ${incidentsHTML}
            </div>
        </div>
    `;
}

function createIncidentCard(studentId, incident) {
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
            <div class="incident-header">
                <div class="incident-meta">
                    <span>🕐 ${formattedDate}</span>
                    <span>📍 ${escapeHtml(incident.where)}</span>
                </div>
                <div class="incident-actions">
                    <button class="btn-icon btn-edit-small" onclick="editIncident('${studentId}', '${incident.id}')" title="Edit Incident">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete-small" onclick="deleteIncident('${studentId}', '${incident.id}')" title="Delete Incident">
                        🗑️
                    </button>
                </div>
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
