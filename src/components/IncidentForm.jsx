import { useState, useEffect } from 'react'
import { RecordingButton } from './RecordingButton'

export function IncidentForm({ students, onAddIncident }) {
  const [studentId, setStudentId] = useState('')
  const [when, setWhen] = useState('')
  const [where, setWhere] = useState('')
  const [antecedent, setAntecedent] = useState('')
  const [behavior, setBehavior] = useState('')
  const [consequence, setConsequence] = useState('')
  const [intervention, setIntervention] = useState('')
  const [notes, setNotes] = useState('')

  // Set default datetime to now
  useEffect(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60 * 1000)
    setWhen(local.toISOString().slice(0, 16))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!studentId || !when || !where || !antecedent || !behavior || !consequence) {
      alert('Please fill in all required fields')
      return
    }

    onAddIncident(studentId, {
      when,
      where,
      antecedent,
      behavior,
      consequence,
      intervention,
      notes
    })

    // Reset form (keep student selected)
    setWhere('')
    setAntecedent('')
    setBehavior('')
    setConsequence('')
    setIntervention('')
    setNotes('')
    
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60 * 1000)
    setWhen(local.toISOString().slice(0, 16))
  }

  const handleParsedData = (parsed) => {
    if (parsed.antecedent) setAntecedent(parsed.antecedent)
    if (parsed.behavior) setBehavior(parsed.behavior)
    if (parsed.consequence) setConsequence(parsed.consequence)
    if (parsed.intervention) setIntervention(parsed.intervention)
    if (parsed.notes) setNotes(parsed.notes)
  }

  return (
    <div className="card">
      <h2>Log Incident</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Select Student *</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>When *</label>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Where / Location *</label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g., Classroom, Cafeteria, Playground"
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Voice Recording</label>
          <RecordingButton onParsedData={handleParsedData} />
        </div>

        <div className="form-group">
          <label>Antecedent (What happened before?) *</label>
          <textarea
            value={antecedent}
            onChange={(e) => setAntecedent(e.target.value)}
            placeholder="What triggered the behavior?"
            required
          />
        </div>

        <div className="form-group">
          <label>Behavior (What did the student do?) *</label>
          <textarea
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="Describe the observable behavior"
            required
          />
        </div>

        <div className="form-group">
          <label>Consequence (What happened after?) *</label>
          <textarea
            value={consequence}
            onChange={(e) => setConsequence(e.target.value)}
            placeholder="How did others respond?"
            required
          />
        </div>

        <div className="form-group">
          <label>Intervention (Optional)</label>
          <textarea
            value={intervention}
            onChange={(e) => setIntervention(e.target.value)}
            placeholder="What strategy was used?"
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations"
          />
        </div>

        <button type="submit" className="btn btn-primary">Log Incident</button>
      </form>
    </div>
  )
}
