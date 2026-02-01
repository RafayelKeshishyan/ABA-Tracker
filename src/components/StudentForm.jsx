import { useState } from 'react'

export function StudentForm({ onAddStudent }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !grade) return

    onAddStudent({ name: name.trim(), grade })
    setName('')
    setGrade('')
  }

  return (
    <div className="card">
      <h2>Add Student</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              required
            />
          </div>
          <div className="form-group">
            <label>Grade Level</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} required>
              <option value="">Select grade...</option>
              <option value="Pre-K">Pre-K</option>
              <option value="Kindergarten">Kindergarten</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Add Student</button>
      </form>
    </div>
  )
}
