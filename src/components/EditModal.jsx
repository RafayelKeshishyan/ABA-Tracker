import { useState, useEffect } from 'react'

export function EditModal({ type, data, onSave, onClose }) {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (data) {
      setFormData({ ...data })
    }
  }, [data])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit {type === 'student' ? 'Student' : 'Incident'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'student' ? (
            <>
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Grade Level</label>
                <select
                  value={formData.grade || ''}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  required
                >
                  <option value="">Select grade...</option>
                  <option value="Pre-K">Pre-K</option>
                  <option value="Kindergarten">Kindergarten</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>When</label>
                  <input
                    type="datetime-local"
                    value={formData.when || ''}
                    onChange={(e) => handleChange('when', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Where</label>
                  <input
                    type="text"
                    value={formData.where || ''}
                    onChange={(e) => handleChange('where', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Antecedent</label>
                <textarea
                  value={formData.antecedent || ''}
                  onChange={(e) => handleChange('antecedent', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Behavior</label>
                <textarea
                  value={formData.behavior || ''}
                  onChange={(e) => handleChange('behavior', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Consequence</label>
                <textarea
                  value={formData.consequence || ''}
                  onChange={(e) => handleChange('consequence', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Intervention</label>
                <textarea
                  value={formData.intervention || ''}
                  onChange={(e) => handleChange('intervention', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
