import { IncidentCard } from './IncidentCard'

export function StudentCard({ student, onEdit, onDelete, onEditIncident, onDeleteIncident }) {
  const incidentCount = student.incidents.length

  return (
    <div className="student-card">
      <div className="student-header">
        <div>
          <span className="student-name">👤 {student.name}</span>
          <span className="student-grade">{student.grade}</span>
        </div>
        <div className="student-actions">
          <span className="incident-count">
            {incidentCount} incident{incidentCount !== 1 ? 's' : ''}
          </span>
          <button className="btn-icon" onClick={() => onEdit(student)} title="Edit">✏️</button>
          <button className="btn-icon" onClick={() => onDelete(student.id)} title="Delete">🗑️</button>
        </div>
      </div>

      <div className="incidents-list">
        {student.incidents.length === 0 ? (
          <p className="no-incidents">No incidents recorded yet.</p>
        ) : (
          student.incidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onEdit={() => onEditIncident(student.id, incident)}
              onDelete={() => onDeleteIncident(student.id, incident.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
