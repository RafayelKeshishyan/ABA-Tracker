export function IncidentCard({ incident, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="incident-card">
      <div className="incident-header">
        <div className="incident-meta">
          <span>🕐 {formatDate(incident.when)}</span>
          <span>📍 {incident.where}</span>
        </div>
        <div className="student-actions">
          <button className="btn-icon" onClick={onEdit} title="Edit">✏️</button>
          <button className="btn-icon" onClick={onDelete} title="Delete">🗑️</button>
        </div>
      </div>

      <div className="abc-grid">
        <div className="abc-item">
          <span className="abc-label antecedent">Antecedent</span>
          <span className="abc-text">{incident.antecedent}</span>
        </div>
        <div className="abc-item">
          <span className="abc-label behavior">Behavior</span>
          <span className="abc-text">{incident.behavior}</span>
        </div>
        <div className="abc-item">
          <span className="abc-label consequence">Consequence</span>
          <span className="abc-text">{incident.consequence}</span>
        </div>
        {incident.intervention && (
          <div className="abc-item">
            <span className="abc-label intervention">Intervention</span>
            <span className="abc-text">{incident.intervention}</span>
          </div>
        )}
        {incident.notes && (
          <div className="abc-item">
            <span className="abc-label notes">Notes</span>
            <span className="abc-text">{incident.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}
