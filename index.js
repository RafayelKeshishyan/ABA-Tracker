// ABA Tracker - Student Behavior Tracking Application

// LocalStorage key
const STORAGE_KEY = 'aba_tracker_data';

// API Base URL - uses relative path for Vercel deployment
const API_BASE_URL = '/api';

// In-memory data storage
let students = [];
let studentIdCounter = 1;
let incidentIdCounter = 1;

// Edit mode state
let editingStudentId = null;
let editingIncidentId = null;

// Recording state
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingTimerInterval = null;
let currentAudioBlob = null;

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

// Recording elements
const recordBtn = document.getElementById('recordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTimer = document.getElementById('recordingTimer');

// Transcription modal elements
const transcriptionModal = document.getElementById('transcriptionModal');
const closeTranscriptionModal = document.getElementById('closeTranscriptionModal');
const cancelTranscription = document.getElementById('cancelTranscription');
const transcriptionLoading = document.getElementById('transcriptionLoading');
const transcriptionContent = document.getElementById('transcriptionContent');
const transcriptionText = document.getElementById('transcriptionText');
const parseAndFillBtn = document.getElementById('parseAndFillBtn');
const parsingLoading = document.getElementById('parsingLoading');

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
    
    // Recording event listeners
    recordBtn.addEventListener('click', startRecording);
    stopRecordBtn.addEventListener('click', stopRecording);
    
    // Transcription modal event listeners
    closeTranscriptionModal.addEventListener('click', closeTranscriptionModalFn);
    cancelTranscription.addEventListener('click', closeTranscriptionModalFn);
    parseAndFillBtn.addEventListener('click', parseAndFillFields);
    transcriptionText.addEventListener('input', () => {
        parseAndFillBtn.disabled = !transcriptionText.value.trim();
    });
    
    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
    transcriptionModal.addEventListener('click', (e) => {
        if (e.target === transcriptionModal) closeTranscriptionModalFn();
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (editModal.classList.contains('active')) closeModal();
            if (transcriptionModal.classList.contains('active')) closeTranscriptionModalFn();
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

// ==================== Recording Functions ====================

async function startRecording() {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Determine best supported audio format
        const mimeType = getSupportedMimeType();
        const options = mimeType ? { mimeType } : {};
        
        mediaRecorder = new MediaRecorder(stream, options);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            // Create audio blob
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            currentAudioBlob = new Blob(audioChunks, { type: mimeType });
            
            // Open transcription modal and start transcription
            openTranscriptionModal();
            await transcribeAudio(currentAudioBlob);
        };
        
        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event.error);
            alert('Recording error occurred. Please try again.');
            resetRecordingState();
        };
        
        // Start recording
        mediaRecorder.start();
        recordingStartTime = Date.now();
        
        // Update UI
        recordBtn.classList.add('hidden');
        recordingStatus.classList.remove('hidden');
        
        // Start timer
        recordingTimerInterval = setInterval(updateRecordingTimer, 1000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        if (error.name === 'NotAllowedError') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice recording.');
        } else if (error.name === 'NotFoundError') {
            alert('No microphone found. Please connect a microphone and try again.');
        } else {
            alert('Error accessing microphone: ' + error.message);
        }
    }
}

function getSupportedMimeType() {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg'
    ];
    
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return null;
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    // Clear timer
    if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
    }
    
    // Reset UI
    recordBtn.classList.remove('hidden');
    recordingStatus.classList.add('hidden');
    recordingTimer.textContent = '00:00';
}

function resetRecordingState() {
    if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
    }
    recordBtn.classList.remove('hidden');
    recordingStatus.classList.add('hidden');
    recordingTimer.textContent = '00:00';
    audioChunks = [];
    currentAudioBlob = null;
}

function updateRecordingTimer() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    recordingTimer.textContent = `${minutes}:${seconds}`;
}

// ==================== Transcription Modal Functions ====================

function openTranscriptionModal() {
    transcriptionModal.classList.add('active');
    transcriptionLoading.classList.remove('hidden');
    transcriptionContent.classList.add('hidden');
    parsingLoading.classList.add('hidden');
    transcriptionText.value = '';
    parseAndFillBtn.disabled = true;
}

function closeTranscriptionModalFn() {
    transcriptionModal.classList.remove('active');
    transcriptionLoading.classList.add('hidden');
    transcriptionContent.classList.add('hidden');
    parsingLoading.classList.add('hidden');
    transcriptionText.value = '';
    currentAudioBlob = null;
}

async function transcribeAudio(audioBlob) {
    try {
        // Determine file extension based on MIME type
        const mimeType = audioBlob.type;
        let extension = 'webm';
        if (mimeType.includes('mp4')) extension = 'mp4';
        else if (mimeType.includes('ogg')) extension = 'ogg';
        else if (mimeType.includes('wav')) extension = 'wav';
        
        // Convert blob to base64 to avoid multipart form parsing issues
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const response = await fetch(`${API_BASE_URL}/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio: base64Audio,
                filename: `recording.${extension}`,
                mimeType: mimeType || 'audio/webm',
                model: 'whisper-1',
                language: 'en'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again tomorrow.');
            } else {
                throw new Error(errorData.error || `Transcription failed (${response.status})`);
            }
        }
        
        const data = await response.json();
        const transcription = data.text;
        
        // Show transcription content
        transcriptionLoading.classList.add('hidden');
        transcriptionContent.classList.remove('hidden');
        transcriptionText.value = transcription;
        parseAndFillBtn.disabled = !transcription.trim();
        
    } catch (error) {
        console.error('Transcription error:', error);
        alert('Transcription failed: ' + error.message);
        closeTranscriptionModalFn();
    }
}

// ==================== AI Parsing Functions ====================

async function parseAndFillFields() {
    const transcription = transcriptionText.value.trim();
    if (!transcription) {
        alert('No transcription to parse.');
        return;
    }
    
    // Show parsing loading state.
    transcriptionContent.classList.add('hidden');
    parsingLoading.classList.remove('hidden');
    parseAndFillBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transcription })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again tomorrow.');
            } else {
                throw new Error(errorData.error || `Parsing failed (${response.status})`);
            }
        }
        
        const data = await response.json();
        const parsed = data.parsed;
        
        if (!parsed) {
            throw new Error('No response from AI parser.');
        }
        
        // Fill the form fields
        if (parsed.antecedent) antecedentInput.value = parsed.antecedent;
        if (parsed.behavior) behaviorInput.value = parsed.behavior;
        if (parsed.consequence) consequenceInput.value = parsed.consequence;
        if (parsed.intervention) interventionInput.value = parsed.intervention;
        if (parsed.notes) notesInput.value = parsed.notes;
        
        // Close modal
        closeTranscriptionModalFn();
        
        // Show success feedback
        showSuccessAnimation(recordBtn);
        
    } catch (error) {
        console.error('Parsing error:', error);
        alert('Parsing failed: ' + error.message);
        
        // Return to transcription view so user can try again
        parsingLoading.classList.add('hidden');
        transcriptionContent.classList.remove('hidden');
        parseAndFillBtn.disabled = false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);



