import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { StudentForm } from './components/StudentForm'
import { IncidentForm } from './components/IncidentForm'
import { StudentCard } from './components/StudentCard'
import { EditModal } from './components/EditModal'

function App() {
  const [data, setData] = useLocalStorage('aba_tracker_data', {
    students: [],
    studentIdCounter: 1,
    incidentIdCounter: 1
  })

  const [editModal, setEditModal] = useState({ open: false, type: null, data: null, studentId: null })

  // Generate unique IDs
  const generateStudentId = () => {
    const id = `student_${data.studentIdCounter}`
    setData(prev => ({ ...prev, studentIdCounter: prev.studentIdCounter + 1 }))
    return id
  }

  const generateIncidentId = () => {
    const id = `incident_${data.incidentIdCounter}`
    setData(prev => ({ ...prev, incidentIdCounter: prev.incidentIdCounter + 1 }))
    return id
  }

  // Student operations
  const addStudent = ({ name, grade }) => {
    const newStudent = {
      id: generateStudentId(),
      name,
      grade,
      incidents: []
    }
    setData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }))
  }

  const deleteStudent = (studentId) => {
    if (confirm('Delete this student and all their incidents?')) {
      setData(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId)
      }))
    }
  }

  const updateStudent = (updatedData) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.id === updatedData.id ? { ...s, ...updatedData } : s
      )
    }))
    setEditModal({ open: false, type: null, data: null, studentId: null })
  }

  // Incident operations
  const addIncident = (studentId, incident) => {
    const newIncident = {
      id: generateIncidentId(),
      ...incident
    }
    setData(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.id === studentId
          ? { ...s, incidents: [...s.incidents, newIncident] }
          : s
      )
    }))
  }

  const deleteIncident = (studentId, incidentId) => {
    if (confirm('Delete this incident?')) {
      setData(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s.id === studentId
            ? { ...s, incidents: s.incidents.filter(i => i.id !== incidentId) }
            : s
        )
      }))
    }
  }

  const updateIncident = (updatedData) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.id === editModal.studentId
          ? {
              ...s,
              incidents: s.incidents.map(i =>
                i.id === updatedData.id ? { ...i, ...updatedData } : i
              )
            }
          : s
      )
    }))
    setEditModal({ open: false, type: null, data: null, studentId: null })
  }

  // Modal handlers
  const openEditStudent = (student) => {
    setEditModal({ open: true, type: 'student', data: student, studentId: null })
  }

  const openEditIncident = (studentId, incident) => {
    setEditModal({ open: true, type: 'incident', data: incident, studentId })
  }

  const handleEditSave = (formData) => {
    if (editModal.type === 'student') {
      updateStudent(formData)
    } else {
      updateIncident(formData)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>✍️ ABCScribe</h1>
        <p>AI-Powered Voice Logger for Behavior Documentation</p>
      </header>

      <StudentForm onAddStudent={addStudent} />

      <IncidentForm
        students={data.students}
        onAddIncident={addIncident}
      />

      <div className="card">
        <h2>Students & Incidents</h2>
        {data.students.length === 0 ? (
          <div className="empty-state">
            <p>No students added yet.</p>
            <p>Add a student above to get started!</p>
          </div>
        ) : (
          data.students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={openEditStudent}
              onDelete={deleteStudent}
              onEditIncident={openEditIncident}
              onDeleteIncident={deleteIncident}
            />
          ))
        )}
      </div>

      {editModal.open && (
        <EditModal
          type={editModal.type}
          data={editModal.data}
          onSave={handleEditSave}
          onClose={() => setEditModal({ open: false, type: null, data: null, studentId: null })}
        />
      )}
    </div>
  )
}

export default App
