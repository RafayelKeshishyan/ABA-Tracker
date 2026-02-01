import { useState, useEffect } from 'react'

export function TranscriptionModal({ audioBlob, onClose, onParsedData }) {
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(true)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (audioBlob) {
      transcribeAudio(audioBlob)
    }
  }, [audioBlob])

  const transcribeAudio = async (blob) => {
    try {
      setIsTranscribing(true)
      setError(null)

      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      // Determine extension
      let extension = 'webm'
      if (blob.type.includes('mp4')) extension = 'mp4'
      else if (blob.type.includes('ogg')) extension = 'ogg'

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64,
          filename: `recording.${extension}`,
          mimeType: blob.type || 'audio/webm',
          model: 'whisper-1',
          language: 'en'
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Transcription failed')
      }

      const data = await response.json()
      setTranscription(data.text || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleParse = async () => {
    if (!transcription.trim()) return

    try {
      setIsParsing(true)
      setError(null)

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Parsing failed')
      }

      const data = await response.json()
      if (data.parsed) {
        onParsedData(data.parsed)
      }
    } catch (err) {
      setError(err.message)
      setIsParsing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Voice Transcription</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {isTranscribing && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Transcribing audio...</p>
          </div>
        )}

        {isParsing && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing with AI...</p>
          </div>
        )}

        {error && (
          <div style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Error: {error}
          </div>
        )}

        {!isTranscribing && !isParsing && (
          <>
            <div className="form-group">
              <label>Transcription (edit if needed)</label>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                rows={6}
                placeholder="Transcription will appear here..."
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleParse}
                disabled={!transcription.trim()}
              >
                Parse & Fill Form
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
